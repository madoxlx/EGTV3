import React, { useEffect, useRef } from 'react';

interface PreloaderProps {
  isVisible: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isVisible }) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieInstanceRef = useRef<any>(null);

  // Use simple CSS animation for better performance
  useEffect(() => {
    if (lottieContainerRef.current) {
      lottieContainerRef.current.innerHTML = `
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
      `;
    }
  }, []);

  return (
    <div 
      id="loader" 
      className={`fixed top-0 left-0 w-full h-full bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      <div id="lottie-loader" ref={lottieContainerRef} className="w-80 h-80" />
      <div className="loader-text mt-4 text-primary font-medium text-xl">
        Preparing your journey...
      </div>
    </div>
  );
};

export default Preloader;