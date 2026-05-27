import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function DonatePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    color: '',
    size: '',
    condition: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      const file = fileInputRef.current?.files[0];

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_bike.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('bicycle-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('bicycle-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('bicycles').insert({
        donor_id: user.id,
        title: formData.title,
        brand: formData.brand,
        color: formData.color,
        size: formData.size,
        condition: formData.condition,
        description: formData.description,
        image_url: imageUrl,
        status: 'pending'
      });

      if (insertError) throw insertError;

      success('✅ ขอบคุณสำหรับการบริจาค! ทีมงานจะตรวจสอบข้อมูลของคุณเร็วๆ นี้');
      navigate('/my-donations');
      
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
          <h2>🚴 บริจาคจักรยาน</h2>
          <p>ส่งต่อจักรยานของคุณให้กับผู้ที่ต้องการ</p>
        </div>
        
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>ชื่อจักรยาน (หรือชื่อรุ่น) *</label>
              <input 
                type="text" 
                name="title"
                className="form-control" 
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น จักรยานเสือภูเขา Giant ATX 770"
                required
              />
            </div>

            <div className="form-group">
              <label>ยี่ห้อ *</label>
              <input 
                type="text" 
                name="brand"
                className="form-control" 
                value={formData.brand}
                onChange={handleChange}
                placeholder="เช่น Giant, Trek, Merida"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                <label>สี *</label>
                <input 
                    type="text" 
                    name="color"
                    className="form-control" 
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="เช่น น้ำเงิน, แดง"
                    required
                />
                </div>

                <div className="form-group">
                <label>ขนาด *</label>
                <select 
                    name="size"
                    className="form-control" 
                    value={formData.size}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- เลือกขนาด --</option>
                    <option value="16 นิ้ว">16 นิ้ว (เด็กเล็ก)</option>
                    <option value="20 นิ้ว">20 นิ้ว (เด็กโต)</option>
                    <option value="24 นิ้ว">24 นิ้ว (วัยรุ่น)</option>
                    <option value="26 นิ้ว">26 นิ้ว (ผู้ใหญ่)</option>
                    <option value="27.5 นิ้ว">27.5 นิ้ว (ผู้ใหญ่)</option>
                    <option value="29 นิ้ว">29 นิ้ว (ผู้ใหญ่)</option>
                </select>
                </div>
            </div>

            <div className="form-group">
              <label>สภาพจักรยาน *</label>
              <select 
                name="condition"
                className="form-control" 
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกสภาพ --</option>
                <option value="excellent">ดีมาก - ใช้งานน้อย เกือบใหม่</option>
                <option value="good">ดี - ใช้งานได้ปกติ</option>
                <option value="fair">พอใช้ - มีรอยขีดข่วนบ้าง</option>
                <option value="needs_repair">ต้องซ่อม - ยาง/เบรก ชำรุด</option>
              </select>
            </div>

            <div className="form-group">
              <label>รูปภาพจักรยาน (ถ้ามี)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                className="form-control" 
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>รายละเอียดเพิ่มเติม</label>
              <textarea 
                name="description"
                className="form-control" 
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="เช่น จุดบกพร่อง อุปกรณ์ที่มีให้เพิ่มเติม ฯลฯ"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? '⏳ กำลังบันทึกข้อมูล...' : '✅ ยืนยันการบริจาค'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
