import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getStatusBadgeInfo, formatDate } from '../utils/helpers';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const { error } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyRequests();
    }
  }, [user]);

  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('donation_requests')
        .select(`
          *,
          bicycles (
            title,
            image_url,
            brand,
            profiles (name, phone)
          )
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      error('ไม่สามารถโหลดข้อมูลได้: ' + err.message);
    } finally {
      setLoading(false);
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>📝 คำขอรับจักรยานของฉัน</h1>
        <p style={{ color: 'var(--text-muted)' }}>ติดตามสถานะการขอรับจักรยานของคุณ</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="คุณยังไม่เคยขอรับจักรยาน"
          description="ไปที่หน้าจักรยานทั้งหมด เพื่อเลือกดูจักรยานที่สนใจได้เลย"
          actionLabel="ดูจักรยานทั้งหมด"
          actionTo="/bikes"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {requests.map(req => {
            const bike = req.bicycles;
            return (
              <div key={req.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                {/* Image */}
                <div style={{ width: '150px', height: '150px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--background)' }}>
                  <img src={bike?.image_url || 'https://via.placeholder.com/150?text=No+Image'} alt={bike?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{bike?.title || 'ไม่พบข้อมูลจักรยาน'}</h3>
                    <StatusBadge status={req.status} />
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <p>ผู้บริจาค: {bike?.profiles?.name || '-'}</p>
                    <p>วันที่ขอ: {formatDate(req.created_at)}</p>
                  </div>

                  <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>ข้อมูลคำขอของคุณ</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}><strong>เหตุผล:</strong> {req.reason}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>ที่อยู่/นัดรับ:</strong> {req.delivery_address}</p>
                  </div>

                  {req.status === 'rejected' && req.admin_note && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--error-text)' }}>
                      <strong>⚠️ เหตุผลที่ปฏิเสธ:</strong> {req.admin_note}
                    </div>
                  )}

                  {req.status === 'approved' && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success-text)' }}>
                      <strong>✅ ยินดีด้วย! คำขอของคุณได้รับการอนุมัติแล้ว</strong><br/>
                      โปรดรอการติดต่อกลับจากผู้บริจาคหรือทีมงานเพื่อนัดหมายการรับจักรยาน
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
