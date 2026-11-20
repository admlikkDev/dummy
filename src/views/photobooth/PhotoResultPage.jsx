import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Sparkles, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import useFetch from "../../hooks/useFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FRAME_CONFIGS = {
    "flowers": {
        total_frames: 6,
        slots: [
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "22.1%" },
            { left: "7.05%", top: "35.65%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "35.65%", width: "40.66%", height: "22.1%" },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "22.1%" },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "22.1%" },
        ]
    },
    "fruits": {
        total_frames: 6,
        slots: [
            { left: "2.5%", top: "6%", width: "46%", height: "30%", isRound: false },
            { left: "53%", top: "6%", width: "46%", height: "30%", isRound: false },
            { left: "2.5%", top: "38%", width: "46%", height: "22%", isRound: false },
            { left: "53%", top: "38%", width: "46%", height: "22%", isRound: false },
            { left: "2.5%", top: "61%", width: "46%", height: "31%", isRound: false },
            { left: "53%", top: "61%", width: "46%", height: "31%", isRound: false }
        ]
    },
    "good_vibes": {
        total_frames: 8,
        slots: [
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "25.9%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "25.9%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "45.45%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "45.45%", width: "40.66%", height: "18.1%" },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "18.1%" },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "18.1%" },
        ]
    },
    "movie": {
        total_frames: 6,
        slots: [
            { left: "3.5%", top: "19%", width: "43.5%", height: "21.6%" },
            { left: "3.5%", top: "40%", width: "43.5%", height: "22.6%" },
            { left: "3.5%", top: "62.5%", width: "43.5%", height: "22.2%" },
            { left: "52.7%", top: "19.8%", width: "43.5%", height: "20.5%" },
            { left: "52.9%", top: "40%", width: "43.5%", height: "22.6%" },
            { left: "52.9%", top: "62.5%", width: "43.5%", height: "22.2%" },
        ]
    },
    "halloween": {
        total_frames: 6,
        slots: [
            { left: "2.3%", top: "6%", width: "44.8%", height: "19.6%" },
            { left: "49.5%", top: "6%", width: "48.6%", height: "19.6%" },
            { left: "2.3%", top: "26.1%", width: "44.8%", height: "19.6%" },
            { left: "49.5%", top: "26.1%", width: "48.6%", height: "19.6%" },
            { left: "2.3%", top: "45.2%", width: "44.8%", height: "19.6%" },
            { left: "49.5%", top: "45.2%", width: "48.6%", height: "19.6%" },
            { left: "2.3%", top: "64.3%", width: "44.8%", height: "19.6%" },
            { left: "49.5%", top: "64.3%", width: "48.6%", height: "19.6%" }
        ]
    }
};

// ================= COMPONENT SVG CUSTOM =================

const FourPointStar = ({ color, className }) => (
    <svg viewBox="0 0 100 100" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z" />
    </svg>
);

const MultiSpikeStar = ({ color, className }) => (
    <svg viewBox="0 0 100 100" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M 50 0 L 58 33 L 90 15 L 73 43 L 100 50 L 73 57 L 90 85 L 58 67 L 50 100 L 42 67 L 10 85 L 27 57 L 0 50 L 27 43 L 10 15 L 42 33 Z" />
    </svg>
);

const SplashBackground = ({ className }) => (
    <svg viewBox="0 0 200 100" fill="#9CE1F5" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M 100 10 L 115 35 L 145 20 L 135 45 L 175 35 L 150 55 L 190 65 L 145 70 L 160 90 L 120 78 L 100 90 L 80 78 L 40 90 L 55 70 L 10 65 L 50 55 L 25 35 L 65 45 L 55 20 L 85 35 Z" />
    </svg>
);

const CloverFlower = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="#F07AA6" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="50" r="18" />
        <circle cx="68" cy="50" r="18" />
        <circle cx="50" cy="32" r="18" />
        <circle cx="50" cy="68" r="18" />
        <rect x="32" y="32" width="36" height="36" rx="4" />
    </svg>
);

const SawtoothBottom = ({ className }) => (
    <svg viewBox="0 0 200 100" fill="#F7A984" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 100 L 10 40 L 25 100 L 40 30 L 55 100 L 75 20 L 95 100 L 115 20 L 135 100 L 150 30 L 165 100 L 180 40 L 190 100 Z" />
    </svg>
);

const TiltedTosca = ({ className }) => (
    <svg viewBox="0 0 100 100" fill="#6CC3B3" className={className} xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,90 90,70 70,10 10,30" />
    </svg>
);

export default function PhotoResultPage() {
    const { name, code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [resultData, setResultData] = useState(null);
    const { get } = useFetch();

    const fetchResult = async () => {
        setLoading(true);
        try {
            const resp = await get(`bookings/${code}`);
            if (resp.status) {
                setResultData(resp.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResult();
    }, [code]);

    const getFullUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFAD4] gap-3">
                <Loader2 className="w-12 h-12 animate-spin text-[#EB5B8C]" />
                <p className="font-mono text-xs tracking-widest text-[#131124]/60 uppercase font-bold">
                    Memuat Hasil Foto...
                </p>
            </div>
        );
    }

    const qrTargetUrl = `${BASE_URL}/nusnaps/result/${code}`;

    return (
        <div className="min-h-screen w-full bg-[#FEFAD4] relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 font-sans select-none">

            {/* ================= BACKGROUND DECORATIONS ================= */}
            <FourPointStar
                color="#CCA7E9"
                className="absolute top-[-2%] left-[-2%] w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 pointer-events-none z-0 opacity-90"
            />
            <MultiSpikeStar
                color="#78CCE3"
                className="absolute top-[45%] left-[-5%] -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 opacity-90"
            />
            <FourPointStar
                color="#F07AA6"
                className="absolute bottom-[-3%] left-[2%] w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 pointer-events-none z-0 opacity-90"
            />
            <TiltedTosca
                className="absolute bottom-[-5%] left-[26%] w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 pointer-events-none z-0 rotate-12 opacity-90"
            />
            <SawtoothBottom
                className="absolute bottom-[-5%] left-[52%] -translate-x-1/2 w-[220px] h-[100px] sm:w-[320px] sm:h-[130px] md:w-[380px] md:h-[150px] pointer-events-none z-0 opacity-90"
            />
            <MultiSpikeStar
                color="#F5AC83"
                className="absolute top-[-2%] right-[-3%] w-28 h-28 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-64 lg:h-64 pointer-events-none z-0 opacity-90"
            />
            <CloverFlower
                className="absolute top-[55%] right-[-5%] -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 opacity-90"
            />

            {/* ================= MAIN CONTENT CONTAINER ================= */}
            <div className="w-full max-w-[1000px] flex flex-col items-center z-10 gap-6 my-auto">

                {/* HEADER BRANDING */}
                <div className="text-center relative py-2 px-8">
                    <SplashBackground
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[460px] md:w-[540px] h-auto opacity-90 -z-10 pointer-events-none drop-shadow-sm"
                    />
                    <h1 className="text-[#EB5B8C] font-serif font-black text-5xl sm:text-7xl md:text-8xl tracking-widest leading-none drop-shadow-sm">
                        NU SNAPS
                    </h1>
                    <p className="text-[#EB5B8C] font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mt-2">
                        by @darinisahiraa
                    </p>
                </div>

                {/* GRID UTAMA */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-center px-2">

                    {/* KOLOM KIRI: FRAME PHOTO STRIP */}
                    <div className="flex justify-center w-full">
                        <div
                            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#131124]/10 w-full max-w-[360px] select-none transition-transform duration-300 hover:scale-[1.01]"
                            style={{ aspectRatio: "2/3" }}
                        >
                            {resultData?.frame_design && FRAME_CONFIGS[`${resultData.frame_design}`] ? (
                                FRAME_CONFIGS[`${resultData.frame_design}`].slots.map((slot, i) => {
                                    const url = resultData.video_url?.[i];
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                position: "absolute",
                                                left: slot.left,
                                                top: slot.top,
                                                width: slot.width,
                                                height: slot.height,
                                                borderRadius: slot.isRound ? "50%" : "6px",
                                                zIndex: 10,
                                            }}
                                            className="overflow-hidden flex items-center justify-center bg-[#1B1B3A]/5 shadow-inner"
                                        >
                                            {url ? (
                                                <video
                                                    src={getFullUrl(url)}
                                                    alt={`Slot ${i + 1}`}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[#1B1B3A]/30 text-xs font-bold">{i + 1}</span>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-sm">
                                    Loading Frame...
                                </div>
                            )}

                            {resultData?.frame_design && (
                                <img
                                    src={`/templates/${resultData.frame_design}.png`}
                                    alt="Frame Template"
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
                                />
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: GIF & BARCODE */}
                    <div className="flex flex-col gap-5 w-full items-center lg:items-stretch">

                        {/* 1. Box GIF (Diperkecil & Dibuat Proporsional) */}
                        <div className="w-full max-w-[460px] mx-auto aspect-[4/3] bg-[#131124] rounded-2xl border-[4px] border-[#131124] shadow-xl overflow-hidden flex items-center justify-center relative group">
                            {resultData?.gif_url ? (
                                <img
                                    src={getFullUrl(resultData.gif_url)}
                                    alt="Live GIF Preview"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            ) : (
                                <div className="text-gray-400 font-medium text-xs sm:text-sm text-center p-4 flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                                    Loading Live GIF...
                                </div>
                            )}
                            {/* Overlay Badge GIF */}
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 pointer-events-none">
                                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                                <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">LIVE GIF</span>
                            </div>
                        </div>

                        {/* 2. Box Barcode Area (Estetik Cokelat Warm) */}
                        <div className="w-full max-w-[460px] mx-auto bg-[#BFA18A] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-4 border border-[#AA8E77]/80">

                            {/* Container QR */}
                            <div className="bg-white p-2.5 rounded-xl flex items-center justify-center min-w-[110px] h-[110px] sm:min-w-[125px] sm:h-[125px] shadow-md border border-white/50 shrink-0">
                                <QRCodeSVG
                                    value={qrTargetUrl}
                                    size={105}
                                    bgColor={"#ffffff"}
                                    fgColor={"#131124"}
                                    level={"M"}
                                />
                            </div>

                            {/* Teks Deskripsi QR & Masa Simpan Foto */}
                            <div className="flex-1 text-white text-center sm:text-left flex flex-col justify-center">
                                <span className="text-[10px] uppercase font-mono tracking-widest text-white/80 block mb-1 font-semibold">
                                    Digital Download
                                </span>
                                <h3 className="font-serif font-bold text-xl sm:text-2xl leading-snug drop-shadow-sm">
                                    Scan QR to get <br className="hidden sm:inline" /> Digital Files!
                                </h3>

                                {/* Keterangan Tambahan: Masa Simpan Foto */}
                                <div className="mt-3 inline-flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-medium bg-black/15 px-2.5 py-1 rounded-lg border border-white/10 text-white/90">
                                    <Clock className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                                    <span>Foto akan disimpan selama <b>2 hari</b></span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Button Lanjut */}
                        <div className="w-full max-w-[460px] mx-auto flex justify-end pt-1">
                            <button
                                onClick={() => navigate(`/${name}/welcome`)}
                                className="group bg-white border-2 border-[#131124] hover:bg-[#131124] text-[#131124] hover:text-white font-bold p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 active:scale-95"
                                title="Lanjut"
                            >
                                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}