import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdmin } from '../contexts/AdminContext';
import { useToast } from '../contexts/ToastContext';
import { getConditionInfo, formatDate } from '../utils/helpers';
import StatusBadge from '../components/ui/StatusBadge';

export default function AdminPage() {
  const { adminUser, logoutAdmin } = useAdmin();
  const { showConfirm, success, error } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // Modal State
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bikeId: null, reason: '', type: 'bike' }); // type: 'bike' or 'request'

  // Redirect if not logged in
  useEffect(() => {
    if (!adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, navigate]);

  // Load data when tab changes
  useEffect(() => {
    if (adminUser) {
      loadData();
    }
  }, [activeTab, adminUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const { data: bikes, error: err } = await supabase
          .from('bicycles')
          .select('*, profiles(name, phone)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (err) throw err;
        setData(bikes || []);
      } 
      else if (activeTab === 'requests') {
        const { data: reqs, error: err } = await supabase
          .from('donation_requests')
          .select(`
            *,
            profiles!requester_id(name, phone),
            bicycles(title, image_url, status)
          `)
          .in('status', ['pending']) // Only pending requests
          .order('created_at', { ascending: false });
        if (err) throw err;
        setData(reqs || []);
      }
      else if (activeTab === 'published') {
        const { data: bikes, error: err } = await supabase
          .from('bicycles')
          .select('*, profiles(name, phone)')
          .in('status', ['available', 'reserved'])
          .order('created_at', { ascending: false });
        if (err) throw err;
        setData(bikes || []);
      }
      else if (activeTab === 'completed') {
        const { data: bikes, error: err } = await supabase
          .from('bicycles')
          .select('*, profiles(name, phone)')
          .in('status', ['donated', 'rejected'])
          .order('created_at', { ascending: false });
        if (err) throw err;
        setData(bikes || []);
      }
    } catch (err) {
      error('โหลดข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: '🔐 ออกจากระบบ Admin',
      message: 'คุณต้องการออกจากระบบผู้ดูแลหรือไม่?',
      confirmText: '✓ ออกจากระบบ',
      cancelText: '✕ ยกเลิก',
      type: 'danger'
    });

    if (confirmed) {
      logoutAdmin();
      success('👋 ออกจากระบบ Admin เรียบร้อย');
      navigate('/');
    }
  };

  // --- Actions ---

  const handleApproveBike = async (id) => {
    const confirmed = await showConfirm({
      title: '✅ อนุมัติการบริจาค',
      message: 'อนุมัติให้จักรยานนี้แสดงบนหน้าเว็บ?<br><small>จักรยานจะปรากฏในหน้า Homepage (Public) และในแท็บ "จักรยานที่เผยแพร่"</small>',
      confirmText: '✓ อนุมัติ (ขึ้นเว็บ)',
      cancelText: 'ยกเลิก',
      type: 'success'
    });

    if (!confirmed) return;

    try {
      const { error: err } = await supabase.from('bicycles').update({ status: 'available', admin_note: null }).eq('id', id);
      if (err) throw err;
      success('✅ อนุมัติเรียบร้อย จักรยานขึ้นหน้าเว็บแล้ว');
      loadData();
    } catch (err) {
      error('❌ อนุมัติไม่สำเร็จ: ' + err.message);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.reason) return;

    try {
      if (rejectModal.type === 'bike') {
        const { error: err } = await supabase.from('bicycles').update({ status: 'rejected', admin_note: rejectModal.reason }).eq('id', rejectModal.bikeId);
        if (err) throw err;
        success('✅ ปฏิเสธรายการบริจาคเรียบร้อย');
      } else {
        const { error: err } = await supabase.from('donation_requests').update({ status: 'rejected', admin_note: rejectModal.reason }).eq('id', rejectModal.bikeId);
        if (err) throw err;
        success('✅ ปฏิเสธคำขอเรียบร้อย');
      }
      setRejectModal({ isOpen: false, bikeId: null, reason: '', type: 'bike' });
      loadData();
    } catch (err) {
      error('❌ ทำรายการไม่สำเร็จ: ' + err.message);
    }
  };

  const handleDeletePublishedBike = async (id) => {
    const confirmed = await showConfirm({
        title: '🗑️ ลบจักรยานออกจากเว็บ',
        message: 'ยืนยันการลบจักรยานนี้ออกจากระบบ?<br><small style="color: var(--error-text);">⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</small>',
        confirmText: '🗑️ ลบ',
        cancelText: 'ยกเลิก',
        type: 'danger'
    });

    if (!confirmed) return;

    try {
        const { error: err } = await supabase.from('bicycles').delete().eq('id', id);
        if (err) throw err;
        success('✅ ลบจักรยานเรียบร้อย');
        loadData();
    } catch (err) {
        error('❌ ลบไม่สำเร็จ: ' + err.message);
    }
  };

  const handleApproveRequest = async (reqId, bikeId) => {
    const confirmed = await showConfirm({
        title: '✅ อนุมัติคำขอ',
        message: 'ยืนยันมอบจักรยานคันนี้ให้ผู้ขอนี้?',
        confirmText: '✓ อนุมัติ',
        cancelText: 'ยกเลิก',
        type: 'success'
    });

    if (!confirmed) return;

    try {
        // อัปเดตสถานะคำขอเป็น approved
        const { error: reqErr } = await supabase.from('donation_requests').update({ status: 'approved' }).eq('id', reqId);
        if (reqErr) throw reqErr;

        // อัปเดตสถานะจักรยานเป็น reserved
        const { error: bikeErr } = await supabase.from('bicycles').update({ status: 'reserved' }).eq('id', bikeId);
        if (bikeErr) throw bikeErr;

        success('✅ อนุมัติคำขอเรียบร้อยแล้ว');
        loadData();
    } catch (err) {
        error('❌ อนุมัติไม่สำเร็จ: ' + err.message);
    }
  };

  const handleMarkAsDonated = async (bikeId) => {
     const confirmed = await showConfirm({
        title: '📦 ยืนยันการส่งมอบ',
        message: 'ยืนยันว่าจักรยานคันนี้ถูกส่งมอบเรียบร้อยแล้ว?',
        confirmText: '✓ ส่งมอบแล้ว',
        cancelText: 'ยกเลิก',
        type: 'success'
    });

    if (!confirmed) return;

    try {
        const { error: bikeErr } = await supabase.from('bicycles').update({ status: 'donated' }).eq('id', bikeId);
        if (bikeErr) throw bikeErr;

        success('✅ บันทึกสถานะส่งมอบสำเร็จ');
        loadData();
    } catch (err) {
        error('❌ ทำรายการไม่สำเร็จ: ' + err.message);
    }
  };


  if (!adminUser) return null;

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--background)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>🔧 ระบบจัดการ Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>ยินดีต้อนรับ {adminUser.name}</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleLogout}
          style={{ borderColor: '#f97316', color: '#f97316' }}
        >
          🚪 ออกจากระบบ Admin
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', overflowX: 'auto' }}>
        <button className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('pending')}>
          รอตรวจสอบ ({activeTab === 'pending' && data.length})
        </button>
        <button className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('requests')}>
          คำขอรับจักรยาน
        </button>
        <button className={`btn ${activeTab === 'published' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('published')}>
          เผยแพร่บนเว็บ
        </button>
        <button className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('completed')}>
          ประวัติ (เสร็จสิ้น/ปฏิเสธ)
        </button>
      </div>

      {/* Content */}
      <div style={{ minHeight: '400px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>⏳ กำลังโหลดข้อมูล...</div>
        ) : data.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>ไม่มีรายการในหมวดหมู่นี้</h3>
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.map(item => (
              <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                {/* Image Section */}
                <div style={{ width: '200px', height: '150px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--background)' }}>
                  <img src={item.image_url || item.bicycles?.image_url || 'https://via.placeholder.com/200x150?text=No+Image'} alt="Bike" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Detail Section */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{activeTab === 'requests' ? `คำขอรับ: ${item.bicycles?.title}` : item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>

                  {activeTab === 'requests' ? (
                    // Show Request details
                    <>
                       <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <p>ผู้ขอรับ: {item.profiles?.name} | โทร: {item.profiles?.phone}</p>
                        <p>วันที่ขอ: {formatDate(item.created_at)}</p>
                      </div>
                      <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>เหตุผล:</strong> {item.reason}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>ที่อยู่จัดส่ง:</strong> {item.delivery_address}</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>โทร (ติดต่อ):</strong> {item.contact_phone}</p>
                      </div>
                    </>
                  ) : (
                    // Show Bike details
                    <>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <p>ผู้บริจาค: {item.profiles?.name} | โทร: {item.profiles?.phone}</p>
                        <p>วันที่บันทึก: {formatDate(item.created_at)}</p>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>🏷️ {item.brand}</span>
                        <span>🎨 {item.color}</span>
                        <span>📏 {item.size}</span>
                        <span>{getConditionInfo(item.condition).icon} {getConditionInfo(item.condition).text}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                        {item.description || '- ไม่มีรายละเอียดเพิ่มเติม -'}
                      </p>
                      {item.status === 'rejected' && item.admin_note && (
                         <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: 'var(--radius-md)' }}>
                            <strong>เหตุผลที่ปฏิเสธ:</strong> {item.admin_note}
                         </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', minWidth: '150px' }}>
                  {activeTab === 'pending' && (
                    <>
                      <button className="btn btn-primary" style={{ background: 'var(--success-text)' }} onClick={() => handleApproveBike(item.id)}>✓ อนุมัติ (ขึ้นเว็บ)</button>
                      <button className="btn btn-secondary" style={{ color: 'var(--error-text)', borderColor: 'var(--error-bg)' }} onClick={() => setRejectModal({ isOpen: true, bikeId: item.id, reason: '', type: 'bike' })}>✗ ปฏิเสธ</button>
                    </>
                  )}
                  {activeTab === 'requests' && (
                    <>
                      <button className="btn btn-primary" style={{ background: 'var(--success-text)' }} onClick={() => handleApproveRequest(item.id, item.bicycle_id)}>✓ อนุมัติคำขอ</button>
                      <button className="btn btn-secondary" style={{ color: 'var(--error-text)', borderColor: 'var(--error-bg)' }} onClick={() => setRejectModal({ isOpen: true, bikeId: item.id, reason: '', type: 'request' })}>✗ ปฏิเสธคำขอ</button>
                    </>
                  )}
                  {activeTab === 'published' && (
                    <>
                       {item.status === 'reserved' && (
                           <button className="btn btn-primary" onClick={() => handleMarkAsDonated(item.id)}>📦 ส่งมอบจักรยานแล้ว</button>
                       )}
                       <button className="btn btn-secondary" style={{ color: 'var(--error-text)', borderColor: 'var(--error-bg)' }} onClick={() => handleDeletePublishedBike(item.id)}>🗑️ ลบออกจากเว็บ</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <div className="custom-modal-header type-danger">
              <div className="custom-modal-icon">❌</div>
              <h3 className="custom-modal-title">ปฏิเสธ{rejectModal.type === 'bike' ? 'รายการบริจาค' : 'คำขอรับจักรยาน'}</h3>
            </div>
            <div className="custom-modal-body">
              <form onSubmit={submitReject}>
                <div className="form-group">
                  <label>ระบุเหตุผล *</label>
                  <textarea 
                    className="form-control"
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({...rejectModal, reason: e.target.value})}
                    required
                    rows="3"
                    placeholder="เหตุผลในการปฏิเสธ..."
                  />
                </div>
                <div className="custom-modal-footer" style={{ padding: '0', paddingTop: '1rem' }}>
                  <button type="button" className="custom-modal-btn custom-modal-btn-cancel" onClick={() => setRejectModal({ isOpen: false, bikeId: null, reason: '', type: 'bike' })}>ยกเลิก</button>
                  <button type="submit" className="custom-modal-btn custom-modal-btn-confirm type-danger">ยืนยันการปฏิเสธ</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
