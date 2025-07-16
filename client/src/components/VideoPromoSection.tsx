import React, { useState } from 'react';
import { Play, Users, Eye, Clock, Youtube } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const VideoPromoSection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const statistics = [
    {
      value: '695+',
      label: isRTL ? 'مشترك جديد' : 'New Subscribers',
      labelAr: 'مشترك جديد',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      value: '78.3K+',
      label: isRTL ? 'مشاهدة اليوم' : 'Views Today',
      labelAr: 'مشاهدة اليوم',
      icon: Eye,
      color: 'text-green-400'
    },
    {
      value: '10.8M+',
      label: isRTL ? 'مشاهدة كاملة' : 'Total Views',
      labelAr: 'مشاهدة كاملة',
      icon: Eye,
      color: 'text-purple-400'
    },
    {
      value: '397.5K+',
      label: isRTL ? 'ساعة مشاهدة' : 'Watch Hours',
      labelAr: 'ساعة مشاهدة',
      icon: Clock,
      color: 'text-orange-400'
    }
  ];

  const handlePlayVideo = () => {
    setIsPlaying(true);
    // Here you would typically open a modal or redirect to the actual video
    window.open('https://www.youtube.com/@MemphisToursTV', '_blank');
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Video Preview Section */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              {/* Header Text */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-white"></div>
                  <span className="text-white text-sm font-medium">
                    {isRTL ? 'استطلاع الآراء من متوسطة في' : 'Tourism Survey Results'}
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  {isRTL ? 'قناة ممفيس للسياحة على اليوتيوب' : 'Memphis Tours YouTube Channel'}
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {isRTL 
                    ? 'انضم إلى قناتنا على اليوتيوب واستمتع بمحتوى سياحي مميز يضم جولات افتراضية وأماكن تاريخية مدهشة وتجارب سفر لا تُنسى من مختلف أنحاء العالم.'
                    : 'Join our YouTube channel and enjoy premium tourism content featuring virtual tours, amazing historical sites, and unforgettable travel experiences from around the world.'
                  }
                </p>
              </div>

              {/* Video Thumbnail */}
              <div className="relative group cursor-pointer" onClick={handlePlayVideo}>
                <div className="relative overflow-hidden rounded-lg shadow-2xl bg-gradient-to-br from-blue-400 to-blue-600 aspect-video">
                  {/* Placeholder for video thumbnail - you can replace with actual thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-600 flex items-center justify-center">
                    <div className="w-full h-full bg-black bg-opacity-20 flex items-center justify-center">
                      {/* Video thumbnail placeholder with boat/tourism imagery */}
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/30 to-blue-900/50"></div>
                        <div className="relative z-10 text-white text-center">
                          <div className="text-4xl font-bold mb-2">🚢</div>
                          <div className="text-lg font-medium">Memphis Tours</div>
                          <div className="text-sm opacity-80">YouTube Channel</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {statistics.map((stat, index) => (
                <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-opacity-20 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">
                    {isRTL ? stat.labelAr : stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* YouTube Channel Info */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Youtube className="w-6 h-6 text-red-400" />
                <span className="text-white font-medium">
                  {isRTL ? 'ابحث عن قناتنا على اليوتيوب' : 'Find us on YouTube'}
                </span>
              </div>
              <div className="text-xl font-bold text-yellow-400 mb-2">
                @MemphisToursTV
              </div>
              <a 
                href="https://www.youtube.com/@MemphisToursTV" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 hover:scale-105"
              >
                <Youtube className="w-5 h-5" />
                {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPromoSection;