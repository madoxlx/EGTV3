import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Star, Camera } from 'lucide-react';

interface ImageUploadSectionProps {
  mainImage: string | null;
  galleryImages: string[];
  onMainImageChange: (imageUrl: string | null) => void;
  onGalleryImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploadSection({
  mainImage,
  galleryImages,
  onMainImageChange,
  onGalleryImagesChange,
  maxImages = 10
}: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToServer = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url; // Server returns { url: "/uploads/filename.jpg" }
  };

  const handleMainImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToServer(file);
      onMainImageChange(imageUrl);
      toast({
        title: "Success",
        description: "Main image uploaded successfully",
      });
    } catch (error) {
      console.error('Main image upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload main image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (files: FileList) => {
    if (!files.length) return;

    if (galleryImages.length + files.length > maxImages) {
      toast({
        title: "Error",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadImageToServer(file);
        newImages.push(imageUrl);
      }

      onGalleryImagesChange([...galleryImages, ...newImages]);
      toast({
        title: "Success",
        description: `${newImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload gallery images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMainImage = () => {
    onMainImageChange(null);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const updatedImages = galleryImages.filter((_, index) => index !== indexToRemove);
    onGalleryImagesChange(updatedImages);
  };

  const setAsMainImage = (imageUrl: string) => {
    onMainImageChange(imageUrl);
  };

  return (
    <div className="space-y-6">
      {/* Main Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Main Image *
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mainImage ? (
            <div className="relative">
              <img 
                src={mainImage} 
                alt="Main package image" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeMainImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute top-2 left-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Main
                </span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Main Image'}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload a high-quality image that represents your package
              </p>
            </div>
          )}
          
          <input
            ref={mainImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleMainImageUpload(file);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Gallery Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Gallery Images ({galleryImages.length}/{maxImages})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || galleryImages.length >= maxImages}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Add Gallery Images'}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Upload additional images to showcase your package
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  handleGalleryImageUpload(files);
                }
              }}
            />

            {/* Gallery Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setAsMainImage(imageUrl)}
                          disabled={mainImage === imageUrl}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}