import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BikeCard from '../components/bikes/BikeCard';
import RequestModal from '../components/ui/RequestModal';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

const StatCard = ({ target, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (start === target) return;

    const duration = 1000;
    const increment = target > start ? 1 : -1;
    const stepTime = Math.max(Math.floor(duration / Math.abs(target - start)), 20);

    const timer = setInterval(() => {
      start += increment;
      setCount(start);
      if (start === target) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="stat-card">
      <div className="stat-number">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(true);
  const [bikesError, setBikesError] = useState(null);
  const [stats, setStats] = useState({ donated: 0, distributed: 0, available: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);

  useEffect(() => {
    loadBikes();
    loadStats();
  }, []);

  const loadBikes = async () => {
    setLoadingBikes(true);
    setBikesError(null);
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
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setBikes(data || []);
    } catch (err) {
      console.error('Error loading bikes:', err);
      setBikesError('ไม่สามารถโหลดรายการจักรยานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoadingBikes(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bicycles')
        .select('status')
        .in('status', ['available', 'reserved', 'donated']);

      if (error) throw error;

      if (data) {
        setStats({
          donated: data.length,
          distributed: data.filter(b => b.status === 'reserved' || b.status === 'donated').length,
          available: data.filter(b => b.status === 'available').length
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleOpenRequest = (bike) => {
    setSelectedBike(bike);
    setIsModalOpen(true);
  };

  const scrollBikes = (direction) => {
    const container = document.getElementById('bikeScrollContainer');
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container">
      <section className="hero">
        <h1>แบ่งปัน<span className="highlight">จักรยาน</span> และสร้าง<span className="highlight">โอกาส</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          แพลตฟอร์มกลางสำหรับบริจาคและกระจายจักรยานมือสอง<br />จัดทำโดยนักเรียนโรงเรียนสาธิตวิทยาการอิสลาม
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/donate')}>บริจาคจักรยาน</button>
          <a href="#bikes" className="btn btn-secondary">ดูจักรยานที่มี</a>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard target={stats.donated} label="จักรยานที่บริจาคแล้ว" />
        <StatCard target={stats.distributed} label="กระจายให้ผู้ใช้แล้ว" />
        <StatCard target={stats.available} label="พร้อมแจกจ่าย" />
      </div>

      <section id="how" className="how-section">
        <h2 className="section-title">วิธีใช้งาน ReBike</h2>
        <div className="how-steps-grid">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <div className="how-step-image-wrap">
              <img src="images/bikeChecking.jpg" alt="ตรวจสอบจักรยานก่อนบริจาค" onError={(e) => { e.target.src = 'https://via.placeholder.com/220?text=Step+1'; }} />
            </div>
            <h3>บริจาคจักรยาน</h3>
            <p>ถ่ายรูปและกรอกรายละเอียดจักรยานที่ต้องการบริจาค เราจะตรวจสอบและซ่อมแซมให้พร้อมใช้งาน</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">2</div>
            <div className="how-step-image-wrap">
              <img src="images/fixingBike.png" alt="ซ่อมแซมจักรยาน" onError={(e) => { e.target.src = 'https://via.placeholder.com/220?text=Step+2'; }} />
            </div>
            <h3>ซ่อมแซมและตรวจสอบ</h3>
            <p>ทีมงานจะตรวจสอบสภาพและซ่อมแซมจักรยานให้อยู่ในสภาพพร้อมใช้งาน</p>
          </div>
          <div className="how-step">
            <div className="how-step-number">3</div>
            <div className="how-step-image-wrap">
              <img src="images/wantBike.jpg" alt="ขอรับจักรยาน" onError={(e) => { e.target.src = 'https://via.placeholder.com/220?text=Step+3'; }} />
            </div>
            <h3>กระจายให้ผู้ที่ต้องการ</h3>
            <p>ผู้ที่ต้องการสามารถเลือกและขอรับจักรยานผ่านระบบได้ง่ายๆ</p>
          </div>
        </div>
      </section>

      <section id="bikes" style={{ padding: '4rem 2rem' }}>
        <h2 className="section-title">จักรยานที่พร้อมแจกจ่าย</h2>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loadingBikes ? (
            <LoadingState message="กำลังโหลดจักรยาน..." />
          ) : bikesError ? (
            <div className="inline-alert">
              {bikesError}
              <div style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-primary" onClick={loadBikes}>ลองใหม่</button>
              </div>
            </div>
          ) : bikes.length === 0 ? (
            <EmptyState
              icon="🚲"
              title="ยังไม่มีจักรยานในระบบ"
              description="รอสักครู่ หรือช่วยเราโดยการบริจาคจักรยาน"
              actionLabel={user ? 'บริจาคจักรยาน' : undefined}
              actionTo={user ? '/donate' : undefined}
            />
          ) : (
            <div className="bike-carousel-wrap">
              <button type="button" className="bike-carousel-btn prev" onClick={() => scrollBikes('left')} aria-label="เลื่อนซ้าย">←</button>
              <div id="bikeScrollContainer" className="bike-scroll-container">
                {bikes.map(bike => (
                  <div key={bike.id} className="bike-card-wrapper">
                    <BikeCard bike={bike} onRequest={handleOpenRequest} />
                  </div>
                ))}
              </div>
              <button type="button" className="bike-carousel-btn next" onClick={() => scrollBikes('right')} aria-label="เลื่อนขวา">→</button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/bikes')}>
            📋 ดูจักรยานทั้งหมดในระบบ
          </button>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2 className="section-title">เกี่ยวกับเรา</h2>
        <p>
          ReBike เป็นแพลตฟอร์มบริจาคและกระจายจักรยานมือสอง จัดทำโดยนักเรียนโรงเรียนสาธิตวิทยาการอิสลาม
          เพื่อเชื่อมต่อผู้บริจาคกับผู้ที่ต้องการจักรยานอย่างโปร่งใสและเป็นระบบ
        </p>
      </section>

      <section style={{ background: 'var(--primary-color)', color: 'white', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>พร้อมที่จะมีส่วนร่วมแล้วหรือยัง?</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: '0.9' }}>ร่วมเป็นส่วนหนึ่งในการสร้างโอกาสให้กับผู้อื่น</p>
        <button type="button" className="btn" style={{ background: 'white', color: 'var(--primary-color)' }} onClick={() => navigate('/signup')}>เริ่มต้นใช้งานวันนี้</button>
      </section>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bike={selectedBike}
        onSuccess={loadBikes}
      />
    </div>
  );
}
