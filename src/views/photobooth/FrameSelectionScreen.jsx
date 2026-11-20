import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useFetch from '../../hooks/useFetch'; // Sesuaikan path hook kamu
import Timer from '../../components/Timer';

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

// Background Grid khas NuSnaps
const gridBackgroundStyle = {
    backgroundColor: '#0F4C3A',
    backgroundImage: `
        linear-gradient(to right, rgba(229, 115, 147, 0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(229, 115, 147, 0.12) 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px',
};

const FRAMES = [
    { id: 'movie', name: 'Movie Noir', file: 'movie.png' },
    { id: 'fruits', name: 'Fresh Fruits', file: 'fruits.png' },
    { id: 'flowers', name: 'Retro Flowers', file: 'flowers.png' },
    { id: 'good_vibes', name: 'Good Vibes', file: 'good_vibes.png' },
    { id: 'halloween', name: 'Spooky Halloween', file: 'halloween.png' },
];

export default function FrameSelectionScreen() {
    const { name, code } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { post } = useFetch();
    let initialDuration = name === 'postcard' ? 600 : 300
    const [durationSeconds, setDurationSeconds] = useState(initialDuration);

    useEffect(() => {
        // Set up the interval
        const interval = setInterval(() => {
            setDurationSeconds((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // CRITICAL: Clean up the interval if the component unmounts
        return () => clearInterval(interval);
    }, []);

    // const bookingCode = location.state?.bookingCode; 
    // const customerName = location.state?.customerName;

    const [selectedFrame, setSelectedFrame] = useState('movie');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirmFrame = async () => {
        setLoading(true);
        setError(null);

        const resp = await post('bookings/select-frame', {
            booking_code: code,
            // customer_name: customerName,
            frame_design: selectedFrame
        });

        if (!resp.status) {
            setError(resp.message || 'Gagal menyimpan pilihan frame.');
            setLoading(false);
            return;
        }

        setLoading(false);
        navigate(`/${name}/start-photo/${code}`, {
            state: { selectedFrame, durationSeconds }
        });
    };

    return (
        <div
            style={{ ...gridBackgroundStyle, ...bubbleFont }}
            className="h-screen w-screen flex flex-col items-center justify-between p-6 select-none relative overflow-hidden text-[#0F4C3A]"
        >
            {/* Ambient Background Glow */}
            <div className="absolute w-[600px] h-[600px] bg-[#E57393] rounded-full blur-[140px] opacity-15 -top-40 -left-40 pointer-events-none"></div>
            <div className="absolute w-[600px] h-[600px] bg-[#E57393] rounded-full blur-[140px] opacity-15 -bottom-40 -right-40 pointer-events-none"></div>

            {/* Header dengan Tombol Kembali di Atas */}
            <header className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 flex items-center justify-center bg-[#FFFDF9] border-[3px] border-[#0F4C3A] rounded-full shadow-[0_4px_0_#0F4C3A] active:translate-y-1 active:shadow-none transition-all font-black text-xs cursor-pointer"
                >
                    ← Kembali
                </button>
                <div className="w-10 h-10 opacity-0" /> {/* Spacer */}
                <Timer
                    durationSeconds={durationSeconds}
                />
            </header>

            {/* Container Card Utama - Diatur agar mengisi ruang tersisa tanpa meluap */}
            <div className="w-full max-w-4xl flex-1 bg-[#FFFDF9] border-[5px] border-[#0F4C3A] rounded-[2.5rem] p-6 sm:p-8 shadow-[0_16px_0_rgba(0,0,0,0.2)] z-10 flex flex-col my-4 overflow-hidden">

                {/* Header di dalam Card */}
                <div className="text-center mb-6 shrink-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0F4C3A] tracking-wide">
                        PILIH FRAME KAMU
                    </h1>
                    <p className="text-[10px] sm:text-xs text-[#0F4C3A]/70 font-bold tracking-widest mt-1 uppercase">
                        Step 3 of 4 • Pilih desain yang ingin kamu gunakan
                    </p>
                </div>

                {/* DIV PEMBUNGKUS FRAME (Scrollable Area) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 mb-6 scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-2">
                        {FRAMES.map((frame) => {
                            const isSelected = selectedFrame === frame.id;
                            return (
                                <button
                                    key={frame.id}
                                    onClick={() => setSelectedFrame(frame.id)}
                                    className="group flex flex-col items-center focus:outline-none w-full"
                                >
                                    {/* Frame Card Wrapper */}
                                    <div
                                        className={`relative w-full aspect-[3/4] bg-white rounded-2xl overflow-hidden p-2 transition-all duration-300 transform ${isSelected
                                            ? 'border-[5px] border-[#E57393] shadow-[0_8px_0_#FFE5A3] -translate-y-2'
                                            : 'border-[3px] border-[#0F4C3A]/20 hover:border-[#0F4C3A]/60 hover:-translate-y-1 shadow-[0_4px_0_rgba(15,76,58,0.1)]'
                                            }`}
                                    >
                                        {/* Mockup Background */}
                                        <div className="w-full h-full grid grid-cols-2 gap-1 p-1 bg-[#0F4C3A]/5 rounded-lg">
                                            <div className="bg-[#0F4C3A]/5 rounded" />
                                            <div className="bg-[#0F4C3A]/5 rounded" />
                                            <div className="bg-[#0F4C3A]/5 rounded" />
                                            <div className="bg-[#0F4C3A]/5 rounded" />
                                        </div>

                                        {/* Frame Image */}
                                        <img
                                            src={`/templates/${frame.file}`}
                                            alt={frame.name}
                                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Frame Name */}
                                    <span
                                        className={`mt-3 font-black text-sm tracking-wide transition-colors ${isSelected
                                            ? 'text-[#E57393]'
                                            : 'text-[#0F4C3A]/60 group-hover:text-[#0F4C3A]'
                                            }`}
                                    >
                                        {frame.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div className="w-full max-w-md mx-auto mb-4 px-4 py-2 bg-[#FBD7E3] border-[3px] border-[#0F4C3A] text-xs font-bold text-center rounded-xl shrink-0">
                        ⚠️ {error}
                    </div>
                )}

                {/* Footer di dalam Card (Hanya Tombol Lanjutkan) */}
                <div className="w-full flex justify-center border-t-2 border-dashed border-[#0F4C3A]/10 pt-4 shrink-0">
                    <button
                        onClick={handleConfirmFrame}
                        disabled={loading}
                        className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 bg-[#E57393] hover:bg-[#d05c7c] disabled:bg-[#E9E2D8] text-white font-black text-sm rounded-full border-[3px] border-[#0F4C3A] shadow-[0_5px_0_#0F4C3A] transition transform active:scale-[0.97] active:shadow-[0_1px_0_#0F4C3A] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                MENYIMPAN...
                            </>
                        ) : (
                            'LANJUTKAN'
                        )}
                    </button>
                </div>

            </div>

            {/* Tambahan style kustom untuk scrollbar ramping yang estetik */}
            <style>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: rgba(15, 76, 58, 0.05);
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(15, 76, 58, 0.2);
                    border-radius: 10px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgba(15, 76, 58, 0.4);
                }
            `}</style>
        </div>
    );
}