import { useState, useEffect } from 'react';

const Summary = () => {
  const [summary, setSummary] = useState(localStorage.getItem("lastSummary") || "");
  const [metrics, setMetrics] = useState({ 
    cash: 0, upi: 0, udhari: 0, income: 0, expenses: 0, net: 0
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
    <div className="px-3 py-2 h-full pb-24 w-full bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">రోజువారీ సారాంశం <br/><span className="text-sm font-normal text-gray-500">(Daily Summary)</span></h1>
      
      <button 
        onClick={fetchSummary}
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 mb-6 flex items-center justify-center gap-2"
      >
        {loading ? 'Generating...' : '✨ ఈరోజు సారాంశం (Generate)'}
      </button>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {summary && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 mb-6 relative animate-fade-in-up">
          <div className="absolute top-4 right-4 flex gap-3">
            <button onClick={() => window.speechSynthesis.cancel()} className="text-gray-400 hover:text-red-500 transition-colors text-xl" title="Stop">
              ⏹
            </button>
            <button onClick={() => speakTelugu(summary)} className="text-gray-400 hover:text-blue-500 transition-colors text-xl font-medium" title="Play">
              🔊 వినండి (Listen)
            </button>
            <button onClick={copyToClipboard} className="text-gray-400 hover:text-green-500 transition-colors text-xl" title="Copy">
              📋
            </button>
          </div>
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">AI Summary</h3>
          <p className="text-gray-700 leading-relaxed text-sm mb-4 mt-2">
            {summary}
          </p>
        </div>
      )}

      {/* Payment Split Cards */}
      <h3 className="font-semibold text-gray-800 mb-3">పేమెంట్ వివరాలు (Payment Split)</h3>
      <div className="grid grid-cols-3 gap-2 mb-6 w-full">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-green-700 mb-1 z-10">Cash</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{metrics.cash}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-blue-700 mb-1 z-10">UPI</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{metrics.upi}</span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-orange-700 mb-1 z-10">Udhari</span>
          <span className="text-sm font-bold text-gray-900 z-10">₹{metrics.udhari}</span>
        </div>
      </div>
    </div>
  );
};

export default Summary;
