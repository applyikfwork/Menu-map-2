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
  Filter,
  Megaphone,
  Bell,
  Calendar,
  FileText,
  Volume2,
  ShieldCheck,
  Camera,
  Laptop,
  Droplets,
  Cake,
  Navigation,
  Store,
  Wifi,
  Copy,
  Gift,
  Download
} from 'lucide-react';
import { getRestaurantQrConfig, saveRestaurantQrConfig, RestaurantQrConfig, DEFAULT_PERK_IDS } from '../lib/qrConfig';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  RestaurantOwnerAccount,
  DietaryOption,
  DietaryTag,
  RestaurantAnnouncement,
  RestaurantGalleryImage,
  AnnouncementBadge,
  GalleryCategory
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

type OwnerTab = 'overview' | 'brand' | 'menu' | 'categories' | 'location' | 'policies' | 'announcements' | 'gallery' | 'standee' | 'profile';

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
  const [announcements, setAnnouncements] = useState<RestaurantAnnouncement[]>([]);
  const [galleryImages, setGalleryImages] = useState<RestaurantGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Section Tab (Default to structured Overview)
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');

  // QR Modal & In-Cafe Table Configuration
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrConfig, setQrConfig] = useState<RestaurantQrConfig>(() => ({
    wifiSsid: '',
    wifiPassword: '',
    showWifiOnStandee: true,
    buzzerPhone: '',
    enabledPerks: DEFAULT_PERK_IDS,
    customPerkNote: 'Valid on direct WhatsApp counter orders',
    tableCount: 20,
  }));
  const [selectedPreviewTable, setSelectedPreviewTable] = useState<string>('1');

  // Filter / Search inside dishes
  const [dishSearch, setDishSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // --------------------------------------------------------------------------
  // ANNOUNCEMENTS & LIVE NOTICE BOARD STATE
  // --------------------------------------------------------------------------
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<RestaurantAnnouncement>>({
    title: '',
    message: '',
    badge: "Today's Special",
    action_label: '',
    action_url: '',
    is_active: true,
  });
  const [announcementExpiryPreset, setAnnouncementExpiryPreset] = useState<'tonight' | '24h' | '3d' | '7d' | 'indefinite'>('indefinite');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // --------------------------------------------------------------------------
  // GALLERY & PAPER MENU PHOTOS STATE
  // --------------------------------------------------------------------------
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<'all' | GalleryCategory>('all');
  const [uploadCategory, setUploadCategory] = useState<GalleryCategory>('menu_page');
  const [uploadCaption, setUploadCaption] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<RestaurantGalleryImage | null>(null);

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
  // RESTAURANT PROFILE & BRANDING EDITING STATE
  // --------------------------------------------------------------------------
  const [profileData, setProfileData] = useState<Partial<Restaurant>>({});
  const [coverCompressing, setCoverCompressing] = useState(false);
  const [coverCompressionStats, setCoverCompressionStats] = useState<CompressionResult | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [logoCompressing, setLogoCompressing] = useState(false);
  const [logoCompressionStats, setLogoCompressionStats] = useState<CompressionResult | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
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
        setQrConfig(getRestaurantQrConfig(rest.id, rest.whatsapp_number || rest.phone));

        const [cats, items, anns, gallery] = await Promise.all([
          api.getCategories(rest.id),
          api.getMenuItems(rest.id),
          api.getRestaurantAnnouncements(rest.id),
          api.getRestaurantGallery(rest.id),
        ]);
        setCategories(cats);
        setMenuItems(items);
        setAnnouncements(anns);
        setGalleryImages(gallery);

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

  // --------------------------------------------------------------------------
  // ANNOUNCEMENTS HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncement({
      title: '',
      message: '',
      badge: "Today's Special",
      action_label: 'Enquire on WhatsApp',
      action_url: '',
      is_active: true,
    });
    setAnnouncementExpiryPreset('indefinite');
    setAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!editingAnnouncement.title?.trim() || !editingAnnouncement.message?.trim()) {
      showToast('Title and message are required for the announcement.', 'error');
      return;
    }

    setSavingAnnouncement(true);
    try {
      let expires_at: string | undefined = undefined;
      const now = new Date();
      if (announcementExpiryPreset === 'tonight') {
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        expires_at = tonight.toISOString();
      } else if (announcementExpiryPreset === '24h') {
        expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else if (announcementExpiryPreset === '3d') {
        expires_at = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      } else if (announcementExpiryPreset === '7d') {
        expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const saved = await api.saveRestaurantAnnouncement({
        ...editingAnnouncement,
        restaurant_id: restaurant.id,
        restaurant_slug: restaurant.slug,
        expires_at,
      });

      setAnnouncements((prev) => {
        const filtered = prev.filter((a) => a.id !== saved.id);
        return [saved, ...filtered];
      });

      setAnnouncementModalOpen(false);
      showToast('✓ Announcement published to your live restaurant page!', 'success');
    } catch (e) {
      showToast('Failed to save announcement.', 'error');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteRestaurantAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast('Announcement deleted.', 'info');
    } catch (e) {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  const handleToggleAnnouncementActive = async (ann: RestaurantAnnouncement) => {
    try {
      const updated = await api.saveRestaurantAnnouncement({
        ...ann,
        restaurant_slug: restaurant?.slug,
        is_active: !ann.is_active,
      });
      setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(updated.is_active ? 'Announcement is now active!' : 'Announcement paused.', 'success');
    } catch (e) {
      showToast('Failed to update announcement status.', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // GALLERY & PAPER MENU HANDLERS
  // --------------------------------------------------------------------------
  const handleUploadGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    setGalleryUploading(true);
    try {
      const compressed = await compressImageFile(file, { maxWidth: 1800, quality: 0.85 });
      const saved = await api.saveGalleryImage({
        restaurant_id: restaurant.id,
        image_url: compressed.dataUrl,
        caption: uploadCaption.trim() || undefined,
        category: uploadCategory,
        uploaded_by: 'owner',
        sort_order: galleryImages.length,
      });

      const updatedGallery = [...galleryImages, saved];
      setGalleryImages(updatedGallery);

      // If category is menu_page, also update restaurant.menu_pages
      if (uploadCategory === 'menu_page') {
        const menuPages = updatedGallery
          .filter((img) => img.category === 'menu_page')
          .map((img) => img.image_url);
        await api.updateRestaurantMenuPages(restaurant.id, menuPages);
        setRestaurant((prev) => (prev ? { ...prev, menu_pages: menuPages } : null));
      }

      setUploadCaption('');
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
      showToast(`✓ Photo uploaded as "${uploadCategory === 'menu_page' ? 'Paper Menu Page' : uploadCategory}"!`, 'success');
    } catch (e) {
      showToast('Failed to upload image.', 'error');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (img: RestaurantGalleryImage) => {
    if (!window.confirm('Delete this photo from your restaurant gallery?')) return;
    if (!restaurant) return;
    try {
      await api.deleteGalleryImage(img.id);
      const nextGallery = galleryImages.filter((i) => i.id !== img.id);
      setGalleryImages(nextGallery);

      if (img.category === 'menu_page') {
        const menuPages = nextGallery
          .filter((i) => i.category === 'menu_page')
          .map((i) => i.image_url);
        await api.updateRestaurantMenuPages(restaurant.id, menuPages);
        setRestaurant((prev) => (prev ? { ...prev, menu_pages: menuPages } : null));
      }

      showToast('Photo removed from gallery.', 'info');
    } catch (e) {
      showToast('Failed to delete photo.', 'error');
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
  // RESTAURANT BRANDING, LOGO & COVER PHOTO COMPRESSION (< 1MB)
  // --------------------------------------------------------------------------
  const handleLogoPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoCompressing(true);
    try {
      const compressed = await compressImageFile(file, 600, 500 * 1024);
      setLogoCompressionStats(compressed);
      setProfileData((prev) => ({ ...prev, logo_url: compressed.dataUrl }));
      showToast(
        `✓ Logo compressed: ${(compressed.originalSizeKb).toFixed(0)} KB ➔ ${compressed.compressedSizeKb} KB (< 500 KB). Remember to save!`,
        'success'
      );
    } catch (err) {
      console.error('Logo compression error:', err);
      showToast('Failed to compress logo image.', 'error');
    } finally {
      setLogoCompressing(false);
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverCompressing(true);
    try {
      const compressed = await compressImageFile(file, 1800, 950 * 1024);
      setCoverCompressionStats(compressed);
      setProfileData((prev) => ({ ...prev, cover_image_url: compressed.dataUrl }));
      showToast(
        `✓ Cover image compressed: ${(compressed.originalSizeKb / 1024).toFixed(1)} MB ➔ ${compressed.compressedSizeKb} KB (< 1 MB). Remember to save!`,
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
        address_line2: profileData.address_line2?.trim(),
        landmark: profileData.landmark?.trim(),
        city: profileData.city?.trim(),
        metro_station: profileData.metro_station?.trim(),
        metro_gate: profileData.metro_gate?.trim(),
        google_maps_url: profileData.google_maps_url?.trim(),
        phone: profileData.phone?.trim(),
        whatsapp_number: profileData.whatsapp_number?.trim(),
        average_cost_for_two: Number(profileData.average_cost_for_two) || 500,
        price_range: profileData.price_range || '₹₹',
        logo_url: profileData.logo_url ?? restaurant.logo_url,
        cover_image_url: profileData.cover_image_url || restaurant.cover_image_url,
        service_charge_percent: Number(profileData.service_charge_percent) || 0,
        water_policy: profileData.water_policy || 'free_ro',
        cake_policy: profileData.cake_policy || 'free',
        cake_fee: Number(profileData.cake_fee) || 0,
        wifi_available: profileData.wifi_available ?? true,
        plug_points_available: profileData.plug_points_available ?? true,
        facilities: profileData.facilities || [],
        dietary_options: profileData.dietary_options || [],
        is_open: profileData.is_open ?? restaurant.is_open,
        opening_hours: profileData.opening_hours || restaurant.opening_hours,
      });

      if (updated) {
        setRestaurant(updated);
        setProfileData({ ...updated });
        showToast('✓ Restaurant details updated and published live!', 'success');
      }
    } catch (e) {
      showToast('Could not save restaurant changes.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveQrConfig = (updates: Partial<RestaurantQrConfig>) => {
    if (!restaurant) return;
    const updated = saveRestaurantQrConfig(restaurant.id, updates);
    setQrConfig(updated);
    showToast('Saved Table QR & In-Cafe Settings!', 'success');
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

  // Canonical verified URL: https://menumaps.in/restaurant/${slug}
  const cleanPublicUrl = `${window.location.origin}/restaurant/${restaurant.slug}`;

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
            {profileData.logo_url || restaurant.logo_url ? (
              <img
                src={profileData.logo_url || restaurant.logo_url}
                alt={restaurant.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-heading font-black text-xl shadow-md shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
            )}
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
                Owner: <strong className="text-slate-200">{session.owner_name}</strong> {session.owner_email ? `• ${session.owner_email}` : ''} {session.phone_number ? `• ${session.phone_number}` : ''} • {cleanPublicUrl}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 border-t border-slate-800/80 overflow-x-auto py-2.5">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'brand', label: 'Brand & Photos', icon: ImageIcon },
            { id: 'menu', label: `Menu Dishes (${menuItems.length})`, icon: UtensilsCrossed },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'location', label: 'Location & Metro', icon: MapPin },
            { id: 'policies', label: 'Ground Policies (Honest Bill)', icon: ShieldCheck },
            { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
            { id: 'gallery', label: `Gallery (${galleryImages.length})`, icon: Camera },
            { id: 'standee', label: 'Table QR Standee', icon: QrCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (activeTab === 'profile' && tab.id === 'brand');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as OwnerTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5A36] text-white shadow-md'
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
        {/* TAB 0: STRUCTURED OVERVIEW */}
        {/* ================================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Live Cafe Showcase Card */}
            <div className="bg-gradient-to-r from-[#1C1917] via-stone-900 to-black rounded-3xl p-6 sm:p-8 text-white border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {profileData.logo_url || restaurant.logo_url ? (
                  <img
                    src={profileData.logo_url || restaurant.logo_url}
                    alt={restaurant.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-white shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#FF5A36] text-white flex items-center justify-center font-heading font-black text-2xl shadow-md shrink-0">
                    <Store className="w-10 h-10" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Counter Listing</span>
                  </div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
                    {restaurant.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300">
                    {restaurant.address_line1}, {restaurant.city} {restaurant.metro_station ? `• 🚇 ${restaurant.metro_station}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                <a
                  href={cleanPublicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Open Public Live Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Table QR Standee</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab('menu')}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-400">Total Dishes</span>
                  <UtensilsCrossed className="w-4 h-4 text-[#FF5A36] group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                  {menuItems.length}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Manage dishes & pricing &rarr;</p>
              </div>

              <div 
                onClick={() => setActiveTab('categories')}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-400">Categories</span>
                  <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                  {categories.length}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Organize categories &rarr;</p>
              </div>

              <div 
                onClick={() => setActiveTab('announcements')}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-400">Live Notices</span>
                  <Megaphone className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                  {announcements.filter(a => a.is_active).length}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Today's specials & offers &rarr;</p>
              </div>

              <div 
                onClick={() => setActiveTab('gallery')}
                className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-stone-400">Store Photos</span>
                  <Camera className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
                  {galleryImages.length}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Atmosphere & paper menus &rarr;</p>
              </div>
            </div>

            {/* Management Modules Quick Grid */}
            <div className="space-y-3">
              <h3 className="font-heading font-black text-lg text-stone-900">
                Cafe Page Management Modules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('brand')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5A36] flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    Brand Logo & Cover Banner
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Upload your circular store logo and 21:9 storefront cover photo under 1 MB auto-compression.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    Counter Dishes & Prices
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Add, edit, or mark items sold out in 1 click. Veg/Non-veg tags, spice levels, and photos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('policies')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    The Honest Bill Box
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Set 0% discretionary service charge, free RO water, outside cake policy, and WiFi availability.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    Delhi Metro & Daily Hours
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Nearest Delhi Metro station, exit gate number, Google Maps link, and daily opening timings.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('announcements')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    Live Notice & Daily Specials
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Broadcast today's chef special or festival offers with automated midnight expiry timers.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('standee')}
                  className="bg-white p-6 rounded-3xl border border-stone-200/90 text-left hover:border-[#FF5A36] hover:shadow-md transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-black text-base text-stone-900 group-hover:text-[#FF5A36]">
                    Counter QR Standee Studio
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Preview and print high-res table standees with genuine rate lock guarantee and cafe logo.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

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
        {/* TAB: LIVE ANNOUNCEMENTS & NOTICE BOARD */}
        {/* ================================================================ */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h2 className="font-heading font-black text-xl text-slate-900">
                    Live Announcements & Notice Board
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Broadcast today's chef specials, festival discounts, live band sessions, or holiday timings directly onto your public restaurant page header.
                </p>
              </div>
              <button
                onClick={handleOpenAddAnnouncement}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post Announcement</span>
              </button>
            </div>

            {/* Live Preview Card */}
            {(() => {
              const liveAnnouncement = announcements.find((a) => a.is_active);
              if (!liveAnnouncement) {
                return (
                  <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/60 p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-slate-800">
                      No Live Announcement Active
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Post a quick bulletin to let diners know about special discounts, festival dishes, or today's chef recommendations!
                    </p>
                    <button
                      onClick={handleOpenAddAnnouncement}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Post First Announcement
                    </button>
                  </div>
                );
              }

              return (
                <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-400/40 p-6 space-y-4 relative overflow-hidden shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                        {liveAnnouncement.badge}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Currently Live on your Restaurant Page
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAnnouncementActive(liveAnnouncement)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs border border-stone-200 shadow-2xs"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(liveAnnouncement.id)}
                        className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-red-500 border border-stone-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-lg text-slate-900">
                      {liveAnnouncement.title}
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {liveAnnouncement.message}
                    </p>
                  </div>

                  {liveAnnouncement.action_label && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs font-bold shadow-xs">
                        <span>{liveAnnouncement.action_label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 border-t border-amber-200/50 pt-2 flex items-center justify-between">
                    <span>Posted {new Date(liveAnnouncement.created_at).toLocaleDateString()}</span>
                    <span>
                      {liveAnnouncement.expires_at
                        ? `Expires: ${new Date(liveAnnouncement.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`
                        : 'Never expires (Indefinite)'}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Announcement History */}
            {announcements.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900">
                  All Announcements History ({announcements.length})
                </h3>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-slate-800 text-[10px] font-black uppercase">
                            {ann.badge}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              ann.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {ann.is_active ? 'Active' : 'Paused'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-sm text-slate-900">
                          {ann.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {ann.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleAnnouncementActive(ann)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            ann.is_active
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {ann.is_active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB: PHOTOS & PHYSICAL PAPER MENU GALLERY */}
        {/* ================================================================ */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <h2 className="font-heading font-black text-xl text-slate-900">
                    Physical Paper Menu & Photo Gallery
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload authentic photos of your physical paper menu (Page 1, 2, 3...) to enable the interactive flipbook modal, plus ambiance and signature dish photos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  onChange={handleUploadGalleryFile}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={galleryUploading}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>{galleryUploading ? 'Compressing & Uploading...' : '+ Upload Photo'}</span>
                </button>
              </div>
            </div>

            {/* Upload Category & Caption Bar */}
            <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Upload As:</span>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as GalleryCategory)}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="menu_page">📄 Paper Menu Scan / Page</option>
                  <option value="ambiance">🪑 Ambiance & Seating</option>
                  <option value="food">🍲 Signature Dish</option>
                  <option value="outdoor">🌿 Outdoor / Rooftop</option>
                </select>
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Optional caption (e.g. Menu Page 1 - Mains, Cozy Balcony Seating)..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-slate-800 outline-none placeholder:text-stone-400"
                />
              </div>

              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={galleryUploading}
                className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shrink-0"
              >
                Select Image File
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: `All Photos (${galleryImages.length})` },
                { id: 'menu_page', label: `📄 Paper Menu Pages (${galleryImages.filter((i) => i.category === 'menu_page').length})` },
                { id: 'ambiance', label: `🪑 Ambiance (${galleryImages.filter((i) => i.category === 'ambiance').length})` },
                { id: 'food', label: `🍲 Dishes (${galleryImages.filter((i) => i.category === 'food').length})` },
                { id: 'outdoor', label: `🌿 Outdoor (${galleryImages.filter((i) => i.category === 'outdoor').length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setGalleryCategoryFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    galleryCategoryFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            {(() => {
              const filtered = galleryImages.filter(
                (img) => galleryCategoryFilter === 'all' || img.category === galleryCategoryFilter
              );

              if (filtered.length === 0) {
                return (
                  <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-slate-800">
                      No photos in this category yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Upload your physical paper menu or restaurant photos. Phone photos are automatically compressed for high-speed loading.
                    </p>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo Now
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filtered.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs flex flex-col"
                    >
                      <div className="aspect-square relative overflow-hidden bg-stone-100">
                        <img
                          src={img.image_url}
                          alt={img.caption || 'Restaurant gallery'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                            {img.category === 'menu_page'
                              ? `Menu Page ${idx + 1}`
                              : img.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImage(img)}
                            className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-md transition-opacity"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPhotoPreview(img)}
                          className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity"
                        >
                          <Eye className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      {img.caption && (
                        <div className="p-2.5 text-xs text-slate-700 font-medium truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
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
        {/* TAB 3: BRAND IDENTITY, LOGO & STOREFRONT BANNER */}
        {/* ================================================================ */}
        {(activeTab === 'brand' || activeTab === 'profile') && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Brand Identity & Storefront Photos
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your cafe logo avatar, storefront hero banner, brand name, and public story.
                </p>
              </div>

              {/* Logo & Storefront Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Circular Brand Logo */}
                <div className="border border-dashed border-stone-300 rounded-3xl p-5 bg-stone-50/70 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Circular Brand Logo Avatar</span>
                  </div>

                  <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                    {profileData.logo_url || restaurant.logo_url ? (
                      <img
                        src={profileData.logo_url || restaurant.logo_url}
                        alt="Brand Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Square or circular brand icon. Auto-compressed strictly below 500 KB.
                  </p>

                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleLogoPhotoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={logoCompressing}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>{logoCompressing ? 'Compressing...' : profileData.logo_url ? 'Replace Logo' : 'Upload Brand Logo'}</span>
                    </button>

                    {profileData.logo_url && (
                      <button
                        type="button"
                        onClick={() => setProfileData((prev) => ({ ...prev, logo_url: '' }))}
                        className="text-[11px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  {logoCompressionStats && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800">
                      ✓ Compressed to {logoCompressionStats.compressedSizeKb} KB
                    </div>
                  )}
                </div>

                {/* 2. Cover Banner Photo */}
                <div className="md:col-span-2 border border-dashed border-stone-300 rounded-3xl p-5 bg-stone-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                      <ImageIcon className="w-3.5 h-3.5 text-[#FF5A36]" />
                      <span>Hero Storefront Cover Banner (21:9)</span>
                    </div>
                    <span className="text-[11px] font-bold text-stone-400">Strictly &lt; 1 MB</span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-stone-900 border border-stone-200 shadow-sm">
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
                        className="px-5 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 font-black text-xs flex items-center gap-2 shadow-xl backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#FF5A36]" />
                        <span>{coverCompressing ? 'Compressing Image...' : 'Upload & Compress Cover Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {coverCompressionStats && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                      <span>
                        ✓ Compressed from {(coverCompressionStats.originalSizeKb / 1024).toFixed(1)} MB ➔ <strong>{coverCompressionStats.compressedSizeKb} KB</strong>
                      </span>
                      <span className="font-bold">{coverCompressionStats.width}x{coverCompressionStats.height}px</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Brand Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Cafe / Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Average Cost for Two (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-stone-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={profileData.average_cost_for_two || 500}
                      onChange={(e) => setProfileData({ ...profileData, average_cost_for_two: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Catchy Tagline / Short Description
                </label>
                <input
                  type="text"
                  value={profileData.short_description || ''}
                  onChange={(e) => setProfileData({ ...profileData, short_description: e.target.value })}
                  placeholder="e.g. Cozy cafe serving authentic wood-fired pizzas and specialty artisanal coffee."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Story & About
                </label>
                <textarea
                  rows={3}
                  value={profileData.long_description || ''}
                  onChange={(e) => setProfileData({ ...profileData, long_description: e.target.value })}
                  placeholder="Share your kitchen philosophy, special ingredients, chef specials, and dining atmosphere..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-8 py-3.5 rounded-full bg-[#FF5A36] hover:bg-[#D8350F] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Brand & Photos'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================ */}
        {/* TAB 4: LOCATION, DELHI METRO ACCESS & DAILY HOURS */}
        {/* ================================================================ */}
        {activeTab === 'location' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Location, Delhi Metro & Daily Hours
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure walk-in diners easily find your cafe from the nearest Metro station or Google Maps.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Street Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.address_line1 || ''}
                    onChange={(e) => setProfileData({ ...profileData, address_line1: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={profileData.landmark || ''}
                    onChange={(e) => setProfileData({ ...profileData, landmark: e.target.value })}
                    placeholder="e.g. Near Max Hospital / Gate 2"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    City / Food Hub Area
                  </label>
                  <input
                    type="text"
                    value={profileData.city || 'Delhi NCR'}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. Netaji Subhash Place, Delhi"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Google Maps Directions Link
                  </label>
                  <input
                    type="url"
                    value={profileData.google_maps_url || ''}
                    onChange={(e) => setProfileData({ ...profileData, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Delhi Metro Proximity Section */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-700" />
                  <h4 className="font-heading font-black text-sm text-indigo-950">
                    Delhi Metro Proximity (Helps 70% Walk-In Commuters)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                      Nearest Delhi Metro Station
                    </label>
                    <input
                      type="text"
                      value={profileData.metro_station || ''}
                      onChange={(e) => setProfileData({ ...profileData, metro_station: e.target.value })}
                      placeholder="e.g. Netaji Subhash Place (Red/Pink Line)"
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-stone-700 mb-1">
                      Exit Gate Number
                    </label>
                    <input
                      type="text"
                      value={profileData.metro_gate || ''}
                      onChange={(e) => setProfileData({ ...profileData, metro_gate: e.target.value })}
                      placeholder="e.g. Exit Gate 2 (200m Walk)"
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Direct Phone / Landline
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    WhatsApp Orders Receiver No. * (0% Commission)
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileData.whatsapp_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, whatsapp_number: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-8 py-3.5 rounded-full bg-[#0F766E] hover:bg-[#0D9488] text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Location & Metro'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================ */}
        {/* TAB 5: THE HONEST BILL BOX & GROUND REALITY POLICIES */}
        {/* ================================================================ */}
        {activeTab === 'policies' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The Honest Bill Engine</span>
                </div>
                <h3 className="font-heading font-black text-xl text-slate-900">
                  Dine-In Ground Reality Policies
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Delhi diners hate checkout surprises. Setting 0% service charge and transparent policies directly builds trust and converts walk-in visitors into regulars.
                </p>
              </div>

              {/* 3 Core Street Policies */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Service Charge */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Discretionary Service Charge
                  </label>
                  <select
                    value={profileData.service_charge_percent ?? 0}
                    onChange={(e) => setProfileData({ ...profileData, service_charge_percent: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                  >
                    <option value={0}>0% (Only 5% Govt GST - Recommended)</option>
                    <option value={5}>5% Service Charge</option>
                    <option value={10}>10% Discretionary Fee</option>
                  </select>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    0% service charge is highlighted with a green badge in diner search.
                  </p>
                </div>

                {/* 2. Water Serving */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Drinking Water Policy
                  </label>
                  <select
                    value={profileData.water_policy || 'free_ro'}
                    onChange={(e) => setProfileData({ ...profileData, water_policy: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                  >
                    <option value="free_ro">Free Regular / RO Water Served</option>
                    <option value="paid_bottle">Paid Mineral Bottle Only</option>
                    <option value="both">Both Free RO & Mineral Bottle</option>
                  </select>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Complies with Delhi HC consumer drinking water directive.
                  </p>
                </div>

                {/* 3. Birthday Cake */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Outside Birthday Cake
                  </label>
                  <select
                    value={profileData.cake_policy || 'free'}
                    onChange={(e) => setProfileData({ ...profileData, cake_policy: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white outline-hidden"
                  >
                    <option value="free">Allowed Free (₹0 Fee)</option>
                    <option value="charges_cutting_fee">Cutting Fee Charged</option>
                    <option value="not_allowed">Outside Food Not Allowed</option>
                  </select>
                  {profileData.cake_policy === 'charges_cutting_fee' && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        Cutting Fee Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={profileData.cake_fee || 150}
                        onChange={(e) => setProfileData({ ...profileData, cake_fee: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Wi-Fi & Laptop Friendly Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.wifi_available ?? true}
                    onChange={(e) => setProfileData({ ...profileData, wifi_available: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Free Customer Wi-Fi</span>
                    <span className="text-[11px] text-stone-500">Allows diners to connect for work & orders</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.plug_points_available ?? true}
                    onChange={(e) => setProfileData({ ...profileData, plug_points_available: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Laptop Plug Points Available</span>
                    <span className="text-[11px] text-stone-500">Student & study friendly seating</span>
                  </div>
                </label>
              </div>

              {/* Facilities & Dietary Badges */}
              <div className="space-y-4">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-800">
                  Facilities & Dining Vibes
                </h4>
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-slate-800 pt-3">
                  Dietary Badges
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Ground Policies'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================================ */}
        {/* TAB 4: TABLE STANDEE & IN-CAFE FACILITIES COMMAND CENTER */}
        {/* ================================================================ */}
        {activeTab === 'standee' && (
          <div className="space-y-6">
            {/* Top Overview & Standee Studio Hero */}
            <div className="bg-gradient-to-r from-stone-900 via-[#1C1917] to-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-amber-400/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Cafe In-Store Table QR Manager</span>
                </div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-amber-200">
                  Table Standees & VIP In-Cafe Facilities
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                  Generate customized tabletop acrylic standees for Table 1–25. When diners scan, they instantly unlock high-speed Wi-Fi credentials, 1-tap WhatsApp table buzzers, and the gamified Table Luck Wheel!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Launch Standee Studio 🖨️</span>
                </button>

                <a
                  href={`/${restaurant.slug}?table=1&mode=dine_in`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>Simulate Table #1 Scan</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            </div>

            {/* Grid: Wi-Fi Credentials & Table Buzzer WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: In-Store Wi-Fi Credentials */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-slate-900">
                      Cafe Table Wi-Fi Credentials
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Printed directly on acrylic table standees and shown in customer table mode
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Wi-Fi Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={qrConfig.wifiSsid}
                      onChange={(e) => setQrConfig({ ...qrConfig, wifiSsid: e.target.value })}
                      placeholder="e.g. TheBigChill_Guest"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Wi-Fi Password
                    </label>
                    <input
                      type="text"
                      value={qrConfig.wifiPassword || ''}
                      onChange={(e) => setQrConfig({ ...qrConfig, wifiPassword: e.target.value })}
                      placeholder="e.g. coffee2026 (Leave blank if open Wi-Fi)"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={qrConfig.showWifiOnStandee}
                        onChange={(e) => setQrConfig({ ...qrConfig, showWifiOnStandee: e.target.checked })}
                        className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span>Display Wi-Fi on Table QR & Customer Screen</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleSaveQrConfig(qrConfig)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      Save Wi-Fi
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Table Buzzer WhatsApp Alerts Routing */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-slate-900">
                      Table Buzzer WhatsApp Routing
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Target WhatsApp number for Waiter, Water, Bill & Cutlery table alerts
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Manager or Server WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={qrConfig.buzzerPhone || ''}
                      onChange={(e) => setQrConfig({ ...qrConfig, buzzerPhone: e.target.value })}
                      placeholder={restaurant.whatsapp_number || restaurant.phone || '919876543210'}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-hidden"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Include country code without + or spaces (e.g. 919876543210)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const phone = (qrConfig.buzzerPhone || restaurant.whatsapp_number || restaurant.phone || '').replace(/[^0-9]/g, '');
                        if (phone) {
                          window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(`🛎️ [TABLE #1 TEST] Alert: Hello ${restaurant.name}, table buzzers are working properly!`)}`, '_blank');
                        } else {
                          showToast('Please enter a valid WhatsApp phone number.', 'info');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold border border-stone-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>Test Buzzer Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveQrConfig(qrConfig)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      Save Routing
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Dine-In Perks Manager (Luck Wheel Controls) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-slate-900">
                      Table Luck Wheel & Perks Manager
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Control which rewards customers can win when spinning the table wheel at their seats
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveQrConfig(qrConfig)}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  Save Perk Rules
                </button>
              </div>

              {/* Perk Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'discount5', label: '5% Counter Discount', desc: 'Deducted directly from table counter bill' },
                  { id: 'freedip', label: 'Free House Dip / Chutney', desc: 'Served complimentary with starter order' },
                  { id: 'chaiupgrade', label: 'Free Masala Chai / Drink Upgrade', desc: 'Upgrade regular drink to chef brew' },
                  { id: 'desserttreat', label: 'Complimentary Sweet Treat', desc: 'Mini dessert or sweet chocolate bite' },
                  { id: 'extraportion', label: 'Chef’s Loaded Portion', desc: 'Kitchen adds extra toppings/cheese' },
                  { id: 'secretdeal', label: 'Chef’s Secret Recipe Perk', desc: 'Unlock chef recommendation bite' },
                ].map((perk) => {
                  const isChecked = qrConfig.enabledPerks.includes(perk.id);
                  return (
                    <div
                      key={perk.id}
                      onClick={() => {
                        const next = isChecked
                          ? qrConfig.enabledPerks.filter((id) => id !== perk.id)
                          : [...qrConfig.enabledPerks, perk.id];
                        setQrConfig({ ...qrConfig, enabledPerks: next.length > 0 ? next : [perk.id] });
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                          : 'bg-stone-50 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{perk.label}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold ${isChecked ? 'bg-orange-600' : 'bg-stone-300'}`}>
                          {isChecked ? '✓' : ''}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{perk.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Perk Policy Note */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perk Ground Policy / Note (Shown to Diners)
                </label>
                <input
                  type="text"
                  value={qrConfig.customPerkNote || ''}
                  onChange={(e) => setQrConfig({ ...qrConfig, customPerkNote: e.target.value })}
                  placeholder="e.g. Valid on direct WhatsApp counter orders above ₹200"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Table QR Kit & Standee Generator */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    Table Standee Generator & QR Pack
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Preview and download individual Table QR codes (Table 1 through 25)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Select Table:</span>
                  <select
                    value={selectedPreviewTable}
                    onChange={(e) => setSelectedPreviewTable(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-black text-slate-800 outline-none cursor-pointer"
                  >
                    {[...Array(25)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Table #{i + 1}
                      </option>
                    ))}
                    <option value="master">Master QR (Counter / Takeaway)</option>
                  </select>
                </div>
              </div>

              {/* Live Table Preview Row */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-xs border border-stone-200 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
                        `${window.location.origin}/${restaurant.slug}?${selectedPreviewTable === 'master' ? '' : `table=${selectedPreviewTable}&`}mode=dine_in`
                      )}`}
                      alt={`Table ${selectedPreviewTable} QR`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider">
                      {selectedPreviewTable === 'master' ? 'Counter Standee' : `Table #${selectedPreviewTable} Standee`}
                    </span>
                    <h4 className="font-heading font-black text-base text-slate-900 mt-1">
                      {restaurant.name} – Table #{selectedPreviewTable}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      URL: <code className="text-orange-700 bg-orange-50 px-1 py-0.5 rounded">/{restaurant.slug}?table={selectedPreviewTable}&mode=dine_in</code>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Standee</span>
                  </button>

                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=15&data=${encodeURIComponent(
                      `${window.location.origin}/${restaurant.slug}?${selectedPreviewTable === 'master' ? '' : `table=${selectedPreviewTable}&`}mode=dine_in`
                    )}`}
                    download={`${restaurant.slug}-table-${selectedPreviewTable}-qr.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-slate-800 font-bold text-xs border border-stone-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-600" />
                    <span>Download PNG</span>
                  </a>

                  <a
                    href={`/${restaurant.slug}?table=${selectedPreviewTable}&mode=dine_in`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test Table View</span>
                  </a>
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

      {/* ==================================================================== */}
      {/* MODAL: POST / EDIT LIVE ANNOUNCEMENT */}
      {/* ==================================================================== */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                  <Megaphone className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  {editingAnnouncement.id ? 'Edit Announcement' : 'Post Live Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Announcement Badge / Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(["Today's Special", "Festival Offer", "Live Event", "Special Timings", "Notice"] as AnnouncementBadge[]).map((badge) => (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => setEditingAnnouncement({ ...editingAnnouncement, badge })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        editingAnnouncement.badge === badge
                          ? 'bg-rose-500 text-white border-rose-500 shadow-2xs'
                          : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingAnnouncement.title || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  placeholder="e.g. Live Sufi Band this Friday 8 PM!"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingAnnouncement.message || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                  placeholder="e.g. Reserve your table early to enjoy mesmerizing melodies and unlimited kebab platters at ₹599 per person."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Action Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingAnnouncement.action_label || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, action_label: e.target.value })}
                    placeholder="e.g. Reserve on WhatsApp"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Action Link / Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingAnnouncement.action_url || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, action_url: e.target.value })}
                    placeholder="https://... or WhatsApp phone"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Duration / Expiry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'tonight', label: 'Tonight (11:59 PM)' },
                    { id: '24h', label: '24 Hours' },
                    { id: '3d', label: '3 Days' },
                    { id: 'indefinite', label: 'Indefinite' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAnnouncementExpiryPreset(preset.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        announcementExpiryPreset === preset.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAnnouncement}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  {savingAnnouncement ? 'Publishing...' : 'Publish to Restaurant Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: PHOTO FULLSCREEN PREVIEW */}
      {/* ==================================================================== */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div
            className="max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedPhotoPreview.category === 'menu_page'
                  ? 'Paper Menu Page'
                  : selectedPhotoPreview.category}
              </span>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center p-2 bg-black">
              <img
                src={selectedPhotoPreview.image_url}
                alt={selectedPhotoPreview.caption || 'Preview'}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
            {selectedPhotoPreview.caption && (
              <div className="p-4 text-xs text-stone-200 font-medium">
                {selectedPhotoPreview.caption}
              </div>
            )}
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
