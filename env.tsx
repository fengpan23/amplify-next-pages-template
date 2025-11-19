import { GetServerSideProps, NextPage } from 'next';

type EnvEntry = {
  key: string;
  value: string;
};

type EnvPageProps = {
  envVars: EnvEntry[];
};

const EnvPage: NextPage<EnvPageProps> = ({ envVars }) => {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Environment Variables</h1>
      <p style={{ marginBottom: '1.5rem', color: '#4a5568' }}>Total: {envVars.length}</p>
      <section style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', fontWeight: 600, background: '#f7fafc', padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0' }}>
          <span>Name</span>
          <span>Value</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {envVars.map(({ key, value }) => (
            <li key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', padding: '0.75rem 1rem', borderBottom: '1px solid #edf2f7', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
              <strong style={{ overflowWrap: 'anywhere' }}>{key}</strong>
              <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: '#2d3748' }}>{value || '""'}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps<EnvPageProps> = async () => {
  const envVars: EnvEntry[] = Object.entries(process.env ?? {})
    .map(([key, value]) => ({
      key,
      value: value ?? '',
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return {
    props: {
      envVars,
    },
  };
};

export default EnvPage;

