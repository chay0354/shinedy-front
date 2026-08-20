export default function LegalDoc({ data }) {
  if (!data) return null;
  return (
    <article className="legal-doc">
      {data.company?.length > 0 && (
        <dl className="legal-facts">
          {data.company.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.subtitle ? <p className="legal-lead">{data.subtitle}</p> : null}
      {data.sections.map((section, i) => (
        <section key={section.heading || i} className="legal-section">
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
