import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      error('❌ รหัสผ่านไม่ตรงกัน');
      return;
    }
    
    if (formData.password.length < 6) {
      error('❌ รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          }
        }
      });
      
      if (authError) throw authError;

      if (data?.user?.identities?.length === 0) {
        error('⚠️ อีเมลนี้มีในระบบแล้ว กรุณาเข้าสู่ระบบ');
        navigate('/login');
        return;
      }

      success('✅ สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมล');
      navigate('/email-confirm');
    } catch (err) {
      error('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>สมัครสมาชิกใหม่</h2>
          <p>ร่วมเป็นส่วนหนึ่งของ ReBike</p>
        </div>
        
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                name="name"
                className="form-control" 
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="ชื่อ-นามสกุลของคุณ"
              />
            </div>

            <div className="form-group">
              <label>เบอร์โทรศัพท์</label>
              <input 
                type="tel" 
                name="phone"
                className="form-control" 
                value={formData.phone}
                onChange={handleChange}
                required 
                placeholder="08X-XXX-XXXX"
              />
            </div>
            
            <div className="form-group">
              <label>อีเมล</label>
              <input 
                type="email" 
                name="email"
                className="form-control" 
                value={formData.email}
                onChange={handleChange}
                required 
                placeholder="example@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <input 
                type="password" 
                name="password"
                className="form-control" 
                value={formData.password}
                onChange={handleChange}
                required 
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <input 
                type="password" 
                name="confirmPassword"
                className="form-control" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                minLength="6"
              />
            </div>
            
            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังสมัครสมาชิก...' : 'ลงทะเบียน'}
            </button>
          </form>
        </div>
        
        <div className="auth-footer">
          <p style={{ color: 'var(--text-muted)' }}>
            มีบัญชีอยู่แล้ว? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
