import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { X, Mail, Lock, Loader2, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isSupabaseConfigured) {
      setError(t('auth.noConfig'));
      return;
    }

    setLoading(true);

    try {
      if (isForgot) {
        // 忘记密码：发送重置邮件
        await authService.resetPasswordForEmail(email);
        setSuccessMsg(t('auth.resetEmailSent'));
      } else if (isLogin) {
        await authService.signIn(email, password);
        onSuccess();
        onClose();
      } else {
        await authService.signUp(email, password);
        setSuccessMsg(t('auth.signUpSuccess'));
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      let message = (err as Error).message || t('auth.opFailed');
      if (message === 'Failed to fetch') {
        message = t('auth.networkError');
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 重置表单状态
  const switchToMode = (newMode: AuthMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  // 标题映射
  const headerTitle = isForgot
    ? t('auth.forgotTitle')
    : isLogin
      ? t('auth.welcomeBack')
      : t('auth.createAccount');

  // 描述映射
  const headerDesc = isForgot
    ? t('auth.forgotDesc')
    : isLogin
      ? t('auth.loginDesc')
      : t('auth.signUpDesc');

  // 按钮文字映射
  const submitLabel = isForgot
    ? t('auth.sendResetEmail')
    : isLogin
      ? t('auth.loginNow')
      : t('auth.signUpNow');

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/40">
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10 tracking-tight">
            {headerTitle}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-500 text-sm text-center mb-8 font-medium">
            {headerDesc}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email — 所有模式都显示 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('auth.emailLabel')}</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete={isForgot ? 'email' : 'email'}
                />
              </div>
            </div>

            {/* Password — 仅登录/注册模式 */}
            {!isForgot && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('auth.passwordLabel')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                </div>

                {/* 忘记密码链接 — 仅登录模式 */}
                {isLogin && (
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => switchToMode('forgot')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col gap-3 text-blue-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  {isForgot ? t('auth.resetEmailTitle') : t('auth.signUpSubmitted')}
                </div>
                <p className="text-sm leading-relaxed">
                  {successMsg}
                </p>
                {!isForgot && (
                  <button
                    type="button"
                    onClick={() => switchToMode('login')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 self-end underline decoration-2 underline-offset-4"
                  >
                    {t('auth.goToLogin')}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm animate-shake">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{submitLabel}</span>
                  {isForgot ? (
                    <KeyRound size={18} />
                  ) : (
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            {/* 忘记密码模式：返回登录 */}
            {isForgot ? (
              <p className="text-gray-500 text-sm">
                <button
                  type="button"
                  onClick={() => switchToMode('login')}
                  className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  {t('auth.backToLogin')}
                </button>
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                <button
                  type="button"
                  onClick={() => switchToMode(isLogin ? 'register' : 'login')}
                  className="ml-1 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  {isLogin ? t('auth.clickSignUp') : t('auth.clickLogin')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
