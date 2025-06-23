import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Ticket as Tickets,
  Globe as GlobeIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  Download as DownloadIcon,
  ArrowRight as ArrowRightIcon,
  AlertCircle as AlertCircleIcon,
  Check as CheckIcon,
  FileText as FileTextIcon
} from 'lucide-react';

// Create a CustomDocumentIcon since it's not in lucide-react
const CustomDocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const VisasSearchResults: React.FC = () => {
  const [selectedNationality, setSelectedNationality] = useState('egyptian');
  const [filterOnline, setFilterOnline] = useState(true);
  const [filterOnArrival, setFilterOnArrival] = useState(true);
  const [filterEmbassy, setFilterEmbassy] = useState(true);

  // Fetch visas from API
  const { data: visas = [], isLoading, error } = useQuery({
    queryKey: ['/api/visas'],
    queryFn: async () => {
      const response = await fetch('/api/visas');
      if (!response.ok) {
        throw new Error('Failed to fetch visas');
      }
      return response.json();
    },
  });

  // Fetch countries to get country names
  const { data: countries = [] } = useQuery({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      return response.json();
    },
  });

  // Transform visa data to match the component's expected format
  const transformedVisas = visas.map((visa: any) => {
    const country = countries.find((c: any) => c.id === visa.targetCountryId);
    return {
      id: visa.id,
      country: country?.name || 'Unknown',
      visaType: visa.title,
      validityDuration: visa.validityPeriod,
      price: visa.price,
      currency: 'EGP',
      processingTime: visa.processingTime,
      requirements: [
        'Valid passport with at least 6 months validity',
        'Return flight ticket',
        'Hotel reservation or accommodation proof',
        'Proof of sufficient funds',
        'Passport-sized photo'
      ],
      online: true,
      onArrival: visa.entryType?.toLowerCase().includes('arrival') || false,
      embassy: true,
      urgent: true,
      urgentProcessingTime: '1-2 working days',
      urgentPrice: visa.price * 2,
      description: visa.description
    };
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Visa Search Results</h1>
          <p className="text-lg text-muted-foreground">
            Egypt Visas - For travelers from the United States
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filter Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Passenger Nationality</h3>
                  <div className="space-y-2">
                    <select 
                      className="w-full p-2 border rounded" 
                      value={selectedNationality}
                      onChange={(e) => setSelectedNationality(e.target.value)}
                    >
                      <option value="egyptian">Egyptian</option>
                      <option value="saudi">Saudi</option>
                      <option value="emirati">Emirati</option>
                      <option value="jordanian">Jordanian</option>
                      <option value="lebanese">Lebanese</option>
                      <option value="american">American</option>
                      <option value="british">British</option>
                    </select>
                  </div>
                </div>

                <Separator />



                <div>
                  <h3 className="font-medium mb-2">Application Method</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="online" 
                        className="mr-2" 
                        checked={filterOnline}
                        onChange={(e) => setFilterOnline(e.target.checked)}
                      />
                      <label htmlFor="online">Online Application</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="arrival" 
                        className="mr-2" 
                        checked={filterOnArrival}
                        onChange={(e) => setFilterOnArrival(e.target.checked)}
                      />
                      <label htmlFor="arrival">Visa on Arrival</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="embassy" 
                        className="mr-2" 
                        checked={filterEmbassy}
                        onChange={(e) => setFilterEmbassy(e.target.checked)}
                      />
                      <label htmlFor="embassy">Embassy Application</label>
                    </div>
                  </div>
                </div>

                <Separator />



                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
            
            {/* Visa Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <InfoIcon className="mr-2" size={18} />
                  Visa Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Our visa services help you navigate the complex visa application process
                  with expert guidance and support.
                </p>
                <div className="flex items-start">
                  <CheckIcon className="text-green-600 mr-2 mt-1 flex-shrink-0" size={16} />
                  <p>All applications reviewed by visa experts</p>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="text-green-600 mr-2 mt-1 flex-shrink-0" size={16} />
                  <p>Secure document handling and submission</p>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="text-green-600 mr-2 mt-1 flex-shrink-0" size={16} />
                  <p>24/7 application status tracking</p>
                </div>
                <div className="flex items-start">
                  <CheckIcon className="text-green-600 mr-2 mt-1 flex-shrink-0" size={16} />
                  <p>Assistance with document preparation</p>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-100 rounded-md">
                  <div className="flex items-start">
                    <AlertCircleIcon className="text-yellow-600 mr-2 mt-1 flex-shrink-0" size={16} />
                    <p className="text-yellow-800">
                      Visa requirements and prices may change. Always check the latest information before applying.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visa results */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Unable to load visa information</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : transformedVisas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No visa options found for your criteria</p>
              </div>
            ) : (
              transformedVisas.map((visa: any) => (
              <Card key={visa.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <GlobeIcon className="mr-2" size={18} />
                        <CardTitle>{visa.country} - {visa.visaType}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        {visa.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Valid for {visa.validityDuration}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium mb-2">Application Methods</h3>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          {visa.online ? (
                            <CheckCircleIcon className="mr-2 text-green-600" size={16} />
                          ) : (
                            <XCircleIcon className="mr-2 text-red-600" size={16} />
                          )}
                          <span>Online Application</span>
                        </div>
                        <div className="flex items-center">
                          {visa.onArrival ? (
                            <CheckCircleIcon className="mr-2 text-green-600" size={16} />
                          ) : (
                            <XCircleIcon className="mr-2 text-red-600" size={16} />
                          )}
                          <span>Visa on Arrival</span>
                        </div>
                        <div className="flex items-center">
                          {visa.embassy ? (
                            <CheckCircleIcon className="mr-2 text-green-600" size={16} />
                          ) : (
                            <XCircleIcon className="mr-2 text-red-600" size={16} />
                          )}
                          <span>Embassy Application</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Processing Time</h3>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <ClockIcon className="mr-2 text-muted-foreground" size={16} />
                          <span>Standard: {visa.processingTime}</span>
                        </div>
                        {visa.urgent && (
                          <div className="flex items-center">
                            <ClockIcon className="mr-2 text-orange-500" size={16} />
                            <span>Urgent: {visa.urgentProcessingTime}</span>
                            <Badge className="ml-2 bg-orange-100 text-orange-800 hover:bg-orange-100">
                              +{visa.currency} {visa.urgentPrice - visa.price}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Required Documents</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      {visa.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                
                <div className="bg-muted/20 p-4 flex flex-col md:flex-row justify-between items-center">
                  <div className="flex flex-col mb-4 md:mb-0">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">{visa.currency} {visa.price}</span>
                      <Badge className="ml-2" variant="outline">Standard</Badge>
                    </div>
                    {visa.urgent && (
                      <div className="flex items-center mt-1">
                        <span className="text-lg font-medium">{visa.currency} {visa.urgentPrice}</span>
                        <Badge className="ml-2 bg-orange-100 text-orange-800 border-orange-200">Urgent</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex items-center">
                      <FileTextIcon className="mr-2" size={16} />
                      Details
                    </Button>
                    <Button className="flex items-center">
                      <ArrowRightIcon className="mr-2" size={16} />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisasSearchResults;