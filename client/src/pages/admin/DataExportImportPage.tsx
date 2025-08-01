import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Download, Trash2, Upload, Database, FileUp, FileDown, Sprout, Play, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/formatUtils";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/hooks/use-language";

interface ExportFile {
  name: string;
  size: number;
  created: string;
  isDirectory: boolean;
}

export default function DataExportImportPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("export");
  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);
  
  // Get list of export files
  const { data: exportsData, isLoading: isLoadingExports, refetch: refetchExports } = useQuery({
    queryKey: ['/api/admin/exports'],
    retry: 1
  });

  // Test data seeding mutation
  const seedTestDataMutation = useMutation({
    mutationFn: async () => {
      setIsSeedingData(true);
      const response = await apiRequest('/api/admin/seed-test-data', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      setIsSeedingData(false);
      toast({
        title: "Test Data Seeded Successfully",
        description: data.summary || "Comprehensive test data has been added to your platform",
      });
      
      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/countries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rooms'] });
    },
    onError: (error: Error) => {
      setIsSeedingData(false);
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed test data",
        variant: "destructive",
      });
    }
  });

  // Clear all data mutation
  const clearAllDataMutation = useMutation({
    mutationFn: async () => {
      setIsClearingData(true);
      const response = await apiRequest('/api/admin/clear-all-data', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      setIsClearingData(false);
      toast({
        title: "All Data Cleared Successfully",
        description: data.message || "All records have been removed from the database",
      });
      
      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/countries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/hotels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/packages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rooms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tours'] });
    },
    onError: (error: Error) => {
      setIsClearingData(false);
      toast({
        title: "Clear Data Failed",
        description: error.message || "Failed to clear all data",
        variant: "destructive",
      });
    }
  });
  
  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (entityType: string) => {
      setExportProgress(25);
      const result = await apiRequest(`/api/admin/export/${entityType}`, { method: 'POST' });
      setExportProgress(100);
      return result;
    },
    onSuccess: () => {
      refetchExports();
      toast({
        title: "Export successful",
        description: "The data was exported successfully.",
        variant: "default",
      });
      setExportProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: `Failed to export data: ${error.message}`,
        variant: "destructive",
      });
      setExportProgress(0);
    }
  });
  
  // Delete export mutation
  const deleteExportMutation = useMutation({
    mutationFn: async (filename: string) => {
      return await apiRequest(`/api/admin/exports/${filename}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      refetchExports();
      toast({
        title: "Delete successful",
        description: "The export file was deleted successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: `Failed to delete export file: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Import mutation
  const importMutation = useMutation({
    mutationFn: async ({ entityType, file }: { entityType: string, file: File }) => {
      setImportProgress(25);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Make API request
      const result = await fetch(`/api/admin/import/${entityType}`, {
        method: 'POST',
        body: formData,
      });
      
      setImportProgress(75);
      
      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Import failed');
      }
      
      setImportProgress(100);
      return await result.json();
    },
    onSuccess: (data) => {
      // Invalidate queries that might be affected by the import
      queryClient.invalidateQueries({ queryKey: [`/api/${selectedEntityType}`] });
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${data.count || 0} items.`,
        variant: "default",
      });
      
      // Reset form
      setUploadFile(null);
      setSelectedEntityType("");
      setImportProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: `Failed to import data: ${error.message}`,
        variant: "destructive",
      });
      setImportProgress(0);
    }
  });
  
  // Handle entity type selection
  const handleEntityTypeChange = (value: string) => {
    setSelectedEntityType(value);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  // Handle export
  const handleExport = () => {
    if (!selectedEntityType) {
      toast({
        title: "Export failed",
        description: "Please select an entity type to export.",
        variant: "destructive",
      });
      return;
    }
    
    exportMutation.mutate(selectedEntityType);
  };
  
  // Handle import
  const handleImport = () => {
    if (!selectedEntityType) {
      toast({
        title: "Import failed",
        description: "Please select an entity type to import.",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadFile) {
      toast({
        title: "Import failed",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate({ entityType: selectedEntityType, file: uploadFile });
  };
  
  // Handle download
  const handleDownload = (filename: string) => {
    window.open(`/api/admin/exports/download/${filename}`, '_blank');
  };
  
  // Handle delete
  const handleDelete = (filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      deleteExportMutation.mutate(filename);
    }
  };
  
  return (
    <DashboardLayout location="/admin/data-export-import">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Data Export & Import</h1>
        
        {/* Test Data Seeding Section */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Generate Test Data
            </CardTitle>
            <CardDescription>
              Populate your platform with comprehensive, realistic test data for development and testing purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-blue-600">Countries & Cities</div>
                  <div className="text-gray-600">8 countries, 15+ cities</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-green-600">Hotels & Rooms</div>
                  <div className="text-gray-600">15 hotels, 45+ rooms</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-purple-600">Travel Packages</div>
                  <div className="text-gray-600">10+ diverse packages</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-orange-600">Transportation</div>
                  <div className="text-gray-600">6 vehicle types</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-red-600">Guided Tours</div>
                  <div className="text-gray-600">5 cultural tours</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-indigo-600">Tour Durations</div>
                  <div className="text-gray-600">6 duration options</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => seedTestDataMutation.mutate()}
                  disabled={isSeedingData || isClearingData}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  {isSeedingData ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Test Data...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate Comprehensive Test Data
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => {
                    const confirmed = window.confirm(
                      "⚠️ WARNING: This will permanently delete ALL data from your database including:\n\n" +
                      "• Countries and Cities\n" +
                      "• Hotels and Rooms\n" +
                      "• Travel Packages\n" +
                      "• Tours and Transportation\n" +
                      "• All user data and bookings\n\n" +
                      "This action CANNOT be undone. Are you absolutely sure you want to proceed?"
                    );
                    if (confirmed) {
                      clearAllDataMutation.mutate();
                    }
                  }}
                  disabled={isSeedingData || isClearingData}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  size="lg"
                  variant="destructive"
                >
                  {isClearingData ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing All Data...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Clear All Data
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-gray-600 bg-white p-3 rounded border">
                <strong>What will be created:</strong> Countries (Egypt, UAE, Jordan, Morocco, Turkey, Saudi Arabia, Oman, Lebanon), 
                major cities with airports, luxury hotels with different room types, diverse travel packages, 
                transportation options, and realistic pricing data - all optimized for Middle Eastern tourism.
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="export" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="export"><FileDown className="mr-2 h-4 w-4" /> Export</TabsTrigger>
            <TabsTrigger value="import"><FileUp className="mr-2 h-4 w-4" /> Import</TabsTrigger>
            <TabsTrigger value="exports"><Database className="mr-2 h-4 w-4" /> Exports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Export data for backup or transferring to another system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="entity-type-export">Entity Type</Label>
                    <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
                      <SelectTrigger id="entity-type-export">
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotels">Hotels</SelectItem>
                        <SelectItem value="rooms">Rooms</SelectItem>
                        <SelectItem value="tours">Tours</SelectItem>
                        <SelectItem value="packages">Packages</SelectItem>
                        <SelectItem value="transportation-types">Transportation Types</SelectItem>
                        <SelectItem value="transportation-locations">Transportation Locations</SelectItem>
                        <SelectItem value="transportation-durations">Transportation Durations</SelectItem>
                        <SelectItem value="package-categories">Package Categories</SelectItem>
                        <SelectItem value="room-categories">Room Categories</SelectItem>
                        <SelectItem value="tour-categories">Tour Categories</SelectItem>
                        <SelectItem value="hotel-categories">Hotel Categories</SelectItem>
                        <SelectItem value="full-database">Full Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {exportProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>Export in progress...</div>
                        <div>{exportProgress}%</div>
                      </div>
                      <Progress value={exportProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleExport} 
                  disabled={!selectedEntityType || exportMutation.isPending}
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Import data from a previously exported file.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="entity-type-import">Entity Type</Label>
                    <Select value={selectedEntityType} onValueChange={handleEntityTypeChange}>
                      <SelectTrigger id="entity-type-import">
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotels">Hotels</SelectItem>
                        <SelectItem value="rooms">Rooms</SelectItem>
                        <SelectItem value="tours">Tours</SelectItem>
                        <SelectItem value="packages">Packages</SelectItem>
                        <SelectItem value="transportation-types">Transportation Types</SelectItem>
                        <SelectItem value="transportation-locations">Transportation Locations</SelectItem>
                        <SelectItem value="transportation-durations">Transportation Durations</SelectItem>
                        <SelectItem value="package-categories">Package Categories</SelectItem>
                        <SelectItem value="room-categories">Room Categories</SelectItem>
                        <SelectItem value="tour-categories">Tour Categories</SelectItem>
                        <SelectItem value="hotel-categories">Hotel Categories</SelectItem>
                        <SelectItem value="full-database">Full Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-2">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary/10 file:text-primary
                          hover:file:bg-primary/20
                          cursor-pointer
                        "
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a JSON file containing the data to import.
                    </p>
                  </div>
                  
                  {importProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>Import in progress...</div>
                        <div>{importProgress}%</div>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedEntityType || !uploadFile || importMutation.isPending}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="exports">
            <Card>
              <CardHeader>
                <CardTitle>Export Files</CardTitle>
                <CardDescription>Manage previously exported data files.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingExports ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (exportsData as any)?.exports?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(exportsData as any).exports.map((file: ExportFile) => (
                        <TableRow key={file.name}>
                          <TableCell className="font-medium">{file.name}</TableCell>
                          <TableCell>{formatBytes(file.size)}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(file.created), { addSuffix: true })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(file.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(file.name)}
                                disabled={deleteExportMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No export files found. Export some data first.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}