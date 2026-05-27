import { useState, useEffect, useId } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useModalA11y } from '../../hooks/useModalA11y';

export default function RequestModal({ isOpen, onClose, bike, onSuccess }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const titleId = useId();
  const contentRef = useModalA11y(isOpen, onClose);

  const [formData, setFormData] = useState({
    reason: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: '', address: '', phone: '' });
    }
  }, [isOpen, bike]);

  if (!isOpen || !bike) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('donation_requests').insert({
        bicycle_id: bike.id,
        requester_id: user.id,
        reason: formData.reason,
        delivery_address: formData.address,
        contact_phone: formData.phone,
        status: 'pending'
      });

      if (insertError) throw insertError;

      success('✅ ส่งคำขอเรียบร้อย รอแอดมินอนุมัติ');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="custom-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        ref={contentRef}
        className="custom-modal-content modal-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="ปิด">
          &times;
        </button>

        <div className="request-modal-body">
          <h2 id={titleId} style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>📝 ฟอร์มขอรับจักรยาน</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            คุณกำลังขอรับ: <strong style={{ color: 'var(--primary-color)' }}>{bike.title}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="request-reason">เหตุผลที่ต้องการ *</label>
              <textarea
                id="request-reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="form-control"
                rows="3"
                required
                placeholder="เช่น ใช้ปั่นไปโรงเรียน ฯลฯ"
              />
            </div>
            <div className="form-group">
              <label htmlFor="request-address">ที่อยู่จัดส่ง / นัดรับ *</label>
              <textarea
                id="request-address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows="2"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="request-phone">เบอร์โทรศัพท์ติดต่อ *</label>
              <input
                id="request-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-auth">
              {loading ? 'กำลังส่ง...' : '✅ ส่งคำขอ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
