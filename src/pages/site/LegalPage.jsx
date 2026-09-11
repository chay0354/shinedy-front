import LegalDoc from '../../components/LegalDoc';
import { PRIVACY, TERMS } from '../../lib/legal';
import PageHead from '../../components/PageHead';

export default function LegalPage({ kind }) {
  const data = kind === 'privacy' ? PRIVACY : TERMS;
  return (
    <>
      <PageHead eyebrow="LEGAL" title={data.title}>
        <p>עודכן לאחרונה: {data.updated}</p>
      </PageHead>
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <LegalDoc data={data} />
        </div>
      </section>
    </>
  );
}
