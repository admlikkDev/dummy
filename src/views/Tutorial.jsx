import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// ================= UTILITY DEKORASI SVG =================

// Splash Belakang Logo NU SNAPS
const SplashBackground = ({ className }) => (
  <svg viewBox="0 0 200 100" fill="#9CE1F5" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 10 L 115 35 L 145 20 L 135 45 L 175 35 L 150 55 L 190 65 L 145 70 L 160 90 L 120 78 L 100 90 L 80 78 L 40 90 L 55 70 L 10 65 L 50 55 L 25 35 L 65 45 L 55 20 L 85 35 Z" />
  </svg>
);

export default function Tutorial() {
    const navigate = useNavigate();
    const { name } = useParams();

    const handleBack = () => {
        navigate(-1);
    };

    const handleNext = () => {
        navigate(`/${name}/permission`);
    };

    return (
        <div className="bg-[#FEFAD4] min-h-screen w-full flex flex-col justify-between relative overflow-hidden select-none font-sans text-[#104D49]">

            {/* ================= BAR RETRO DI SISI KIRI (WARNA-WARNI PASTEL) ================= */}
            <div className="absolute left-0 top-0 bottom-0 w-[44px] hidden md:flex flex-row z-20">
                <div className="w-[12px] h-full bg-[#E58AA6]" /> {/* Pink */}
                <div className="w-[4px] h-full bg-[#FEFAD4]" />
                <div className="w-[10px] h-full bg-[#78CCE3]" /> {/* Biru */}
                <div className="w-[4px] h-full bg-[#FEFAD4]" />
                <div className="w-[10px] h-full bg-[#F5AC83]" /> {/* Orange */}
                <div className="w-[4px] h-full bg-[#104D49]" />  {/* Hijau */}
            </div>

            {/* ================= HEADER UTAMA ================= */}
            <div className="w-full flex flex-col items-center pt-8 px-4 md:pl-20 z-10 relative">

                {/* Tombol Back Bulat Kiri Atas */}
                <button
                    onClick={handleBack}
                    className="absolute left-4 md:left-20 top-6 bg-[#FFFDF6] border-[2px] border-[#104D49] rounded-full p-2.5 px-5 flex items-center justify-center shadow-[1px_2px_0_#104D49] hover:bg-[#FDF9EA] active:translate-y-[1px] active:shadow-[0px_1px_0_#104D49] transition-transform duration-75 cursor-pointer"
                >
                    <span className="text-sm font-black text-[#104D49]">←</span>
                </button>

                {/* Logo NU SNAPS di Tengah dengan Splash Biru */}
                <div className="relative inline-block select-none my-2 pt-2">
                    <SplashBackground 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] sm:w-[220px] h-auto opacity-90 -z-10 pointer-events-none" 
                    />
                    
                    {/* Teks NU SNAPS melar vertikal */}
                    <div className="transform scale-y-[1.5] origin-center">
                        <h1 
                            className="text-[#E36C9E] text-[34px] sm:text-[42px] leading-none tracking-[0.05em] font-black flex items-center justify-center gap-1"
                            style={{ fontFamily: "'Glessure', 'Times New Roman', serif" }}
                        >
                            NU SN<span>A</span>PS
                        </h1>
                    </div>
                    {/* Kredit Kecil */}
                    <p className="text-[#E36C9E] text-[7px] tracking-[0.18em] font-bold text-center mt-2 uppercase">
                        BY @ARINISAHIRAA
                    </p>
                </div>

                {/* Judul TUTORIAL PHOTOBOOTH */}
                <div className="flex flex-col items-center mt-4">
                    <h2
                        className="text-[26px] sm:text-[36px] md:text-[44px] font-black tracking-[0.08em] text-center text-[#F5AC83]"
                        style={{ fontFamily: "'Glessure', 'Times New Roman', serif" }}
                    >
                        TUTORIAL PHOTOBOOTH
                    </h2>
                    {/* Garis Ganda Oranye */}
                    <div className="w-64 sm:w-96 md:w-[480px] h-[3px] bg-[#F5AC83] mt-1 relative">
                        <div className="absolute left-0 right-0 top-[2px] h-[1px] bg-[#F5AC83]" />
                    </div>
                </div>
            </div>

            {/* ================= AREA 4 KARTU TUTORIAL ================= */}
            <div className="w-full max-w-6xl mx-auto px-4 md:pl-24 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 z-10 my-auto">

                {/* KARTU 1: SCAN QR */}
                <div className="bg-[#FFFDF6] border-[1.5px] border-[#104D49] rounded-[2.5rem] p-6 flex flex-col items-center justify-between text-center min-h-[300px] shadow-[0_4px_10px_rgba(16,77,73,0.03)]">
                    <div className="my-auto flex items-center justify-center">
                        {/* Ikon QR Code */}
                        <svg
                            className="w-24 h-24 stroke-[#104D49]"
                            viewBox="0 0 100 100"
                            fill="none"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M 14 30 V 14 H 30" />
                            <path d="M 70 14 H 86 V 30" />
                            <path d="M 14 70 V 86 H 30" />
                            <path d="M 70 86 H 86 V 70" />
                            <rect x="24" y="24" width="14" height="14" rx="2" />
                            <rect x="29" y="29" width="4" height="4" rx="0.5" fill="#104D49" stroke="none" />
                            <rect x="62" y="24" width="14" height="14" rx="2" />
                            <rect x="67" y="29" width="4" height="4" rx="0.5" fill="#104D49" stroke="none" />
                            <rect x="24" y="62" width="14" height="14" rx="2" />
                            <rect x="29" y="67" width="4" height="4" rx="0.5" fill="#104D49" stroke="none" />
                            <path d="M 50 40 V 60 M 40 50 H 60" strokeWidth="4" />
                            <rect x="62" y="62" width="5" height="5" rx="1" fill="#104D49" stroke="none" />
                            <rect x="71" y="62" width="5" height="5" rx="1" fill="#104D49" stroke="none" />
                            <rect x="62" y="71" width="5" height="5" rx="1" fill="#104D49" stroke="none" />
                            <rect x="71" y="71" width="5" height="5" rx="1" fill="#104D49" stroke="none" />
                        </svg>
                    </div>
                    <div className="w-full mt-auto">
                        <div className="w-4/5 h-[1.5px] bg-[#E36C9E]/35 mx-auto mb-3" />
                        <h3 className="font-extrabold text-[13px] tracking-wider uppercase mb-1">SCAN QR</h3>
                        <p className="text-[10px] font-bold text-[#104D49]/70 leading-relaxed px-2">
                            Scan QR code untuk memulai sesi photobooth.
                        </p>
                    </div>
                </div>

                {/* KARTU 2: PILIH FRAME */}
                <div className="bg-[#FFFDF6] border-[1.5px] border-[#104D49] rounded-[2.5rem] p-6 flex flex-col items-center justify-between text-center min-h-[300px] shadow-[0_4px_10px_rgba(16,77,73,0.03)]">
                    <div className="my-auto flex flex-col items-center gap-3">
                        {/* Ikon Grid Frame 2x2 */}
                        <svg className="w-20 h-20 stroke-[#104D49]" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="9" height="9" rx="1.5" />
                            <rect x="13" y="2" width="9" height="9" rx="1.5" />
                            <rect x="2" y="13" width="9" height="9" rx="1.5" />
                            <rect x="13" y="13" width="9" height="9" rx="1.5" />
                            <path d="M6.5 5v3M5 6.5h3" strokeWidth="1" />
                            <path d="M17.5 5v3M16 6.5h3" strokeWidth="1" />
                            <path d="M6.5 16v3M5 17.5h3" strokeWidth="1" />
                            <path d="M17.5 16v3M16 17.5h3" strokeWidth="1" />
                        </svg>
                        <div className="flex gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#E58AA6] border border-[#104D49]/20" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#78CCE3] border border-[#104D49]/20" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F5AC83] border border-[#104D49]/20" />
                        </div>
                    </div>
                    <div className="w-full mt-auto">
                        <div className="w-4/5 h-[1.5px] bg-[#E36C9E]/35 mx-auto mb-3" />
                        <h3 className="font-extrabold text-[13px] tracking-wider uppercase mb-1">PILIH FRAME</h3>
                        <p className="text-[10px] font-bold text-[#104D49]/70 leading-relaxed px-2">
                            Pilih frame favoritmu.
                        </p>
                    </div>
                </div>

                {/* KARTU 3: FOTO & FILTER */}
                <div className="bg-[#FFFDF6] border-[1.5px] border-[#104D49] rounded-[2.5rem] p-6 flex flex-col items-center justify-between text-center min-h-[300px] shadow-[0_4px_10px_rgba(16,77,73,0.03)]">
                    <div className="my-auto flex items-center justify-center">
                        {/* Ikon Kamera */}
                        <svg className="w-20 h-20 stroke-[#104D49]" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                            <path d="M19 3l1 1.5M21 4.5l1.5.5" strokeWidth="1.5" />
                        </svg>
                    </div>
                    <div className="w-full mt-auto">
                        <div className="w-4/5 h-[1.5px] bg-[#E36C9E]/35 mx-auto mb-3" />
                        <h3 className="font-extrabold text-[13px] tracking-wider uppercase mb-1">FOTO & FILTER</h3>
                        <p className="text-[10px] font-bold text-[#104D49]/70 leading-relaxed px-2">
                            Ambil foto dan pilih filter untuk mempercantik hasil foto.
                        </p>
                    </div>
                </div>

                {/* KARTU 4: CETAK & KIRIM FILE */}
                <div className="bg-[#FFFDF6] border-[1.5px] border-[#104D49] rounded-[2.5rem] p-6 flex flex-col items-center justify-between text-center min-h-[300px] shadow-[0_4px_10px_rgba(16,77,73,0.03)]">
                    <div className="my-auto flex items-center justify-center">
                        {/* Ikon Printer / Output Cetak */}
                        <svg className="w-20 h-20 stroke-[#104D49]" viewBox="0 0 24 24" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 10l2-6h14l2 6" />
                            <rect x="2" y="10" width="20" height="11" rx="1.5" />
                            <path d="M2 15h6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1h6" />
                            <rect x="9" y="1" width="6" height="8" rx="1" transform="rotate(-8 12 5)" />
                            <circle cx="12" cy="4" r="1" transform="rotate(-8 12 5)" />
                        </svg>
                    </div>
                    <div className="w-full mt-auto">
                        <div className="w-4/5 h-[1.5px] bg-[#E36C9E]/35 mx-auto mb-3" />
                        <h3 className="font-extrabold text-[13px] tracking-wider uppercase mb-1">CETAK & KIRIM FILE</h3>
                        <p className="text-[10px] font-bold text-[#104D49]/70 leading-relaxed px-2">
                            Cetak hasil fotomu atau kirim file ke perangkatmu.
                        </p>
                    </div>
                </div>

            </div>

            {/* ================= TOMBOL LANJUT & AREA CHESSBOARD ================= */}
            <div className="w-full flex flex-col items-center relative z-10 mt-auto">

                {/* Tombol Lanjut Pink Melingkar Penuh (Pill) */}
                <button
                    onClick={handleNext}
                    className="bg-[#E58AA6] text-white font-black text-sm tracking-[0.18em] uppercase border-2 border-[#104D49] px-14 py-3.5 rounded-full shadow-[0_4px_0_#104D49] hover:bg-[#E36C9E] active:translate-y-[2px] active:shadow-[0_2px_0_#104D49] transition-all duration-75 mb-6 cursor-pointer"
                >
                    LANJUT
                </button>

                {/* Pola Papan Catur Retro Peach/Oranye & Putih Susu */}
                <div
                    className="w-full h-[54px] border-t-2 border-[#104D49]"
                    style={{
                        backgroundColor: '#FFFDF6',
                        backgroundImage: `
                            linear-gradient(45deg, #F5AC83 25%, transparent 25%),
                            linear-gradient(-45deg, #F5AC83 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #F5AC83 75%),
                            linear-gradient(-45deg, transparent 75%, #F5AC83 75%)
                        `,
                        backgroundSize: '40px 40px',
                        backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
                    }}
                />
            </div>
        </div>
    );
}