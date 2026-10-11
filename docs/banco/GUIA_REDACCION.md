# Guía de redacción y producción de preguntas

Toda pregunta nueva del banco se produce con esta guía. Su objetivo es que cada pregunta:

1. evalúe algo que de verdad se pregunta en las pruebas;
2. se parezca a la prueba real;
3. enseñe con una explicación confiable.

## 1. Cómo son las pruebas reales (y qué imitamos)

Referencias revisadas:
- Guía de orientación de un proceso de méritos de la CRC, publicada el 30 de enero de 2026 (prueba de conocimientos y prueba de aptitudes gerenciales).
- Presentación del SENA sobre las tendencias de las pruebas escritas de la CNSC (abril de 2025).

| Característica | En la prueba real | Qué hacemos |
|---|---|---|
| Opciones | 4 (A–D), **una sola correcta** | Igual |
| Tipo de ítem | Selección múltiple y **casos** (situaciones laborales reales o simuladas) | Mínimo el 70% en formato caso |
| Enunciados | "Bastante largos", con análisis y organización de información. La prueba dura unas 4 horas | Caso con los datos necesarios para responder, sin relleno |
| Ítems que se anulan | Los que acierta menos del 5% o más del 95% de los aspirantes, y los que tienen cero o más de una respuesta correcta | Mismos criterios para retirar preguntas con datos de uso |
| Comportamentales | Juicio situacional o **elección forzada** ("la que más" y "la que menos" se parece a usted). No hay respuesta "correcta"; se compara con el perfil del nivel | Formato propio (ver sección 6). No se califican como correcto o incorrecto |
| El nivel importa | La respuesta esperada depende del nivel del empleo. Por ejemplo, un cargo asistencial no toma decisiones ni maneja personal | Campo `nivel` en cada pregunta en la que influya |
| Ejes temáticos | Los define el operador de cada convocatoria a partir del manual de funciones, el Decreto 815 de 2018 y la normatividad del Estado y de la entidad | El tronco común cubre lo transversal (ver [MAPA_TRONCO_COMUN.md](MAPA_TRONCO_COMUN.md)) |

## 2. Formato de cada pregunta (versión 2)

```jsonc
{
  "id": "TC-909-014",                 // capa-norma-consecutivo; nunca se reutiliza
  "version": 1,                        // sube con cada cambio de contenido
  "estado": "beta",                    // borrador | beta | estable | en_revision | retirada
  "capa": 1,                           // 1 tronco común · 2 por nivel · 3 eje funcional · 4 específica
  "modulo": "Empleo Público y Carrera Administrativa",
  "tema": "Provisión de empleos",
  "subtema": "Encargo",
  "formato": "caso",                   // caso | conocimiento_aplicado
  "nivel": ["todos"],                  // o ["asistencial","tecnico","profesional","asesor"]
  "dificultad": "Media",               // estimada al redactar; luego se recalcula con datos reales
  "norma": "Ley 909 de 2004",
  "articulos": ["art. 24 (modificado por el art. 1 de la Ley 1960 de 2019)"],
  "texto_fuente": "Fragmento LITERAL del artículo que sostiene la respuesta",
  "pregunta": "Caso + tarea en un solo texto",
  "opciones": [
    { "id": "A", "texto": "...", "explicacion": "Por qué es correcta o incorrecta" }
  ],
  "respuestaCorrecta": "C",
  "explicacionIA": "Dato decisivo del caso → regla aplicable → conclusión (máx. ~600 caracteres)",
  "fuente_url": "http://www.secretariasenado.gov.co/senado/basedoc/ley_0909_2004.html",
  "autor": "IA",
  "revision": {
    "resolucion_ciega": null,           // "coincide" | "difiere" | "ambigua"
    "revisor_humano": null,
    "fecha": "2026-10-10"
  }
}
```

Los campos `pregunta`, `opciones[].id/texto`, `respuestaCorrecta`, `explicacionIA`, `modulo`, `tema` y `dificultad` son los que ya usa la app. Los demás se agregan sin romper nada.

## 3. Reglas de redacción

**Fuente**
- Cada pregunta normativa nace del **texto literal vigente** del artículo, no de memoria. El texto va en `texto_fuente`.
- Fuente preferida: la base de la Secretaría del Senado (incluye las modificaciones anotadas) o SUIN-Juriscol.
- Si un artículo fue modificado, se usa **el texto nuevo** y se cita la norma que lo modificó.
- Prohibido citar normas derogadas como vigentes. Ejemplo: la Ley 734 de 2002 fue reemplazada por la Ley 1952 de 2019.

**Orden de escritura**
1. Elegir la regla del artículo y la **decisión** que se quiere evaluar.
2. Escribir la respuesta correcta y su justificación.
3. Escribir el caso con el **dato decisivo** y el contexto mínimo para que se vea real.
4. Escribir los distractores.
5. Escribir la explicación de cada opción.

**Enunciado**
- Debe exigir **aplicar** la regla: decidir, identificar una consecuencia, calcular un plazo o elegir un procedimiento. Contar una historia antes de una definición no basta.
- Una sola tarea, formulada al final con claridad ("¿Qué debe hacer…?", "¿Cuál es la consecuencia…?").
- Sin negaciones dobles. Si se usa "NO", va en mayúsculas.
- Nombres y entidades ficticios o genéricos ("una alcaldía", "la entidad").
- **No regalar la respuesta** (lección del piloto). El enunciado no debe decir lo que falta ni describir el caso con las mismas palabras de la norma. La clave no debe repetir expresiones del enunciado ("en primera instancia", "cumple los requisitos"). Ningún distractor debe confirmar un dato de la clave (por ejemplo, mencionar "los seis meses de prueba" cuando la clave es "seis meses").
- **Revisar la vigencia de cada artículo en la fuente.** En el piloto, el art. 29 de la Ley 909 resultó modificado por la Ley 2418 de 2024, no solo por la Ley 1960. Si el artículo dice "CONDICIONALMENTE exequible", se lee la condición antes de publicar como `estable`.

**Dificultad (meta por lote)**
- Al menos el **40%** de cada lote debe combinar dos o más reglas en el mismo caso, o exigir un cálculo (plazos, porcentajes, fechas). Fueron las preguntas que mejor discriminaron en el piloto.
- Ninguna pregunta debe poder responderse solo con sentido común o descartando lo obvio.

**Opciones**
- **Longitud similar.** Ninguna opción debe destacar; la correcta no puede ser sistemáticamente la más larga ni la más matizada. El validador lo revisa.
- **Distractores basados en errores reales:** confundir plazos (10, 15 o 30 días), confundir figuras (encargo con comisión, provisionalidad con período de prueba), aplicar la regla fuera de sus condiciones o confundir competencias (CNSC con DAFP).
- Nada de opciones absurdas que nadie elegiría.
- No usar "todas las anteriores", "ninguna de las anteriores" ni "A y B son correctas".
- Evitar palabras absolutas ("siempre", "nunca", "únicamente") que delaten un distractor. Si se usan, que también aparezcan en opciones correctas de otras preguntas.
- Las claves se reparten de forma pareja entre A, B, C y D.
- **Rejillas 2×2:** cuando las opciones combinan dos elementos, cada uno aparece en el mismo número de opciones. La clave nunca debe ser la opción que reúne los elementos más repetidos.
- **La persona que objeta en el caso no puede estar siempre equivocada.** En al menos un tercio de los casos con objeción, la objeción es correcta total o parcialmente. Si no, el ítem se responde yendo "contra el que objeta".
- **Ítems didácticos (docentes):** al menos dos distractores deben ser intervenciones activas y razonables que fallen en un punto concreto, o un diagnóstico correcto con una intervención equivocada. Si solo la clave es activa, el ítem se adivina sin saber del área.
- **La opción más protectora, incluyente o conciliadora no puede ganar siempre** (lección del lote 20). En casos de inclusión, convivencia, orientación y competencias blandas, al menos dos distractores deben ser igual de protectores que la clave y fallar en un punto concreto: la entidad o el responsable, el orden de los pasos, el plazo, el instrumento, el rol del cargo o una medida que la norma no permite. En algunos ítems la clave es la acción firme o la que acude a la instancia debida.
- **Ningún verbo inicial reservado a los distractores** («Explicar…», «Remitir…», «Votar…»). Tampoco un repertorio fijo de distractores (exponer, imponer, votar, confrontar, trasladar).
- **Longitud en los dos sentidos:** la clave es la opción más larga en el 20 al 30 % de los ítems y la más corta en no más del 25 %.

**Explicaciones**
- La explicación general señala el dato decisivo del caso, la regla (artículo) y la conclusión.
- Cada opción tiene su propia explicación. Las incorrectas dicen **qué error representan**.
- Nunca se justifica una clave con una regla que no esté en `texto_fuente`. Excepción: en los módulos de saber disciplinar docente, el `texto_fuente` es el estándar del MEN, y la regla del área (ortográfica, matemática, científica) puede venir del conocimiento consolidado, enunciada con precisión en la explicación.

## 4. Proceso de producción

| Paso | Quién | Salida |
|---|---|---|
| 1. Elegir la fila del mapa (tema, subtema, artículo) | Equipo | Ficha vacía con la fuente |
| 2. Borrador | IA con el texto literal del artículo | Pregunta completa, `estado: borrador` |
| 3. Validación automática | `yarn validate:questions` | Estructura, duplicados y sesgo de longitud |
| 4. Resolución a ciegas | Otra instancia de IA, **sin la clave**, con acceso a la norma | Si no coincide o encuentra dos respuestas defendibles, vuelve al paso 2 |
| 5. Revisión humana | Experto en el área (cuando lo haya) | `revisor_humano` |
| 6. Publicación | — | `estado: beta` (sin revisión humana) o `estable` (con revisión y datos) |
| 7. Calibración | Datos de uso | Dificultad real, discriminación y distractores que nadie elige. Se retiran las que acierta menos del 5% o más del 95% |

**La resolución a ciegas debe tener todas las normas del tema:** la ley y también su reglamento. En la TC-909-025 la clave era correcta según la Ley 909, pero el Decreto 1083 añade un requisito de 3 meses. El resolvedor solo tenía la ley y no lo detectó.

**El tachado del Senado se pierde al pasar a texto:**
- En las compilaciones del Senado, lo declarado INEXEQUIBLE aparece tachado (etiqueta `<S>`). Al convertir la página a texto plano se ve como texto normal.
- Antes de citar un artículo del Senado, revisa sus segmentos tachados en el HTML o en la lista extraída.
- Auditoría del 10 de octubre de 2026 (26 leyes, 74 páginas): ninguna pregunta activa citaba texto tachado.

**Las compilaciones también se equivocan; contrasta con la del ministerio:**
- Los decretos únicos tienen dos compilaciones: el gestor normativo de Función Pública y el normograma del ministerio del sector.
- En el Decreto 1078 de 2015, el gestor muestra el art. 2.2.9.1.3.3 con el texto del 2.2.9.1.3.4. Según el normograma del MinTIC, el Decreto 767 de 2022 dice algo distinto: el Comité Institucional de Gestión y Desempeño orienta la implementación de la Política de Gobierno Digital, y el jefe de TI la lidera.
- Con la fuente equivocada, tanto el redactor como el resolvedor a ciegas aprobaron un distractor falso (TC-TIC-005, lote 7).
- Para el sector TIC usa el normograma del MinTIC. En cualquier decreto único, revisa además la fecha de "última actualización" y la lista de vigencias, para saber si hay decretos posteriores que la compilación no incluye.

**Las notas de vigencia cambian la respuesta: léelas, no solo el texto:**
- **Ley 610 de 2000:** el Decreto Ley 403 de 2020 subió a 10 años la caducidad de la acción fiscal (art. 127), y muchas fuentes secundarias siguen diciendo "10 años". La Corte declaró inexequibles esas modificaciones (Sentencia C-090 de 2022), así que rige el texto original: 5 años.
  - **Dónde verlo:** las notas del Senado no están en la página; vienen en un archivo aparte (`basedoc/js/<norma>.js`).
- **Decreto Ley 71 de 2020 (carrera de la DIAN):** lo derogó en su totalidad el Decreto Ley 927 de 2023 (art. 152). Una fuente vieja en la carpeta no significa que la norma siga vigente.
- **Normogramas de Avance Jurídico (DIAN, Supersalud):** después del texto vigente vienen "Notas de Vigencia" y "Legislación Anterior". Lo que sigue a "Legislación Anterior" es texto viejo.
- **Reglamento contra ley:** el Decreto 1072 todavía pide autorización del Ministerio para trabajar horas extras, pero el art. 162 del CST, reformado por la Ley 2466 de 2025, la eliminó. Prevalece la ley.
- **Corte de la prueba:** la DIAN 2676 solo evalúa normas expedidas antes del 19 de junio de 2026. Cada convocatoria puede fijar su propio corte.
- **Régimen sancionatorio aduanero:** el Decreto Ley 920 de 2023 se declaró inexequible con efectos diferidos hasta el 20 de junio de 2026 (Sentencia C-072 de 2025). Lo derogó la Ley 2586 de 2026, del 19 de junio, que queda justo fuera del corte de la DIAN 2676. Por eso no escribimos preguntas de sanciones aduaneras para esa prueba.

**UVT a pesos: siempre con el redondeo del art. 868 del Estatuto Tributario.**
- La regla:
  - por encima de $10.000, al múltiplo de mil más cercano;
  - entre $100 y $10.000, al múltiplo de cien;
  - de $100 o menos, al peso entero.
- Ejemplo: la sanción mínima de 10 UVT con UVT de $52.374 es $524.000, no $523.740.
- Varias preguntas de la DIAN usaban la cifra sin redondear y ni el redactor ni el resolvedor lo notaron. La cifra sin redondear sirve como distractor.

**La lista de tachados también puede estar incompleta.** En la Ley 80, art. 8, faltaban los segmentos tachados "o concurso(s)". Ante la duda, revisa el HTML original del Senado (etiquetas `<s>` y `<strike>`).

**Formato de la prueba real (investigación del 11 de octubre de 2026):**
- En el sistema general de la CNSC no hay prueba de "competencias generales". Las funcionales pesan 60% (son eliminatorias con 65) y evalúan los ejes temáticos de cada empleo, que incluyen los temas del Estado.
- Con el operador actual (FUAA), las funcionales son de juicio situacional: un caso y **tres opciones**. Nuestro banco usa cuatro. Cambiar a tres es una decisión de producto pendiente.

**Dónde viven las preguntas:**
- Los borradores se trabajan en `docs/banco/<lote>/`.
- Al aprobarse, el lote se mueve a `data/preguntas/<tema>.json` y se agrega a la lista `BANCO` de `lib/questions.ts`. Esa es la única fuente que usa la app.
- La app muestra las preguntas `beta` y `estable`, y oculta las `borrador`, `en_revision` y `retirada`.

**Mientras no haya revisor humano,** todo lo nuevo se publica como `beta` y la app debería mostrarlo ("pregunta nueva en validación") con un botón para reportar errores.

## 5. Lista de chequeo antes de aprobar

- [ ] La clave está sostenida por `texto_fuente`, y ese texto es el vigente.
- [ ] Otra persona o modelo la resolvió sin la clave y llegó a la misma respuesta.
- [ ] Ninguna otra opción es defendible.
- [ ] Las opciones tienen longitud y tono similares.
- [ ] Ningún distractor es absurdo.
- [ ] El caso contiene el dato necesario para responder y no regala la respuesta: la clave no repite palabras del enunciado y ningún distractor confirma la clave.
- [ ] El resolvedor a ciegas no la marcó como "trivial" (que la acertaría más del 90% de los aspirantes).
- [ ] Cada opción tiene su explicación.
- [ ] No duplica otra pregunta del banco (mismo artículo y misma decisión).

## 6. Competencias comportamentales (formato propio)

En la prueba real no hay una respuesta "correcta": se mide qué tanto se ajusta la conducta al perfil del nivel (Decreto 1083 de 2015, arts. 2.2.4.7 y 2.2.4.8, modificados por el Decreto 815 de 2018). Para practicar:

- **Situación laboral + 4 cursos de acción plausibles.** Todos deben sonar razonables.
- Cada opción lleva un **puntaje de ajuste** (por ejemplo 3, 2, 1 o 0) según la conducta asociada del decreto y el **nivel**, en lugar de correcto o incorrecto.
- La explicación indica qué conducta del decreto refleja cada opción y por qué una se ajusta mejor al nivel.
- Cubrir las 6 competencias comunes de forma pareja: aprendizaje continuo, orientación a resultados, orientación al usuario y al ciudadano, compromiso con la organización, trabajo en equipo y adaptación al cambio. Después, las de cada nivel.

**Formato en el banco** (`"formato": "juicio_situacional"`):
- Cada opción lleva `"puntaje"` (3, 2, 1 y 0, uno de cada uno) y su `"explicacion"`. La explicación dice qué conducta asociada refleja la opción, o por qué se queda corta.
- `respuestaCorrecta` es la opción de puntaje 3.
- `competencia` lleva el nombre exacto del decreto, `tema` repite ese mismo nombre y `subtema` es la conducta asociada evaluada.
- `nivel`: `["todos"]` para las competencias comunes (art. 2.2.4.7) y `["asistencial"]`, `["tecnico"]`, `["profesional"]` o `["asesor"]` para las de cada nivel (art. 2.2.4.8).
- `texto_fuente` es la definición y las conductas asociadas, copiadas literalmente del decreto.

**Cómo graduar las opciones:**
- **3:** realiza plenamente la conducta asociada, dentro de las atribuciones del nivel.
- **2:** la realiza en parte. Por ejemplo, resuelve, pero sin coordinar con los demás.
- **1:** respuesta pasiva o que traslada el problema a otro.
- **0:** contraria a la competencia, pero tentadora. Por ejemplo, cumple la regla a costa del usuario, antepone lo personal o se excede de las atribuciones del nivel.

**Lo que no se permite:**
- Opciones antiéticas obvias, ilegales o absurdas. Nadie las elegiría y no miden nada.
- Que la mejor opción sea la más larga o la única "proactiva".
- Para niveles asistencial y técnico, que la mejor opción implique decisiones propias del jefe. Para estos niveles, excederse de las atribuciones puntúa bajo.

**En la app:** el usuario elige su nivel la primera vez que entra a comportamentales. Ve las competencias comunes más las de su nivel. Al responder ve el ajuste de su elección (0 a 3), cuál era la mejor opción y la explicación de cada una.
