# Prompt: página especializada y banco de preguntas del concurso docente

**Para qué sirve:** es el encargo completo para que un agente de IA haga dos cosas con la calidad del resto del proyecto:
1. una **página aparte, especializada en el concurso docente**;
2. la **ampliación del banco de preguntas docentes**, investigando la normativa y los referentes oficiales y revisando las preguntas con el proceso de resolución a ciegas.

Sirve, por ejemplo, una sesión nueva de Claude Code abierta en la raíz de este proyecto.

**Cómo usarlo:** copia todo lo que está debajo de la línea «Prompt» y pégalo como primer mensaje. El agente debe trabajar desde la raíz del proyecto (`simo/`).

Escrito el 19 de octubre de 2026. Los datos del concurso son de esa fecha y el agente debe volver a verificarlos.

---

## Prompt

Eres responsable de dos encargos para el **concurso docente 2026 de la CNSC** (docentes y directivos docentes de las entidades territoriales certificadas en educación):
1. una **página aparte, especializada en el concurso docente**;
2. la **ampliación del banco de preguntas docentes**.

SIMO Test es una plataforma colombiana de preparación para pruebas de mérito. Escribe todo en español de Colombia.

### 1. Objetivo

- **Parte A, la página especializada.** Una página de aterrizaje propia para aspirantes docentes, en `/docentes`. Le habla solo al docente (nada de DIAN ni de Procuraduría), lo lleva a su cargo o área, le deja probar un simulacro docente gratuito y lo invita a los planes. Es la página que se comparte en redes y anuncios dirigidos a docentes.
  - Si el dueño pidió otra cosa (un dominio aparte, por ejemplo), pregunta antes de empezar. Un dominio aparte toca la autenticación y los pagos, y eso no se hace sin su aprobación.
- **Parte B, el banco.** Hoy hay unas **1.020 preguntas docentes** (sección 3). La meta es cubrir mejor los cargos con más vacantes y los temas comunes, con unas **300 preguntas nuevas** en archivos de 20 (sección 7).
  - Ve por olas: primero 3 o 4 archivos completos con todo el proceso (sección 8); con lo aprendido, el resto.
  - La calidad manda sobre la cantidad. Es preferible entregar 160 preguntas limpias que 300 con errores. Si una pregunta no supera el proceso, se descarta.

### 2. El concurso (verificado el 19 de octubre de 2026; vuelve a comprobarlo)

- La CNSC publicó el **19 de agosto de 2026** los **proyectos de acuerdo** (90, uno por entidad territorial certificada) y la **OPEC preliminar**. Suman **28.001 vacantes**:

  | Cargo o área | Vacantes |
  |---|---:|
  | Primaria | 8.059 |
  | Preescolar | 3.723 |
  | Matemáticas | 1.945 |
  | Docente orientador | 1.892 |
  | Inglés | 1.798 |
  | Ciencias sociales | 1.499 |
  | Lengua castellana | 1.316 |
  | Ciencias naturales | 1.236 (más química 780 y física 332) |
  | Tecnología e informática | 1.091 |
  | Coordinador | 1.074 |
  | Educación física | 783 |
  | Artística (música, danzas, plásticas y escénicas) | 1.283 |
  | Rector | 618 |
  | Religión | 180 |
  | Filosofía | 149 |
  | Ética | 130 |
  | Ciencias económicas y políticas | 71 |
  | Director rural | 42 |

- **Fechas:** según la prensa, inscripciones de diciembre de 2026 a febrero de 2027 y pruebas en el segundo semestre de 2027. Aún no son oficiales. Busca si ya salieron los **acuerdos en firme**, la **guía de orientación al aspirante** y el **anexo técnico definitivo**.
- **Pruebas (pesos de los proyectos de acuerdo):**
  - **Docentes:** aptitudes y competencias básicas 55 % (eliminatoria, mínimo 60), psicotécnica 5 %, valoración de antecedentes 30 % y entrevista 10 %.
  - **Directivos:** 55 % (mínimo 70), 10 %, 25 % y 10 %.
- **La prueba eliminatoria tiene cuatro componentes**, según el proyecto de anexo técnico 2026 (numeral 2.1):
  1. lectura crítica;
  2. razonamiento cuantitativo;
  3. competencias blandas (liderazgo, ética, trabajo en equipo y ciudadanía);
  4. saber disciplinar y pedagógico del cargo.

  La CNSC aún no publica cuántas preguntas trae cada componente.
- **Precedentes:** en 2016 la prueba tuvo 170 preguntas en cinco horas y media. En 2022 fueron casos con tres opciones de respuesta. El banco usa cuatro opciones: no cambies eso sin que el dueño lo decida.
- **En la app:**
  - el plan está en `lib/convocatorias/catalogo.ts` (slug `docentes-2026`), con un perfil por cargo;
  - las páginas públicas actuales están en `app/concurso-docente/` (con una página por área), y sus datos en `lib/concurso-docente.ts`.

  Si los datos oficiales cambiaron, actualiza esos dos archivos y la fecha `REVISADO_DOCENTE`, citando la fuente.

### 3. Lee esto primero, completo y en este orden

1. `AGENTS.md`: esta versión de Next.js (16) tiene cambios incompatibles con lo que conoces. Antes de escribir código, lee la guía pertinente en `node_modules/next/dist/docs/`.
2. `docs/banco/GUIA_REDACCION.md`: reglas, formato v2, proceso de producción y lista de chequeo. **Todas sus reglas aplican.** Fíjate en especial en:
   - «Ítems didácticos (docentes)»: al menos dos distractores deben ser intervenciones activas y razonables que fallan en un punto concreto;
   - la excepción del `texto_fuente` en el saber disciplinar;
   - «No regalar la respuesta» y la longitud pareja de las opciones.
3. Los informes de los lotes docentes: `docs/banco/lote20/RESULTADOS.md` (concurso docente completo) y `docs/banco/lote22/RESULTADOS.md` (lectura crítica y razonamiento cuantitativo docente). Contienen la investigación del concurso y las lecciones aprendidas.
4. El banco docente actual. Mira cada módulo con `node scripts/banco/listar-modulo.mjs "<módulo>"` y **no repitas sus decisiones**.

   | Archivo | Módulo | Preguntas | Prefijo |
   |---|---|---:|---|
   | `data/preguntas/docentes.json` | Pedagogía y Normativa Docente | 160 | TC-DOC- |
   | `data/preguntas/docentes-disciplinar.json` | Saber Disciplinar: Primaria | 80 | TC-PRI- |
   | | Saber Disciplinar: Matemáticas | 80 | TC-MAT- |
   | | Saber Disciplinar: Lenguaje | 80 | TC-LEN- |
   | | Saber Disciplinar: Ciencias Naturales | 80 | TC-CNA- |
   | | Saber Disciplinar: Ciencias Sociales | 60 | TC-CSO- |
   | | Saber Disciplinar: Inglés | 40 | TC-ING- |
   | | Saber Disciplinar: Preescolar | 40 | TC-PSC- |
   | | Saber Disciplinar: Tecnología e Informática | 20 | TC-TEC- |
   | | Saber Disciplinar: Educación Artística | 20 | TC-ART- |
   | | Saber Disciplinar: Educación Física | 20 | TC-EFI- |
   | | Saber Disciplinar: Filosofía y Ética | 20 | TC-FIL- |
   | `data/preguntas/aptitudes-docente.json` | Lectura Crítica (Prueba Docente) | 80 | TC-LCD- |
   | | Razonamiento Cuantitativo (Prueba Docente) | 80 | TC-RCD- |
   | `data/preguntas/competencias-blandas-docente.json` | Competencias Blandas del Docente | 40 | TC-CBD- |
   | `data/preguntas/directivos-docentes.json` | Gestión Escolar (Directivos Docentes) | 80 | TC-DIR- |
   | `data/preguntas/orientacion-escolar.json` | Orientación Escolar | 40 | TC-ORI- |

5. El código de la sección docente actual:
   - `app/concurso-docente/page.tsx`, `app/concurso-docente/[area]/page.tsx` y `componentes.ts`;
   - `lib/concurso-docente.ts`;
   - `app/simulacro-gratis/` (el simulacro gratuito general);
   - `components/public/PublicHeader.tsx`;
   - `lib/seo.ts`.

   Toma esa sección como modelo de estilo y de datos.

### 4. Parte A: la página especializada `/docentes`

Antes de programar, presenta al dueño un plan corto y espera su visto bueno: las secciones, qué reutilizas y qué es nuevo.

**Qué debe tener** (ajústalo si la investigación lo justifica):
1. **Portada propia para docentes.** Un título claro sobre el concurso docente 2026: las 28.001 vacantes, el estado y las fechas (verificadas, con la fecha de revisión) y dos llamados: «Haz el simulacro docente gratis» y «Ver planes».
2. **«¿A qué cargo te presentas?»** Tarjetas por cargo o área, con sus vacantes, que llevan a la página del área (`/concurso-docente/<área>`) o, si crea una mejor experiencia, a una versión dentro de `/docentes`. No dupliques contenido que ya posiciona en buscadores: si dos páginas dicen lo mismo, enlaza y usa `canonical`.
3. **Qué evalúa la prueba:** los cuatro componentes, los pesos, los puntajes mínimos y la diferencia entre docentes y directivos, con preguntas de ejemplo por componente (hay una función `getPublicExamples` en `lib/questions.ts`).
4. **Simulacro docente gratuito.** Una prueba corta (por ejemplo, 10 a 15 preguntas) con los cuatro componentes, resultado por componente e invitación al plan.
   - Reutiliza la lógica de `app/simulacro-gratis/` en vez de reescribirla.
   - No expongas preguntas del banco pago más allá de la muestra.
5. **Cómo se prepara con SIMO Test:**
   - el plan por cargo (de `catalogo.ts`);
   - cuántas preguntas hay por módulo, calculado en vivo con `getModuleCounts`, nunca escrito a mano;
   - qué cubrimos y qué no todavía, con honestidad.
6. **Calendario y fuentes oficiales**, con enlaces a la CNSC y al MEN.
7. **Preguntas frecuentes**, con `faqJsonLd`.

**Reglas técnicas y de producto:**
- **No toques el checkout, los precios ni los planes** (`app/api/checkout`, `lib/mercadopago.ts`, la sección de precios del inicio). Los llamados llevan a `/#planes` o al flujo existente.
- Nada de testimonios inventados, cifras sin fuente ni promesas de resultados.
- **SEO:** `pageMetadata` de `lib/seo.ts`, imagen Open Graph propia (como `app/concurso-docente/opengraph-image.tsx`), la ruta en `app/sitemap.ts` y JSON-LD de migas y de preguntas frecuentes.
- **Diseño:**
  - el de las páginas públicas (`PublicHeader` y `PublicFooter`, Tailwind 4, modo oscuro);
  - primero celular, sin desplazamiento horizontal a 375 px;
  - accesible: contraste, etiquetas, foco visible y encabezados en orden.
- Si agregas `/docentes` al menú, hazlo en `PublicHeader` sin romper las demás entradas.
- **Verificación:**
  1. levanta la vista previa (`.claude/launch.json`, `simo-dev`) y revisa la consola y los registros;
  2. prueba el simulacro de punta a punta;
  3. revisa en celular y en modo oscuro, y toma una captura;
  4. corre `yarn lint` sobre los archivos que tocaste y `npx tsc --noEmit`.

**Extensión opcional (solo si los datos son públicos):** «Busca tu vacante», por entidad territorial y área, a partir de la OPEC del concurso, como se hizo para la DIAN con `scripts/opec/` y `/mi-convocatoria/dian-2676/opec/<número>`.
- Verifica primero si SIMO publica la oferta docente sin iniciar sesión.
- No guardes datos de inscripciones de otras personas.
- Pregunta antes de construirlo.

### 5. Investigación y fuentes (Parte B)

**Regla de oro:** toda clave se apoya en un fragmento **literal** del texto vigente, copiado en `texto_fuente`. En el saber disciplinar, el `texto_fuente` es el referente del MEN (estándar, DBA u orientación), y la regla del área (matemática, ortográfica, científica) se enuncia con precisión en la explicación. No escribas de memoria lo que dice una norma.

**Descarga las fuentes en tu carpeta temporal (scratchpad), nunca en el repositorio.** El repositorio es público y las compilaciones del Senado tienen derechos reservados. En el scratchpad de sesiones anteriores puede haber copias (`men_*.txt`, `ley_0115_1994.txt`, `decreto_1278_2002.txt`, `cnsc_anexo_tecnico_docentes_2026.txt`…), pero vuelve a descargar lo que necesites de la fuente oficial.

| Fuente | Dónde | Para qué |
|---|---|---|
| Proyectos de acuerdo, anexo técnico y OPEC del concurso | cnsc.gov.co (convocatoria docentes 2026) | Reglas, pruebas, pesos, componentes y vacantes |
| Ley 115 de 1994 | Senado: `ley_0115_1994` | Fines, niveles, áreas obligatorias, PEI, gobierno escolar |
| Decreto Ley 1278 de 2002 | Senado: `decreto_1278_2002` | Estatuto de profesionalización: ingreso, período de prueba, evaluación, ascenso, retiro |
| Decreto 1075 de 2015 (Único Reglamentario del Sector Educación) | Senado o MEN | Compila evaluación de estudiantes (antes Decreto 1290 de 2009), educación inclusiva y PIAR (antes Decreto 1421 de 2017), concursos y período de prueba, jornada, preescolar |
| Resolución 3842 de 2022 (MEN) | mineducacion.gov.co | Manual de funciones, requisitos y competencias de docentes y directivos |
| Ley 1620 de 2013 y su reglamento | Senado y MEN (Guía 49) | Convivencia escolar, comités, ruta de atención integral |
| Ley 1098 de 2006 | Senado: `ley_1098_2006` | Infancia y adolescencia en la escuela |
| Ley 2025 de 2020 | Senado | Escuelas de padres y madres de familia y cuidadores |
| Estándares Básicos de Competencias (Guía 7, 2006), DBA, Lineamientos curriculares, Bases curriculares de educación inicial y preescolar (2017), Orientaciones pedagógicas (Documentos 14, 15 y 16), Guías 22, 30, 31, 34 y 49, Programa Nacional de Orientación Escolar | mineducacion.gov.co y colombiaaprende.edu.co | Saber disciplinar y pedagógico de cada área y cargo |
| Guía de orientación del concurso 2016 (ICFES) y la del concurso actual, cuando salga | icfes.gov.co y cnsc.gov.co | Formato y tipos de ítems |

**Cómo preparar cada fuente:**
1. Pasa el HTML o el PDF a `.txt` en tu scratchpad. Conserva la fecha de actualización.
2. En las compilaciones del Senado, extrae lo **tachado** (etiquetas `<s>`, `<strike>` y `<S>`: lo declarado inexequible) a `<norma>.tachados.txt`, un segmento por línea.
3. Lee las **notas de vigencia** de cada artículo que cites. Si uno fue modificado, usa el texto nuevo y cita la norma modificadora en `articulos`.
4. No construyas claves sobre texto inexequible, derogado ni sobre la parte condicionada de lo condicionalmente exequible.
5. De los documentos del MEN, usa la versión vigente. Por ejemplo, los DBA tienen versión 2 en varias áreas. Cita el documento y la página.

### 6. Calidad propia de las preguntas docentes

Todas las reglas de la guía aplican. Estas son las que más se han corregido en los lotes docentes:
- **Casos de aula reales.** Grado, edad, contexto (urbano, rural, multigrado, étnico o con estudiantes con discapacidad) y una decisión pedagógica concreta. Nada de definiciones de memoria.
- **Distractores didácticos activos.** Al menos dos distractores son intervenciones razonables que fallan en un punto concreto: no corresponden al grado, confunden evaluación formativa con sumativa, desconocen el PIAR o el debido proceso de la convivencia. Si solo la clave es «activa», la pregunta se adivina sin saber del área.
- **La opción más protectora o la más «moderna» no gana siempre.** La clave se sostiene en el referente, no en el tono.
- **El que objeta en el caso a veces tiene razón.**
- **Normativa con el texto vigente y las competencias del cargo correcto.** Docente, docente orientador, coordinador, rector o director rural, cada uno con sus funciones según la Resolución 3842 de 2022. Lo que decide el consejo directivo, el comité de convivencia o la entidad territorial lo decide ese órgano.
- **Plazos y fechas calculados con node**, con los festivos de Colombia y el calendario escolar si importa.
- **Lenguaje respetuoso e incluyente.** Sin estereotipos de género, étnicos ni sobre discapacidad. Los nombres del caso, variados.
- **Cuatro opciones, claves repartidas 5 A, 5 B, 5 C y 5 D por archivo.** La clave es la opción más larga en 4 a 6 preguntas y la más corta como máximo en 5.
- **Explicaciones:** cada opción tiene la suya; las incorrectas dicen qué error representan. La `explicacionIA` sigue el esquema «Dato decisivo… Regla… Conclusión…».

### 7. Qué escribir (propuesta de cobertura)

Antes de escribir, haz un mapa de lo que ya existe (sección 3) y guárdalo en `docs/banco/lote<N>/PLAN.md`. Usa el siguiente número de lote libre en `docs/banco/`; el último usado es el 24. El mapa trae el tema, el subtema, la fuente y el archivo de cada pregunta planeada.

La propuesta prioriza las vacantes por pregunta; ajústala si el mapa muestra otros huecos:

| Archivo | Ids | Módulo | Por qué | Enfoque |
|---|---|---|---|---|
| `pri_e.json`, `pri_f.json` | TC-PRI-081 a 120 | Saber Disciplinar: Primaria | 8.059 vacantes y solo 80 preguntas | Lectura y escritura inicial, matemáticas de 1.° a 5.°, ciencias y sociales de primaria, Escuela Nueva y aula multigrado |
| `psc_c.json`, `psc_d.json` | TC-PSC-041 a 080 | Saber Disciplinar: Preescolar | 3.723 vacantes y 40 preguntas | Bases curriculares 2017, juego, arte, literatura y exploración del medio, transición, valoración del desarrollo |
| `doc_i.json`, `doc_j.json` | TC-DOC-161 a 200 | Pedagogía y Normativa Docente | Es común a todos los cargos | Lo que el mapa muestre sin cubrir: evaluación y SIEE, inclusión y PIAR, Ley 1620 y su ruta, Estatuto 1278 (período de prueba y evaluación de desempeño), Resolución 3842 y escuelas de familias |
| `ori_c.json`, `ori_d.json` | TC-ORI-041 a 080 | Orientación Escolar | 1.892 vacantes y 40 preguntas | Ruta de atención integral, salud mental y prevención, Programa Nacional de Orientación Escolar, proyecto de vida, trabajo con familias |
| `ing_c.json`, `ing_d.json` | TC-ING-041 a 080 | Saber Disciplinar: Inglés | 1.798 vacantes y 40 preguntas | MCER y niveles, DBA de inglés, Guía 22, didáctica de segunda lengua, evaluación de las cuatro habilidades |
| `cbd_c.json` | TC-CBD-041 a 060 | Competencias Blandas del Docente | Componente de todos los cargos | Liderazgo, ética, trabajo en equipo y ciudadanía en situaciones escolares |
| `tec_b.json` | TC-TEC-021 a 040 | Saber Disciplinar: Tecnología e Informática | 1.091 vacantes y 20 preguntas | Guía 30: naturaleza de la tecnología, solución de problemas, tecnología y sociedad, pensamiento computacional |
| `art_b.json` | TC-ART-021 a 040 | Saber Disciplinar: Educación Artística | 1.283 vacantes y 20 preguntas | Documento 16: música, danza, artes plásticas y escénicas, y evaluación en artes |
| `efi_b.json` | TC-EFI-021 a 040 | Saber Disciplinar: Educación Física | 783 vacantes y 20 preguntas | Documento 15: motricidad, expresión corporal, salud y recreación |

- Antes de usar un id, confirma que no existe (`grep` en `data/preguntas/`).
- **Campos fijos:** copia `capa`, `eje`, `formato` y `nivel` de las preguntas del mismo módulo. Además:
  - `version`: 1
  - `estado`: `"beta"`
  - `autor`: `"IA"`
  - `revision`: `{"resolucion_ciega": null, "revisor_humano": null, "fecha": "<AAAA-MM-DD de hoy>"}`
  - `fuente_url`: el documento oficial.
- Religión, ciencias económicas y políticas y los directivos quedan para otro lote, salvo que el mapa muestre un hueco grave.

### 8. Proceso por archivo (obligatorio, en este orden)

Trabaja en `docs/banco/lote<N>/`. Puedes repartir la redacción entre subagentes en paralelo (uno por archivo), pero **la resolución a ciegas siempre la hace otro agente**, que no haya visto las claves.

1. **Redacción.** 20 preguntas por archivo, siguiendo la guía y la sección 6. Cada redactor:
   - corre `listar-modulo` del módulo y no repite decisiones ya publicadas;
   - lee completa la parte pertinente de la fuente antes de escribir;
   - reparte las claves en 5 A, 5 B, 5 C y 5 D.
2. **Comprobaciones automáticas.** Las dos deben quedar en cero errores:
   - `node scripts/banco/verificar-fragmentos.mjs <carpeta_de_fuentes> docs/banco/lote<N>/<archivo>.json`: cada fragmento literal y ninguno tachado. Si usas varias carpetas, cada fragmento debe ser literal en alguna.
   - `node scripts/validate-questions.mjs docs/banco/lote<N>/<archivo>.json`: revisa también las advertencias.
3. **Resolución a ciegas.**
   - `node scripts/banco/blind.mjs strip <scratchpad>/ciego/<archivo>.json docs/banco/lote<N>/<archivo>.json` quita claves y explicaciones.
   - Un subagente nuevo lo resuelve con acceso a las fuentes y escribe `<scratchpad>/ciego/resp_<archivo>.json` (plantilla en la sección 9).
   - `node scripts/banco/blind.mjs compare <resp> docs/banco/lote<N>/<archivo>.json` lista lo que hay que revisar.
4. **Corrección.**
   - Corrige todo lo marcado: respuesta distinta, otra opción defendible, pista o dádiva, confianza baja, `p_estimado` mayor de 90 (trivial) y los problemas de redacción, también los leves. Si la pregunta no tiene arreglo, descártala.
   - Si el archivo ya estaba publicado, cada pregunta corregida pasa a `version: 2`.
   - Vuelve a correr las comprobaciones del paso 2.
5. **Segunda resolución a ciegas.**
   - `node scripts/banco/strip-cambiadas.mjs <scratchpad>/ciego/<archivo>_v2.json docs/banco/lote<N>/<archivo>.json`.
   - Otro subagente nuevo lo resuelve. Repite hasta que no queden graves ni medias.
6. **Publicación.**
   - Crea `<scratchpad>/merge.json`:
     ```json
     { "respuestas": ["<resp v1>", "<resp v2>"], "destinos": { "docentes-disciplinar.json": ["docs/banco/lote<N>/pri_e.json"] }, "dryRun": true }
     ```
   - Corre `node scripts/banco/merge-lote.mjs <config>`. Si el ensayo no reporta problemas, cambia a `false` y vuelve a correrlo.
   - Valida todo el banco con `node scripts/validate-questions.mjs`.
   - Si cambiaron los módulos o los pesos de un perfil, actualiza `catalogo.ts`.
7. **Informe.**
   - Escribe `docs/banco/lote<N>/RESULTADOS.md` como el del lote 22 o el 24: qué se publicó, la tabla de resolución a ciegas por archivo, las correcciones y las lecciones.
   - Si una lección sirve para cualquier módulo, agrégala a `GUIA_REDACCION.md`.

### 9. Plantilla para el subagente que resuelve a ciegas

> Resuelve a ciegas las preguntas de `<archivo sin clave>`. Son de selección múltiple para el concurso docente 2026 de la CNSC (Colombia). No abras ningún archivo de `docs/banco` ni de `data/preguntas`, porque ahí están las claves. Tienes las normas y los referentes del MEN en `<carpeta de fuentes>`: léelos para resolver. Haz con node todos los cálculos y fechas.
>
> Para cada pregunta, elige una sola respuesta y revisa con ojo de editor y de docente experto:
> - si otra opción también es defendible según el referente o la norma vigente;
> - si la premisa del caso tiene huecos (grado, edad, contexto, cargo);
> - si alguna pista de forma delata la clave: longitud, una sola opción distinta, palabras repetidas del enunciado, la opción más «moderna» o protectora;
> - si hay errores de contenido, de redacción o lenguaje no incluyente.
>
> Escribe en `<archivo de salida>` un arreglo JSON con un objeto por pregunta:
> `{"id": "...", "respuesta": "A|B|C|D", "confianza": "alta|media|baja", "otras_defendibles": [], "pista": "texto o vacío", "p_estimado": 0-100, "redaccion": ["problema concreto"], "gravedad": "ninguna|leve|media|grave", "razon": "explicación breve con la fuente"}`
>
> Verifica que el archivo sea JSON válido. En tu respuesta final, da las letras y las preguntas de gravedad media o grave.

### 10. Git y entrega

- **Rama y commits:**
  - Trabaja en una rama (por ejemplo, `docentes/pagina-y-lote<N>`).
  - Los commits salen como `revdev08`, que ya es la configuración local del repositorio. No toques la configuración global de git.
  - Termina cada mensaje de commit con la línea `Co-Authored-By` que indique tu sesión.
  - Haz commits separados para la página y para cada lote de preguntas.
- **No subas:**
  - `REVISION_MEJORAS.md`;
  - las fuentes descargadas ni los PDF;
  - nada del scratchpad;
  - nada de `app/dev-preview`.
- **Antes de subir:**
  1. `git fetch`; revisa `git rev-list --count HEAD..origin/main`. Otras personas suben directo a main; si hay commits nuevos, intégralos y resuelve los conflictos.
  2. Revisa si hay un servidor en el puerto 3000. Si está corriendo, detenlo antes de `yarn build`. Luego borra `.next` y vuelve a levantarlo. Compilar con el servidor de desarrollo encendido daña los estilos de localhost.
  3. Sube tu rama.
- **No subas a main sin que el dueño lo apruebe.**
- **Al terminar, entrega un resumen en español con:**
  - qué tiene la página `/docentes`, una captura y qué quedó pendiente;
  - cuántas preguntas se publicaron, por archivo y por tema;
  - el resultado de cada resolución a ciegas y qué se corrigió;
  - el reparto de claves y de dificultad;
  - los temas y cargos que quedaron sin cubrir y por qué;
  - el enlace al informe `docs/banco/lote<N>/RESULTADOS.md`.
