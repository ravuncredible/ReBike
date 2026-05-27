import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container not-found-page">
      <h1>404</h1>
      <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>ไม่พบหน้าที่ต้องการ</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        หน้านี้อาจถูกลบหรือ URL ไม่ถูกต้อง
      </p>
      <Link to="/" className="btn btn-primary">กลับหน้าแรก</Link>
    </div>
  );
}
