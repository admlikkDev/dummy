import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import useFetch from '../../hooks/useFetch';

function TransaksiTerkini() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('SEMUA');
  const [activeMenu, setActiveMenu] = useState('Transaksi Terkini');
  const [transactions, setTransactions] = useState([]);
  const { get, post } = useFetch(); // Menggunakan get & post
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    const resp = await get('owner/get-transaksi-cash-sekarang');
    if (!resp.status) {
      alert(resp.message);
      return;
    }
    setTransactions(resp.data.data);
    console.log(resp.data.data);
  };

  useEffect(() => {
    fetch();
  }, []);

  // Fungsi untuk memproses pembayaran
  const handleProsesPembayaran = async (tx) => {
    const confirmPay = window.confirm(
      `Apakah Anda yakin ingin memproses pembayaran cash untuk ${tx.customer_name} sebesar Rp ${Number(tx.total_amount).toLocaleString('id-ID')}?`
    );

    if (!confirmPay) return;

    // Menyiapkan payload yang dikirim ke backend
    const payload = {
      customer_name: tx.customer_name,
      customer_email: tx.customer_email,
      categories: tx.category, // string kategori (misal: "warung, bedroom" atau "warung")
    };

    const resp = await post('owner/accept-cash-payment', payload);
    setLoading(true)

    if (resp.status) {
      alert(resp.message || 'Pembayaran berhasil dikonfirmasi!');
      setLoading(false)
      fetch(); // Refresh data setelah berhasil update status
    } else {
      setLoading(false)
      alert(resp.message || 'Gagal memproses pembayaran.');
    }
  };

  // Filter local untuk tipe pembayaran di FE (jika ingin filter manual)
  // Perhatian: DB hanya mengembalikan "cash", sesuaikan logika filter jika ingin mencakup "qris" nanti
  const filteredTransactions = activeFilter === 'SEMUA'
    ? transactions
    : transactions.filter(t => t.payment_method?.toUpperCase() === activeFilter);

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
        .nu-pay-btn:hover { background-color: #124f34 !important; }
        .nu-sync-btn:hover { transform: scale(1.06); }
        .nu-tab-btn:hover:not(.nu-tab-btn--active) { color: #176543 !important; }
        @keyframes nu-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>Selamat bertugas, Kasir</p>
            </div>
          </div>

          {/* Sisi Kanan Profil Kasir */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1f2937' }}>Kasir</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>KASIR</p>
            </div>
            <div
              style={{
                backgroundColor: '#176543',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                height: '42px',
                width: '42px',
                flexShrink: 0
              }}
            >
              U
            </div>
          </div>
        </div>

        {/* Halaman utama hanya muncul jika menu "Transaksi Terkini" aktif */}
        {activeMenu === 'Transaksi Terkini' ? (
          <>
            {/* Tab Filter Pembayaran */}
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
              {['SEMUA', 'CASH', 'QRIS'].map((filter) => {
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

            {/* Container Grid Card Transaksi */}
            {filteredTransactions.length === 0 ? (
              <div style={{ backgroundColor: '#fff', border: '1px dashed #d1d5db', borderRadius: '1rem', padding: '3rem 1.5rem', textAlign: 'center' }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: '1.75rem', color: '#d1d5db', marginBottom: '0.75rem', display: 'block' }}></i>
                <p style={{ color: '#9ca3af', fontWeight: 600, margin: 0 }}>Belum ada transaksi untuk filter ini.</p>
              </div>
            ) : (
              <div className="nu-tx-grid">
                {filteredTransactions.map((tx, idx) => (
                  <div
                    key={tx.id || idx}
                    className="nu-tx-card"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #eef1f0',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      boxShadow: '0 1px 2px rgba(17,24,39,0.03)',
                      boxSizing: 'border-box',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                      {/* Tipe Metode Pembayaran */}
                      <span
                        style={{
                          backgroundColor: tx.payment_method === 'qris' ? '#e2f0e9' : '#fff3cd',
                          color: tx.payment_method === 'qris' ? '#176543' : '#8a6d1f',
                          borderRadius: '0.4rem',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}
                      >
                        {tx.payment_method}
                      </span>

                      {/* Indikator Status Pending */}
                      <span
                        style={{
                          color: '#6b7280',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span
                          style={{
                            height: '7px',
                            width: '7px',
                            backgroundColor: '#dc3545',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}
                        ></span>
                        {tx.payment_status}
                      </span>
                    </div>

                    {/* Jika Data di-Merge */}
                    {tx.is_duplicate_merged && (
                      <div style={{
                        position: 'absolute',
                        top: '40px',
                        right: '1.25rem',
                        backgroundColor: '#176543',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.3rem'
                      }}>
                        {tx.duplicate_count} Transaksi Digabung
                      </div>
                    )}

                    <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0 0 0.2rem 0', fontWeight: 700, letterSpacing: '0.04em' }}>
                      CUSTOMER INFO
                    </p>
                    <p style={{ color: '#111827', fontSize: '0.85rem', margin: '0 0 0.2rem 0', fontWeight: 700 }}>
                      Nama: {tx.customer_name}
                    </p>
                    <p style={{ color: '#4b5563', fontSize: '0.75rem', margin: '0 0 0.85rem 0', fontWeight: 500 }}>
                      {tx.customer_email}
                    </p>

                    <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0 0 0.2rem 0', fontWeight: 700, letterSpacing: '0.04em' }}>
                      KATEGORI/STUDIO
                    </p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#176543', margin: '0 0 0.85rem 0', textTransform: 'capitalize' }}>
                      {tx.category}
                    </p>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#9ca3af',
                        borderBottom: '1px dashed #e5e7eb',
                        paddingBottom: '0.75rem',
                        marginBottom: '0.85rem',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={tx.booking_code}
                    >
                      INVOICE: <span style={{ color: '#374151' }}>{tx.booking_code}</span>
                    </div>

                    <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '0 0 0.2rem 0', fontWeight: 700, letterSpacing: '0.04em' }}>
                      TOTAL BAYAR
                    </p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 1.1rem 0' }}>
                      Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                    </p>

                    {/* Tombol Aksi Kasir */}
                    <button
                      className="nu-pay-btn"
                      style={{
                        backgroundColor: '#176543',
                        color: '#fff',
                        border: 'none',
                        padding: '0.7rem',
                        width: '100%',
                        borderRadius: '0.55rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'background-color 0.15s ease'
                      }}
                      onClick={() => handleProsesPembayaran(tx)}
                    >
                      {
                        loading ? 'Loading...' : 'Proses Pembayaran'
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Halaman Kosong Fleksibel saat menu lain di klik */
          <div style={{ backgroundColor: '#fff', padding: '3.5rem 1.5rem', borderRadius: '1rem', border: '1px solid #eef1f0', textAlign: 'center' }}>
            <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: '1.75rem', color: '#176543', marginBottom: '0.85rem', display: 'block', opacity: 0.7 }}></i>
            <h3 style={{ color: '#176543', margin: '0 0 0.4rem 0', fontWeight: 800 }}>Halaman {activeMenu}</h3>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>Modul pengerjaan sedang dalam proses pengembangan.</p>
          </div>
        )}
      </div>

      {/* Tombol Floating Sinkronisasi Data */}
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
        title="Sinkronkan data transaksi"
      >
        <i className="fa-solid fa-rotate"></i>
      </button>

    </div>
  );
}

export default TransaksiTerkini;