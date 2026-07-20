# φ Fibonacci — Análisis de retrocesos y extensiones

Aplicación web autónoma (un solo archivo HTML, sin dependencias ni build) para
analizar una acción con la metodología de Fibonacci y obtener una recomendación
clara con probabilidades empíricas.

## Uso

Abrí `index.html` en cualquier navegador moderno e ingresá un ticker
(ej. `AAPL`, `MSFT`, `GGAL.BA`, `SAN.MC`). También hay un **modo demo sin
conexión** con una serie sintética.

## Qué hace

1. **Descarga 10 años de histórico diario** del ticker desde Yahoo Finance
   (con proxies CORS de respaldo si el acceso directo falla). Se limita a 10
   años porque es el máximo con granularidad diaria confiable — y porque los
   niveles técnicos pierden sentido más allá de la memoria del mercado.
2. **Detecta el impulso vigente** según el horizonte elegido (corto / medio /
   largo) y traza retrocesos (23,6 · 38,2 · 50 · 61,8 · 78,6%) y extensiones
   (127,2 · 161,8 · 200%), con detección de *golden pocket* y confluencias con
   el grado superior.
3. **Calcula probabilidades empíricas**: con pivotes zigzag recorre todo el
   histórico del propio papel, mide dónde terminó cada corrección comparable y
   qué niveles se alcanzaron antes de invalidar la estructura (con corrección
   bayesiana suave para muestras chicas).
4. **Emite una recomendación** (COMPRA FUERTE → VENTA) con puntaje transparente
   (tendencia SMA50/200, zona φ del retroceso, histórico del papel, RSI),
   escenarios con probabilidades, escalera de niveles con probabilidad de toque
   por nivel, plan operativo con stop/objetivos y relación riesgo-beneficio, y
   la distribución histórica de profundidades de retroceso.

## Si falla la carga de datos: proxy propio (recomendado)

La app llega a Yahoo/Stooq a través de proxies CORS públicos, que fallan
seguido (bloquean archivos locales, se caen o limitan tráfico). La solución
definitiva es un **proxy propio gratuito en Cloudflare Workers** (~5 min):

1. Entrá a [dash.cloudflare.com](https://dash.cloudflare.com) (cuenta
   gratuita) → **Workers & Pages** → **Create Worker** → Deploy.
2. **Edit code** → borrá todo → pegá el contenido de
   [`cors-proxy-worker.js`](cors-proxy-worker.js) → **Deploy**.
3. Copiá la URL del worker (`https://<nombre>.<cuenta>.workers.dev`) y pegala
   en el campo **"proxy propio"** que aparece en la pantalla de error de la
   app o del módulo del reporte. Queda guardada en el navegador y se usa con
   prioridad en todas las cargas siguientes.

El worker solo permite Yahoo Finance y Stooq (no es un proxy abierto) y el
plan gratuito de Cloudflare (100.000 requests/día) sobra para este uso.

## Integración con el análisis de portfolio

El mismo motor existe como **módulo embebible** en
`.claude/skills/portfolio-analysis/assets/fibonacci-module.js`: la skill de
análisis de portfolio lo incrusta en sus reportes HTML (sección "Análisis
técnico φ por posición") con los tickers de la cartera precargados, y el
reporte completo comparte este sistema de diseño
(`.claude/skills/portfolio-analysis/references/estetica-phi.md`). Si se cambia
la lógica de análisis acá, replicar el cambio en el módulo.

## Aviso

Herramienta educativa. Las probabilidades describen el comportamiento pasado
del activo y no garantizan resultados futuros. No constituye asesoramiento
financiero.
