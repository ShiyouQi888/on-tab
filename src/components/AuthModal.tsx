import React, { useState } from 'react';
import { authService } from '../services/authService';
import { X, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await authService.signIn(email, password);
        onSuccess();
        onClose();
      } else {
        await authService.signUp(email, password);
        setSuccessMsg('注册成功！一封验证邮件已发送至您的邮箱，请前往查看并点击链接完成验证。验证后即可返回此处登录。');
        // 注册成功后不再自动切换，让用户有充足时间看清楚提示
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10 tracking-tight">
            {isLogin ? '欢迎回来' : '创建账号'}
          </h2>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-500 text-sm text-center mb-8">
            {isLogin ? '登录您的账号以同步您的所有书签' : '注册以开始跨设备同步您的书签'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">邮箱地址</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">密码</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-col gap-3 text-blue-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 font-bold">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  注册申请已提交
                </div>
                <p className="text-sm leading-relaxed">
                  {successMsg}
                </p>
                <button 
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 self-end underline decoration-2 underline-offset-4"
                >
                  去登录 →
                </button>
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
                  <span>{isLogin ? '立即登录' : '立即注册'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? '还没有账号？' : '已经有账号了？'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                {isLogin ? '点击注册' : '点击登录'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
