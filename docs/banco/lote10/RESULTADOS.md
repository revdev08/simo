# Partes 10 a 14: paquetes por convocatoria, áreas por nivel, docentes y aptitudes

**Fecha:** 11 de octubre de 2026
**Estado:** 559 preguntas nuevas en `beta` y 1 en revisión.

## Por qué estas partes

Antes de escribir revisamos el estado de los procesos de la CNSC al 11 de octubre de 2026. Tres datos cambiaron el plan:

1. **El concurso más urgente es la DIAN 2676.** La prueba escrita es el domingo 8 de noviembre de 2026, con unos 113.600 inscritos en ingreso. Solo se evalúan normas expedidas antes del 19 de junio de 2026.
2. **En el sistema general de la CNSC no hay prueba de "competencias generales".** Las funcionales pesan 60% (son eliminatorias con 65), las comportamentales 20% y los antecedentes 20%. Los temas del Estado entran dentro de las funcionales, según los ejes de cada empleo.
3. **El proceso del Ministerio del Trabajo ya está en listas de elegibles.** Los que vienen en 2027 son el concurso docente (más de 28.000 vacantes), ESE 2 (3.044), Distrito Capital 7 y Territorial 14 (3.228), Territorial 12 (1.573) y Entidades del Orden Nacional 2026 (1.665).

La investigación completa con fuentes quedó en el scratchpad de la sesión. Lo verificado se usó en las páginas de "Mi convocatoria" (`lib/convocatorias/catalogo.ts`).

## Qué se escribió

| Parte | Módulo | Ids | Preguntas | Normas principales |
|---|---|---|---|---|
| 10 | Gestión Tributaria (DIAN) | TC-TRI-001 a 060 | 60 | Estatuto Tributario; Resolución DIAN 227 de 2025 (compila la 165 de 2023) |
| 10 | Aduanero y Cambiario (DIAN) | TC-ADU-001 a 040 | 40 | Decreto 1165 de 2019; Decreto 1068 de 2015 (Parte 17); Decreto 1742 de 2020 |
| 13 | Carrera y Gestión Institucional (DIAN) | TC-DGI-001 a 020 | 20 | Decreto Ley 927 de 2023; Ley 2016 de 2020; CPACA; Decreto 1083 |
| 10 | Derecho Laboral | TC-LAB-001 a 040 | 40 | CST con la Ley 2466 de 2025; Decreto 1072 de 2015 |
| 10 | Inspección, Vigilancia y Control del Trabajo | TC-IVC-001 a 020 | 20 (1 en revisión) | Ley 1610 de 2013; CST; Decreto 1072; CPACA |
| 11 | Talento Humano | TC-TH-031 a 070 | 40 | Decreto 1083; Decreto Ley 1045 de 1978; Decreto 1567 de 1998; Ley 909 |
| 11 | Contratación Estatal Aplicada | TC-CAP-017 a 056 | 40 | Leyes 80, 1150, 1474 y 2195; Decreto 1082 |
| 11 | Gestión Jurídica | TC-JUR-017 a 056 | 40 | Decreto 2591; Leyes 393, 472, 678, 610 y 2220; CPACA |
| 11 | Almacén e Inventarios (nuevo) | TC-ALM-001 a 020 | 20 | Normas para Entidades de Gobierno (CGN); Decreto 1082; Ley 610; Ley 1952 |
| 11 | Gestión Financiera y Presupuestal (tesorería) | TC-TES-001 a 020 | 20 | Decreto 1068; Decreto 111; Ley 819; Estatuto Tributario |
| 12 | Pedagogía y Normativa Docente (nuevo) | TC-DOC-001 a 040 | 40 | Decreto 1075 de 2015; Decreto Ley 1278 de 2002; Ley 115; Ley 1620 |
| 12 | Gestión Escolar (Directivos Docentes) (nuevo) | TC-DIR-001 a 040 | 40 | Decreto 1075; Ley 115; Ley 715; Ley 1620 |
| 13 | Sistema de Salud y ESE (nuevo) | TC-SAL-001 a 040 | 40 | Leyes 100, 1122, 1438, 1751, 1164 y 2015; Decreto 780 de 2016; Resolución 3100 de 2019 |
| 13 | Gestión Territorial (nuevo) | TC-TER-001 a 040 | 40 | Leyes 136, 1551, 617, 2200 y 715; Constitución |
| 14 | Comprensión Lectora (lectura crítica) | TC-LEC-025 a 064 | 40 | Textos originales |
| 14 | Razonamiento Lógico y Cuantitativo | TC-RAZ-017 a 036 | 20 | — |

**Diferencia por nivel (Parte 11, salud y territorial):** la mitad de las preguntas son casos operativos (`nivel: ["asistencial","tecnico"]`) y la otra mitad de análisis (`["profesional","asesor"]`). La app ya envía el nivel de estas preguntas al navegador, y cada aspirante ve las de su nivel más las comunes.

## Proceso y resultados

- **Primera resolución a ciegas (560):** ninguna clave difirió.
- **Correcciones (unas 200 preguntas):**
  - otras opciones defendibles;
  - supuestos que faltaban en el enunciado;
  - claves que copiaban la norma;
  - distractores débiles;
  - opciones en pares;
  - una pregunta duplicada (TC-ADU-025, reemplazada por un caso de cabotaje).
- **Segunda resolución a ciegas** de todo lo corregido: todas las claves coincidieron. Las trampas que se mantuvieron llevan nota en `revision.nota`.

## Hallazgos sobre las fuentes (y que corrigieron preguntas)

1. **Decreto Ley 920 de 2023 (régimen sancionatorio aduanero): ya no rige.** Se declaró inexequible con efectos diferidos hasta el 20 de junio de 2026 (C-072 de 2025) y lo derogó la Ley 2586 de 2026, del 19 de junio, que queda fuera del corte de la DIAN 2676. Una pregunta que lo daba por aplicable (TC-ADU-015) se reescribió, y el encargo de 20 preguntas sobre sanciones aduaneras se cambió por otros temas vigentes del Decreto 1165.
2. **Decreto Ley 71 de 2020 (carrera DIAN): derogado** por el Decreto Ley 927 de 2023 (art. 152). Ninguna pregunta lo cita.
3. **Resolución DIAN 165 de 2023: compilada y derogada** por la Resolución 227 de 2025 (Resolución Única). Las 20 preguntas de factura electrónica citan ahora la 227; el texto de las reglas evaluadas es idéntico.
4. **Ley 610 de 2000: la caducidad sigue en 5 años.** El Decreto Ley 403 de 2020 la había subido a 10, pero la Corte declaró inexequibles esas modificaciones (C-090 de 2022). Las notas del Senado están en `basedoc/js/<norma>.js`.
5. **Decreto 1072 frente al CST reformado:** el decreto todavía pide autorización para horas extras y la Ley 2466 de 2025 la eliminó. Prevalece la ley.
6. **Normogramas de Avance Jurídico (DIAN, Supersalud):** después del texto vigente vienen "Notas de Vigencia" y "Legislación Anterior"; a veces ese encabezado está vacío y lo sigue texto vigente. Se revisó caso por caso.

## Cómo queda el banco

**1.596 preguntas activas · 1.412 aptas para simulacro · 1.275 verificadas a ciegas.** Antes de estas partes eran 1.037, 853 y 837.
- Aptas por sección: generales 360, funcionales 757, aptitudes 175, comportamentales 120.
- Módulos nuevos: Gestión Tributaria (60), Aduanero y Cambiario (40), Carrera y Gestión Institucional DIAN (20), Derecho Laboral (40), Inspección del Trabajo (19 activas), Almacén e Inventarios (20), Sistema de Salud y ESE (40), Gestión Territorial (40), Pedagogía y Normativa Docente (40) y Gestión Escolar (40).
- Módulos ampliados: Talento Humano (70), Contratación Estatal Aplicada (56), Gestión Jurídica (56), Gestión Financiera (48), Comprensión Lectora (96) y Razonamiento (85).

## Pendientes para revisión humana

- [ ] **TC-IVC-005 (en revisión, no se muestra):** destino de las multas. El art. 486 del CST compilado dice SENA y la clave sigue al FIVICOT del Decreto 1072. Hay que confirmar que el art. 201 de la Ley 1955 de 2019 sigue vigente después de la Ley 2294 de 2023.
- [ ] **TC-TES-008:** el criterio de "servicio prestado con organización propia" para no aplicar la tabla del art. 383 viene de la doctrina DIAN y del Decreto 1625, que no estaban entre las fuentes.
- [ ] **TC-ADU-013:** el art. 295 del Decreto 1165 habla de "aprehensión y decomiso"; la pregunta solo usa la aprehensión del exceso y el rescate, que siguen vigentes.
- [ ] **TC-SAL-007 y 017:** régimen de gerentes en ESE de primer nivel (Ley 1438 art. 70 frente al Decreto 780). La designación y el período de gerentes se dejaron fuera porque la Ley 1797 de 2016 no estaba entre las fuentes.
- [ ] **Concurso docente:** la compilación del Decreto 1075 de Función Pública dice "última actualización: 29 de abril de 2024". Conviene contrastar con el normograma del MinEducación los artículos del concurso, la evaluación y la provisión.
- [ ] **TC-DGI-008:** vigencia de la lista de elegibles de 1 año (art. 36 del Decreto Ley 927); la Sentencia C-197 de 2025 solo tocó un inciso del parágrafo transitorio.
