import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { Calendar, UserCheck, ChevronRight, Shield, Users, DollarSign, Star, Heart, Zap, CheckCircle, ShieldCheck, Gift, Headphones, Clock, MapPin } from 'lucide-react';

interface HomepageSection {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  touristsCount?: string;
  destinationsCount?: string;
  hotelsCount?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature1Icon?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature2Icon?: string;
  titleAr?: string;
  subtitleAr?: string;
  descriptionAr?: string;
  buttonTextAr?: string;
  feature1TitleAr?: string;
  feature1DescriptionAr?: string;
  feature2TitleAr?: string;
  feature2DescriptionAr?: string;
  order?: number;
  active?: boolean;
  showStatistics?: boolean;
  showFeatures?: boolean;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
  textColor?: string;
  features?: Array<{
    title: string;
    titleAr?: string;
    icon: string;
    subFeatures?: Array<{
      title: string;
      titleAr?: string;
      icon: string;
    }>;
  }>;
}

interface DynamicHomepageSectionProps {
  section: HomepageSection;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  calendar: Calendar,
  'user-check': UserCheck,
  'chevron-right': ChevronRight,
  shield: Shield,
  'shield-check': ShieldCheck,
  users: Users,
  'dollar-sign': DollarSign,
  star: Star,
  heart: Heart,
  zap: Zap,
  'check-circle': CheckCircle,
  gift: Gift,
  headphones: Headphones,
  clock: Clock,
  'map-pin': MapPin,
};

const DynamicHomepageSection: React.FC<DynamicHomepageSectionProps> = ({ section }) => {
  const { t, currentLanguage, isRTL } = useLanguage();
  
  const getIcon = (iconName: string, size: string = "w-5 h-5", color: string = "text-blue-600") => {
    const IconComponent = iconMap[iconName] || Calendar;
    return <IconComponent className={`${size} ${color}`} />;
  };

  const getLocalizedText = (enText: string, arText?: string) => {
    return currentLanguage === 'ar' && arText ? arText : enText;
  };

  const isImageLeft = section.imagePosition === 'left';
  const backgroundColor = section.backgroundColor || 'white';
  const textColor = section.textColor || 'black';

  // Check if this is a "Why Choose Us" section with hierarchical features
  const isWhyChooseUsSection = section.features && section.features.length > 0 && section.features.some(f => f.subFeatures);

  // If this is a "Why Choose Us" section, render it differently
  if (isWhyChooseUsSection) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 border-b-2 border-gray-900 inline-block pb-2">
              {getLocalizedText(section.title, section.titleAr)}
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {section.features?.map((feature, index) => (
              <div key={index} className="group">
                {/* Icon and Title Row */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Icon Circle */}
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
                    {getIcon(feature.icon, "w-8 h-8", "text-blue-600")}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getLocalizedText(feature.title, feature.titleAr)}
                  </h3>
                </div>
                
                {/* Sub-features */}
                {feature.subFeatures && feature.subFeatures.length > 0 && (
                  <div className="space-y-2 ml-4">
                    {feature.subFeatures.map((subFeature, subIndex) => (
                      <div key={subIndex} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          {getIcon(subFeature.icon, "w-3 h-3", "text-blue-600")}
                        </div>
                        <span className="text-gray-600 text-sm">
                          {getLocalizedText(subFeature.title, subFeature.titleAr)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`py-16 ${backgroundColor === 'white' ? 'bg-white' : backgroundColor === 'gray' ? 'bg-gray-50' : 'bg-blue-50'}`}
      style={{ color: textColor }}
    >
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Image Section */}
          <div className={`relative ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative">
              <img
                src={section.imageUrl}
                alt={getLocalizedText(section.title, section.titleAr)}
                className="w-full rounded-2xl shadow-lg object-cover"
                style={{ height: '500px' }}
              />
              
              {/* Statistics Badges */}
              {section.showStatistics && (
                <>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg ml-[-71px] mr-[-71px] pl-[22px] pr-[22px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getLocalizedText(section.touristsLabel || 'Tourists', section.touristsLabelAr || 'السياح')}</p>
                        <p className="text-lg font-bold text-gray-900">{section.touristsCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getLocalizedText(section.destinationsLabel || 'Destinations', section.destinationsLabelAr || 'الوجهات')}</p>
                        <p className="text-lg font-bold text-gray-900">{section.destinationsCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg ml-[-71px] mr-[-71px] pl-[22px] pr-[22px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getLocalizedText(section.hotelsLabel || 'Hotels', section.hotelsLabelAr || 'الفنادق')}</p>
                        <p className="text-lg font-bold text-gray-900">{section.hotelsCount}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className={`${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold leading-tight mb-4">
                  {getLocalizedText(section.title, section.titleAr)}
                </h2>
                
                {section.subtitle && (
                  <p className="text-xl text-gray-600 mb-6">
                    {getLocalizedText(section.subtitle, section.subtitleAr)}
                  </p>
                )}
                
                {section.description && (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {getLocalizedText(section.description, section.descriptionAr)}
                  </p>
                )}
              </div>

              {/* Features Section */}
              {section.showFeatures && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Display dynamic features from the features JSONB column */}
                  {section.features && section.features.length > 0 ? (
                    section.features.map((feature, index) => (
                      <Card key={index} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {getIcon(feature.icon)}
                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                {getLocalizedText(feature.title, feature.titleAr)}
                              </h3>
                              <p className="text-gray-600">
                                {getLocalizedText(feature.description, feature.descriptionAr)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    /* Fallback to legacy features if no dynamic features exist */
                    <>
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {getIcon(section.feature1Icon || 'calendar')}
                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                {getLocalizedText(section.feature1Title || 'Flexible Booking', section.feature1TitleAr)}
                              </h3>
                              <p className="text-gray-600">
                                {getLocalizedText(section.feature1Description || 'Free cancellation options available', section.feature1DescriptionAr)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {getIcon(section.feature2Icon || 'user-check')}
                            <div>
                              <h3 className="font-semibold text-lg mb-2">
                                {getLocalizedText(section.feature2Title || 'Expert Guides', section.feature2TitleAr)}
                              </h3>
                              <p className="text-gray-600">
                                {getLocalizedText(section.feature2Description || 'Local, knowledgeable tour guides', section.feature2DescriptionAr)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}

              {/* Call to Action Button */}
              {section.buttonText && section.buttonLink && (
                <div className="pt-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
                  >
                    <a href={section.buttonLink} className="flex items-center gap-2">
                      {getLocalizedText(section.buttonText, section.buttonTextAr)}
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicHomepageSection;