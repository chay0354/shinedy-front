/** Numbered steps laid out as an infographic: icon tiles joined by a dotted line. */
export default function InfoFlow({ steps, compact = false }) {
  return (
    <ol className={`info-flow${compact ? ' is-compact' : ''}`} style={{ '--flow-count': steps.length }}>
      {steps.map((step, i) => (
        <li className="info-flow-step" key={step.t}>
          <span className="info-flow-tile" aria-hidden="true">
            <step.icon size={compact ? 22 : 26} />
            <span className="info-flow-n">{i + 1}</span>
          </span>
          <div className="info-flow-text">
            <h3>{step.t}</h3>
            <p>{step.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
