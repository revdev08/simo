# Parte 2: gestión pública, banco viejo rehecho y retiros

**Fecha:** 10 de octubre de 2026

## 1. Lote 3: gestión pública (40 preguntas nuevas)

**Archivo:** [data/preguntas/gestion-publica.json](../../../data/preguntas/gestion-publica.json)
**Estado:** `beta`, publicado como módulo "Gestión Pública: MIPG, Presupuesto y Contratación".

| Bloque | Ids | Norma | Preguntas |
|---|---|---|---|
| Presupuesto público | TC-PRE-001 a 013 | Decreto 111 de 1996 (Estatuto Orgánico del Presupuesto) | 13 |
| Contratación estatal | TC-CON-001 a 014 | Ley 80 de 1993 y Ley 1150 de 2007 | 14 |
| MIPG | TC-MIP-001 a 007 | Decreto 1083 de 2015, Título 22 (mod. Decreto 1499 de 2017) | 7 |
| Control interno | TC-CIN-001 a 006 | Ley 87 de 1993 y Decreto 1083 de 2015, Título 21 | 6 |

## 2. Preguntas viejas rehechas (29)

Conservan su número para no perder el progreso de los usuarios. Ahora tienen `version` 2 o 3 y el formato completo: norma, artículo, texto de respaldo y explicación por opción.

| Tema | Ids |
|---|---|
| Derecho de petición | 43, 46, 47, 48 |
| Transparencia y datos personales | 86, 186, 188 |
| Código de Integridad (Ley 2016 de 2020) | 405 |
| Gestión documental | 92, 153, 166, 407 |
| Atención al ciudadano | 128, 130, 132, 134, 137 |
| MIPG y control interno | 106, 107, 112, 384, 385 |
| Comprensión lectora (con texto original) | 201, 202, 396, 397, 398 |
| Razonamiento | 264, 391 |

Las preguntas 43, 48, 264 y 398 estaban ocultas por errores. Ya quedaron corregidas y vuelven a mostrarse.

## 3. Retiros (61)

Quedan en `questions.json` con `"estado": "retirada"` y un campo `motivo_retiro`. La app no las muestra.
- **57 por la clasificación:**
  - 44 son duplicados conceptuales (por ejemplo, 13 variantes repetidas de los principios de Hábeas Data).
  - 12 están fuera del alcance del examen (incluidas las específicas de la Secretaría Distrital de Gobierno).
  - El resto tiene distractores absurdos o citas imprecisas.
- **4 de disciplinario** (57, 62, 71 y 383), reemplazadas por el lote 2.
- Las 39 comportamentales marcadas para retiro **siguen activas** hasta que la Parte 3 tenga reemplazos.

## Resultados del proceso

| Indicador | Lote 3 | Rehechas |
|---|---|---|
| Claves que coinciden en la resolución a ciegas | 40/40 | 29/29 |
| Con otra opción defendible | 1 (TC-PRE-005), corregida y verificada otra vez | 0 |
| Corregidas por pistas o por ser demasiado fáciles | 7, verificadas otra vez: 7/7 | 5, verificadas otra vez: 5/5 |
| Preguntas de caso | 39 de 40 | 27 de 29 |
| Clave = opción más larga | 20% | 10% |

## Hallazgos que habrían sido errores sin el proceso

- **Los arts. 36 y 110 del Decreto 111** (composición del gasto y ordenación del gasto) fueron declarados **inexequibles con efectos a partir del 1 de enero de 2027**. No se usaron como base de ninguna clave.
- **El art. 9 de la Ley 1474** (informe de control interno cada cuatro meses) **fue modificado**: hoy el informe es semestral (art. 14 de la Ley 87, modificado por el Decreto Ley 2106 de 2019). La pregunta TC-CIN-004 usa el texto viejo como distractor.
- **La caducidad en los contratos del Programa de Alimentación Escolar (PAE)** cambió con la Ley 2195 de 2022 (TC-CON-011).
- **El texto de lectura de las preguntas 397 y 398** era un fragmento de una revista (*Mundo Científico*, 2001). Se reemplazó por un texto original sobre el fenómeno de El Niño, para evitar problemas de derechos de autor.
- **Las preguntas sobre "caracterización" y "lenguaje claro"** no tenían base legal en las fuentes disponibles. Se reescribieron sobre los deberes de atención del CPACA y la Ley 1712.

## Pendientes para revisión humana

- [ ] **186:** confirmar que ceder datos a un patrocinador privado, con autorización de los titulares, cumple el principio de finalidad.
- [ ] **TC-CIN-001:** que el jefe responda "ante el secretario administrativo" es una inferencia por jerarquía, no texto literal de la ley.
- [ ] **TC-CIN-003:** en la tabla del art. 2.2.21.8.5 se perdió la "o" entre alternativas; se interpretaron los 56 meses como la equivalencia sin posgrado.
- [ ] **TC-PRE-005:** el enunciado usa "caducan"; el término del decreto es "expiran".
- [ ] **46 y 47:** el enunciado aclara que los plazos se cuentan en días hábiles (regla general de la Ley 4 de 1913, art. 62).
- [ ] Notas de jurisprudencia que no se pudieron leer: Ley 80 art. 45; Ley 87 arts. 11 y 14.

## Estado del banco activo después de la Parte 2

| Módulo | Activas | Verificadas con el proceso nuevo |
|---|---|---|
| Empleo Público y Carrera Administrativa | 30 | 30 |
| Disciplinario y Anticorrupción | 38 | 38 |
| Gestión Pública: MIPG, Presupuesto y Contratación | 40 | 40 |
| Fundamentos Constitucionales y Legales | 93 | 6 |
| Gestión Pública y Procesos Administrativos | 85 | 16 |
| Habilidades y Competencias Transversales | 52 | 5 |
| Razonamiento Cuantitativo | 50 | 2 |
| Competencias Comportamentales | 64 | 0 (Parte 3) |
| **Total** | **452** | **137** |
