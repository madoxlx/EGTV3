
import { useState, useEffect } from 'react';

export function useNavigationState() {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const setDropdownState = (itemId: string, isOpen: boolean) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: isOpen
    }));
  };

  const isDropdownOpen = (itemId: string) => openDropdowns[itemId] || false;

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  useEffect(() => {
    // Listen for clicks outside to close dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-radix-navigation-menu-content]')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return {
    openDropdowns,
    setDropdownState,
    isDropdownOpen,
    closeAllDropdowns
  };
}
