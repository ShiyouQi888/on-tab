import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Eye, Database, Globe, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

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
            {t('privacy.backToHome')}
          </a>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-500/10 overflow-hidden border border-white/10">
              <img src="/ontab-logo-1.svg" alt="On Tab Logo" className="w-14 h-14 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{t('privacy.title')}</h1>
          <p className="text-slate-400 font-medium">{t('privacy.lastUpdated')}</p>
        </header>

        {/* Content */}
        <div className="space-y-12">
          {/* Summary Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-green-400" size={28} />
              <h2 className="text-2xl font-bold text-white">{t('privacy.corePromise')}</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              {t('privacy.corePromiseDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <Lock className="text-blue-400 mb-3" size={20} />
                <h3 className="font-bold text-white mb-2">{t('privacy.localFirstTitle')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t('privacy.localFirstDesc')}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <Eye className="text-purple-400 mb-3" size={20} />
                <h3 className="font-bold text-white mb-2">{t('privacy.noTrackingTitle')}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t('privacy.noTrackingDesc')}</p>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-10 px-4">
            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="text-blue-400" size={22} />
                {t('privacy.section1Title')}
              </h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p><strong>{t('privacy.section1Bookmark')}</strong> {t('privacy.section1BookmarkDesc')}</p>
                <p><strong>{t('privacy.section1Account')}</strong> {t('privacy.section1AccountDesc')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Globe className="text-green-400" size={22} />
                {t('privacy.section2Title')}
              </h3>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>{t('privacy.section2Desc1')}</p>
                <p>{t('privacy.section2Desc2')}</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-orange-400" size={22} />
                {t('privacy.section3Title')}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.section3Desc')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-indigo-400" size={22} />
                {t('privacy.section4Title')}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {t('privacy.section4Desc')}
              </p>
            </section>
          </div>

          {/* Footer Contact */}
          <div className="border-t border-white/10 pt-12 text-center">
            <p className="text-slate-400 mb-4">{t('privacy.contactQuestion')}</p>
            <a 
              href="mailto:blacklaw@foxmail.com" 
              className="text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              blacklaw@foxmail.com
            </a>
            <p className="mt-12 text-slate-500 text-sm">
              {t('privacy.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
