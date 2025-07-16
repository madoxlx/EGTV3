import React from "react";
import { useQuery } from "@tanstack/react-query";
import { HeroSlider } from "@/components/HeroSlider";
import BookingTabs from "@/components/BookingTabs";
import FeaturedOffers from "@/components/FeaturedOffers";

import ExploreSection from "@/components/ExploreSection";
import RecommendedDestinations from "@/components/RecommendedDestinations";
import PopularPackages from "@/components/PopularPackages";
import SocialMediaBox from "@/components/SocialMediaBox";
import DynamicHomepageSection from "@/components/homepage/DynamicHomepageSection";
import { useLanguage } from "@/hooks/use-language";

const Home: React.FC = () => {
  const { t, isRTL } = useLanguage();
  
  // Fetch active homepage sections
  const { data: homepageSections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['/api/homepage-sections'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-sections?active=true');
      if (!response.ok) throw new Error('Failed to fetch homepage sections');
      return response.json();
    },
  });
  
  return (
    <div className={isRTL ? 'font-arabic' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
      <HeroSlider />
      <BookingTabs />
      <FeaturedOffers />
      <ExploreSection />
      <RecommendedDestinations />
      <PopularPackages />
      
      {/* Dynamic Homepage Sections */}
      {!sectionsLoading && homepageSections.length > 0 && (
        <div className="dynamic-homepage-sections">
          {homepageSections.map((section: any) => (
            <DynamicHomepageSection key={section.id} section={section} />
          ))}
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="my-12">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t('home.social.title', 'Connect With Us')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-4">
              <div className="bg-neutral-100 rounded-xl p-8 h-full">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">
                    {t('home.social.subtitle', 'Follow Our Adventures')}
                  </h3>
                  <p className="text-neutral-600">
                    {t('home.social.description', 'Join us on social media for travel tips, exclusive offers and stunning destinations')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
