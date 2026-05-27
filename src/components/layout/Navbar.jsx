import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { adminUser } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { showConfirm, success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const scrollToSection = (id) => {
    closeMenu();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    closeMenu();
    const confirmed = await showConfirm({
      title: 'ออกจากระบบ',
      messageContent: (
        <>
          คุณต้องการออกจากระบบหรือไม่?
          <br />
          <small style={{ color: 'var(--text-muted)' }}>คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งาน</small>
        </>
      ),
      confirmText: 'ออกจากระบบ',
      cancelText: 'ยกเลิก',
      type: 'warning',
      icon: '🚪'
    });

    if (confirmed) {
      try {
        await signOut();
        success('ออกจากระบบเรียบร้อย');
        navigate('/');
      } catch (err) {
        error('เกิดข้อผิดพลาด: ' + err.message);
      }
    }
  };

  const navAction = (fn) => () => { closeMenu(); fn(); };

  const authButtons = user ? (
    <>
      <button type="button" className="btn-nav btn-secondary-nav" onClick={navAction(() => navigate('/my-donations'))} title="ประวัติการบริจาค">📦 การบริจาค</button>
      <button type="button" className="btn-nav btn-secondary-nav" onClick={navAction(() => navigate('/my-requests'))} title="รายการที่ขอรับ">📝 การขอรับ</button>
      <button type="button" className="btn-nav btn-login-nav" onClick={handleLogout} title="ออกจากระบบ">🚪 ออกจากระบบ</button>
    </>
  ) : (
    <>
      <button type="button" className="btn-nav btn-login-nav" onClick={navAction(() => navigate('/login'))}>เข้าสู่ระบบ</button>
      <button type="button" className="btn-nav btn-signup-nav" onClick={navAction(() => navigate('/signup'))}>สมัครสมาชิก</button>
      <button type="button" className="btn-nav btn-admin-nav" onClick={navAction(() => navigate(adminUser ? '/admin' : '/admin/login'))}>
        Admin 🛠️
      </button>
    </>
  );

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu} style={{ marginRight: '1rem' }}>
          <span className="logo-text">ReBike</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">หน้าแรก</Link></li>
          <li><Link to="/bikes">จักรยาน</Link></li>
          <li><button type="button" className="nav-link-btn" onClick={() => scrollToSection('how')}>วิธีใช้งาน</button></li>
          <li><button type="button" className="nav-link-btn" onClick={() => scrollToSection('about')}>เกี่ยวกับเรา</button></li>
        </ul>

        <div className="nav-spacer" aria-hidden="true" />

        <div className="nav-buttons">
          {user ? (
            <div className="nav-profile">
              <button
                type="button"
                className="nav-profile-info-btn"
                onClick={() => navigate('/profile')}
                title="ดูโปรไฟล์ของคุณ"
              >
                <div className="nav-avatar">
                  <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || 'User')}&background=10b981&color=fff`} alt="" />
                </div>
                <span className="nav-profile-name">{user.user_metadata?.name || 'ผู้ใช้งาน'}</span>
              </button>
              {authButtons}
            </div>
          ) : (
            authButtons
          )}
        </div>

        <div className="nav-end">
          <div className="nav-end-actions">
            {themeButton}
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`nav-mobile-overlay ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      />

      <div className={`nav-mobile-drawer ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <ul className="nav-mobile-links">
          <li><Link to="/" onClick={closeMenu}>หน้าแรก</Link></li>
          <li><Link to="/bikes" onClick={closeMenu}>จักรยาน</Link></li>
          <li><button type="button" className="nav-link-btn" onClick={() => scrollToSection('how')}>วิธีใช้งาน</button></li>
          <li><button type="button" className="nav-link-btn" onClick={() => scrollToSection('about')}>เกี่ยวกับเรา</button></li>
        </ul>
        <div className="nav-mobile-actions">
          {user && (
            <button type="button" className="btn-nav btn-secondary-nav" onClick={navAction(() => navigate('/profile'))}>
              👤 โปรไฟล์
            </button>
          )}
          {authButtons}
        </div>
      </div>
    </nav>
  );
}
