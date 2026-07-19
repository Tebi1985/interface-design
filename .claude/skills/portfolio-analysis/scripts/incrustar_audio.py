#!/usr/bin/env python3
"""Incrusta el podcast MP3 dentro del reporte HTML (reproductor + botón de descarga).

Uso:
    python3 incrustar_audio.py reporte.html podcast.mp3 [--nombre podcast-portfolio.mp3] [--duracion "4 min"]

El MP3 se embebe en base64 como data URL, así el HTML sigue siendo un único
archivo autónomo: se puede escuchar inline y descargar con un clic, sin red.

Punto de inserción: si el HTML contiene el marcador <!-- PODCAST -->, lo
reemplaza; si no, inserta el bloque inmediatamente antes de </header>.
Es idempotente: si ya hay un bloque id="podcast-box", lo reemplaza en lugar
de duplicarlo.
"""
import argparse
import base64
import os
import re
import sys

BLOCK = '''<div id="podcast-box" style="margin-top:14px;background:#1a2130;border:1px solid #2a3244;border-radius:12px;padding:14px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
  <span style="font-size:1.4rem">🎧</span>
  <div style="flex:1;min-width:220px">
    <div style="font-weight:650;font-size:.95rem">Escuchá el análisis{DUR}</div>
    <div style="color:#94a3b8;font-size:.78rem">Recuento tipo podcast de todo el reporte — también podés descargarlo.</div>
  </div>
  <audio controls preload="metadata" style="height:38px;max-width:100%" src="{SRC}"></audio>
  <a href="{SRC}" download="{NAME}" style="background:#4fa3e3;color:#0f1420;font-weight:650;font-size:.85rem;padding:9px 16px;border-radius:8px;text-decoration:none;white-space:nowrap">⬇ Descargar MP3</a>
</div>'''


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("html")
    ap.add_argument("mp3")
    ap.add_argument("--nombre", default=None, help="Nombre de archivo para la descarga")
    ap.add_argument("--duracion", default=None, help='Texto de duración, p.ej. "4 min"')
    args = ap.parse_args()

    html = open(args.html, encoding="utf-8").read()
    raw = open(args.mp3, "rb").read()
    if len(raw) < 10_000:
        sys.exit(f"MP3 sospechosamente chico ({len(raw)} bytes) — revisar antes de incrustar.")
    src = "data:audio/mpeg;base64," + base64.b64encode(raw).decode()
    name = args.nombre or os.path.basename(args.mp3)
    dur = f" ({args.duracion})" if args.duracion else ""
    block = BLOCK.replace("{SRC}", src).replace("{NAME}", name).replace("{DUR}", dur)

    if 'id="podcast-box"' in html:
        html = re.sub(r'<div id="podcast-box".*?</div>\s*</div>', block, html, count=1, flags=re.S)
    elif "<!-- PODCAST -->" in html:
        html = html.replace("<!-- PODCAST -->", block, 1)
    elif "</header>" in html:
        html = html.replace("</header>", block + "\n</header>", 1)
    else:
        sys.exit("No encontré dónde insertar el bloque (ni <!-- PODCAST --> ni </header>).")

    open(args.html, "w", encoding="utf-8").write(html)
    print(f"OK: audio incrustado en {args.html} ({len(html)//1024} KB totales)")


if __name__ == "__main__":
    main()
