import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Trash2, 
  Edit, 
  Plus, 
  ChevronRight, 
  Menu, 
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Types for Menu and MenuItem
interface Menu {
  id: number;
  name: string;
  location: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: number;
  title: string;
  url?: string;
  icon: string | null;
  iconType?: string;
  itemType?: string;
  order: number;
  menuId: number;
  parentId: number | null;
  target: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const NavigationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState(false);
  const [showMenuItemDialog, setShowMenuItemDialog] = useState(false);
  const [isMenuItemCreate, setIsMenuItemCreate] = useState(true);
  
  // Form states
  const [menuForm, setMenuForm] = useState({
    name: '',
    location: '',
    description: '',
    active: true
  });
  
  const [menuItemForm, setMenuItemForm] = useState({
    title: '',
    url: '',
    icon: '',
    iconType: 'fas',
    itemType: 'link',
    order: 0,
    menuId: 0,
    parentId: null as number | null,
    target: '_self',
    active: true
  });
  
  // Fetch all menus
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ['/api/menus'],
    queryFn: async () => {
      const response = await fetch('/api/menus');
      if (!response.ok) throw new Error('Failed to fetch menus');
      return response.json();
    }
  });
  
  // Fetch menu items for selected menu
  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: ['/api/menus', selectedMenu?.id, 'items'],
    queryFn: async () => {
      if (!selectedMenu) return [];
      const response = await fetch(`/api/menus/${selectedMenu.id}/items`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return response.json();
    },
    enabled: !!selectedMenu
  });

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/menus', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      toast({
        title: "Success",
        description: "Menu created successfully",
      });
      setShowMenuDialog(false);
      resetMenuForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu",
        variant: "destructive",
      });
    }
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/menus/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      toast({
        title: "Success",
        description: "Menu updated successfully",
      });
      setShowMenuDialog(false);
      resetMenuForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu",
        variant: "destructive",
      });
    }
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/menus/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });
      setSelectedMenu(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu",
        variant: "destructive",
      });
    }
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/menu-items', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus', selectedMenu?.id, 'items'] });
      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
      setShowMenuItemDialog(false);
      resetMenuItemForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    }
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/menu-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus', selectedMenu?.id, 'items'] });
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
      setShowMenuItemDialog(false);
      resetMenuItemForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item",
        variant: "destructive",
      });
    }
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/menu-items/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus', selectedMenu?.id, 'items'] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      location: '',
      description: '',
      active: true
    });
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      title: '',
      url: '',
      icon: '',
      iconType: 'fas',
      itemType: 'link',
      order: 0,
      menuId: selectedMenu?.id || 0,
      parentId: null,
      target: '_self',
      active: true
    });
  };

  const handleCreateMenu = () => {
    resetMenuForm();
    setShowMenuDialog(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuForm({
      name: menu.name,
      location: menu.location,
      description: menu.description || '',
      active: menu.active
    });
    setSelectedMenu(menu);
    setShowMenuDialog(true);
  };

  const handleDeleteMenu = (menu: Menu) => {
    if (window.confirm(`Are you sure you want to delete the menu "${menu.name}"?`)) {
      deleteMenuMutation.mutate(menu.id);
    }
  };

  const handleSelectMenu = (menu: Menu) => {
    setSelectedMenu(menu);
  };

  const handleCreateMenuItem = () => {
    if (!selectedMenu) return;
    
    resetMenuItemForm();
    setMenuItemForm(prev => ({
      ...prev,
      menuId: selectedMenu.id,
      order: menuItems.length + 1
    }));
    setIsMenuItemCreate(true);
    setShowMenuItemDialog(true);
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setMenuItemForm({
      title: menuItem.title,
      url: menuItem.url || '',
      icon: menuItem.icon || '',
      iconType: menuItem.iconType || 'fas',
      itemType: menuItem.itemType || 'link',
      order: menuItem.order,
      menuId: menuItem.menuId,
      parentId: menuItem.parentId,
      target: menuItem.target || '_self',
      active: menuItem.active
    });
    setSelectedMenuItem(menuItem);
    setIsMenuItemCreate(false);
    setShowMenuItemDialog(true);
  };

  const handleDeleteMenuItem = (menuItem: MenuItem) => {
    if (window.confirm(`Are you sure you want to delete the menu item "${menuItem.title}"?`)) {
      deleteMenuItemMutation.mutate(menuItem.id);
    }
  };

  const handleMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMenu && showMenuDialog) {
      updateMenuMutation.mutate({ id: selectedMenu.id, data: menuForm });
    } else {
      createMenuMutation.mutate(menuForm);
    }
  };

  const handleMenuItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMenuItemCreate) {
      createMenuItemMutation.mutate(menuItemForm);
    } else if (selectedMenuItem) {
      updateMenuItemMutation.mutate({ id: selectedMenuItem.id, data: menuItemForm });
    }
  };

  const organizeMenuItems = (items: MenuItem[] = []): { item: MenuItem, children: MenuItem[] }[] => {
    const topLevelItems = items.filter(item => !item.parentId);
    
    return topLevelItems.map(item => {
      const children = items.filter(child => child.parentId === item.id);
      return { item, children };
    });
  };

  const organizedMenuItems = organizeMenuItems(menuItems);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Navigation Menu Manager</h1>
            <p className="text-muted-foreground">
              Manage your website's navigation menus and links
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleCreateMenu} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Menu
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:text-primary">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Navigation Manager</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menus List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Menus
              </CardTitle>
              <CardDescription>
                Select a menu to manage its navigation items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {menusLoading ? (
                <div className="text-center py-4">Loading menus...</div>
              ) : menus.length > 0 ? (
                <div className="space-y-2">
                  {menus.map((menu: Menu) => (
                    <div
                      key={menu.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMenu?.id === menu.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectMenu(menu)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{menu.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {menu.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={menu.active ? "default" : "secondary"}>
                            {menu.active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMenu(menu);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMenu(menu);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Menu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No menus created yet</p>
                  <Button onClick={handleCreateMenu} className="mt-4">
                    Create Your First Menu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedMenu ? `${selectedMenu.name} Items` : 'Menu Items'}
                  </CardTitle>
                  <CardDescription>
                    {selectedMenu 
                      ? `Manage navigation items for the ${selectedMenu.name} menu`
                      : 'Select a menu to view and manage its items'
                    }
                  </CardDescription>
                </div>
                {selectedMenu && (
                  <Button onClick={handleCreateMenuItem} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedMenu ? (
                <div className="text-center py-12">
                  <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a menu from the left to view its navigation items
                  </p>
                </div>
              ) : menuItemsLoading ? (
                <div className="text-center py-8">Loading menu items...</div>
              ) : organizedMenuItems.length > 0 ? (
                <div className="space-y-4">
                  {organizedMenuItems.map(({ item, children }) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon && (
                            <i className={`${item.iconType} fa-${item.icon} text-lg`} />
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.url || 'No URL'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.active ? "default" : "secondary"}>
                            {item.active ? (
                              <Eye className="h-3 w-3 mr-1" />
                            ) : (
                              <EyeOff className="h-3 w-3 mr-1" />
                            )}
                            {item.active ? "Visible" : "Hidden"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMenuItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMenuItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {children.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-200">
                          <div className="space-y-2">
                            {children.map((child) => (
                              <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  {child.icon && (
                                    <i className={`${child.iconType} fa-${child.icon}`} />
                                  )}
                                  <span className="text-sm">{child.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMenuItem(child)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMenuItem(child)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No menu items found</p>
                  <Button onClick={handleCreateMenuItem} className="mt-4">
                    Add First Menu Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Dialog */}
        <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedMenu ? 'Edit Menu' : 'Create New Menu'}
              </DialogTitle>
              <DialogDescription>
                {selectedMenu 
                  ? 'Update the menu details below'
                  : 'Create a new navigation menu for your website'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu-name">Menu Name</Label>
                <Input
                  id="menu-name"
                  placeholder="e.g., Header Menu"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="menu-location">Location</Label>
                <Select 
                  value={menuForm.location} 
                  onValueChange={(value) => setMenuForm({ ...menuForm, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select menu location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="mobile">Mobile Menu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="menu-description">Description (Optional)</Label>
                <Textarea
                  id="menu-description"
                  placeholder="Brief description of this menu"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="menu-active">Active</Label>
                <Switch
                  id="menu-active"
                  checked={menuForm.active}
                  onCheckedChange={(checked) => setMenuForm({ ...menuForm, active: checked })}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowMenuDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuMutation.isPending || updateMenuMutation.isPending}>
                  {selectedMenu ? 'Update Menu' : 'Create Menu'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Menu Item Dialog */}
        <Dialog open={showMenuItemDialog} onOpenChange={setShowMenuItemDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isMenuItemCreate ? 'Create Menu Item' : 'Edit Menu Item'}
              </DialogTitle>
              <DialogDescription>
                {isMenuItemCreate 
                  ? 'Add a new navigation link to your menu'
                  : 'Update the menu item details below'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMenuItemSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input
                  id="item-title"
                  placeholder="e.g., Home, About Us"
                  value={menuItemForm.title}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-url">URL</Label>
                <Input
                  id="item-url"
                  placeholder="e.g., /, /about, https://example.com"
                  value={menuItemForm.url}
                  onChange={(e) => setMenuItemForm({ ...menuItemForm, url: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-icon">Icon (Optional)</Label>
                  <Input
                    id="item-icon"
                    placeholder="e.g., home, user, cog"
                    value={menuItemForm.icon}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, icon: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-order">Order</Label>
                  <Input
                    id="item-order"
                    type="number"
                    min="1"
                    value={menuItemForm.order}
                    onChange={(e) => setMenuItemForm({ ...menuItemForm, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-target">Link Target</Label>
                <Select 
                  value={menuItemForm.target} 
                  onValueChange={(value) => setMenuItemForm({ ...menuItemForm, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Window</SelectItem>
                    <SelectItem value="_blank">New Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="item-active">Active</Label>
                <Switch
                  id="item-active"
                  checked={menuItemForm.active}
                  onCheckedChange={(checked) => setMenuItemForm({ ...menuItemForm, active: checked })}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowMenuItemDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMenuItemMutation.isPending || updateMenuItemMutation.isPending}>
                  {isMenuItemCreate ? 'Create Item' : 'Update Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NavigationManager;