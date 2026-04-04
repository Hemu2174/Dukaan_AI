import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Log = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Tap to Speak');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [parsedData, setParsedData] = useState({
    amount: 0,
    type: 'income',
    payment_method: 'cash',
    category: 'General',
    product_name: '',
    raw_text: '',
  });

  const speechRef = useRef(null);
  const isListeningRef = useRef(false);

  const startListening = () => {
    if (isListeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    speechRef.current = recognition;

    recognition.lang = 'te-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setListening(true);
      setStatus('🎤 Listening...');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);

      const last = event.results.length - 1;
      if (event.results[last].isFinal) {
        recognition.stop();
        handleAutoTransaction(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech error:', event.error);

      if (event.error === 'aborted') return;

      if (event.error === 'no-speech') {
        setStatus("Didn't catch that, try again");
      } else if (event.error === 'not-allowed') {
        setStatus('Microphone permission denied');
      } else {
        setStatus('Tap to Speak');
      }

      setListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setListening(false);
      if (!inputText) {
        setStatus('Tap mic and speak clearly');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      isListeningRef.current = false;
    }
  };

  const handleManualSubmit = async () => {
    if (!inputText.trim()) return;
    await handleAutoTransaction(inputText);
  };

  const handleAutoTransaction = async (text) => {
    try {
      setLoading(true);
      setStatus('🤖 AI Parsing...');

      const token = localStorage.getItem('token');

      const parseRes = await fetch(`${API_URL}/transactions/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ raw_text: text }),
      });

      const parsed = await parseRes.json();
      const raw_text = text.toLowerCase();

      if (!parsed.amount || parsed.amount === 0) {
        const match = text.match(/\d+/);
        parsed.amount = match ? Number(match[0]) : 0;
      }

      if (raw_text.includes('buy') || raw_text.includes('bought') || raw_text.includes('ఖరీదు')) {
        parsed.type = 'expense';
      } else {
        parsed.type = 'income';
      }

      if (raw_text.includes('upi') || raw_text.includes('phonepe') || raw_text.includes('gpay')) {
        parsed.payment_method = 'upi';
      } else if (raw_text.includes('udhari') || raw_text.includes('credit') || raw_text.includes('ఉధారి')) {
        parsed.payment_method = 'udhari';
      } else if (raw_text.includes('cash') || raw_text.includes('నగదు')) {
        parsed.payment_method = 'cash';
      }

      if (!parsed.payment_method) {
        parsed.payment_method = 'cash';
      }

      setParsedData({
        ...parsed,
        raw_text: text,
        product_name: parsed.product_name || '',
      });
      setShowConfirm(true);
      setStatus('Confirm Details');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to parse');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async () => {
    try {
      setLoading(true);
      setStatus('💾 Saving...');
      const token = localStorage.getItem('token');

      const saveRes = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedData),
      });

      if (!saveRes.ok) throw new Error('Failed to save');

      setStatus('✅ Saved!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      setStatus('❌ Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] text-white pb-12">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6 md:pt-6">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.45)]" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              లావాదేవీ చేర్చు <span className="ml-2 text-sm font-normal uppercase tracking-[0.28em] text-white/35">(Log)</span>
            </h1>
          </div>
        </div>

        <div className="px-0 md:px-0">
          <div className="relative mb-6 flex w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#111827] py-16 shadow-[0_24px_80px_rgba(0,0,0,0.35)] group hover:border-white/20 transition-all">
            <div className="absolute inset-0 bg-cyan-300/5 opacity-0 transition-opacity group-hover:opacity-100" />

            <button
              onClick={startListening}
              disabled={loading}
              className={`z-10 flex h-36 w-36 items-center justify-center rounded-full text-6xl shadow-[0_0_40px_rgba(103,232,249,0.15)] transition-all focus:outline-none ${listening ? 'scale-110 animate-pulse bg-rose-500 text-white shadow-[0_0_50px_rgba(244,63,94,0.4)]' : 'bg-cyan-300 text-[#0B0F1A] hover:scale-105 active:scale-95'} ${loading ? 'opacity-50' : ''}`}
            >
              🎤
            </button>

            <p className={`z-10 mt-10 text-xl font-semibold tracking-wide transition-colors ${listening ? 'text-rose-300' : 'text-white/45'}`}>
              {status}
            </p>
          </div>

          <div className="mt-4 mb-2 flex w-full gap-3">
            <input
              type="text"
              placeholder="Rice 500 cash / బియ్యం 500 నగదు"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-cyan-300/40 focus:bg-white/[0.06]"
            />

            <button
              onClick={handleManualSubmit}
              disabled={loading}
              className="rounded-2xl bg-white px-8 text-sm font-semibold text-[#0B0F1A] shadow-xl transition-all active:scale-95 disabled:opacity-50 hover:bg-cyan-100"
            >
              {loading ? '...' : 'Parse'}
            </button>
          </div>

          {showConfirm && (
            <div className="mt-10 mb-24 w-full rounded-[28px] border border-white/10 bg-[#111827] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] animate-fade-in-up">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                <h2 className="text-xl font-semibold text-white">Verify Details</h2>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-200">AI Accurate</span>
              </div>

              <div className="mb-10 grid grid-cols-2 gap-8">
                <div className="col-span-1 border-b border-white/10 pb-2 transition-colors focus-within:border-cyan-300/40">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Amount (₹)</label>
                  <input
                    type="number"
                    value={parsedData.amount}
                    onChange={(e) => setParsedData({ ...parsedData, amount: Number(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-semibold text-emerald-300 outline-none"
                  />
                </div>
                <div className="col-span-1 border-b border-white/10 pb-2 transition-colors focus-within:border-cyan-300/40">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Flow Type</label>
                  <select
                    value={parsedData.type}
                    onChange={(e) => setParsedData({ ...parsedData, type: e.target.value })}
                    className="w-full cursor-pointer bg-transparent text-base font-medium text-white outline-none"
                  >
                    <option value="income" className="bg-[#111827]">Income (+)</option>
                    <option value="expense" className="bg-[#111827]">Expense (-)</option>
                  </select>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-2 gap-8">
                <div className="col-span-1 border-b border-white/10 pb-2 transition-colors focus-within:border-cyan-300/40">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Payment Method</label>
                  <select
                    value={parsedData.payment_method}
                    onChange={(e) => setParsedData({ ...parsedData, payment_method: e.target.value })}
                    className="w-full cursor-pointer bg-transparent text-base font-medium text-white outline-none"
                  >
                    <option value="cash" className="bg-[#111827]">Cash</option>
                    <option value="upi" className="bg-[#111827]">UPI</option>
                    <option value="udhari" className="bg-[#111827]">Udhari</option>
                  </select>
                </div>
                <div className="col-span-1 border-b border-white/10 pb-2 transition-colors focus-within:border-cyan-300/40">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Category</label>
                  <input
                    type="text"
                    value={parsedData.category}
                    onChange={(e) => setParsedData({ ...parsedData, category: e.target.value })}
                    className="w-full bg-transparent text-base font-medium text-white outline-none"
                  />
                </div>
              </div>

              <div className="mb-10 border-b border-white/10 pb-6 transition-colors focus-within:border-cyan-300/40">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-white/35">Product Name</label>
                <input
                  type="text"
                  value={parsedData.product_name}
                  onChange={(e) => setParsedData({ ...parsedData, product_name: e.target.value })}
                  className="w-full bg-transparent text-base font-medium text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleSaveTransaction}
                  disabled={loading}
                  className="rounded-2xl bg-white py-5 text-[10px] font-black uppercase tracking-[0.28em] text-[#0B0F1A] shadow-xl transition-all active:scale-[0.98] hover:bg-cyan-100 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] py-5 text-[10px] font-black uppercase tracking-[0.28em] text-white/65 shadow-xl transition-all active:scale-[0.98] hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Log;
