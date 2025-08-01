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
import CartRoomDistribution from '@/components/cart/CartRoomDistribution';
import { useLanguage } from '@/hooks/use-language';

export default function CartPage() {
  const { t, isRTL } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { cartItems, isLoading: cartLoading, updateCartItem, removeFromCart, calculateTotals } = useCart();
  const [, setLocation] = useLocation();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: t('cart.signInRequired', 'Sign In Required'),
        description: t('cart.signInDescription', 'Please sign in to view your cart'),
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
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('cart.loading', 'Loading your cart...')}</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">{t('cart.signInRequired', 'Sign In Required')}</CardTitle>
            <CardDescription>
              {t('cart.signInMessage', 'You need to be signed in to view your cart and make purchases')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth">
              <Button className="w-full" size="lg">
                <LogIn className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('auth.signIn', 'Sign In')}
              </Button>
            </Link>
            <div className="text-center text-sm text-gray-600">
              {t('cart.noAccount', "Don't have an account?")}{" "}
              <Link href="/auth" className="text-indigo-600 hover:underline">
                {t('auth.signUpFree', 'Sign up for free')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold text-gray-900 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <ShoppingCart className="w-8 h-8 text-indigo-600" />
            {t('cart.title', 'Your Cart')}
          </h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length === 0 
              ? t('cart.empty', 'Your cart is empty')
              : t('cart.itemCount', `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`)
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('cart.empty', 'Your cart is empty')}</h3>
              <p className="text-gray-600 mb-6">{t('cart.emptyMessage', "Looks like you haven't added any items to your cart yet.")}</p>
              <Link href="/tours">
                <Button size="lg" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {t('cart.browseTours', 'Browse Tours')}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
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
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.adults} {t('cart.adults', 'Adults')}
                              </Badge>
                              {item.children > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.children} {t('cart.children', 'Children')}
                                </Badge>
                              )}
                              {item.infants > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.infants} {t('cart.infants', 'Infants')}
                                </Badge>
                              )}
                            </span>
                          </div>
                          {item.configuration && (
                            <div className="flex items-center gap-4 text-xs">
                              {item.configuration.nights && (
                                <span>📅 {item.configuration.nights} {t('cart.nights', 'nights')}</span>
                              )}
                              {item.configuration.basePricePerPerson && (
                                <span>💰 {item.configuration.basePricePerPerson.toLocaleString('en-US')} EGP {t('cart.perPerson', 'per person')}</span>
                              )}
                              {item.configuration.totalTravelers && (
                                <span>👥 {item.configuration.totalTravelers} {t('cart.travelersTotal', 'travelers total')}</span>
                              )}
                            </div>
                          )}
                          {item.travelDate && (
                            <div className="text-xs text-indigo-600">
                              📆 {t('cart.travelDate', 'Travel Date')}: {new Date(item.travelDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                          
                          {/* Room Distribution Display */}
                          {item.configuration && (item.configuration.selectedRooms || item.configuration.roomDistribution) && (
                            <CartRoomDistribution
                              configuration={item.configuration}
                              adults={item.adults}
                              children={item.children}
                              infants={item.infants}
                            />
                          )}
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
                          {((item.discountedPriceAtAdd || item.priceAtAdd) * item.quantity).toLocaleString('en-US')} EGP
                        </div>
                        {item.configuration?.priceBreakdown ? (
                          <div className="text-xs text-gray-500 mt-1">
                            <div>🏨 Room Cost: {item.configuration.priceBreakdown.roomsCost.toLocaleString('en-US')} EGP</div>
                            {item.configuration.priceBreakdown.toursCost > 0 && (
                              <div>🚌 Tours: {item.configuration.priceBreakdown.toursCost.toLocaleString('en-US')} EGP</div>
                            )}
                            <div>📊 Total: {item.configuration.priceBreakdown.total.toLocaleString('en-US')} EGP</div>
                            {item.quantity > 1 && <div>× {item.quantity} booking${item.quantity > 1 ? 's' : ''}</div>}
                          </div>
                        ) : item.configuration?.basePricePerPerson && item.configuration?.totalTravelers && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.configuration.basePricePerPerson.toLocaleString('en-US')} × {item.configuration.totalTravelers} travelers
                            {item.quantity > 1 && ` × ${item.quantity} booking${item.quantity > 1 ? 's' : ''}`}
                          </div>
                        )}
                        {item.discountedPriceAtAdd && item.discountedPriceAtAdd < item.priceAtAdd && (
                          <div className="text-sm text-gray-500 line-through">
                            {(item.priceAtAdd * item.quantity).toLocaleString('en-US')} EGP
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
                  <CardTitle>{t('cart.orderSummary', 'Order Summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span>{t('cart.subtotal', 'Subtotal')}</span>
                    <span>{subtotal.toLocaleString('en-US')} EGP</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span>{t('cart.tax', 'Tax (10%)')}</span>
                    <span>{tax.toLocaleString('en-US')} EGP</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('cart.total', 'Total')}</span>
                    <span>{total.toLocaleString('en-US')} EGP</span>
                  </div>
                  <Link href="/checkout">
                    <Button className={`w-full flex items-center ${isRTL ? 'flex-row-reverse' : ''}`} size="lg">
                      {t('cart.proceedCheckout', 'Proceed to Checkout')}
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                    </Button>
                  </Link>
                  <Link href="/tours">
                    <Button variant="outline" className="w-full">
                      {t('cart.continueShopping', 'Continue Shopping')}
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