import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  UserCheck, 
  Star, 
  Layout,
  Globe,
  Languages,
  Settings,
  Award,
  Image,
  Users,
  Target,
  ShieldCheck,
  DollarSign,
  Clock,
  Heart,
  Zap,
  CheckCircle,
  Gift,
  MapPin,
  Headphones,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/hooks/use-language';

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
  touristsLabel?: string;
  destinationsLabel?: string;
  hotelsLabel?: string;
  touristsLabelAr?: string;
  destinationsLabelAr?: string;
  hotelsLabelAr?: string;
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

const iconOptions = [
  { value: 'calendar', label: 'Calendar', icon: Calendar },
  { value: 'user-check', label: 'User Check', icon: UserCheck },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'globe', label: 'Globe', icon: Globe },
  { value: 'layout', label: 'Layout', icon: Layout },
  { value: 'shield-check', label: 'Shield Check', icon: ShieldCheck },
  { value: 'dollar-sign', label: 'Dollar Sign', icon: DollarSign },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'check-circle', label: 'Check Circle', icon: CheckCircle },
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'map-pin', label: 'Map Pin', icon: MapPin },
  { value: 'headphones', label: 'Headphones', icon: Headphones },
  { value: 'thumbs-up', label: 'Thumbs Up', icon: ThumbsUp },
];

// Section type templates
const sectionTypeTemplates = {
  'why-choose-us': {
    title: 'Why Choose Egypt Express TVL',
    subtitle: 'Your Trusted Travel Partner',
    description: 'Experience the best of Egypt with our expert guides and premium services. We offer unmatched value and unforgettable memories.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    buttonText: 'Discover More',
    buttonLink: '/about',
    showStatistics: true,
    showFeatures: true,
    feature1Title: 'Expert Local Guides',
    feature1Description: 'Professional guides with deep local knowledge',
    feature1Icon: 'user-check',
    feature2Title: 'Premium Service',
    feature2Description: '24/7 customer support and quality assurance',
    feature2Icon: 'star',
    imagePosition: 'left' as const,
    backgroundColor: 'white',
    textColor: 'black',
  },
  'image-captions': {
    title: 'Discover Egypt\'s Wonders',
    subtitle: 'Ancient History Meets Modern Luxury',
    description: 'Explore magnificent temples, sail the legendary Nile River, and experience the vibrant culture of Egypt with our carefully curated travel experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    buttonText: 'View Gallery',
    buttonLink: '/gallery',
    showStatistics: false,
    showFeatures: false,
    feature1Title: '',
    feature1Description: '',
    feature1Icon: 'image',
    feature2Title: '',
    feature2Description: '',
    feature2Icon: 'eye',
    imagePosition: 'right' as const,
    backgroundColor: 'gray-50',
    textColor: 'black',
  }
};

const HomepageSectionsManagement: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSectionTypeDialogOpen, setIsSectionTypeDialogOpen] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<'why-choose-us' | 'image-captions' | null>(null);
  const [isWhyChooseUsFormOpen, setIsWhyChooseUsFormOpen] = useState(false);
  const [sectionHeading, setSectionHeading] = useState({
    title: 'Why Choose Egypt Express TVL',
    titleAr: 'لماذا تختار إيجيبت إكسبريس تي في إل'
  });

  const [mainFeatures, setMainFeatures] = useState<Array<{
    title: string;
    titleAr?: string;
    icon: string;
    subFeatures: Array<{
      title: string;
      titleAr?: string;
      icon: string;
    }>;
  }>>([
    {
      title: 'Premium Services',
      titleAr: 'خدمات مميزة',
      icon: 'star',
      subFeatures: [
        { title: 'Luxury Accommodation', titleAr: 'إقامة فاخرة', icon: 'heart' },
        { title: 'Private Transportation', titleAr: 'نقل خاص', icon: 'zap' },
        { title: 'Expert Guides', titleAr: 'مرشدين خبراء', icon: 'user-check' }
      ]
    },
    {
      title: 'Best Value',
      titleAr: 'أفضل قيمة',
      icon: 'dollar-sign',
      subFeatures: [
        { title: 'Competitive Pricing', titleAr: 'أسعار تنافسية', icon: 'check-circle' },
        { title: 'No Hidden Fees', titleAr: 'لا رسوم مخفية', icon: 'shield-check' },
        { title: 'Best Deals', titleAr: 'أفضل الصفقات', icon: 'gift' }
      ]
    },
    {
      title: '24/7 Support',
      titleAr: 'دعم على مدار الساعة',
      icon: 'headphones',
      subFeatures: [
        { title: 'Customer Service', titleAr: 'خدمة العملاء', icon: 'users' },
        { title: 'Emergency Support', titleAr: 'دعم الطوارئ', icon: 'clock' },
        { title: 'Travel Assistance', titleAr: 'مساعدة السفر', icon: 'map-pin' }
      ]
    }
  ]);
  const [formData, setFormData] = useState<Partial<HomepageSection>>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    touristsCount: '5000+',
    destinationsCount: '300+',
    hotelsCount: '150+',
    touristsLabel: 'Tourists',
    destinationsLabel: 'Destinations',
    hotelsLabel: 'Hotels',
    touristsLabelAr: 'السياح',
    destinationsLabelAr: 'الوجهات',
    hotelsLabelAr: 'الفنادق',
    feature1Title: 'Flexible Booking',
    feature1Description: 'Free cancellation options available',
    feature1Icon: 'calendar',
    feature2Title: 'Expert Guides',
    feature2Description: 'Local, knowledgeable tour guides',
    feature2Icon: 'user-check',
    order: 0,
    active: true,
    showStatistics: true,
    showFeatures: true,
    imagePosition: 'left',
    backgroundColor: 'white',
    textColor: 'black',
  });

  // Fetch homepage sections
  const { data: sections = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/homepage-sections'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-sections');
      if (!response.ok) throw new Error('Failed to fetch homepage sections');
      return response.json();
    },
  });

  // Create section mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<HomepageSection>) => {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-sections'] });
      toast({ title: 'Success', description: 'Homepage section created successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to create homepage section', variant: 'destructive' });
    },
  });

  // Update section mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HomepageSection> }) => {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update section');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-sections'] });
      toast({ title: 'Success', description: 'Homepage section updated successfully' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update homepage section', variant: 'destructive' });
    },
  });

  // Delete section mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete section');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-sections'] });
      toast({ title: 'Success', description: 'Homepage section deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete homepage section', variant: 'destructive' });
    },
  });

  const resetForm = (sectionType?: 'why-choose-us' | 'image-captions') => {
    const baseData = {
      touristsCount: '5000+',
      destinationsCount: '300+',
      hotelsCount: '150+',
      touristsLabel: 'Tourists',
      destinationsLabel: 'Destinations',
      hotelsLabel: 'Hotels',
      touristsLabelAr: 'السياح',
      destinationsLabelAr: 'الوجهات',
      hotelsLabelAr: 'الفنادق',
      order: 0,
      active: true,
      titleAr: '',
      subtitleAr: '',
      descriptionAr: '',
      buttonTextAr: '',
      feature1TitleAr: '',
      feature1DescriptionAr: '',
      feature2TitleAr: '',
      feature2DescriptionAr: '',
    };

    if (sectionType && sectionTypeTemplates[sectionType]) {
      setFormData({
        ...baseData,
        ...sectionTypeTemplates[sectionType],
      });
    } else {
      setFormData({
        ...baseData,
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
        feature1Title: 'Flexible Booking',
        feature1Description: 'Free cancellation options available',
        feature1Icon: 'calendar',
        feature2Title: 'Expert Guides',
        feature2Description: 'Local, knowledgeable tour guides',
        feature2Icon: 'user-check',
        showStatistics: true,
        showFeatures: true,
        imagePosition: 'left',
        backgroundColor: 'white',
        textColor: 'black',
      });
    }
    
    setIsEditing(false);
    setSelectedSection(null);
    setSelectedSectionType(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({ title: 'Error', description: 'Title and image URL are required', variant: 'destructive' });
      return;
    }

    if (isEditing && selectedSection) {
      updateMutation.mutate({ id: selectedSection.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setSelectedSection(section);
    setFormData(section);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCreate = () => {
    setIsSectionTypeDialogOpen(true);
  };

  const handleSectionTypeSelect = (sectionType: 'why-choose-us' | 'image-captions') => {
    setSelectedSectionType(sectionType);
    setIsSectionTypeDialogOpen(false);
    
    if (sectionType === 'why-choose-us') {
      // Reset to the default structure when opening the form
      setMainFeatures([
        {
          title: 'Tailored and Reliable Service',
          titleAr: 'خدمة مخصصة وموثوقة',
          icon: 'shield',
          subFeatures: [
            { title: 'Customized Travel', titleAr: 'سفر مخصص', icon: 'heart' },
            { title: 'Timely Transfers', titleAr: 'نقل في الوقت المناسب', icon: 'zap' },
            { title: 'Seamless Plans', titleAr: 'خطط سلسة', icon: 'check-circle' }
          ]
        },
        {
          title: 'Exceptional Expertise and Comfort',
          titleAr: 'خبرة استثنائية وراحة',
          icon: 'users',
          subFeatures: [
            { title: 'Expert Guides', titleAr: 'مرشدين خبراء', icon: 'user-check' },
            { title: 'Skilled Drivers', titleAr: 'سائقين ماهرين', icon: 'zap' },
            { title: 'Reliable Vehicles', titleAr: 'مركبات موثوقة', icon: 'shield-check' }
          ]
        },
        {
          title: 'Transparent and Competitive Pricing',
          titleAr: 'أسعار شفافة وتنافسية',
          icon: 'dollar-sign',
          subFeatures: [
            { title: 'Premium Services', titleAr: 'خدمات مميزة', icon: 'star' },
            { title: 'Fair Rates', titleAr: 'أسعار عادلة', icon: 'check-circle' },
            { title: 'Stress-free Journey', titleAr: 'رحلة خالية من التوتر', icon: 'heart' }
          ]
        }
      ]);
      // Open the special Why Choose Us form
      setIsWhyChooseUsFormOpen(true);
    } else {
      // Use the regular form for other section types
      resetForm(sectionType);
      setIsDialogOpen(true);
    }
  };

  const handleMainFeatureChange = (index: number, field: string, value: string) => {
    const updatedFeatures = [...mainFeatures];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setMainFeatures(updatedFeatures);
  };

  const handleSubFeatureChange = (mainIndex: number, subIndex: number, field: string, value: string) => {
    const updatedFeatures = [...mainFeatures];
    updatedFeatures[mainIndex].subFeatures[subIndex] = { 
      ...updatedFeatures[mainIndex].subFeatures[subIndex], 
      [field]: value 
    };
    setMainFeatures(updatedFeatures);
  };

  const handleHeadingChange = (field: string, value: string) => {
    setSectionHeading({ ...sectionHeading, [field]: value });
  };

  const handleSubmitWhyChooseUs = () => {
    // Create a section with hierarchical features stored in the features JSONB column
    const whyChooseUsData = {
      title: sectionHeading.title,
      subtitle: 'Your Trusted Travel Partner',
      description: 'Experience the best of Egypt with our expert guides and premium services. We offer unmatched value and unforgettable memories.',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
      buttonText: 'Discover More',
      buttonLink: '/about',
      touristsCount: '5000+',
      destinationsCount: '300+',
      hotelsCount: '150+',
      touristsLabel: 'Tourists',
      destinationsLabel: 'Destinations',
      hotelsLabel: 'Hotels',
      touristsLabelAr: 'السياح',
      destinationsLabelAr: 'الوجهات',
      hotelsLabelAr: 'الفنادق',
      showStatistics: true,
      showFeatures: true,
      imagePosition: 'left',
      backgroundColor: 'white',
      textColor: 'black',
      order: 0,
      active: true,
      titleAr: sectionHeading.titleAr,
      subtitleAr: 'شريكك الموثوق في السفر',
      descriptionAr: 'استمتع بأفضل ما في مصر مع مرشدينا الخبراء وخدماتنا المميزة. نقدم قيمة لا مثيل لها وذكريات لا تُنسى.',
      buttonTextAr: 'اكتشف المزيد',
      // Store the hierarchical features in the features JSONB column
      features: mainFeatures
    };

    createMutation.mutate(whyChooseUsData);
    setIsWhyChooseUsFormOpen(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading homepage sections...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.homepage_sections.title', 'Homepage Sections Management')}</h1>
            <p className="text-gray-600 mt-1">{t('admin.homepage_sections.description', 'Create and manage dynamic homepage content sections')}</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('admin.homepage_sections.create', 'Add Section')}
          </Button>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section: HomepageSection) => (
            <Card key={section.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate">{section.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {section.subtitle || section.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={section.active ? 'default' : 'secondary'}>
                      {section.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Check if this is a Why Choose Us section */}
                  {section.features && section.features.length > 0 && section.features.some(f => f.subFeatures) ? (
                    /* Why Choose Us Features Display */
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                      {section.features.map((feature, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                          <div className="font-medium text-sm text-blue-900">{feature.title}</div>
                          {feature.subFeatures && feature.subFeatures.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {feature.subFeatures.map((subFeature, subIndex) => (
                                <div key={subIndex} className="text-xs text-gray-600 ml-2">
                                  • {subFeature.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Regular Section Image Preview */
                    <>
                      {section.imageUrl && (
                        <div className="relative">
                          <img 
                            src={section.imageUrl} 
                            alt={section.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {section.imagePosition === 'left' ? 'Left' : 'Right'}
                          </div>
                        </div>
                      )}

                      {/* Features */}
                      <div className="flex items-center gap-2 text-sm">
                        {section.showStatistics && (
                          <Badge variant="outline" className="text-xs">Statistics</Badge>
                        )}
                        {section.showFeatures && (
                          <Badge variant="outline" className="text-xs">Features</Badge>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-500">Order: {section.order}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{section.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(section.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Homepage Section' : 'Create Homepage Section'}
              </DialogTitle>
              <DialogDescription>
                Configure the content and settings for your homepage section. Fill in the required fields and customize the appearance.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="arabic">Arabic</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Enter section subtitle"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter section description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Enter button text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                      id="buttonLink"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="Enter button link"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="touristsCount">Tourists Count</Label>
                    <Input
                      id="touristsCount"
                      value={formData.touristsCount}
                      onChange={(e) => setFormData({ ...formData, touristsCount: e.target.value })}
                      placeholder="e.g., 5000+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationsCount">Destinations Count</Label>
                    <Input
                      id="destinationsCount"
                      value={formData.destinationsCount}
                      onChange={(e) => setFormData({ ...formData, destinationsCount: e.target.value })}
                      placeholder="e.g., 300+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hotelsCount">Hotels Count</Label>
                    <Input
                      id="hotelsCount"
                      value={formData.hotelsCount}
                      onChange={(e) => setFormData({ ...formData, hotelsCount: e.target.value })}
                      placeholder="e.g., 150+"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Statistics Labels (English)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="touristsLabel" className="text-[#000000] hover:text-[#000000]">Tourists Label</Label>
                      <Input
                        id="touristsLabel"
                        value={formData.touristsLabel}
                        onChange={(e) => setFormData({ ...formData, touristsLabel: e.target.value })}
                        placeholder="e.g., Tourists"
                      />
                    </div>
                    <div>
                      <Label htmlFor="destinationsLabel" className="text-[#000000] hover:text-[#000000]">Destinations Label</Label>
                      <Input
                        id="destinationsLabel"
                        value={formData.destinationsLabel}
                        onChange={(e) => setFormData({ ...formData, destinationsLabel: e.target.value })}
                        placeholder="e.g., Destinations"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hotelsLabel" className="text-[#000000] hover:text-[#000000]">Hotels Label</Label>
                      <Input
                        id="hotelsLabel"
                        value={formData.hotelsLabel}
                        onChange={(e) => setFormData({ ...formData, hotelsLabel: e.target.value })}
                        placeholder="e.g., Hotels"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Statistics Labels (Arabic)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="touristsLabelAr" className="text-[#000000] hover:text-[#000000]">Tourists Label (Arabic)</Label>
                      <Input
                        id="touristsLabelAr"
                        value={formData.touristsLabelAr}
                        onChange={(e) => setFormData({ ...formData, touristsLabelAr: e.target.value })}
                        placeholder="مثال: السياح"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="destinationsLabelAr" className="text-[#000000] hover:text-[#000000]">Destinations Label (Arabic)</Label>
                      <Input
                        id="destinationsLabelAr"
                        value={formData.destinationsLabelAr}
                        onChange={(e) => setFormData({ ...formData, destinationsLabelAr: e.target.value })}
                        placeholder="مثال: الوجهات"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hotelsLabelAr" className="text-[#000000] hover:text-[#000000]">Hotels Label (Arabic)</Label>
                      <Input
                        id="hotelsLabelAr"
                        value={formData.hotelsLabelAr}
                        onChange={(e) => setFormData({ ...formData, hotelsLabelAr: e.target.value })}
                        placeholder="مثال: الفنادق"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Feature 1</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="feature1Title">Feature 1 Title</Label>
                      <Input
                        id="feature1Title"
                        value={formData.feature1Title}
                        onChange={(e) => setFormData({ ...formData, feature1Title: e.target.value })}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature1Description">Feature 1 Description</Label>
                      <Input
                        id="feature1Description"
                        value={formData.feature1Description}
                        onChange={(e) => setFormData({ ...formData, feature1Description: e.target.value })}
                        placeholder="Feature description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature1Icon">Feature 1 Icon</Label>
                      <Select
                        value={formData.feature1Icon}
                        onValueChange={(value) => setFormData({ ...formData, feature1Icon: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <icon.icon className="w-4 h-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Feature 2</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="feature2Title">Feature 2 Title</Label>
                      <Input
                        id="feature2Title"
                        value={formData.feature2Title}
                        onChange={(e) => setFormData({ ...formData, feature2Title: e.target.value })}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature2Description">Feature 2 Description</Label>
                      <Input
                        id="feature2Description"
                        value={formData.feature2Description}
                        onChange={(e) => setFormData({ ...formData, feature2Description: e.target.value })}
                        placeholder="Feature description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="feature2Icon">Feature 2 Icon</Label>
                      <Select
                        value={formData.feature2Icon}
                        onValueChange={(value) => setFormData({ ...formData, feature2Icon: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <icon.icon className="w-4 h-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="arabic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleAr">Title (Arabic)</Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="العنوان باللغة العربية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitleAr">Subtitle (Arabic)</Label>
                    <Input
                      id="subtitleAr"
                      value={formData.subtitleAr}
                      onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })}
                      placeholder="العنوان الفرعي باللغة العربية"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="الوصف باللغة العربية"
                    dir="rtl"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="buttonTextAr">Button Text (Arabic)</Label>
                  <Input
                    id="buttonTextAr"
                    value={formData.buttonTextAr}
                    onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })}
                    placeholder="نص الزر باللغة العربية"
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature1TitleAr">Feature 1 Title (Arabic)</Label>
                    <Input
                      id="feature1TitleAr"
                      value={formData.feature1TitleAr}
                      onChange={(e) => setFormData({ ...formData, feature1TitleAr: e.target.value })}
                      placeholder="عنوان الميزة الأولى"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature1DescriptionAr">Feature 1 Description (Arabic)</Label>
                    <Input
                      id="feature1DescriptionAr"
                      value={formData.feature1DescriptionAr}
                      onChange={(e) => setFormData({ ...formData, feature1DescriptionAr: e.target.value })}
                      placeholder="وصف الميزة الأولى"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feature2TitleAr">Feature 2 Title (Arabic)</Label>
                    <Input
                      id="feature2TitleAr"
                      value={formData.feature2TitleAr}
                      onChange={(e) => setFormData({ ...formData, feature2TitleAr: e.target.value })}
                      placeholder="عنوان الميزة الثانية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feature2DescriptionAr">Feature 2 Description (Arabic)</Label>
                    <Input
                      id="feature2DescriptionAr"
                      value={formData.feature2DescriptionAr}
                      onChange={(e) => setFormData({ ...formData, feature2DescriptionAr: e.target.value })}
                      placeholder="وصف الميزة الثانية"
                      dir="rtl"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imagePosition">Image Position</Label>
                    <Select
                      value={formData.imagePosition}
                      onValueChange={(value) => setFormData({ ...formData, imagePosition: value as 'left' | 'right' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Select
                      value={formData.backgroundColor}
                      onValueChange={(value) => setFormData({ ...formData, backgroundColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select background" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <Select
                      value={formData.textColor}
                      onValueChange={(value) => setFormData({ ...formData, textColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select text color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showStatistics"
                      checked={formData.showStatistics}
                      onCheckedChange={(checked) => setFormData({ ...formData, showStatistics: checked })}
                    />
                    <Label htmlFor="showStatistics">Show Statistics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showFeatures"
                      checked={formData.showFeatures}
                      onCheckedChange={(checked) => setFormData({ ...formData, showFeatures: checked })}
                    />
                    <Label htmlFor="showFeatures">Show Features</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Section Type Selection Dialog */}
        <Dialog open={isSectionTypeDialogOpen} onOpenChange={setIsSectionTypeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose Section Type</DialogTitle>
              <DialogDescription>
                Select the type of homepage section you want to create. Each type comes with optimized templates and features.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              {/* Why Choose Us Section */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500"
                onClick={() => handleSectionTypeSelect('why-choose-us')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Why Choose Us</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Perfect for highlighting your company's unique value propositions and competitive advantages.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Statistics display (tourists, destinations, hotels)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-500" />
                      <span>Feature highlights with icons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span>Trust-building content</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image and Captions Section */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-500"
                onClick={() => handleSectionTypeSelect('image-captions')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Image & Captions</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Ideal for showcasing destinations, experiences, or visual storytelling with compelling imagery.
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-green-500" />
                      <span>Visual-focused layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span>Clean, caption-style presentation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-green-500" />
                      <span>Gallery or showcase oriented</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setIsSectionTypeDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Why Choose Us Form Dialog */}
        <Dialog open={isWhyChooseUsFormOpen} onOpenChange={setIsWhyChooseUsFormOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Why Choose Us Section</DialogTitle>
              <DialogDescription>
                Create a section with a heading and 3 main features, each having 3 sub-features underneath.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Section Heading */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Section Heading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>English Title *</Label>
                    <Input
                      value={sectionHeading.title}
                      onChange={(e) => handleHeadingChange('title', e.target.value)}
                      placeholder="Section heading in English"
                    />
                  </div>
                  <div>
                    <Label>Arabic Title</Label>
                    <Input
                      value={sectionHeading.titleAr || ''}
                      onChange={(e) => handleHeadingChange('titleAr', e.target.value)}
                      placeholder="عنوان القسم بالعربية"
                      dir="rtl"
                    />
                  </div>
                </div>
              </Card>

              {/* Main Features (3 features, each with 3 sub-features) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Main Features</h3>
                
                <div className="space-y-6">
                  {mainFeatures.map((feature, mainIndex) => (
                    <Card key={mainIndex} className="p-4">
                      <div className="space-y-4">
                        {/* Main Feature Header */}
                        <div className="border-b pb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>English Title *</Label>
                              <Input
                                value={feature.title}
                                onChange={(e) => handleMainFeatureChange(mainIndex, 'title', e.target.value)}
                                placeholder="Main feature title"
                              />
                            </div>
                            <div>
                              <Label>Arabic Title</Label>
                              <Input
                                value={feature.titleAr || ''}
                                onChange={(e) => handleMainFeatureChange(mainIndex, 'titleAr', e.target.value)}
                                placeholder="عنوان الميزة الرئيسية"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <Label>Icon</Label>
                              <Select
                                value={feature.icon}
                                onValueChange={(value) => handleMainFeatureChange(mainIndex, 'icon', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select icon" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {iconOptions.map((icon) => (
                                    <SelectItem key={icon.value} value={icon.value}>
                                      <div className="flex items-center gap-2">
                                        <icon.icon className="w-4 h-4" />
                                        {icon.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Sub-features */}
                        <div className="pl-4">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Sub-features</Label>
                          <div className="space-y-3">
                            {feature.subFeatures.map((subFeature, subIndex) => (
                              <div key={subIndex} className="bg-gray-50 p-3 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">English Title *</Label>
                                    <Input
                                      value={subFeature.title}
                                      onChange={(e) => handleSubFeatureChange(mainIndex, subIndex, 'title', e.target.value)}
                                      placeholder="Sub-feature title"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Arabic Title</Label>
                                    <Input
                                      value={subFeature.titleAr || ''}
                                      onChange={(e) => handleSubFeatureChange(mainIndex, subIndex, 'titleAr', e.target.value)}
                                      placeholder="عنوان الميزة الفرعية"
                                      dir="rtl"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Icon</Label>
                                    <Select
                                      value={subFeature.icon}
                                      onValueChange={(value) => handleSubFeatureChange(mainIndex, subIndex, 'icon', value)}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Select icon" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-60">
                                        {iconOptions.map((icon) => (
                                          <SelectItem key={icon.value} value={icon.value}>
                                            <div className="flex items-center gap-2">
                                              <icon.icon className="w-3 h-3" />
                                              {icon.label}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsWhyChooseUsFormOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitWhyChooseUs}
                disabled={createMutation.isPending || mainFeatures.length === 0}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Section'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default HomepageSectionsManagement;