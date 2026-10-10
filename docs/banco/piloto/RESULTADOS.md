# Piloto: empleo público y carrera administrativa (Ley 909)

**Fecha:** 10 de octubre de 2026
**Archivo:** [data/preguntas/empleo-publico.json](../../../data/preguntas/empleo-publico.json) (TC-909-001 a 030)
**Estado:** `beta`, publicado en la app como módulo "Empleo Público y Carrera Administrativa". Resolución a ciegas hecha; falta revisión humana.

## Cómo se produjo

1. **Fuente:** texto vigente de la Ley 909 de 2004 y la Ley 1960 de 2019, descargado de la Secretaría del Senado (incluye las modificaciones anotadas).
2. **Redacción:** dos redactores (IA) siguieron [GUIA_REDACCION.md](../GUIA_REDACCION.md) y el reparto de subtemas de [MAPA_TRONCO_COMUN.md](../MAPA_TRONCO_COMUN.md).
   - Cada clave está respaldada por un fragmento literal en `texto_fuente`.
   - Un script verificó que esos fragmentos existen tal cual en la norma.
3. **Validación automática:** `yarn validate:questions` revisa la estructura, la explicación por opción, el sesgo de longitud y las palabras absolutas.
4. **Resolución a ciegas:** un tercer agente, sin acceso a las claves y solo con el texto de la ley, resolvió las 30 preguntas y buscó otras opciones defendibles.
5. **Ajustes:** se corrigieron las pistas que encontró el resolvedor (ver abajo).

## Resultados

| Métrica | Banco anterior | Piloto |
|---|---|---|
| Claves que coinciden en la resolución a ciegas | — (había claves erróneas confirmadas) | **30/30** |
| Preguntas con otra opción defendible | 20+ ambiguas | **0** |
| Clave = opción más larga (sin empates) | 63,7% | **16,7%** (por azar ~25%) |
| Reparto de claves A/B/C/D | — | 8 / 8 / 7 / 7 |
| Preguntas en formato caso | ~6% | **90%** (27/30) |
| Con norma, artículo y texto literal de respaldo | 0% | **100%** |
| Explicación por opción | 0% | **100%** |
| Dificultad | Inflada: solo 3 de las 138 marcadas "Alta" lo eran | 6 Baja · 16 Media · 8 Alta (estimado; se recalcula con datos de uso) |

**Hallazgos del proceso:**
- **Vigencia:** el art. 29 de la Ley 909 (concursos) fue modificado por la **Ley 2418 de 2024**, que añadió la reserva del 7% de plazas para personas con discapacidad. Una pregunta escrita de memoria con la Ley 1960 habría quedado desactualizada. Trabajar sobre el texto oficial lo detectó.
- **Pistas:** el resolvedor encontró 6 preguntas que regalaban la respuesta, porque el enunciado o un distractor repetían palabras de la clave (010, 012, 006, 022, 026). Se corrigieron y la regla quedó en la guía.
- **Preguntas fáciles:** el resolvedor estima que unas 12 serían acertadas por más del 90% de los aspirantes (por ejemplo 001, 005, 009, 011, 013, 014 y 025). No están mal, pero en el examen real una pregunta que acierta más del 95% se anula. Son candidatas a modo "Fundamentos" o a subirles la dificultad.
- **Las mejores** (más discriminantes): 016 (encargo con varios requisitos a la vez), 018 (cálculo del 30% de ascenso), 019, 021, 023 y 028 (45 días calendario frente a días hábiles).

## Pendientes antes de pasar a `estable`

- [ ] **015:** el art. 26 está marcado "condicionalmente exequible" y no se pudo leer la condición. Hay que verificar la sentencia.
- [ ] **014:** el aparte del art. 25 sobre el encargo previo está subrayado con nota de jurisprudencia. Hay que confirmar que no cambia la clave.
- [ ] Revisión humana de las 30, cuando haya revisor.
- [ ] Datos de uso: dificultad real y discriminación con las respuestas de los usuarios.

## Lecciones para escalar

1. **El proceso funciona.** Basar cada pregunta en el texto literal y resolverla a ciegas eliminó los errores de clave y las ambigüedades que tenía el banco anterior.
2. **Lo que más se escapa ahora son las pistas de redacción y las preguntas fáciles,** no los errores jurídicos. El resolvedor a ciegas debe seguir revisando eso en cada lote.
3. **Para subir la dificultad:** combinar dos o más reglas en el mismo caso (como la 016), incluir cálculos de plazos y porcentajes, y usar distractores que confundan figuras parecidas (encargo, comisión, provisionalidad).
4. **Costo de un lote de 30:** unos 15 minutos de agentes, más la revisión. Escalar a 50 preguntas por semana es viable; el cuello de botella será la revisión humana cuando la haya.
