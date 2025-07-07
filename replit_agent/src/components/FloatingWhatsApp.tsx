import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const FloatingWhatsApp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Get slider height (assuming slider is around 500-600px)
      const sliderHeight = 500;
      
      // Show button after scrolling past slider
      setIsVisible(scrollTop > sliderHeight);
      
      // Check if near footer (within 200px)
      const footerThreshold = 200;
      const nearFooter = scrollTop + windowHeight >= documentHeight - footerThreshold;
      setIsAtBottom(nearFooter);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '+201152117102';
    const message = 'Hello! I\'m interested in your travel packages from Sahara Journeys.';
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed right-6 z-50 transition-all duration-300 ${
        isAtBottom 
          ? 'bottom-[220px]' // Stop above footer
          : 'bottom-6' // Normal floating position
      }`}
    >
      <button
        onClick={handleWhatsAppClick}
        className="group bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-pulse hover:animate-none"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform duration-200" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Chat with us on WhatsApp
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>
    </div>
  );
};

export default FloatingWhatsApp;