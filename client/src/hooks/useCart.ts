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
        const response = await apiRequest('GET', '/api/cart');
        console.log('Cart fetch response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (error.message?.includes('401')) {
          // User not authenticated, redirect to login
          checkAuth();
        }
        return [];
      }
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
      if (!checkAuth()) return;
      
      console.log('Adding cart item:', item);
      return await apiRequest('POST', '/api/cart', item);
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
      return await apiRequest('PATCH', `/api/cart/${id}`, updates);
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
      return await apiRequest('DELETE', `/api/cart/${id}`);
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
      return await apiRequest('DELETE', '/api/cart');
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