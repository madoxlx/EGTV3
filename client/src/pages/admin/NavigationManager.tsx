import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Save, X, Navigation, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Menu, MenuItem } from '@shared/schema';

interface MenuWithItems extends Menu {
  items: MenuItem[];
}

export default function NavigationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Menu form state
  const [menuForm, setMenuForm] = useState({
    name: '',
    location: 'header',
    active: true,
    description: ''
  });

  // Menu item form state
  const [itemForm, setItemForm] = useState({
    title: '',
    url: '',
    icon: '',
    type: 'link',
    target: '_self',
    orderPosition: 1,
    active: true
  });

  // Fetch menus
  const { data: menus = [], isLoading: menusLoading } = useQuery({
    queryKey: ['/api/menus'],
    select: (data) => data || []
  });

  // Fetch menu items for selected menu
  const { data: menuItems = [], isLoading: itemsLoading, refetch: refetchMenuItems } = useQuery({
    queryKey: [`/api/menu-items/${selectedMenu?.id}`],
    enabled: !!selectedMenu,
    select: (data) => data || []
  });

  // Automatically refresh menu items when selected menu changes
  useEffect(() => {
    if (selectedMenu) {
      refetchMenuItems();
    }
  }, [selectedMenu, refetchMenuItems]);

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: (data: typeof menuForm) => apiRequest('/api/menus', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      setIsMenuDialogOpen(false);
      setMenuForm({ name: '', location: 'header', active: true, description: '' });
      toast({
        title: "Success",
        description: "Menu created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu",
        variant: "destructive",
      });
    }
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof menuForm }) => 
      apiRequest(`/api/menus/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      setIsMenuDialogOpen(false);
      setMenuForm({ name: '', location: 'header', active: true, description: '' });
      toast({
        title: "Success",
        description: "Menu updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu",
        variant: "destructive",
      });
    }
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/menus/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      if (selectedMenu) {
        setSelectedMenu(null);
      }
      toast({
        title: "Success",
        description: "Menu deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu",
        variant: "destructive",
      });
    }
  });

  // Create menu item mutation
  const createItemMutation = useMutation({
    mutationFn: (data: typeof itemForm & { menuId: number }) => 
      apiRequest('/api/menu-items', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      setIsItemDialogOpen(false);
      setItemForm({ title: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    }
  });

  // Update menu item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof itemForm }) => 
      apiRequest(`/api/menu-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      setIsItemDialogOpen(false);
      setItemForm({ title: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
    },
    onError: (error) => {
      // Only show error if it's not a 404 (item already deleted)
      if (!error.message?.includes('Menu item not found')) {
        toast({
          title: "Error",
          description: error.message || "Failed to update menu item",
          variant: "destructive",
        });
      }
    }
  });

  // Delete menu item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/menu-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    },
    onError: (error) => {
      // Only show error if it's not a 404 (item already deleted)
      if (!error.message?.includes('Menu item not found')) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete menu item",
          variant: "destructive",
        });
      }
    }
  });

  const handleCreateMenu = () => {
    createMenuMutation.mutate(menuForm);
  };

  const handleUpdateMenu = () => {
    if (selectedMenu) {
      updateMenuMutation.mutate({ id: selectedMenu.id, data: menuForm });
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setMenuForm({
      name: menu.name,
      location: menu.location,
      active: menu.active,
      description: menu.description || ''
    });
    setSelectedMenu(menu);
    setIsMenuDialogOpen(true);
  };

  const handleCreateItem = () => {
    if (selectedMenu) {
      const itemData = {
        ...itemForm,
        menuId: selectedMenu.id,
        // Ensure orderPosition is properly set
        orderPosition: itemForm.orderPosition || 1
      };
      createItemMutation.mutate(itemData);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: itemForm });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setItemForm({
      title: item.title || '',
      url: item.url || '',
      icon: item.icon || '',
      type: item.type || 'link',
      target: item.target || '_self',
      orderPosition: item.orderPosition || 1,
      active: item.active !== undefined ? item.active : true
    });
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const openCreateMenuDialog = () => {
    setMenuForm({ name: '', location: 'header', active: true, description: '' });
    setSelectedMenu(null);
    setIsMenuDialogOpen(true);
  };

  const openCreateItemDialog = () => {
    setItemForm({ title: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true });
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="w-8 h-8" />
            Navigation Manager
          </h1>
          <p className="text-muted-foreground">
            Manage website navigation menus and menu items
          </p>
        </div>
        <Button onClick={openCreateMenuDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Menu
        </Button>
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <Card>
            <CardHeader>
              <CardTitle>Menus</CardTitle>
              <CardDescription>
                Manage website navigation menus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {menusLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {menus.map((menu: Menu) => (
                    <div key={menu.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{menu.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Location: {menu.location}
                          </p>
                          {menu.description && (
                            <p className="text-sm text-muted-foreground">
                              {menu.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={menu.active ? "default" : "secondary"}>
                          {menu.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMenu(menu)}
                        >
                          Select
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMenu(menu)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMenuMutation.mutate(menu.id)}
                          disabled={deleteMenuMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Menu Items</span>
                {selectedMenu && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchMenuItems()}
                      disabled={itemsLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button onClick={openCreateItemDialog} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {selectedMenu 
                  ? `Managing items for "${selectedMenu.name}" menu`
                  : "Select a menu to manage its items"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedMenu ? (
                <div className="text-center py-8">
                  <Navigation className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    Select a menu from the Menus tab to manage its items
                  </p>
                </div>
              ) : itemsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {menuItems.map((item: MenuItem) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.url} • Order: {item.orderPosition}
                          </p>
                          {item.icon && (
                            <p className="text-sm text-muted-foreground">
                              Icon: {item.icon}
                            </p>
                          )}
                        </div>
                        <Badge variant={item.active ? "default" : "secondary"}>
                          {item.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this menu item?')) {
                              deleteItemMutation.mutate(item.id);
                            }
                          }}
                          disabled={deleteItemMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {menuItems.length === 0 && (
                    <div className="text-center py-8">
                      <LinkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-muted-foreground">
                        No menu items found. Create your first menu item!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMenu ? 'Edit Menu' : 'Create Menu'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="Enter menu name"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select 
                value={menuForm.location} 
                onValueChange={(value) => setMenuForm({ ...menuForm, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                  <SelectItem value="sidebar">Sidebar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Enter menu description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={menuForm.active}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={selectedMenu ? handleUpdateMenu : handleCreateMenu}
                disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {selectedMenu ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Create Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder="Enter menu item title"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={itemForm.url}
                onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                placeholder="Enter URL (e.g., /packages)"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                value={itemForm.icon}
                onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                placeholder="Enter icon name (e.g., home, package, map)"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={itemForm.type} 
                onValueChange={(value) => setItemForm({ ...itemForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target">Target</Label>
              <Select 
                value={itemForm.target} 
                onValueChange={(value) => setItemForm({ ...itemForm, target: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same Window</SelectItem>
                  <SelectItem value="_blank">New Window</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">Order Position</Label>
              <Input
                id="order"
                type="number"
                value={itemForm.orderPosition}
                onChange={(e) => setItemForm({ ...itemForm, orderPosition: parseInt(e.target.value) || 1 })}
                placeholder="Enter order position"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="item-active"
                checked={itemForm.active}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, active: checked })}
              />
              <Label htmlFor="item-active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}