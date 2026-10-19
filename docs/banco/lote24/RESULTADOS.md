# Resultados del lote 24: temas de las fichas de la DIAN sin preguntas

Fecha: 19 de octubre de 2026. **Se publicaron 60 preguntas nuevas:**
- TC-TRI-121 a TC-TRI-160 en `tributario-dian.json`, que pasa de 120 a 160 preguntas;
- TC-ADU-081 a TC-ADU-100 en `aduanero-dian.json`, que pasa de 80 a 100.

Todas son `beta`, capa 4, autor IA, sin revisión humana y con resolución a ciegas coincidente. El motivo y el reparto están en [PLAN.md](PLAN.md).

## Archivos y métricas

| Archivo | Ids | Temas | Media / Alta | Clave más larga / más corta | Acierto estimado medio |
|---|---|---|---:|---:|---:|
| [opec_a.json](opec_a.json) | TRI 121–140 | medidas cautelares, procesos concursales, entidades recaudadoras, cobro persuasivo | 15 / 5 | 4 / 2 | 65,5 % |
| [opec_b.json](opec_b.json) | TRI 141–160 | teoría de la imposición, tributación internacional, recibo de declaraciones, control extensivo | 13 / 7 | 4 / 4 | 61,3 % |
| [opec_c.json](opec_c.json) | ADU 081–100 | origen, clasificación arancelaria, San Andrés y zonas de régimen aduanero especial, custodia de mercancías | 10 / 10 | 4 / 3 | 68,3 % |

- **Claves:** cada archivo tiene 5 por letra. Los archivos del banco quedan en 40/40/40/40 en tributario y 25/25/25/25 en aduanas.
- **Sesgo de longitud en los archivos del banco:**
  - tributario: la clave es la opción más larga en el 11 % y la más corta en el 16 %;
  - aduanas: la más larga en el 13 % y la más corta en el 20 %.
- **Casi duplicados:** ninguno. Todos los pares de enunciados tienen menos del 45 % de palabras en común.

Cada archivo tiene su `<archivo>.temas.json`, y esos temas se sumaron a `data/opec/etiquetas-dian-2676.json` (298 preguntas etiquetadas). Con ellas, todos los temas propios de la DIAN con más de 80 vacantes tienen preguntas: `node scripts/opec/verificar-temas.mjs dian-2676`.

## Fuentes

Además de las de siempre (ET, Decreto 1165 de 2019, Constitución, Decreto 1742 de 2020), se usaron las compilaciones oficiales de:
- la Ley 1116 de 2006 (insolvencia);
- la Ley 4 de 1913 (cómputo de plazos);
- la Ley 915 de 2004 (Puerto Libre de San Andrés);
- el Decreto 1881 de 2021 (Arancel de Aduanas, reglas generales interpretativas), tomado del normograma de la DIAN.

Las fuentes se descargaron en la carpeta temporal y no en el repositorio.

`verificar-fragmentos` encuentra todos los fragmentos literales en alguna de las dos carpetas de fuentes. Las únicas alertas de texto tachado son las falsas alarmas de siempre: «o abonos en cuenta», tachado solo en el art. 385 del ET, y «treinta y cinco por ciento», tachado solo en el art. 401-2.

La custodia y disposición de mercancías se tomó del título 20 del Decreto 1165 (arts. 732 a 754). Ese título sigue vigente: el Decreto Ley 920 de 2023 solo derogó los títulos 14 a 16. Las tres preguntas usan mercancía abandonada y no tocan la aprehensión ni el decomiso.

## Resolución a ciegas

| Ronda | Preguntas | Coinciden | Grave | Media | Leve |
|---|---:|---:|---:|---:|---:|
| 1 | 60 | 60 | 1 | 0 | 20 |
| 2 (corregidas) | 22 | 22 | 0 | 0 | 13 |

Principales correcciones:
- **TC-TRI-156** duplicaba la decisión de TC-TRI-138 (imputación proporcional del pago, ET art. 804). Se reescribió sobre el pago con recibo oficial sin declaración presentada: el art. 580-1, incs. 6 y 7 y parágrafos, solo aplica a los años gravables 2006 a 2015.
- **TC-ADU-082** (grave) admitía dos lecturas del art. 315 del Decreto 1165. Se fijó el supuesto del acuerdo comercial y las opciones quedaron en una rejilla 2×2.
- **Normas supuestas:** se marcaron con «Suponga que…» en TC-TRI-142 y TC-TRI-146. TC-TRI-146 menciona un decreto posterior al corte, ahora presentado como hipotético. En TC-TRI-142 se aclaró que el decreto de emergencia no fijó un plazo de vigencia propio. Esta aclaración se hizo después de la segunda ronda: solo cierra una lectura alternativa y no cambia la clave.
- **Pistas de forma:** se corrigieron en TC-TRI-138, 144, 145, 146 y en TC-ADU-084, 085, 095 y 100, entre ellas claves claramente más largas, cifras repetidas en dos opciones y frases copiadas del artículo.
- **Datos que faltaban:** fechas exactas en vez de «hoy», todos los festivos del mes cuando importan, la base de los servicios en precios de transferencia y los requisitos acreditados en Maicao.

Los leves de la segunda ronda no cambian la respuesta. Son, por ejemplo, un dato que sobra en TC-TRI-132 y la convergencia de elementos en TC-ADU-096 y 097. Quedan para una próxima revisión.
