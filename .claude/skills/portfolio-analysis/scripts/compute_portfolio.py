#!/usr/bin/env python3
"""Cálculos de portfolio para el skill portfolio-advisor.

Uso:
    python3 compute_portfolio.py positions.json [-o resultado.json]

Formato de entrada (positions.json) — sólo `ticker`, `shares` y `price` son
obligatorios; el resto enriquece el resultado si está disponible:

{
  "as_of": "2026-07-11T15:30:00-03:00",        # opcional pero recomendado
  "benchmark": {"name": "S&P 500", "ytd_pct": 8.2},   # opcional
  "positions": [
    {
      "ticker": "GOOGL",
      "name": "Alphabet Inc.",
      "shares": 10,
      "price": 195.32,
      "sector": "Communication Services",
      "day_pct": -0.4,
      "ytd_pct": 3.1,
      "yr1_pct": 12.5
    }
  ]
}

Salida: JSON por stdout (o a archivo con -o) con valor y peso por posición,
totales, HHI, N efectivo, pesos por sector y retorno YTD ponderado.
Sin dependencias externas (stdlib puro).
"""
import argparse
import json
import sys


def compute(data):
    positions = data.get("positions", [])
    if not positions:
        raise ValueError("El JSON no contiene posiciones en 'positions'.")

    for p in positions:
        for field in ("ticker", "shares", "price"):
            if p.get(field) in (None, ""):
                raise ValueError(f"Posición sin campo obligatorio '{field}': {p}")
        if p["shares"] < 0 or p["price"] <= 0:
            raise ValueError(f"Valores inválidos en {p['ticker']}: shares={p['shares']}, price={p['price']}")
        p["value"] = round(float(p["shares"]) * float(p["price"]), 2)

    total = sum(p["value"] for p in positions)
    if total <= 0:
        raise ValueError("Valor total del portfolio <= 0.")

    for p in positions:
        p["weight_pct"] = round(100.0 * p["value"] / total, 2)

    # Concentración
    hhi = sum((p["value"] / total) ** 2 for p in positions)
    n_eff = 1.0 / hhi
    if hhi < 0.15:
        hhi_label = "diversificado"
    elif hhi <= 0.25:
        hhi_label = "concentración moderada"
    else:
        hhi_label = "concentrado"

    # Sectores
    sectors = {}
    for p in positions:
        sec = p.get("sector") or "Sin clasificar"
        sectors[sec] = sectors.get(sec, 0.0) + p["value"]
    sector_weights = [
        {"sector": s, "value": round(v, 2), "weight_pct": round(100.0 * v / total, 2)}
        for s, v in sorted(sectors.items(), key=lambda kv: -kv[1])
    ]

    # Retorno YTD ponderado y contribución por posición (si hay datos)
    ytd_known = [p for p in positions if isinstance(p.get("ytd_pct"), (int, float))]
    weighted_ytd = None
    contributions = []
    if ytd_known:
        weighted_ytd = round(
            sum(p["ytd_pct"] * p["value"] for p in ytd_known) / sum(p["value"] for p in ytd_known), 2
        )
        for p in ytd_known:
            contributions.append({
                "ticker": p["ticker"],
                "ytd_contribution_pp": round(p["ytd_pct"] * p["value"] / total, 2),
            })
        contributions.sort(key=lambda c: -abs(c["ytd_contribution_pp"]))
        if len(ytd_known) < len(positions):
            missing = [p["ticker"] for p in positions if p not in ytd_known]
            print(f"AVISO: sin ytd_pct para {', '.join(missing)}; "
                  "el YTD ponderado excluye esas posiciones.", file=sys.stderr)

    positions_sorted = sorted(positions, key=lambda p: -p["value"])
    largest = positions_sorted[0]

    return {
        "as_of": data.get("as_of"),
        "benchmark": data.get("benchmark"),
        "total_value": round(total, 2),
        "n_positions": len(positions),
        "hhi": round(hhi, 4),
        "hhi_label": hhi_label,
        "effective_n": round(n_eff, 2),
        "largest_position": {"ticker": largest["ticker"], "weight_pct": largest["weight_pct"]},
        "weighted_ytd_pct": weighted_ytd,
        "ytd_contributions_pp": contributions,
        "sector_weights": sector_weights,
        "positions": positions_sorted,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", help="Ruta al JSON de posiciones")
    ap.add_argument("-o", "--output", help="Archivo de salida (default: stdout)")
    args = ap.parse_args()

    with open(args.input, encoding="utf-8") as f:
        data = json.load(f)

    result = compute(data)
    out = json.dumps(result, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(out + "\n")
        print(f"Resultado escrito en {args.output}")
    else:
        print(out)


if __name__ == "__main__":
    main()
