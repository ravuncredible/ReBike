import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import BikeCard from '../components/bikes/BikeCard';
import RequestModal from '../components/ui/RequestModal';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

export default function AllBikesPage() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);

  useEffect(() => {
    loadBikes();
  }, []);

  const loadBikes = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('bicycles')
        .select(`
            *,
            profiles!donor_id (
                name,
                avatar_url,
                username
            )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBikes(data || []);
    } catch (err) {
      console.error('Error loading all bikes:', err);
      setLoadError('ไม่สามารถโหลดรายการจักรยานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (bike) => {
    setSelectedBike(bike);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container page-content">
      <div className="page-header-left">
        <h1 className="section-title">🚲 จักรยานทั้งหมด</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>จักรยานที่รอการส่งต่อให้ผู้ที่ต้องการ คุณสามารถเลือกและขอรับได้เลย</p>
      </div>

      {loading ? (
        <LoadingState message="กำลังโหลดรายการจักรยาน..." />
      ) : loadError ? (
        <div className="inline-alert">
          {loadError}
          <div style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-primary" onClick={loadBikes}>ลองใหม่</button>
          </div>
        </div>
      ) : bikes.length === 0 ? (
        <EmptyState
          icon="🔭"
          title="ยังไม่มีจักรยานในระบบ"
          description="ขณะนี้ยังไม่มีจักรยานที่พร้อมแจกจ่าย โปรดกลับมาตรวจสอบใหม่ภายหลัง"
        />
      ) : (
        <div className="bike-grid" style={{ padding: 0 }}>
          {bikes.map(bike => (
            <BikeCard key={bike.id} bike={bike} onRequest={handleOpenRequest} />
          ))}
        </div>
      )}

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bike={selectedBike}
        onSuccess={loadBikes}
      />
    </div>
  );
}
