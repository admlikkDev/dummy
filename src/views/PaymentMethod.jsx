import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';

/*
  Route: /:category/self-services/booking/:id/payment
*/

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

const gridBackgroundStyle = {
    backgroundColor: '#FFF6ED',
    backgroundImage: `
        linear-gradient(to right, #F3E1CE 1px, transparent 1px),
        linear-gradient(to bottom, #F3E1CE 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px',
};

const METHODS = [
    {
        key: 'cash',
        label: 'Cash',
        desc: 'Bayar langsung di kasir',
        bgColor: 'bg-[#FFF3E0]',
        borderColor: 'border-[#FFB74D]',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#F57C00" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M4.5 19.5h15M5.25 19.5V8.25a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v11.25M9 11.25h6M9 14.25h6" />
            </svg>
        )
    },
    {
        key: 'qris',
        label: 'QRIS',
        desc: 'Scan via Midtrans',
        bgColor: 'bg-[#E3F2FD]',
        borderColor: 'border-[#90CAF9]',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1E88E5" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.25h.008v.008h-.008V14.25zM17.625 14.25h.008v.008h-.008V14.25zM13.5 18.375h.008v.008h-.008V18.375zM17.625 18.375h.008v.008h-.008V18.375z" />
            </svg>
        )
    },
    {
        key: 'transfer',
        label: 'Transfer',
        desc: 'Virtual Account Bank',
        bgColor: 'bg-[#F3E5F5]',
        borderColor: 'border-[#BA68C8]',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#7B1FA2" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5h-15V21h15z" />
            </svg>
        )
    },
];

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MIDTRANS_SNAP_URL =
    import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

export default function PaymentMethod() {
    const navigate = useNavigate();
    const { category, id } = useParams();
    const { user } = useAuth();
    const [loadingKey, setLoadingKey] = useState(null);
    const [error, setError] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const { post, get } = useFetch(); // Menambahkan method get dari custom hook custom useFetch Anda
    
    // Menggunakan useRef untuk menyimpan interval agar bisa dibersihkan kapan saja
    const pollingRef = useRef(null);

    // if (!user || !user.token) return <Navigate to="/" replace />;

    // 1. Masukkan Midtrans Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = MIDTRANS_SNAP_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
            if (pollingRef.current) clearInterval(pollingRef.current); // Bersihkan polling saat pindah halaman
        };
    }, []);

    // 2. Efek Polling Otomatis saat QRIS Terbuka
    useEffect(() => {
        if (qrUrl) {
            // Cek status ke backend setiap 4 detik
            pollingRef.current = setInterval(async () => {
                try {
                    // Endpoint disesuaikan dengan struktur rute API backend Anda untuk mengambil info booking saat ini
                    const res = await get(`/bookings/${category}/${id}`);
                    // console.log(res.data)
                    if (res.status && res.data?.payment?.payment_status === 'success') {
                        clearInterval(pollingRef.current);
                        // Langsung tendang/alihkan ke halaman category-selection (sesuaikan path rute Anda)
                        setTimeout(() => {
                            navigate('/category-selection', { replace: true });
                        }, 4000);
                    }
                } catch (err) {
                    console.error("Gagal melakukan real-time check:", err);
                }
            }, 4000); 
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [qrUrl, category, id, navigate]);

    const goToStatus = (status, method) => {
        navigate(`/${category}/booking/${id}/${status}?method=${method}`);
    };

    const handleSelect = async (method) => {
        if (loadingKey) return;
        setError(null);
        setLoadingKey(method);
        setQrUrl(null);

        try {
            const res = await post(`/bookings/${category}/${id}/payments`, { method });

            if (!res.status) {
                setError(res.message);
                setLoadingKey(null);
                return;
            }

            if (method === 'cash') {
                goToStatus('success', 'cash');
                return;
            }

            // JIKA QRIS DIREK BERHASIL
            if (method === 'qris' && res.data?.payment?.qr_url) {
                setQrUrl(res.data.payment.qr_url);
                setLoadingKey(null);
                return;
            }

            // FALLBACK MODAL SNAP (UNTUK TRANSFER BANK)
            if (!window.snap) {
                setError('Pembayaran belum siap, coba lagi sebentar.');
                setLoadingKey(null);
                return;
            }

            window.snap.pay(res.data.payment.snap_token, {
                onSuccess: () => navigate('/category-selection', { replace: true }), // Jika via Snap langsung sukses, tendang juga ke category-selection
                onPending: () => goToStatus('pending', method),
                onError: () => {
                    setError('Pembayaran gagal, silakan coba lagi.');
                    setLoadingKey(null);
                },
                onClose: () => setLoadingKey(null),
            });
        } catch (err) {
            setError('Gagal memproses pembayaran, coba lagi ya.');
            setLoadingKey(null);
        }
    };

    return (
        <div style={gridBackgroundStyle} className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#FFFDF9] border-[6px] border-[#F7DCE7] rounded-[2.5rem] p-8 shadow-[0_12px_24px_-4px_rgba(74,50,38,0.15)]" style={bubbleFont}>

                {/* Header Title */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black tracking-wider text-[#4A3226]">NU SNAPS</h1>
                    <div className="w-16 h-1.5 bg-[#F6AFC7] rounded-full mx-auto mt-1" />
                </div>

                {/* Progress Step Indicator */}
                <div className="relative flex items-center justify-between bg-[#FFF6ED] border border-[#F0D5B1] rounded-2xl px-4 py-3 mb-6">
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <p className="text-[11px] font-bold text-[#4A3226]">Pilih Paket</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold ">2</span>
                        <p className="text-[11px] font-extrabold text-[#4A3226]">Custom</p>
                    </div>
                    <div className="absolute left-[16%] right-[16%] top-1/2 -translate-y-[calc(50%+9px)] h-[2px] bg-[#F0D5B1] -z-0" />
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_0_rgba(74,50,38,0.3)]">3</span>
                        <p className="text-[11px] font-extrabold text-[#4A3226]">Bayar</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-[#FFEEEF] border border-[#E3628A] rounded-xl p-2.5 mb-4 text-center">
                        <p className="text-xs font-bold text-[#E3628A]">{error}</p>
                    </div>
                )}

                {/* TAMPILAN KONDISIONAL QRIS */}
                {qrUrl ? (
                    <div className="flex flex-col items-center justify-center bg-white border-[3px] border-[#90CAF9] rounded-2xl p-6 shadow-sm text-center">
                        <p className="font-black text-lg text-[#4A3226] mb-1">Pindai Kode QRIS</p>
                        <p className="text-xs font-bold text-[#4A3226]/60 mb-4">Silakan bayar menggunakan dompet digital Anda</p>
                        
                        <div className="bg-[#FFF6ED] border-2 border-[#4A3226]/10 p-4 rounded-xl mb-5 flex items-center justify-center relative group">
                            <img src={qrUrl} alt="QRIS Midtrans" className="w-56 h-56 object-contain" />
                        </div>

                        {/* Indikator Loading Polling Halus */}
                        <div className="flex items-center justify-center gap-2 mb-2 text-[#4A3226]/70 text-xs font-bold">
                            <svg className="animate-spin h-3.5 w-3.5 text-[#1E88E5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menunggu pembayaran masuk...
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-base font-black text-[#4A3226] mb-4">
                            Pilih Metode Pembayaran
                        </p>

                        <div className="flex flex-col gap-3.5">
                            {METHODS.map((m) => {
                                const isSelected = loadingKey === m.key;
                                return (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => handleSelect(m.key)}
                                        disabled={loadingKey !== null}
                                        className={`
                                            relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left
                                            border-[3px] ${m.borderColor} ${m.bgColor}
                                            shadow-[0_5px_0_0_rgba(74,50,38,0.15)]
                                            hover:shadow-[0_7px_0_0_rgba(74,50,38,0.2)] hover:-translate-y-0.5
                                            active:shadow-[0_2px_0_0_rgba(74,50,38,0.15)] active:translate-y-0.5
                                            disabled:opacity-60 disabled:transform-none disabled:shadow-none
                                        `}
                                    >
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border-2 border-[#4A3226]/5 shrink-0">
                                            {m.svgIcon}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="font-black text-base text-[#4A3226] leading-snug">
                                                {isSelected ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4 text-[#4A3226]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Memproses...
                                                    </span>
                                                ) : (
                                                    m.label
                                                )}
                                            </span>
                                            <span className="text-xs font-bold text-[#4A3226]/60 truncate mt-0.5">
                                                {m.desc}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}