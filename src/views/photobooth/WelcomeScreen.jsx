import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// ================= COMPONENT SVG CUSTOM (SHARP, RESPONSIVE, NO-IMAGE) =================

// 1. Bintang 4-Sudut (Kiri Atas & Kiri Bawah)
const FourPointStar = ({ color, className }) => (
  <svg viewBox="0 0 100 100" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z" />
  </svg>
);

// 2. Bintang Spiky Banyak Sudut (Kiri Tengah & Kanan Atas)
const MultiSpikeStar = ({ color, className }) => (
  <svg viewBox="0 0 100 100" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 0 L 58 33 L 90 15 L 73 43 L 100 50 L 73 57 L 90 85 L 58 67 L 50 100 L 42 67 L 10 85 L 27 57 L 0 50 L 27 43 L 10 15 L 42 33 Z" />
  </svg>
);

// 3. Splash Background Belakang Tulisan "NU SNAPS"
const SplashBackground = ({ className }) => (
  <svg viewBox="0 0 200 100" fill="#9CE1F5" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 10 L 115 35 L 145 20 L 135 45 L 175 35 L 150 55 L 190 65 L 145 70 L 160 90 L 120 78 L 100 90 L 80 78 L 40 90 L 55 70 L 10 65 L 50 55 L 25 35 L 65 45 L 55 20 L 85 35 Z" />
  </svg>
);

// 4. Bunga Clover 4 Kelopak (Kanan Tengah)
const CloverFlower = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="#F07AA6" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="50" r="18" />
    <circle cx="68" cy="50" r="18" />
    <circle cx="50" cy="32" r="18" />
    <circle cx="50" cy="68" r="18" />
    <rect x="32" y="32" width="36" height="36" rx="4" />
  </svg>
);

// 5. Gerigi Setengah Lingkaran / Sawtooth (Bawah Tengah)
const SawtoothBottom = ({ className }) => (
  <svg viewBox="0 0 200 100" fill="#F7A984" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 100 L 10 40 L 25 100 L 40 30 L 55 100 L 75 20 L 95 100 L 115 20 L 135 100 L 150 30 L 165 100 L 180 40 L 190 100 Z" />
  </svg>
);

// 6. Shape Hijau Tosca Miring (Bawah Kiri)
const TiltedTosca = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="#6CC3B3" className={className} xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,90 90,70 70,10 10,30" />
  </svg>
);

export default function WelcomeScreen() {
    const navigate = useNavigate();
    const { name } = useParams();

    const handleStart = () => {
        navigate(`/${name}/tutorial`); 
    };

    return (
        /* 
          Wrapper Utama: min-h-screen, overflow-hidden buat clip stiker jumbo, bg kuning pastel.
          Kita pakai `flex flex-col items-center justify-center` biar konten di dalamnya kumpul di TENGAH layar.
        */
        <div 
            onClick={handleStart}
            className="bg-[#FEFAD4] min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 cursor-pointer select-none relative overflow-hidden"
        >
            {/* ================= BACKGROUND STICKERS (NO OVERFLOW, Z-0) ================= */}
            
            {/* Bintang Ungu - Kiri Atas */}
            <FourPointStar 
                color="#CCA7E9" 
                className="absolute top-[-2%] left-[-2%] w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 pointer-events-none z-0" 
            />
            
            {/* Bintang Spiky Biru - Kiri Tengah */}
            <MultiSpikeStar 
                color="#78CCE3" 
                className="absolute top-[50%] left-[-5%] -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 pointer-events-none z-0" 
            />
            
            {/* Bintang Pink - Kiri Bawah */}
            <FourPointStar 
                color="#F07AA6" 
                className="absolute bottom-[-3%] left-[2%] w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 pointer-events-none z-0" 
            />
            
            {/* Shape Hijau Tosca - Bawah Kiri */}
            <TiltedTosca 
                className="absolute bottom-[-5%] left-[26%] w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 pointer-events-none z-0 rotate-12" 
            />

            {/* Gerigi Orange Peach - Bawah Tengah */}
            <SawtoothBottom 
                className="absolute bottom-[-5%] left-[52%] -translate-x-1/2 w-[280px] h-[100px] sm:w-[350px] sm:h-[130px] md:w-[400px] md:h-[150px] pointer-events-none z-0" 
            />

            {/* Bintang Spiky Orange - Kanan Atas */}
            <MultiSpikeStar 
                color="#F5AC83" 
                className="absolute top-[-2%] right-[-3%] w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-68 lg:h-68 pointer-events-none z-0" 
            />
            
            {/* Clover Pink - Kanan Tengah */}
            <CloverFlower 
                className="absolute top-[55%] right-[-5%] -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 pointer-events-none z-0" 
            />

            {/* ================= CONTENT CONTAINER: SEMUA TEKS KUMPUL DI TENGAH (Z-10) ================= */}
            <div className="flex flex-col items-center justify-center z-10 w-full max-w-5xl relative gap-6 text-center mt-[-40px]">
                
                {/* 1. KELOMPOK LOGO UTAMA & KREDIT */}
                <div className="relative inline-block select-none py-4">
                    {/* Splash Biru Tepat di Belakang Judul "NU SNAPS" */}
                    <SplashBackground 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[680px] h-auto opacity-90 -z-10 pointer-events-none" 
                    />
                    
                    {/* Pembungkus Text Stretch agar NUSNAPS memanjang vertikal secara estetik */}
                    <div className="transform scale-y-[1.65] origin-center mb-6">
                        <h1 
                            className="text-[#EB5B8C] text-[18vw] sm:text-[120px] md:text-[145px] lg:text-[170px] leading-none tracking-[0.15em] font-black"
                            style={{ 
                                fontFamily: "'Glessure', 'Times New Roman', serif",
                            }}
                        >
                            NUSNAPS
                        </h1>
                    </div>

                    {/* Teks Kredit (Posisi absolut agar dekat Judul) */}
                    <p className="absolute bottom-[3px] left-1/2 -translate-x-1/2 text-[#EB5B8C] font-sans text-[2.8vw] sm:text-[13px] md:text-[15px] font-bold tracking-[0.25em] uppercase whitespace-nowrap">
                        BY @ARINISAHIRAA
                    </p>
                </div>

                {/* 2. TEKS PETUNJUK "KETUK LAYAR" (Juga di tengah, di bawah kelompok logo) */}
                <div className="animate-pulse mt-10">
                    <span className="text-[#BFA18A] font-sans text-[4vw] sm:text-[13px] md:text-[15px] font-black tracking-[0.3em] uppercase">
                        KETUK LAYAR UNTUK MEMULAI
                    </span>
                </div>
            </div>
        </div>
    );
}