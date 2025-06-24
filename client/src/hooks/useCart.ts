import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const [sessionId, setSessionId] = useState<string>('');

  // Generate and persist session ID for guest users
  useEffect(() => {
    if (!sessionId) {
      // Try to get existing sessionId from localStorage
      const existingSessionId = localStorage.getItem('cart_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
      } else {
        // Generate new sessionId and store it
        const newSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [sessionId]);

  // Fetch cart items with sessionId as query parameter
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      console.log('Fetching cart with sessionId:', sessionId);
      const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const result = await response.json();
      console.log('Cart fetch result:', result);
      return result;
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    staleTime: 0,
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItemData) => {
      console.log('Adding to cart:', { ...item, sessionId });
      const response = await apiRequest('POST', '/api/cart', {
        ...item,
        sessionId,
      });
      console.log('Cart response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Update cart item
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CartItemData> }) => {
      return apiRequest('PATCH', `/api/cart/${id}`, { ...updates, sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cart/${id}?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/cart/clear?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
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
    cartItems,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateTotals,
    sessionId,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
}