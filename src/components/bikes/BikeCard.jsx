import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getConditionInfo, formatDate } from '../../utils/helpers';
import StatusBadge from '../ui/StatusBadge';

export default function BikeCard({ bike, onRequest }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const donorAvatar = bike.profiles?.avatar_url || 
      bike.donor_avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(bike.profiles?.name || bike.donor_name || 'User')}&background=10b981&color=fff&size=96`;
  
  const donorName = bike.profiles?.name || bike.donor_name || 'ผู้บริจาค';
  const condition = getConditionInfo(bike.condition);
  const description = bike.description || 'จักรยานพร้อมส่งต่อให้ผู้ที่ต้องการ';
  const photo = bike.image_url || 'https://via.placeholder.com/340x220?text=ReBike';
  const joinedDate = formatDate(bike.created_at);

  const handleRequestClick = () => {
    if (user) {
        if(onRequest) onRequest(bike);
    } else {
      navigate('/login');
    }
  };

  return (
    <article className="bike-card-modern">
      <div className="bike-card-image">
        <img src={photo} alt={bike.title} loading="lazy" />
        {bike.status === 'available' && (
          <div className="bike-badge new" style={{
            position: 'absolute', top: '10px', right: '10px', background: 'var(--primary-color)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 1
          }}>
            <span>ผ่านการอนุมัติเเล้ว</span>
          </div>
        )}
      </div>
      
      <div className="bike-card-content">
        <div className="bike-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <img src={donorAvatar} alt={donorName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ผู้บริจาค</div>
            <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{donorName}</div>
          </div>
        </div>
        
        <h3 className="bike-card-title" style={{ fontSize: '1.25rem', marginBottom: '5px', color: 'var(--text-main)' }}>{bike.title}</h3>
        
        <div className="bike-card-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
          🏷️ {bike.brand || 'ไม่ระบุแบรนด์'} • {bike.color || 'หลากสี'}
        </div>
        
        <div className="bike-card-meta" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--background)', padding: '5px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <span>{condition.icon}</span>
            <span style={{color: 'var(--text-main)'}}>{condition.text}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--background)', padding: '5px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <span style={{color: 'var(--text-muted)'}}>ขนาด:</span>
            <span style={{color: 'var(--text-main)'}}>{bike.size || 'ไม่ระบุขนาด'}</span>
          </div>
        </div>
        
        <p className="bike-card-description" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>
        
        <div className="bike-card-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>พร้อมแจกจ่าย!</span>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '10px' }}
            onClick={handleRequestClick}
          >
            {user ? (
              <><span>📝</span> ขอรับจักรยาน</>
            ) : (
              <><span>🔐</span> เข้าสู่ระบบเพื่อขอรับ</>
            )}
          </button>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <span>📅 บริจาคเมื่อ {joinedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
