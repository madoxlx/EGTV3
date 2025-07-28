import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

export interface CartItemData {
  id?: number;
  itemType: 'flight' | 'hotel' | 'room' | 'tour' | 'package' | 'visa' | 'transportation';
  itemId: number;
  itemName?: string;
  quantity: number;
  adults: number;
  children: number;
  infants: number;
  checkInDate?: string;
  checkOutDate?: string;
  travelDate?: string;
  configuration?: any;
  priceAtAdd: number;
  discountedPriceAtAdd?: number;
  notes?: string;
}

export function useCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check authentication before cart operations
  const checkAuth = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to use cart functionality",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 1000);
      return false;
    }
    return true;
  };

  // Fetch cart items (only if authenticated)
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      
      try {
        const response = await apiRequest('/api/cart');
        console.log('Cart fetch response:', response);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching cart:', error);
        
        // Handle different error types
        if (error.message?.includes('401') || error.message?.includes('Authentication required')) {
          // User not authenticated, silently return empty cart
          return [];
        } else if (error.message?.includes('Expected JSON response')) {
          // Got HTML instead of JSON, likely authentication issue
          console.warn('Cart API returned HTML instead of JSON - user may not be authenticated');
          return [];
        }
        
        // For other errors, still return empty array to prevent crashes
        return [];
      }
    },
    enabled: !!user, // Only run query if user is authenticated
    retry: false, // Don't retry on authentication errors
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
      if (!checkAuth()) return;
      
      console.log('Adding cart item:', item);
      return await apiRequest('/api/cart', {
        method: 'POST',
        body: JSON.stringify(item)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      console.error('Error adding to cart:', error);
      if (error.message?.includes('401')) {
        checkAuth();
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      if (!checkAuth()) return;
      return await apiRequest(`/api/cart/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('Error updating cart:', error);
      if (error.message?.includes('401')) {
        checkAuth();
      } else {
        toast({
          title: "Error",
          description: "Failed to update cart item",
          variant: "destructive",
        });
      }
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!checkAuth()) return;
      return await apiRequest(`/api/cart/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      console.error('Error removing from cart:', error);
      if (error.message?.includes('401')) {
        checkAuth();
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!checkAuth()) return;
      return await apiRequest('/api/cart', {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: any) => {
      console.error('Error clearing cart:', error);
      if (error.message?.includes('401')) {
        checkAuth();
      } else {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive",
        });
      }
    },
  });

  // Helper functions
  const addToCart = (item: CartItemData) => {
    if (!checkAuth()) return;
    addToCartMutation.mutate(item);
  };

  const updateCartItem = (id: number, updates: any) => {
    if (!checkAuth()) return;
    updateCartMutation.mutate({ id, updates });
  };

  const removeFromCart = (id: number) => {
    if (!checkAuth()) return;
    removeFromCartMutation.mutate(id);
  };

  const clearCart = () => {
    if (!checkAuth()) return;
    clearCartMutation.mutate();
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total: number, item: any) => {
      const price = item.discountedPriceAtAdd || item.priceAtAdd;
      return total + (price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  return {
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateTotals,
    cartCount: cartItems.length,
  };
}