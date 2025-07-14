import React from "react";
import { Link, useLocation } from "wouter";
import logo from "../assets/EgyptExpressTvl-logo.png";
import { Button } from "@/components/ui/button";
import {
  UmbrellaIcon,
  UserCircleIcon,
  MenuIcon,
  MapPinIcon,
  LogOut,
  Heart,
  User,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/hooks/useCart";
import { useHeaderMenu, type MenuItemWithChildren } from "@/hooks/use-menu";
import { LanguageSwitcher, LanguageToggle } from "@/components/ui/language-switcher";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = React.useState<Record<number, boolean>>({});
  const [location] = useLocation();
  const { cartItems } = useCart();

  // Add safety check for auth context
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    // If auth context is not available, render header without user functionality
    authData = { user: null, logoutMutation: { mutate: () => {} } };
  }

  const { user, logoutMutation } = authData;
  const { t, isRTL } = useLanguage();
  const { data: menuItems, isLoading: menuLoading } = useHeaderMenu();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileSubmenu = (menuId: number) => {
    setExpandedMobileMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.username.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary flex items-center"
          >
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>
        </div>

        <nav className="hidden md:block">
          {menuLoading ? (
            <div className="flex space-x-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <NavigationMenu>
              <NavigationMenuList className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                {menuItems?.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {item.children && item.children.length > 0 ? (
                      // Parent item with children - show dropdown on hover
                      <>
                        <NavigationMenuTrigger 
                          className={`font-medium bg-transparent relative group/trigger hover:bg-transparent hover:text-inherit focus:bg-transparent focus:text-inherit data-[state=open]:bg-transparent data-[state=open]:text-inherit ${
                            location === item.url || 
                            (item.url !== '/' && location.startsWith(item.url || '')) ||
                            item.children?.some(child => location === child.url || 
                              (child.url !== '/' && location.startsWith(child.url || '')))
                              ? "text-primary" 
                              : ""
                          }`}
                        >
                          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-500 transition-all duration-300 ease-out group-hover/trigger:w-full"></span>
                          {item.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-[200px] p-2">
                            <div className="grid gap-1">
                              {/* Parent item as clickable link */}
                              {item.url && (
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.url}
                                    className={`block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors relative group/dropdown ${
                                      location === item.url ? "text-primary bg-accent" : ""
                                    }`}
                                    target={item.target === '_blank' ? '_blank' : undefined}
                                    rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                                  >
                                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-500 transition-all duration-300 ease-out group-hover/dropdown:w-full"></span>
                                    {item.title}
                                  </Link>
                                </NavigationMenuLink>
                              )}
                              {/* Separator if parent has URL */}
                              {item.url && <div className="h-px bg-border my-1" />}
                              {/* Child items */}
                              {item.children.map((child) => (
                                <NavigationMenuLink key={child.id} asChild>
                                  <Link
                                    href={child.url || '/'}
                                    className={`block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors relative group/child ${
                                      location === child.url || 
                                      (child.url !== '/' && location.startsWith(child.url || ''))
                                        ? "text-primary bg-accent" 
                                        : ""
                                    }`}
                                    target={child.target === '_blank' ? '_blank' : undefined}
                                    rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                                  >
                                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-500 transition-all duration-300 ease-out group-hover/child:w-full"></span>
                                    {child.title}
                                  </Link>
                                </NavigationMenuLink>
                              ))}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      // Regular item without children - direct link
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.url || '/'}
                          className={`font-medium hover:text-primary transition-colors px-3 py-2 rounded-md relative group/link ${
                            location === item.url || 
                            (item.url !== '/' && location.startsWith(item.url || '')) 
                              ? "text-primary" 
                              : ""
                          }`}
                          target={item.target === '_blank' ? '_blank' : undefined}
                          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                        >
                          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-red-500 transition-all duration-300 ease-out group-hover/link:w-full"></span>
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </nav>

        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
          <LanguageSwitcher />

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatarUrl || ""}
                        alt={user.username}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      <span>{t('nav.profile', 'Profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/destinations?filter=favorites"
                      className="cursor-pointer"
                    >
                      <Heart className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                      <span>{t('nav.favorites', 'Favorites')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="cursor-pointer"
                      >
                        <UmbrellaIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                        <span>{t('nav.admin', 'Admin Dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    <span>{t('nav.signout', 'Log out')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/auth"
              className="hidden md:inline-flex items-center font-medium hover:text-primary transition-colors"
            >
              <UserCircleIcon className={`${isRTL ? 'ml-1' : 'mr-1'}`} size={18} />
              {t('nav.signin', 'Sign In')}
            </Link>
          )}

          <Link href="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 text-gray-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItems.length > 99 ? '99+' : cartItems.length}
                </Badge>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-neutral-700"
            onClick={toggleMenu}
          >
            <MenuIcon className="text-xl" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t">
          <ul className="space-y-3">
            {/* Dynamic navigation menu items */}
            {menuItems?.map((item) => (
              <li key={item.id}>
                {item.children && item.children.length > 0 ? (
                  // Parent item with children - show expand/collapse
                  <div>
                    <div className="flex items-center justify-between">
                      {item.url ? (
                        <Link
                          href={item.url}
                          className={`block font-medium hover:text-primary transition-colors ${
                            location === item.url || 
                            (item.url !== '/' && location.startsWith(item.url || ''))
                              ? "text-primary" 
                              : ""
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-700">{item.title}</span>
                      )}
                      <button
                        onClick={() => toggleMobileSubmenu(item.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${
                            expandedMobileMenus[item.id] ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                    </div>
                    {expandedMobileMenus[item.id] && (
                      <ul className="ml-4 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.url || '/'}
                              className={`block text-sm font-medium hover:text-primary transition-colors ${
                                location === child.url || 
                                (child.url !== '/' && location.startsWith(child.url || ''))
                                  ? "text-primary" 
                                  : ""
                              }`}
                              onClick={() => setIsMenuOpen(false)}
                              target={child.target === '_blank' ? '_blank' : undefined}
                              rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // Regular item without children - direct link
                  <Link
                    href={item.url || '/'}
                    className={`block font-medium hover:text-primary transition-colors ${
                      location === item.url || 
                      (item.url !== '/' && location.startsWith(item.url || ''))
                        ? "text-primary" 
                        : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    target={child.target === '_blank' ? '_blank' : undefined}
                    rel={child.target === '_blank' ? 'noopener noreferrer' : undefined}
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}

            {/* Language Toggle for Mobile */}
            <li className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">
                  {t('nav.language', 'Language')}
                </span>
                <LanguageToggle />
              </div>
            </li>

            {user ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="block font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className={`inline ${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                    {t('nav.profile', 'Profile')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations?filter=favorites"
                    className="block font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className={`inline ${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                    {t('nav.favorites', 'Favorites')}
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li>
                    <Link
                      href="/admin"
                      className="block font-medium hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UmbrellaIcon className={`inline ${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                      {t('nav.admin', 'Admin Dashboard')}
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left font-medium text-destructive hover:text-destructive/90 transition-colors"
                  >
                    <LogOut className={`inline ${isRTL ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                    {t('nav.signout', 'Log Out')}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/auth"
                  className="block font-medium hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircleIcon className={`inline ${isRTL ? 'ml-1' : 'mr-1'}`} size={18} />
                  {t('nav.signin', 'Sign In')}
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;