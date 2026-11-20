import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const bubbleFont = { fontFamily: '"Baloo 2", ui-rounded, "Nunito", sans-serif' };

export default function Login() {
    const { post } = useFetch();
    const { login } = useAuth();
    const nav = useNavigate();
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const value = Object.fromEntries(new FormData(e.target));
        const resp = await post('login', value);
        
        if (!resp.status) {
            setError(resp.message || 'Username atau password salah.');
            setLoading(false);
            return;
        }

        console.log(resp.data);
        login(resp.data);
        setLoading(false);

        setTimeout(() => {
            switch (resp.data.data?.role) {
                case 'owner':
                    nav('/owner/transaksi-terkini');
                    break;
                case 'kasir':
                    nav('/kasir/transaksi-terkini');
                    break;
                case 'studio':
                    nav(`/${resp.data.data.name}/welcome`);
                    break;
                default: 
                    nav('/');
            }
        }, 1000);
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0F4C3A] w-full select-none overflow-hidden p-4">
            
            {/* --- BACKGROUND GRADIENT BLOBS (Tema Nu Snaps Green & Pink) --- */}
            {/* Soft Ambient Glow Kiri Atas (Pink) */}
            <div className="absolute w-[500px] h-[500px] bg-[#E57393] rounded-full blur-[120px] opacity-25 -top-28 -left-28 pointer-events-none"></div>
            
            {/* Soft Ambient Glow Kanan Bawah (Pink) */}
            <div className="absolute w-[500px] h-[500px] bg-[#E57393] rounded-full blur-[120px] opacity-20 -bottom-28 -right-20 pointer-events-none"></div>
            {/* ---------------------------------- */}

            {/* Card Utama Tema Nu Snaps (Chunky Green-Pink) */}
            <div 
                className="relative w-full max-w-md bg-[#FFFDF9] border-[5px] border-[#E57393] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_16px_32px_rgba(0,0,0,0.3)] z-10"
                style={bubbleFont}
            >
                {/* Header Judul Nu Snaps */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center leading-none gap-1">
                        <span 
                            className="text-4xl font-black text-[#E57393]"
                            style={{ WebkitTextStroke: '1.5px #0F4C3A', textShadow: '2.5px 2.5px 0 #0F4C3A' }}
                        >
                            Nu
                        </span>
                        <span 
                            className="text-4xl font-black text-[#FFFDF9]"
                            style={{ WebkitTextStroke: '1.5px #0F4C3A', textShadow: '2.5px 2.5px 0 #0F4C3A' }}
                        >
                            Snaps
                        </span>
                    </div>
                    <div className="w-12 h-1.5 bg-[#E57393] rounded-full mx-auto mt-3 border border-[#0F4C3A]" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#0F4C3A]/70 font-black mt-3">
                        Creative Studio
                    </p>
                </div>

                {/* Alert Error */}
                {error && typeof error === 'string' && (
                    <div className="mb-5 px-4 py-2.5 bg-[#FBD7E3] border-[3px] border-[#0F4C3A] text-[#0F4C3A] font-bold text-xs rounded-2xl text-center shadow-[0_3px_0_#0F4C3A]">
                        ⚠️ {error}
                    </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                    
                    {/* Input Username */}
                    <div className="flex flex-col w-full">
                        <label className="text-xs font-black text-[#0F4C3A] ml-1 mb-1.5 uppercase tracking-wider">
                            Username
                        </label>
                        <input
                            type="text"
                            name="name"
                            disabled={loading}
                            placeholder="Masukkan username kamu..."
                            className="w-full px-4 py-3 bg-white border-[3px] border-[#0F4C3A] rounded-2xl text-[#0F4C3A] font-bold text-sm placeholder-[#0F4C3A]/30 focus:outline-none shadow-[0_4px_0_#0F4C3A] transition-all focus:translate-y-[2px] focus:shadow-[0_2px_0_#0F4C3A] disabled:opacity-50"
                        />
                    </div>

                    {/* Input Password */}
                    <div className="flex flex-col w-full">
                        <label className="text-xs font-black text-[#0F4C3A] ml-1 mb-1.5 uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            disabled={loading}
                            placeholder="Masukkan password kamu..."
                            className="w-full px-4 py-3 bg-white border-[3px] border-[#0F4C3A] rounded-2xl text-[#0F4C3A] font-bold text-sm placeholder-[#0F4C3A]/30 focus:outline-none shadow-[0_4px_0_#0F4C3A] transition-all focus:translate-y-[2px] focus:shadow-[0_2px_0_#0F4C3A] disabled:opacity-50"
                        />
                    </div>

                    {/* Lupa Password */}
                    <div className="text-right -mt-2">
                        <a href="#forgot" className="text-xs font-black text-[#E57393] hover:text-[#c45373] transition-colors drop-shadow-[1px_1px_0_#0F4C3A] tracking-wide">
                            Lupa Password?
                        </a>
                    </div>

                    {/* Tombol Masuk Chunky */}
                    <div className="w-full mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-[#E57393] hover:bg-[#d05c7c] text-white font-extrabold text-base rounded-full transition transform active:scale-[0.97] tracking-widest cursor-pointer shadow-[0_5px_0_#0F4C3A] border-[3px] border-[#0F4C3A] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'LOADING...' : 'LOGIN'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}