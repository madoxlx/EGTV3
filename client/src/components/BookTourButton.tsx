import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar } from 'lucide-react';
import { useCart, CartItemData } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/use-language';

interface Tour {
  id: number;
  name: string;
  price?: number;
  discountedPrice?: number;
  duration?: string;
  slug?: string;
}

interface BookTourButtonProps {
  tour: Tour;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function BookTourButton({ 
  tour, 
  variant = 'default', 
  size = 'default', 
  className = '',
  showIcon = true,
  children 
}: BookTourButtonProps) {
  const { addToCart, isAdding } = useCart();
  const { t } = useLanguage();

  const handleBookTour = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('BookTourButton clicked for tour:', tour);

    const cartItem: CartItemData = {
      itemType: 'tour',
      itemId: tour.id,
      itemName: tour.name,
      quantity: 1,
      adults: 2, // Default values
      children: 0,
      infants: 0,
      travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week from now
      priceAtAdd: tour.discountedPrice || tour.price || 0,
      discountedPriceAtAdd: tour.discountedPrice,
      configuration: {
        duration: tour.duration,
        slug: tour.slug
      }
    };

    console.log('Adding cart item:', cartItem);
    addToCart(cartItem);
  };

  return (
    <Button
      onClick={handleBookTour}
      variant={variant}
      size={size}
      className={className}
      disabled={isAdding}
    >
      {showIcon && <ShoppingCart className="w-4 h-4 mr-2" />}
      {children || t('tours.bookTour', 'Book Tour')}
    </Button>
  );
}

export default BookTourButton;