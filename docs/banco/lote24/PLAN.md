# Plan del lote 24: temas de las fichas de la DIAN sin preguntas

Fecha: 19 de octubre de 2026. Prueba escrita de la DIAN 2676: 8 de noviembre de 2026. Solo se evalúan normas expedidas antes del 19 de junio de 2026.

## Por qué

Las 128 OPEC de ingreso de la DIAN 2676 traen en su ficha del Manual de Funciones las competencias funcionales que se evalúan (data/opec/dian-2676.json). Después de etiquetar las 240 preguntas de la DIAN (data/opec/etiquetas-dian-2676.json), `node scripts/opec/verificar-temas.mjs dian-2676` muestra estos temas propios de la DIAN sin preguntas o con muy pocas, ordenados por las vacantes de las OPEC que los piden:

| Tema | Vacantes | OPEC | Preguntas antes del lote |
|---|---:|---:|---:|
| Tributación y fiscalización internacional | 418 | 17 | 3 |
| Teoría de la imposición | 318 | 14 | 0 |
| Medidas cautelares | 305 | 9 | 0 |
| Procesos concursales | 305 | 9 | 0 |
| Entidades autorizadas para recaudar | 305 | 9 | 0 |
| Cobro persuasivo y facilidades de pago | 305 | 9 | 2 |
| Control extensivo de obligaciones | 305 | 9 | 4 |
| Recibo de declaraciones y recaudo | 305 | 9 | 2 |
| Nomenclatura arancelaria | 95 | 17 | 0 |
| Origen | 95 | 17 | 0 |
| Custodia y disposición de mercancías | 80 | 13 | 0 |
| Puerto libre de San Andrés y zonas de régimen aduanero especial | 27 | 5 | 0 |

Quedan fuera de este lote:
- La fiscalización aduanera (387 vacantes, 4 preguntas): su procedimiento sancionatorio y de decomiso estaba en el Decreto Ley 920 de 2023, que la Ley 2586 de 2026 derogó el 19 de junio, fuera del corte (ver GUIA_REDACCION.md).
- Los temas de tecnología, jurídica y administrativa: no son propios de la DIAN y requieren lotes aparte.

## Archivos

| Archivo | Ids | Módulo | Temas (preguntas) |
|---|---|---|---|
| opec_a.json | TC-TRI-121 a 140 | Gestión Tributaria (DIAN) | medidas-cautelares (6), procesos-concursales (6), entidades-recaudadoras (5), cobro-persuasivo (3) |
| opec_b.json | TC-TRI-141 a 160 | Gestión Tributaria (DIAN) | teoria-imposicion (6), tributacion-internacional (8), recibo-declaraciones-recaudo (3), control-extensivo (3) |
| opec_c.json | TC-ADU-081 a 100 | Aduanero y Cambiario (DIAN) | origen (6), nomenclatura-arancelaria (6), zonas-regimen-especial (5), custodia-mercancias (3, o regimen-especial si la custodia depende del régimen sancionatorio) |

Cada archivo tiene cinco claves por letra. Al lado de cada archivo va `<archivo>.temas.json`, con los temas de cada pregunta, para sumarlos a data/opec/etiquetas-dian-2676.json al publicar.

## Proceso

Es el de la guía de redacción, como en los lotes anteriores:
1. Redacción con texto fuente literal.
2. Verificación con `validate-questions` y `verificar-fragmentos`.
3. Resolución a ciegas por revisores independientes.
4. Corrección y nueva resolución a ciegas de lo que cambie.
5. Publicación con `merge-lote`.

El resultado queda en RESULTADOS.md.
