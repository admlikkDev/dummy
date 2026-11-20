import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// 1. Import useAuth dari custom hook auth Anda (sesuaikan path foldernya)

function Sidebar({ isOpen, toggleSidebar, activeMenu, setActiveMenu }) {
  // 2. Ambil data user langsung dari global state/context backend
  const { user, logout } = useAuth();
  const userRole = user?.data?.role || 'kasir'; // fallback aman ke 'kasir' jika data belum beres dimuat
  const navigate = useNavigate()
  const exit = () => {
    logout()
    setTimeout(() => {
      navigate('/login')
    }, 1500);
  }

  const menus = [
    { name: 'Dashboard', icon: 'fa-gauge' },
    { name: 'Catatan Keuangan', icon: 'fa-chart-pie', isOwner: true }, // Ikon diubah ke chart-pie agar lebih relevan dengan keuangan
    { name: 'Transaksi Terkini', icon: 'fa-cart-shopping' },
    { name: 'Riwayat Transaksi', icon: 'fa-clock-rotate-left' },
    { name: 'Galeri Photobooth', icon: 'fa-images' },
    { name: 'Status Mesin Photobooth', icon: 'fa-microchip' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .nu-sidebar-backdrop {
          display: none;
        }
        @media (max-width: 860px) {
          .nu-sidebar-backdrop.is-open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(17, 24, 39, 0.45);
            backdrop-filter: blur(2px);
            z-index: 999;
            animation: nu-fade-in 0.2s ease;
          }
        }
        @keyframes nu-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .nu-nav-link:hover:not(.nu-nav-link--active) {
          background-color: #eef6f1 !important;
          color: #176543 !important;
        }
        .nu-nav-link:hover:not(.nu-nav-link--active) .nu-nav-icon {
          color: #176543 !important;
        }
        .nu-logout-btn:hover {
          background-color: #dc2626 !important;
          color: #fff !important;
          border-color: #dc2626 !important;
        }
        .nu-logout-btn:hover .nu-logout-icon { color: #fff !important; }
      `}</style>

      {/* Backdrop mobile */}
      <div
        className={`nu-sidebar-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={toggleSidebar}
      ></div>

      <div
        style={{
          width: '260px',
          height: '100vh',
          backgroundColor: '#fff',
          position: 'fixed',
          top: 0,
          left: isOpen ? '0' : '-260px',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '1.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #eef1f0',
          boxShadow: isOpen ? '4px 0 24px rgba(17, 24, 39, 0.06)' : 'none',
          zIndex: 1000,
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Brand Header & Toggle Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#176543', display: 'flex', alignItems: 'center', gap: '0.55rem', letterSpacing: '-0.02em' }}>
              <span
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: '#176543',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem'
                }}
              >
                <i className="fa-solid fa-camera"></i>
              </span>
              NU Snaps
            </div>

            <button
              onClick={toggleSidebar}
              style={{
                border: 'none',
                background: '#f3f4f6',
                color: '#6b7280',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Status Badge Role */}
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: userRole === 'owner' ? '#176543' : '#dc2626',
              backgroundColor: userRole === 'owner' ? '#eef6f1' : '#fef2f2',
              display: 'inline-block',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '2rem',
              marginTop: '0.75rem'
            }}
          >
            {userRole === 'owner' ? 'Owner Panel' : 'Kasir Panel'}
          </div>

          <p
            style={{
              textTransform: 'uppercase',
              color: '#9ca3af',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              marginBottom: '0.75rem'
            }}
          >
            Menu
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {menus.map((menu) => {
              // LOGIKA FILTER KASIR: Tetap terjaga secara global berdasarkan state auth backend
              if (menu.isOwner && userRole !== 'owner') {
                return null;
              }

              const isActive = activeMenu === menu.name;
              const menuHref = menu.name.toLowerCase().split(' ').join('-');

              return (
                <Link
                  key={menu.name}
                  className={`nu-nav-link ${isActive ? 'nu-nav-link--active' : ''}`}
                  to={`/${userRole}/${menuHref}`}
                  onClick={() => {
                    setActiveMenu(menu.name);
                    if (window.innerWidth <= 860) {
                      toggleSidebar();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.7rem 0.85rem',
                    color: isActive ? '#fff' : '#4b5563',
                    backgroundColor: isActive ? '#176543' : 'transparent',
                    textDecoration: 'none',
                    borderRadius: '0.6rem',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i
                    className={`nu-nav-icon fa-solid ${menu.icon}`}
                    style={{ marginRight: '0.85rem', width: '18px', textAlign: 'center', color: isActive ? '#fff' : '#9ca3af', fontSize: '0.9rem' }}
                  ></i>
                  {menu.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div>
          <button
            className="nu-logout-btn"
            style={{
              padding: '0.75rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '0.6rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onClick={exit}
          >
            <i className="nu-logout-icon fa-solid fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;