# Revisión a fondo de las preguntas de la DIAN (octubre de 2026)

Fecha: 19 de octubre de 2026. Un aspirante reportó preguntas mal formuladas en el concurso DIAN 2676. Se revisaron las **240 preguntas** del concurso:

| Archivo | Preguntas |
|---|---:|
| `tributario-dian.json` | 120 |
| `aduanero-dian.json` | 80 |
| `dian-institucional.json` | 40 |

La prueba escrita es el 8 de noviembre de 2026 y solo evalúa normas expedidas antes del 19 de junio de 2026.

**Resultado:**
- Ninguna clave estaba equivocada y no cambió ninguna letra de clave.
- El problema era de redacción. Se corrigieron **139 preguntas**: 73 de tributario, 42 de aduanas y 24 de la carrera DIAN.
- Al terminar, las 240 tienen resolución a ciegas coincidente y ninguna queda con dos respuestas defendibles.

## Método

Cada ronda tuvo revisores independientes. Recibían solo el enunciado y las opciones, sin clave ni explicaciones, y trabajaban con los textos oficiales: Estatuto Tributario (compilación del Senado al 30-sep-2026), Decreto 1165 de 2019, Decreto 1068 de 2015, Decreto Ley 927 de 2023, Decreto 1742 de 2020, Decreto 1083 de 2015, Resolución DIAN 227 de 2025, CPACA y Código General Disciplinario. Cada revisor resolvía la pregunta y además la criticaba como editor y jurista. Las fechas, plazos y montos los calculaba con node, con los festivos de la Ley 51 de 1983.

Después de cada ronda, otros agentes corrigieron los hallazgos con reglas fijas:
- no cambiar la letra de la clave;
- usar solo cargos y dependencias que existen en las normas;
- dar en el enunciado todas las premisas necesarias;
- quitar pistas de forma;
- dejar `texto_fuente` literal;
- subir `version`.

Antes de aplicar, un script verificó los campos intocables, la versión, las opciones y la explicación para IA. Las preguntas corregidas volvieron a resolverse a ciegas con revisores nuevos.

| Ronda | Preguntas | Coinciden con la clave | Grave | Media | Leve | Acierto estimado medio |
|---|---:|---:|---:|---:|---:|---:|
| 1 (todas) | 240 | 240 | 1 | 0 | 111 | 67,3 % |
| 2 (corregidas en la ronda 1) | 119 | 119 | 2 | 1 | 24 | 68,6 % |
| 3 (corregidas en la ronda 2) | 29 | 29 | 0 | 0 | 13 | 67,9 % |

Los leves de la tercera ronda son matices de estilo que no afectan la respuesta.

## Qué estaba mal

1. **Cargos que no existen en la DIAN.** Unas 30 preguntas ponían a un «técnico» o a un «auxiliar» de la DIAN, denominaciones que no existen en el concurso. Se usaron las del Acuerdo de la convocatoria, según la función del caso:
   - **Gestor** (nivel profesional): fiscaliza, decide y proyecta actos;
   - **Inspector** (nivel profesional): control y verificación en campo;
   - **Analista** (nivel técnico): apoyo y trámites;
   - **Facilitador** (nivel asistencial): atención al usuario.

   Cuando la decisión le corresponde al jefe o a otra autoridad, el caso ahora lo dice. Los «técnico» y «auxiliar» que quedan son personas de otras entidades, como el técnico de una ferretería o el auxiliar de una agencia de aduanas.
2. **Dependencias que no existen con ese nombre.** En 40 preguntas aparecían «División de Fiscalización» (28), «División de Recursos Jurídicos» (4) o grupos internos como «grupo de talento humano» (9).
   - Se cambiaron por los nombres del Decreto 1742 de 2020: División de Fiscalización y Liquidación Tributaria, División Jurídica, División de Recaudo y Cobranzas, División de Servicio al Ciudadano, División de Control Cambiario y Subdirección de Gestión del Empleo Público.
   - Cuando no había un nombre exacto, se describió el área: «el área de talento humano».
3. **Premisas incompletas o datos que no cuadraban.**
   - Festivos de los que dependía la respuesta (Semana Santa y festivos trasladados) y la forma de notificación cuando cambia el plazo.
   - Fechas que permitían dos lecturas, como «el último año» en TC-DGI-003.
   - Montos incoherentes: TC-TRI-008 omitía el aporte al Fondo de Solidaridad Pensional, TC-TRI-087 tenía salario y prestaciones que no cuadraban y TC-TRI-081 tenía cesantías desproporcionadas.
4. **Pistas de forma.** En 19 preguntas la clave era la única con una estructura distinta, la única condicionada o la combinación de otras dos opciones. Se rehicieron las opciones para que al menos dos compartan el veredicto o la estructura de la clave.
5. **Redacción.** Concordancia, tiempos verbales, sujetos ambiguos y consignas que no decían qué se debía decidir.

### Preguntas que tenían dos respuestas defendibles o una premisa imposible

- **TC-DGI-030.** El Decreto 1742 de 2020 (art. 80) y el Estatuto Tributario (arts. 560, 561 y 688) daban respuestas distintas sobre la delegación. Se reescribió con dos delegaciones en las que ambas normas coinciden: una función del Director General delegada en un director de gestión y una función de la seccional que requiere autorización previa.
- **TC-ADU-012.** El caso usaba la importación temporal para procesamiento industrial con una sociedad que no podía usarla. Desde el Decreto 360 de 2021, el art. 244 del Decreto 1165 la reserva a los OEA y a los usuarios con trámite simplificado. La modalidad de destino pasó a ser la de Sistemas Especiales de Importación-Exportación (art. 433, num. 3).
- **TC-TRI-115.** El art. 728 del ET dice «término de interposición» sin precisar cuál. Ahora el escrito llega tarde con cualquiera de las dos lecturas.
- **TC-TRI-118.** La solicitud de devolución activaba el mes adicional del art. 855, par. 3. Ahora se presenta más de dos meses después de la declaración, que se presentó en una fecha de vencimiento ordinaria.

## Controles finales

- `validate-questions.mjs`: estructura correcta.
- `verificar-fragmentos.mjs`: 850 fragmentos literales (418 de tributario, 317 de aduanas y 115 de la carrera DIAN).
  - Las 14 alertas de «texto tachado» en tributario son falsas. Lo confirmamos en el HTML del Senado: «o abonos en cuenta» solo está tachado en el art. 385 y «treinta y cinco por ciento» solo en el art. 401-2, y ninguna pregunta cita esos artículos.
  - El script compara contra todos los tachados de la norma, sin distinguir el artículo, y por eso marca esas frases.
- Reparto de claves: 30/30/30/30 en tributario, 20/20/20/20 en aduanas y 10/10/10/10 en la carrera DIAN.
- Clave como opción más larga: 8 %, 11 % y 15 %. Como opción más corta: 16 %, 21 % y 15 %. Antes, en aduanas, la clave era la más corta en el 31 % de las preguntas.
- Ningún par de enunciados casi duplicados. Ninguna pregunta cita artículos del ET modificados en 2026 ni normas posteriores al corte.
- Sanciones aduaneras: siguen fuera del banco de la DIAN 2676, porque la Ley 2586 de 2026, del 19 de junio, queda fuera del corte (ver `GUIA_REDACCION.md`).

En `revision` de las 240 preguntas quedó la fecha de esta revisión, el resultado a ciegas y el acierto estimado de la última ronda que vio cada pregunta. Se borraron dos notas que describían versiones anteriores, en TC-TRI-054 y TC-TRI-075.
