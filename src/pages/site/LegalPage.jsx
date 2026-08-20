import LegalDoc from '../../components/LegalDoc';
import { PRIVACY, TERMS } from '../../lib/legal';

export default function LegalPage({ kind }) {
  const data = kind === 'privacy' ? PRIVACY : TERMS;
  return (
    <>
      <div className="page-head container">
        <h1>{data.title}</h1>
        <p>עודכן לאחרונה: {data.updated}</p>
      </div>
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <LegalDoc data={data} />
        </div>
      </section>
    </>
  );
}
