# Parte 5: contenido de los módulos débiles

**Fecha:** 10 de octubre de 2026
**Estado:** 119 preguntas nuevas en `beta`, publicadas. Una (TC-ATC-002) queda en `borrador` para revisión humana.

## Qué se escribió

| Archivo | Ids | Norma o tipo | Preguntas |
|---|---|---|---|
| [constitucion-estado.json](../../../data/preguntas/constitucion-estado.json) | TC-CP-001 a 028 · TC-EST-001 a 012 | Constitución Política (con Actos Legislativos vigentes) · Ley 489 de 1998 | 40 |
| [procedimiento-administrativo.json](../../../data/preguntas/procedimiento-administrativo.json) | TC-CPA-001 a 014 | CPACA (mod. Ley 2080 de 2021): notificación, recursos, firmeza, silencio, revocatoria | 14 |
| [atencion-ciudadano.json](../../../data/preguntas/atencion-ciudadano.json) | TC-ATC-001 a 014 | CPACA arts. 5–9 · Ley 2052 de 2020 · Ley 1712 · Ley 1618 · Ley 1474 art. 76 | 14 |
| [transparencia-archivo.json](../../../data/preguntas/transparencia-archivo.json) | TC-TDA-001 a 012 | Ley 1712 de 2014 · Ley 1581 de 2012 · Ley 594 de 2000 | 12 |
| [aptitudes.json](../../../data/preguntas/aptitudes.json) | TC-LEC-001 a 024 · TC-RAZ-001 a 016 | 6 textos originales con 4 preguntas cada uno · tablas, indicadores y lógica | 40 |

## Proceso y resultados

- **Primera resolución a ciegas** (120 preguntas): **las 120 claves coincidieron.**
  - 4 preguntas tenían otra opción defendible: EST-002, ATC-002, LEC-019 y RAZ-004.
  - La CPA-009 tenía un error de fecha: el plazo vence el martes 27 de enero, no el lunes 26.
- **Corrección:** se editaron 28 preguntas.
  - Las 4 ambigüedades.
  - La fecha de la CPA-009.
  - 13 preguntas que regalaban la respuesta.
  - 10 demasiado fáciles.
- **Segunda resolución a ciegas** (28 editadas): **las 28 coincidieron.**
  - La TC-ATC-002 sigue teniendo una segunda lectura defendible. El decreto municipal exige el paz y salvo, y ese documento todavía no existe. Queda en `borrador` para que la revise un abogado.
- **Sesgo de longitud en todo el banco verificado** (377 preguntas): la clave es la opción más larga en el 24% de los casos, la segunda en el 34%, la tercera en el 21% y la más corta en el 20%. Está cerca del azar, así que la longitud no permite adivinar.

## En la app

- **Nuevo componente [QuestionText](../../../components/study/QuestionText.tsx):**
  - respeta los párrafos del enunciado;
  - convierte las líneas con `|` en una tabla real;
  - muestra en letra normal los enunciados largos, como los textos de lectura.
- **Se usa en** el modo estudio, el simulacro y la revisión de resultados.
- **En el simulacro gratis** se respetan los saltos de línea.

## Cómo queda el banco

| Módulo | Activas | Aptas para simulacro | Verificadas |
|---|---|---|---|
| Constitución y Estructura del Estado | 66 | **41** (antes 1) | 40 |
| Empleo Público y Carrera Administrativa | 30 | 30 | 30 |
| Derecho de Petición y Procedimiento Administrativo | 37 | 27 | 18 |
| Transparencia, Datos Personales y Archivo | 71 | 27 | 19 |
| Disciplinario y Anticorrupción | 60 | 40 | 38 |
| Gestión Pública: MIPG, Presupuesto y Contratación | 65 | 50 | 46 |
| Atención al Ciudadano | 36 | 19 | 18 |
| Competencias Comportamentales | 120 | 120 | 120 |
| Razonamiento Lógico y Cuantitativo | 66 | 64 | 18 |
| Comprensión Lectora | 56 | 34 | 29 |
| Herramientas de Oficina y Seguridad Digital | 17 | 0 | 0 |
| **Total** | **624** | **452** | **376** |

## Pendientes para revisión humana

- [ ] **TC-ATC-002:** paz y salvo exigido por decreto frente al art. 9 num. 4 del CPACA.
- [ ] **TC-CP-025:** prohibición de participar en política de los demás servidores mientras no exista la ley estatutaria (C-794 de 2014).
- [ ] **Días "hábiles":** varios enunciados lo aclaran (regla general de la Ley 4 de 1913, que no está en las fuentes).
- [ ] **Notas de jurisprudencia no visibles en la fuente:** Ley 489 arts. 9, 12, 61, 66 y 82; Ley 80 art. 45.
