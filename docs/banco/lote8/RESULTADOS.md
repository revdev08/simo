# Partes 8 y 9: tronco común, ofimática y tres áreas funcionales

**Fecha:** 10 y 11 de octubre de 2026
**Estado:** 240 preguntas nuevas en `beta`.

## Qué se escribió

**Parte 8: lo que presentan todos (156)**

| Módulo | Ids | Normas | Preguntas |
|---|---|---|---|
| Empleo Público y Carrera Administrativa | TC-EPC-001 a 028 | Ley 909 de 2004, Ley 1960 de 2019, Decreto 1083 de 2015 (provisión, período de prueba, evaluación, comisiones de personal, empleos temporales, gerencia pública, retiro) | 28 |
| Derecho de Petición y Procedimiento Administrativo | TC-CPA-015 a 042 | Ley 1755 de 2015, CPACA (actuaciones, notificación, recursos, silencio, revocatoria, sancionatorio) | 28 |
| Atención al Ciudadano | TC-ATC-015 a 042 | CPACA arts. 5 a 9, Decreto 1166 de 2016, Ley 1618 de 2013, Ley 2052 de 2020, Ley 1474 art. 76, Ley 1757 de 2015 (rendición de cuentas y control social), Decreto 1083 | 28 |
| Transparencia, Datos Personales y Archivo | TC-TDA-013 a 026 | Ley 1712 de 2014 y Decreto 1081 de 2015; Ley 1581 de 2012 y Decreto 1074 de 2015 | 14 |
| Constitución y Estructura del Estado | TC-EST-013 a 026 | Ley 489 de 1998, Ley 1757 de 2015 (mecanismos de participación), Constitución | 14 |
| Disciplinario y Anticorrupción | TC-DIS-028 a 041 | Ley 1010 de 2006 (acoso laboral), Ley 1952 de 2019 con la Ley 2094 de 2021 | 14 |
| Herramientas de Oficina y Seguridad Digital | TC-OFI-001 a 030 | Excel, Word y correo en español (verificado en el soporte de Microsoft), seguridad digital | 30 |

**Parte 9: áreas funcionales nuevas (84)**

| Módulo | Ids | Normas | Preguntas |
|---|---|---|---|
| Control Interno | TC-CI-001 a 028 | Ley 87 de 1993, Decreto 1083 (arts. 2.2.21.x), Decreto 1499 de 2017, Ley 1474 | 28 |
| Planeación y Proyectos de Inversión | TC-PLA-001 a 028 | Ley 152 de 1994, Constitución arts. 339 a 344, Decreto 1082 (Título 6 vigente) | 28 |
| Contabilidad Pública | TC-CTB-001 a 028 | Marco Conceptual y Normas del Marco Normativo para Entidades de Gobierno (CGN), actualizados con la Resolución 339 de 2025 | 28 |

Además se auditaron las 48 preguntas de razonamiento que no tenían revisión:
- Las 48 claves eran correctas.
- Se retiró la 394, porque su regla era verbal y no se anunciaba.
- Se aclararon la 242 y la 254.
- 15 pasaron a "Concepto básico" por ser triviales.

## Proceso y resultados

- **Primera resolución a ciegas (240):** ninguna clave difirió. En 30 preguntas el resolvedor encontró otra opción defendible o una pista.
- **Corrección (89 preguntas):**
  - Opciones anidadas o con la clave como la única "completa", rediseñadas como matrices 2×2.
  - Distractores débiles.
  - Supuestos que faltaban en el enunciado.
- **Repeticiones entre redactores:** cuatro preguntas de procedimiento repetían casos de atención al ciudadano (peticiones verbales) y se reescribieron con otros temas del derecho de petición.
- **Segunda y tercera verificación (89):** todas las claves coincidieron.
  - En 12 el resolvedor mencionó una trampa cercana. Se revisaron una por una y se mantuvieron, porque la norma la descarta. Queda nota en `revision.nota`.
  - Dos preguntas y una opción se ajustaron después y se volvieron a verificar: TC-ATC-023, TC-TDA-014 y la opción B de TC-CPA-025.

## Hallazgos sobre las fuentes

1. **Textos de Función Pública con tildes dañadas.**
   - **El problema:** el gestor declara ISO-8859-1 pero sirve UTF-8, y la conversión anterior los dejó con "Ã".
   - **Arreglo:** se volvieron a convertir.
   - **Comprobación:** de los 1.218 fragmentos citados en el banco, 1.216 aparecen literalmente o casi literalmente.
2. **El tachado del Senado se pierde al pasar a texto.**
   - **Auditoría (26 leyes, 74 páginas):** ninguna pregunta activa citaba texto inexequible.
   - **Para los redactores:** la lista de tachados quedó disponible.
3. **Una prevalencia de la ley sobre el decreto que el redactor pasó por alto (TC-EPC-007).** El Decreto 1083 reanuda el período de prueba 3 meses después del parto, pero la Ley 909 lo reanuda al terminar la licencia de maternidad. La pregunta ahora sigue la ley.
4. **El Título 6 del Decreto 1082 aparece dos veces en el gestor, sin aviso.** Primero va el vigente (SUIP, PIIP y Banco Único) y luego el anterior (BPIN y SUIFP). Ninguna clave usa el anterior.
5. **Contabilidad: algunas opciones se pueden defender con las normas internacionales (NICSP), pero no con la CGN.** Los enunciados se anclaron al texto de la CGN y las explicaciones dicen en qué se aparta.

## Cómo queda el banco

**1.037 preguntas activas · 853 aptas para simulacro · 837 verificadas.**
- Aptas por sección: generales 360, funcionales 258, aptitudes 115, comportamentales 120.

## Pendientes para revisión humana

- [ ] **TC-CTB-014:** la decisión de liquidar como hecho posterior que no implica ajuste (Normas 5.2), frente al párrafo 42 del Marco Conceptual.
- [ ] **TC-DIS-028:** acoso laboral como falta gravísima; el art. 10 de la Ley 1010 remite al Código Disciplinario derogado.
- [ ] **TC-EPC-007:** la licencia de maternidad de 18 semanas (Ley 2114 de 2021) se da como dato del caso.
- [ ] **TC-PLA-019, 021, 022 y 026:** confirmar con el normograma del DNP que ningún decreto posterior a 2023 cambió las fechas del POAI ni el cierre de proyectos.
- [ ] **TC-ATC-042:** el art. 2.2.38.18 del Decreto 1083 (Sistema Nacional de Integridad, Decreto 382 de 2026) aparece en el gestor con la numeración mezclada.
