export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', lineHeight: 1.6 }}>
      <h1>Mess Feedback API</h1>
      <p>This deployment serves the API only. The endpoints live under /api.</p>
      <ul>
        <li>
          <code>GET /api/test</code> — health check
        </li>
        <li>
          <code>POST /api/auth/student/login</code>, <code>POST /api/auth/admin/login</code>
        </li>
        <li>
          <code>POST /api/feedback/submit</code>
        </li>
        <li>
          <code>GET /api/feedback/admin/all</code>, <code>GET /api/feedback/filter</code>
        </li>
        <li>
          <code>GET /api/feedback/export/pdf</code>, <code>GET /api/feedback/export/excel</code>
        </li>
      </ul>
    </main>
  );
}
