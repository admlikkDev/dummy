import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import useFetch from '../../hooks/useFetch';

export default function Gallery() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeMenu, setActiveMenu] = useState('Galeri Photobooth');
    const [userRole] = useState('kasir');

    const [sessions, setSessions] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStudio, setFilterStudio] = useState('all');
    const [busyId, setBusyId] = useState(null);

    const { get } = useFetch();
    const gridRefs = useRef({});

    // 1. Normalisasi data: Memastikan keutuhan format URL dasar API
    const normalizeSession = (raw) => {
        let rawUrl = raw.filter || '';
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            try {
                const urlObj = new URL(rawUrl);
                rawUrl = urlObj.pathname;
            } catch (e) {
                console.error("Gagal parse URL gambar:", e);
            }
        }

        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const finalProxyUrl = `${cleanBaseUrl}/api/get-photo?path=${encodeURIComponent(rawUrl)}`;

        return {
            id: raw.id,
            imageUrl: rawUrl ? finalProxyUrl : '',
            invoiceNumber: raw.booking_code || '—',
            studioName: raw.studio_name || raw.category || '—',
            customerName: raw.customer_name || '—',
            customerEmail: raw.customer_email || '',
            // AMBIL DATA TOTAL_FRAMES DI SINI (Default ke 2 jika nilainya null/0)
            totalFrames: parseInt(raw.total_frames) || 2,
        };
    };

    const fetchPhotos = async () => {
        try {
            const resp = await get('bookings');
            const bookingList = Array.isArray(resp.data?.data) ? resp.data.data : (resp.data?.data?.list || []);
            setSessions(bookingList.map(normalizeSession));
        } catch (err) {
            console.error('Gagal mengambil data booking:', err);
        } finally {
            setHasFetched(true);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const sessionsWithRefs = sessions.map((s) => ({
        ...s,
        setRef: (el) => { gridRefs.current[s.id] = el; },
    }));

    const studios = ['all', ...new Set(sessionsWithRefs.map((s) => s.studioName).filter((s) => s && s !== '—'))];

    const filtered = sessionsWithRefs.filter((s) => {
        const q = search.toLowerCase();
        const matchSearch = s.invoiceNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q);
        const matchStudio = filterStudio === 'all' || s.studioName === filterStudio;
        return matchSearch && matchStudio;
    });

    const handleDownload = useCallback(async (session) => {
        if (!session.imageUrl) return;
        setBusyId(session.id);
        try {
            const response = await fetch(session.imageUrl, { method: 'GET', mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Foto-${session.customerName}-${session.invoiceNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Gagal download:', err);
            alert('Gagal mendownload gambar. Pastikan konfigurasi CORS di server backend Anda sudah aktif.');
        } finally {
            setBusyId(null);
        }
    }, []);

    // 3. Modifikasi Fungsi Cetak Instan agar ukuran flat tanpa distorsi/crop
    const handlePrint = useCallback((session) => {
        if (!session.imageUrl) return;
        setBusyId(session.id);

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup diblokir browser. Izinkan popup untuk mencetak.');
            setBusyId(null);
            return;
        }

        // HITUNG JUMLAH HALAMAN (Contoh: 6 / 2 = 3 halaman)
        const printCount = Math.max(1, Math.ceil(session.totalFrames / 2));

        // GENERATE ELEMENT IMAGES SEBANYAK JUMLAH RANGKAP
        const imagesHtml = Array.from({ length: printCount }, () => {
            return `<div class="page"><img src="${session.imageUrl}" /></div>`;
        }).join('');

        printWindow.document.write(`
        <html>
            <head>
                <title>Print Foto - ${session.customerName}</title>
                <style>
                    @page { 
                        margin: 0; 
                        size: auto; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: #fff; 
                    }
                    .page {
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh;
                        width: 100%;
                        box-sizing: border-box;
                        /* PAKSA PRINTER UNTUK MEMBUAT HALAMAN BARU SETELAH DIV INI */
                        page-break-after: always; 
                        break-after: page;
                    }
                    /* Hilangkan page break di halaman terakhir agar tidak ada kertas kosong meluncur */
                    .page:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    img { 
                        max-width: 100%; 
                        max-height: 100vh; 
                        display: block; 
                        object-fit: contain; 
                    }
                </style>
            </head>
            <body>
                ${imagesHtml}
            </body>
        </html>
    `);
        printWindow.document.close();

        // Pastikan semua gambar tiruan selesai di-load sebelum dialog print muncul
        const allImages = printWindow.document.querySelectorAll('img');
        let loadedCount = 0;

        const triggerPrint = () => {
            loadedCount++;
            if (loadedCount === allImages.length) {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
                setBusyId(null);
            }
        };

        allImages.forEach((img) => {
            if (img.complete) {
                triggerPrint();
            } else {
                img.onload = triggerPrint;
                img.onerror = () => {
                    alert('Gagal memuat beberapa gambar untuk di-print.');
                    printWindow.close();
                    setBusyId(null);
                };
            }
        });

        // // 3. Modifikasi Fungsi Cetak Beberapa Rangkap Sekaligus Tanpa Pop-up Terblokir
        // const handlePrint = useCallback((session) => {
        //     if (!session.imageUrl) return;
        //     setBusyId(session.id);

        //     // 1. HITUNG JUMLAH HALAMAN (Contoh: 6 / 2 = 3 rangkap/halaman)
        //     const printCount = Math.max(1, Math.ceil(session.totalFrames / 2));

        //     // 2. GENERATE ELEMENT IMAGES SEBANYAK JUMLAH RANGKAP
        //     const imagesHtml = Array.from({ length: printCount }, () => {
        //         return `<div class="page"><img src="${session.imageUrl}" /></div>`;
        //     }).join('');

        //     // 3. BUAT IFRAME TERSEMBUNYI DI LATAR BELAKANG
        //     const printIframe = document.createElement('iframe');
        //     printIframe.style.position = 'fixed';
        //     printIframe.style.right = '0';
        //     printIframe.style.bottom = '0';
        //     printIframe.style.width = '0';
        //     printIframe.style.height = '0';
        //     printIframe.style.border = '0';
        //     document.body.appendChild(printIframe);

        //     const iframeDoc = printIframe.contentWindow.document;
        //     iframeDoc.open();
        //     iframeDoc.write(`
        // <html>
        //     <head>
        //         <title>Print Foto - ${session.customerName}</title>
        //         <style>
        //             @page { 
        //                 margin: 0; 
        //                 size: auto; 
        //             }
        //             body { 
        //                 margin: 0; 
        //                 padding: 0; 
        //                 background: #fff; 
        //             }
        //             .page {
        //                 display: flex; 
        //                 align-items: center; 
        //                 justify-content: center; 
        //                 min-height: 100vh;
        //                 width: 100%;
        //                 box-sizing: border-box;
        //                 /* PAKSA PRINTER UNTUK MEMBUAT HALAMAN BARU SETELAH DIV INI */
        //                 page-break-after: always; 
        //                 break-after: page;
        //             }
        //             /* Hilangkan page break di halaman terakhir agar tidak ada kertas kosong meluncur */
        //             .page:last-child {
        //                 page-break-after: avoid;
        //                 break-after: avoid;
        //             }
        //             img { 
        //                 max-width: 100%; 
        //                 max-height: 100vh; 
        //                 display: block; 
        //                 object-fit: contain; 
        //             }
        //         </style>
        //     </head>
        //     <body>
        //         ${imagesHtml}
        //     </body>
        // </html>
        // `);
        //     iframeDoc.close();

        //     // 4. TUNGGU SEMUA GAMBAR DI DALAM IFRAME SELESAI DI-LOAD
        //     const allImages = iframeDoc.querySelectorAll('img');
        //     let loadedCount = 0;

        //     const triggerPrint = () => {
        //         loadedCount++;
        //         if (loadedCount === allImages.length) {
        //             // Fokus ke iframe dan eksekusi print dialog
        //             printIframe.contentWindow.focus();
        //             printIframe.contentWindow.print();
        //         }
        //     };

        //     // Pasang callback pembersihan setelah dialog cetak ditutup oleh user/sistem
        //     printIframe.contentWindow.onafterprint = () => {
        //         document.body.removeChild(printIframe);
        //         setBusyId(null);
        //     };

        //     allImages.forEach((img) => {
        //         if (img.complete) {
        //             triggerPrint();
        //         } else {
        //             img.onload = triggerPrint;
        //             img.onerror = () => {
        //                 alert('Gagal memuat beberapa gambar untuk di-print.');
        //                 document.body.removeChild(printIframe);
        //                 setBusyId(null);
        //             };
        //         }
        //     });
        // }, []);
    }, []);

    const readyCount = sessionsWithRefs.filter((s) => s.imageUrl).length;

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
                `}
            </style>

            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                userRole={userRole}
            />

            <div className="nu-main select-none">
                {/* Header Section */}
                <div style={{ backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem', marginBottom: '1.75rem', border: '1px solid #eef1f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ backgroundColor: '#176543', color: '#fff', borderRadius: '0.6rem', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <i className={`fa-solid ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>{activeMenu}</h1>
                            <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0', fontWeight: 500 }}>NUSNAPS</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                        { label: 'Total Sesi', value: sessions.length },
                        { label: 'Siap Cetak', value: readyCount },
                    ].map((card) => (
                        <div key={card.label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                            <p className="text-xl font-black text-gray-900">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Cari Booking Code atau nama kustomer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterStudio}
                        onChange={(e) => setFilterStudio(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
                    >
                        {studios.map((st) => (
                            <option key={st} value={st}>
                                {st === 'all' ? 'Semua Tipe Studio' : st}
                            </option>
                        ))}
                    </select>
                    <button onClick={fetchPhotos} className="w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#176543] cursor-pointer flex items-center justify-center text-sm font-bold">↺</button>
                </div>

                {/* Grid Loop Data Kustomer */}
                {!hasFetched ? (
                    <div className="flex items-center justify-center py-28 text-gray-400 text-sm animate-pulse">Memuat galeri...</div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 bg-white border border-dashed border-gray-200 rounded-2xl text-center">
                        <p className="text-sm font-semibold text-gray-400">Belum ada sesi di galeri</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filtered.map((session) => {
                            const isBusy = busyId === session.id;
                            return (
                                <div key={session.id} ref={session.setRef} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#176543]/40 transition-all duration-150 p-3">

                                    {/* Area Foto */}
                                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', backgroundColor: '#f3f4f6', position: 'relative', minHeight: '180px' }}>
                                        {session.imageUrl ? (
                                            <img
                                                src={session.imageUrl}
                                                alt={`Foto ${session.customerName}`}
                                                crossOrigin="anonymous"
                                                style={{ width: '100%', height: 'auto', maxHeight: '280px', objectFit: 'contain' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x600?text=Gambar+Error';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 py-10">Belum diproses</div>
                                        )}
                                    </div>

                                    {/* Tombol Aksi - SEKARANG SELALU MUNCUL DI BAWAH FOTO */}
                                    {session.imageUrl && (
                                        <div className="mt-3 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handlePrint(session)}
                                                disabled={isBusy}
                                                className="flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase bg-[#176543] text-white hover:scale-102 active:scale-98 transition cursor-pointer disabled:opacity-50"
                                            >
                                                {isBusy && busyId === session.id ? '...' : 'Print'}
                                            </button>
                                            <button
                                                onClick={() => handleDownload(session)}
                                                disabled={isBusy}
                                                className="flex-1 text-center py-2 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-800 hover:scale-102 active:scale-98 transition cursor-pointer disabled:opacity-50"
                                            >
                                                {isBusy && busyId === session.id ? '...' : 'Download'}
                                            </button>
                                        </div>
                                    )}

                                    {/* Info Kustomer */}
                                    <div className="mt-3 pt-2 border-t border-gray-50">
                                        <p className="text-[11px] font-black text-gray-900 truncate">{session.invoiceNumber}</p>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{session.customerName}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}