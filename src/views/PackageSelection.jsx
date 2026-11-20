import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

const gridBackgroundStyle = {
    backgroundColor: '#FFF6ED',
    backgroundImage: `
        linear-gradient(to right, #F3E1CE 1px, transparent 1px),
        linear-gradient(to bottom, #F3E1CE 1px, transparent 1px)
    `,
    backgroundSize: '24px 24px',
};

// Data preset dengan SVG Vektor bersih (Menggantikan Emoticon)
const PRESET_PACKAGES = [
    {
        frames: 2,
        label: 'Standard Pack',
        desc: 'Pas buat berdua',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#4A3226" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        )
    },
    {
        frames: 4,
        label: 'Double Pack',
        desc: 'Cetak lebih puas',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#4A3226" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a.75.75 0 0 0 0-1.5 11.95 11.95 0 0 0-6.75-2.06 11.95 11.95 0 0 0-6.75 2.06.75.75 0 0 0 0 1.5h13.5zM12 11.25a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75zM21 16.5c0-1.35-.635-2.557-1.635-3.342a5.593 5.593 0 0 0-2.615-.818 7.493 7.493 0 0 1 3.5 6.16.75.75 0 0 0 1.5 0v-2zM16.5 7.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
            </svg>
        )
    },
    {
        frames: 6,
        label: 'Party Pack',
        desc: 'Rame-rame seru',
        svgIcon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#4A3226" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM18 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM7.5 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM9 15a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM22.5 15a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
            </svg>
        )
    },
];

const PRICE_PER_2_FRAMES = 15000;

export default function PackageSelection() {
    const navigate = useNavigate();
    const { category, id } = useParams();
    const { user } = useAuth();

    const [frames, setFrames] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { put } = useFetch()

    // if (!user || !user.token) return <Navigate to="/" replace />;

    const totalAmount = (frames / 2) * PRICE_PER_2_FRAMES;

    const handleIncrement = () => {
        setFrames((prev) => prev + 2);
    };

    const handleDecrement = () => {
        if (frames >= 0) setFrames((prev) => prev - 2);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const res = await put(`bookings/${category}/${id}/packages`, {
            total_frames: frames,
            total_amount: totalAmount
        });
        if (!res.status) {
            setError(res.message)
            return
        }
        setLoading(false);
        navigate(`/${category}/${id}/payment`);
    };

    return (
        <div style={gridBackgroundStyle} className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#FFFDF9] border-[6px] border-[#F7DCE7] rounded-[2.5rem] p-8 shadow-[0_12px_24px_-4px_rgba(74,50,38,0.15)]" style={bubbleFont}>

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black tracking-wider text-[#4A3226]">NU SNAPS</h1>
                    <div className="w-16 h-1.5 bg-[#F6AFC7] rounded-full mx-auto mt-1" />
                </div>

                {/* Progress Step Indicator (Disinkronkan dengan Step 1) */}
                {/* <div className="flex items-center justify-center gap-2 bg-[#FFF6ED] border border-[#F0D5B1] rounded-2xl p-2.5 mb-6">
                    <div className="flex items-center gap-1.5 opacity-50">
                        <span className="w-5 h-5 rounded-full bg-[#4A3226]/40 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                        <p className="text-xs font-bold text-[#4A3226]">Pilih Paket</p>
                    </div>
                    <div className="text-[#F6AFC7] font-bold text-xs opacity-50">→</div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                        <p className="text-xs font-extrabold text-[#4A3226]">Custom</p>
                    </div>
                    <div className="text-[#F6AFC7] font-bold text-xs opacity-50">→</div>
                    <div className="flex items-center gap-1.5 opacity-50">
                        <span className="w-5 h-5 rounded-full bg-[#4A3226]/40 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                        <p className="text-xs font-bold text-[#4A3226]">Bayar</p>
                    </div>
                </div> */}

                <div className="relative flex items-center justify-between bg-[#FFF6ED] border border-[#F0D5B1] rounded-2xl px-4 py-3 mb-6">
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                        <p className="text-[11px] font-bold text-[#4A3226]">Pilih Paket</p>
                    </div>
                    <div className="absolute left-[16%] right-[16%] top-1/2 -translate-y-[calc(50%+9px)] h-[2px] bg-[#F0D5B1] -z-0" />
                    <div className="flex flex-col items-center gap-1 relative z-10">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_0_rgba(74,50,38,0.3)]">2</span>
                        <p className="text-[11px] font-extrabold text-[#4A3226]">Custom</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 relative z-10 opacity-45">
                        <span className="w-6 h-6 rounded-full bg-[#4A3226] text-white flex items-center justify-center text-[11px] font-bold">3</span>
                        <p className="text-[11px] font-bold text-[#4A3226]">Bayar</p>
                    </div>
                </div>

                <div className="text-center mb-5">
                    <p className="text-base font-black text-[#4A3226]">Mau Tambah Cetak Berapa Strip?</p>
                    <p className="text-xs font-bold text-[#4A3226]/60 mt-0.5">Catatan: 2 strip = 1 frame</p>
                </div>

                {error && (
                    <div className="bg-[#FFEEEF] border border-[#E3628A] rounded-xl p-2.5 mb-4 text-center">
                        <p className="text-xs font-bold text-[#E3628A]">{error}</p>
                    </div>
                )}

                {/* Preset Cards (Bebas Emoticon & Pakai SVG Vektor Semutu) */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {PRESET_PACKAGES.map((pkg) => {
                        const isSelected = frames === pkg.frames;
                        return (
                            <button
                                key={pkg.frames}
                                type="button"
                                onClick={() => setFrames(pkg.frames)}
                                className={`p-3 rounded-2xl border-[3px] flex flex-col items-center justify-center transition-all duration-200 text-center
                                    ${isSelected
                                        ? 'bg-[#FEECEB] border-[#F6AFC7] shadow-[0_4px_0_0_#F6AFC7]'
                                        : 'bg-[#FFF6ED] border-[#F0D5B1] shadow-[0_4px_0_0_rgba(74,50,38,0.1)] hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <div className={`mb-1.5 p-1 rounded-lg transition-colors ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                                    {pkg.svgIcon}
                                </div>
                                <span className="font-black text-sm text-[#4A3226]">{pkg.frames} Strip</span>
                                <span className="text-[10px] text-[#4A3226]/60 leading-tight mt-0.5">{pkg.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Manual Counter & Price Card (Tanpa Emoticon) */}
                <div className="bg-[#FFF6ED] border-[3px] border-[#F0D5B1] rounded-3xl p-5 text-center mb-6 shadow-[0_5px_0_0_rgba(74,50,38,0.05)]">
                    <p className="text-xs font-bold text-[#4A3226]/60 uppercase tracking-wider mb-2">Atur Jumlah Cetak</p>

                    {/* Counter Buttons */}
                    <div className="flex items-center justify-center gap-6 mb-4">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={frames <= 0}
                            className="w-12 h-12 bg-white border-[3px] border-[#F0D5B1] text-2xl font-black text-[#4A3226] rounded-2xl flex items-center justify-center active:translate-y-0.5 disabled:opacity-40 transition shadow-sm"
                        >
                            -
                        </button>
                        <span className="text-4xl font-black text-[#4A3226] min-w-[60px]">{frames}</span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="w-12 h-12 bg-white border-[3px] border-[#F0D5B1] text-2xl font-black text-[#4A3226] rounded-2xl flex items-center justify-center active:translate-y-0.5 transition shadow-sm"
                        >
                            +
                        </button>
                    </div>

                    <div className="border-t border-[#F0D5B1]/50 pt-3 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-[#4A3226]/60 block mb-0.5">Total Harga</span>
                        <span className="text-2xl font-black text-[#E3628A]">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 bg-[#F6AFC7] hover:bg-[#F499B8] border-[3px] border-[#4A3226]/10 text-[#4A3226] font-black text-lg rounded-2xl transition-all duration-200 shadow-[0_5px_0_0_rgba(74,50,38,0.15)] active:translate-y-1 active:shadow-none disabled:opacity-50"
                >
                    {loading ? 'Menyimpan Paket... ' : 'Lanjut ke Pembayaran '}
                </button>
            </div>
        </div>
    );
}