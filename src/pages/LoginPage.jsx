import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: authError } = await signIn({ email, password });
      
      if (authError) throw authError;

      success('เข้าสู่ระบบสำเร็จ');
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message === 'Invalid login credentials' 
        ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>เข้าสู่ระบบ</h2>
          <p>เข้าสู่ระบบเพื่อใช้งาน ReBike เต็มรูปแบบ</p>
        </div>
        
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>อีเมล</label>
              <input 
                type="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="example@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input 
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="********"
              />
            </div>
            
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p style={{ color: 'var(--text-muted)' }}>
            ยังไม่มีบัญชี? <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>สมัครสมาชิกเลย</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
