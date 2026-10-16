# Prompt: ampliar el banco del concurso de la Procuraduría 2026

**Para qué sirve:** es el encargo completo para que un agente de IA (por ejemplo, una sesión nueva de Claude Code abierta en la raíz de este proyecto) amplíe las preguntas del concurso de la Procuraduría con la misma calidad y el mismo proceso del resto del banco.

**Cómo usarlo:** copia todo lo que está debajo de la línea «Prompt» y pégalo como primer mensaje. El agente debe trabajar desde la raíz del proyecto (`simo/`).

Escrito el 16 de octubre de 2026. Los datos del concurso son de esa fecha: el agente debe volver a verificarlos.

---

## Prompt

Eres el responsable de ampliar el banco de preguntas de SIMO Test para el **concurso de méritos de la Procuraduría General de la Nación 2026**. SIMO Test es una plataforma colombiana de preparación para pruebas de mérito. Escribe todo en español de Colombia.

### 1. Objetivo

- Hoy hay **60 preguntas** propias del concurso en `data/preguntas/procuraduria.json` (ids `TC-PGN-001` a `TC-PGN-060`, módulo «Procuraduría General de la Nación»).
- La meta es llegar a unas **200**: escribe **140 preguntas nuevas** (`TC-PGN-061` a `TC-PGN-200`) en **7 archivos de 20**.
- Ve por olas: primero 2 o 3 archivos completos con todo el proceso (sección 6); con lo aprendido, el resto.
- La calidad manda sobre la cantidad. Es preferible entregar 100 preguntas limpias que 140 con errores. Si una pregunta no supera el proceso, se descarta.

### 2. El concurso (verificado el 16 de octubre de 2026; vuelve a comprobarlo)

- Es un concurso **propio de la Procuraduría**, no de la CNSC. Sigue su sistema especial de carrera (Decretos Ley 262 y 263 de 2000), y lo opera la **Universidad de Antioquia**.
- Ofrece **2.826 vacantes** (Resolución 076 de 2026) en los niveles asesor, ejecutivo, profesional, técnico, administrativo y operativo.
- Las inscripciones fueron del 7 al 18 de septiembre de 2026 y se inscribieron unas 272.500 personas.
- Sigue la publicación de admitidos y no admitidos. Según El Tiempo (9 de septiembre), la Procuraduría estima la prueba escrita para **mayo de 2027**; aún no hay fecha oficial.
- **Pesos reportados por la prensa** (confírmalos en la resolución oficial):
  - asesor, ejecutivo y profesional: conocimientos 70 % (eliminatoria, mínimo 65), comportamentales 20 % y antecedentes 10 %;
  - técnico, administrativo y operativo: 60 / 20 / 20.
- **Conocimientos esenciales comunes de cada empleo, según la convocatoria:** ofimática, atención al usuario, documentos de oficina, estructura y funciones de la Procuraduría, sistemas de gestión, gestión documental y gestión pública.
- En la app, el plan está en `lib/convocatorias/catalogo.ts` (slug `procuraduria-2026`), con dos perfiles y los pesos de cada módulo. No cambies el catálogo sin preguntar.

### 3. Lee esto primero, completo y en este orden

1. `docs/banco/GUIA_REDACCION.md`: reglas, formato v2, proceso de producción y lista de chequeo. **Todas sus reglas aplican.** Fíjate sobre todo en:
   - «No regalar la respuesta»;
   - la longitud pareja de las opciones (la clave es la más larga solo en el 20 al 30 % de los ítems);
   - «La persona que objeta en el caso no puede estar siempre equivocada»;
   - las secciones sobre texto tachado, notas de vigencia y compilaciones equivocadas.
2. Las 60 preguntas que ya existen: `node scripts/banco/listar-modulo.mjs "Procuraduría General de la Nación"`. Son tu modelo de calidad (mira TC-PGN-001, TC-PGN-041 y TC-PGN-055 completas en el JSON) y **no puedes repetir sus decisiones**.
3. Los borradores anteriores del módulo y su informe: `docs/banco/lote16/pgn_a.json`, `pgn_b.json`, `docs/banco/lote18/pgn_c.json` y `docs/banco/lote16/RESULTADOS.md`.
4. Dos informes de lote como ejemplo del entregable final: `docs/banco/lote20/RESULTADOS.md` y `docs/banco/lote22/RESULTADOS.md`.
5. Para no chocar con otros módulos, revisa qué ya cubren `data/preguntas/disciplinario-anticorrupcion.json`, `procedimiento-administrativo.json` y `atencion-ciudadano.json`. Usa `node scripts/banco/listar-modulo.mjs "<módulo>"`.

### 4. Fuentes

**Regla de oro:** toda clave se apoya en un fragmento **literal del texto vigente**, copiado en `texto_fuente`. Si no está en la fuente, no lo uses. No escribas de memoria.

**Descarga las fuentes en tu carpeta temporal (scratchpad), nunca en el repositorio.** Las compilaciones del Senado dicen «Derechos de autor reservados» y el repositorio es público.

Fuentes principales (compilaciones de la Secretaría del Senado: `http://www.secretariasenado.gov.co/senado/basedoc/<archivo>.html`):

| Norma | Archivo | Para qué |
|---|---|---|
| Decreto Ley 262 de 2000 | `decreto_0262_2000` | Estructura, funciones de cada dependencia, competencias disciplinarias por nivel, carrera y régimen de personal de la PGN. Muy modificado (por ejemplo, por el Decreto Ley 1851 de 2021): usa siempre el texto vigente y cita la norma modificadora. |
| Decreto Ley 263 de 2000 | `decreto_0263_2000` | Nomenclatura y clasificación de empleos de la PGN. |
| Constitución Política | `constitucion_politica_1991` | Arts. 118, 275 a 284 (Ministerio Público y funciones del Procurador). |
| Ley 1952 de 2019 (Código General Disciplinario, reformado por la Ley 2094 de 2021) | `ley_1952_2019` | Poder preferente, competencias, etapas, recursos, notificaciones, doble conformidad. |
| Ley 2220 de 2022 | `ley_2220_2022` | Conciliación extrajudicial en lo contencioso administrativo ante agentes del Ministerio Público. |
| Ley 1437 de 2011 y Ley 1755 de 2015 | `ley_1437_2011`, `ley_1755_2015` | Ministerio Público en el procedimiento administrativo y en lo contencioso (art. 303), derecho de petición y deberes especiales de la PGN. |
| Ley 906 de 2004 | `ley_0906_2004` | Ministerio Público en el proceso penal (arts. 109 a 111). |
| Ley 1098 de 2006 | `ley_1098_2006` | Intervención en asuntos de infancia y familia. |
| Ley 1448 de 2011 | `ley_1448_2011` | Ministerio Público en atención a víctimas y restitución de tierras. |

Documentos oficiales de la Procuraduría (procuraduria.gov.co):
- Convocatorias del concurso: https://www.procuraduria.gov.co/Documents/2026/5.%20Mayo/CONVOCATORIAS.pdf
- Resolución 076 de 2026 (reglas del concurso) y Resolución 133 de 2026 (cambio de fechas y prueba de ejecución). Búscalas en el sitio oficial.
- Diccionario de competencias comportamentales y manual de funciones de la PGN: úsalos **solo si encuentras el documento oficial**.

**Cómo preparar cada fuente:**
1. Descarga el HTML y pásalo a `.txt` en tu scratchpad. Conserva la línea «Última actualización».
2. Extrae lo **tachado** (etiquetas `<s>`, `<strike>` y `<S>`: es lo declarado inexequible) a `<norma>.tachados.txt`, un segmento por línea, junto al `.txt`. Al pasar a texto plano, lo tachado se ve como texto normal.
3. Lee las **notas de vigencia** del Senado (`basedoc/js/<norma>.js`) de cada artículo que cites. Si un artículo dice «modificado… El nuevo texto es el siguiente», usa el nuevo texto y cita la norma modificadora en `articulos`. Ignora la «Legislación Anterior».
4. No construyas claves sobre texto INEXEQUIBLE ni sobre la parte condicionada de lo CONDICIONALMENTE exequible.

### 5. Qué escribir (propuesta de cobertura)

Antes de escribir, haz un mapa con lo que ya existe (sección 3) y guárdalo en `docs/banco/lote23/PLAN.md`: tema, subtema, artículo y archivo de cada pregunta planeada. Esta es la propuesta, que puedes ajustar si el mapa muestra huecos distintos:

| Archivo | Ids | Tema | Fuente principal |
|---|---|---|---|
| `pgn_d.json` | TC-PGN-061 a 080 | Estructura y funciones: Procurador, Viceprocurador, Secretaría General, procuradurías delegadas, regionales y provinciales, Instituto de Estudios del Ministerio Público | DL 262 de 2000 |
| `pgn_e.json` | TC-PGN-081 a 100 | Función preventiva y de control de gestión, vigilancia superior y protección de los derechos humanos (lo que no cubrieron los lotes 16 y 18) | DL 262; Constitución, art. 277 |
| `pgn_f.json` | TC-PGN-101 a 120 | Intervención judicial: Ministerio Público en el proceso penal, en lo contencioso administrativo, en familia e infancia y en restitución de tierras | Leyes 906, 1437, 1098 y 1448 |
| `pgn_g.json` | TC-PGN-121 a 140 | Conciliación extrajudicial ante la Procuraduría: requisitos, trámite, actas, aprobación judicial (sin repetir las 6 que ya hay) | Ley 2220 de 2022 |
| `pgn_h.json` | TC-PGN-141 a 160 | Régimen disciplinario aplicado por la PGN: poder preferente, competencias por nivel, etapas, recursos (sin repetir lo existente) | Ley 1952; DL 262 |
| `pgn_i.json` | TC-PGN-161 a 180 | Carrera y régimen de personal de la PGN: concurso, listas, período de prueba, calificación, situaciones administrativas, retiro; nomenclatura de empleos | DL 262 (carrera); DL 263 |
| `pgn_j.json` | TC-PGN-181 a 200 | Conocimientos esenciales en la PGN: atención al usuario y peticiones ante la Procuraduría, documentos de oficina, sistemas de gestión y gestión documental de la entidad | CPACA; documentos oficiales de la PGN |

- **Competencias comportamentales propias de la PGN:** solo si encuentras su diccionario oficial. Van en un módulo aparte, con el formato de comportamentales de la guía (sección 6) y capa 2. Pregunta antes de crear el módulo.
- **Nivel:** la mitad de cada archivo con `["asistencial","tecnico"]` (casos de técnico, administrativo u operativo) y la otra mitad con `["profesional","asesor"]` (profesional, asesor o ejecutivo), como en los lotes anteriores.
- **Campos fijos de cada pregunta:**
  - `version`: 1
  - `estado`: `"beta"`
  - `capa`: 4
  - `eje`: `"procuraduria"`
  - `modulo`: `"Procuraduría General de la Nación"`
  - `autor`: `"IA"`
  - `revision`: `{"resolucion_ciega": null, "revisor_humano": null, "fecha": "<AAAA-MM-DD de hoy>"}`
  - `fuente_url`: la página oficial de la norma.
  - Los demás campos, como en TC-PGN-041.

### 6. Proceso por archivo (obligatorio, en este orden)

Trabaja en `docs/banco/lote23/`. Puedes repartir la redacción entre subagentes en paralelo (uno por archivo), pero **la resolución a ciegas siempre la hace otro agente**, que no haya visto las claves.

1. **Redacción.** 20 preguntas por archivo, siguiendo la guía. Cada redactor:
   - corre `node scripts/banco/listar-modulo.mjs "Procuraduría General de la Nación"` y no repite decisiones ya publicadas;
   - lee completa la parte pertinente de la norma antes de escribir;
   - hace al menos 8 de 20 (40 %) combinando dos reglas o con un cálculo de plazos o fechas;
   - hace los cálculos de fechas con node, con los festivos de Colombia y el art. 62 de la Ley 4 de 1913 para plazos que vencen en día no hábil;
   - reparte las claves en 5 A, 5 B, 5 C y 5 D.
2. **Comprobaciones automáticas.** Las dos deben quedar en cero errores:
   - `node scripts/banco/verificar-fragmentos.mjs <carpeta_de_fuentes> docs/banco/lote23/<archivo>.json`: cada fragmento literal en su fuente y ninguno tachado.
   - `node scripts/validate-questions.mjs docs/banco/lote23/<archivo>.json`: estructura y sesgos. Revisa también las advertencias.
3. **Resolución a ciegas.**
   - `node scripts/banco/blind.mjs strip <scratchpad>/ciego/l23_<archivo>.json docs/banco/lote23/<archivo>.json` quita claves y explicaciones.
   - Un subagente nuevo resuelve ese archivo con acceso a las fuentes .txt (la ley y también su reglamento) y escribe `<scratchpad>/ciego/resp_l23_<archivo>.json` (plantilla en la sección 8).
   - `node scripts/banco/blind.mjs compare <resp> docs/banco/lote23/<archivo>.json` lista lo que hay que revisar.
4. **Corrección.**
   - Corrige todo lo marcado: respuesta distinta, otra opción defendible, pista o dádiva, confianza baja, o `p_estimado` mayor de 90 (trivial). Si la pregunta no tiene arreglo, descártala.
   - Cada pregunta corregida pasa a `version: 2`.
   - Vuelve a correr las comprobaciones del paso 2.
5. **Segunda resolución a ciegas.**
   - `node scripts/banco/strip-cambiadas.mjs <scratchpad>/ciego/l23_v2_<archivo>.json docs/banco/lote23/<archivo>.json`.
   - Resuélvelo con **otro** subagente nuevo y repite hasta que todo quede limpio.
   - Si después de revisarla decides conservar una «trampa cercana» porque la clave es inequívoca, anótalo en la respuesta del resolvedor con `"revisada": true` y `"nota_revision"`.
6. **Publicación.**
   - Crea `<scratchpad>/merge_l23.json`:
     ```json
     { "respuestas": ["<resp v1>", "<resp v2>"], "destinos": { "procuraduria.json": ["docs/banco/lote23/pgn_d.json"] }, "dryRun": true }
     ```
     Las respuestas van en orden: las posteriores reemplazan a las anteriores por id.
   - Corre `node scripts/banco/merge-lote.mjs <config>`. Si el ensayo (`dryRun: true`) no reporta problemas, cambia a `false` y vuelve a correrlo. El script agrega las preguntas a `data/preguntas/procuraduria.json` (que `lib/questions.ts` ya carga) y anota la resolución a ciegas en cada una.
   - Valida todo el banco con `yarn validate:questions`.
7. **Informe.**
   - Escribe `docs/banco/lote23/RESULTADOS.md` como el del lote 22: qué se publicó, la tabla de resolución a ciegas por archivo, las correcciones y las lecciones.
   - Si una lección sirve para cualquier módulo, agrégala también a `GUIA_REDACCION.md`.

### 7. Reglas de calidad que más fallan (aprendidas en los lotes anteriores)

- **La clave no repite palabras del enunciado ni de la norma**, y ningún distractor confirma un dato de la clave.
- **La forma no delata la clave:** no puede ser la más larga, la única matizada o la única «completa», ni contener otra opción más un extra.
- **Las «rejillas» tienen que ser parejas.** Cuando las opciones combinan dos elementos (órgano y plazo, por ejemplo), cada elemento aparece en el mismo número de opciones, y la clave no es la que reúne los más repetidos.
- **Quien objeta en el caso a veces tiene razón.** Si el que objeta siempre se equivoca, el ítem se responde yendo en su contra.
- **La opción más protectora o conciliadora no gana siempre.** Al menos dos distractores fallan en un punto concreto: la dependencia competente, el orden de los pasos, el plazo o el nivel del cargo.
- **El caso tiene la premisa completa:** el cargo, la dependencia, la etapa del proceso y los datos que la regla necesita, sin regalar la respuesta.
- **Nada de opciones absurdas, ni de «todas las anteriores» o «ninguna de las anteriores».**
- **Las cifras cuadran.** Plazos en días hábiles con festivos, y porcentajes que salen de números enteros.
- **Cada opción tiene su explicación.** Las incorrectas dicen qué error representan, y la explicación general sigue el esquema dato decisivo, regla y conclusión.

### 8. Plantilla para el subagente que resuelve a ciegas

> Resuelve a ciegas las preguntas de `<archivo sin clave>`. Son de selección múltiple para el concurso de la Procuraduría General de la Nación (Colombia). No abras ningún archivo de `docs/banco` ni de `data/preguntas`, porque ahí están las claves. Tienes las normas en `<carpeta de fuentes>`: léelas para resolver. Haz con node todos los cálculos de fechas y plazos.
>
> Para cada pregunta, elige una sola respuesta y revisa con cuidado:
> - si otra opción también es defendible según el texto vigente;
> - si la premisa del caso tiene huecos;
> - si alguna pista de forma delata la clave: longitud, una sola opción distinta, palabras repetidas del enunciado.
>
> Escribe en `<archivo de salida>` un arreglo JSON con un objeto por pregunta:
> `{"id": "...", "respuesta": "A|B|C|D", "confianza": "alta|media|baja", "otras_defendibles": [], "pista": "texto o vacío", "p_estimado": 0-100, "razon": "explicación breve con el artículo"}`
>
> `p_estimado` es el porcentaje de aspirantes preparados que acertarían. Verifica que el archivo sea JSON válido. En tu respuesta final, da las letras y los problemas que encontraste.

### 9. Git y entrega

- **Rama y commits:**
  - Trabaja en una rama (por ejemplo, `banco/procuraduria-lote23`).
  - Los commits salen como `revdev08`, que ya es la configuración local del repositorio. No toques la configuración global de git.
  - Termina cada mensaje de commit con la línea `Co-Authored-By` que indique tu sesión.
- **No subas:**
  - `REVISION_MEJORAS.md`;
  - las fuentes descargadas ni los PDF de `docs/banco`;
  - nada del scratchpad;
  - nada de `app/dev-preview`.
- **Antes de subir:**
  1. `git fetch`; revisa `git rev-list --count HEAD..origin/main`. Otras personas suben directo a main; si hay commits nuevos, intégralos y resuelve los conflictos.
  2. Si el servidor de desarrollo está corriendo, detenlo. Corre `yarn build`, luego borra `.next` y vuelve a levantar el servidor.
  3. Sube tu rama.
- **No subas a main sin que el dueño lo apruebe.**
- **Al terminar, entrega un resumen en español con:**
  - cuántas preguntas se publicaron, por archivo y por tema;
  - el resultado de cada resolución a ciegas y qué se corrigió;
  - el reparto de claves y de dificultad;
  - los temas que quedaron sin cubrir y por qué (por ejemplo, documentos oficiales que no encontraste);
  - el enlace al informe `docs/banco/lote23/RESULTADOS.md`.
