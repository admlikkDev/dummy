import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Timer from '../../components/Timer';
import axios from 'axios';

// ==========================================
// KONFIGURASI URL
// ==========================================
// URL yang di-proxy (lewat Vite/nginx) -> dipakai untuk request yang sering (polling liveview, dst)
// const DIGICAM_BASE_URL = "http://localhost:5513";
const DIGICAM_BASE_URL = "/digicam";
// URL langsung ke webserver digiCamControl -> dipakai untuk perintah "fire-and-forget"
// seperti All_Minimize, supaya tidak bergantung pada rule proxy.
const DIGICAM_DIRECT_URL = "http://localhost:5513";
const LOCAL_API = "http://localhost:8000/api"

// Keliling lingkaran shutter-ring (r=54) -> 2 * PI * 54
const RING_CIRCUMFERENCE = 339.29;

export default function PhotoBooth() {
    const { name, code } = useParams();
    const MAX_PHOTOS = name === 'postcard' ? 25 : 8
    const BOOKING_CODE = code;

    const [isRunning, setIsRunning] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [statusText, setStatusText] = useState("SENTUH UNTUK MEMULAI");
    const [liveViewSrc, setLiveViewSrc] = useState(null);
    const [thumbnails, setThumbnails] = useState(Array(MAX_PHOTOS).fill(null));
    const [photosDoneCount, setPhotosDoneCount] = useState(0);
    const [uploadFailed, setUploadFailed] = useState(false);

    const [cameraSource, setCameraSource] = useState('digicam');
    const [cameraNotice, setCameraNotice] = useState(null);

    // Angka hitung mundur (untuk shutter-ring) & efek flash saat jepret
    const [countdownValue, setCountdownValue] = useState(null);
    const [isFlashing, setIsFlashing] = useState(false);

    const liveViewRef = useRef(null);
    const deviceVideoRef = useRef(null);
    const deviceStreamRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const gifFramesRef = useRef([]);
    const capturedPhotosRef = useRef([]);
    const canvasRenderLoopRef = useRef(null);
    const cameraSourceRef = useRef('digicam');
    const liveViewErrorCountRef = useRef(0);
    const digicamPollIntervalRef = useRef(null);

    // Menyimpan potongan klip video terpisah untuk masing-masing indeks foto
    const videoBlobsRef = useRef(Array(MAX_PHOTOS).fill(null));
    const currentChunksRef = useRef([]);

    // Track status aktif perekaman klip agar tidak merekam waktu idle
    const isRecordingClipRef = useRef(false);

    // Penanda "sedang proses capture DSLR" — dipakai untuk MENGHENTIKAN SEMENTARA polling
    // liveview.jpg, karena polling yang jalan terus barengan dengan request capture bikin
    // webserver digiCamControl kebanjiran request dan balas 502 lewat proxy Vite.
    const isCapturingRef = useRef(false);

    // ==========================================
    // Refs untuk drag-to-scroll strip thumbnail (dipakai saat MAX_PHOTOS besar, mis. 25)
    // ==========================================
    const filmStripRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartScrollLeftRef = useRef(0);
    const dragMovedRef = useRef(false);

    // ==========================================
    // Refs untuk alur "1x tap, sisanya otomatis":
    // - awaitingTapRef: true kalau langkah berikutnya BUTUH 1 ketukan layar manual
    //   (sebelum sesi dimulai, saat retake dipilih lewat thumbnail, atau setelah capture
    //   gagal dan perlu dicoba ulang). Kalau false, layar mengabaikan tap karena proses
    //   sedang berjalan otomatis.
    // - cancelAutoSequenceRef: dipakai untuk menghentikan rangkaian auto-capture yang
    //   sedang menunggu jeda (mis. karena user memilih retake atau menekan tombol Proses).
    // - isProcessingClickRef: guard sinkron biar tap ganda yang sangat cepat tidak
    //   memicu dua proses capture sekaligus sebelum state React sempat ter-update.
    // ==========================================
    const awaitingTapRef = useRef(true);
    const cancelAutoSequenceRef = useRef(false);
    const isProcessingClickRef = useRef(false);

    useEffect(() => {
        cameraSourceRef.current = cameraSource;
    }, [cameraSource]);

    const navigate = useNavigate()
    const { get, post, getBlob } = useFetch()

    // Diizinkan jika minimal sudah ada 1 foto tersimpan dan tidak sedang countdown/upload
    const canFinishManually = isSessionActive && !isRunning && !isFinalizing && photosDoneCount > 0;

    // Kirim perintah "fire-and-forget" langsung ke webserver digiCamControl.
    // Dipakai untuk CMD yang tidak butuh response (mis. All_Minimize) supaya window
    // digiCamControl tidak nongol/ambil fokus di layar kiosk.
    const sendDigicamRawCommand = (cmd) => {
        fetch(`${DIGICAM_DIRECT_URL}/?CMD=${cmd}`, { mode: 'no-cors' }).catch(() => {
            // Diam-diam abaikan; ini command opsional, tidak boleh mengganggu alur utama.
        });
    };

    const startDeviceCamera = async () => {
        if (deviceStreamRef.current) return true;

        try {
            const streamPromise = navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: User tidak merespons izin kamera")), 5000)
            );

            const stream = await Promise.race([streamPromise, timeoutPromise]);

            deviceStreamRef.current = stream;
            if (deviceVideoRef.current) {
                deviceVideoRef.current.srcObject = stream;
                await deviceVideoRef.current.play().catch(() => { });
            }

            if (digicamPollIntervalRef.current) {
                clearInterval(digicamPollIntervalRef.current);
                digicamPollIntervalRef.current = null;
            }

            setCameraSource('device');
            setCameraNotice("Kamera DSLR tidak terdeteksi — menggunakan kamera bawaan device.");
            return true;
        } catch (error) {
            console.error("Gagal mengakses kamera bawaan device:", error);
            setCameraNotice("Kamera DSLR maupun kamera device tidak dapat diakses.");
            return false;
        }
    };

    const stopDeviceCamera = () => {
        if (deviceStreamRef.current) {
            deviceStreamRef.current.getTracks().forEach(track => track.stop());
            deviceStreamRef.current = null;
        }
    };

    const drawActiveFrame = (ctx, canvas) => {
        if (cameraSourceRef.current === 'device') {
            const video = deviceVideoRef.current;
            if (video && video.readyState >= 2 && video.videoWidth) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return true;
            }
        } else {
            const img = liveViewRef.current;
            if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                return true;
            }
        }
        return false;
    };

    const handleLiveViewError = () => {
        if (cameraSourceRef.current === 'device') return;
        liveViewErrorCountRef.current += 1;
        if (liveViewErrorCountRef.current >= 5) {
            startDeviceCamera();
        }
    };

    // BUG FIX: sebelumnya liveViewErrorCountRef hanya pernah bertambah dan TIDAK PERNAH
    // di-reset ketika frame berhasil dimuat. Akibatnya, sedikit demi sedikit error (mis.
    // 1-2 frame gagal setiap beberapa menit) akan menumpuk terus sampai akhirnya
    // ke-trigger fallback ke kamera device meski DSLR sebenarnya baik-baik saja.
    const handleLiveViewLoad = () => {
        liveViewErrorCountRef.current = 0;
    };

    useEffect(() => {
        // Tampilkan window live view di digiCamControl, lalu langsung minimize semua window
        // supaya tidak menutupi layar kiosk / mengambil fokus dari browser.
        fetch(`${DIGICAM_BASE_URL}/?CMD=LiveViewWnd_Show`)
            .then(() => sendDigicamRawCommand('All_Minimize'))
            .catch(() => {
                startDeviceCamera();
            });

        // BUG FIX: interval 100ms (10 request/detik) terlalu agresif untuk webserver
        // digiCamControl yang cuma single-threaded ringan -> gampang timeout/502, yang
        // ujung-ujungnya salah dianggap "kamera terputus". Dinaikkan ke 150ms.
        digicamPollIntervalRef.current = setInterval(() => {
            // Skip polling saat sedang mengeksekusi capture DSLR, supaya request tidak
            // numpuk dan bikin webserver digiCamControl balas 502 lewat proxy Vite.
            if (cameraSourceRef.current === 'digicam' && !isCapturingRef.current) {
                setLiveViewSrc(`${DIGICAM_BASE_URL}/liveview.jpg?t=${new Date().getTime()}`);
            }
        }, 150);

        return () => {
            if (digicamPollIntervalRef.current) clearInterval(digicamPollIntervalRef.current);
            if (canvasRenderLoopRef.current) clearInterval(canvasRenderLoopRef.current);
            // Pastikan recorder yang masih jalan dihentikan biar gak nyangkut/error saat unmount
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try { mediaRecorderRef.current.stop(); } catch (_) { /* ignore */ }
            }
            stopDeviceCamera();
            fetch(`${DIGICAM_BASE_URL}/?CMD=LiveViewWnd_Hide`).catch(() => { });
        };
    }, []);

    // Pilih codec video yang benar-benar didukung browser, dengan fallback bertingkat
    const pickSupportedVideoMimeType = () => {
        const candidates = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
        ];
        for (const type of candidates) {
            if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(type)) {
                return type;
            }
        }
        return undefined; // biarkan browser pilih default-nya sendiri
    };

    // Countdown Helper (Mengontrol perekaman klip individual per foto)
    const runCountdown = (seconds, ctx, canvas, targetIndex) => {
        return new Promise((resolve) => {
            let counter = seconds;
            setStatusText("");
            setCountdownValue(counter);

            currentChunksRef.current = [];

            const stream = canvas.captureStream(30);
            const mimeType = pickSupportedVideoMimeType();
            const mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) currentChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const clipBlob = new Blob(currentChunksRef.current, { type: 'video/webm' });
                videoBlobsRef.current[targetIndex] = clipBlob;
            };

            isRecordingClipRef.current = true;
            mediaRecorder.start();

            const interval = setInterval(() => {
                counter--;
                if (counter <= 0) {
                    clearInterval(interval);
                    setCountdownValue(null);
                    setStatusText("SMILE! 📸");
                    setIsFlashing(true);
                    setTimeout(() => setIsFlashing(false), 220);

                    // NOTE: perintah capture DSLR yang sebenarnya ditembak di
                    // triggerCameraCapture() setelah countdown ini selesai (lihat
                    // handleScreenClick), supaya momen jepret match dengan "SMILE!" yang
                    // dilihat user.

                    if (ctx && canvas) {
                        gifFramesRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    }

                    setTimeout(() => {
                        isRecordingClipRef.current = false;
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                            mediaRecorderRef.current.stop();
                        }
                        resolve();
                    }, 1000);
                } else {
                    setCountdownValue(counter);
                    if (ctx && canvas && counter === 1) {
                        gifFramesRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    }
                }
            }, 1000);
        });
    };

    const captureFromDeviceCamera = () => {
        return new Promise((resolve, reject) => {
            const video = deviceVideoRef.current;
            if (!video || !video.videoWidth) {
                reject(new Error("Kamera device belum siap"));
                return;
            }
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = video.videoWidth;
            captureCanvas.height = video.videoHeight;
            const ctx = captureCanvas.getContext('2d');
            ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
            captureCanvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Gagal membuat blob dari kamera device"));
            }, 'image/jpeg', 0.95);
        });
    };

    // Fallback terakhir kalau capture DSLR gagal total: ambil 1 frame terakhir dari
    // live view / kamera device yang sedang tampil di layar, supaya sesi foto tidak macet.
    const captureFreshFallbackFrame = () => {
        return new Promise((resolve, reject) => {
            const source = cameraSourceRef.current === 'device' ? deviceVideoRef.current : liveViewRef.current;
            const isVideo = cameraSourceRef.current === 'device';
            const width = isVideo ? source?.videoWidth : source?.naturalWidth;
            const height = isVideo ? source?.videoHeight : source?.naturalHeight;

            if (!source || !width || !height) {
                reject(new Error("Tidak ada frame live view yang bisa dipakai sebagai fallback"));
                return;
            }

            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = width;
            fallbackCanvas.height = height;
            const ctx = fallbackCanvas.getContext('2d');
            ctx.drawImage(source, 0, 0, width, height);
            fallbackCanvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Gagal membuat blob dari frame fallback"));
            }, 'image/jpeg', 0.95);
        });
    };

    // Mengambil file JPG HASIL CAPTURE ASLI dari DSLR (bukan liveview/preview!) dan
    // mengembalikannya sebagai Blob supaya bisa dipakai untuk thumbnail & upload.
    const triggerCameraCapture = async () => {
        if (cameraSourceRef.current === "device") {
            return captureFromDeviceCamera();
        }

        try {
            isCapturingRef.current = true; // Hentikan polling sementara waktu

            // 1. Perintah jepret ke Laravel Lokal
            // Axios membungkus data balasan di dalam `.data`
            const cmdRes = await axios.post(`${LOCAL_API}/camera/capture`);
            if (!cmdRes.data.status) throw new Error(cmdRes.data.message);

            await new Promise(r => setTimeout(r, 1000));

            // 2. Ambil file gambar mentah (JPEG) dari Laravel Lokal
            // WAJIB pakai responseType: 'blob' agar data gambar tidak rusak/diubah jadi string
            const imgRes = await axios.get(`${LOCAL_API}/camera/capture-image`, {
                responseType: 'blob'
            });

            // Pastikan balasan berupa blob gambar
            if (!imgRes.data || imgRes.data.size === 0) {
                throw new Error("Gagal mengambil file gambar dari server lokal.");
            }

            // Jaga-jaga supaya window digiCamControl tetap minimize
            sendDigicamRawCommand('All_Minimize');

            return imgRes.data; // Ini langsung berupa Blob foto asli
        } catch (error) {
            console.error("Capture DSLR gagal, mencoba fallback dari live view:", error);
            try {
                const fallbackBlob = await captureFreshFallbackFrame();
                return fallbackBlob;
            } catch (fallbackError) {
                throw error;
            }
        } finally {
            isCapturingRef.current = false; // Jalankan kembali polling live view
        }
    };

    const generateGIF = (canvas) => {
        return new Promise((resolve) => {
            if (gifFramesRef.current.length === 0) {
                resolve(null);
                return;
            }
            const gif = new window.GIF({
                workers: 2,
                quality: 10,
                workerScript: '/js/gif.worker.js',
                width: canvas.width,
                height: canvas.height
            });

            gifFramesRef.current.forEach(frameData => {
                gif.addFrame(frameData, { delay: 600 });
            });

            gif.on('finished', (blob) => {
                resolve(blob && blob.size > 0 ? blob : null);
            });

            gif.render();
        });
    };

    // Mengeksekusi 1 kali proses ambil-foto penuh (countdown -> capture -> simpan ke
    // slot indexToCapture) dan mengembalikan index slot kosong berikutnya (atau
    // MAX_PHOTOS kalau sudah tidak ada slot kosong lagi), atau `null` kalau capture-nya
    // gagal total (DSLR maupun fallback live view).
    const performCapture = async (indexToCapture) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        setIsRunning(true);
        setUploadFailed(false);
        setCameraNotice(null);

        await runCountdown(3, ctx, canvas, indexToCapture);

        // Ambil hasil foto (triggerCameraCapture sudah menangani fallback ke live view
        // secara internal kalau capture DSLR gagal).
        let photoBlob;
        try {
            photoBlob = await triggerCameraCapture();
        } catch (error) {
            console.error("Capture gagal total (DSLR maupun fallback):", error);

            setCameraNotice("Capture gagal. Pastikan kamera terhubung, lalu ketuk layar untuk coba lagi.");
            setStatusText(`SENTUH UNTUK FOTO KE-${indexToCapture + 1}`);

            setIsRunning(false);
            return null;
        }

        const isNewSlot = capturedPhotosRef.current[indexToCapture] === undefined || capturedPhotosRef.current[indexToCapture] === null;
        capturedPhotosRef.current[indexToCapture] = photoBlob;
        if (isNewSlot) {
            setPhotosDoneCount(prev => prev + 1);
        }

        const photoUrl = URL.createObjectURL(photoBlob);
        setThumbnails(prev => {
            const updated = [...prev];
            // Bebaskan object URL lama (kalau ini retake) supaya tidak bocor memori
            if (updated[indexToCapture]) {
                URL.revokeObjectURL(updated[indexToCapture]);
            }
            updated[indexToCapture] = photoUrl;
            return updated;
        });

        let nextIndex = indexToCapture + 1;
        while (nextIndex < MAX_PHOTOS && capturedPhotosRef.current[nextIndex] !== undefined && capturedPhotosRef.current[nextIndex] !== null) {
            nextIndex++;
        }

        // setCurrentPhotoIndex men-trigger efek auto-scroll yang menjaga strip thumbnail
        // tetap tampil di tengah (lihat useEffect [currentPhotoIndex]).
        setCurrentPhotoIndex(nextIndex);

        if (nextIndex < MAX_PHOTOS) {
            setStatusText(`FOTO KE-${nextIndex + 1} OTOMATIS SEBENTAR LAGI...`);
        } else {
            setStatusText("SESI SELESAI — KETUK TOMBOL PROSES DI ATAS");
        }
        setIsRunning(false);

        return nextIndex;
    };

    // BARU: setelah tap pertama, sisa foto diambil otomatis satu per satu (dengan jeda
    // singkat di antaranya) tanpa perlu tap layar lagi — sampai semua slot terisi, atau
    // sampai dibatalkan (mis. user memilih retake, atau menekan tombol Proses).
    const runAutoSequence = async (startIndex) => {
        let idx = startIndex;
        while (idx !== null && idx < MAX_PHOTOS) {
            if (cancelAutoSequenceRef.current) return;

            // Jeda singkat supaya orang yang difoto sempat siap-siap lagi sebelum
            // countdown berikutnya mulai.
            await new Promise((resolve) => setTimeout(resolve, 1500));
            if (cancelAutoSequenceRef.current) return;

            const nextIdx = await performCapture(idx);
            if (nextIdx === null) {
                // Capture gagal -> hentikan otomatisasi, minta user tap layar untuk retry.
                awaitingTapRef.current = true;
                return;
            }
            idx = nextIdx;
        }
    };

    const handleScreenClick = async () => {
        if (isRunning || isFinalizing) return;
        if (isProcessingClickRef.current) return;

        if (currentPhotoIndex >= MAX_PHOTOS) {
            setCameraNotice("Semua slot foto terisi. Ketuk salah satu thumbnail di bawah jika ingin meretake foto spesifik.");
            return;
        }

        // BARU: sesi hanya butuh 1x tap untuk memulai. Setelah itu proses berjalan
        // otomatis, jadi tap tambahan diabaikan KECUALI sedang menunggu konfirmasi
        // retake (dipicu dari thumbnail) atau capture sebelumnya gagal dan perlu
        // dicoba ulang secara manual.
        if (isSessionActive && !awaitingTapRef.current) {
            return;
        }

        isProcessingClickRef.current = true;

        const isFirstTap = !isSessionActive;
        awaitingTapRef.current = false;
        cancelAutoSequenceRef.current = false;

        if (isFirstTap) {
            setIsSessionActive(true);
            setCurrentPhotoIndex(0);
            setThumbnails(Array(MAX_PHOTOS).fill(null));
            setPhotosDoneCount(0);
            setUploadFailed(false);
            gifFramesRef.current = [];
            capturedPhotosRef.current = [];
            videoBlobsRef.current = Array(MAX_PHOTOS).fill(null);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvasRenderLoopRef.current = setInterval(() => {
                if (isRecordingClipRef.current) {
                    drawActiveFrame(ctx, canvas);
                }
            }, 33);
        }

        setUploadFailed(false);
        setCameraNotice(null);

        const indexToCapture = currentPhotoIndex;
        const nextIndex = await performCapture(indexToCapture);
        isProcessingClickRef.current = false;

        if (nextIndex === null) {
            // Capture pertama/retake gagal -> izinkan tap lagi untuk mencoba ulang.
            awaitingTapRef.current = true;
            return;
        }

        if (nextIndex < MAX_PHOTOS) {
            // Lanjutkan sisa sesi secara otomatis tanpa perlu tap lagi.
            runAutoSequence(nextIndex);
        }
    };

    const handleThumbnailSelect = (index, e) => {
        e.stopPropagation();
        // BUG FIX: kalau user baru saja drag/geser strip film, jangan trigger "retake" —
        // sebelumnya click tetap ke-fire walau posisi mouse sudah bergeser jauh.
        if (dragMovedRef.current) return;
        if (isRunning || isFinalizing || !isSessionActive) return;

        // Hentikan rangkaian auto-capture yang sedang berjalan/menunggu jeda, pindah ke
        // slot yang dipilih, dan tandai bahwa proses ini butuh 1x tap layar untuk
        // dieksekusi (retake tetap manual/disengaja, bukan bagian dari otomatisasi).
        cancelAutoSequenceRef.current = true;
        awaitingTapRef.current = true;
        setCurrentPhotoIndex(index);
        setStatusText(`KETUK LAYAR UNTUK RETAKE FOTO KE-${index + 1}`);
    };

    // ==========================================
    // Drag-to-scroll handlers untuk strip thumbnail (mouse & trackpad; touch sudah
    // native didukung lewat overflow-x-auto + touch-action: pan-x di CSS)
    // ==========================================
    const handleStripMouseDown = (e) => {
        const strip = filmStripRef.current;
        if (!strip) return;
        isDraggingRef.current = true;
        dragMovedRef.current = false;
        dragStartXRef.current = e.pageX;
        dragStartScrollLeftRef.current = strip.scrollLeft;
    };

    const handleStripMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        const strip = filmStripRef.current;
        if (!strip) return;
        const delta = e.pageX - dragStartXRef.current;
        if (Math.abs(delta) > 4) dragMovedRef.current = true;
        strip.scrollLeft = dragStartScrollLeftRef.current - delta;
    };

    const endStripDrag = () => {
        isDraggingRef.current = false;
        // Beri jeda kecil sebelum flag direset supaya event "click" yang menyusul
        // langsung setelah mouseup tetap ke-block oleh handleThumbnailSelect.
        setTimeout(() => { dragMovedRef.current = false; }, 50);
    };

    // BARU: strip thumbnail SELALU menjaga slot yang sedang aktif tetap di tengah —
    // dipicu setiap kali currentPhotoIndex berubah, baik karena auto-capture jalan,
    // sesi baru dimulai, maupun user memilih thumbnail untuk retake. Ini menggantikan
    // auto-scroll manual yang sebelumnya cuma dijalankan sesaat setelah capture selesai.
    useEffect(() => {
        if (!isSessionActive) return;
        // Tunggu 1 frame supaya thumbnail yang baru saja berubah sudah ter-render.
        const raf = requestAnimationFrame(() => {
            const strip = filmStripRef.current;
            const activeIndex = Math.min(currentPhotoIndex, MAX_PHOTOS - 1);
            const activeEl = strip?.children?.[activeIndex];
            if (strip && activeEl) {
                const targetScroll = activeEl.offsetLeft - (strip.clientWidth / 2) + (activeEl.clientWidth / 2);
                strip.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [currentPhotoIndex, isSessionActive]);

    // Kirim semua media ke backend. Mengembalikan {success, message} — TIDAK diam-diam
    // menelan error seperti sebelumnya, supaya finalizeSession tahu kapan harus retry.
    const uploadMedia = async (photos, gifBlob, videoClips) => {
        const formData = new FormData();

        formData.append("booking_code", BOOKING_CODE);

        photos.forEach((photo, index) => {
            formData.append("photos[]", photo, `photo_${index + 1}.jpg`);
        });

        videoClips.forEach((video, index) => {
            if (video) {
                formData.append("videos[]", video, `clip_${index + 1}.webm`);
            }
        });

        if (gifBlob) {
            formData.append("live_photos", gifBlob, "live_photo.gif");
        }

        const response = await post("bookings/save-media", formData);

        if (!response.status) {
            console.log(response.message);
            return {
                success: false,
                message: response.message
            };
        }

        if (!response.data.success) {
            return {
                success: false,
                message: response.data.message
            };
        }

        return {
            success: true,
            data: response.data.data
        };
    };

    const finalizeSession = async () => {
        setIsRunning(true);
        setIsFinalizing(true);
        setUploadFailed(false);
        setStatusText("PROCESSING...");

        if (canvasRenderLoopRef.current) {
            clearInterval(canvasRenderLoopRef.current);
        }

        const canvas = canvasRef.current;

        setStatusText("GENERATING GIF...");
        const gifBlob = await generateGIF(canvas);

        setStatusText("UPLOADING...");

        const validPhotos = capturedPhotosRef.current.filter(p => p !== null && p !== undefined);
        const validVideos = videoBlobsRef.current.filter(v => v !== null && v !== undefined);

        const result = await uploadMedia(validPhotos, gifBlob, validVideos);

        if (result.success) {
            setStatusText("DONE! THANK YOU");
            setTimeout(() => {
                setStatusText("SENTUH UNTUK MEMULAI");
                setIsSessionActive(false);
                setIsRunning(false);
                setIsFinalizing(false);
                setCurrentPhotoIndex(0);
                // Bebaskan semua object URL thumbnail sebelum direset supaya tidak bocor memori
                setThumbnails(prev => {
                    prev.forEach(url => { if (url) URL.revokeObjectURL(url); });
                    return Array(MAX_PHOTOS).fill(null);
                });
                setPhotosDoneCount(0);
                setUploadFailed(false);
                capturedPhotosRef.current = [];
                videoBlobsRef.current = Array(MAX_PHOTOS).fill(null);

            }, 3000);
        } else {
            // GAGAL — jangan buang hasil foto yang sudah diambil, biarkan user coba lagi
            setUploadFailed(true);
            setCameraNotice(result.message || "Upload gagal, silakan coba lagi.");
            setStatusText("UPLOAD GAGAL — KETUK TOMBOL PROSES UNTUK COBA LAGI");
            setIsFinalizing(false);
            setIsRunning(false);
        }
    };

    const handleFinishClick = async (e) => {
        e.stopPropagation();
        if (!canFinishManually) return;

        // BUG FIX: kalau user menekan "Proses" saat auto-sequence sedang menunggu jeda
        // sebelum foto berikutnya, pastikan capture otomatis itu tidak ikut nyelonong
        // jalan di belakang layar setelah sesi mulai di-finalize.
        cancelAutoSequenceRef.current = true;
        awaitingTapRef.current = true;

        // Tunggu sampai proses pembuatan GIF dan upload selesai
        await finalizeSession();

        navigate(`/${name}/select-photos/${code}`);
        // Hanya pindah halaman jika upload berhasil
        // if (isSuccess) {
        // }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        cancelAutoSequenceRef.current = true;
        window.location.reload();
    };

    const location = useLocation()
    const durationSeconds = location.state?.durationSeconds

    return (
        <div className="fixed inset-0 w-screen h-screen bg-[#141110] select-none overflow-hidden z-50 font-ui">
            {/* Font & keyframe kustom untuk tampilan studio-film */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');
                .font-display { font-family: 'Fraunces', serif; }
                .font-ui { font-family: 'Inter', sans-serif; }
                .tabular-nums { font-variant-numeric: tabular-nums; }

                @keyframes ringClose {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: ${RING_CIRCUMFERENCE}; }
                }
                .countdown-ring { animation: ringClose 1s linear forwards; }

                @keyframes flashPop {
                    0% { opacity: 0.92; }
                    100% { opacity: 0; }
                }
                .flash-overlay { animation: flashPop 260ms ease-out forwards; }

                @keyframes gentleFade {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in { animation: gentleFade 0.4s ease-out; }

                .sprocket-row {
                    height: 10px;
                    background-image: radial-gradient(circle, rgba(0,0,0,0.55) 42%, transparent 43%);
                    background-size: 22px 10px;
                    background-position: 11px center;
                    opacity: 0.6;
                }

                /* Strip film yang bisa digeser: sembunyikan scrollbar tapi tetap scrollable */
                .film-strip {
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                    touch-action: pan-x;
                    scroll-snap-type: x proximity;
                    scrollbar-width: none;
                }
                .film-strip::-webkit-scrollbar { display: none; }
                .film-strip-item { scroll-snap-align: center; }
            `}</style>

            {cameraSource === 'device' ? (
                <video
                    ref={deviceVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain scale-x-[-1]"
                />
            ) : liveViewSrc ? (
                <img
                    ref={liveViewRef}
                    src={liveViewSrc}
                    alt="Live View Stream"
                    onLoad={handleLiveViewLoad}
                    onError={handleLiveViewError}
                    className="absolute inset-0 w-full h-full object-contain"
                />
            ) : (
                <div className="absolute inset-0 w-full h-full bg-[#141110] flex flex-col items-center justify-center gap-4 text-[#E9DFCF]/50">
                    <div className="w-10 h-10 border-2 border-[#E9DFCF]/20 border-t-[#D4A857] rounded-full animate-spin"></div>
                    <span className="font-ui text-sm tracking-[0.2em] uppercase">Menghubungkan ke kamera...</span>
                </div>
            )}

            {/* Vignette halus supaya UI di atas live view tetap terbaca tanpa terasa gelap total */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/55 via-transparent to-black/70" />

            <Timer
                durationSeconds={durationSeconds}
            />

            {/* Flash putih saat momen jepret */}
            {isFlashing && (
                <div className="absolute inset-0 z-40 bg-white flash-overlay pointer-events-none" />
            )}

            {/* Notifikasi kamera / error upload */}
            {cameraNotice && (
                <div className={`fade-in absolute top-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 text-sm font-ui rounded-full shadow-xl max-w-[90%] text-center border backdrop-blur-md ${uploadFailed
                    ? 'bg-[#3A1712]/90 border-[#E8927C]/40 text-[#F6D9CE]'
                    : 'bg-[#241F1B]/85 border-[#E9DFCF]/15 text-[#E9DFCF]'
                    }`}>
                    {cameraNotice}
                </div>
            )}

            {/* Pill jumlah foto yang sudah diambil */}
            {isSessionActive && !cameraNotice && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-2 bg-[#241F1B]/80 backdrop-blur-md border border-[#D4A857]/25 text-[#F5EFE6] text-xs font-ui font-semibold tracking-[0.25em] uppercase rounded-full shadow-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A857]"></span>
                    {photosDoneCount} / {MAX_PHOTOS} Foto
                </div>
            )}

            {/* Overlay klik untuk memulai / mengambil foto berikutnya */}
            <div
                onClick={handleScreenClick}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isRunning || isFinalizing ? 'cursor-default' : 'cursor-pointer'
                    }`}
            >
                {/* Angka hitung mundur dalam shutter-ring */}
                {countdownValue !== null && (
                    <div className="relative flex items-center justify-center z-20 pointer-events-none">
                        <svg key={countdownValue} width="200" height="200" viewBox="0 0 120 120" className="drop-shadow-[0_0_30px_rgba(212,168,87,0.45)]">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(245,239,230,0.15)" strokeWidth="2.5" />
                            <circle
                                cx="60" cy="60" r="54" fill="none"
                                stroke="#D4A857" strokeWidth="2.5" strokeLinecap="round"
                                strokeDasharray={RING_CIRCUMFERENCE}
                                strokeDashoffset={0}
                                transform="rotate(-90 60 60)"
                                className="countdown-ring"
                            />
                        </svg>
                        <span className="absolute font-display italic text-white text-7xl font-semibold tabular-nums">
                            {countdownValue}
                        </span>
                    </div>
                )}

                {!isFinalizing && countdownValue === null && statusText && (
                    <h1 className={`fade-in font-display italic tracking-wide text-center px-6 drop-shadow-[0_4px_18px_rgba(0,0,0,0.85)] ${uploadFailed
                        ? 'text-[#E8927C] text-2xl md:text-4xl not-italic font-semibold tracking-widest uppercase'
                        : statusText === 'SMILE!'
                            ? 'text-[#F5EFE6] text-6xl md:text-8xl font-semibold'
                            : 'text-[#F5EFE6] text-4xl md:text-6xl font-medium'
                        }`}>
                        {statusText}
                    </h1>
                )}
            </div>

            {/* Overlay loading khusus saat generating/uploading, biar lebih jelas dari sekadar teks */}
            {isFinalizing && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
                    <div className="w-14 h-14 border-[3px] border-[#E9DFCF]/20 border-t-[#D4A857] rounded-full animate-spin mb-6"></div>
                    <h2 className="font-ui text-[#F5EFE6] text-lg md:text-xl font-semibold tracking-[0.2em] uppercase text-center px-6">
                        {statusText}
                    </h2>
                </div>
            )}

            {canFinishManually && (
                <button
                    onClick={handleFinishClick}
                    className={`fade-in absolute top-6 right-6 z-20 px-6 md:px-8 py-3 md:py-3.5 font-ui font-semibold text-sm md:text-base tracking-wide rounded-full shadow-xl transition-all active:scale-95 flex items-center gap-2 ${uploadFailed
                        ? 'bg-[#E8927C] hover:bg-[#DD8069] text-[#2A1712]'
                        : 'bg-[#D4A857] hover:bg-[#C99A44] text-[#241F1B]'
                        }`}
                >
                    {uploadFailed ? (
                        'Coba Lagi'
                    ) : (
                        <>
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Proses ({photosDoneCount})
                        </>
                    )}
                </button>
            )}

            {!isFinalizing && (
                <button
                    onClick={handleReset}
                    className="absolute top-6 left-6 z-20 h-12 w-12 md:h-14 md:w-14 bg-[#241F1B]/80 hover:bg-[#2E2822] backdrop-blur-md rounded-full flex items-center justify-center transition-colors active:scale-95 border border-[#E9DFCF]/15 shadow-xl"
                >
                    <svg className="w-6 h-6 text-[#E9DFCF]" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"></path>
                    </svg>
                </button>
            )}

            {/* Rak film di bawah layar — dibingkai seperti strip negatif film.
                BUG FIX: sebelumnya tiap thumbnail lebar 500vw (bug ketik / typo), yang bikin
                strip nyaris tidak bisa digeser dengan wajar. Sekarang tiap item punya lebar
                tetap dan seluruh strip bisa digeser (scroll horizontal + drag mouse/trackpad,
                swipe native di touchscreen) — penting terutama untuk paket "postcard" (25 foto). */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-10">
                <div className="max-w-8xl mx-auto px-4 pb-2">
                    <div className="bg-[#0F0D0C] rounded-2xl border border-[#E9DFCF]/10 shadow-2xl">
                        <div className="sprocket-row" />
                        <div
                            ref={filmStripRef}
                            className="film-strip flex gap-2 md:gap-2 p-2 md:p-3 h-[13vh] min-h-[76px] max-h-[104px] cursor-grab active:cursor-grabbing"
                            onMouseDown={handleStripMouseDown}
                            onMouseMove={handleStripMouseMove}
                            onMouseUp={endStripDrag}
                            onMouseLeave={endStripDrag}
                        >
                            {thumbnails.map((src, index) => (
                                <div
                                    key={index}
                                    onClick={(e) => handleThumbnailSelect(index, e)}
                                    className={`film-strip-item h-full w-16 md:w-20 flex-shrink-0 bg-[#1C1815] rounded-md border transition-all duration-300 relative cursor-pointer group ${index === currentPhotoIndex && isSessionActive && !isRunning && !isFinalizing
                                        ? 'border-[#D4A857] ring-2 ring-[#D4A857]/40 scale-[1.04] z-10'
                                        : thumbnails[index]
                                            ? 'border-[#7FA88D]/50 hover:border-[#E9DFCF]/50'
                                            : 'border-[#E9DFCF]/10'
                                        }`}
                                >
                                    {src ? (
                                        <>
                                            <img
                                                src={src}
                                                alt={`Capture ${index + 1}`}
                                                draggable={false}
                                                className="w-full h-full object-cover pointer-events-none"
                                            />
                                            <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[9px] text-[#F5EFE6] font-ui font-semibold scale-90">
                                                {index + 1}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[#F5EFE6] text-[9px] font-ui font-semibold tracking-wider uppercase bg-[#E8927C]/90 text-[#2A1712] px-1.5 py-0.5 rounded shadow">
                                                    Retake
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#E9DFCF]/30 font-ui text-xs font-semibold">
                                            {index + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="sprocket-row" />
                    </div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="absolute opacity-0 pointer-events-none -z-50"
                width="1280"
                height="720"
            ></canvas>
        </div>
    );
}