"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d20 50%, #0a0a1a 100%)" }}
    >
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-900/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Mi Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Registro y seguimiento de inversiones</p>
        </div>

        {/* Card */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <h2 className="text-base font-semibold text-white mb-1">Iniciar sesion</h2>
          <p className="text-sm text-gray-500 mb-6">Usa tu cuenta de Google para acceder</p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Redirigiendo..." : "Continuar con Google"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Acceso restringido a usuarios autorizados
        </p>
      </div>
    </div>
  );
}
