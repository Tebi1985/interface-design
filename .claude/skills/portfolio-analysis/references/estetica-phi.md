# Sistema de diseño φ — estética del reporte

El reporte de portfolio comparte lenguaje visual con la app de análisis Fibonacci
del usuario ("φ terminal"): grafito cálido oscuro, **un solo acento dorado**,
verde/rojo únicamente semánticos, números en monospace tabular, jerarquía por
peso y color (no por tamaño solamente), profundidad solo con bordes (sin
sombras). Este archivo es la fuente de verdad del estilo; reemplaza cualquier
paleta azul/genérica anterior.

## Tokens (copiar tal cual al `:root` del reporte)

```css
:root{
  --bg:#0c0c0a;            /* plano de página */
  --panel:#121210;         /* tarjetas */
  --panel-2:#181814;       /* superficies elevadas (tooltip, popover) */
  --inset:#090907;         /* campos de entrada / controles */
  --line:rgba(236,222,180,.075);        /* borde estándar */
  --line-soft:rgba(236,222,180,.045);   /* separadores suaves */
  --line-strong:rgba(236,222,180,.16);  /* énfasis */
  --ink:#ecead9;           /* texto primario (cálido) */
  --ink-2:#a8a595;         /* secundario */
  --ink-3:#71705f;         /* metadatos / captions */
  --ink-4:#4c4b40;         /* deshabilitado */
  --gold:#d9a84e;          /* ACENTO ÚNICO (φ) */
  --gold-ink:#e8c47c;
  --gold-soft:rgba(217,168,78,.13);
  --gold-line:rgba(217,168,78,.38);
  --up:#3fb374;  --up-ink:#84d6ab;  --up-soft:rgba(63,179,116,.12);   /* solo semántico */
  --down:#d95c5c;--down-ink:#eb9a9a;--down-soft:rgba(217,92,92,.12); /* solo semántico */
  --warn:#c98500;          /* semáforo intermedio */
  --mono:ui-monospace,"SF Mono","Cascadia Code","JetBrains Mono",Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  --r-lg:10px; --r-md:8px; --r-sm:5px;   /* radios: tarjeta / interno / chip-input */
}
```

## Reglas duras

1. **Un solo acento.** El dorado marca lo importante (KPI destacado, badge,
   selección, resaltado del mejor valor). Verde/rojo SOLO para variaciones,
   semáforos y veredictos — nunca decorativos. Nada de azules/teales de marca.
2. **Profundidad = bordes.** `border:1px solid var(--line)` en tarjetas; sin
   `box-shadow`. Superficies: bg → panel → panel-2 (saltos susurrados).
3. **Números siempre en `var(--mono)`** con `font-variant-numeric:tabular-nums`
   (tablas, KPI, precios, pesos, deltas). El texto corrido va en `var(--sans)`.
4. **Jerarquía por peso y color**: caption 11px/600 mayúsculas `letter-spacing:.09em`
   color `--ink-3`; valor 24–26px/600 mono `--ink`; cuerpo 13px/400 `--ink-2`.
   Base de página 13px. No usar tamaño como única palanca.
5. **Densidad**: base 4px; padding de tarjeta 16px; gap de grilla 12px;
   `max-width` del reporte 1180px centrado.
6. **Encabezado de tarjeta** (patrón único):
   `h(x) { font-size:11px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-3) }`
   con anotación opcional al lado en mono `--ink-4` (fechas, n=, fuente).
7. **Deltas/semáforos**: pastilla `padding:3px 8px; border-radius:5px` con
   `--up-ink` sobre `--up-soft` (positivo) o `--down-ink` sobre `--down-soft`
   (negativo), siempre con signo +/− (el color nunca es el único canal).
   Semáforo fundamental: ● verde `--up` / ámbar `--warn` / rojo `--down` + texto.
8. **Tablas**: números alineados a la derecha en mono; filas separadas por
   `border-top:1px solid var(--line-soft)`; hover `rgba(255,255,255,.03)`;
   mejor/peor valor de una columna resaltado con `--gold-soft` / subrayado
   punteado, no con colores nuevos.
9. **Badges**: `font-size:9.5px` mayúsculas, borde `--gold-line`, fondo
   `--gold-soft`, texto `--gold-ink` (p. ej. "cíclica en pico ⚠", "hedge fund hotel").
10. **Selección/estado activo** (tabs, filtros): fondo `--gold-soft`, texto
    `--gold-ink`, sin cambiar tamaño.
11. **Disclaimer y notas**: 11px `--ink-3`.
12. **Motion**: transiciones ≤300ms `cubic-bezier(.23,1,.32,1)`, solo
    opacity/transform; respetar `prefers-reduced-motion`.

## Gráficos (Chart.js) — tema φ

- Fondo del canvas: transparente (hereda `--panel`). Grilla `rgba(236,222,180,.07)`,
  ticks y leyendas en `#a8a595`, fuente de ticks: la pila mono, 11px.
- **Paleta categórica** (donut de posiciones, barras por sector). Orden FIJO por
  ranking de peso — validada para daltonismo y contraste sobre `#121210`
  (validador del skill dataviz, todos los checks PASS):

  | slot | hex | | slot | hex |
  |---|---|---|---|---|
  | 1 | `#3987e5` | | 5 | `#199e70` |
  | 2 | `#008300` | | 6 | `#d95926` |
  | 3 | `#d55181` | | 7 | `#9085e9` |
  | 4 | `#c98500` | | 8 | `#e66767` |

  Más de 8 posiciones → agrupar el resto en "Otras" (`#71705f`). No reciclar
  tonos ni usar el dorado como color de serie (es el acento de UI). Toda
  identidad de serie lleva además etiqueta directa o leyenda (nunca color solo).
- **Comparaciones vs benchmark** (YTD posición vs sector vs S&P 500): la
  posición en su color de slot, benchmarks en grises `#71705f`/`#4c4b40`.
- Donut: `cutout:'65%'`, `borderColor:'#121210'`, `borderWidth:2` (gap de 2px
  entre segmentos), valor total en el centro en mono.
- Barras: `borderRadius:3`, `maxBarThickness:18`; horizontales si las etiquetas
  son largas; `animation.duration:400`.
- Un solo eje por gráfico. Nada de gráficos decorativos.

## Firma φ

- El header del reporte lleva la marca φ: un cuadrado redondeado con borde
  `--gold-line`, fondo `--gold-soft` y la letra `φ` en `--gold` (mono 600), junto
  al título. El módulo Fibonacci embebido (ver `reporte-html.md`) usa el mismo
  sistema automáticamente — el reporte y el análisis técnico deben sentirse una
  sola aplicación.
