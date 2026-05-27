import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { loginAdmin } = useAdmin();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: authError } = await loginAdmin(username, password);
      
      if (authError) throw authError;

      success('✅ เข้าสู่ระบบ Admin สำเร็จ');
      navigate('/admin');
    } catch (err) {
      error(err.message || '❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <h2>🔐 เข้าสู่ระบบ Admin</h2>
          <p>กรุณากรอก Username และ Password ของผู้ดูแลระบบ</p>
        </div>
        
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username ผู้ดูแล</label>
              <input 
                type="text" 
                className="form-control" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
                placeholder="กรอก Username"
              />
            </div>
            
            <div className="form-group">
              <label>Password ผู้ดูแล</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="กรอกรหัสผ่าน"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showPassword ? '👁️' : '👀'}
                </button>
              </div>
            </div>
            
            <button 
                type="submit" 
                className="btn-auth" 
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
            >
              {loading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ Admin'}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p style={{ color: 'var(--text-muted)' }}>ไม่ใช่ผู้ดูแลระบบ?</p>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
            style={{ marginTop: '0.5rem' }}
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
