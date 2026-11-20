import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import useFetch from '../../hooks/useFetch';

function StatusMesin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('SEMUA');
  const [activeMenu, setActiveMenu] = useState('Status Mesin Photobooth');
  const [machines, setMachines] = useState([]);
  const { get, post } = useFetch(); // Menggunakan custom hook get & post sesuai template kamu

  // Fungsi fetch data status mesin dari backend
  const fetch = async () => {
    // Sesuaikan endpoint ini dengan rute API backend milikmu
    const resp = await get('owner/get-status-mesin'); 
    if (!resp.status) {
      console.error(resp.message);
      return;
    }
    // Asumsi data mesin berada di resp.data.data
    setMachines(resp.data);
    console.log(resp.data);
  };

  useEffect(() => {
    // 1. Ambil data pertama kali saat halaman dimuat
    fetch();

    // 2. Pasang interval polling realtime (ambil data otomatis setiap 5 detik)
    const interval = setInterval(() => {
      fetch();
    }, 5000);

    // 3. Matikan interval saat pengguna berpindah menu/halaman
    return () => clearInterval(interval);
  }, []);

  // Fungsi simulasi untuk berinteraksi dengan mesin (misal: ping atau restart perangkat)
  const handleKontrolMesin = async (machine, action) => {
    const confirmAction = window.confirm(
      `Apakah Anda yakin ingin mengirim perintah [${action}] ke mesin "${machine.name}"?`
    );

    if (!confirmAction) return;

    const payload = {
      machine_id: machine.id,
      action: action.toLowerCase(), // 'ping' atau 'restart'
    };

    // Sesuaikan endpoint kontrol ini dengan backend milikmu jika ada
    const resp = await post('owner/control-machine', payload);

    if (resp.status) {
      alert(resp.message || `Perintah ${action} berhasil dikirim ke mesin!`);
      fetch();
    } else {
      alert(resp.message || `Gagal mengirim perintah ke mesin.`);
    }
  };

  // Filter local berdasarkan Status Mesin (SEMUA, READY, active)
  const filteredMachines = activeFilter === 'SEMUA'
    ? machines
    : machines.filter(m => m.status?.toUpperCase() === activeFilter);

  // Menghitung ringkasan statistik secara dinamis berdasarkan state machines saat ini
  const stats = {
    total: machines?.length,
    ready: machines.filter(m => m.status === 'ready')?.length,
    active: machines.filter(m => m.status === 'active')?.length,
  };

  return (
    <div style={{ backgroundColor: '#f7f8fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif", margin: 0, padding: 0 }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .nu-main {
          margin-left: ${isSidebarOpen ? '260px' : '0px'};
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1.75rem 2rem 3rem;
          box-sizing: border-box;
        }
        @media (max-width: 860px) {
          .nu-main { margin-left: 0 !important; padding: 1.25rem 1rem 3rem; }
        }
        .nu-tx-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.25rem;
        }
        .nu-tx-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .nu-tx-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
        }
        .nu-ctrl-btn {
          flex: 1;
          padding: 0.55rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          alignItems: center;
          justifyContent: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
        }
        .nu-ctrl-btn-ping {
          background-color: #fff;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        .nu-ctrl-btn-ping:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }
        .nu-ctrl-btn-restart {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .nu-ctrl-btn-restart:hover {
          background-color: #fee2e2;
        }
        .nu-sync-btn:hover { transform: scale(1.06); }
        .nu-tab-btn:hover:not(.nu-tab-btn--active) { color: #176543 !important; }
        
        .nu-pulse-green {
          width: 8px;
          height: 8px;
          background-color: #176543;
          border-radius: 50%;
          display: inline-block;
          animation: nu-glow-pulse 1.5s infinite;
        }
        @keyframes nu-glow-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(23, 101, 67, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(23, 101, 67, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(23, 101, 67, 0); }
        }
      `}</style>

      {/* Komponen Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      {/* Konten Utama */}
      <div className="nu-main">
        {/* Top Navbar / Header */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            marginBottom: '1.75rem',
            border: '1px solid #eef1f0',
            boxShadow: '0 1px 2px rgba(17,24,39,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Sisi Kiri Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                backgroundColor: '#176543',
                color: '#fff',
                borderRadius: '0.6rem',
                border: 'none',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '0.95rem'
              }}
              title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
            </button>

            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeMenu}
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>Sistem pemantauan modul kamera dan IoT</p>
            </div>
          </div>

          {/* Sisi Kanan: Status Polling Realtime */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#eef6f1', padding: '0.45rem 0.8rem', borderRadius: '20px', border: '1px solid #176543' }}>
              <span className="nu-pulse-green"></span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#176543', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Auto Polling Active
              </span>
            </div>
          </div>
        </div>

        {/* Hanya muncul jika menu "Status Mesin Photobooth" aktif */}
        {activeMenu === 'Status Mesin Photobooth' ? (
          <>
            {/* Grid Statistik Pendek */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={cardStatsStyle}>
                <span style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>Total Mesin</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>{stats.total}</span>
              </div>
              <div style={{ ...cardStatsStyle, borderLeft: '4px solid #10b981' }}>
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Siap (Ready)</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>{stats.ready}</span>
              </div>
              <div style={{ ...cardStatsStyle, borderLeft: '4px solid #f59e0b' }}>
                <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>Sibuk (active)</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginTop: '0.2rem' }}>{stats.active}</span>
              </div>
            </div>

            {/* Tab Filter Status */}
            <div
              style={{
                backgroundColor: '#eef0f2',
                padding: '0.3rem',
                borderRadius: '0.7rem',
                display: 'inline-flex',
                marginBottom: '1.5rem',
                gap: '2px'
              }}
            >
              {['SEMUA', 'READY', 'active'].map((filter) => {
                const isTabActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    className={`nu-tab-btn ${isTabActive ? 'nu-tab-btn--active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                    style={{
                      border: 'none',
                      background: isTabActive ? '#176543' : 'transparent',
                      color: isTabActive ? '#fff' : '#6b7280',
                      padding: '0.55rem 1.4rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Container Grid Card Mesin */}
            {filteredMachines.length === 0 ? (
              <div style={{ backgroundColor: '#fff', border: '1px dashed #d1d5db', borderRadius: '1rem', padding: '3rem 1.5rem', textAlign: 'center' }}>
                <i className="fa-solid fa-microchip" style={{ fontSize: '1.75rem', color: '#d1d5db', marginBottom: '0.75rem', display: 'block' }}></i>
                <p style={{ color: '#9ca3af', fontWeight: 600, margin: 0 }}>Belum ada data mesin untuk status ini.</p>
              </div>
            ) : (
              <div className="nu-tx-grid">
                {filteredMachines.map((machine, idx) => {
                  const isReady = machine.status?.toLowerCase() === 'ready';
                  const isactive = machine.status?.toLowerCase() === 'active';

                  return (
                    <div
                      key={machine.id || idx}
                      className="nu-tx-card"
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #eef1f0',
                        borderRadius: '1rem',
                        padding: '1.25rem',
                        boxShadow: '0 1px 2px rgba(17,24,39,0.03)',
                        boxSizing: 'border-box',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                          <span
                            style={{
                              backgroundColor: isReady ? '#e2f0e9' : isactive ? '#fff3cd' : '#fef2f2',
                              color: isReady ? '#176543' : isactive ? '#8a6d1f' : '#dc2626',
                              borderRadius: '0.4rem',
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em'
                            }}
                          >
                            {machine.status}
                          </span>

                          <span style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 600 }}>
                            ID: #{machine.id}
                          </span>
                        </div>

                        {/* Nama Mesin */}
                        <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0 0 0.2rem 0', fontWeight: 700, letterSpacing: '0.04em' }}>
                          NAMA PERANGKAT
                        </p>
                        <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#176543', margin: '0 0 0.2rem 0', textTransform: 'capitalize' }}>
                          {machine.name}
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.72rem', margin: '0 0 1rem 0', fontWeight: 500 }}>
                          Aktif: {machine.lastActive || 'Baru saja'}
                        </p>

                        {/* Status Transaksi Saat Ini */}
                        <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0 0 0.4rem 0', fontWeight: 700, letterSpacing: '0.04em' }}>
                          AKTIVITAS SEKARANG
                        </p>
                        <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1.25rem', border: '1px solid #f3f4f6' }}>
                          {isactive && machine.activeBooking ? (
                            <div>
                              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>
                                Pelanggan: <span style={{ fontWeight: 500 }}>{machine.activeBooking.customer}</span>
                              </p>
                              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#4b5563' }}>
                                Inv: <span style={{ fontWeight: 600, color: '#176543' }}>{machine.activeBooking.code}</span>
                              </p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                {machine.activeBooking.frames} Frames • {machine.activeBooking.amount}
                              </p>
                            </div>
                          ) : (
                            <p style={{ margin: 0, textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                              Menunggu transaksi masuk...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tombol Kontrol Mesin IoT */}
                      <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="nu-ctrl-btn nu-ctrl-btn-ping"
                          onClick={() => handleKontrolMesin(machine, 'Ping')}
                        >
                          <i className="fa-solid fa-wifi"></i> Ping
                        </button>
                        <button
                          className="nu-ctrl-btn nu-ctrl-btn-restart"
                          onClick={() => handleKontrolMesin(machine, 'Restart')}
                        >
                          <i className="fa-solid fa-power-off"></i> Restart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Halaman Kosong Fleksibel saat menu lain diklik */
          <div style={{ backgroundColor: '#fff', padding: '3.5rem 1.5rem', borderRadius: '1rem', border: '1px solid #eef1f0', textAlign: 'center' }}>
            <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: '1.75rem', color: '#176543', marginBottom: '0.85rem', display: 'block', opacity: 0.7 }}></i>
            <h3 style={{ color: '#176543', margin: '0 0 0.4rem 0', fontWeight: 800 }}>Halaman {activeMenu}</h3>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>Modul pengerjaan sedang dalam proses pengembangan.</p>
          </div>
        )}
      </div>

      {/* Tombol Floating Sinkronisasi Data Manual */}
      <button
        className="nu-sync-btn"
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          backgroundColor: '#176543',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '54px',
          height: '54px',
          fontSize: '1.2rem',
          boxShadow: '0 6px 16px rgba(23, 101, 67, 0.35)',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={fetch}
        title="Refresh data mesin secara manual"
      >
        <i className="fa-solid fa-rotate"></i>
      </button>

    </div>
  );
}

// Custom CSS untuk grid statistik
const cardStatsStyle = {
  backgroundColor: '#fff',
  border: '1px solid #eef1f0',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 1px 2px rgba(17,24,39,0.02)'
};

export default StatusMesin;