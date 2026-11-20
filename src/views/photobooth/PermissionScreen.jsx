import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// ================= DEKORASI SVG RETRO BACKGROUND =================

// Splash Belakang Logo NU SNAPS
const SplashBackground = ({ className }) => (
  <svg viewBox="0 0 200 100" fill="#9CE1F5" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M 100 10 L 115 35 L 145 20 L 135 45 L 175 35 L 150 55 L 190 65 L 145 70 L 160 90 L 120 78 L 100 90 L 80 78 L 40 90 L 55 70 L 10 65 L 50 55 L 25 35 L 65 45 L 55 20 L 85 35 Z" />
  </svg>
);

// Sparkle Bintang Runcing 4 (Warna Ungu & Pink)
const SparkleFour = ({ className, color }) => (
  <svg className={className} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z" />
  </svg>
);

// Bintang Runcing Banyak (Warna Biru)
const SparkleMany = ({ className, color }) => (
  <svg className={className} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 0 L 58 30 L 88 12 L 70 40 L 100 50 L 70 60 L 88 88 L 58 70 L 50 100 L 42 70 L 12 88 L 30 60 L 0 50 L 30 40 L 12 12 L 42 30 Z" />
  </svg>
);

// Bintang Gemuk 5 Runcing (Hijau Toska)
const StarFat = ({ className, color }) => (
  <svg className={className} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 5 L 63 38 L 98 38 L 70 59 L 81 92 L 50 72 L 19 92 L 30 59 L 2 38 L 37 38 Z" />
  </svg>
);

// Gear / Sun Shape (Oranye & Peach)
const SunRetro = ({ className, color }) => (
  <svg className={className} viewBox="0 0 100 100" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 20 A 30 30 0 1 1 49.9 20 Z" stroke={color} strokeWidth="8" strokeDasharray="12 6" fill="none" />
    <circle cx="50" cy="50" r="22" fill={color} />
  </svg>
);

export default function PermissionScreen() {
    const navigate = useNavigate();
    const { name } = useParams();
    
    // Step 1: Meminta permission (surat airmail)
    // Step 2: Halaman pemberitahuan waktu (kertas binder)
    const [step, setStep] = useState(1);
    const [permission, setPermission] = useState(false);

    const handleSelectPermission = (isAccepted) => {
        setPermission(isAccepted);
        setStep(2); // Lanjut ke pemberitahuan waktu
    };

    const handleFinalSubmit = () => {
        // Kirim state akhir ke halaman scanner
        navigate(`/${name}/scanner`, { state: { isAcc: permission } });
    };

    return (
        <div className="bg-[#FEFAD4] min-h-screen w-full flex flex-col justify-between items-center relative overflow-hidden select-none px-6 py-8 text-[#104D49]">
            
            {/* ================= BAR RETRO DI SISI KANAN (WARNA PASTEL) ================= */}
            <div className="absolute right-0 top-0 bottom-0 w-[44px] hidden md:flex flex-row z-20">
                <div className="w-[4px] h-full bg-[#104D49]" />  {/* Hijau */}
                <div className="w-[4px] h-full bg-[#FEFAD4]" />
                <div className="w-[10px] h-full bg-[#F5AC83]" /> {/* Orange */}
                <div className="w-[4px] h-full bg-[#FEFAD4]" />
                <div className="w-[10px] h-full bg-[#78CCE3]" /> {/* Biru */}
                <div className="w-[4px] h-full bg-[#FEFAD4]" />
                <div className="w-[12px] h-full bg-[#E58AA6]" /> {/* Pink */}
            </div>

            {/* ================= STIKER / ELEMENT RETRO DI BACKGROUND ================= */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
                {/* Atas Kiri */}
                <SunRetro className="absolute left-32 top-6 w-100 h-100 opacity-95" color="#F5AC83" />
                <SparkleFour className="absolute right-10 top-12 w-100 h-100 opacity-90" color="#D5B3F5" />
                
                {/* Tengah Kiri */}
                <SparkleMany className="absolute left-8 top-1/2 -translate-y-1/2 w-20 h-20 opacity-90" color="#78CCE3" />
                
                {/* Bawah Kiri */}
                <SparkleFour className="absolute left-12 bottom-12 w-50 h-50 opacity-95" color="#E58AA6" />
                <StarFat className="absolute left-80 bottom-0 w-80 h-80 opacity-90" color="#63C3A7" />

                {/* Bawah Tengah-Kanan */}
                <SunRetro className="absolute right-48 bottom-4 w-20 h-20 opacity-95" color="#FFA984" />
            </div>

            {/* ================= HEADER BRAND NU SNAPS ================= */}
            <div className="w-full flex flex-col items-center pt-4 px-4 md:pr-20 z-10 relative">
                <div className="relative inline-block select-none">
                    <SplashBackground 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[280px] h-auto opacity-90 -z-10 pointer-events-none" 
                    />
                    <div className="transform scale-y-[1.5] origin-center">
                        <h1 
                            className="text-[#E36C9E] text-[42px] sm:text-[54px] leading-none tracking-[0.05em] font-black flex items-center justify-center gap-1"
                            style={{ fontFamily: "'Glessure', 'Times New Roman', serif" }}
                        >
                            NU SN<span>A</span>PS
                        </h1>
                    </div>
                    <p className="text-[#E36C9E] text-[9px] sm:text-[11px] tracking-[0.18em] font-bold text-center mt-3 uppercase">
                        BY @ARINISAHIRAA
                    </p>
                </div>
            </div>

            {/* ================= KONTEN UTAMA (KARTU INTERAKTIF) ================= */}
            <div className="w-full max-w-3xl z-10 flex items-center justify-center my-auto md:pr-20">
                {step === 1 ? (
                    /* ================= STEP 1: AIRMAIL ENVELOPE ================= */
                    <div className="relative w-full min-h-[400px] md:min-h-[460px] flex flex-col justify-between">
                        {/* Shadow Merah Muda di Belakang */}
                        <div className="absolute inset-0 bg-[#E58AA6] rounded-3xl translate-x-3 translate-y-3 opacity-95" />

                        {/* Amplop Surat Utama */}
                        <div className="absolute inset-0 bg-[#FFFDF6] border-2 border-[#104D49] rounded-3xl p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-[6px_6px_0_rgba(16,77,73,1)]">
                            {/* Gelombang Potongan Tiket di Setiap Sudut */}
                            <div className="absolute top-0 left-0 w-10 h-10 bg-[#FEFAD4] border-r-2 border-b-2 border-[#104D49] rounded-full -translate-x-5 -translate-y-5" />
                            <div className="absolute top-0 right-0 w-10 h-10 bg-[#FEFAD4] border-l-2 border-b-2 border-[#104D49] rounded-full translate-x-5 -translate-y-5" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 bg-[#FEFAD4] border-r-2 border-t-2 border-[#104D49] rounded-full -translate-x-5 translate-y-5" />
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#FEFAD4] border-l-2 border-t-2 border-[#104D49] rounded-full translate-x-5 translate-y-5" />

                            {/* Border Garis Airmail Atas */}
                            <div className="absolute top-3 left-8 right-8 h-4 flex justify-around overflow-hidden select-none pointer-events-none">
                                {[...Array(22)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-8 h-4 transform -skew-x-[35deg] ${
                                            i % 2 === 0 ? 'bg-[#E36C9E]' : 'bg-[#104D49]'
                                        }`} 
                                    />
                                ))}
                            </div>

                            {/* Konten Surat */}
                            <div className="my-auto flex flex-col items-center justify-center text-center w-full px-4 relative mt-6">
                                {/* Stempel Hati di Samping */}
                                <div className="absolute left-0 md:left-4 -top-2 bg-[#104D49] w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                                    <svg className="w-6 h-6 fill-[#E58AA6]" viewBox="0 0 24 24">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </div>

                                {/* Judul "Hey!" */}
                                <div className="relative mb-6">
                                    <h2 
                                        className="text-[#E36C9E] text-5xl md:text-6xl font-normal italic tracking-wide"
                                        style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}
                                    >
                                        Hey!
                                    </h2>
                                    {/* Coretan Pensil di bawah judul */}
                                    <svg className="w-24 h-4 absolute -bottom-3 left-1/2 -translate-x-1/2 stroke-[#104D49]" fill="none" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M 5 6 Q 40 1 85 6" />
                                        <path d="M 12 10 Q 42 3 78 10" />
                                    </svg>
                                </div>

                                {/* Deskripsi */}
                                <div className="mt-6 flex flex-col items-center gap-2 text-[#104D49]">
                                    <p className="text-lg sm:text-xl md:text-[22px] font-bold tracking-wide leading-relaxed">
                                        Boleh ya aku taro fotonya di IG Story @nusnapsdgn?
                                    </p>
                                    <p className="text-base sm:text-lg md:text-[19px] font-medium tracking-wide flex items-center justify-center gap-1.5 opacity-90 mt-1">
                                        Your snap is too cute not to share 🥺 💙
                                    </p>
                                </div>

                                {/* Tombol Opsi (Retro 3D Pop Style) */}
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                                    <button 
                                        onClick={() => handleSelectPermission(true)}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-[#E36C9E] text-white font-extrabold text-sm md:text-base uppercase tracking-wider border-2 border-[#104D49] rounded-2xl shadow-[4px_4px_0_#104D49] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#104D49] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                                    >
                                        Y, post aja!
                                    </button>
                                    <button 
                                        onClick={() => handleSelectPermission(false)}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-[#78CCE3] text-[#104D49] font-extrabold text-sm md:text-base uppercase tracking-wider border-2 border-[#104D49] rounded-2xl shadow-[4px_4px_0_#104D49] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#104D49] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                                    >
                                        G, simpen dulu
                                    </button>
                                </div>
                            </div>

                            {/* Border Garis Airmail Bawah */}
                            <div className="absolute bottom-3 left-8 right-8 h-4 flex justify-around overflow-hidden select-none pointer-events-none">
                                {[...Array(22)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-8 h-4 transform -skew-x-[35deg] ${
                                            i % 2 === 0 ? 'bg-[#E36C9E]' : 'bg-[#104D49]'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ================= STEP 2: TEAR-OFF BINDER PAPER ================= */
                    <div className="relative w-full min-h-[400px] md:min-h-[460px] flex flex-col justify-between">
                        {/* Shadow Binder */}
                        <div className="absolute inset-0 bg-[#E58AA6]/10 rounded-2xl translate-x-3 translate-y-3" />

                        {/* Kertas Binder Utama */}
                        <div className="absolute inset-0 bg-[#FFFDF6] border-2 border-[#104D49] rounded-3xl p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-[6px_6px_0_rgba(16,77,73,1)]">
                            
                            {/* Sobekan Spiral Binder di Sisi Atas */}
                            <div className="absolute top-0 left-0 right-0 h-5 flex justify-around px-8 select-none pointer-events-none">
                                {[...Array(18)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="w-4 h-4 rounded-full bg-[#FEFAD4] border-b-2 border-[#104D49] -translate-y-[7px]" />
                                    </div>
                                ))}
                            </div>

                            {/* Selotip Pink / Tape Retro di Kiri Atas */}
                            <div className="absolute -left-4 top-10 w-28 h-9 bg-[#E58AA6]/80 border-2 border-[#104D49] transform rotate-[-12deg] flex items-center justify-center z-20 shadow-sm">
                                {/* Klip Pin Hitam Bulat */}
                                <div className="w-5 h-5 rounded-full bg-[#104D49] flex items-center justify-center border border-[#FFFDF6]">
                                    <div className="w-2 h-2 rounded-full bg-[#FFFDF6]" />
                                </div>
                            </div>

                            {/* Setengah Lingkaran Guntingan Tiket Bawah */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-5 bg-[#FEFAD4] border-t-2 border-l-2 border-r-2 border-[#104D49] rounded-t-full" />

                            {/* Konten Kertas Binder */}
                            <div className="my-auto flex flex-col items-center justify-center text-center w-full px-4 relative mt-4">
                                
                                {/* Garis Vintage Atas */}
                                <div className="w-full border-b-2 border-dashed border-[#104D49]/30 mb-8" />

                                {/* Isi Teks Pengumuman */}
                                <div className="flex flex-col items-center gap-3 text-[#104D49] py-2">
                                    <p className="text-xl sm:text-2xl md:text-[26px] font-black tracking-wide leading-snug">
                                        Kamu punya waktu {`${name === 'postcard' ? 10 : 5}`} menit yaa!
                                    </p>
                                    <p className="text-base sm:text-lg md:text-[18px] font-bold tracking-wide text-[#104D49]/80">
                                        Aman banget kok~ Santai aja, pose sepuasnya!
                                    </p>
                                </div>

                                {/* Garis Vintage Bawah */}
                                <div className="w-full border-t-2 border-dashed border-[#104D49]/30 mt-8" />

                                {/* Tombol Submit Final (Retro 3D Pop Style) */}
                                <div className="mt-8 w-full flex justify-center">
                                    <button 
                                        onClick={handleFinalSubmit}
                                        className="w-full sm:w-auto px-10 py-4 bg-[#63C3A7] text-[#104D49] font-black text-sm md:text-base uppercase tracking-widest border-2 border-[#104D49] rounded-2xl shadow-[4px_4px_0_#104D49] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#104D49] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
                                    >
                                        OKEEE, GAS!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Kosong untuk penyeimbang posisi flex */}
            <div className="w-full h-8 hidden md:block" />
        </div>
    );
}