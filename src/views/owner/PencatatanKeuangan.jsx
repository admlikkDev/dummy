import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import useFetch from '../../hooks/useFetch';
import { useEffect } from 'react';

export default function PencatatanKeuangan() {
    // Simulasi Role login. Ubah menjadi 'kasir' untuk tes menyembunyikan tab di sidebar!
    const [userRole, setUserRole] = useState('owner');
    const { get, post, put, destroy } = useFetch()

    // 1. STATE UTAMA DATA TRANSAKSI
    const [transactions, setTransactions] = useState([])

    const getTransaction = async () => {
        const resp = await get('keuangan')
        if (!resp.status) {
            alert(resp.message)
            return
        }
        setTransactions(resp.data.data)
        console.log(resp.data.data)
    }

    useEffect(() => {
        getTransaction()
    }, [])

    // 2. STATE UNTUK FILTER, SIDEBAR, & SEARCH
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState('Catatan Keuangan');
    const [activeFilter, setActiveFilter] = useState('Semua');

    // 3. STATE UNTUK MODAL (CRUD)
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [type, setType] = useState('Pemasukan')
    // 4. KALKULASI RINGKASAN KEUANGAN OTOMATIS
    const totalPemasukan = transactions
        .filter(t => t.type === 'Pemasukan')
        .reduce((sum, t) => sum + Number(t.nominal), 0);

    const totalPengeluaran = transactions
        .filter(t => t.type === 'Pengeluaran')
        .reduce((sum, t) => sum + Number(t.nominal), 0);

    const saldoBersih = totalPemasukan - totalPengeluaran;

    const formatRupiah = (num) => 'Rp ' + num.toLocaleString('id-ID');

    // 5. HANDLER AKSI DATA (CRUD)
    const openTambahModal = (tipeMulai) => {
        setShowModal('TAMBAH');
    };

    const openEditModal = (tx) => {
        setSelectedId(tx.id);
        setShowModal('EDIT');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (showModal === 'TAMBAH') {
            const value = Object.fromEntries(new FormData(e.target))
            const resp = await post('keuangan', {
                ...value,
                'type': type
            })
            if (!resp.status) {
                alert(resp.message)
                // console.log(resp)
                // console.log(type)
                return
            }
            getTransaction()
        } else if (showModal === 'EDIT') {
            const value = Object.fromEntries(new FormData(e.target))
            const resp = await put(`keuangan/${selectedId}`, {
                ...value,
                'type': type
            })
            if (!resp.status) {
                alert(resp.message)
                return
            }
            getTransaction()
        }
        setShowModal(false);
    };

    const handleHapus = async(id, desc) => {
        if (window.confirm(`Apakah kamu yakin ingin menghapus catatan "${desc}"?`)) {
            await destroy(`keuangan/${id}`)
        }
        getTransaction()
    };

    // 6. LOGIKA FILTERING & SEARCHING DATA
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === 'Semua') return matchesSearch;
        if (activeFilter === 'Pemasukan') return matchesSearch && t.type === 'Pemasukan';
        if (activeFilter === 'Pengeluaran') return matchesSearch && t.type === 'Pengeluaran';
        return matchesSearch;
    });

    return (
        <div style={{ backgroundColor: '#f7f8fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif", margin: 0, padding: 0, color: '#1f2937' }}>
            <style>
                {`
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

                /* Style Tabel Modern */
                .nu-table-container {
                    background-color: #fff;
                    border: 1px solid #eef1f0;
                    border-radius: 1rem;
                    box-shadow: 0 1px 3px rgba(17,24,39,0.02);
                    overflow-x: auto;
                }
                .nu-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 0.88rem;
                }
                .nu-table th {
                    background-color: #f8fafc;
                    color: #4b5563;
                    font-weight: 700;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #edf2f7;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                }
                .nu-table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #edf2f7;
                    color: #1f2937;
                    vertical-align: middle;
                }
                .nu-table tr:last-child td {
                    border-bottom: none;
                }
                .nu-table tr:hover td {
                    background-color: #fcfdfe;
                }

                .nu-btn-primary:hover { background-color: #124f34 !important; }
                .nu-btn-danger-outline:hover { bg-color: #fdf2f2; color: #b91c1c !important; border-color: #b91c1c !important; }
                .nu-tab-btn:hover:not(.nu-tab-btn--active) { color: #176543 !important; }
                `}
            </style>

            {/* Sidebar Terintegrasi dengan Prop userRole */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                userRole={userRole}
            />

            {/* Pembungkus Utama Konten Halaman */}
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
                            <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>NUSNAPS</p>
                        </div>
                    </div>

                    {/* Sisi Kanan Profil User */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#1f2937' }}>Management</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>{userRole}</p>
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
                            {userRole.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Top Cards (Kalkulasi Otomatis Dinamis) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                    {/* Pemasukan */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #eef1f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2f0e9', color: '#176543' }}>
                                <i className="fa-solid fa-arrow-down text-sm"></i>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Pemasukan</p>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>{formatRupiah(totalPemasukan)}</p>
                    </div>

                    {/* Pengeluaran */}
                    <div style={{ backgroundColor: '#fff', border: '1px solid #eef1f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fde8e8', color: '#e11d48' }}>
                                <i className="fa-solid fa-arrow-up text-sm"></i>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Pengeluaran</p>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>{formatRupiah(totalPengeluaran)}</p>
                    </div>

                    {/* Saldo Bersih */}
                    <div style={{ backgroundColor: saldoBersih >= 0 ? '#fff' : '#fdf2f2', border: '1px solid #eef1f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                <i className="fa-solid fa-wallet text-sm"></i>
                            </div>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Saldo Bersih</p>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: saldoBersih >= 0 ? '#176543' : '#e11d48', margin: 0 }}>
                            {saldoBersih < 0 ? '-' : ''}{formatRupiah(Math.abs(saldoBersih))}
                        </p>
                    </div>
                </div>

                {/* Filter, Search, dan Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>

                    {/* Search Bar Fungsional */}
                    <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '260px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.88rem' }}></i>
                        <input
                            type="text"
                            value={searchQuery}
                            placeholder="Cari deskripsi atau kategori..."
                            style={{
                                width: '100%',
                                padding: '0.65rem 1rem 0.65rem 2.5rem',
                                backgroundColor: '#fff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '0.6rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#374151',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Filter Tipe & Tombol Tambah */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        {/* Tab Filter */}
                        <div style={{ backgroundColor: '#eef0f2', padding: '0.25rem', borderRadius: '0.6rem', display: 'inline-flex', gap: '2px' }}>
                            {['Semua', 'Pemasukan', 'Pengeluaran'].map((label) => {
                                const isTabActive = activeFilter === label;
                                return (
                                    <button
                                        key={label}
                                        className={`nu-tab-btn ${isTabActive ? 'nu-tab-btn--active' : ''}`}
                                        onClick={() => setActiveFilter(label)}
                                        style={{
                                            border: 'none',
                                            background: isTabActive ? '#176543' : 'transparent',
                                            color: isTabActive ? '#fff' : '#6b7280',
                                            padding: '0.45rem 1.1rem',
                                            borderRadius: '0.45rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tombol Aksi Tambah */}
                        <button
                            onClick={() => { openTambahModal('MASUK'), setType('Pemasukan') }}
                            className="nu-btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.55rem 1.1rem',
                                backgroundColor: '#176543',
                                color: '#fff',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: '0.6rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease'
                            }}
                        >
                            <i className="fa-solid fa-plus"></i> PEMASUKAN
                        </button>

                        <button
                            onClick={() => { openTambahModal('KELUAR'), setType('Pengeluaran') }}
                            className="nu-btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.55rem 1.1rem',
                                backgroundColor: '#248258',
                                color: '#fff',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: '0.6rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease'
                            }}
                        >
                            <i className="fa-solid fa-plus"></i> PENGELUARAN
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="nu-table-container">
                    <table className="nu-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th style={{ width: '120px' }}>Tanggal</th>
                                <th style={{ width: '110px' }}>Tipe</th>
                                <th>Deskripsi</th>
                                <th style={{ width: '160px' }}>Kategori</th>
                                <th style={{ width: '130px' }}>Metode</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Nominal</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af', fontStyle: 'italic', fontWeight: 500 }}>
                                        Tidak ada catatan transaksi yang ditemukan...
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx, idx) => (
                                    <tr key={tx.id}>
                                        <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{idx + 1}</td>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tx.date}</td>
                                        <td>
                                            <span
                                                style={{
                                                    backgroundColor: tx.type === 'Pemasukan'
                                                        ? '#e2f0e9'
                                                        : '#fde8e8',

                                                    color: tx.type === 'Pemasukan'
                                                        ? '#176543'
                                                        : '#e11d48',
                                                    borderRadius: '0.4rem',
                                                    padding: '0.2rem 0.5rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    display: 'inline-block'
                                                }}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{tx.description}</p>
                                                {tx.subDescription && (
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>{tx.subDescription}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>{tx.category}</td>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>{tx.metode_pembayaran}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.9rem', color: tx.type === 'MASUK' ? '#111827' : '#e11d48' }}>
                                            {tx.type === 'Pemasukan' ? '+' : '-'}{formatRupiah(tx.nominal)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                <button
                                                    onClick={() => openEditModal(tx)}
                                                    style={{
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#4b5563',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '0.4rem',
                                                        width: '30px',
                                                        height: '30px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Edit"
                                                >
                                                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleHapus(tx.id, tx.description)}
                                                    style={{
                                                        backgroundColor: '#fff',
                                                        color: '#ef4444',
                                                        border: '1px solid #fee2e2',
                                                        borderRadius: '0.4rem',
                                                        width: '30px',
                                                        height: '30px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Hapus"
                                                >
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL DIALOG POPUP UNTUK CRUD (TAMBAH / UPDATE) */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #eef1f0', width: '100%', maxWidth: '440px', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #edf2f7' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                    {showModal === 'TAMBAH' ? `Tambah ${type}` : 'Edit Transaksi'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ background: 'none', border: 'none', fontSize: '1rem', color: '#9ca3af', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Tanggal</label>
                                        <input
                                            name="date"
                                            required
                                            type='date'
                                            style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Metode</label>
                                        <select
                                            // value={metode_pembayaran}
                                            name='metode_pembayaran'
                                            style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none', backgroundColor: '#fff' }}
                                        >
                                            <option value="QRIS">QRIS</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Transfer Bank">Transfer Bank</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Deskripsi Utama</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Pembelian Kertas Foto"
                                        name='description'
                                        style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none' }}
                                    />
                                </div>

                                {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Keterangan Tambahan (Opsional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: Booking ID: #1024"
                                        value={subDescription}
                                        style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none' }}
                                    />
                                </div> */}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Kategori</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Kategori"
                                            name='category'
                                            style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Nominal (Rupiah)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            placeholder="Angka saja"
                                            name='nominal'
                                            style={{ padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, padding: '0.55rem', backgroundColor: '#fff', color: '#4b5563', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="nu-btn-primary"
                                        style={{ flex: 1, padding: '0.55rem', backgroundColor: '#176543', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}