import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getConditionInfo, formatDate } from '../utils/helpers';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

export default function MyDonationsPage() {
  const { user } = useAuth();
  const { showConfirm, success, error } = useToast();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyBikes();
    }
  }, [user]);

  const loadMyBikes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bicycles')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBikes(data || []);
    } catch (err) {
      error('ไม่สามารถโหลดข้อมูลได้: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: '🗑️ ลบรายการบริจาค',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?<br><small style="color: var(--text-muted);">การดำเนินการนี้ไม่สามารถย้อนกลับได้</small>',
      confirmText: '🗑️ ลบรายการ',
      cancelText: 'ยกเลิก',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const { error: deleteError } = await supabase.from('bicycles').delete().eq('id', id);
      if (deleteError) throw deleteError;

      success('✅ ลบรายการสำเร็จ');
      loadMyBikes();
    } catch (err) {
      error('❌ ลบไม่สำเร็จ: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState message="กำลังโหลด..." />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>📦 จักรยานที่ฉันบริจาค</h1>
          <p style={{ color: 'var(--text-muted)' }}>ดูและจัดการจักรยานที่คุณได้บริจาคในระบบ</p>
        </div>
      </div>

      {bikes.length === 0 ? (
        <EmptyState
          icon="📭"
          title="คุณยังไม่เคยบริจาคจักรยาน"
          description="ร่วมสร้างโอกาสให้ผู้อื่นโดยการบริจาคจักรยานที่ไม่ได้ใช้"
          actionLabel="บริจาคจักรยาน"
          actionTo="/donate"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bikes.map(bike => {
            const condition = getConditionInfo(bike.condition);
            return (
              <div key={bike.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                {/* Image */}
                <div style={{ width: '200px', height: '150px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--background)' }}>
                  <img src={bike.image_url || 'https://via.placeholder.com/200x150?text=No+Image'} alt={bike.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{bike.title}</h3>
                    <StatusBadge status={bike.status} />
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>🏷️ {bike.brand}</span>
                    <span>🎨 {bike.color}</span>
                    <span>📏 {bike.size}</span>
                    <span>{condition.icon} {condition.text}</span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                    {bike.description || '- ไม่มีรายละเอียดเพิ่มเติม -'}
                  </p>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📅 ลงทะเบียนเมื่อ: {formatDate(bike.created_at)}
                  </div>

                  {/* ปฏิเสธจากแอดมิน */}
                  {bike.status === 'rejected' && bike.admin_note && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--error-text)' }}>
                      <strong>⚠️ เหตุผลที่ไม่ผ่านการอนุมัติ:</strong> {bike.admin_note}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleDelete(bike.id)}
                    className="btn btn-secondary"
                    style={{ color: 'var(--error-text)', borderColor: 'var(--error-bg)' }}
                  >
                    🗑️ ลบรายการ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
