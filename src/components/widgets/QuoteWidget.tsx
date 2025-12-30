import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, RefreshCw, Copy, Check } from 'lucide-react';

interface QuoteData {
  hitokoto: string;
  from: string;
  from_who: string | null;
}

export const QuoteWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Use Hitokoto API for Chinese quotes, or a different one for English if needed
      // For now, Hitokoto is fine as it has a diverse set of quotes
      const response = await fetch('https://v1.hitokoto.cn/?c=i&c=d&c=h');
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleCopy = () => {
    if (!quote) return;
    const text = `“${quote.hitokoto}” —— ${quote.from_who || ''}《${quote.from}》`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full max-w-sm flex flex-col h-[200px] relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-3 shrink-0 relative z-10">
        <Quote className="text-purple-400" size={18} />
        <h3 className="text-white/60 text-sm font-medium">{t('widgets.quote.title')}</h3>
        
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
            title={t('widgets.quote.copy')}
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button
            onClick={fetchQuote}
            disabled={loading}
            className={`p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}
            title={t('widgets.quote.refresh')}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {loading && !quote ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/5 animate-pulse rounded w-3/4" />
            <div className="h-4 bg-white/5 animate-pulse rounded w-1/2" />
          </div>
        ) : (
          <>
            <p className="text-white/90 text-lg font-medium leading-relaxed line-clamp-3 mb-3">
              {quote?.hitokoto}
            </p>
            <p className="text-white/40 text-sm text-right italic">
              —— {quote?.from_who && `${quote.from_who} `}《{quote?.from}》
            </p>
          </>
        )}
      </div>

      {/* Decorative background quote icon */}
      <Quote 
        size={120} 
        className="absolute -right-8 -bottom-8 text-white/[0.03] rotate-12 pointer-events-none" 
      />
    </div>
  );
};
