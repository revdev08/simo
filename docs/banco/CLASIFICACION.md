# Clasificación del banco de preguntas (semana 1)

**Fecha:** 10 de octubre de 2026
**Detalle por pregunta:** [clasificacion.csv](clasificacion.csv). Está separado por `;` y se abre directo en Excel.

Cada una de las 405 preguntas únicas se leyó completa: enunciado, opciones, clave y explicación. Las de razonamiento se resolvieron de forma independiente antes de mirar la clave.

## 1. Qué se cambió en `questions.json`

| Cambio | Preguntas |
|---|---|
| Duplicados exactos eliminados (los ids 291–310 aparecían dos veces) | 20 → quedan **405** únicas |
| Módulos "Competencias Transversales" y "Habilidades y Competencias Transversales" unificados (también en el simulacro gratis) | 28 + 33 = 61 |
| Clave corregida, con explicación nueva que justifica cada opción | 34, 94, 240, 265 |
| Opciones rehechas porque había dos respuestas válidas o ninguna | 6, 242, 254, 256, 257, 265 |
| Opción malformada reparada | 235 |
| Erratas y citas corregidas | 56, 81, 82 |
| **En revisión: ocultas en la práctica** (campo `"estado": "en_revision"`) | 43, 48, 57, 264, 383, 398 |

Por qué cada pregunta en revisión:

| Id | Problema |
|---|---|
| 43 | Dice que una petición reiterativa puede rechazarse. El art. 19 del CPACA solo permite remitirse a las respuestas anteriores (la #37 lo dice bien) |
| 48 | Atribuye a la Ley 1755 una regla sobre peticiones anónimas que esa ley no contiene |
| 57 | La explicación afirma que las faltas leves no admiten dolo y las gravísimas no admiten culpa grave. Es falso según la Ley 1952 |
| 264 | Ninguna opción se deduce de las premisas |
| 383 | Se basa en la Ley 734 de 2002 (derogada) y la clave probablemente está mal. Hay que rehacerla con la Ley 1952, modificada por la Ley 2094 |
| 398 | La clave dice "narrar" sobre un texto expositivo |

**Nueva herramienta:** `yarn validate:questions` revisa la estructura del banco: ids únicos, 4 opciones A–D con texto, clave existente y enunciados repetidos. También reporta el sesgo de longitud y el reparto de claves. Sale con error si encuentra problemas de estructura.

## 2. Destino propuesto para cada pregunta

| Módulo | Conservar | Corregir | Fundamentos | Reescribir | Retirar | Total |
|---|---|---|---|---|---|---|
| Fundamentos Constitucionales y Legales | 16 | 5 | 68 | 8 | 9 | 106 |
| Gestión Pública y Procesos Administrativos | 9 | 6 | 60 | 10 | 29 | 114 |
| Habilidades y Competencias Transversales | 6 | 3 | 41 | 2 | 9 | 61 |
| Razonamiento Cuantitativo | 46 | 1 | 1 | 2 | 10 | 60 |
| Competencias Comportamentales | 6 | 3 | 2 | 14 | 39 | 64 |
| **Total** | **83** | **18** | **172** | **36** | **96** | **405** |

- **Conservar (83):** sirven como pregunta de simulacro. Más de la mitad son de razonamiento.
- **Fundamentos (172):** son correctas pero de memoria o de definición. Sirven para un modo "aprender conceptos", no para el simulacro.
- **Corregir (18):** 43, 48, 57, 81, 82, 106, 153, 166, 257, 384, 396, 397, 398, 405, 407, 418, 420, 424. Algunas ya se arreglaron (81, 82, 257) o están en revisión.
- **Reescribir (36):** 46, 47, 62, 71, 86, 92, 107, 112, 128, 130, 132, 134, 137, 186, 188, 201, 202, 264, 304, 306, 307, 311, 327, 329, 332, 337, 345, 371, 372, 373, 382, 383, 385, 391, 419, 421.
- **Retirar (96):** el motivo principal son los **duplicados conceptuales** (84 casos): 25 variantes de Hábeas Data con los mismos 8 principios, 26 comportamentales de "aprendizaje continuo" casi iguales, series numéricas con el mismo patrón, etc. La nota de cada una en el CSV dice a qué pregunta duplica.

> ⚠️ **Los retiros no se aplicaron.** Son una propuesta para que la revisen. Todas esas preguntas siguen activas en la app. Si se retiran todas de una vez, el banco activo baja a unas 300, así que conviene hacerlo a medida que entren las nuevas.

## 3. Hallazgos de la clasificación

**La dificultad está inflada.** Al evaluar el razonamiento que exige cada pregunta:

| Etiqueta actual | → Baja | → Media | → Alta |
|---|---|---|---|
| Alta (138) | 82 | 53 | **3** |
| Media (230) | 173 | 57 | 0 |
| Baja (37) | 35 | 2 | 0 |

Solo **3 preguntas** son de verdad de dificultad alta. Es la razón principal por la que el banco se siente débil: casi todo se responde por memoria o descartando opciones absurdas.

**Problemas más frecuentes** (una pregunta puede tener varios):

| Problema | Preguntas |
|---|---|
| Distractor absurdo | 198 |
| Memorística | 186 |
| Duplicado conceptual | 84 |
| Dificultad mal etiquetada | 66 (casos marcados explícitamente; la tabla de arriba muestra el desajuste completo) |
| Formato incorrecto (sobre todo comportamentales tipo "¿qué demuestra?") | 32 |
| Ambigua | 20 |
| Cita imprecisa | 16 |
| Fuera del alcance del examen | 14 |
| Explicación débil | 13 |

**Distribución por capa** (1 tronco común · 2 por nivel jerárquico · 3 ejes funcionales que se repiten entre entidades · 4 específica de una entidad):

| Capa | Preguntas | Comentario |
|---|---|---|
| 1. Tronco común | 165 | Concentrado en derecho de petición (25), transparencia (26), datos personales (25) y disciplinario (26). **No hay preguntas** de Ley 909 ni empleo público, anticorrupción, contratación ni presupuesto |
| 2. Por nivel | 157 | Las comportamentales cubren casi solo *aprendizaje continuo* (26) y *compromiso* (26). **No hay ninguna** de *orientación a resultados* ni de *orientación al usuario y al ciudadano* |
| 3. Ejes funcionales | 76 | Gestión documental 27, ofimática 26, atención al ciudadano 19, planeación 4. No hay talento humano, presupuesto, contratación ni jurídica |
| 4. Específica | 7 | Secretaría Distrital de Gobierno de Bogotá, derechos de autor, método científico. Se proponen para retirar |

**Comprensión lectora:** las preguntas 201–225 no traen ningún texto para leer. Son teoría sobre tipos de texto. Solo 397 y 399–403 son ejercicios reales de lectura.

**Temas:** los 237 temas originales quedaron agrupados en **64 temas normalizados**. Están en la columna `tema_normalizado` del CSV y pueden usarse para los filtros de la app.

## 4. Siguientes pasos

1. **Revisar las 6 preguntas en revisión** con alguien que sepa derecho administrativo y reactivarlas ya corregidas.
2. **Corregir las 18 marcadas "corregir"**, que son cambios puntuales.
3. **Decidir los retiros.** Recomiendo aplicar primero los de capa 4 y los duplicados más evidentes (Hábeas Data, aprendizaje continuo).
4. **Separar en la app el modo "Fundamentos"** (las 172 de definición) del modo "Simulacro", para que el simulacro use solo preguntas que exigen razonar.
5. **Empezar la escritura nueva por los vacíos del tronco común:** Ley 909 y empleo público, anticorrupción, contratación y las dos competencias comportamentales que faltan.
