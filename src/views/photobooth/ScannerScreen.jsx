import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useFetch from '../../hooks/useFetch'; // Sesuaikan dengan path hook kamu
import { Scanner } from '@yudiel/react-qr-scanner';

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

// Background pastel kuning krim lembut sesuai gambar referensi
const softPastelBackgroundStyle = {
    backgroundColor: '#FFFDE9',
};

/* ---------- Reusable bits ---------- */

function Logo({ size = 'text-4xl' }) {
    return (
        <div className="flex flex-col items-center justify-center leading-none">
            <div className="flex items-center gap-1 font-black text-[#E85B84]">
                <span className={`${size}`}>NU</span>
                <span className={`${size} tracking-wide`}>SNAPS</span>
            </div>
            <p className="text-[10px] tracking-widest text-[#E85B84] font-bold mt-1">
                BY @ARINISAHIRAA
            </p>
        </div>
    );
}

function CardHeader({ eyebrow }) {
    return (
        <div className="text-center mb-5 w-full">
            <Logo />
            <p className="text-[11px] uppercase tracking-wider text-[#4A4A4A] font-extrabold mt-4 bg-[#F2F2F2] py-1 px-3 rounded-md inline-block border border-[#D3D3D3]">
                {eyebrow}
            </p>
        </div>
    );
}

function StudioBadge({ name }) {
    return (
        <div className="px-4 py-1 bg-[#85D2D0] border-2 border-[#4A4A4A] text-white font-black text-xs rounded-full shadow-[2px_2px_0_#4A4A4A] mb-5 tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            STUDIO: {name?.toUpperCase()}
        </div>
    );
}

function StatusAlert({ tone, children }) {
    const styles = {
        error: { bg: 'bg-[#FBE3E4] text-[#D12B46]', border: 'border-[#E85B84]', icon: '❌' },
        success: { bg: 'bg-[#E3FBE9] text-[#2BD15B]', border: 'border-[#85D2D0]', icon: '✨' }, 
    };
    const s = styles[tone] || styles.error;
    return (
        <div
            role="status"
            aria-live="polite"
            className={`px-4 py-2.5 ${s.bg} ${s.text} border-2 ${s.border} font-bold text-xs rounded-xl text-center shadow-sm flex items-center justify-center gap-2 animate-[fadeIn_0.2s_ease-out]`}
        >
            <span aria-hidden="true">{s.icon}</span>
            <span>{children}</span>
        </div>
    );
}

function ReloadButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="mt-4 px-5 py-2 bg-[#FFFDE9] hover:bg-[#F3EFE0] text-[#4A4A4A] font-black text-xs rounded-full border-2 border-[#4A4A4A] shadow-[2px_2px_0_#4A4A4A] transition transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#4A4A4A] focus:outline-none"
        >
            ↻ Reload Halaman
        </button>
    );
}

/* ---------- Main screen ---------- */

export default function ScannerScreen() {
    const { name } = useParams();
    const navigate = useNavigate();
    const { post } = useFetch();

    // Scanner state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Manual booking-code state
    const [bookingCode, setBookingCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState(null);
    const [codeSuccess, setCodeSuccess] = useState(null);
    
    const location = useLocation();
    const isAcc = location.state?.isAcc ?? false;

    const goToBookingAfterDelay = (targetValue) => {
        setTimeout(() => {
            navigate(`/${name}/select-frame/${targetValue}`);
        }, 2000);
    };

    const handleSuccess = async (result) => {
        if (!result || loading) return;

        const value = result[0].rawValue;
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const resp = await post(`check-booking/${name}/${value}`, { permission: isAcc });
            
            if (!resp.status) {
                setError(resp.message || 'QR Code tidak valid atau kedaluwarsa');
                setLoading(false);
                return;
            }

            setSuccessMsg('Booking berhasil dikonfirmasi!');
            setLoading(false);
            goToBookingAfterDelay(value); 
        } catch (err) {
            console.error(err);
            setError('Gagal menghubungi server untuk memvalidasi QR.');
            setLoading(false);
        }
    };

    const handleError = (err) => {
        console.error('Scanner Error:', err);
        setError('Gagal mengakses kamera. Pastikan izin kamera sudah diberikan');
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        const value = bookingCode.trim();
        if (!value || codeLoading) return;

        setCodeLoading(true);
        setCodeError(null);
        setCodeSuccess(null);

        try {
            const resp = await post(`check-booking/${name}/${value}`, { permission: isAcc });

            if (!resp.status) {
                setCodeError(resp.message || 'Kode booking tidak valid atau kedaluwarsa');
                setCodeLoading(false);
                return;
            }

            setCodeSuccess('Booking berhasil dikonfirmasi!');
            setCodeLoading(false);
            goToBookingAfterDelay(value); 
        } catch (err) {
            console.error(err);
            setCodeError('Gagal menghubungi server untuk memvalidasi kode.');
            setCodeLoading(false);
        }
    };

    const reload = () => {
        setTimeout(() => {
            window.location.reload(); 
        }, 300);
    };

    return (
        <div
            style={{ ...softPastelBackgroundStyle, ...bubbleFont }}
            className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 select-none gap-6 relative overflow-hidden"
        >
            {/* Dekorasi Aksen Sparkles & Shapes khas Y2K Pop sesuai gambar background */}
            <div className="absolute top-10 left-10 text-[#CBB4FA] text-6xl opacity-40 select-none pointer-events-none">✦</div>
            <div className="absolute bottom-12 right-12 text-[#FBC7D4] text-7xl opacity-50 select-none pointer-events-none">🌸</div>
            <div className="absolute top-1/4 right-8 text-[#F4A261] text-5xl opacity-40 select-none pointer-events-none">✴</div>
            <div className="absolute bottom-6 left-16 text-[#85D2D0] text-6xl opacity-40 select-none pointer-events-none">★</div>

            <div className="text-center z-10">
                <h1 className="text-[#4A4A4A] font-black text-xl sm:text-2xl tracking-wide">
                    Scan QR Code atau Masukkan Code Booking Anda!
                </h1>
                <p className="text-[#7A7A7A] text-xs font-bold mt-1">
                    Pilih salah satu cara di bawah untuk konfirmasi booking sebelum berfoto
                </p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-8 w-full max-w-4xl z-10">
                
                {/* Card: QR Scanner */}
                <div className="flex-1 bg-white border-[4px] border-[#4A4A4A] rounded-[2rem] p-6 shadow-[5px_5px_0_#4A4A4A] flex flex-col items-center">
                    <CardHeader eyebrow="QR Code Scanner" />
                    <StudioBadge name={name} />

                    {/* Kontainer Kamera Scanner */}
                    <div className="w-full aspect-square bg-[#F5F5F5] border-2 border-[#4A4A4A] rounded-[1.5rem] overflow-hidden relative mb-5">
                        {loading && (
                            <div className="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center text-[#4A4A4A] gap-2">
                                <div className="w-7 h-7 border-4 border-[#E85B84] border-t-transparent rounded-full animate-spin" />
                                <p className="font-black text-xs tracking-wider">MEMPROSES DATA...</p>
                            </div>
                        )}

                        <Scanner
                            onScan={handleSuccess}
                            onError={handleError}
                            containerStyle={{ width: '100%', height: '100%' }}
                            videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Frame sudut pembatas (Warna Pink/Magenta Y2K) */}
                        <div className="absolute inset-6 pointer-events-none z-10">
                            <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#E85B84] rounded-tl-md" />
                            <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#E85B84] rounded-tr-md" />
                            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#E85B84] rounded-bl-md" />
                            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#E85B84] rounded-br-md" />
                        </div>

                        {/* Garis laser animasi berwarna Soft Pink */}
                        <div
                            className="absolute left-6 right-6 h-0.5 bg-[#E85B84] shadow-[0_0_8px_1px_#E85B84] z-10 pointer-events-none"
                            style={{ animation: 'scanSweep 2.5s ease-in-out infinite' }}
                        />
                    </div>

                    <div className="w-full flex flex-col gap-3 min-h-[40px]">
                        {error && <StatusAlert tone="error">{error}</StatusAlert>}
                        {successMsg && <StatusAlert tone="success">{successMsg}</StatusAlert>}
                        {!error && !successMsg && !loading && (
                            <p className="text-center text-xs text-[#7A7A7A] font-bold">
                                Arahkan QR Code ke dalam area kotak kamera
                            </p>
                        )}
                    </div>

                    <ReloadButton onClick={reload} />
                </div>

                {/* Divider ATAU */}
                <div className="hidden lg:flex flex-col items-center justify-center gap-2 text-[#4A4A4A]/40 font-black text-xs">
                    <span className="w-0.5 h-12 bg-[#4A4A4A]/20" />
                    <span>ATAU</span>
                    <span className="w-0.5 h-12 bg-[#4A4A4A]/20" />
                </div>
                <div className="flex lg:hidden items-center gap-3 text-[#4A4A4A]/40 font-black text-xs">
                    <span className="h-0.5 flex-1 bg-[#4A4A4A]/20" />
                    <span>ATAU</span>
                    <span className="h-0.5 flex-1 bg-[#4A4A4A]/20" />
                </div>

                {/* Card: Manual Booking Code */}
                <div className="flex-1 bg-white border-[4px] border-[#4A4A4A] rounded-[2rem] p-6 shadow-[5px_5px_0_#4A4A4A] flex flex-col items-center">
                    <CardHeader eyebrow="Masukkan Code Booking" />
                    <StudioBadge name={name} />

                    <form onSubmit={handleCodeSubmit} className="w-full flex flex-col items-center flex-1 justify-center">
                        <div className="w-full aspect-square flex flex-col items-center justify-center gap-5 border-2 border-dashed border-[#4A4A4A]/30 rounded-[1.5rem] px-5 bg-[#FAF9F5]">
                            <span className="text-5xl" aria-hidden="true">🎫</span>
                            
                            <input
                                id="bookingCode"
                                type="text"
                                value={bookingCode}
                                onChange={(e) => setBookingCode(e.target.value)}
                                placeholder="Contoh: NS-XXXXXX"
                                disabled={codeLoading}
                                className="w-full text-center uppercase tracking-widest font-black text-[#4A4A4A] text-sm bg-white border-2 border-[#4A4A4A] rounded-full px-4 py-3 shadow-[2px_2px_0_rgba(0,0,0,0.1)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#A0A0A0] placeholder:font-bold focus:outline-none focus:border-[#E85B84] disabled:opacity-50"
                            />
                            
                            <button
                                type="submit"
                                disabled={!bookingCode.trim() || codeLoading}
                                className="w-full px-6 py-3 bg-[#E85B84] hover:bg-[#d64f77] disabled:bg-[#E0E0E0] disabled:text-[#A0A0A0] disabled:border-[#A0A0A0] disabled:shadow-none text-white font-black text-xs rounded-full border-2 border-[#4A4A4A] shadow-[3px_3px_0_#4A4A4A] transition transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_#4A4A4A] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {codeLoading ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        MEMPROSES...
                                    </>
                                ) : (
                                    'Konfirmasi Booking ✨'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="w-full flex flex-col gap-3 min-h-[40px] mt-5">
                        {codeError && <StatusAlert tone="error">{codeError}</StatusAlert>}
                        {codeSuccess && <StatusAlert tone="success">{codeSuccess}</StatusAlert>}
                    </div>

                    <ReloadButton onClick={reload} />
                </div>
            </div>

            <style>{`
                @keyframes scanSweep {
                    0% { top: 6%; opacity: 0; }
                    10% { opacity: 1; }
                    50% { top: 92%; opacity: 1; }
                    60% { opacity: 0; }
                    100% { top: 6%; opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}