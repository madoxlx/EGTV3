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

export interface MenuItemWithChildren extends MenuItem {
  children?: MenuItemWithChildren[];
}

export function useHeaderMenu() {
  return useQuery({
    queryKey: ['/api/menus', 'header'],
    queryFn: async (): Promise<MenuItemWithChildren[]> => {
      const response = await fetch('/api/menus/location/header');
      if (!response.ok) {
        if (response.status === 404) {
          return []; // No menu found, return empty array
        }
        throw new Error('Failed to fetch header menu');
      }
      const data = await response.json();
      const items = data.items || [];
      
      // Organize items into parent-child hierarchy
      const itemMap = new Map<number, MenuItemWithChildren>();
      const parentItems: MenuItemWithChildren[] = [];
      
      // First pass: create all items and map them
      items.forEach((item: MenuItem) => {
        itemMap.set(item.id, { ...item, children: [] });
      });
      
      // Second pass: organize hierarchy
      items.forEach((item: MenuItem) => {
        const menuItem = itemMap.get(item.id)!;
        if (item.parent_id) {
          // This is a child item
          const parent = itemMap.get(item.parent_id);
          if (parent) {
            parent.children!.push(menuItem);
          }
        } else {
          // This is a parent item
          parentItems.push(menuItem);
        }
      });
      
      // Sort by order_position
      parentItems.sort((a, b) => a.order_position - b.order_position);
      parentItems.forEach(item => {
        if (item.children) {
          item.children.sort((a, b) => a.order_position - b.order_position);
        }
      });
      
      return parentItems;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}