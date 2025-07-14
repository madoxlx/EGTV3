import React from 'react';
import { Link } from 'wouter';
import { 
  Plane, 
  Hotel, 
  Map, 
  Camera,
  Car,
  Passport,
  Shield,
  Users,
  Clock,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';

const AllServices: React.FC = () => {
  const { t, isRTL } = useLanguage();

  const services = [
    {
      id: 1,
      title: 'Flight Booking',
      titleAr: 'حجز الطيران',
      description: 'Book domestic and international flights with the best prices and flexible schedules',
      descriptionAr: 'احجز الرحلات الداخلية والدولية بأفضل الأسعار والجداول المرنة',
      icon: Plane,
      color: 'bg-blue-500',
      features: [
        'Domestic & International Flights',
        'Best Price Guarantee',
        'Flexible Booking Options',
        '24/7 Customer Support'
      ],
      featuresAr: [
        'الرحلات الداخلية والدولية',
        'ضمان أفضل الأسعار',
        'خيارات حجز مرنة',
        'دعم العملاء على مدار الساعة'
      ],
      link: '/flights'
    },
    {
      id: 2,
      title: 'Hotel Reservations',
      titleAr: 'حجز الفنادق',
      description: 'Premium hotel bookings from budget stays to luxury resorts across the Middle East',
      descriptionAr: 'حجوزات فنادق فاخرة من الإقامات الاقتصادية إلى المنتجعات الفاخرة في الشرق الأوسط',
      icon: Hotel,
      color: 'bg-green-500',
      features: [
        'Luxury & Budget Hotels',
        'Instant Confirmation',
        'Room Upgrades Available',
        'Free Cancellation'
      ],
      featuresAr: [
        'فنادق فاخرة واقتصادية',
        'تأكيد فوري',
        'ترقيات الغرف متاحة',
        'إلغاء مجاني'
      ],
      link: '/hotels'
    },
    {
      id: 3,
      title: 'Guided Tours',
      titleAr: 'الجولات المرشدة',
      description: 'Expertly guided tours to historical sites, cultural attractions, and hidden gems',
      descriptionAr: 'جولات مرشدة بخبرة إلى المواقع التاريخية والمعالم الثقافية والكنوز المخفية',
      icon: Map,
      color: 'bg-purple-500',
      features: [
        'Expert Local Guides',
        'Historical & Cultural Sites',
        'Small Group Tours',
        'Custom Itineraries'
      ],
      featuresAr: [
        'مرشدين محليين خبراء',
        'مواقع تاريخية وثقافية',
        'جولات مجموعات صغيرة',
        'برامج مخصصة'
      ],
      link: '/tours'
    },
    {
      id: 4,
      title: 'Travel Packages',
      titleAr: 'باقات السفر',
      description: 'Complete travel packages combining flights, hotels, tours, and activities',
      descriptionAr: 'باقات سفر كاملة تجمع بين الطيران والفنادق والجولات والأنشطة',
      icon: Camera,
      color: 'bg-orange-500',
      features: [
        'All-Inclusive Packages',
        'Customizable Itineraries',
        'Group & Individual Options',
        'Special Offers'
      ],
      featuresAr: [
        'باقات شاملة',
        'برامج قابلة للتخصيص',
        'خيارات جماعية وفردية',
        'عروض خاصة'
      ],
      link: '/packages'
    },
    {
      id: 5,
      title: 'Transportation',
      titleAr: 'النقل',
      description: 'Airport transfers, car rentals, and private transportation services',
      descriptionAr: 'نقل من المطار، تأجير السيارات، وخدمات النقل الخاص',
      icon: Car,
      color: 'bg-red-500',
      features: [
        'Airport Transfers',
        'Car Rental Services',
        'Private Drivers',
        'Group Transportation'
      ],
      featuresAr: [
        'نقل من المطار',
        'خدمات تأجير السيارات',
        'سائقين خاصين',
        'نقل جماعي'
      ],
      link: '/transportation'
    },
    {
      id: 6,
      title: 'Visa Services',
      titleAr: 'خدمات التأشيرة',
      description: 'Comprehensive visa assistance and documentation services',
      descriptionAr: 'مساعدة شاملة في التأشيرة وخدمات التوثيق',
      icon: Passport,
      color: 'bg-teal-500',
      features: [
        'Visa Applications',
        'Document Processing',
        'Travel Insurance',
        'Fast-Track Services'
      ],
      featuresAr: [
        'طلبات التأشيرة',
        'معالجة الوثائق',
        'تأمين السفر',
        'خدمات المسار السريع'
      ],
      link: '/visa'
    }
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: 'Trusted & Secure',
      titleAr: 'موثوق وآمن',
      description: 'Your safety and security are our top priorities'
    },
    {
      icon: Users,
      title: 'Expert Team',
      titleAr: 'فريق خبير',
      description: '15+ years of experience in Middle Eastern travel'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      titleAr: 'دعم على مدار الساعة',
      description: 'Round-the-clock customer support'
    },
    {
      icon: Star,
      title: 'Best Value',
      titleAr: 'أفضل قيمة',
      description: 'Competitive prices with premium quality'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isRTL ? 'جميع خدماتنا' : 'All Our Services'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {isRTL 
              ? 'اكتشف مجموعة شاملة من خدمات السفر المصممة لجعل رحلتك إلى الشرق الأوسط تجربة لا تُنسى'
              : 'Discover our comprehensive range of travel services designed to make your Middle Eastern journey unforgettable'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="px-4 py-2">
              {isRTL ? 'خدمات شاملة' : 'Complete Services'}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              {isRTL ? 'أسعار تنافسية' : 'Competitive Prices'}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              {isRTL ? 'دعم متخصص' : 'Expert Support'}
            </Badge>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {isRTL ? service.titleAr : service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {isRTL ? service.descriptionAr : service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {(isRTL ? service.featuresAr : service.features).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.link}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      {isRTL ? 'اعرف المزيد' : 'Learn More'}
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'لماذا تختار Egypt Express TVL؟' : 'Why Choose Egypt Express TVL?'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {isRTL 
                ? 'نحن نقدم خدمات سفر استثنائية مع الالتزام بالجودة والموثوقية والقيمة'
                : 'We deliver exceptional travel services with a commitment to quality, reliability, and value'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isRTL ? item.titleAr : item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {isRTL ? 'هل أنت مستعد لبدء رحلتك؟' : 'Ready to Start Your Journey?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {isRTL 
              ? 'تواصل معنا اليوم ودع خبرائنا يساعدونك في التخطيط لرحلة العمر'
              : 'Contact us today and let our experts help you plan the trip of a lifetime'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                {isRTL ? 'تصفح الباقات' : 'Browse Packages'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AllServices;