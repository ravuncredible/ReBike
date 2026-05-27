import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || '',
      });
      setAvatarPreview(user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || 'User')}&background=10b981&color=fff&size=150`);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 2MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user.user_metadata?.avatar_url;
      const file = fileInputRef.current?.files[0];

      // อัปโหลดรูปภาพใหม่ถ้ามีการเลือก
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrlData.publicUrl;
      }

      // อัปเดตข้อมูลผู้ใช้ใน auth.users (user_metadata)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          avatar_url: avatarUrl
        }
      });

      if (updateError) throw updateError;

      // อัปเดตข้อมูลในตาราง profiles ด้วย
      const { error: profileError } = await supabase.from('profiles').update({
        name: formData.name,
        phone: formData.phone,
        avatar_url: avatarUrl
      }).eq('id', user.id);

      if (profileError) throw profileError;

      success('✅ บันทึกข้อมูลโปรไฟล์สำเร็จ');
      
    } catch (err) {
      error('❌ เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="auth-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="auth-header">
          <h2>👤 โปรไฟล์ของฉัน</h2>
          <p>จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>
        
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-color)', background: 'var(--background)' }} 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}
                  title="เปลี่ยนรูปโปรไฟล์"
                >
                  📷
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="form-group">
              <label>อีเมล</label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email}
                disabled
                style={{ background: 'var(--background)', color: 'var(--text-muted)' }}
              />
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>* ไม่สามารถเปลี่ยนอีเมลได้</small>
            </div>

            <div className="form-group">
              <label>ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                name="name"
                className="form-control" 
                value={formData.name}
                onChange={handleChange}
                required
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
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
