import React, { useState, useEffect } from 'react';
import { Languages, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

interface FloatingLanguageSwitcherProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function FloatingLanguageSwitcher({ 
  position = 'bottom-right',
  className,
  autoHide = true,
  autoHideDelay = 5000 
}: FloatingLanguageSwitcherProps) {
  const { currentLanguage, setLanguage, languageSettings, loading } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, hasInteracted]);

  // Get available languages from settings or default to en/ar
  const availableLanguages = React.useMemo(() => {
    if (languageSettings?.availableLanguages) {
      const languages = Array.isArray(languageSettings.availableLanguages) 
        ? languageSettings.availableLanguages 
        : JSON.parse(languageSettings.availableLanguages as string);
      return languages;
    }
    return ['en', 'ar'];
  }, [languageSettings]);

  // Language display names
  const languageNames = {
    en: 'English',
    ar: 'العربية',
  };

  // Language flags/icons
  const languageFlags = {
    en: '🇺🇸',
    ar: '🇸🇦',
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setIsExpanded(false);
    setHasInteracted(true);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    setHasInteracted(true);
    if (!isVisible) setIsVisible(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasInteracted(true);
  };

  if (loading || !isVisible) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const expandDirection = position.includes('bottom') ? 'up' : 'down';

  return (
    <div className={cn(
      "fixed z-50 flex flex-col items-end",
      positionClasses[position],
      className
    )}>
      {/* Expanded language options */}
      {isExpanded && (
        <div className={cn(
          "mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[140px]",
          expandDirection === 'up' ? 'animate-slide-up' : 'animate-slide-down'
        )}>
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-gray-600">
              Select Language
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-gray-100",
                  currentLanguage === lang ? "bg-blue-50 text-blue-700" : "text-gray-700"
                )}
              >
                <span className="text-lg">
                  {languageFlags[lang as keyof typeof languageFlags] || '🌐'}
                </span>
                <span className={lang === 'ar' ? 'font-arabic' : ''}>
                  {languageNames[lang as keyof typeof languageNames] || lang.toUpperCase()}
                </span>
                {currentLanguage === lang && (
                  <span className="ml-auto text-blue-600">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main floating button */}
      <div className="flex items-center gap-2">
        {/* Dismiss button (only show if auto-hide is enabled and user hasn't interacted) */}
        {autoHide && !hasInteracted && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/90 shadow-md rounded-full hover:bg-white"
            onClick={handleDismiss}
            title="Hide language switcher"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Language switcher button */}
        <Button
          variant="default"
          size="sm"
          className={cn(
            "shadow-lg transition-all duration-200 gap-2 rounded-full",
            "bg-blue-600 hover:bg-blue-700 text-white",
            isExpanded && "ring-2 ring-blue-300"
          )}
          onClick={handleToggle}
          title={`Current language: ${languageNames[currentLanguage as keyof typeof languageNames] || currentLanguage}`}
        >
          <Languages className="h-4 w-4" />
          <span className="text-lg">
            {languageFlags[currentLanguage as keyof typeof languageFlags] || '🌐'}
          </span>
          <span className="text-xs font-medium">
            {currentLanguage.toUpperCase()}
          </span>
        </Button>
      </div>
    </div>
  );
}

// Slide up animation for Tailwind
const slideUpStyle = `
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.2s ease-out;
  }
  
  .animate-slide-down {
    animation: slide-down 0.2s ease-out;
  }
`;

// Add styles to document head if they don't exist
if (typeof document !== 'undefined' && !document.querySelector('#floating-lang-switcher-styles')) {
  const style = document.createElement('style');
  style.id = 'floating-lang-switcher-styles';
  style.textContent = slideUpStyle;
  document.head.appendChild(style);
}