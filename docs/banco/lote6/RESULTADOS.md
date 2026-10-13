# Parte 6: competencias funcionales (ejes que se repiten entre entidades)

**Fecha:** 10 de octubre de 2026
**Estado:** 62 preguntas nuevas en `beta`, publicadas en la nueva sección "Competencias funcionales".

## Qué se escribió

| Módulo | Archivo | Ids | Norma | Preguntas |
|---|---|---|---|---|
| Talento Humano | [talento-humano.json](../../../data/preguntas/talento-humano.json) | TC-TH-001 a 030 | Decreto 1083 de 2015 (situaciones administrativas, capacitación, estímulos, evaluación y retiro) · Decreto-ley 1567 de 1998 (mod. Ley 1960 de 2019) | 30 |
| Contratación Estatal Aplicada | [contratacion-aplicada.json](../../../data/preguntas/contratacion-aplicada.json) | TC-CAP-001 a 016 | Decreto 1082 de 2015: plan anual, estudios previos, SECOP, pliegos y adendas, menor y mínima cuantía, concurso de méritos, contratación directa, garantías y RUP | 16 |
| Gestión Jurídica | [gestion-juridica.json](../../../data/preguntas/gestion-juridica.json) | TC-JUR-001 a 016 | Decreto 2591 de 1991 (trámite de tutela) · CPACA (medios de control y caducidad) · Ley 2220 de 2022 (conciliación y comités) | 16 |

## En la app

- **Nueva sección "Competencias funcionales"** en el modo estudio, con los 3 módulos.
- **En el simulacro, selector opcional "Área de tu cargo":** Ninguna, Talento humano, Contratación o Jurídica.
  - **Sin área,** el simulacro no incluye preguntas funcionales: 60% generales, 15% aptitudes y 25% comportamentales.
  - **Con área,** incluye las de esa área: 45% generales, 20% funcionales, 15% aptitudes y 20% comportamentales.
  - El área se guarda en el navegador.

## Proceso y resultados

- **Primera resolución a ciegas** (62): **las 62 claves coincidieron.** Seis tenían otra opción defendible:
  - TH-005, TH-011, TH-013 y TH-023;
  - JUR-005 (temeridad con distinto accionado);
  - JUR-012 (conflicto entre el CPACA y la Ley 2220).
- **Corrección:** 11 preguntas.
- **Segunda resolución a ciegas** (11): **11/11 coincidieron**, sin opciones defendibles.

## Error encontrado en el banco publicado

- **TC-909-025** (lote 1): la clave permitía ordenar en marzo una calificación extraordinaria del desempeño.
- **El error:** el Decreto 1083 (art. 2.2.8.1.4 num. 2) exige que hayan pasado **3 meses desde la última calificación**, y la anual se produce en febrero.
- **Por qué no se detectó:** la resolución a ciegas del lote 1 solo tenía la Ley 909, no su reglamento.
- **Corrección:** se pasó el caso a junio, con la regla del decreto en la explicación (versión 2).
- **Lección:** cuando un tema tiene ley y reglamento, la resolución a ciegas debe recibir los dos.

## Cómo queda el banco

**686 preguntas activas · 514 aptas para simulacro · 438 verificadas.**

## Pendientes para revisión humana

- [ ] **TC-TH-001:** si la prórroga de 30 días de la licencia ordinaria se suma al tope anual (lectura de Función Pública).
- [ ] **TC-TH-018:** provisionales y capacitación. La Ley 1960 modificó el Decreto-ley 1567, pero el parágrafo del art. 2.2.10.5 del Decreto 1083 sigue sin nota de derogatoria.
- [ ] **TC-JUR-012:** conflicto entre el CPACA y la Ley 2220 sobre la conciliación cuando ambas partes son entidades públicas.
- [ ] **TC-CAP-012:** si una garantía de seriedad insuficiente se puede subsanar.
- [ ] **Decreto 1045 de 1978** (vacaciones y prestaciones): no se encontró en una fuente oficial confiable, así que no hay preguntas de liquidación de vacaciones o primas.
