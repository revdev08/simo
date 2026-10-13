# Parte 7: cuatro áreas funcionales nuevas

**Fecha:** 10 de octubre de 2026
**Estado:** 112 preguntas nuevas en `beta`, publicadas en la sección "Competencias funcionales".

## Qué se escribió

| Módulo | Archivo | Ids | Normas | Preguntas |
|---|---|---|---|---|
| Gestión Financiera y Presupuestal | [gestion-financiera.json](../../../data/preguntas/gestion-financiera.json) | TC-FIN-001 a 028 | Decreto 1068 de 2015, Parte 8 (CDP, registro, obligación, PAC, reservas, cuentas por pagar, vigencias futuras, modificaciones) · Decreto 111 de 1996 · Ley 819 de 2003 (marco fiscal, impacto fiscal, vigencias futuras territoriales) | 28 |
| Seguridad y Salud en el Trabajo | [sst.json](../../../data/preguntas/sst.json) | TC-SST-001 a 028 | Decreto 1072 de 2015 (SG-SST, reporte e investigación de accidentes, afiliación y cotización de contratistas) · Ley 1562 de 2012 | 28 |
| Gestión Documental | [gestion-documental.json](../../../data/preguntas/gestion-documental.json) | TC-GD-001 a 028 | Decreto 1080 de 2015, Parte VIII (instancias, instrumentos, TRD, procesos, transferencias, eliminación, documento electrónico, entidades suprimidas) · Ley 594 de 2000 | 28 |
| TIC y Gobierno Digital | [tic-gobierno-digital.json](../../../data/preguntas/tic-gobierno-digital.json) | TC-TIC-001 a 028 | Decreto 1078 de 2015 (Gobierno Digital, servicios ciudadanos digitales, seguridad digital, lineamientos) · Ley 527 de 1999 · Leyes 1581 de 2012 y 1712 de 2014 (aspectos de sistemas) | 28 |

En cada área:
- Casi todas son casos; solo hay 2 de conocimiento aplicado.
- Unos dos tercios combinan reglas o exigen un cálculo.
- Un tercio tiene como protagonista a un auxiliar o técnico, y el resto a un profesional.
- Dificultad: 4 Baja, 14 Media y 10 Alta (en TIC, 2, 15 y 11).
- Claves: A 8, B 8, C 6 y D 6.

## En la app

- La sección "Competencias funcionales" pasa de 3 a 7 módulos.
- El selector "Área de tu cargo" del simulacro suma Financiera, Seguridad y salud (SST), Gestión documental y TIC.

## Proceso y resultados

- **Primera resolución a ciegas (112):** las 112 claves coincidieron, sin ninguna otra opción defendible. El resolvedor tenía cada ley y también su reglamento.
- **Corrección (33 preguntas):** casi todas eran pistas, no errores de contenido:
  - opciones anidadas ("ambas");
  - claves que copiaban la norma o el enunciado;
  - claves que reunían los rasgos más repetidos;
  - distractores que se descartaban con sentido común.
  - Se rediseñaron como matrices 2×2 equilibradas. TC-GD-021 se reescribió porque repetía a la TC-GD-012.
- **Segunda resolución a ciegas (33 cambiadas):** 33/33 coincidieron.

## Errores encontrados

**1. La compilación de Función Pública del Decreto 1078 tiene un error.**
- **El error:** muestra el art. 2.2.9.1.3.3 con el texto del 2.2.9.1.3.4.
- **El texto vigente (Decreto 767 de 2022), según el normograma del MinTIC:**
  - el Comité Institucional de Gestión y Desempeño **orienta** la implementación de la Política de Gobierno Digital;
  - el jefe de TI la **lidera**;
  - el representante legal la adopta y verifica.
- **Consecuencia:** el redactor y el primer resolvedor a ciegas trabajaron con la fuente equivocada. Los dos aprobaron un distractor (TC-TIC-005) que negaba el papel del comité.
- **Corrección:** se reescribió con el texto del MinTIC. Las 14 preguntas TC-TIC-001 a 014 ahora citan el normograma del MinTIC.
- **Lección:** quedó en la guía. Hay que contrastar la compilación del gestor con la del ministerio del sector.

**2. TC-TDA-011 (lote 3).**
- **El problema:** la clave permite que la entidad que recibe los archivos de un instituto suprimido contrate su custodia. El Decreto 1080 prohíbe contratar la custodia de los documentos de conservación permanente y manda entregarlos al archivo general territorial (arts. 2.8.2.9.9 y 2.8.10.12).
- **Corrección:** el caso aclara ahora que el instituto no tenía documentos de conservación permanente (versión 2).

**3. TC-FIN-019.** El caso era de vigencias futuras para transporte escolar en el último año de gobierno, y ese gasto puede tener reglas propias. Se cambió a vigilancia, pagada con recursos propios.

**Vigencia:** se revisaron los decretos de 2024 a 2026 que modifican los decretos únicos usados en esta parte.
- **Decreto 1078:** el Decreto 391 de 2026 solo cambia las causales de archivo del Registro Único de TIC (art. 2.2.1.3.3). Los demás tocan otros títulos.
- **Decretos 1068, 1072 y 1080:** ninguno de esos decretos posteriores modifica las partes usadas.

## Cómo queda el banco

- **798 preguntas activas.**
- **626 aptas para simulacro.**
- **550 verificadas.**
- **Competencias funcionales:** 174 preguntas en 7 módulos.

## Pendientes para revisión humana

- [ ] **TC-FIN-013:** el orden del trámite de los traslados de inversión depende del parágrafo 3 del art. 2.8.1.5.6, añadido por el Decreto 313 de 2024. Hay que confirmar que siga vigente.
- [ ] **TC-SST-019:** la Ley 1562 dice "mayor de 10" para el comité y "menor de 10" para el vigía. El caso usa 8 servidores; el de exactamente 10 queda sin cubrir.
- [ ] **TC-SST-028:** la retención de aportes de los contratistas por parte de la entidad (Decreto 1273 de 2018) se regula en el Decreto 780, que no estaba en las fuentes. El caso dice expresamente que el pago le correspondía al contratista.
- [ ] **Comité Interno de Archivo en entidades territoriales:** es una discusión abierta si el Comité Institucional de Gestión y Desempeño lo sustituye. Las preguntas del lote dicen en el enunciado que el comité existe. La pregunta 166 del banco sostiene que se suprime cuando ninguna ley lo exige.
- [ ] **TC-TIC-026:** los plazos para digitalizar trámites (art. 2.2.20.7, Decreto 088 de 2022) salen de una tabla con erratas de digitalización.
