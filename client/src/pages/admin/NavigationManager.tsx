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
import { useLanguage } from '@/hooks/use-language';
import { apiRequest } from '@/lib/queryClient';
import type { Menu, MenuItem } from '@shared/schema';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDndMonitor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuWithItems extends Menu {
  items: MenuItem[];
}

// Sortable Menu Item Component
function SortableMenuItem({ item, menuItems, onEdit, onDelete, deleteItemMutation, isOverlay = false, isDragOver = false, t }: {
  item: MenuItem;
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  deleteItemMutation: any;
  isOverlay?: boolean;
  isDragOver?: boolean;
  t: (key: string, fallback?: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isChild = item.parentId !== null;
  const hasChildren = menuItems.some(menuItem => menuItem.parentId === item.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all ${
        isChild ? 'ml-8 border-l-4 border-l-blue-500 bg-blue-50' : ''
      } ${isDragging ? 'shadow-lg' : ''} ${
        isDragOver ? 'border-2 border-dashed border-green-500 bg-green-50' : ''
      } ${isOverlay ? 'shadow-xl bg-white' : ''}`}
    >
      <div className="flex items-center justify-between">
        {/* Drag handle area - only this part is draggable */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center gap-3 flex-1 cursor-move pr-4"
        >
          <LinkIcon className={`w-5 h-5 text-muted-foreground ${
            hasChildren ? 'text-blue-600' : ''
          }`} />
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              {isChild && <span className="text-blue-600">↳</span>}
              {item.title}
              {item.titleAr && (
                <span className="text-sm text-muted-foreground">({item.titleAr})</span>
              )}
              {hasChildren && <Badge variant="outline" className="text-xs">{t('admin.navigation.status.hasChildren', 'Has children')}</Badge>}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.url} • Order: {item.orderPosition}
              {item.parentId && (
                <span className="text-blue-600">
                  {' • '}{t('admin.navigation.status.childOf', 'Child of:')} {menuItems.find(parent => parent.id === item.parentId)?.title}
                </span>
              )}
            </p>
            {/* Drop zone indicator */}
            {isDragOver && !isChild && (
              <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded mt-1">
                <span>Drop here to make child item</span>
              </div>
            )}
            {item.icon && (
              <p className="text-sm text-muted-foreground">
                Icon: {item.icon}
              </p>
            )}
          </div>
          <Badge variant={item.active ? "default" : "secondary"}>
            {item.active ? t('admin.navigation.menus.active', 'Active') : 'Inactive'}
          </Badge>
        </div>
        
        {/* Action buttons - separate from drag area */}
        <div className="flex items-center gap-2 cursor-default">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit(item);
            }}
            disabled={deleteItemMutation.isPending}
            className="cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (window.confirm(t('admin.navigation.actions.delete', 'Are you sure you want to delete this menu item?'))) {
                onDelete(item.id);
              }
            }}
            disabled={deleteItemMutation.isPending}
            className="cursor-pointer"
          >
            {deleteItemMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NavigationManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

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
    titleAr: '',
    url: '',
    icon: '',
    type: 'link',
    target: '_self',
    orderPosition: 1,
    active: true,
    parentId: null as number | null
  });

  // Fetch menus
  const { data: menus = [], isLoading: menusLoading } = useQuery<Menu[]>({
    queryKey: ['/api/menus'],
    select: (data) => (data as Menu[]) || []
  });

  // Fetch menu items for selected menu
  const { data: menuItems = [], isLoading: itemsLoading, refetch: refetchMenuItems } = useQuery<MenuItem[]>({
    queryKey: [`/api/menu-items/${selectedMenu?.id}`],
    enabled: !!selectedMenu,
    select: (data) => (data as MenuItem[]) || []
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
        title: t('admin.navigation.success.menuCreated', 'Success'),
        description: t('admin.navigation.success.menuCreated', 'Menu created successfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.navigation.error.createMenu', 'Error'),
        description: error.message || t('admin.navigation.error.createMenu', 'Failed to create menu'),
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
        title: t('admin.navigation.success.menuUpdated', 'Success'),
        description: t('admin.navigation.success.menuUpdated', 'Menu updated successfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.navigation.error.updateMenu', 'Error'),
        description: error.message || t('admin.navigation.error.updateMenu', 'Failed to update menu'),
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
        title: t('admin.navigation.success.menuDeleted', 'Success'),
        description: t('admin.navigation.success.menuDeleted', 'Menu deleted successfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.navigation.error.deleteMenu', 'Error'),
        description: error.message || t('admin.navigation.error.deleteMenu', 'Failed to delete menu'),
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
      // Invalidate multiple cache patterns to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items', selectedMenu?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      
      // Force refetch to ensure immediate UI update
      if (selectedMenu) {
        refetchMenuItems();
      }
      
      setIsItemDialogOpen(false);
      setItemForm({ title: '', titleAr: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true, parentId: null });
      setEditingItem(null);
      toast({
        title: t('admin.navigation.success.itemCreated', 'Success'),
        description: t('admin.navigation.success.itemCreated', 'Menu item created successfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.navigation.error.createItem', 'Error'),
        description: error.message || t('admin.navigation.error.createItem', 'Failed to create menu item'),
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
      // Invalidate multiple cache patterns to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items', selectedMenu?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      
      // Force refetch to ensure immediate UI update
      if (selectedMenu) {
        refetchMenuItems();
      }
      
      setIsItemDialogOpen(false);
      setItemForm({ title: '', titleAr: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true, parentId: null });
      setEditingItem(null);
      toast({
        title: t('admin.navigation.success.itemUpdated', 'Success'),
        description: t('admin.navigation.success.itemUpdated', 'Menu item updated successfully'),
      });
    },
    onError: (error) => {
      // Only show error if it's not a 404 (item already deleted)
      if (!error.message?.includes('Menu item not found')) {
        toast({
          title: t('admin.navigation.error.updateItem', 'Error'),
          description: error.message || t('admin.navigation.error.updateItem', 'Failed to update menu item'),
          variant: "destructive",
        });
      }
    }
  });

  // Delete menu item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/menu-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      // Invalidate multiple cache patterns to ensure UI updates
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items', selectedMenu?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus'] });
      
      // Force refetch to ensure immediate UI update
      if (selectedMenu) {
        refetchMenuItems();
      }
      
      toast({
        title: t('admin.navigation.success.itemDeleted', 'Success'),
        description: t('admin.navigation.success.itemDeleted', 'Menu item deleted successfully'),
      });
    },
    onError: (error) => {
      // Only show error if it's not a 404 (item already deleted)
      if (!error.message?.includes('Menu item not found')) {
        toast({
          title: t('admin.navigation.error.deleteItem', 'Error'),
          description: error.message || t('admin.navigation.error.deleteItem', 'Failed to delete menu item'),
          variant: "destructive",
        });
      }
    }
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reorder menu items mutation
  const reorderItemsMutation = useMutation({
    mutationFn: async (updates: { id: number; orderPosition: number }[]) => {
      // Update multiple menu items with new order positions
      const promises = updates.map(update => 
        apiRequest(`/api/menu-items/${update.id}`, {
          method: 'PUT',
          body: JSON.stringify({ orderPosition: update.orderPosition })
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/menu-items/${selectedMenu?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items', selectedMenu?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/location/header'] });
      if (selectedMenu) {
        refetchMenuItems();
      }
      toast({
        title: t('admin.navigation.success.itemsReordered', 'Success'),
        description: t('admin.navigation.success.itemsReordered', 'Menu items reordered successfully'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.navigation.error.reorderItems', 'Error'),
        description: error.message || t('admin.navigation.error.reorderItems', 'Failed to reorder menu items'),
        variant: "destructive",
      });
    }
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = menuItems.find(item => item.id === active.id);
    setDraggedItem(item || null);
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as number || null);
  };

  // Handle drag end with support for parent-child relationships
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedItem(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedItem = menuItems.find(item => item.id === active.id);
    const targetItem = menuItems.find(item => item.id === over.id);

    if (!draggedItem || !targetItem) return;

    // Check if we're dropping onto a potential parent item
    const isDropOnParent = targetItem.parentId === null && draggedItem.id !== targetItem.id;
    
    if (isDropOnParent && draggedItem.parentId !== targetItem.id) {
      // Make the dragged item a child of the target item
      const updateData = {
        title: draggedItem.title,
        titleAr: draggedItem.titleAr || '',
        url: draggedItem.url || '',
        icon: draggedItem.icon || '',
        type: draggedItem.type || 'link',
        target: draggedItem.target || '_self',
        active: draggedItem.active !== null ? Boolean(draggedItem.active) : true,
        parentId: targetItem.id,
        orderPosition: 1 // Set as first child
      };
      
      updateItemMutation.mutate({ id: draggedItem.id, data: updateData });
    } else {
      // Normal reordering behavior
      const oldIndex = menuItems.findIndex(item => item.id === active.id);
      const newIndex = menuItems.findIndex(item => item.id === over.id);
      
      const reorderedItems = arrayMove(menuItems, oldIndex, newIndex);
      
      // Update order positions based on new array positions
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        orderPosition: index + 1
      }));
      
      reorderItemsMutation.mutate(updates);
    }
  };

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
      active: menu.active !== null ? Boolean(menu.active) : true,
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
    if (editingItem && selectedMenu) {
      const itemData = {
        ...itemForm,
        // Don't send menuId on update - menu items cannot change their parent menu
        // menuId: selectedMenu.id,
        // Ensure orderPosition is properly set
        orderPosition: itemForm.orderPosition || 1
      };
      updateItemMutation.mutate({ id: editingItem.id, data: itemData });
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setItemForm({
      title: item.title || '',
      titleAr: item.titleAr || '',
      url: item.url || '',
      icon: item.icon || '',
      type: item.type || 'link',
      target: item.target || '_self',
      orderPosition: item.orderPosition || 1,
      active: item.active !== null ? Boolean(item.active) : true,
      parentId: item.parentId || null
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
    setItemForm({ title: '', titleAr: '', url: '', icon: '', type: 'link', target: '_self', orderPosition: 1, active: true, parentId: null });
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="w-8 h-8" />
            {t('admin.navigation.title', 'Navigation Manager')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.navigation.description', 'Manage website navigation menus')}
          </p>
        </div>
        <Button onClick={openCreateMenuDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.navigation.menus.create', 'Create Menu')}
        </Button>
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menus">{t('admin.navigation.menus.title', 'Menus')}</TabsTrigger>
          <TabsTrigger value="items">{t('admin.navigation.items.title', 'Menu Items')}</TabsTrigger>
        </TabsList>

        <TabsContent value="menus">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.navigation.menus.title', 'Menus')}</CardTitle>
              <CardDescription>
                {t('admin.navigation.description', 'Manage website navigation menus')}
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
                            {t('admin.navigation.menus.location', 'Location')}: {menu.location}
                          </p>
                          {menu.description && (
                            <p className="text-sm text-muted-foreground">
                              {menu.description}
                            </p>
                          )}
                        </div>
                        <Badge variant={menu.active ? "default" : "secondary"}>
                          {menu.active ? t('admin.navigation.menus.active', 'Active') : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMenu(menu)}
                        >
                          {t('admin.navigation.menus.select', 'Select')}
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
                <span>{t('admin.navigation.items.title', 'Menu Items')}</span>
                {selectedMenu && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchMenuItems()}
                      disabled={itemsLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t('admin.navigation.items.refresh', 'Refresh')}
                    </Button>
                    <Button onClick={openCreateItemDialog} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.navigation.items.addItem', 'Add Item')}
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {selectedMenu 
                  ? `${t('admin.navigation.items.managingFor', 'Managing items for')} "${selectedMenu.name}" ${t('admin.navigation.items.menu', 'menu')}`
                  : t('admin.navigation.items.selectMenu', 'Select a menu to manage its items')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedMenu ? (
                <div className="text-center py-8">
                  <Navigation className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    {t('admin.navigation.items.selectMenuPrompt', 'Select a menu from the Menus tab to manage its items')}
                  </p>
                </div>
              ) : itemsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={menuItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {menuItems
                        .sort((a, b) => (a.orderPosition || 0) - (b.orderPosition || 0))
                        .map((item: MenuItem) => (
                          <SortableMenuItem
                            key={item.id}
                            item={item}
                            menuItems={menuItems}
                            onEdit={handleEditItem}
                            onDelete={(id) => deleteItemMutation.mutate(id)}
                            deleteItemMutation={deleteItemMutation}
                            isDragOver={overId === item.id && draggedItem?.id !== item.id}
                            t={t}
                          />
                        ))}
                      {menuItems.length === 0 && (
                        <div className="text-center py-8">
                          <LinkIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-muted-foreground">
                            {t('admin.navigation.items.emptyState', 'No menu items found. Create your first menu item!')}
                          </p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {draggedItem && (
                      <SortableMenuItem
                        item={draggedItem}
                        menuItems={menuItems}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        deleteItemMutation={deleteItemMutation}
                        isOverlay={true}
                        t={t}
                      />
                    )}
                  </DragOverlay>
                </DndContext>
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
              {selectedMenu ? t('admin.navigation.menus.editMenu', 'Edit Menu') : t('admin.navigation.menus.createMenu', 'Create Menu')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('admin.navigation.menus.menuName', 'Menu Name')}</Label>
              <Input
                id="name"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder={t('admin.navigation.menus.menuNamePlaceholder', 'Enter menu name')}
              />
            </div>
            <div>
              <Label htmlFor="location">{t('admin.navigation.menus.location', 'Location')}</Label>
              <Select 
                value={menuForm.location} 
                onValueChange={(value) => setMenuForm({ ...menuForm, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.navigation.menus.selectLocation', 'Select location')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">{t('admin.navigation.menus.header', 'Header')}</SelectItem>
                  <SelectItem value="footer">{t('admin.navigation.menus.footer', 'Footer')}</SelectItem>
                  <SelectItem value="sidebar">{t('admin.navigation.menus.sidebar', 'Sidebar')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">{t('admin.navigation.menus.description', 'Description')}</Label>
              <Input
                id="description"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder={t('admin.navigation.menus.descriptionPlaceholder', 'Enter menu description')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={menuForm.active}
                onCheckedChange={(checked) => setMenuForm({ ...menuForm, active: checked })}
              />
              <Label htmlFor="active">{t('admin.navigation.menus.active', 'Active')}</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                {t('admin.navigation.dialog.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={selectedMenu ? handleUpdateMenu : handleCreateMenu}
                disabled={createMenuMutation.isPending || updateMenuMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {selectedMenu ? t('admin.navigation.dialog.update', 'Update') : t('admin.navigation.dialog.create', 'Create')}
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
              {editingItem ? t('admin.navigation.items.editItem', 'Edit Menu Item') : t('admin.navigation.items.createItem', 'Create Menu Item')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t('admin.navigation.items.titleEnglish', 'Title (English)')}</Label>
              <Input
                id="title"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder={t('admin.navigation.items.titleEnglishPlaceholder', 'Enter menu item title in English')}
              />
            </div>
            <div>
              <Label htmlFor="titleAr">{t('admin.navigation.items.titleArabic', 'Title (Arabic)')}</Label>
              <Input
                id="titleAr"
                value={itemForm.titleAr}
                onChange={(e) => setItemForm({ ...itemForm, titleAr: e.target.value })}
                placeholder={t('admin.navigation.items.titleArabicPlaceholder', 'أدخل عنوان عنصر القائمة بالعربية')}
                style={{ direction: 'rtl' }}
              />
            </div>
            <div>
              <Label htmlFor="url">{t('admin.navigation.items.url', 'URL')}</Label>
              <Input
                id="url"
                value={itemForm.url}
                onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                placeholder={t('admin.navigation.items.urlPlaceholder', 'Enter URL (e.g., /packages)')}
              />
            </div>
            <div>
              <Label htmlFor="icon">{t('admin.navigation.items.icon', 'Icon')}</Label>
              <Input
                id="icon"
                value={itemForm.icon}
                onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                placeholder={t('admin.navigation.items.iconPlaceholder', 'Enter icon name (e.g., home, package, map)')}
              />
            </div>
            <div>
              <Label htmlFor="type">{t('admin.navigation.items.type', 'Type')}</Label>
              <Select 
                value={itemForm.type} 
                onValueChange={(value) => setItemForm({ ...itemForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.navigation.items.selectType', 'Select type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">{t('admin.navigation.items.typeLink', 'Link')}</SelectItem>
                  <SelectItem value="button">{t('admin.navigation.items.typeButton', 'Button')}</SelectItem>
                  <SelectItem value="dropdown">{t('admin.navigation.items.typeDropdown', 'Dropdown')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target">{t('admin.navigation.items.target', 'Target')}</Label>
              <Select 
                value={itemForm.target} 
                onValueChange={(value) => setItemForm({ ...itemForm, target: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.navigation.items.selectTarget', 'Select target')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">{t('admin.navigation.items.targetSame', 'Same Window')}</SelectItem>
                  <SelectItem value="_blank">{t('admin.navigation.items.targetNew', 'New Window')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent">{t('admin.navigation.items.parentItem', 'Parent Item')}</Label>
              <Select 
                value={itemForm.parentId?.toString() || 'none'} 
                onValueChange={(value) => setItemForm({ ...itemForm, parentId: value === 'none' ? null : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.navigation.items.selectParent', 'Select parent item (optional)')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('admin.navigation.items.noParent', 'None (Top Level)')}</SelectItem>
                  {menuItems
                    .filter(item => !editingItem || item.id !== editingItem.id) // Don't show self as parent
                    .map(item => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">{t('admin.navigation.items.orderPosition', 'Order Position')}</Label>
              <Input
                id="order"
                type="number"
                value={itemForm.orderPosition}
                onChange={(e) => setItemForm({ ...itemForm, orderPosition: parseInt(e.target.value) || 1 })}
                placeholder={t('admin.navigation.items.orderPositionPlaceholder', 'Enter order position')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="item-active"
                checked={itemForm.active}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, active: checked })}
              />
              <Label htmlFor="item-active">{t('admin.navigation.items.active', 'Active')}</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                {t('admin.navigation.dialog.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? t('admin.navigation.dialog.update', 'Update') : t('admin.navigation.dialog.create', 'Create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}