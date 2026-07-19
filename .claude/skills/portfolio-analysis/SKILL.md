---
name: portfolio-analysis
description: >-
  Analiza y ordena un portfolio de acciones a partir de tickers y cantidad de
  acciones en tenencia. Busca SIEMPRE datos actualizados de mercado (precios,
  fundamentales, valuación, performance sectorial, noticias y catalizadores),
  calcula composición, concentración y diversificación, y genera un reporte
  HTML interactivo en español con diagnóstico, escenarios y pesos objetivo
  sugeridos con su racional. Usar este skill siempre que el usuario pida
  ordenar, estructurar, analizar, revisar, rebalancear u optimizar su
  portfolio/cartera de inversiones; comparar sus tenencias; pedir sugerencias
  de asignación de capital entre acciones; o mencione una lista de tickers con
  cantidades en tenencia y quiera saber qué hacer con ellas. También aplica a
  frases como "cómo distribuyo mi capital", "qué hago con mis acciones",
  "analizá mi cartera", "portfolio review", "rebalanceo".
---

# Portfolio Advisor

Genera un análisis integral y accionable de un portfolio de acciones, con datos de mercado actualizados al momento de la corrida, y lo entrega como un dashboard HTML autónomo en español.

## Principios innegociables

1. **Nunca inventar datos.** Cada precio, múltiplo, métrica o dato sectorial debe salir de una búsqueda web hecha en esta corrida. Si un dato no se consigue, se marca como "no disponible" en el reporte — jamás se estima en silencio.
2. **Fechar todo.** El reporte lleva fecha y hora de generación y aclara que los precios pueden tener retraso de 15-20 minutos según la fuente. Los datos de mercado envejecen rápido; un reporte sin fecha es peligroso.
3. **Separar hechos de opinión.** El diagnóstico (composición, concentración, múltiplos) es factual. Las recomendaciones son interpretación basada en esos hechos y se presentan como tales, con su racional explícito.
4. **Disclaimer siempre.** El reporte y la respuesta en el chat incluyen que esto no constituye asesoramiento financiero y que las decisiones son del usuario.

## Workflow

### Paso 1 — Parsear el input

El input mínimo es una lista de tickers con cantidad de acciones. Puede venir en el mensaje ("tengo 10 GOOGL, 5 MSFT..."), en una tabla, o en un archivo adjunto (CSV/Excel — leerlo). Normalizar a una lista de posiciones `{ticker, acciones}`.

- Resolver ambigüedades obvias sin preguntar: "Google" → GOOGL, "Meta" → META. Si un ticker es genuinamente ambiguo (p.ej. una empresa con doble listado), preguntar.
- Si el usuario no da cantidades, se puede correr igual el análisis comparativo, pero avisar que sin cantidades no hay pesos reales ni sugerencias de rebalanceo cuantificadas.

### Paso 2 — Research (datos actualizados, en paralelo)

Para CADA ticker, buscar vía web search/fetch (lanzar búsquedas en paralelo; si hay subagentes disponibles, uno por ticker acelera mucho):

- **Precio y performance**: precio actual, variación día, YTD, 12 meses, máximo/mínimo 52 semanas, market cap.
- **Fundamentales**: P/E forward y trailing, EV/EBITDA, P/S, crecimiento de ingresos (últ. trimestre YoY y estimado), margen operativo, FCF y FCF yield, deuda neta, recompras/dividendos.
- **Expectativas del mercado (tan importante como los múltiplos)**: crecimiento PROYECTADO de ingresos y EPS según consenso (próximo año fiscal, y CAGR a 3-5 años si está publicado), PEG ratio, y dirección de las revisiones de estimaciones de los últimos 60-90 días (al alza / estables / a la baja). Un P/E fwd o EV/EBITDA aislado dice poco: lo que el mercado paga es la proyección de crecimiento, así que estos datos son obligatorios, no opcionales. Fuentes: pestañas de estimates/forecast de stockanalysis.com, Yahoo Finance (Analysis), Zacks.
- **Consenso**: rating promedio de analistas y precio objetivo consenso (citando fuente).
- **Inversores relevantes (13F)**: principales tenedores institucionales del ticker y, sobre todo, qué superinversores reconocidos (Berkshire, Pershing Square, Third Point, Appaloosa, Duquesne, Coatue, etc.) tienen posición según el ÚLTIMO 13F declarado, y el cambio del trimestre (nueva posición / aumentó / recortó / salió). Fuentes: Dataroma, WhaleWisdom, 13f.info, Fintel, HedgeFollow. Registrar SIEMPRE el trimestre reportado Y la fecha de presentación ante la SEC (ej: "posiciones al 31-mar, presentadas el 15-may") — los 13F se publican hasta 45 días después del cierre, son una foto vieja y así hay que presentarlos, con ambas fechas visibles.
- **Portfolios de superinversores y radar de candidatas**: relevar además el portfolio COMPLETO declarado de 4-6 inversores influyentes de estilos distintos (típicamente Berkshire, Pershing Square, Appaloosa, Duquesne, Third Point; 13f.info tiene los filings crudos): valor total, top 10 holdings con % y cambio del trimestre, compras nuevas y salidas completas. De ahí, identificar las 6-10 acciones destacadas que NO están en el portfolio del usuario (top holdings grandes, compras nuevas relevantes, consensos de compra del trimestre) y hacer mini-research de cada candidata: precio, YTD, P/E fwd, crecimiento proyectado de ingresos y EPS, PEG, revisiones, consenso + objetivo, clasificación de ciclicidad, y disponibilidad de CEDEAR/listado local si el usuario opera desde Argentina. Esto alimenta el "radar de candidatas" del reporte (ver metodología 2f).
- **Ciclicidad del negocio**: clasificar cada empresa como cíclica pura (commodities, memoria/semis de ciclo, autos), semi-cíclica (publicidad, consumo discrecional, hardware) o secular/recurrente (software por suscripción, servicios), y si sus ganancias actuales están cerca de máximos históricos o normalizadas. Alimenta el chequeo anti-trampa del Paso 4.
- **Sector y contexto**: sector/industria GICS, performance del sector YTD vs S&P 500, y 2-3 noticias o catalizadores recientes relevantes (earnings, guidance, anuncios).

Además, buscar **contexto de mercado general**: nivel y variación YTD del S&P 500 y Nasdaq, y algún tema macro dominante del momento (tasas, rotación sectorial, etc.).

Fuentes útiles: Yahoo Finance, StockAnalysis, MarketWatch, Macrotrends, prensa financiera. Guardar la URL de cada fuente usada — van a la sección de fuentes del reporte.

Volcar todo a un JSON intermedio `positions.json` con la estructura que espera el script del Paso 3 (ver encabezado de `scripts/compute_portfolio.py`).

### Paso 3 — Cálculos

Ejecutar `scripts/compute_portfolio.py positions.json` (stdlib puro, sin dependencias). Calcula:

- Valor por posición y peso % sobre el total.
- Concentración: índice HHI y N efectivo de posiciones.
- Exposición por sector (pesos agregados).
- Aporte de cada posición al retorno YTD ponderado del portfolio.

No rehacer estas cuentas a mano: el script existe para que los números del reporte sean consistentes entre sí.

### Paso 4 — Análisis y recomendaciones

Leer `references/metodologia.md` para el marco completo. En síntesis, el análisis cubre cuatro dimensiones y las recomendaciones tienen dos niveles que nunca se mezclan:

**Nivel 1 — Diagnóstico y escenarios (factual/condicional):** concentración y solapamiento de factores, valuación relativa entre posiciones, salud fundamental, riesgos identificados. Escenarios tipo "si tu objetivo es X, la implicancia es Y".

El análisis incluye siempre dos piezas adicionales (marco en `references/metodologia.md`):
- **Comparación intra-sector**: cuando 2+ posiciones comparten sector o factor, un duelo directo (crecimiento proyectado, valuación ajustada por crecimiento, consenso, revisiones) con veredicto explícito: mantener ambas, consolidar en la mejor, o reponderar entre ellas — y por qué.
- **Veredicto por ticker**: para cada posición, una conclusión de una línea que responda "¿es buena esta posición hoy?" combinando fundamentales, valuación ajustada por crecimiento, consenso y el **chequeo de ciclicidad** (un P/E bajo en una cíclica con ganancias récord es señal de pico de ciclo, no de ganga — ver metodología, sección 2d) — no dejar la síntesis a cargo del lector.

**Nivel 2 — Pesos objetivo sugeridos (opinión fundamentada):** una tabla con peso actual → peso sugerido por posición, la acción implícita (mantener/recortar/aumentar, con cantidad aproximada de acciones), y el racional de cada cambio en una línea. Este nivel se rotula explícitamente como sugerencia basada en los datos del día, no como asesoramiento.

Además de los dos niveles, el reporte incluye siempre una sección de **cinco sugerencias estructurales**: mejoras a cómo está armada la cartera (núcleo indexado, diversificación de factores, reglas de tamaño y bandas de rebalanceo, gestión de liquidez, tesis y gatillos de salida documentados por posición), adaptadas al portfolio concreto. Ver el marco en `references/metodologia.md`.

**Regla de framing de performance (importante):** el input no incluye fechas ni precios de compra, así que el reporte NO muestra ninguna performance agregada "del portfolio" — ni siquiera con aclaraciones: ese número invita a leerse como retorno propio y no lo es. La performance se presenta solo **por acción individual** (día, YTD, 12 meses del activo), con el S&P 500 y los sectores como referencia de mercado. El YTD ponderado que calcula el script se usa internamente para dimensionar contribuciones en el diagnóstico ("NU es el mayor lastre de los activos este año"), no como métrica destacada del reporte ni del podcast. Ofrecer calcular el retorno personal real si el usuario comparte fechas y precios de compra.

### Paso 5 — Generar el reporte HTML

Leer `references/reporte-html.md` Y `references/estetica-phi.md` ANTES de escribir el HTML — el primero define estructura y secciones; el segundo es la fuente de verdad del estilo (sistema de diseño φ compartido con la app Fibonacci del usuario: tokens, tipografía, tablas y tema de Chart.js con paleta categórica ya validada). Si hay un skill de dataviz disponible en el entorno, sus reglas complementan (la paleta de estetica-phi.md ya pasó su validador sobre la superficie del reporte).

Reglas duras del artefacto:
- Un único archivo HTML autónomo, en español, con los tokens de `estetica-phi.md`.
- **Gráficos: incrustar `assets/chart.umd.js` inline dentro del HTML** (reemplazando el tag `<script src>` por el contenido del archivo). Los CDNs externos suelen estar bloqueados por CSP en las vistas previas y producen "Chart is not defined" — el archivo debe funcionar sin red. Sin localStorage/sessionStorage.
- **Análisis técnico Fibonacci: incrustar `assets/fibonacci-module.js` inline** e inicializarlo con los tickers del portfolio ordenados por peso (sección 7b de `reporte-html.md`). El módulo es autónomo, ya viste el sistema φ, y agrega a cada posición el análisis interactivo de retrocesos/extensiones con probabilidades empíricas.
- Todos los números del reporte salen del JSON del Paso 3 o del research del Paso 2 — nada tipeado "de memoria". (Los del módulo Fibonacci son en vivo al abrir el reporte y así se rotulan.)

Verificación antes de entregar: si hay un navegador headless disponible (Playwright/Chromium), abrir el archivo, confirmar cero errores de consola, que los canvas tengan dimensiones > 0 y que el módulo Fibonacci renderice su selector de posiciones (sin red mostrará su estado de error con botón de reintento — eso es correcto). Si no lo hay, al menos verificar que no queden `<script src>` externos en el archivo.

### Paso 5b — Podcast de audio

Junto con el HTML, generar un recuento en audio tipo podcast (3-5 minutos, MP3) para que el usuario pueda escuchar el análisis:

1. Escribir el guión en un `.txt` aparte: español hablado y conversacional, 500-750 palabras. Estructura: apertura (qué es, fecha de los datos), la foto del portfolio (total, pesos principales), performance solo por acción individual con el mercado como referencia (sin performance agregada del portfolio — misma regla que el reporte), los 3-4 hallazgos que importan, veredictos y duelos intra-sector en una frase cada uno, la sugerencia central de rebalanceo, las sugerencias estructurales en una pasada rápida, y cierre con el disclaimer hablado ("esto no es asesoramiento financiero; los datos son del [fecha]").
2. Reglas del guión: nada de tablas, URLs, siglas sin desplegar la primera vez, ni listas leídas — es una narración, no el reporte leído en voz alta. Números redondeados como se dicen hablando ("casi el veinticinco por ciento", no "24,38%"). Está bien que el guión priorice: el detalle fino vive en el HTML.
3. Generar el MP3 con `scripts/generar_podcast.py guion.txt podcast.mp3` (usa edge-tts con voz es-AR neural y cae a gTTS si falla; maneja solo el tema de certificados del proxy). Verificar que el archivo pese > 10 KB y, si hay ffprobe, que la duración sea razonable (2-7 min).
4. **Incrustar el audio dentro del HTML** con `scripts/incrustar_audio.py reporte.html podcast.mp3 --duracion "X min"`: agrega en el header un reproductor inline y un botón "Descargar MP3" (el audio va en base64, así el reporte sigue siendo un único archivo autónomo). El HTML puede incluir el marcador `<!-- PODCAST -->` donde se quiera el bloque; si no, el script lo inserta al final del header.

### Paso 6 — Entregar

Enviar el archivo HTML (que ya incluye el reproductor y la descarga del podcast) y también el MP3 suelto al usuario (SendUserFile o equivalente), para quien prefiera solo el audio. Acompañar con un resumen de 3-5 líneas en el chat: los 2-3 hallazgos más importantes y la sugerencia principal. No repetir todo el contenido del reporte en el chat.

Si el usuario pide este análisis de forma recurrente (p.ej. "todas las semanas"), ofrecer crear una tarea programada si el entorno lo permite.

## Manejo de casos borde

- **Ticker inexistente o deslistado**: avisar y continuar con el resto.
- **ETFs o cedears mezclados con acciones**: analizarlos igual (un ETF se trata por su exposición subyacente; aclarar que sus "fundamentales" son los del índice).
- **Portfolio de 1 sola posición**: el análisis de diversificación pasa a ser el mensaje central.
- **Mercados cerrados / datos discrepantes entre fuentes**: usar el dato más reciente, citar la fuente elegida y anotar la discrepancia si es material (>2%).
