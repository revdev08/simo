# Modos de estudio y análisis de calidad (Parte 4)

**Fecha:** 10 de octubre de 2026

## Módulos por sección

Los módulos se reorganizaron por tema y se agrupan como las pruebas de la CNSC. La definición está en `MODULE_SECTIONS` de [lib/question-types.ts](../../lib/question-types.ts).

| Sección | Módulos |
|---|---|
| Competencias generales | Constitución y Estructura del Estado · Empleo Público y Carrera Administrativa · Derecho de Petición y Procedimiento Administrativo · Transparencia, Datos Personales y Archivo · Disciplinario y Anticorrupción · Gestión Pública: MIPG, Presupuesto y Contratación · Atención al Ciudadano |
| Competencias comportamentales | Competencias Comportamentales |
| Aptitudes | Razonamiento Lógico y Cuantitativo · Comprensión Lectora · Herramientas de Oficina y Seguridad Digital |

- Las preguntas del banco original se reasignaron según su tema normalizado de la clasificación.
- Se retiraron 3 más por estar fuera del alcance del examen: método científico, economía del conocimiento y usabilidad web.

## Concepto básico frente a simulacro

- Las preguntas del banco original que la clasificación no marcó como "conservar" (172) llevan `"fundamentos": true`.
- En el modo estudio se muestran con la etiqueta **"Concepto básico"**.
- **No entran al simulacro.**
- Al simulacro van las preguntas verificadas con el proceso nuevo y las originales conservadas (~333).

| Módulo | Para simulacro | Solo concepto básico |
|---|---|---|
| Constitución y Estructura del Estado | 1 | 25 |
| Empleo Público y Carrera Administrativa | 30 | 0 |
| Derecho de Petición y Procedimiento Administrativo | 13 | 10 |
| Transparencia, Datos Personales y Archivo | 15 | 44 |
| Disciplinario y Anticorrupción | 40 | 20 |
| Gestión Pública: MIPG, Presupuesto y Contratación | 50 | 15 |
| Atención al Ciudadano | 6 | 17 |
| Competencias Comportamentales | 120 | 0 |
| Razonamiento Lógico y Cuantitativo | 48 | 2 |
| Comprensión Lectora | 10 | 22 |
| Herramientas de Oficina y Seguridad Digital | 0 | 17 |

Los módulos con más preguntas de concepto básico (Constitución, Transparencia, Atención al Ciudadano y Comprensión Lectora) son la prioridad de contenido de la Parte 5.

## Simulacro tipo examen

Componente: [components/study/SimulacroSession.tsx](../../components/study/SimulacroSession.tsx).

- **Tres tamaños:** 20, 40 u 80 preguntas, con **2 minutos por pregunta** de cronómetro.
- **Mezcla:** 60% competencias generales, 15% aptitudes y 25% comportamentales. Las comportamentales se filtran por el nivel que eligió el usuario. Si una sección no alcanza, se completa con las demás.
- **Durante el examen:**
  - No se ve si la respuesta es correcta.
  - Se puede ir y volver, cambiar respuestas y marcar preguntas para revisar.
  - Un mapa de preguntas muestra cuáles están respondidas o marcadas.
- **Si se acaba el tiempo,** el simulacro termina solo.
- **Si se cierra la pestaña,** el simulacro queda guardado en el navegador y el panel ofrece retomarlo. El tiempo sigue corriendo.
- **Resultado:**
  - puntaje de conocimientos sobre 100;
  - ajuste promedio en comportamentales;
  - preguntas sin responder;
  - aciertos por módulo;
  - revisión pregunta por pregunta, con filtros (todas, incorrectas o sin responder), la explicación de cada opción y el fundamento.
- **Registro:** cada respuesta se guarda en `question_attempts` con `mode = 'simulacro'` y el tiempo que el usuario pasó en esa pregunta.

## Arreglos en el modo estudio

- **"Anterior" ya no borra la respuesta.** Al volver se ve la misma respuesta con su explicación, sin poder cambiarla. Antes se podía responder otra vez para inflar el puntaje.
- **El progreso se guarda en la base de datos también al salir del módulo**, no solo al llegar a la última pregunta.
- **El tiempo de respuesta se mide en todos lados con el mismo reloj.**

## Simulacro gratis

- Usa un grupo de **29 preguntas verificadas** de 7 módulos ([app/simulacro-gratis/questions.json](../../app/simulacro-gratis/questions.json)).
- Cada vez que alguien lo empieza, salen 10 al azar, tomando una de cada módulo por vuelta.
- Cuando el usuario se equivoca, muestra también por qué su opción es incorrecta y el fundamento legal.

## Análisis de calidad con datos reales

```bash
yarn stats:questions
```

Con `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`). Para guardarlo en un archivo:

```bash
node --env-file=.env.local scripts/question-stats.mjs docs/banco/estadisticas.md
```

Usa solo el **primer intento** de cada usuario en la versión vigente de cada pregunta, y marca:
- **Muy fáciles** (más del 95% de aciertos) o **muy difíciles** (menos del 25%). En la prueba real se anulan las que acierta menos del 5% o más del 95% de los aspirantes.
- **Baja discriminación** (correlación menor a 0,15): los usuarios que la aciertan no son los que mejor van en el resto del banco.
- **Distractores que casi nadie elige** (menos del 3%).
- **Reportes de error sin revisar**, agrupados por pregunta.

Necesita **al menos 20 usuarios por pregunta** para marcar alertas. Requiere haber ejecutado [lib/question-feedback.sql](../../lib/question-feedback.sql) en Supabase.
