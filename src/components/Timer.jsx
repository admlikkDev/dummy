import { useEffect, useRef, useState } from "react";

/**
 * Timer sesi photobooth.
 *
 * Props:
 * - durationSeconds : total durasi hitung mundur (default 1000 detik,
 *                     sama seperti nilai awal sebelumnya).
 * - isRunning        : timer hanya jalan kalau true (default true).
 *                      Berguna buat "pause" timer saat sesi sudah
 *                      selesai/diproses supaya nggak trigger onExpire dobel.
 * - onExpire         : callback yang dipanggil SEKALI saat hitung mundur
 *                      mencapai 00:00.
 */
export default function Timer({ durationSeconds = 600, isRunning = true, onExpire }) {
    const [time, setTime] = useState(durationSeconds);
    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);

    // selalu simpan versi terbaru dari onExpire tanpa perlu re-subscribe effect
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // reset kalau durationSeconds berubah (misal restart sesi)
    useEffect(() => {
        setTime(durationSeconds);
        expiredRef.current = false;
    }, [durationSeconds]);

    useEffect(() => {
        if (!isRunning) return undefined;

        if (time <= 0) {
            if (!expiredRef.current) {
                expiredRef.current = true;
                onExpireRef.current?.();
            }
            return undefined;
        }

        const id = setTimeout(() => setTime((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [time, isRunning]);

    const formatTime = (totalSeconds) => {
        const clamped = Math.max(totalSeconds, 0);
        const m = Math.floor(clamped / 60).toString().padStart(2, '0');
        const s = Math.floor(clamped % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="absolute top-4 right-4 bg-white text-[#1f1f1f] font-black text-sm px-4 py-2 rounded-full shadow-md tabular-nums z-10">
            {formatTime(time)}
        </div>
    );
}