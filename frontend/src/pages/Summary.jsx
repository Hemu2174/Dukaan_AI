import { useState, useEffect } from 'react';

const Summary = () => {
  const [summary, setSummary] = useState(localStorage.getItem("lastSummary") || "");
  const [metrics, setMetrics] = useState({ 
    cash_balance: 0, upi_balance: 0, income: 0, expenses: 0, net: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("Voices loaded");
      };
    }
  }, []);

  const speakTelugu = (text) => {
    if (!window.speechSynthesis) {
      alert("Text-to-Speech not supported in this browser");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Try Telugu voice
    let teluguVoice = voices.find(v => v.lang === "te-IN");

    if (teluguVoice) {
      utterance.voice = teluguVoice;
      utterance.lang = "te-IN";
    } else {
      // fallback (still speak Telugu text)
      utterance.lang = "hi-IN"; // better pronunciation than en-IN
    }

    utterance.rate = 0.85;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/summary/daily', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setMetrics(data.metrics || metrics);
        localStorage.setItem("lastSummary", data.summary);
        // 🔥 AUTO SPEAK
        speakTelugu(data.summary);
      } else {
        setError(data.error || "Failed to load summary");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Showing offline fallback.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      alert("సారాంశం కాపీ చేయబడింది! (Copied to clipboard)");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] text-white pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
             <h1 className="text-2xl font-semibold tracking-tight text-white">
              రోజువారీ సారాంశం <span className="ml-2 text-sm font-normal uppercase tracking-[0.28em] text-white/35">(Daily Analysis)</span>
            </h1>
          </div>
        </div>
      </div>
      
      <div className="px-4 md:px-6">
        <button 
          onClick={fetchSummary}
          disabled={loading}
          className="mb-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-5 text-sm font-semibold uppercase tracking-[0.28em] text-[#0B0F1A] shadow-xl transition-all active:scale-[0.98] hover:bg-cyan-100 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="animate-spin text-lg">⚡</span>
              <span>Quantifying...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Summary</span>
            </>
          )}
        </button>

        {error && <div className="mb-8 flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">⚠️ {error}</div>}

        {summary && (
          <div className="relative mb-10 rounded-[28px] border border-white/10 bg-[#111827] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-fade-in-up">
            <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={() => window.speechSynthesis.cancel()} className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-sm text-white/60 transition-all hover:text-rose-300" title="Stop">
                ⏹
              </button>
              <button onClick={() => speakTelugu(summary)} className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-sm text-white/60 transition-all hover:text-white" title="Play">
                🔊
              </button>
              <button onClick={copyToClipboard} className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-sm text-white/60 transition-all hover:text-white" title="Copy">
                📋
              </button>
            </div>
            <h3 className="mb-6 border-b border-white/10 pb-4 text-xl font-semibold text-white">AI Deep Insights</h3>
            <p className="mb-2 mt-4 text-base leading-relaxed text-white/80">
              {summary}
            </p>
          </div>
        )}

        {/* Payment Split Cards */}
        <h3 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
          Fiscal Performance
        </h3>
        <div className="mb-12 grid w-full grid-cols-2 gap-4">
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[#111827] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all hover:border-white/20">
            <span className="z-10 mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Cash Holding</span>
            <span className="z-10 text-2xl font-semibold text-emerald-300">₹{metrics.cash_balance}</span>
          </div>
          <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[#111827] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all hover:border-white/20">
            <span className="z-10 mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Digital Reserve</span>
            <span className="z-10 text-2xl font-semibold text-emerald-300">₹{metrics.upi_balance}</span>
          </div>
        </div>
      </div>
    </div>


  );
};

export default Summary;
