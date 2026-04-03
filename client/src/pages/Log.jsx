import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Log = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
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
    if (isListeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    speechRef.current = recognition;
    
    recognition.lang = "te-IN"; // Telugu
    recognition.continuous = true;   // IMPORTANT
    recognition.interimResults = true; // IMPORTANT
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setListening(true);
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
      
      if (event.error === "aborted") return;
      
      if (event.error === "no-speech") {
        setStatus("Didn't catch that, try again");
      } else if (event.error === "not-allowed") {
        setStatus("Microphone permission denied");
      } else {
        setStatus("Tap to Speak");
      }
      
      setListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setListening(false);
      if (!inputText) {
        setStatus("Tap mic and speak clearly");
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
    <div className="px-3 py-2 h-full flex flex-col w-full flex-1">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">లావాదేవీ చేర్చు <br/><span className="text-sm font-normal text-gray-500">(Add Transaction)</span></h1>
      
      {/* Voice Input Section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center bg-white w-full py-12 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <button 
            onClick={startListening}
            disabled={loading}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-transform focus:outline-none ${listening ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-primary text-white hover:scale-105 active:scale-95'} ${loading ? 'opacity-50' : ''}`}
          >
            🎤
          </button>
          <p className={`mt-8 text-xl font-bold transition-colors ${listening ? 'text-red-500' : 'text-gray-500'}`}>
            {status}
          </p>
        </div>

        {/* Manual Input UI */}
        <div className="w-full flex gap-2 mt-4 mb-4">
          <input
            type="text"
            placeholder="Type (e.g. Rice 500 cash)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
          />

          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 rounded-xl font-semibold shadow-md active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            {loading ? '...' : 'Parse'}
          </button>
        </div>

        {/* Confirmation Form */}
        {showConfirm && (
          <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-24 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="font-bold text-gray-800 text-lg">Confirm Details</h2>
               <span className="bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md">AI Parsed</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</label>
                 <input 
                   type="number" 
                   value={parsedData.amount}
                   onChange={(e) => setParsedData({...parsedData, amount: Number(e.target.value)})}
                   className="w-full text-lg font-bold text-gray-900 border-b border-gray-100 focus:border-primary outline-none pb-1"
                 />
               </div>
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                 <select 
                   value={parsedData.type}
                   onChange={(e) => setParsedData({...parsedData, type: e.target.value})}
                   className="w-full text-base font-semibold text-gray-700 bg-transparent outline-none"
                 >
                   <option value="income">Income (ఆదాయం)</option>
                   <option value="expense">Expense (ఖర్చు)</option>
                 </select>
               </div>
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Method (నగదు/UPI/ఉధారి)</label>
                 <select 
                   value={parsedData.payment_method}
                   onChange={(e) => setParsedData({...parsedData, payment_method: e.target.value})}
                   className="w-full text-sm font-semibold text-gray-700 bg-transparent outline-none"
                 >
                   <option value="cash">Cash (నగదు)</option>
                   <option value="upi">UPI</option>
                   <option value="udhari">Udhari (ఉధారి)</option>
                 </select>
               </div>
               <div className="col-span-1">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
                 <input 
                   type="text" 
                   value={parsedData.category}
                   onChange={(e) => setParsedData({...parsedData, category: e.target.value})}
                   className="w-full text-sm font-semibold text-gray-700 border-b border-gray-100 focus:border-primary outline-none pb-1"
                 />
               </div>
            </div>

            <div className="mb-8">
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Name (Optional - For Auto Reorder)</label>
               <input 
                 type="text" 
                 placeholder="E.g. Parle-G"
                 value={parsedData.product_name}
                 onChange={(e) => setParsedData({...parsedData, product_name: e.target.value})}
                 className="w-full text-sm font-medium text-gray-600 border-b border-gray-100 focus:border-primary outline-none pb-1"
               />
            </div>

            <button 
              onClick={handleSaveTransaction}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
            >
              Save Transaction
            </button>
          </div>
        )}
      </div>

      {inputText && !showConfirm && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center shadow-inner">
           <p className="text-gray-700 italic font-medium">"{inputText}"</p>
        </div>
      )}
    </div>
  );
};

export default Log;
