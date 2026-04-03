import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100dvh-160px)] w-full bg-dark">
      <div className="w-24 h-24 bg-card border border-border rounded-full flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-neon/5 animate-pulse" />
        <span className="text-5xl z-10">🏪</span>
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-heading font-medium text-text-primary mb-3 text-center italic tracking-tight">Welcome back</h1>
      <p className="text-text-secondary mb-12 text-center text-sm px-6 font-sans font-light leading-relaxed">
        Your AI-powered kirana store assistant. <br/>
        <span className="text-[10px] uppercase font-black tracking-widest text-neon opacity-60">Ready for daily entries</span>
      </p>
      
      <div className="w-full max-w-sm space-y-6">
        <div className="bg-card p-6 rounded-2xl shadow-xl border border-border flex items-center justify-between hover:border-neon/30 transition-all group">
          <div>
            <h3 className="font-heading font-medium text-text-primary text-base italic">Today's Sales</h3>
            <p className="text-[10px] text-money-pos font-bold uppercase tracking-widest">+15% from yesterday</p>
          </div>
          <p className="text-2xl font-heading font-bold text-text-primary tracking-tight italic">₹1,240</p>
        </div>
        
        <Link 
          to="/auth/login" 
          className="w-full bg-neon text-dark font-black py-5 px-6 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 transform active:scale-95 hover:bg-white uppercase tracking-widest text-xs"
        >
          <span>Get Started</span>
          <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
