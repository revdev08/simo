# Resultados de la Parte 23: lectura crítica y razonamiento cuantitativo del concurso docente (11 de octubre de 2026)

Meta: que la prueba de aptitudes del concurso docente tenga preguntas propias de lectura crítica y razonamiento cuantitativo. Antes se practicaban con los módulos generales de aptitudes, cuyos textos y casos son del empleo administrativo. Ahora los textos y los datos son de la escuela: matrícula, deserción, resultados de pruebas, presupuesto, horarios y transporte escolar.

Cada archivo pasó por:
1. una resolución a ciegas;
2. una corrección;
3. una segunda resolución a ciegas de las preguntas corregidas.

Las 160 preguntas quedan en estado `beta` y todas coinciden con la resolución a ciegas.

## Lo que se publicó

Las 160 preguntas están en `data/preguntas/aptitudes-docente.json`; capa 2, eje `docentes`, sin norma.

| Módulo | Archivo | Preguntas | Qué cubre |
|---|---|---:|---|
| Lectura Crítica (Prueba Docente) | lcd_a | 20 | Contenidos locales: sentido de palabras y frases, información explícita, cifras en el texto |
| Lectura Crítica (Prueba Docente) | lcd_b | 20 | Tesis e idea global, estructura y cohesión (conectores), reglas de escritura |
| Lectura Crítica (Prueba Docente) | lcd_c | 20 | Reflexión y evaluación: argumentos, supuestos, falacias y fuentes |
| Lectura Crítica (Prueba Docente) | lcd_d | 20 | Textos discontinuos (tablas, avisos, cronogramas) y literarios |
| Razonamiento Cuantitativo (Prueba Docente) | rcd_a | 20 | Lectura de tablas y gráficos, cambio de representación, porcentajes, tendencias |
| Razonamiento Cuantitativo (Prueba Docente) | rcd_b | 20 | Formular y ejecutar: presupuesto escolar (FSE y PAE), proporciones, horarios, áreas, unidades |
| Razonamiento Cuantitativo (Prueba Docente) | rcd_c | 20 | Estadística: promedios, ponderados, dispersión, probabilidad, conteo, muestras |
| Razonamiento Cuantitativo (Prueba Docente) | rcd_d | 20 | Argumentar: validar afirmaciones con datos, gráficos engañosos, información necesaria para decidir |

- **Dificultad por archivo:** 4 baja, 9 media y 7 alta.
- **Claves:** 40 por letra.
- **Longitud de la clave:** es estrictamente la opción más larga en 37 preguntas (23 %) y la más corta en 22 (14 %). En otras 41 empata con la más larga; casi todas son opciones numéricas.
- **Acierto estimado por los resolutores:** 72 % en promedio, con un rango de 35 a 95.

En el plan de estudio, los 14 perfiles de docentes tienen estos módulos con peso 2 (2,5 para el perfil general). Los módulos generales (Comprensión Lectora; Razonamiento Lógico y Cuantitativo) quedan con 0,5.

## Resolución a ciegas

| Archivo | Primera vuelta | Correcciones |
|---|---|---|
| lcd_a | 19/20 | 015 y 016: el texto no decía que los 142 que faltaban incluían a quienes no aprobaron. 013: distractores reescritos |
| lcd_b | 19/20 | 033: la opción A también era una tesis defendible; se cambió por un ejemplo |
| lcd_c | 19/20 | 053 B y 059 A reescritas: B se podía leer como correcta y A era demasiado obvia |
| lcd_d | 20/20 | 066 a 068: los porcentajes de 2025 no cuadraban con los 58 estudiantes evaluados; ahora salen de 5, 22, 21 y 10 estudiantes. 061: B ajustada |
| rcd_a | 20/20 | — |
| rcd_b | 20/20 | — |
| rcd_c | 20/20 | — |
| rcd_d | 19/20 | 069: D era defendible si se leía «frenarse» como «dejar de crecer»; ahora su razón es claramente inválida. 066: la premisa no decía que la vereda nunca pasa de 45 estudiantes. 065: era la única opción a favor del docente; ahora hay dos. 075: A y D decían lo mismo; D ahora es un porcentaje sobre la matrícula, que no cambia nada |

En la segunda vuelta, las 15 preguntas corregidas coincidieron y ninguna tiene otra opción defendible. Después de publicar se acortó la clave de TC-LCD-023, que era 14 caracteres más larga que la siguiente.

## Cambio en la app

`components/study/QuestionText.tsx` solo convertía en tabla las líneas con tres o más celdas. Las tablas de dos columnas («Mes | Llegadas tarde») se veían como texto con barras. Ahora también se convierten en tabla cuando la línea vecina es fila de la misma tabla. Esto arregla 21 preguntas: 19 de este lote y TC-RAZ-017 y TC-RAZ-029 del banco anterior. Ninguna otra línea del banco cambia.

## Lecciones para la guía de redacción

- **Cifras en el texto:** si el texto da un total y una parte, debe decir qué incluye la diferencia; si no, la resta parece una respuesta correcta.
- **Opciones del tipo «No se sostiene porque…»:** el distractor que llega al veredicto correcto debe tener una razón inválida sin discusión, no una razón débil pero aceptable.
- **Veredicto de las opciones:** en las preguntas de «quién tiene razón», al menos dos opciones deben estar del lado de la clave; si no, el patrón 3 contra 1 la delata.
- **Tablas con porcentajes:** deben salir de números enteros de personas sobre el total del grupo; conviene calcularlas antes de redondear.
