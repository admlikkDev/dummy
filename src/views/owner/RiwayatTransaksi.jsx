import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import useFetch from '../../hooks/useFetch';

function RiwayatTransaksi() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Riwayat Transaksi');
  
  // State untuk Data & Pagination
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10
  });

  // State untuk Filter & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [methodFilter, setMethodFilter] = useState('SEMUA');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { get } = useFetch();

  // Efek Debounce untuk pencarian agar tidak terlalu sering menembak API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fungsi Fetch Data dari Backend
  const fetchRiwayat = async (page = 1) => {
    const queryParams = new URLSearchParams({
      page: page,
      search: debouncedSearch,
      status: statusFilter,
      method: methodFilter,
      per_page: pagination.perPage
    }).toString();

    const resp = await get(`owner/get-riwayat-transaksi?${queryParams}`);
    if (!resp.status) {
      alert(resp.message);
      return;
    }

    const { data, current_page, last_page, total } = resp.data.data;
    setTransactions(data);
    setPagination(prev => ({
      ...prev,
      currentPage: current_page,
      lastPage: last_page,
      total: total
    }));
  };

  // Panggil ulang fetch ketika filter, search, atau page berubah
  useEffect(() => {
    fetchRiwayat(1);
  }, [debouncedSearch, statusFilter, methodFilter]);

  const handlePageChange = (targetPage) => {
    if (targetPage >= 1 && targetPage <= pagination.lastPage) {
      fetchRiwayat(targetPage);
    }
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
        
        /* Table Styles */
        .nu-table-container {
          background-color: #fff;
          border: 1px solid #eef1f0;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(17, 24, 39, 0.03);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .nu-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }
        .nu-table th {
          background-color: #f9fafb;
          color: #4b5563;
          font-weight: 700;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f3f5;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }
        .nu-table td {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid #f1f3f5;
          color: #1f2937;
          font-weight: 500;
        }
        .nu-table tr:last-child td {
          border-bottom: none;
        }
        .nu-table tr:hover td {
          background-color: #fcfdfe;
        }

        /* Filter Controls */
        .nu-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .nu-search-input {
          flex: 1;
          min-width: 260px;
          padding: 0.65rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s;
        }
        .nu-search-input:focus {
          border-color: #176543;
        }
        .nu-select-filter {
          padding: 0.65rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background-color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          outline: none;
          cursor: pointer;
        }
        .nu-select-filter:focus {
          border-color: #176543;
        }

        /* Pagination Controls */
        .nu-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 0.5rem;
        }
        .nu-page-btn {
          border: 1px solid #d1d5db;
          background-color: #fff;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nu-page-btn:hover:not(:disabled) {
          border-color: #176543;
          color: #176543;
        }
        .nu-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
        {/* Top Header */}
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
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                {activeMenu}
              </h1>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>Sistem Pencatatan Pembayaran Nu Snaps</p>
            </div>
          </div>
        </div>

        {/* Filter & Bar Pencarian */}
        <div className="nu-filter-bar">
          <input
            type="text"
            className="nu-search-input"
            placeholder="Cari berdasarkan nama, email, atau invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="nu-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="SEMUA">Semua Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            className="nu-select-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="SEMUA">Semua Metode</option>
            <option value="CASH">Cash</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        {/* Tabel Data Riwayat Transaksi */}
        <div className="nu-table-container">
          <table className="nu-table">
            <thead>
              <tr>
                <th>Invoice / Code</th>
                <th>Nama Pelanggan</th>
                <th>Kategori/Studio</th>
                <th>Metode</th>
                <th>Total Bayar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#9ca3af', fontWeight: 600 }}>
                    <i className="fa-solid fa-folder-open" style={{ display: 'block', fontSize: '2rem', color: '#d1d5db', marginBottom: '0.5rem' }}></i>
                    Tidak ada riwayat transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 700, color: '#111827' }}>
                      {tx.booking_code}
                    </td>
                    <td>
                      <div>{tx.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{tx.customer_email}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600, color: '#176543' }}>
                      {tx.category}
                    </td>
                    <td>
                      <span style={{
                        backgroundColor: tx.payment_method === 'qris' ? '#e2f0e9' : '#fff3cd',
                        color: tx.payment_method === 'qris' ? '#176543' : '#8a6d1f',
                        borderRadius: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {tx.payment_method}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        color: tx.payment_status === 'success' ? '#10b981' : tx.payment_status === 'pending' ? '#f59e0b' : '#ef4444'
                      }}>
                        <span style={{
                          height: '6px',
                          width: '6px',
                          backgroundColor: tx.payment_status === 'success' ? '#10b981' : tx.payment_status === 'pending' ? '#f59e0b' : '#ef4444',
                          borderRadius: '50%'
                        }}></span>
                        {tx.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Navigasi Pagination */}
        {transactions.length > 0 && (
          <div className="nu-pagination">
            <span style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: 600 }}>
              Menampilkan <strong style={{ color: '#111827' }}>{transactions.length}</strong> dari total <strong style={{ color: '#111827' }}>{pagination.total}</strong> transaksi
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="nu-page-btn"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Sebelumnya
              </button>
              
              <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 700, padding: '0 0.5rem' }}>
                Halaman {pagination.currentPage} / {pagination.lastPage}
              </span>

              <button
                className="nu-page-btn"
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default RiwayatTransaksi;