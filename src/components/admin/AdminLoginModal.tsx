import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, X } from 'lucide-react';
import { StoreSettings } from '../../types';
import { loginAdmin, StoredAdminSession } from '../../services/dbService';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSuccess: (session: StoredAdminSession) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(false);
    setTimeout(() => setShake(true), 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      triggerError('Mohon masukkan Username dan Password Admin.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const session = await loginAdmin(username, password, settings);
      setUsername('');
      setPassword('');
      onSuccess(session);
    } catch (err) {
      triggerError(
        err instanceof Error
          ? err.message
          : 'Username atau password salah. Akses ditolak.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Login Administrator ISTAFA PRINTING"
    >
      <div
        className={`bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup modal login"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 space-y-2">
          <BrandLogo
            storeName={settings.storeName}
            customLogoUrl={settings.logoUrl}
            theme="light"
            size="md"
          />
          <div className="pt-2">
            <h2 className="font-display font-semibold text-lg text-slate-900">
              Admin Login
            </h2>
            <p className="text-xs text-slate-500">
              Masuk untuk mengelola katalog produk, pesanan, dan laporan keuangan.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Username Administrator
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-md disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
