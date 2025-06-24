import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [sessionId, setSessionId] = useState<string>('');

  // Check authentication and redirect if not logged in
  const checkAuthAndRedirect = () => {
    if (!authLoading && !user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to access your cart",
        variant: "destructive",
      });
      // Redirect to sign up page
      window.location.href = '/auth';
      return false;
    }
    return true;
  };

  // Generate and persist session ID for guest users (legacy support)
  useEffect(() => {
    if (!sessionId && user) {
      // For authenticated users, use user ID as session identifier
      setSessionId(`user_${user.id}`);
    } else if (!sessionId) {
      // For guest users (legacy support during transition)
      const existingSessionId = localStorage.getItem('cart_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
      } else {
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [sessionId, user]);

  // Fetch cart items with authentication check
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart', user?.id || sessionId],
    queryFn: async () => {
      if (!user) {
        return []; // Return empty cart for unauthenticated users
      }
      
      console.log('Fetching cart for authenticated user:', user.id);
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch cart items');
      }
      const result = await response.json();
      console.log('Cart fetch result:', result);
      return result;
    },
    enabled: !!user && !authLoading,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    staleTime: 0,
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItemData) => {
      if (!checkAuthAndRedirect()) {
        throw new Error('Authentication required');
      }
      
      console.log('Adding to cart for user:', user?.id);
      const response = await apiRequest('POST', '/api/cart', item);
      console.log('Cart response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', user?.id || sessionId] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart successfully!",
      });
    },
    onError: (error: any) => {
      if (error.message !== 'Authentication required') {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    },
  });

  // Update cart item
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CartItemData> }) => {
      if (!checkAuthAndRedirect()) {
        throw new Error('Authentication required');
      }
      return apiRequest('PATCH', `/api/cart/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', user?.id || sessionId] });
    },
    onError: (error: any) => {
      if (error.message !== 'Authentication required') {
        toast({
          title: "Error",
          description: error.message || "Failed to update cart item",
          variant: "destructive",
        });
      }
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!checkAuthAndRedirect()) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', user?.id || sessionId] });
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      if (error.message !== 'Authentication required') {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!checkAuthAndRedirect()) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', user?.id || sessionId] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    },
  });

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total: number, item: any) => {
      const price = item.discountedPriceAtAdd || item.priceAtAdd;
      return total + (price * item.quantity);
    }, 0);

    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const addToCart = (item: CartItemData) => addToCartMutation.mutate(item);
  const updateCartItem = (id: number, updates: Partial<CartItemData>) => 
    updateCartMutation.mutate({ id, updates });
  const removeFromCart = (id: number) => removeFromCartMutation.mutate(id);
  const clearCart = () => clearCartMutation.mutate();

  return {
    cartItems: user ? cartItems : [], // Only show cart items for authenticated users
    isLoading: authLoading || isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateTotals,
    sessionId,
    isAuthenticated: !!user,
    user,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}