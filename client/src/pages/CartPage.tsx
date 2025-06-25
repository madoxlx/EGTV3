import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/useCart';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function CartPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { cartItems, isLoading: cartLoading, updateCartItem, removeFromCart, calculateTotals } = useCart();
  const [, setLocation] = useLocation();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to view your cart",
        variant: "destructive",
      });
      // Small delay to show the toast before redirect
      setTimeout(() => {
        setLocation('/auth');
      }, 1000);
    }
  }, [user, authLoading, setLocation]);

  // Update quantity function
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    updateCartItem(itemId, { quantity: newQuantity });
  };

  // Show loading state
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to view your cart and make purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth">
              <Button className="w-full" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth" className="text-indigo-600 hover:underline">
                Sign up for free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-indigo-600" />
            Your Cart
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length === 0 
              ? "Your cart is empty" 
              : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <Link href="/tours">
                <Button size="lg">
                  Browse Tours
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {item.itemName || `${item.itemType} #${item.itemId}`}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center">
                            <Badge variant="secondary" className="mr-1">
                              {item.adults} Adults
                            </Badge>
                            {item.children > 0 && (
                              <Badge variant="outline" className="mr-1">
                                {item.children} Children
                              </Badge>
                            )}
                            {item.infants > 0 && (
                              <Badge variant="outline">
                                {item.infants} Infants
                              </Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold text-lg min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-gray-900">
                          {((item.discountedPriceAtAdd || item.priceAtAdd) * item.quantity).toLocaleString('ar-EG')} EGP
                        </div>
                        {item.discountedPriceAtAdd && item.discountedPriceAtAdd < item.priceAtAdd && (
                          <div className="text-sm text-gray-500 line-through">
                            {(item.priceAtAdd * item.quantity).toLocaleString('ar-EG')} EGP
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString('ar-EG')} EGP</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>Tax (10%)</span>
                    <span>{tax.toLocaleString('ar-EG')} EGP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{total.toLocaleString('ar-EG')} EGP</span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/tours">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}