// Datos estructurados (schema.org) para buscadores. Se escapa "<" para evitar inyección de HTML.
export default function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
