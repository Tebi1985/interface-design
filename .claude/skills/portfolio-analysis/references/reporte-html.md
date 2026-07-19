# Especificación del reporte HTML

Un único archivo `.html` 100% autónomo: CSS y JS inline, y **la librería de gráficos incrustada** — copiar el contenido de `assets/chart.umd.js` (Chart.js v4 UMD) dentro de un `<script>` inline. NO usar `<script src>` a CDNs: las vistas previas suelen bloquearlos por CSP y el resultado es "Chart is not defined" con todos los gráficos vacíos. Español. Sin localStorage/sessionStorage — todo en variables JS. Debe verse bien en desktop y aceptablemente en mobile (grid que colapsa a una columna).

Antes de entregar, verificar: (a) `grep 'script src='` devuelve cero resultados; (b) si hay Chromium/Playwright disponible, abrir el archivo headless y confirmar cero errores de consola y canvas con dimensiones > 0.

## Estilo

**Leer `references/estetica-phi.md` y aplicarlo tal cual** — es la fuente de
verdad del estilo (sistema de diseño φ: grafito cálido oscuro, acento dorado
único, verde/rojo solo semánticos, números en monospace tabular, profundidad
solo con bordes). Copiar su bloque de tokens al `:root` del reporte y usar su
tema de Chart.js (grilla, paleta categórica validada, donut con gap). El
reporte debe sentirse la misma aplicación que el módulo Fibonacci embebido.

## Estructura (en este orden)

1. **Header**: título ("Análisis de Portfolio"), fecha y hora de generación con zona horaria, valor total del portfolio y la referencia de mercado (S&P 500 YTD). **NO mostrar performance agregada del portfolio** (ni YTD ponderado ni similar): sin fechas/precios de compra ese número invita a leerse como retorno propio y no lo es — la performance vive solo a nivel de cada acción en la tabla de posiciones. Nota al pie ofreciendo calcular el retorno personal real si el usuario comparte su cost basis. Badge visible: "Datos de mercado del [fecha] — no constituye asesoramiento financiero". Al final del header, el marcador `<!-- PODCAST -->` donde `scripts/incrustar_audio.py` inserta el reproductor del podcast con su botón de descarga del MP3 (audio en base64 — el archivo sigue siendo autónomo).

2. **Resumen ejecutivo**: 3-5 bullets con los hallazgos que importan. Escribirlos al final, cuando todo el análisis está hecho — es la sección que más se lee.

3. **Composición** (fila de dos tarjetas):
   - Donut de pesos por posición (centro: valor total).
   - Tarjetas KPI: N posiciones, N efectivo, HHI con etiqueta interpretada ("concentrado"), peso de la posición mayor.

4. **Tabla de posiciones**: ticker, empresa, acciones, precio, valor, peso %, var. día, YTD, 12m, semáforo fundamental. Ordenada por peso descendente. Variaciones coloreadas (verde/rojo). El semáforo con tooltip o nota al pie que explique el porqué.

5. **Fundamentales y expectativas comparados**: tabla con dos grupos de columnas claramente separados — *lo actual* (P/E fwd, EV/EBITDA, crec. ingresos últ. Q, margen op., FCF) y *lo proyectado* (crecimiento estimado de ingresos y EPS del próximo año, PEG, dirección de revisiones 60-90d con flecha ↑/→/↓, consenso + precio objetivo y % vs precio actual). Cierra con una columna de **veredicto por ticker** (Sólida/Razonable/Cuestionable/Frágil, con tooltip del porqué). Resaltar suavemente el mejor y peor valor de cada columna. Celdas sin dato: "n/d" — nunca un número inventado.

5b. **Comparación intra-sector**: una tarjeta por cada sector/factor con 2+ posiciones, con mini-tabla del duelo (crecimiento proyectado, PEG, upside consenso, revisiones, riesgo idiosincrático) y el veredicto destacado: mantener ambas / consolidar en la mejor / reponderar — con el racional en 2-3 líneas (ver metodologia.md sección 2b).

5c. **Inversores relevantes (13F)**: tabla por ticker con los tenedores institucionales principales y superinversores reconocidos con posición declarada, el cambio del último trimestre (nueva ↑ recortó ↓ salió ✕), y en el encabezado de la sección las DOS fechas: trimestre de las posiciones y fecha de presentación ante la SEC ("posiciones al 31-mar-2026, presentadas el 15-may-2026"), más la fecha límite del próximo 13F. Encabezado con la advertencia: es una foto vieja — contexto, no señal de compra (ver metodologia.md sección 2e). Mencionar crowding si varias posiciones del portfolio son "hedge fund hotels".

5d. **Portfolios de los inversores más influyentes**: una tarjeta por gestor (4-6, estilos distintos) con valor total declarado, número de posiciones, estilo en una línea, top holdings con % del portfolio, y movimientos del trimestre (nuevas, aumentos, salidas). Cierra con una síntesis del trimestre entre hedge funds (lo más comprado / lo más vendido / las divergencias). Mismo banner de fechas que 5c.

5e. **Radar de candidatas**: tabla con las 6-10 acciones destacadas de esos portfolios que el usuario NO tiene: precio, YTD, P/E fwd, crecimiento proyectado (ingresos y EPS), PEG, revisiones, consenso + upside, disponibilidad CEDEAR/local, quién la tiene, y ciclicidad (con ⚠ para cíclicas en pico). Tesis y riesgo de cada una accesibles por tooltip o nota. Debajo, "lecturas clave del radar" en 3-5 puntos que apliquen la metodología (trampas cíclicas, PEG destacados, solapamiento de factores con la cartera, correlación con el capital humano del usuario). Rotulada explícitamente como radar de evaluación, no recomendaciones de compra (ver metodologia.md 2f).

6. **Diversificación y factores**: barras de exposición por sector vs (si aplica) el peso de ese sector en el S&P 500; y un texto corto sobre solapamiento de factores (el driver compartido y qué % del portfolio lo comparte).

7. **Performance y contexto**: barras comparando YTD de cada posición vs su sector y vs S&P 500. Debajo, 2-3 líneas de contexto de mercado y catalizadores próximos con fecha.

7b. **Análisis técnico Fibonacci (interactivo)**: sección "Análisis técnico φ por posición" que incrusta el módulo de `assets/fibonacci-module.js`:
   - Copiar el contenido COMPLETO del archivo dentro de un `<script>` inline (misma regla que Chart.js: nada de `<script src>` externos).
   - Debajo del script, un contenedor y la inicialización con los tickers del portfolio ordenados por peso descendente:
     ```html
     <section>
       <h2>Análisis técnico φ por posición</h2>
       <p class="nota">Módulo interactivo: al elegir una posición descarga su histórico completo en vivo (Yahoo Finance), detecta el impulso vigente y calcula retrocesos, extensiones y probabilidades empíricas. Requiere conexión; los datos técnicos son del momento de apertura del reporte y pueden diferir del snapshot fundamental.</p>
       <div id="fib-module"></div>
       <script>initFibonacciModule(document.getElementById('fib-module'),{tickers:["TICK1","TICK2",...]});</script>
     </section>
     ```
   - El módulo es autónomo (inyecta sus propios estilos con prefijo `.fibm`, ya en el sistema φ) y muestra su propio estado de error con reintento si no hay red — no envolverlo en try/catch ni duplicar sus estilos.
   - En el resumen ejecutivo puede citarse el veredicto técnico de las 2-3 posiciones principales si se corrió el análisis durante la generación, siempre rotulado como técnico y con su fecha.

8. **Recomendaciones** — dos bloques visualmente separados:
   - **Diagnóstico y escenarios** (Nivel 1): hallazgo → implicancia → escenario.
   - **Pesos objetivo sugeridos** (Nivel 2): tabla peso actual → sugerido con flechas, acción en cantidad aproximada de acciones, racional de una línea. Encabezado del bloque: "Sugerencia basada en datos del [fecha] — no es asesoramiento financiero". Incluir el perfil asumido (mediano-largo plazo, riesgo moderado) y que puede recalcularse con otro perfil.

9. **Cinco sugerencias estructurales**: mejoras a la estructura de la cartera (ver la sección correspondiente en `metodologia.md`), cada una con formato hallazgo → propuesta concreta con números del portfolio analizado.

10. **Fuentes y notas**: lista de fuentes con URL y hora aproximada de consulta; metodología en una línea (HHI, N efectivo); disclaimer completo.

## Gráficos (Chart.js)

- Tema y paleta: los de `references/estetica-phi.md` (sección "Gráficos — tema φ"): paleta categórica validada en orden fijo, grilla `rgba(236,222,180,.07)`, ticks en mono, donut `cutout:'65%'` con `borderColor:'#121210'` y `borderWidth:2`, benchmarks en grises.
- Leyenda a la derecha (abajo en mobile), tooltip con valor USD y peso %.
- Barras: horizontales cuando las etiquetas son largas; sin animaciones largas (`animation.duration: 400`).
- Nada de gráficos decorativos: si una sección no gana claridad con un gráfico, usar tabla o texto.

## Errores comunes a evitar

- Números en el HTML que no salen del JSON de cálculo (deriva entre secciones).
- Porcentajes que no suman 100 por redondeo sin nota.
- Colores rojo/verde como único canal (agregar signo +/− siempre).
- Repetir el disclaimer solo al final: va también en el header y en el bloque de sugerencias.
