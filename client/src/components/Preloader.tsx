import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface PreloaderProps {
  isVisible: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isVisible }) => {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const lottieInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (lottieContainerRef.current && !lottieInstanceRef.current) {
      // Initialize Lottie with safe error handling
      try {
        // Use a simple loading animation instead of external data
        lottieInstanceRef.current = lottie.loadAnimation({
          container: lottieContainerRef.current!,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          // Safe fallback animation data
          animationData: {
            v: "5.7.4",
            fr: 30,
            ip: 0,
            op: 60,
            w: 400,
            h: 400,
            nm: "Simple Loading",
            ddd: 0,
            assets: [],
            layers: [
              {
                ddd: 0,
                ind: 1,
                ty: 4,
                nm: "Loading Circle",
                sr: 1,
                ks: {
                  o: { a: 0, k: 100, ix: 11 },
                  r: {
                    a: 1,
                    k: [
                      { t: 0, s: [0] },
                      { t: 60, s: [360] }
                    ],
                    ix: 10
                  },
                  p: { a: 0, k: [200, 200, 0], ix: 2 },
                  a: { a: 0, k: [0, 0, 0], ix: 1 },
                  s: { a: 0, k: [100, 100, 100], ix: 6 }
                },
                ao: 0,
                shapes: [
                  {
                    ty: "gr",
                    it: [
                      {
                        d: 1,
                        ty: "el",
                        s: { a: 0, k: [100, 100], ix: 2 },
                        p: { a: 0, k: [0, 0], ix: 3 },
                        nm: "Circle"
                      },
                      {
                        ty: "st",
                        c: { a: 0, k: [0.2, 0.4, 0.8, 1], ix: 3 },
                        o: { a: 0, k: 100, ix: 4 },
                        w: { a: 0, k: 6, ix: 5 },
                        lc: 2,
                        lj: 1,
                        ml: 4,
                        bm: 0,
                        nm: "Stroke"
                      },
                      {
                        ty: "tr",
                        p: { a: 0, k: [0, 0], ix: 2 },
                        a: { a: 0, k: [0, 0], ix: 1 },
                        s: { a: 0, k: [100, 100], ix: 3 },
                        r: { a: 0, k: 0, ix: 6 },
                        o: { a: 0, k: 100, ix: 7 },
                        sk: { a: 0, k: 0, ix: 4 },
                        sa: { a: 0, k: 0, ix: 5 },
                        nm: "Transform"
                      }
                    ],
                    nm: "Circle Group",
                    np: 2,
                    cix: 2,
                    bm: 0,
                    ix: 1
                  }
                ],
                ip: 0,
                op: 60,
                st: 0,
                bm: 0
              }
            ]
          }
        });
      } catch (error) {
        console.error('Error loading Lottie animation:', error);
        // Fallback to simple CSS animation if Lottie fails
        if (lottieContainerRef.current) {
          lottieContainerRef.current.innerHTML = `
            <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
          `;
        }
      }
    }

    return () => {
      if (lottieInstanceRef.current) {
        try {
          lottieInstanceRef.current.destroy();
          lottieInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying Lottie animation:', error);
        }
      }
    };
  }, []);

  // Show/hide animation based on visibility
  useEffect(() => {
    if (lottieInstanceRef.current) {
      try {
        if (isVisible) {
          lottieInstanceRef.current.play();
        } else {
          lottieInstanceRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling Lottie animation:', error);
      }
    }
  }, [isVisible]);

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