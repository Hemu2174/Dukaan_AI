import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Log = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Tap to Speak");
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [parsedData, setParsedData] = useState({
    amount: 0,
    type: 'income',
    payment_method: 'cash',
    category: 'General',
    product_name: '',
    raw_text: ''
  });

  const speechRef = useRef(null);
  const isListeningRef = useRef(false);

  // STEP 1 & 6 — IMPLEMENT SPEECH RECOGNITION
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    // Store recognition instance globally to reuse
    if (!window.recognitionInstance) {
      window.recognitionInstance = new SpeechRecognition();
    }
    
    const recognition = window.recognitionInstance;
    speechRef.current = recognition;

    // TOGGLE: Stop if already listening
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setListening(false);
      setStatus("Tap to Speak");
      return;
    }
    
    recognition.lang = "te-IN"; // Telugu
    recognition.continuous = true;   // IMPORTANT
    recognition.interimResults = true; // IMPORTANT
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setListening(true);
      setIsListening(true);
      setStatus("🎤 Listening...");
    };

    recognition.onresult = (event) => {
      let transcript = "";
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
      console.log("Speech error:", event.error);
      
      if (event.error === "aborted") {
        setIsListening(false);
        return;
      }
      
      if (event.error === "no-speech") {
        setStatus("Didn't catch that, try again");
      } else if (event.error === "not-allowed") {
        setStatus("Microphone permission denied");
      } else {
        setStatus("Tap to Speak");
      }
      
      setListening(false);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setListening(false);
      setIsListening(false);
      if (!inputText) {
        setStatus("Tap mic and speak clearly");
      }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error(e);
        isListeningRef.current = false;
        setIsListening(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!inputText.trim()) return;
    await handleAutoTransaction(inputText);
  };

  // STEP 2 — CREATE AI PARSE FUNCTION
  const handleAutoTransaction = async (text) => {
    try {
      setLoading(true);
      setStatus("🤖 AI Parsing...");

      const token = localStorage.getItem("token");

      // 1️⃣ AI PARSE
      const parseRes = await fetch("/api/transactions/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ raw_text: text })
      });

      const parsed = await parseRes.json();
      const raw_text = text.toLowerCase();

      // 🧠 STEP 3, 4, 5 — ROBUST FALLBACKS/OVERRIDES
      if (!parsed.amount || parsed.amount === 0) {
        const match = text.match(/\d+/);
        parsed.amount = match ? Number(match[0]) : 0;
      }

      if (raw_text.includes("buy") || raw_text.includes("bought") || raw_text.includes("ఖరీదు")) {
        parsed.type = "expense";
      } else {
        parsed.type = "income";
      }

      if (raw_text.includes("upi") || raw_text.includes("phonepe") || raw_text.includes("gpay")) {
        parsed.payment_method = "upi";
      } else if (raw_text.includes("udhari") || raw_text.includes("credit") || raw_text.includes("ఉధారి")) {
        parsed.payment_method = "udhari";
      } else if (raw_text.includes("cash") || raw_text.includes("నగదు")) {
        parsed.payment_method = "cash";
      }

      if (!parsed.payment_method) {
        parsed.payment_method = "cash";
      }

      setParsedData({
        ...parsed,
        raw_text: text,
        product_name: parsed.product_name || ""
      });
      setShowConfirm(true);
      setStatus("Confirm Details");

    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to parse");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async () => {
    try {
      setLoading(true);
      setStatus("💾 Saving...");
      const token = localStorage.getItem("token");

      const saveRes = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(parsedData)
      });

      if (!saveRes.ok) throw new Error("Failed to save");

      setStatus("✅ Saved!");
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      setStatus("❌ Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark pb-32">
      <div className="px-6 py-6 border-b border-border bg-section mb-8">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-neon rounded-full shadow-[0_0_10px_rgba(163,255,18,0.5)]"></div>
           <h1 className="text-2xl font-heading font-medium text-text-primary tracking-tight italic">
            లావాదేవీ చేర్చు <span className="text-sm font-normal text-label not-italic uppercase tracking-widest ml-2">(Log)</span>
          </h1>
        </div>
      </div>
      
      <div className="px-6">
        {/* Voice Input Section */}
        <div className="flex flex-col items-center justify-center bg-card w-full py-16 rounded-[2rem] border border-border mb-8 relative overflow-hidden group hover:border-neon/20 transition-all shadow-xl">
          <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <button 
            onClick={startListening}
            disabled={loading}
            className={`w-36 h-36 rounded-full flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(163,255,18,0.15)] transition-all focus:outline-none z-10 ${listening ? 'bg-red-500 animate-pulse text-text-primary scale-110 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-neon text-dark hover:scale-105 active:scale-95'} ${loading ? 'opacity-50' : ''}`}
          >
            🎤
          </button>
          
          <p className={`mt-10 text-xl font-heading font-medium tracking-wide transition-colors z-10 ${listening ? 'text-red-400' : 'text-label'}`}>
            {status}
          </p>
        </div>

        {/* Manual Input UI */}
        <div className="w-full flex gap-3 mt-4 mb-2">
          <input
            type="text"
            placeholder="Rice 500 cash / బియ్యం 500 నగదు"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-card p-4 rounded-xl border border-border outline-none focus:border-neon/50 transition-all text-sm text-text-primary placeholder-label/50 shadow-sm"
          />

          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="bg-neon text-dark px-8 rounded-xl font-bold shadow-xl active:scale-95 transition-all text-sm disabled:opacity-50 hover:bg-white"
          >
            {loading ? '...' : 'Parse'}
          </button>
        </div>

        {/* Confirmation Form */}
        {showConfirm && (
          <div className="w-full bg-card rounded-[2rem] border border-border p-8 mb-24 animate-fade-in-up mt-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
               <h2 className="font-heading font-medium text-text-primary text-xl italic">Verify Details</h2>
               <span className="bg-neon/10 text-neon text-[10px] uppercase font-black px-3 py-1.5 rounded-full border border-neon/20 tracking-widest">AI Accurate</span>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
               <div className="col-span-1 border-b border-border pb-2 focus-within:border-neon transition-colors">
                 <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-2">Amount (₹)</label>
                 <input 
                   type="number" 
                   value={parsedData.amount}
                   onChange={(e) => setParsedData({...parsedData, amount: Number(e.target.value)})}
                   className="w-full text-2xl font-heading font-bold text-money-pos bg-transparent outline-none"
                 />
               </div>
               <div className="col-span-1 border-b border-border pb-2 focus-within:border-neon transition-colors">
                 <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-2">Flow Type</label>
                 <select 
                   value={parsedData.type}
                   onChange={(e) => setParsedData({...parsedData, type: e.target.value})}
                   className="w-full text-base font-medium text-text-primary bg-transparent outline-none cursor-pointer"
                 >
                   <option value="income" className="bg-card">Income (+)</option>
                   <option value="expense" className="bg-card">Expense (-)</option>
                 </select>
               </div>
               <div className="col-span-1 border-b border-border pb-2 focus-within:border-neon transition-colors">
                 <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-2">Mode</label>
                 <select 
                   value={parsedData.payment_method}
                   onChange={(e) => setParsedData({...parsedData, payment_method: e.target.value})}
                   className="w-full text-sm font-medium text-text-primary bg-transparent outline-none cursor-pointer"
                 >
                   <option value="cash" className="bg-card">Cash (నగదు)</option>
                   <option value="upi" className="bg-card">Digital UPI</option>
                   <option value="udhari" className="bg-card">Udhari (ఉధారి)</option>
                 </select>
               </div>
               <div className="col-span-1 border-b border-border pb-2 focus-within:border-neon transition-colors">
                 <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-2">Tag</label>
                 <input 
                   type="text" 
                   value={parsedData.category}
                   onChange={(e) => setParsedData({...parsedData, category: e.target.value})}
                   className="w-full text-sm font-medium text-text-primary bg-transparent outline-none"
                 />
               </div>
            </div>

            <div className="mb-12 border-b border-border pb-2 focus-within:border-neon transition-colors">
               <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-2">Identify Product</label>
               <input 
                 type="text" 
                 placeholder="Auto-Reorder Name"
                 value={parsedData.product_name}
                 onChange={(e) => setParsedData({...parsedData, product_name: e.target.value})}
                 className="w-full text-sm font-medium text-text-primary bg-transparent outline-none placeholder-label/30"
               />
            </div>

            <button 
              onClick={handleSaveTransaction}
              disabled={loading}
              className="w-full bg-white text-dark font-black py-5 rounded-xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 hover:bg-neon uppercase tracking-widest text-xs"
            >
              Commit to Ledger
            </button>
          </div>
        )}
      </div>

      {inputText && !showConfirm && (
        <div className="px-6 mt-auto mb-24">
          <div className="bg-card p-6 rounded-2xl border border-dashed border-border text-center shadow-inner">
             <p className="text-text-primary italic font-medium opacity-60">"{inputText}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Log;
