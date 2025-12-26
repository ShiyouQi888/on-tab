import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Globe, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16 text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            返回首页
          </a>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-500/10 overflow-hidden border border-white/10">
              <img src="/ontab-logo-1.svg" alt="On Tab Logo" className="w-14 h-14 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">隐私政策</h1>
          <p className="text-slate-400 font-medium">最近更新日期：2025年12月26日</p>
        </header>

        {/* Content */}
        <div className="space-y-12">
          {/* Summary Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-green-400" size={28} />
              <h2 className="text-2xl font-bold text-white">核心承诺</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              On Tab 致力于保护您的个人隐私。我们深知书签数据对您的重要性，因此我们的设计理念始终坚持“数据归用户所有”和“隐私优先”。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <Lock className="text-blue-400 mb-3" size={20} />
                <h3 className="font-bold text-white mb-2">本地优先</h3>
                <p className="text-sm text-slate-400 leading-relaxed">默认情况下，您的所有书签、分类和设置均存储在您的浏览器本地 (IndexedDB)，我们无法访问。</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <Eye className="text-purple-400 mb-3" size={20} />
                <h3 className="font-bold text-white mb-2">无跟踪脚本</h3>
                <p className="text-sm text-slate-400 leading-relaxed">本应用不包含任何第三方广告、分析工具或跟踪脚本。我们不会监视您的浏览行为。</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-10 px-4">
            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="text-blue-400" size={22} />
                1. 数据收集与使用
              </h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p><strong>书签数据：</strong> 您添加的所有书签（名称、URL、图标、分类）均存储在本地。仅在您主动开启“云端同步”功能时，这些数据才会被加密传输至我们的服务器。</p>
                <p><strong>账户信息：</strong> 当您通过 Supabase 登录时，我们仅收集您的电子邮箱地址用于身份验证和区分同步数据。我们不会获取您的真实姓名、手机号等其他敏感个人信息。</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Globe className="text-green-400" size={22} />
                2. 数据安全与同步
              </h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>我们使用行业标准的加密协议（SSL/TLS）来传输您的同步数据。云端数据库由专业的云服务商（Supabase/PostgreSQL）提供支持，具备高级别的安全防护能力。</p>
                <p>同步功能是完全可选的。您可以随时在设置中退出登录，这会立即停止数据同步。您也可以随时删除您的账户及云端存储的所有数据。</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-orange-400" size={22} />
                3. 第三方披露
              </h3>
              <p className="text-slate-300 leading-relaxed">
                我们绝不会向任何第三方出售、交易或转让您的个人识别信息。除非法律要求或为了遵守法律程序，我们不会披露任何用户信息。
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-indigo-400" size={22} />
                4. 政策变更
              </h3>
              <p className="text-slate-300 leading-relaxed">
                我们可能会不时更新本隐私政策。任何变更都会在此页面上公布。我们建议您定期查看本政策以了解我们如何保护您的信息。
              </p>
            </section>
          </div>

          {/* Footer Contact */}
          <div className="border-t border-white/10 pt-12 text-center">
            <p className="text-slate-400 mb-4">如果您对本隐私政策有任何疑问，请联系我们：</p>
            <a 
              href="mailto:blacklaw@foxmail.com" 
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              blacklaw@foxmail.com
            </a>
            <p className="mt-12 text-slate-500 text-sm">
              &copy; 2025 On Tab. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
