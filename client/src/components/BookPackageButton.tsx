import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface Package {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  imageUrl?: string;
  slug?: string;
  destinationId?: number;
}

interface BookPackageButtonProps {
  package: Package;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const BookPackageButton: React.FC<BookPackageButtonProps> = ({ 
  package: pkg, 
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleBookPackage = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book packages",
        variant: "destructive",
      });
      setLocation('/auth/sign-up');
      return;
    }

    setIsAdding(true);
    
    try {
      const cartItem = {
        type: 'package',
        itemId: pkg.id,
        itemName: pkg.title,
        price: pkg.discountedPrice || pkg.price,
        originalPrice: pkg.price,
        duration: pkg.duration,
        imageUrl: pkg.imageUrl || '/api/placeholder/300/200',
        quantity: 1,
        travelers: 2, // Default travelers
        travelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        specialRequests: '',
        destinationId: pkg.destinationId
      };

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cartItem),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to add packages to cart",
            variant: "destructive",
          });
          setLocation('/auth/sign-up');
          return;
        }
        throw new Error('Failed to add package to cart');
      }

      const result = await response.json();
      
      setIsAdded(true);
      toast({
        title: "Package Added to Cart!",
        description: `${pkg.title} has been added to your cart`,
      });

      // Reset the "added" state after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

    } catch (error) {
      console.error('Error adding package to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add package to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      onClick={handleBookPackage}
      disabled={isAdding || isAdded}
      variant={variant}
      size={size}
      className={className}
    >
      {isAdding ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Book Now
        </>
      )}
    </Button>
  );
};

export default BookPackageButton;