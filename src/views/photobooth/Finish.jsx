import React, { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { toPng } from 'html-to-image';

/* ─────────────────────────────────────────────────────────────
    HELPER CONVERSION & URL (DITARUH DI LUAR KOMPONEN)
───────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const toUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/api/get-photo?path=${path}`;
};

const toVideoUrl = (path) => {
    if (!path) return "";
    return `${API_BASE}/api/get-photo?path=${path}`;
};

/* ─────────────────────────────────────────────────────────────
    HELPER DOWNLOAD FILE & LAYOUT
───────────────────────────────────────────────────────────── */
const downloadBlob = async (url, filename) => {
    try {
        const resp = await fetch(url, { mode: 'cors' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    } catch (err) {
        console.error('Download gagal:', err);
        window.open(url, '_blank', 'noopener');
        alert(`Download otomatis gagal.\nFile dibuka di tab baru — klik kanan → Simpan sebagai.\n\nURL: ${url}`);
    }
};

const downloadLayout = async (ref, filename) => {
    if (!ref.current) return;
    try {
        const dataUrl = await toPng(ref.current, {
            pixelRatio: 2,
            cacheBust: true,
            fetchRequestInit: { mode: 'cors' },
        });
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error('Layout download gagal:', err);
        alert('Gagal menghasilkan layout. Pastikan server API & CDN mengirimkan header CORS (Access-Control-Allow-Origin).');
    }
};

/* ─────────────────────────────────────────────────────────────
    KONFIGURASI SLOT FRAME FOTO & VIDEO
───────────────────────────────────────────────────────────── */
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
            { left: "7.05%", top: "6.35%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "52.36%", top: "6.35%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "7.05%", top: "35.65%", width: "40.66%", height: "27.1%", isRound: true },
            { left: "52.36%", top: "35.65%", width: "40.66%", height: "27.1%", isRound: true },
            { left: "7.05%", top: "65.0%", width: "40.66%", height: "22.1%", isRound: false },
            { left: "52.36%", top: "65.0%", width: "40.66%", height: "22.1%", isRound: false },
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
            { left: "4.8%", top: "14.2%", width: "43.5%", height: "21.6%" },
            { left: "4.8%", top: "39.5%", width: "43.5%", height: "21.6%" },
            { left: "4.8%", top: "64.8%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "14.2%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "39.5%", width: "43.5%", height: "21.6%" },
            { left: "51.7%", top: "64.8%", width: "43.5%", height: "21.6%" },
        ]
    }
};

/* ─────────────────────────────────────────────────────────────
    KOMPONEN FRAME LAYOUT DINAMIS
───────────────────────────────────────────────────────────── */
const LocalFrameContainer = forwardRef(({ frameKey, photos = [], filter = 'none', positions = [] }, ref) => {
    const config = FRAME_CONFIGS[frameKey];
    if (!config) return null;

    const frameOverlayUrl = `/templates/${frameKey}.png`;

    return (
        <div ref={ref} className="relative w-full aspect-[2/3] select-none overflow-hidden bg-white shadow-sm">
            {config.slots.map((slot, idx) => {
                const mediaItem = photos[idx];
                const pos = positions[idx] || { x: 50, y: 50 };
                const isVideo = mediaItem && (mediaItem.endsWith('.webm') || mediaItem.endsWith('.mp4'));

                return (
                    <div
                        key={idx}
                        className="absolute overflow-hidden bg-[#EFEFEF]"
                        style={{
                            left: slot.left,
                            top: slot.top,
                            width: slot.width,
                            height: slot.height,
                            borderRadius: slot.isRound ? '9999px' : '0px',
                        }}
                    >
                        {mediaItem && (
                            isVideo ? (
                                <video
                                    src={mediaItem}
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: filter,
                                        objectPosition: `${pos.x}% ${pos.y}%`
                                    }}
                                />
                            ) : (
                                <img
                                    src={mediaItem}
                                    alt={`Slot ${idx + 1}`}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: filter,
                                        objectPosition: `${pos.x}% ${pos.y}%`
                                    }}
                                />
                            )
                        )}
                    </div>
                );
            })}
            <img
                src={frameOverlayUrl}
                alt="Template Frame"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full z-10 pointer-events-none object-fill"
            />
        </div>
    );
});

LocalFrameContainer.displayName = 'LocalFrameContainer';

/* ─────────────────────────────────────────────────────────────
    REKAM FRAME VIDEO -> FILE VIDEO (.webm)
───────────────────────────────────────────────────────────── */
const getObjectPositionFraction = (video) => {
    const style = window.getComputedStyle(video);
    const [xStr, yStr] = (style.objectPosition || '50% 50%').split(' ');
    const px = parseFloat(xStr) / 100 || 0.5;
    const py = parseFloat(yStr) / 100 || 0.5;
    return { px, py };
};

const drawVideoCover = (ctx, video, rectX, rectY, rectW, rectH) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const { px, py } = getObjectPositionFraction(video);
    const scale = Math.max(rectW / vw, rectH / vh);
    const drawW = vw * scale;
    const drawH = vh * scale;

    const offsetX = (rectW - drawW) * px;
    const offsetY = (rectH - drawH) * py;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rectX, rectY, rectW, rectH);
    ctx.clip();
    ctx.drawImage(video, rectX + offsetX, rectY + offsetY, drawW, drawH);
    ctx.restore();
};

const recordVideoLayout = async (containerRef, filename, { durationSec = 5, fps = 30 } = {}) => {
    const container = containerRef.current;
    if (!container) return;

    const videos = Array.from(container.querySelectorAll('video'));
    const templateImg = container.querySelector('img');

    if (videos.length === 0) {
        alert('Tidak ada video untuk direkam.');
        return;
    }

    const rect = container.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    await Promise.all(videos.map((v) => {
        v.currentTime = 0;
        v.muted = true;
        return v.play().catch(() => { });
    }));

    let templateEl = null;
    if (templateImg) {
        templateEl = new Image();
        templateEl.crossOrigin = 'anonymous';
        templateEl.src = templateImg.src;
        await new Promise((res) => {
            if (templateEl.complete) return res();
            templateEl.onload = res;
            templateEl.onerror = res;
        });
    }

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm',
        videoBitsPerSecond: 6_000_000,
    });

    const chunks = [];
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

    const drawFrame = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);

        videos.forEach((video) => {
            const wrapper = video.closest('div');
            const wRect = wrapper.getBoundingClientRect();
            const x = wRect.left - rect.left;
            const y = wRect.top - rect.top;
            drawVideoCover(ctx, video, x, y, wRect.width, wRect.height);
        });

        if (templateEl) {
            ctx.drawImage(templateEl, 0, 0, rect.width, rect.height);
        }
    };

    let rafId;
    const loop = () => {
        drawFrame();
        rafId = requestAnimationFrame(loop);
    };

    return new Promise((resolve) => {
        recorder.onstop = () => {
            cancelAnimationFrame(rafId);
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
            resolve();
        };

        recorder.start();
        loop();
        setTimeout(() => recorder.stop(), durationSec * 1000);
    });
};

/* ─────────────────────────────────────────────────────────────
    SUB COMPONENTS
───────────────────────────────────────────────────────────── */
function Tab({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                'px-5 py-2 rounded-full font-black uppercase text-[11px] tracking-widest transition-all border-2 border-[#4A4A4A]',
                active
                    ? 'bg-[#E85B84] text-white shadow-[2px_2px_0_#4A4A4A] scale-105'
                    : 'bg-white text-[#4A4A4A] hover:bg-[#FAF9F5]',
            ].join(' ')}
        >
            {label}
        </button>
    );
}

function DownloadBtn({ onClick, label, accent, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                'w-full py-3.5 font-black rounded-2xl border-2 border-[#4A4A4A] uppercase tracking-wider text-xs transition-all hover:scale-[1.01] active:translate-x-[1px] active:translate-y-[1px]',
                disabled ? 'opacity-50 cursor-not-allowed bg-[#E0E0E0] text-[#A0A0A0] border-[#A0A0A0] shadow-none' : 'shadow-[3px_3px_0_#4A4A4A]',
                !disabled && (accent
                    ? 'bg-[#E85B84] text-white hover:bg-[#d64f77]'
                    : 'bg-[#85D2D0] text-[#4A4A4A] hover:bg-[#74c2c0]')
            ].join(' ')}
        >
            {label}
        </button>
    );
}

function PhotoCard({ src, index, filter, onDownload }) {
    return (
        <div className="mb-6 bg-white p-4 border-[3px] border-[#4A4A4A] rounded-[2rem] shadow-[4px_4px_0_#4A4A4A] flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border-2 border-[#4A4A4A]">
                <img
                    src={src}
                    alt={`Foto ${index + 1}`}
                    crossOrigin="anonymous"
                    className="w-full object-cover"
                    style={{ filter }}
                />
            </div>
            <DownloadBtn
                label={`Download Foto ${index + 1} ✨`}
                onClick={onDownload}
            />
        </div>
    );
}

function VideoCard({ src, index, onDownload }) {
    return (
        <div className="mb-6 bg-white p-4 border-[3px] border-[#4A4A4A] rounded-[2rem] shadow-[4px_4px_0_#4A4A4A] flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border-2 border-[#4A4A4A] bg-black">
                <video
                    src={src}
                    loop
                    autoPlay
                    muted
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full aspect-video object-contain"
                />
            </div>
            <DownloadBtn
                label={`Download Video ${index + 1}`}
                onClick={onDownload}
                accent
            />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
    MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function Finish() {
    const { get } = useFetch();
    const { code } = useParams();

    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [gifUrl, setGifUrl] = useState(null);
    const [selectedFrame, setSelectedFrame] = useState(null);
    const [selectedPhotos, setSelectedPhotos] = useState("");
    const [photoFilter, setPhotoFilter] = useState('none');
    const [photoPositions, setPhotoPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('layout');
    const [recordingVideo, setRecordingVideo] = useState(false);
    const [, setLivePhotos] = useState([]);
    const [, setPermission] = useState([]);

    const photoFrameRef = useRef(null);
    const videoFrameRef = useRef(null);

    /* ── Fetch data dari API bookings/:code ── */
    useEffect(() => {
        let isMounted = true;

        const fetchAttachment = async () => {
            try {
                const resp = await get(`bookings/${code}`);
                console.log(resp)
                const data = resp?.data?.data || resp?.data;

                if (!data || !isMounted) return;

                const rawPhotos = Array.isArray(data.fotos) ? data.fotos : [];
                const rawVideos = Array.isArray(data.video_url) ? data.video_url : [];
                const rawLive = Array.isArray(data.live_fotos) ? data.live_fotos : [];

                setPhotos(rawPhotos.map(toUrl));
                
                // Set URL gambar terfilter dengan aman
                if (data.filter) {
                    setSelectedPhotos(toUrl(data.filter));
                }

                setVideos(rawVideos.map(toVideoUrl));
                setLivePhotos(rawLive.map(toUrl));
                setGifUrl(data.gif_url ? toUrl(data.gif_url) : null);
                setPhotoFilter(data.filter || "none");
                setSelectedFrame(data.frame_design || null);
                setPermission(data.permission ?? null);

            } catch (err) {
                console.error('Gagal load data NuSnaps:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (code) {
            fetchAttachment();
        }

        return () => {
            isMounted = false;
        };
    }, [code, get]); // Cukup dengan 'code' & 'get' saja

    const isFrameValid = selectedFrame && FRAME_CONFIGS[selectedFrame];

    /* ── Download handlers ── */
    const handleDownloadPhoto = useCallback((src, i) =>
        downloadBlob(src, `foto-${i + 1}.jpg`), []);

    const handleDownloadVideo = useCallback((src, i) =>
        downloadBlob(src, `live-${i + 1}.webm`), []);

    const handleDownloadGif = useCallback(() =>
        gifUrl && downloadBlob(gifUrl, 'photobooth.gif'), [gifUrl]);

    const handleDownloadPhotoLayout = useCallback(() =>
        downloadLayout(photoFrameRef, 'frame-foto.png'), []);

    const handleDownloadVideoLayout = useCallback(async () => {
        setRecordingVideo(true);
        try {
            await recordVideoLayout(videoFrameRef, 'frame-video.webm', { durationSec: 5 });
        } catch (err) {
            console.error('Rekam frame video gagal:', err);
            alert('Gagal merekam frame video. Pastikan browser mendukung MediaRecorder dan video disajikan dengan header CORS.');
        } finally {
            setRecordingVideo(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFDE9] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#E85B84] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#4A4A4A] font-black text-xs tracking-wider uppercase">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFDE9] font-sans pb-24 relative overflow-hidden">
            <div className="absolute top-10 left-6 text-[#CBB4FA] text-5xl opacity-40 pointer-events-none">✦</div>
            <div className="absolute bottom-24 right-8 text-[#FBC7D4] text-6xl opacity-40 pointer-events-none">🌸</div>

            {/* ── HEADER ── */}
            <header className="bg-white p-6 border-b-4 border-[#4A4A4A] shadow-md text-center sticky top-0 z-50">
                <div className="flex flex-col items-center justify-center leading-none">
                    <div className="flex items-center gap-1 font-black text-[#E85B84] text-2xl">
                        <span>NU</span>
                        <span className="tracking-wide">SNAPS</span>
                    </div>
                    <p className="text-[9px] tracking-widest text-[#E85B84] font-bold mt-1">
                        BY @ARINISAHIRAA
                    </p>
                </div>
                <div className="flex justify-center gap-2 mt-5 flex-wrap">
                    {['layout', 'foto', 'live', 'gif'].map(t => (
                        <Tab key={t} label={t === 'live' ? 'Live Video' : t} active={tab === t} onClick={() => setTab(t)} />
                    ))}
                </div>
            </header>

            {/* ── CONTENT ── */}
            <main className="p-4 max-w-sm mx-auto z-10 relative mt-4">
                {/* ── LAYOUT TAB ── */}
                {tab === 'layout' && (
                    <div className="flex flex-col gap-8">
                        {!isFrameValid && (
                            <div className="bg-[#FBE3E4] border-2 border-[#E85B84] rounded-2xl p-4 text-center text-[#D12B46] font-bold text-xs">
                                Frame "{selectedFrame}" tidak ditemukan di FRAME_CONFIGS.
                            </div>
                        )}

                        {isFrameValid && (
                            <>
                                <div className="flex flex-col gap-3 bg-white p-4 border-[3px] border-[#4A4A4A] rounded-[2rem] shadow-[4px_4px_0_#4A4A4A]">
                                    <p className="text-[#4A4A4A] text-xs font-black uppercase tracking-wider text-center bg-[#FAF9F5] py-1 rounded-md border border-[#4A4A4A]/20">
                                        📸 Frame Foto
                                    </p>
                                    <div className="border-2 border-[#4A4A4A] rounded-xl overflow-hidden">
                                        <div ref={photoFrameRef} className="relative w-full aspect-[2/3] select-none overflow-hidden bg-white shadow-sm">
                                            {selectedPhotos ? (
                                                <img src={selectedPhotos} crossOrigin='anonymous' alt="Hasil Frame Foto" className="w-full h-full object-cover" />
                                            ) : (
                                                <p className="text-center text-xs p-4">Gambar tidak tersedia</p>
                                            )}
                                        </div>
                                    </div>
                                    <DownloadBtn
                                        label="Download Frame Foto ✨"
                                        onClick={handleDownloadPhotoLayout}
                                    />
                                </div>

                                <div className="flex flex-col gap-3 bg-white p-4 border-[3px] border-[#4A4A4A] rounded-[2rem] shadow-[4px_4px_0_#4A4A4A]">
                                    <p className="text-[#4A4A4A] text-xs font-black uppercase tracking-wider text-center bg-[#FAF9F5] py-1 rounded-md border border-[#4A4A4A]/20">
                                        🎬 Frame Video
                                    </p>
                                    <div className="border-2 border-[#4A4A4A] rounded-xl overflow-hidden">
                                        <LocalFrameContainer
                                            ref={videoFrameRef}
                                            frameKey={selectedFrame}
                                            photos={videos}
                                            filter={photoFilter}
                                        />
                                    </div>
                                    <DownloadBtn
                                        label={recordingVideo ? 'Merekam Video... ⏳' : 'Download Frame Video 🎥'}
                                        onClick={handleDownloadVideoLayout}
                                        accent
                                        disabled={recordingVideo}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── FOTO TAB ── */}
                {tab === 'foto' && (
                    photos.length === 0
                        ? <p className="text-center text-[#4A4A4A]/50 font-bold py-12">Tidak ada foto.</p>
                        : photos.map((src, i) => (
                            <PhotoCard
                                key={i}
                                src={src}
                                index={i}
                                filter={photoFilter}
                                onDownload={() => handleDownloadPhoto(src, i)}
                            />
                        ))
                )}

                {/* ── LIVE TAB ── */}
                {tab === 'live' && (
                    videos.length === 0
                        ? <p className="text-center text-[#4A4A4A]/50 font-bold py-12">Tidak ada video.</p>
                        : videos.map((src, i) => (
                            <VideoCard
                                key={i}
                                src={src}
                                index={i}
                                onDownload={() => handleDownloadVideo(src, i)}
                            />
                        ))
                )}

                {/* ── GIF TAB ── */}
                {tab === 'gif' && (
                    gifUrl
                        ? (
                            <div className="bg-white p-4 border-[3px] border-[#4A4A4A] rounded-[2rem] shadow-[4px_4px_0_#4A4A4A] flex flex-col gap-4">
                                <div className="rounded-2xl overflow-hidden border-2 border-[#4A4A4A]">
                                    <img
                                        src={gifUrl}
                                        alt="Animasi GIF"
                                        crossOrigin="anonymous"
                                        className="w-full"
                                    />
                                </div>
                                <DownloadBtn
                                    label="Download GIF 💫"
                                    onClick={handleDownloadGif}
                                    accent
                                />
                            </div>
                        )
                        : <p className="text-center text-[#4A4A4A]/50 font-bold py-12">GIF belum tersedia.</p>
                )}
            </main>
        </div>
    );
}