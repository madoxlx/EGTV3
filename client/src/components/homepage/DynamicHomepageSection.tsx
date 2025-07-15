import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { Calendar, UserCheck, ChevronRight } from 'lucide-react';

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
}

interface DynamicHomepageSectionProps {
  section: HomepageSection;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  calendar: Calendar,
  'user-check': UserCheck,
  'chevron-right': ChevronRight,
};

const DynamicHomepageSection: React.FC<DynamicHomepageSectionProps> = ({ section }) => {
  const { t, currentLanguage, isRTL } = useLanguage();
  
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Calendar;
    return <IconComponent className="w-5 h-5 text-blue-600" />;
  };

  const getLocalizedText = (enText: string, arText?: string) => {
    return currentLanguage === 'ar' && arText ? arText : enText;
  };

  const isImageLeft = section.imagePosition === 'left';
  const backgroundColor = section.backgroundColor || 'white';
  const textColor = section.textColor || 'black';

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
                        <p className="text-sm font-medium text-gray-900">{t('homepage.tourists', 'Tourists')}</p>
                        <p className="text-lg font-bold text-gray-900">{section.touristsCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('homepage.destinations', 'Destinations')}</p>
                        <p className="text-lg font-bold text-gray-900">{section.destinationsCount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg ml-[-71px] mr-[-71px] pl-[22px] pr-[22px]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t('homepage.hotels', 'Hotels')}</p>
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
                <h2 className="text-4xl font-bold leading-tight mb-4 text-[#000000]">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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