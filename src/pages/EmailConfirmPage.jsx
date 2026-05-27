import { useNavigate } from 'react-router-dom';

export default function EmailConfirmPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✉️</div>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>กรุณายืนยันอีเมลของคุณ</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          เราได้ส่งลิงก์ยืนยันตัวตนไปที่อีเมลของคุณแล้ว<br />
          กรุณาตรวจสอบกล่องข้อความ (หรือโฟลเดอร์จดหมายขยะ)
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}
