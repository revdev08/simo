# Resultados del lote 23: ampliación de Procuraduría

Fecha de revisión: 16 de octubre de 2026. **Publicadas 140 preguntas nuevas**, TC-PGN-061 a TC-PGN-200. El módulo pasa de 60 a **200**; las 60 originales se conservaron sin cambios. Las nuevas son `beta`, capa 4, eje `procuraduria`, autor IA y sin revisión humana. Todas tienen resolución ciega coincidente.

El [PLAN.md](PLAN.md) contiene la cobertura previa, exclusiones y mapa final. El banco utilizado por la aplicación es `data/preguntas/procuraduria.json`; los siete archivos de este lote conservan la versión final de los borradores.

## Publicación y métricas

| Archivo | IDs | Cantidad | Cobertura | Media / Alta | Clave más larga / corta |
|---|---|---:|---|---:|---:|
| [pgn_d.json](pgn_d.json) | 61–80 | 20 | Estructura, reparto funcional y transformación del IEMP | 13 / 7 | 5 / 3 |
| [pgn_e.json](pgn_e.json) | 81–100 | 20 | Prevención, DDHH y Sistema Integral de Prevención | 10 / 10 | 6 / 1 |
| [pgn_f.json](pgn_f.json) | 101–120 | 20 | Intervención penal, contenciosa, de infancia y restitución | 12 / 8 | 5 / 5 |
| [pgn_g.json](pgn_g.json) | 121–140 | 20 | Conciliación extrajudicial administrativa | 10 / 10 | 4 / 4 |
| [pgn_h.json](pgn_h.json) | 141–160 | 20 | Actuación disciplinaria: prueba, notificación, recursos y nulidades | 13 / 7 | 4 / 4 |
| [pgn_i.json](pgn_i.json) | 161–180 | 20 | Carrera, requisitos, evaluación y retiro | 9 / 11 | 4 / 3 |
| [pgn_j.json](pgn_j.json) | 181–200 | 20 | DOKUS, calidad, Strategos, peticiones y apoyo a la defensa judicial | 8 / 12 | 6 / 3 |

Cada archivo tiene cinco claves A, cinco B, cinco C y cinco D: **35 por letra** en el lote. Hay **70** preguntas asistencial/técnico y **70** profesional/asesor. Dificultad editorial: **75 Media y 65 Alta**. Todas están formuladas como casos. Cada archivo supera el mínimo de ocho casos combinados o con cálculo.

La clave es estrictamente la opción más larga en **34/140 (24.3%)** y la más corta en **23/140 (16.4%)**. Cada archivo cumple 20–30% de claves más largas y como máximo 25% de más cortas. Acierto estimado final: **75.2%**, rango **50–90%**; son estimaciones de revisores, pendientes de calibración con uso real.

## Resolución a ciegas

Cada revisión recibió solo enunciado y opciones, con acceso a las fuentes y sus reglamentos; los revisores no abrieron claves, explicaciones, planes ni respuestas anteriores. Un agente nuevo resolvió cada ronda corregida.

| Archivo | Primera ronda | Segunda ronda | Tercera ronda | Preguntas corregidas distintas | Acierto estimado final medio |
|---|---:|---:|---:|---:|---:|
| pgn_d | 20/20 | 7/7 | — | 7 | 65.1% |
| pgn_e | 20/20 | 15/15 | 6/6 | 15 | 80.8% |
| pgn_f | 20/20 | 2/2 | 1/1 | 2 | 72.0% |
| pgn_g | 20/20 | 1/1 | — | 1 | 74.6% |
| pgn_h | 20/20 | — | — | 0 | 75.9% |
| pgn_i | 20/20 | 3/3 | — | 3 | 80.0% |
| pgn_j | 20/20 | — | — | 0 | 78.5% |

Las rondas sumaron **175 resoluciones**. Se corrigieron **28 preguntas distintas**. La coincidencia de letras no se tomó como aprobación automática: se corrigieron pistas, premisas incompletas, distractores débiles y acierto estimado superior al 90%. No quedaron alternativas defendibles, pistas abiertas, confianza baja ni estimaciones superiores al 90% en la última revisión. No se usó una marca de excepción para eludir estas correcciones.

## Correcciones

- **d:** se ajustaron 064, 067, 071, 074, 076, 078 y 079 por pistas o formulación; 078 cambió a la competencia de control interno. Las siete pasaron una segunda revisión.
- **e:** se corrigieron 081, 082, 083, 084, 085, 086, 087, 088, 090, 093, 094, 096, 097, 099 y 100. La segunda ronda mantuvo seis problemas de trivialidad, dádiva o repetición: 084, 086, 087, 096, 097 y 100 se sustituyeron por decisiones del SIP y cierre preventivo. Las seis pasaron la tercera revisión.
- **f:** 105 sustituyó distractores débiles por confusiones sobre turno y facultades del juez y del Ministerio Público; 114 precisó que la pérdida de competencia procede del vencimiento para resolver reposición bajo artículo 100 de la Ley 1098. Una tercera versión de 105 equilibró longitud; también pasó revisión nueva.
- **g:** 130 cambió correos de atención/ventas por buzones jurídicos plausibles y contrastó una entidad privada con función administrativa con otra sin ella. Se agregó el literal del artículo 197 del CPACA. Pasó una segunda revisión.
- **h:** las 20 preguntas pasaron sin correcciones. La repetición de rejillas simétricas se registró como observación de estilo, sin una pista que permitiera identificar la clave.
- **i:** 161 retiró una consigna que anunciaba la corrección; 162 explicitó el nombre del curso en los certificados; 167 dejó de anticipar que ambos componentes eran errados. Las tres pasaron otra revisión. En 169 se examinó el alcance gramatical de «salvo» en el artículo 228 y no se sustentó una segunda clave.

- **j:** las 20 preguntas pasaron sin correcciones. Se verificaron los dos cálculos de calendario y la compatibilidad entre responsabilidad de la jefatura y cargue operativo por el administrador de Estrategos.

## Verificación del concurso

El encargo contenía datos que cambiaron. Se consultaron los actos oficiales y sus notas de modificación:

- **Oferta vigente verificada: 3.051 empleos**, de los cuales 2.928 son permanentes y 123 transitorios. La oferta original de 2.826 bajó a 2.824 con la Resolución 108 y luego aumentó en 227 con la Resolución 243. La reserva para personas con discapacidad suma 215 empleos. Fuente: [Resolución 243 de 2026, artículo 1 y tabla de oferta](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0243_2026.htm).
- **Sistema especial propio de la PGN y operador Universidad de Antioquia**, confirmado en la [Resolución 076 de 2026](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0076_2026.htm). No es una convocatoria de la CNSC.
- **Inscripciones del 7 al 18 de septiembre de 2026**, conforme a la [Resolución 133 de 2026](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0133_2026.htm). La suma de los 390 registros de convocatoria del [certificado oficial de inscritos](https://www.procuraduria.gov.co/Documents/2026/9.%20septiembre/CERTIFICADO%20DE%20INSCRITOS%20CONCURSO%20PGN.pdf), comprobada con Python y Node, da **295.925 inscripciones**. Es un cálculo de la tabla, no un total general impreso ni una deduplicación de personas entre convocatorias.
- **Conocimientos / comportamentales / antecedentes:** 70/20/10 para asesor, ejecutivo y profesional; 60/20/20 para técnico, administrativo y operativo. La prueba eliminatoria exige 65/100; el mínimo final para integrar la lista es distinto: 70/100. Fuentes: [Resolución 076, artículos 18–20, 27 y 33](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0076_2026.htm).
- **Excepciones de ejecución:** para Conductor y Auxiliar de Servicios Generales, la [Resolución 212 de 2026, artículos 10 y 11](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0212_2026.htm), sustituye conocimientos escritos por ejecución; las comportamentales siguen siendo escritas. La convocatoria específica debe consultarse para el detalle del empleo.
- **Mayo de 2027 es una estimación oficial**, publicada en el [boletín 832 de la PGN del 8 de septiembre de 2026](https://www.procuraduria.gov.co/Pages/mas-17-mil-registros-durante-primer-dia-inscripciones-concurso-meritos-procuraduria-general-nac.aspx). No se encontró una fecha exacta oficial de aplicación ni se verificó la publicación efectiva de listas de admitidos; no se presentan como hechos confirmados.

No se modificó `lib/convocatorias/catalogo.ts`: el encargo exige consultar al dueño antes de cambiarlo. Las cifras y excepciones anteriores quedan documentadas para esa decisión.

## Fuentes y vigencia

El sitio del Senado no respondió por HTTP ni HTTPS durante la consulta. Se descargaron compilaciones oficiales de Cancillería, con HTML, texto, segmentos tachados y JavaScript de notas, además de normas y documentos de la PGN y de Función Pública. Todo el material descargado permanece en una carpeta temporal fuera del repositorio. Las líneas de «Última actualización» se conservaron; cuando el sitio completa la fecha dinámicamente y esta no aparece en el texto, no se inventa una fecha.

Dos correcciones del mapa normativo:

- El [Decreto 263 de 2000](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=82093) regula requisitos; la clasificación y nomenclatura están en el [Decreto 264 de 2000](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=89986).
- La [Ley 2553 de 2025](https://www.cancilleria.gov.co/normograma/compilacion/docs/ley_2553_2025.htm) transforma el IEMP en Universidad del Ministerio Público. Se distingue el régimen legal de transformación de su implementación; no se presume que la transición hubiera concluido el día de la revisión. Una nota de compilación dice «marzo», mientras la ley y los actos del concurso señalan el 13 de noviembre de 2025: no se reprodujo la errata.

Para conciliación se utilizaron también el Decreto 1069 de 2015 actualizado, el [Decreto 42 de 2026](https://apps.procuraduria.gov.co/normograma/compilacion/docs/decreto_0042_2026.htm) y la [Resolución 333 de 2024 de la PGN](https://apps.procuraduria.gov.co/normograma/compilacion/docs/resolucion_procuraduria_0333_2024.htm), para que los revisores dispongan de la ley y de sus reglas complementarias.

## Comprobaciones y trazabilidad

- 316 fragmentos literales contrastados con las fuentes oficiales y listas de tachados, sin problemas finales. También se verificaron directamente los dos fragmentos cortos que el script omite por longitud.
- Validación estructural y de sesgos: cero errores y sin advertencias en los siete archivos nuevos.
- Antes de cada publicación: auditoría adicional de pistas, alternativas, confianza, dificultad, niveles, letras y longitud; además, comparación exacta del enunciado y opciones con su última copia ciega.
- Publicación por `merge-lote.mjs`, primero en ensayo y después efectiva, en olas de 40, 60 y 40.
- `yarn validate:questions` aprobó todo el banco tras las publicaciones. Persiste la advertencia preexistente de TC-RCD-069, ajena al lote; no se alteró esa pregunta.
- Se verificaron con Node los plazos y festivos, aplicando artículo 62 de Ley 4 de 1913 y Ley 51 de 1983 cuando corresponde.
- Se comprobó que los IDs nuevos son exactamente 061–200, sin duplicados, y que las primeras 60 preguntas coinciden íntegramente con el estado inicial.
- Fuentes, PDF, cálculos, ciegos y respuestas se conservaron fuera del repositorio. No se incluyeron `REVISION_MEJORAS.md` ni `app/dev-preview`.

`yarn build` terminó correctamente con Next.js 16.2.3: compilación, TypeScript y generación de 73 páginas. No había un servidor Next de este proyecto activo antes de compilar. Después se eliminó `.next` y se inició el servidor de desarrollo en segundo plano; la página inicial respondió HTTP 200 en `http://127.0.0.1:3000`. La limpieza retiró primero una unión de directorios de `.next` sin borrar su destino `node_modules/prettier`.

Avisos del entorno local: Resend no tiene configurada `RESEND_API_KEY` y Clerk inicia en modo sin claves. No impidieron la compilación ni la comprobación HTTP; no se probó envío de correo ni autenticación.

Rama de entrega: `codex/procuraduria-lote23`, con autor local `revdev08` y coautoría de Codex. Se integraron por avance rápido los tres commits nuevos de `origin/main`, hasta `c23b1bc`, antes de compilar. La comprobación remota posterior no encontró commits pendientes de integrar. La entrega se realiza en esa rama; no se actualiza `main`.

## Auditoría independiente antes de publicar en main (16 de octubre de 2026)

Una sesión distinta de la que redactó el lote revisó la rama antes de subirla:

- **Integridad:** 140 preguntas nuevas con ids seguidos (061–200), las 60 anteriores idénticas a las de main y lo publicado igual a los borradores. `yarn validate:questions` sin errores y `yarn build` correcto.
- **Citas:** se descargaron de nuevo las 25 fuentes oficiales (Cancillería, Función Pública y normograma de la PGN) y se contrastaron los 316 fragmentos:
  - 304 aparecen literales;
  - 5 solo difieren en el formato de la conversión a texto;
  - el del art. 277 de la Constitución aparece literal en la compilación del Senado;
  - los de la Ley 51 de 1983 siguen el texto correcto de la ley. La compilación de Cancillería tiene erratas: omite «seis de enero» en el art. 1 y escribe «Corpus Cristi».
- **Resolución a ciegas de una muestra:** 14 preguntas al azar (2 por archivo), resueltas por un agente nuevo con las fuentes. Las 14 coincidieron con la clave. Se corrigieron dos:
  - **TC-PGN-169:** admitía dos lecturas del inciso final del art. 228 del Decreto Ley 262 (si la excepción del numeral 1 alcanza también la hoja de vida o solo el momento de calificar). Se reescribió con los numerales 1 y 3, que no dejan dudas: traslado del calificador y licencia de más de 30 días.
  - **TC-PGN-094:** la consigna preguntaba qué «requisitos adicionales» incorporar cuando la respuesta es que no hace falta ninguno, y solo la clave usaba la palabra «minoría». Se neutralizó la consigna y se igualó la redacción de las opciones C y D.
- Las dos corregidas pasaron dos resoluciones ciegas más, cada una con un agente nuevo: coincidieron con confianza alta y sin alternativas defendibles. Los dos archivos siguen con 5 claves por letra y entre el 20 % y el 25 % de claves más largas.

**Lección:** una «trampa cercana» que el redactor descartó tras analizar la gramática (como el «salvo» del art. 228) merece otra mirada. Si dos lectores independientes llegan a lecturas distintas, la pregunta no mide la norma, mide la interpretación: hay que reescribirla con reglas inequívocas.

## Lecciones y límites

Se añadieron a [GUIA_REDACCION.md](../GUIA_REDACCION.md) las lecciones sobre revisar todas las señales del resolvedor, evitar operaciones triviales y decisiones repetidas, verificar índices automáticos de artículos y mantener consignas neutrales. Después de modificar una opción también debe recalcularse la longitud del archivo completo.

El verificador de tachados compara cadenas en toda una norma: «condenatoria» tachada en el artículo 101 de la Ley 906 produjo una colisión con la misma palabra vigente del artículo 102. Se contrastó el HTML y la nota C-250 de 2011, se mantuvieron los requisitos decisivos de 106 y se usó una omisión literal señalada; no se alteraron el verificador ni la lista de tachados. Un resultado automático no reemplaza la lectura del artículo.

Las rejillas simétricas no revelan por sí solas la clave, pero predominan en varios bloques y limitan su variedad estilística. Se diversificaron los formatos del bloque final. La revisión independiente fue realizada por IA: falta revisión jurídica humana y calibración empírica.

## Cobertura pendiente

Se localizaron el [manual oficial de funciones V10 de agosto de 2026](https://www.procuraduria.gov.co/Documents/2026/8.%20Agosto/Manual%20de%20Funciones_V10.pdf) y el [diccionario oficial de competencias comportamentales](https://www.procuraduria.gov.co/portal/media/docs/DICCIONARIO%20DE%20COMPETENCIAS%20COMPORTAMENTALES%205-JUL-12.pdf). El manual se utilizó para contrastar requisitos; no se creó el módulo comportamental porque el encargo exige autorización específica.

No se pretendió cubrir las funciones particulares de cada una de las 390 convocatorias, todos los cargos del manual, ni la totalidad del régimen salarial y prestacional. Tampoco se añadieron ejercicios generales de Word/Excel ya cubiertos por áreas transversales: j se concentra en herramientas y procedimientos propios de la PGN. Se excluyeron reglas inexequibles o condicionadas, instrucciones transitorias vencidas y decisiones duplicadas. La organización definitiva de la Universidad del Ministerio Público no se presume implementada durante la transición legal. La fecha exacta de prueba y la publicación efectiva de admitidos quedaron sin confirmación oficial en esta revisión.
