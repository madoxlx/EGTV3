import { useQuery } from "@tanstack/react-query";
import type { Menu, MenuItem } from "@shared/schema";

interface MenuWithItems extends Menu {
  items: MenuItem[];
}

export function useMenu(location: string) {
  return useQuery({
    queryKey: ['/api/menus', location],
    queryFn: async (): Promise<MenuWithItems | null> => {
      const response = await fetch(`/api/menus/location/${location}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No menu found for this location
        }
        throw new Error('Failed to fetch menu');
      }
      const data = await response.json();
      // The API returns { menu, items }, we need to combine them
      return {
        ...data.menu,
        items: data.items || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useHeaderMenu() {
  return useQuery({
    queryKey: ['/api/menus', 'header'],
    queryFn: async (): Promise<MenuItem[]> => {
      const response = await fetch('/api/menus/location/header');
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No menu found, return empty array
        }
        throw new Error('Failed to fetch header menu');
      }
      const data = await response.json();
      // Return just the items array for the header
      return data.items || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}