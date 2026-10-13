# Resultados de las Partes 20 a 22: concurso docente completo (11 de octubre de 2026)

Meta: que cada perfil del concurso docente de la CNSC tenga un banco completo de su área y los cuatro componentes de la prueba eliminatoria. Cada archivo pasó por:
1. una resolución a ciegas;
2. una corrección;
3. una segunda resolución a ciegas de las preguntas corregidas.

Todas las preguntas quedan en estado `beta`. Los borradores están en `docs/banco/lote20/` y `docs/banco/lote21/`.

## Qué evalúa el concurso (investigación del 11 de octubre)

- **Vacantes:** los 90 proyectos de acuerdo publicados por la CNSC el 19 de agosto de 2026 suman 28.001. Las áreas con más plazas son:

  | Área | Vacantes |
  |---|---:|
  | Primaria | 8.059 |
  | Preescolar | 3.723 |
  | Matemáticas | 1.945 |
  | Orientador | 1.892 |
  | Inglés | 1.798 |
  | Ciencias sociales | 1.499 |
  | Lengua castellana | 1.316 |
  | Ciencias naturales | 1.236 |
  | Tecnología | 1.091 |
  | Coordinador | 1.074 |

- **Prueba eliminatoria:** aptitudes y competencias básicas, 55 %, con mínimo de 60 para docentes y de 70 para directivos. Tiene cuatro componentes:
  1. lectura crítica;
  2. razonamiento cuantitativo;
  3. competencias blandas (liderazgo, ética, trabajo en equipo y ciudadanía);
  4. conocimientos disciplinares y pedagógicos del cargo, que dependen del área.
- **Pendiente:** la CNSC aún no publica el número de preguntas ni la duración; irán en la guía de orientación. En 2022 los ítems fueron de juicio situacional con 3 opciones.

## Lo que se publicó

| Módulo | Antes | Ahora | Archivo |
|---|---:|---:|---|
| Pedagogía y Normativa Docente (más inclusión y convivencia en casos) | 120 | 160 | docentes.json |
| Saber Disciplinar: Primaria | 40 | 80 | docentes-disciplinar.json |
| Saber Disciplinar: Matemáticas | 40 | 80 | docentes-disciplinar.json |
| Saber Disciplinar: Lenguaje | 40 | 80 | docentes-disciplinar.json |
| Saber Disciplinar: Ciencias Naturales (con química y física de media) | 20 | 80 | docentes-disciplinar.json |
| Saber Disciplinar: Ciencias Sociales | 20 | 60 | docentes-disciplinar.json |
| Saber Disciplinar: Preescolar (nuevo; ids TC-PSC) | 0 | 40 | docentes-disciplinar.json |
| Saber Disciplinar: Inglés (nuevo) | 0 | 40 | docentes-disciplinar.json |
| Saber Disciplinar: Tecnología e Informática (nuevo) | 0 | 20 | docentes-disciplinar.json |
| Saber Disciplinar: Educación Física (nuevo) | 0 | 20 | docentes-disciplinar.json |
| Saber Disciplinar: Educación Artística (nuevo) | 0 | 20 | docentes-disciplinar.json |
| Saber Disciplinar: Filosofía y Ética (nuevo) | 0 | 20 | docentes-disciplinar.json |
| Orientación Escolar (nuevo) | 0 | 40 | orientacion-escolar.json |
| Competencias Blandas del Docente (nuevo) | 0 | 40 | competencias-blandas-docente.json |
| Gestión Escolar (Directivos Docentes) | 60 | 80 | directivos-docentes.json |
| **Total docentes** | **340** | **860** | |

**Fuentes nuevas** (texto extraído de los PDF oficiales del MEN):
- Bases curriculares de preescolar (2017);
- Guía 22 de inglés y DBA de inglés;
- Guía 30 de tecnología;
- Documentos 14, 15 y 16 (filosofía, educación física y artística);
- Plan Nacional de Orientación Escolar (2021) y documento guía DG20;
- Guía 31 (competencias comportamentales del docente);
- Guía 34 (gestión escolar);
- Lineamientos de formación ciudadana y socioemocional (2026).

## Cambios en la aplicación

- **Perfiles nuevos en el catálogo:** preescolar, inglés, orientador, tecnología, educación física, artística, y filosofía y ética, además de los que ya había.
- **Pesos del plan y del simulacro en todos los perfiles:**

  | Componente | Peso |
  |---|---:|
  | Saber disciplinar o del cargo | 4 |
  | Pedagogía y normativa | 3 |
  | Lectura crítica | 2,5 |
  | Razonamiento cuantitativo | 2,5 |
  | Competencias blandas | 1,5 |

  Es una estimación basada en el concurso de 2016 y se ajustará cuando salga la guía de orientación.
- **Pseudocódigo:** el enunciado ahora muestra el pseudocódigo numerado con sangría, en un bloque de código.

## Lecciones nuevas (ya están en las instrucciones de los redactores)

1. **El verbo inicial delata la clave.** Si las opciones que empiezan con «Explicar…» son siempre distractores, el resolvedor las descarta sin saber del área.
2. **La opción más protectora o incluyente no puede ganar siempre.** En inclusión, convivencia y orientación, el resolvedor acertaba 13 o 14 de 20 eligiendo siempre lo más favorable al estudiante. Ahora al menos dos distractores protegen igual, pero fallan en la entidad, el orden, el plazo, el instrumento o el rol.
3. **El repertorio fijo de distractores didácticos se adivina:** exponer, imponer, votar, confrontar o trasladar.
4. **Competencias blandas:**
   - «Nunca escalar» acertaba casi todo. Ahora en varias claves lo correcto es acudir a la instancia debida.
   - Se quitaron las opciones antiéticas que nadie elegiría.
5. **Longitud al revés:** la clave casi nunca era la opción más larga, y descartar la más larga funcionaba como pista. Ahora es la más larga en el 20 al 30 % de los ítems.

## Para revisión humana

- **Inglés:**
  - La Guía 22 descargada solo trae los estándares hasta 5.º. Los ítems de secundaria citan secciones generales de la guía.
  - Conviene que un licenciado en idiomas revise las claves de pronunciación y de gramática.
- **Orientación:**
  - Los casos de riesgo suicida se apoyan en criterios clínicos generales; la Ley 1616 y los protocolos del Ministerio de Salud no están en las fuentes.
  - La Ley 2126 de 2021 (comisarías de familia) tampoco está en las fuentes. Las claves evitan depender de distinguir comisaría de defensoría.
- **Competencias blandas:** siguen siendo más fáciles que el resto. La heurística «resolver a tiempo, dentro del rol y por el canal debido» acierta la mayoría. Conviene una tercera ronda.
- **Artística, educación física y filosofía:** varias claves se apoyan en conocimiento consolidado del área (métrica musical, canon de proporciones, fórmula de Karvonen, Kohlberg) enunciado en la explicación.
- **Preescolar:** sus ids pasaron de TC-PRE a TC-PSC porque TC-PRE ya existía en Gestión Pública (presupuesto).
