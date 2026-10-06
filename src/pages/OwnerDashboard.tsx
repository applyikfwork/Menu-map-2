import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  UtensilsCrossed, 
  QrCode, 
  Phone, 
  Clock, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Save, 
  Edit, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Eye, 
  Check, 
  X, 
  Printer, 
  RefreshCw, 
  Star, 
  Flame, 
  Tag, 
  Layers, 
  MapPin, 
  DollarSign,
  Search,
  Filter
} from 'lucide-react';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  RestaurantOwnerAccount,
  DietaryOption,
  DietaryTag
} from '../types/database';
import { 
  api, 
  getCurrentOwnerSession, 
  logoutRestaurantOwner 
} from '../lib/supabase';
import { compressImageFile, CompressionResult } from '../lib/imageCompressor';
import { RestaurantQrModal } from '../components/RestaurantQrModal';
import { useToast } from '../components/Toast';

interface OwnerDashboardProps {
  navigate: (path: string) => void;
}

type OwnerTab = 'menu' | 'categories' | 'profile' | 'standee';

const COMMON_FACILITIES = [
  'Free Wi-Fi',
  'Air Conditioned',
  'Outdoor Seating',
  'Valet Parking',
  'Live Music',
  'Pet Friendly',
  'Private Dining Area',
  'Card Payment Accepted',
  'UPI Accepted',
  'Wheelchair Accessible',
  'Smoking Area',
];

const COMMON_DIETARY_OPTIONS: DietaryOption[] = [
  'Pure Veg',
  'Vegan Options',
  'Gluten-Free Options',
  'Halal',
  'Jain Friendly',
];

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ navigate }) => {
  const { showToast } = useToast();
  const [session, setSession] = useState<RestaurantOwnerAccount | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Section Tab
  const [activeTab, setActiveTab] = useState<OwnerTab>('menu');

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Filter / Search inside dishes
  const [dishSearch, setDishSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // --------------------------------------------------------------------------
  // DISH ADD / EDIT MODAL STATE
  // --------------------------------------------------------------------------
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 199,
    category_id: '',
    dietary_tags: ['Veg'],
    spice_level: 1,
    image_url: '',
    is_available: true,
    is_featured: false,
  });
  const [dishImageCompressing, setDishImageCompressing] = useState(false);
  const [dishImageCompressionStats, setDishImageCompressionStats] = useState<CompressionResult | null>(null);
  const dishFileInputRef = useRef<HTMLInputElement>(null);
  const [savingDish, setSavingDish] = useState(false);

  // --------------------------------------------------------------------------
  // CATEGORY MODAL STATE
  // --------------------------------------------------------------------------
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Partial<MenuCategory>>({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });
  const [savingCat, setSavingCat] = useState(false);

  // --------------------------------------------------------------------------
  // RESTAURANT PROFILE EDITING STATE
  // --------------------------------------------------------------------------
  const [profileData, setProfileData] = useState<Partial<Restaurant>>({});
  const [coverCompressing, setCoverCompressing] = useState(false);
  const [coverCompressionStats, setCoverCompressionStats] = useState<CompressionResult | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const active = getCurrentOwnerSession();
    if (!active) {
      navigate('/owner/login');
      return;
    }
    setSession(active);
    loadOwnerData(active);
  }, []);

  const loadOwnerData = async (owner: RestaurantOwnerAccount) => {
    setLoading(true);
    try {
      const rest = await api.getRestaurantById(owner.restaurant_id);
      if (rest) {
        setRestaurant(rest);
        setProfileData({ ...rest });

        const [cats, items] = await Promise.all([
          api.getCategories(rest.id),
          api.getMenuItems(rest.id),
        ]);
        setCategories(cats);
        setMenuItems(items);

        if (cats.length > 0 && !editingItem.category_id) {
          setEditingItem((prev) => ({ ...prev, category_id: cats[0].id }));
        }
      }
    } catch (e) {
      showToast('Error loading restaurant dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutRestaurantOwner();
    showToast('Logged out of Owner Portal.', 'info');
    navigate('/');
  };

  // --------------------------------------------------------------------------
  // QUICK LIVE STATUS TOGGLE
  // --------------------------------------------------------------------------
  const handleQuickToggleOpen = async (isOpen: boolean) => {
    if (!restaurant) return;
    try {
      const updated = await api.updateRestaurant(restaurant.id, { is_open: isOpen });
      if (updated) {
        setRestaurant(updated);
        setProfileData((prev) => ({ ...prev, is_open: isOpen }));
        showToast(`Store status set to ${isOpen ? 'OPEN' : 'CLOSED'} live on Menu Maps!`, 'success');
      }
    } catch (e) {
      showToast('Failed to update status.', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // DISH CRUD & IMAGE COMPRESSION (< 1MB)
  // --------------------------------------------------------------------------
  const handleOpenAddDish = () => {
    setEditingItem({
      restaurant_id: restaurant?.id,
      name: '',
      description: '',
      price: 199,
      category_id: categories[0]?.id || '',
      dietary_tags: ['Veg'],
      spice_level: 1,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      is_available: true,
      is_featured: false,
    });
    setDishImageCompressionStats(null);
    setDishModalOpen(true);
  };

  const handleOpenEditDish = (item: MenuItem) => {
    setEditingItem({ ...item });
    setDishImageCompressionStats(null);
    setDishModalOpen(true);
  };

  const handleDishImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDishImageCompressing(true);
    try {
      // Automatic client-side canvas compression guaranteed below 1 MB
      const compressed = await compressImageFile(file, 1400, 900 * 1024);
      setDishImageCompressionStats(compressed);
      setEditingItem((prev) => ({ ...prev, image_url: compressed.dataUrl }));
      showToast(
        `✓ Image compressed: ${(compressed.originalSizeKb / 1024).toFixed(1)} MB ➔ ${compressed.compressedSizeKb} KB (< 1 MB)`,
        'success'
      );
    } catch (err) {
      console.error('Image compression failed:', err);
      showToast('Could not compress image. Please choose another file.', 'error');
    } finally {
      setDishImageCompressing(false);
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!editingItem.name?.trim()) {
      showToast('Dish name is required.', 'error');
      return;
    }
    if (!editingItem.category_id) {
      showToast('Please select or create a category first.', 'error');
      return;
    }

    setSavingDish(true);
    try {
      const saved = await api.saveMenuItem({
        ...editingItem,
        restaurant_id: restaurant.id,
        price: Number(editingItem.price) || 0,
      });

      setMenuItems((prev) => {
        const idx = prev.findIndex((i) => i.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      setDishModalOpen(false);
      showToast(`✓ "${saved.name}" saved to menu successfully!`, 'success');
    } catch (e) {
      showToast('Failed to save dish.', 'error');
    } finally {
      setSavingDish(false);
    }
  };

  const handleDeleteDish = async (itemId: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${itemName}" from your menu?`)) {
      return;
    }
    try {
      await api.deleteMenuItem(itemId);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast(`Removed "${itemName}" from menu.`, 'info');
    } catch (e) {
      showToast('Failed to delete dish.', 'error');
    }
  };

  const handleToggleDishAvailability = async (item: MenuItem) => {
    try {
      const updated = await api.saveMenuItem({
        ...item,
        is_available: !item.is_available,
      });
      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_available: !m.is_available } : m))
      );
      showToast(
        `"${item.name}" marked as ${!item.is_available ? 'In Stock (Available)' : 'Out of Stock'}!`,
        'success'
      );
    } catch (e) {
      showToast('Could not update item availability.', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // CATEGORIES CRUD
  // --------------------------------------------------------------------------
  const handleOpenAddCat = () => {
    setEditingCat({
      restaurant_id: restaurant?.id,
      name: '',
      description: '',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: MenuCategory) => {
    setEditingCat({ ...cat });
    setCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!editingCat.name?.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    setSavingCat(true);
    try {
      const saved = await api.saveCategory({
        ...editingCat,
        restaurant_id: restaurant.id,
      });

      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [...prev, saved];
      });

      setCatModalOpen(false);
      showToast(`✓ Category "${saved.name}" saved!`, 'success');
    } catch (e) {
      showToast('Failed to save category.', 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async (catId: string, catName: string) => {
    const dishCount = menuItems.filter((i) => i.category_id === catId).length;
    if (
      !window.confirm(
        `Are you sure you want to delete category "${catName}"? This category contains ${dishCount} dish(es).`
      )
    ) {
      return;
    }
    try {
      await api.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setMenuItems((prev) => prev.filter((i) => i.category_id !== catId));
      showToast(`Deleted category "${catName}".`, 'info');
    } catch (e) {
      showToast('Failed to delete category.', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // RESTAURANT COVER PHOTO COMPRESSION (< 1MB) & PROFILE UPDATE
  // --------------------------------------------------------------------------
  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverCompressing(true);
    try {
      const compressed = await compressImageFile(file, 1800, 950 * 1024);
      setCoverCompressionStats(compressed);
      setProfileData((prev) => ({ ...prev, cover_image_url: compressed.dataUrl }));
      showToast(
        `✓ Cover image compressed: ${(compressed.originalSizeKb / 1024).toFixed(1)} MB ➔ ${compressed.compressedSizeKb} KB (< 1 MB)`,
        'success'
      );
    } catch (err) {
      console.error('Cover compression error:', err);
      showToast('Failed to compress cover image.', 'error');
    } finally {
      setCoverCompressing(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSavingProfile(true);
    try {
      const updated = await api.updateRestaurant(restaurant.id, {
        name: profileData.name?.trim() || restaurant.name,
        short_description: profileData.short_description?.trim(),
        long_description: profileData.long_description?.trim(),
        address_line1: profileData.address_line1?.trim(),
        landmark: profileData.landmark?.trim(),
        city: profileData.city?.trim(),
        phone: profileData.phone?.trim(),
        whatsapp_number: profileData.whatsapp_number?.trim(),
        average_cost_for_two: Number(profileData.average_cost_for_two) || 500,
        price_range: profileData.price_range || '₹₹',
        cover_image_url: profileData.cover_image_url || restaurant.cover_image_url,
        facilities: profileData.facilities || [],
        dietary_options: profileData.dietary_options || [],
        is_open: profileData.is_open ?? restaurant.is_open,
      });

      if (updated) {
        setRestaurant(updated);
        setProfileData({ ...updated });
        showToast('✓ Restaurant profile details updated live!', 'success');
      }
    } catch (e) {
      showToast('Could not save profile changes.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !restaurant || !session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-heading font-black text-xs uppercase tracking-wider">
            Loading Owner Portal...
          </p>
        </div>
      </div>
    );
  }

  // Direct clean root URL: https://menumape.vercel.app/${slug}
  const cleanPublicUrl = `${window.location.origin}/${restaurant.slug}`;

  // Filtered dishes for menu list
  const filteredDishes = menuItems.filter((item) => {
    if (selectedCatFilter !== 'all' && item.category_id !== selectedCatFilter) {
      return false;
    }
    if (dishSearch.trim()) {
      const q = dishSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20">
      {/* ==================================================================== */}
      {/* TOP OWNER BANNER */}
      {/* ==================================================================== */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-heading font-black text-xl shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-black text-lg sm:text-xl text-white">
                  {restaurant.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Owner Portal</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Owner: <strong className="text-slate-200">{session.owner_name}</strong> • Phone: {session.phone_number} • {cleanPublicUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={cleanPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Menu</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>Table QR Standee</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
              title="Sign Out of Owner Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-800/80 overflow-x-auto py-2">
          {[
            { id: 'menu', label: `Menu Dishes (${menuItems.length})`, icon: UtensilsCrossed },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'profile', label: 'Restaurant Profile & Photo', icon: Building2 },
            { id: 'standee', label: 'Table Standee & QR', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OwnerTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN OWNER WORKSPACE */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Top Quick Status Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                restaurant.is_open ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' : 'bg-red-500'
              }`}
            />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                Live Store Status
              </span>
              <span className="font-heading font-black text-lg text-slate-900">
                {restaurant.is_open ? 'Restaurant is Open for Dining & Orders' : 'Restaurant is Currently Closed'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickToggleOpen(true)}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                restaurant.is_open
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              Set Open Now
            </button>
            <button
              onClick={() => handleQuickToggleOpen(false)}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                !restaurant.is_open
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              Set Closed
            </button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* TAB 1: MENU DISHES FULL CRUD */}
        {/* ================================================================ */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Header with Search and Add Dish */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
                <div>
                  <h2 className="font-heading font-black text-xl text-slate-900">
                    Menu Dishes Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add new items, edit prices, upload photos (under 1 MB auto-compressed), and toggle stock status.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddDish}
                  className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Dish</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dishSearch}
                    onChange={(e) => setDishSearch(e.target.value)}
                    placeholder="Search dishes by name or description..."
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedCatFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                      selectedCatFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    All ({menuItems.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCatFilter(c.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                        selectedCatFilter === c.id
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                      }`}
                    >
                      {c.name} ({menuItems.filter((i) => i.category_id === c.id).length})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dishes Grid / List */}
            {filteredDishes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-heading font-black text-base text-slate-700">
                  No dishes found
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the "+ Add New Dish" button above to add your first menu item with photos and pricing!
                </p>
                <button
                  onClick={handleOpenAddDish}
                  className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Add Your First Dish
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDishes.map((item) => {
                  const cat = categories.find((c) => c.id === item.category_id);
                  const isVeg = item.dietary_tags.includes('Veg');
                  const isNonVeg = item.dietary_tags.includes('Non-veg');

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      <div className="flex gap-3.5">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                            }}
                          />
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-[10px] font-black text-white px-1 py-0.5 rounded bg-red-600">
                                OUT
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isVeg && (
                              <span className="w-3.5 h-3.5 rounded border border-emerald-600 flex items-center justify-center p-0.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              </span>
                            )}
                            {isNonVeg && (
                              <span className="w-3.5 h-3.5 rounded border border-red-600 flex items-center justify-center p-0.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              </span>
                            )}
                            <h4 className="font-heading font-black text-sm text-slate-900 truncate">
                              {item.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-heading font-black text-sm text-emerald-700">
                              ₹{item.price}
                            </span>
                            {cat && (
                              <span className="text-[10px] font-bold text-slate-500 bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                {cat.name}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dish Action Row */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleDishAvailability(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            item.is_available
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {item.is_available ? '● In Stock' : '✕ Out of Stock'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditDish(item)}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                            title="Edit Dish"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(item.id, item.name)}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: MENU CATEGORIES */}
        {/* ================================================================ */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-black text-xl text-slate-900">
                  Menu Sections & Categories
                </h2>
                <p className="text-xs text-slate-500">
                  Organize your menu into sections like "Wood-Fired Pizzas", "Beverages", "Burgers & Sides".
                </p>
              </div>
              <button
                onClick={handleOpenAddCat}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => {
                const count = menuItems.filter((i) => i.category_id === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-heading font-black text-sm text-slate-900">
                          {cat.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 pl-8">
                        {count} {count === 1 ? 'Dish' : 'Dishes'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditCat(cat)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
                        title="Edit Category Name"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCat(cat.id, cat.name)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: RESTAURANT PROFILE & COVER PHOTO */}
        {/* ================================================================ */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Cover Photo Upload with Auto-Compression (<1MB) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Restaurant Cover Photo (under 1 MB Auto-Compressed)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any high-resolution photo from your phone or PC. Our system will automatically compress it strictly below 1 MB for fast loading.
                </p>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-stone-900 border border-stone-200">
                <img
                  src={profileData.cover_image_url || restaurant.cover_image_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={coverCompressing}
                    className="px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-900 font-black text-xs flex items-center gap-2 shadow-xl backdrop-blur-xs transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4 text-orange-600" />
                    <span>
                      {coverCompressing ? 'Compressing Image...' : 'Upload & Compress Cover Photo'}
                    </span>
                  </button>
                </div>
              </div>

              {coverCompressionStats && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span>
                    ✓ Compressed from {(coverCompressionStats.originalSizeKb / 1024).toFixed(1)} MB ➔{' '}
                    <strong>{coverCompressionStats.compressedSizeKb} KB</strong> (Strictly under 1 MB)
                  </span>
                  <span className="font-bold">{coverCompressionStats.width}x{coverCompressionStats.height}px</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-base text-slate-900 pb-2 border-b border-stone-100">
                Basic Restaurant Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Order Receiver Number * (For 0% commission direct orders)
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileData.whatsapp_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, whatsapp_number: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost for Two (INR)
                  </label>
                  <input
                    type="number"
                    value={profileData.average_cost_for_two || 500}
                    onChange={(e) => setProfileData({ ...profileData, average_cost_for_two: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Tagline / Description
                </label>
                <input
                  type="text"
                  value={profileData.short_description || ''}
                  onChange={(e) => setProfileData({ ...profileData, short_description: e.target.value })}
                  placeholder="e.g. Cozy cafe serving authentic wood-fired pizzas and gourmet coffee."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Description & Story
                </label>
                <textarea
                  rows={3}
                  value={profileData.long_description || ''}
                  onChange={(e) => setProfileData({ ...profileData, long_description: e.target.value })}
                  placeholder="Tell your restaurant's story, special ingredients, ambiance, and chef favorites..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={profileData.address_line1 || ''}
                    onChange={(e) => setProfileData({ ...profileData, address_line1: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileData.city || 'Delhi NCR'}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Facilities & Dietary Badges */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-base text-slate-900 pb-2 border-b border-stone-100">
                Facilities & Dining Vibes
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_FACILITIES.map((facility) => {
                  const isChecked = profileData.facilities?.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => {
                        const current = profileData.facilities || [];
                        const updated = isChecked
                          ? current.filter((f) => f !== facility)
                          : [...current, facility];
                        setProfileData({ ...profileData, facilities: updated });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {facility}
                    </button>
                  );
                })}
              </div>

              <h4 className="font-heading font-black text-xs text-slate-800 pt-3">
                Dietary Options
              </h4>
              <div className="flex flex-wrap gap-2">
                {COMMON_DIETARY_OPTIONS.map((opt) => {
                  const isChecked = profileData.dietary_options?.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const current = profileData.dietary_options || [];
                        const updated = isChecked
                          ? current.filter((o) => o !== opt)
                          : [...current, opt];
                        setProfileData({ ...profileData, dietary_options: updated });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving Changes...' : 'Save All Restaurant Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ================================================================ */}
        {/* TAB 4: TABLE STANDEE & MARKETING */}
        {/* ================================================================ */}
        {activeTab === 'standee' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
            <div>
              <h2 className="font-heading font-black text-xl text-slate-900">
                Official Table QR Standee
              </h2>
              <p className="text-xs text-slate-500">
                Print high-resolution table tent cards for your dine-in tables. Guests scan the QR code to open your contactless digital menu directly at <strong className="text-slate-800">{cleanPublicUrl}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-amber-50/60 border border-amber-200/60">
              <div className="w-40 h-40 bg-white p-3 rounded-2xl shadow-md border border-amber-200 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
                    cleanPublicUrl
                  )}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-heading font-black text-lg text-amber-950">
                  {restaurant.name} Table Tent Card
                </h3>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Includes your restaurant logo, address, "Scan for Menu & WhatsApp Order", and zero commission direct ordering for maximum profit.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Open Standee & Print</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cleanPublicUrl);
                      showToast('Copied direct restaurant link!', 'success');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-slate-800 font-bold text-xs border border-amber-200"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT DISH WITH <1MB AUTO-COMPRESSOR */}
      {/* ==================================================================== */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                {editingItem.id ? 'Edit Dish Details' : 'Add New Menu Dish'}
              </h3>
              <button
                onClick={() => setDishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Paneer Makhani Pizza"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={editingItem.category_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingItem.price ?? 199}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dish Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Ingredients, preparation style, portion size..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>

              {/* Photo Upload with Auto-Compression (<1 MB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Dish Photo (under 1 MB Auto-Compressed)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                    <img
                      src={editingItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={dishFileInputRef}
                      accept="image/*"
                      onChange={handleDishImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => dishFileInputRef.current?.click()}
                      disabled={dishImageCompressing}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-stone-200 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-orange-600" />
                      <span>{dishImageCompressing ? 'Compressing...' : 'Upload Own Image (< 1MB)'}</span>
                    </button>
                    {dishImageCompressionStats && (
                      <span className="text-[11px] text-emerald-600 font-bold block">
                        ✓ Compressed to {dishImageCompressionStats.compressedSizeKb} KB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dietary Tag & Spice Level */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dietary Type
                  </label>
                  <select
                    value={editingItem.dietary_tags?.[0] || 'Veg'}
                    onChange={(e) => setEditingItem({ ...editingItem, dietary_tags: [e.target.value as DietaryTag] })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="Veg">🟢 Pure Veg</option>
                    <option value="Non-veg">🔴 Non-Veg</option>
                    <option value="Vegan">🌱 Vegan</option>
                    <option value="Egg">🥚 Egg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spice Level (0 to 4)
                  </label>
                  <select
                    value={editingItem.spice_level ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, spice_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                  >
                    <option value={0}>0 - Mild / No Chilli</option>
                    <option value={1}>1 - Medium Spice</option>
                    <option value={2}>2 - Spicy 🌶️</option>
                    <option value={3}>3 - Extra Hot 🌶️🌶️</option>
                    <option value={4}>4 - Fire Hot 🔥</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
                  />
                  <span>Dish In Stock (Available for ordering)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-0"
                  />
                  <span>⭐ Bestseller / Chef's Special</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDish}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  {savingDish ? 'Saving Dish...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ==================================================================== */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-black text-base text-slate-900">
                {editingCat.id ? 'Edit Category' : 'Add Menu Category'}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  placeholder="e.g. Starters, Wood-Fired Pizzas, Shakes"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editingCat.sort_order ?? 0}
                  onChange={(e) => setEditingCat({ ...editingCat, sort_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  {savingCat ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standee Modal */}
      {showQrModal && (
        <RestaurantQrModal
          restaurant={restaurant}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
