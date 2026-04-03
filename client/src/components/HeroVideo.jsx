import { useRef, useEffect } from 'react';

const HeroVideo = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Safety start for autoplay
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto animate-float before:absolute before:inset-0 before:bg-[#A3FF12]/10 before:blur-[100px] before:rounded-full">
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-3xl border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-dark z-10">
        <video
          ref={videoRef}
          src="/videos/Kirana_Shop_AI_Animation_Generation.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          loop
          onLoadedData={(e) => e.target.play()}
        />
        
        {/* Subtle Overlay Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default HeroVideo;
