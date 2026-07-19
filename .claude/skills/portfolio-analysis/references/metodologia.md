# Metodología de análisis y recomendación

Este documento define cómo pasar de los datos crudos (research + cálculos) a un diagnóstico y a sugerencias defendibles. La meta es que dos corridas con los mismos datos lleguen a conclusiones similares.

## 1. Composición y concentración

- **Peso por posición**: valor de mercado de la posición / valor total del portfolio.
- **HHI** (Herfindahl-Hirschman): suma de los pesos al cuadrado (pesos en fracción). Referencias: < 0.15 diversificado, 0.15-0.25 concentración moderada, > 0.25 concentrado. Con 4-5 posiciones el HHI será alto casi por definición — decirlo, en vez de fingir alarma.
- **N efectivo** = 1/HHI: "este portfolio de 6 posiciones se comporta como uno de 2.8" es más comunicable que el HHI crudo.
- **Solapamiento de factores**: la diversificación real es menor que la nominal cuando las posiciones comparten drivers (mismo sector, misma exposición a un tema como IA, misma sensibilidad a tasas). Nombrar el factor compartido explícitamente. Ejemplo: cuatro mega-caps tech diversifican riesgo idiosincrático de empresa, pero no riesgo de factor (capex IA, regulación, múltiplos de crecimiento ante suba de tasas).

## 2. Valuación ajustada por crecimiento (la expectativa manda)

Un P/E forward o un EV/EBITDA aislados no son representativos: el mercado no paga los resultados de ayer sino la **proyección de crecimiento**. Todo múltiplo se lee contra la expectativa:

- **PEG como métrica primaria de comparación**: P/E forward ÷ crecimiento de EPS esperado. Como referencia general, PEG ≈ 1 es valuación "justa" respecto del crecimiento proyectado, > 2 exige mucha fe, < 1 sugiere que el mercado descree del crecimiento estimado (y hay que preguntarse por qué descree, no asumir regalo).
- **Revisiones de estimaciones como señal direccional**: la dirección de las revisiones de los últimos 60-90 días suele importar más que el nivel del múltiplo — un múltiplo "barato" con estimaciones cayendo es una trampa clásica (el denominador se está derritiendo); un múltiplo exigente con revisiones al alza puede sostenerse.
- **Expectativa implícita**: preguntarse qué crecimiento está descontando el precio. Si una acción cotiza a P/E fwd 60 con crecimiento proyectado de un dígito, el mercado está pagando una reaceleración que el consenso no proyecta — eso es una apuesta, y el reporte debe nombrarla como tal.
- Comparar también contra: (a) el rango histórico propio si se consiguió, (b) los pares dentro del portfolio, (c) el sector. EV/EBITDA como control del P/E (el P/E engaña con recompras agresivas o cargos no recurrentes).

Regla de interpretación: un múltiplo alto no es "caro" ni uno bajo "barato" — es caro/barato **relativo al crecimiento proyectado y la calidad que se compra**. Un P/E 35 con EPS proyectado creciendo 25% (PEG 1,4) puede ser más razonable que un P/E 18 con ingresos planos y revisiones a la baja.

## 2b. Comparación intra-sector y realocación

Cuando el portfolio tiene 2+ posiciones del mismo sector (o del mismo factor aunque el sector GICS difiera), armar un **duelo directo** y emitir veredicto — no describir en paralelo y dejar la conclusión al lector.

Dimensiones del duelo: crecimiento proyectado (ingresos y EPS), PEG / valuación ajustada, márgenes y conversión a FCF, upside de consenso, dirección de revisiones, y riesgos idiosincráticos de cada una.

El veredicto es una de tres opciones, con racional:
- **Mantener ambas**: capturan sub-drivers distintos del sector (p.ej. dos financieras donde una es apuesta de crecimiento fintech y otra de normalización macro) y la correlación esperada no es extrema.
- **Consolidar en la mejor**: una domina a la otra en la mayoría de las dimensiones y ambas responden al mismo driver — tener las dos no diversifica, solo duplica el trabajo de seguimiento con menor calidad promedio.
- **Reponderar entre ellas**: ambas merecen lugar pero los pesos actuales no reflejan la diferencia de asimetría (la de mejor duelo con menos peso).

La pregunta guía: "si hoy tuviera que armar la exposición a este sector desde cero con estos datos, ¿la armaría así?" Si la respuesta es no, la realocación intra-sector tiene sentido y suele ser más eficiente en impuestos y en riesgo que cambiar la exposición sectorial total.

## 2c. Veredicto por ticker

Cada posición recibe una síntesis explícita de una línea que responde "¿es buena esta posición hoy?", combinando cuatro patas: fundamentales (semáforo de la sección 3), valuación ajustada por crecimiento (PEG/expectativa implícita), consenso (rating, upside del precio objetivo, revisiones) y el chequeo de ciclicidad (sección 2d). Formato sugerido: "Sólida / Razonable / Cuestionable / Frágil" + el porqué en una frase. Las patas pueden discrepar (fundamentales verdes con valuación plena, como una AAPL en máximos) — el veredicto nombra la tensión en vez de esconderla.

## 2d. Chequeo de ciclicidad — la trampa del P/E bajo con ganancias récord

Regla clásica (Peter Lynch): **nunca leer un P/E bajo como barato sin antes preguntar si el negocio es cíclico y en qué punto del ciclo están sus ganancias.** En las cíclicas el P/E funciona al revés de la intuición: en el pico del ciclo las ganancias están infladas y el mercado se niega a pagar múltiplo por resultados que sabe insostenibles — el P/E se ve bajísimo justo en el techo (una memoria/DRAM a 6x forward suele ser señal de pico, no de ganga). En el piso, con ganancias deprimidas, el P/E se ve carísimo — y suele ser el mejor momento de compra.

Procedimiento por posición:
1. Clasificar el negocio: **cíclica pura** (commodities, memoria/semis de ciclo, autos, shipping), **semi-cíclica** (publicidad, consumo discrecional, hardware, bancos con ciclo de crédito) o **secular/recurrente** (software por suscripción, servicios con ingresos contratados).
2. Ubicar las ganancias actuales: ¿cerca de máximos históricos, normalizadas o deprimidas? (márgenes actuales vs promedio de 5-10 años es el proxy rápido).
3. Aplicar la regla: cíclica + ganancias récord + P/E bajo → **alerta de pico de ciclo** en el veredicto, nombrada explícitamente; cíclica + ganancias deprimidas + P/E alto → posible punto de entrada (verificar balance para sobrevivir el invierno). En semi-cíclicas, moderar la alerta según cuánto del resultado sea recurrente. En seculares/recurrentes el P/E bajo sí puede leerse como valuación deprimida genuina — ahí vale el análisis de la sección 2.
4. Combinar con revisiones: P/E bajo + estimaciones bajando en una cíclica es la trampa completa; el denominador ya se está derritiendo.

El paralelismo útil para explicarlo: valuar una cíclica en pico es como valuar una productora de shale con el crudo en máximos asumiendo ese netback a perpetuidad.

## 2e. Inversores relevantes (13F) — contexto, no señal

El reporte incluye qué tenedores institucionales grandes y qué superinversores reconocidos declararon posición en cada ticker en su último 13F, con el cambio del trimestre (nueva / aumentó / recortó / salió).

Cómo interpretarlo — y así debe presentarlo el reporte:
- **Es contexto, nunca señal de compra**: los 13F se publican hasta 45 días después del cierre del trimestre y no muestran ventas posteriores, coberturas con derivados ni el racional. Copiar posiciones con dos meses de rezago no es una estrategia.
- Lo informativo son los **cambios y la convergencia**: varios gestores de estilos distintos iniciando posición el mismo trimestre dice más que uno solo manteniéndola; una salida masiva de un nombre que el usuario tiene merece mención en el diagnóstico.
- **Distinguir convicción de crowding**: si "todos" los hedge funds tienen la misma posición (hedge fund hotel), la salida puede ser desordenada — eso es un riesgo a nombrar, no una validación.
- Citar siempre el trimestre del 13F Y la fecha de presentación ante la SEC ("posiciones al 31-mar, presentadas el 15-may") para que el rezago quede a la vista, más la fecha límite del próximo 13F.

## 2f. Radar de candidatas — lo que los grandes tienen y el usuario no

Del relevamiento de portfolios de superinversores (4-6 gestores de estilos distintos) se construye un cuadro aparte con las acciones destacadas que NO están en la cartera del usuario: top holdings de peso, compras nuevas relevantes y consensos de compra del trimestre.

Reglas de presentación:
- **Cuadro con los mismos criterios que la cartera propia**: precio, YTD, P/E fwd, crecimiento proyectado, PEG, revisiones, consenso + upside, ciclicidad, quién la tiene y por qué (tesis y riesgo en una línea). Una candidata se evalúa con la misma vara que una posición — nada de listarlas sin números.
- **No son recomendaciones de compra**: el radar existe para que nada atractivo quede fuera de la mira, y así se rotula. Que Druckenmiller tenga 18% en un nombre no es tesis transferible: su horizonte, tamaño y stop-loss no son los del usuario.
- **Aplicar el chequeo de ciclicidad con especial dureza**: las candidatas de moda suelen ser exactamente las cíclicas en pico (semis de memoria con márgenes récord). Señalarlo aunque las revisiones sigan al alza.
- **Chequear solapamiento con la cartera actual**: si una candidata comparte factor con lo que el usuario ya tiene (mismo país, mismo driver, mismo sector), decirlo. Caso especial: la **correlación con el capital humano** — si el usuario trabaja en la industria/país de la candidata, sumarla correlaciona sus ingresos laborales con sus ahorros; ese riesgo se nombra explícitamente.
- **Verificar accesibilidad**: si el usuario opera desde Argentina, indicar si existe CEDEAR (con ratio) o listado local; una candidata inaccesible se marca como tal.

## 3. Salud fundamental (semáforo por posición)

Asignar verde/amarillo/rojo por posición combinando:

- Crecimiento de ingresos (acelerando/estable/desacelerando)
- Margen operativo (expandiendo/estable/comprimiendo)
- FCF (positivo y creciente / presionado por capex / negativo)
- Balance (caja neta / deuda manejable / apalancamiento alto)
- Momentum de estimaciones (revisiones de consenso al alza/estables/a la baja)

El semáforo es un resumen visual, no un veredicto: cada color va acompañado de una línea que explica el porqué.

## 4. Contexto sectorial y de mercado

- Performance YTD del sector de cada posición vs S&P 500: ¿el rezago/liderazgo de la acción es propio o de su sector?
- Catalizadores próximos identificados en el research (earnings, lanzamientos, decisiones regulatorias) — con fecha si se conoce.
- Narrativas de mercado (rotaciones, flujos): reportarlas como narrativas, no como hechos. Si el usuario menciona una tesis de flujos ("el dinero va a rotar de X a Y"), evaluarla con escepticismo explícito: los flujos publicados (ETF flows, 13F) son retrospectivos y las rotaciones secuenciales predecibles no tienen soporte empírico.

## 5. Recomendaciones — dos niveles, nunca mezclados

### Nivel 1: Diagnóstico y escenarios

Hechos y condicionales. Formato: hallazgo → implicancia → escenario.

> "META pasó de X% a Y% del portfolio por su suba reciente (hallazgo). Tu exposición al resultado de su apuesta de capex es hoy la mayor del portfolio (implicancia). Si tu objetivo es mantener los pesos originales, correspondería recortar ~N acciones; si tu tesis es que la suba tiene continuidad, el costo es aceptar mayor concentración (escenario)."

### Nivel 2: Pesos objetivo sugeridos

Tabla: posición | peso actual | peso sugerido | acción (mantener / recortar ~N acciones / aumentar ~N acciones) | racional en una línea.

Principios para fijar los pesos sugeridos:

- **Anclar en rebalanceo, no en momentum.** El punto de partida es corregir derivas: lo que corrió mucho tiende a estar sobreponderado respecto de cualquier asignación deliberada. Desviarse de ese ancla solo con un argumento fundamental explícito.
- **Penalizar concentración de factor**, no solo de posición: si tres posiciones comparten un driver, el peso combinado de ese driver es la cifra a gestionar.
- **Premiar asimetrías identificables**: valuación deprimida con fundamentales verdes es el caso clásico para sugerir aumento; valuación exigente con fundamentales amarillos, para recorte.
- **Sugerencias implementables**: traducir los pesos a cantidades aproximadas de acciones a comprar/vender al precio actual, redondeadas. Nunca sugerir vender más de lo que hay.
- **No inventar posiciones nuevas** salvo que el usuario lo pida; como máximo, mencionar en una línea qué tipo de exposición complementaría al portfolio (p.ej. "no hay nada defensivo ni value en la cartera").

Perfil por defecto (el input es solo ticker + cantidad): inversor de mediano-largo plazo, tolerancia al riesgo moderada, sin necesidad de liquidez inmediata. Decirlo en el reporte para que el usuario pueda corregirlo.

### Sección fija: cinco sugerencias estructurales

Después de los dos niveles, el reporte cierra el bloque de recomendaciones con cinco sugerencias de **estructura** — cómo está armada la cartera, no qué comprar mañana. Adaptarlas al portfolio concreto (con los números del caso), partiendo de este menú:

1. **Núcleo indexado**: si el 100% es selección individual, proponer un núcleo (15-20%) en un ETF amplio para capturar el retorno de mercado sin depender de acertar cada tesis. En Argentina, SPY/QQQ cotizan como CEDEARs de ETF.
2. **Diversificación de factores**: identificar los drivers compartidos y qué sectores/estilos faltan por completo (defensivos, value, flujo estable), con vehículos concretos disponibles para el usuario.
3. **Reglas de tamaño y bandas de rebalanceo**: tope por posición (p.ej. 20%) y bandas (±5 pp) con revisión periódica — disciplina repetible en vez de decisiones bajo presión.
4. **Gestión de liquidez por función**: separar liquidez táctica (oportunidades) de colchón (no vender en mal momento), con instrumentos cortos adecuados al mercado del usuario; mencionar renta fija si el contexto lo amerita.
5. **Tesis y gatillo de salida documentados por posición**: qué invalida cada tesis, con lookback periódico contra lo escrito.

Si alguna no aplica (p.ej. el usuario ya tiene núcleo indexado), reemplazarla por la mejora estructural más relevante que surja del análisis — el número (cinco) importa menos que la pertinencia, pero es el estándar del reporte.

### Framing de performance — regla dura

El YTD/12m de un activo NO es el retorno del usuario: sin fechas y precios de compra no se puede calcular su resultado, y asumir tenencia desde enero es un error. Presentar siempre como "los activos que componen la cartera rinden X% ponderado a los pesos actuales", aclarar que no es el retorno personal, y ofrecer calcularlo si el usuario comparte su cost basis. La contribución por posición se presenta igual: describe al activo dentro de la foto actual.

### Disclaimer

Cerrar siempre con: los datos tienen la fecha indicada, esto es análisis basado en información pública y no constituye asesoramiento financiero; consultar a un asesor matriculado para decisiones significativas.
