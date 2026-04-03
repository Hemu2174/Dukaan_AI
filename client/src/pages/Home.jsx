import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100dvh-160px)] w-full">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="text-4xl">🏪</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">Welcome back</h1>
      <p className="text-gray-500 mb-8 text-center text-sm px-4">
        Your AI-powered kirana store assistant.
      </p>
      
      <div className="w-full space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Today's Sales</h3>
            <p className="text-[10px] sm:text-xs text-green-600 font-medium">+15% from yesterday</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 pr-2">₹1,240</p>
        </div>
        
        <Link 
          to="/auth/login" 
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          <span>Get Started</span>
          <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
};

export default Home;
