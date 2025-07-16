import React from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Shield, Users, DollarSign } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t('whyChooseUs.feature1.title', 'Tailored and Reliable Service'),
      titleAr: 'خدمة مخصصة وموثوقة',
      description: t('whyChooseUs.feature1.description', 'We provide customized travel, timely transfers, and seamless plans.'),
      descriptionAr: 'نقدم سفر مخصص ونقل في الوقت المناسب وخطط سلسة.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: t('whyChooseUs.feature2.title', 'Exceptional Expertise and Comfort'),
      titleAr: 'خبرة استثنائية وراحة',
      description: t('whyChooseUs.feature2.description', 'Experience seamless travel with expert guides, skilled drivers, and reliable vehicles.'),
      descriptionAr: 'استمتع بسفر سلس مع مرشدين خبراء وسائقين ماهرين ومركبات موثوقة.',
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: t('whyChooseUs.feature3.title', 'Transparent and Competitive Pricing'),
      titleAr: 'أسعار شفافة وتنافسية',
      description: t('whyChooseUs.feature3.description', 'Enjoy premium services at transparent, fair rates for a stress-free journey.'),
      descriptionAr: 'استمتع بخدمات مميزة بأسعار شفافة وعادلة لرحلة خالية من التوتر.',
      color: 'text-blue-600'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-900 inline-block pb-2">
            {isRTL ? 'لماذا تختارنا' : t('whyChooseUs.title', 'Why Choose Us')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              {/* Icon and Title Row */}
              <div className="flex items-center gap-4 mb-4">
                {/* Icon Circle */}
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900">
                  {isRTL ? feature.titleAr : feature.title}
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-center">
                {isRTL ? feature.descriptionAr : feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;