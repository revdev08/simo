# Parte 3: competencias comportamentales (juicio situacional)

**Fecha:** 10 de octubre de 2026
**Archivo:** [data/preguntas/comportamentales.json](../../../data/preguntas/comportamentales.json)
**Estado:** 120 situaciones en `beta`, publicadas en el módulo "Competencias Comportamentales". Las 64 comportamentales del banco original quedaron como `retirada`.

## Qué cambió en la app

- **Formato nuevo, `juicio_situacional`.** Cada opción tiene un puntaje de ajuste:
  - 3 = Ajuste alto.
  - 2 = Ajuste medio.
  - 1 = Ajuste bajo.
  - 0 = No alineada.
- **Al responder, el usuario ve:**
  - el ajuste de su elección;
  - cuál era la mejor opción;
  - la explicación y el puntaje de las 4 opciones;
  - la competencia y la conducta evaluada.
- **Colores:** la elección con ajuste parcial se marca en ámbar, no en rojo.
- **Nivel del cargo:** el usuario elige su nivel (asistencial, técnico, profesional o asesor) en el panel, o la primera vez que entra a comportamentales.
  - Ve las 72 situaciones comunes más las 12 de su nivel.
  - El nivel se guarda en el navegador y se puede cambiar.
- **Resumen de la sesión:** al terminar, muestra el **ajuste promedio** en las situaciones comportamentales.
- **Progreso:** "correcta" en estas preguntas significa que eligió la mejor opción, la de puntaje 3. El puntaje de cada intento se puede reconstruir a partir de la opción elegida, guardada en `question_attempts`, así que no hubo que cambiar la base de datos.

## Contenido

Fuente: Decreto 1083 de 2015, arts. 2.2.4.7 (competencias comunes) y 2.2.4.8 (por nivel jerárquico), modificados por el Decreto 815 de 2018. Cada situación cita en `texto_fuente` la definición y la conducta asociada que evalúa.

| Grupo | Competencias | Situaciones |
|---|---|---|
| Comunes (todos los niveles) | Aprendizaje continuo · Orientación a resultados · Orientación al usuario y al ciudadano · Compromiso con la organización · Trabajo en equipo · Adaptación al cambio | 12 cada una = **72** |
| Asistencial | Manejo de la información · Relaciones interpersonales · Colaboración | 4 cada una = **12** |
| Técnico | Confiabilidad técnica · Disciplina · Responsabilidad | 4 cada una = **12** |
| Profesional | Aporte técnico-profesional · Comunicación efectiva · Gestión de procedimientos · Instrumentación de decisiones | 3 cada una = **12** |
| Asesor | Confiabilidad técnica · Creatividad e innovación · Iniciativa · Construcción de relaciones · Conocimiento del entorno | 2 o 3 cada una = **12** |

- **Dificultad:** 70 Media, 49 Alta y 1 Baja.
- **Posición de la mejor opción:** exactamente 30 en cada letra.

## Proceso y resultados

1. **Redacción:** 5 redactores, cada uno sobre las conductas literales del decreto.
2. **Primer ordenamiento a ciegas:** dos evaluadores ordenaron las 4 opciones de las 120 situaciones, sin ver los puntajes.
   - La **mejor opción coincidió en 120/120**.
   - La correlación promedio entre el orden de los evaluadores y los puntajes fue de **0,97**.
3. **Corrección de pistas de forma**, porque los evaluadores podían adivinar la mejor opción sin saber de competencias. Se corrigieron 79 situaciones:
   - la mejor opción contenía a otra y le sumaba algo;
   - la segunda mejor terminaba con una cláusula negativa que la descartaba;
   - las opciones de 0 eran absurdas;
   - la mejor repetía las palabras del decreto;
   - la mejor era la única activa;
   - en asesor, los distractores seguían siempre la misma plantilla.
4. **Segundo ordenamiento a ciegas** (79): la **mejor opción coincidió en 79/79** y la correlación siguió en 0,97. Aparecieron **6 empates**, que se corrigieron.
5. **Pista de conjunto detectada:** **91 distractores** se justificaban con "porque", "pues", "ya que" o "para no", frente a **1 sola clave**. Se equilibró: ahora el 27% de las opciones justificadas son clave, cerca del 25% esperable por azar. El validador ahora detecta este sesgo en todo el banco.
6. **Tercera verificación** (8 situaciones): coincidencia de 8/8. Dos situaciones (COM-042 y AST-009) recibieron un último ajuste de redacción y de puntajes intermedios.

## Pendientes

- [ ] **Revisión humana**, idealmente por un psicólogo organizacional o alguien con experiencia en pruebas de la CNSC, del orden de las opciones de 1 y 2 puntos. Ahí está el mayor margen de discusión.
- [ ] **PRO-009** (cadena de frío): mide en parte el conocimiento del protocolo de vacunación, que no está en el decreto.
- [ ] **Sobrevivencia de los patrones de forma:** opciones "Espera a…" que siempre puntúan bajo y la fórmula "analiza, propone al jefe y deja la decisión" en profesional y asesor. Hay que vigilarlos con datos de uso.
- [ ] **Nivel directivo:** no se incluyó, porque los concursos de la CNSC rara vez lo convocan.
