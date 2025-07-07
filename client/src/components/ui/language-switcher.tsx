import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'default', 
  showLabel = true, 
  className 
}: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, languageSettings, loading } = useLanguage();

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
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className={className}>
        <Languages className="h-4 w-4" />
        {showLabel && variant !== 'minimal' && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  const currentLanguageName = languageNames[currentLanguage as keyof typeof languageNames] || currentLanguage;
  const currentLanguageFlag = languageFlags[currentLanguage as keyof typeof languageFlags] || '🌐';

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 w-8 p-0", className)}
            title={`Current language: ${currentLanguageName}`}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                currentLanguage === lang && "bg-accent"
              )}
            >
              <span className="text-lg">
                {languageFlags[lang as keyof typeof languageFlags] || '🌐'}
              </span>
              <span className={lang === 'ar' ? 'font-arabic' : ''}>
                {languageNames[lang as keyof typeof languageNames] || lang.toUpperCase()}
              </span>
              {currentLanguage === lang && (
                <span className="ml-auto text-primary">●</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <span className="text-lg">{currentLanguageFlag}</span>
            <span className="text-xs font-medium">{currentLanguage.toUpperCase()}</span>
            <Languages className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {availableLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                currentLanguage === lang && "bg-accent"
              )}
            >
              <span className="text-lg">
                {languageFlags[lang as keyof typeof languageFlags] || '🌐'}
              </span>
              <span className={lang === 'ar' ? 'font-arabic' : ''}>
                {languageNames[lang as keyof typeof languageNames] || lang.toUpperCase()}
              </span>
              {currentLanguage === lang && (
                <span className="ml-auto text-primary">●</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Languages className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="text-lg">{currentLanguageFlag}</span>
              <span className={currentLanguage === 'ar' ? 'font-arabic' : ''}>
                {currentLanguageName}
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-3",
              currentLanguage === lang && "bg-accent"
            )}
          >
            <span className="text-xl">
              {languageFlags[lang as keyof typeof languageFlags] || '🌐'}
            </span>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium",
                lang === 'ar' ? 'font-arabic text-right' : ''
              )}>
                {languageNames[lang as keyof typeof languageNames] || lang.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : lang}
              </span>
            </div>
            {currentLanguage === lang && (
              <span className="ml-auto text-primary">●</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simplified toggle version for space-constrained areas
export function LanguageToggle({ className }: { className?: string }) {
  const { currentLanguage, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={cn("gap-2", className)}
      title={`Switch to ${currentLanguage === 'en' ? 'Arabic' : 'English'}`}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-medium">
        {currentLanguage === 'en' ? 'عربي' : 'EN'}
      </span>
    </Button>
  );
}