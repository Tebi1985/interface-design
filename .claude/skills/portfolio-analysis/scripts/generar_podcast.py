#!/usr/bin/env python3
"""Genera el audio tipo podcast del análisis de portfolio.

Uso:
    python3 generar_podcast.py guion.txt salida.mp3 [--voz es-AR-TomasNeural] [--rate +0%]

Entrada: un .txt con el guión en texto plano (sin markdown, sin tablas, sin URLs).
Salida: un MP3 con voz neural.

Motores, en orden de preferencia:
1. edge-tts (Microsoft, voces neurales de calidad; requiere red).
   Voces recomendadas en español: es-AR-TomasNeural, es-AR-ElenaNeural,
   es-ES-AlvaroNeural, es-MX-JorgeNeural.
2. gTTS (Google Translate TTS) como fallback si edge-tts falla.

Dependencias: pip install edge-tts gTTS --break-system-packages

Nota para entornos con proxy TLS (sandbox cloud): si edge-tts falla con
CERTIFICATE_VERIFY_FAILED, el script agrega automáticamente la CA del proxy
(SSL_CERT_FILE) al bundle de certifi y reintenta — edge-tts usa certifi y
no honra SSL_CERT_FILE por sí solo.
"""
import argparse
import os
import sys


def _fix_certifi():
    """Agrega la CA del proxy al bundle de certifi (idempotente)."""
    ca = os.environ.get("SSL_CERT_FILE") or os.environ.get("REQUESTS_CA_BUNDLE")
    if not ca or not os.path.exists(ca):
        return False
    try:
        import certifi
        bundle = certifi.where()
        ca_content = open(ca).read()
        if ca_content not in open(bundle).read():
            with open(bundle, "a") as f:
                f.write("\n" + ca_content)
        return True
    except Exception:
        return False


def tts_edge(text, out, voice, rate):
    import asyncio
    import edge_tts

    async def run():
        await edge_tts.Communicate(text, voice, rate=rate).save(out)

    try:
        asyncio.run(run())
    except Exception as e:
        if "CERTIFICATE_VERIFY_FAILED" in repr(e) and _fix_certifi():
            asyncio.run(run())
        else:
            raise


def tts_gtts(text, out):
    from gtts import gTTS
    gTTS(text, lang="es", tld="com").save(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("guion", help="Archivo .txt con el guión")
    ap.add_argument("salida", help="Archivo .mp3 de salida")
    ap.add_argument("--voz", default="es-AR-TomasNeural")
    ap.add_argument("--rate", default="+0%", help="Velocidad edge-tts, p.ej. +5%% o -10%%")
    args = ap.parse_args()

    text = open(args.guion, encoding="utf-8").read().strip()
    if not text:
        sys.exit("El guión está vacío.")
    for marker in ("|", "http", "##", "**"):
        if marker in text:
            print(f"AVISO: el guión contiene '{marker}' — ¿quedó markdown/tablas/URLs sin limpiar?", file=sys.stderr)

    try:
        tts_edge(text, args.salida, args.voz, args.rate)
        print(f"OK (edge-tts, voz {args.voz}): {args.salida}")
    except Exception as e:
        print(f"edge-tts falló ({type(e).__name__}); usando gTTS…", file=sys.stderr)
        tts_gtts(text, args.salida)
        print(f"OK (gTTS): {args.salida}")

    size = os.path.getsize(args.salida)
    if size < 10_000:
        sys.exit(f"El MP3 quedó sospechosamente chico ({size} bytes) — revisar.")
    print(f"{size/1024:.0f} KB")


if __name__ == "__main__":
    main()
