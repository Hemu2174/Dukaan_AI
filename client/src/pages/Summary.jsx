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
    <div className="min-h-screen w-full bg-dark pb-32">
      <div className="px-6 py-6 border-b border-border bg-section mb-8">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_rgba(163,255,18,0.5)]"></div>
           <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">
            రోజువారీ సారాంశం <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Daily Analysis)</span>
          </h1>
        </div>
      </div>
      
      <div className="px-6">
        <button 
          onClick={fetchSummary}
          disabled={loading}
          className="w-full bg-neon text-dark font-black py-5 rounded-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 mb-10 flex items-center justify-center gap-3 text-sm uppercase tracking-widest hover:bg-white"
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

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs mb-8 flex items-center gap-2 italic">⚠️ {error}</div>}

        {summary && (
          <div className="bg-card p-10 rounded-[2rem] border border-border mb-10 relative animate-fade-in-up shadow-2xl">
            <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={() => window.speechSynthesis.cancel()} className="text-label hover:text-red-400 transition-all text-sm p-3 bg-dark rounded-full border border-border" title="Stop">
                ⏹
              </button>
              <button onClick={() => speakTelugu(summary)} className="text-label hover:text-neon transition-all text-sm p-3 bg-dark rounded-full border border-border" title="Play">
                🔊
              </button>
              <button onClick={copyToClipboard} className="text-label hover:text-neon transition-all text-sm p-3 bg-dark rounded-full border border-border" title="Copy">
                📋
              </button>
            </div>
            <h3 className="font-heading font-medium text-text-primary mb-6 border-b border-border pb-4 text-xl italic">AI Deep Insights</h3>
            <p className="text-text-primary leading-relaxed text-base mb-2 mt-4 font-sans font-light opacity-90 italic">
              {summary}
            </p>
          </div>
        )}

        {/* Payment Split Cards */}
        <h3 className="font-heading font-medium text-text-primary mb-6 text-lg italic flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-neon"></span>
          Fiscal Performance
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-12 w-full">
          <div className="bg-card rounded-xl p-6 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/20 transition-all shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-label mb-3 z-10">Cash Holding</span>
            <span className="text-2xl font-heading font-bold text-money-pos z-10 italic">₹{metrics.cash_balance}</span>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border flex flex-col items-center justify-center relative overflow-hidden group hover:border-neon/20 transition-all shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-label mb-3 z-10">Digital Reserve</span>
            <span className="text-2xl font-heading font-bold text-money-pos z-10 italic">₹{metrics.upi_balance}</span>
          </div>
        </div>
      </div>
    </div>


  );
};

export default Summary;
