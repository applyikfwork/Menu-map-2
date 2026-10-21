import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  LayoutDashboard, 
  UtensilsCrossed, 
  BookOpen, 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  Download, 
  Search, 
  Copy, 
  Eye, 
  EyeOff,
  TrendingUp, 
  Compass, 
  MapPin, 
  Star, 
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  Navigation,
  Zap,
  Play,
  ShieldCheck,
  Utensils,
  Code2,
  Globe,
  Image as ImageIcon,
  Mail,
  Send,
  Share2,
  FileCheck,
  UserPlus,
  Calendar,
  Clock,
  ArrowUpRight,
  PhoneCall,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { SystemIntelVault } from '../components/admin/SystemIntelVault';
import { 
  Restaurant, 
  MenuCategory, 
  MenuItem, 
  Review, 
  Collection, 
  CollectionItem, 
  SearchAnalytic, 
  SiteSettings,
  DietaryTag,
  DietaryOption,
  MealType,
  PriceRange,
  RestaurantClaim,
  ClaimStatus,
  FamousDishSpotlight,
  FoodCrawlStop,
  RestaurantOwnerAccount
} from '../types/database';
import { 
  api, 
  ADMIN_EMAIL, 
  getCurrentAdminSession, 
  adminLogin, 
  clearAdminSession, 
  slugify, 
  getSavedSupabaseConfig, 
  saveSupabaseConfig,
  getSupabaseClient,
  getAdminCustomPassword,
  setAdminCustomPassword
} from '../lib/supabase';
import { SUPABASE_SQL_SCHEMA, ICONIC_AREAS_SQL_FEATURE, OWNERSHIP_CLAIMS_SQL_FEATURE } from '../lib/sqlSchema';
import { MenuMapLogo } from '../components/Logo';
import { useToast } from '../components/Toast';
import { getSmartDishImage, DISH_IMAGE_PRESETS } from '../lib/dishImageRegistry';

interface AdminPanelProps {
  navigate: (path: string) => void;
}

export type AdminSection = 
  | 'dashboard'
  | 'owner_claims'
  | 'restaurants'
  | 'menu'
  | 'collections'
  | 'reviews'
  | 'analytics'
  | 'settings'
  | 'system_intel';

export const AdminPanel: React.FC<AdminPanelProps> = ({ navigate }) => {
  const { showToast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');

  // Active section
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  // Loaded Data
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [analytics, setAnalytics] = useState<SearchAnalytic[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [claims, setClaims] = useState<RestaurantClaim[]>([]);
  const [owners, setOwners] = useState<RestaurantOwnerAccount[]>([]);
  const [todayActivityTab, setTodayActivityTab] = useState<'today' | 'week' | 'all'>('today');
  const [todayActivitySearch, setTodayActivitySearch] = useState('');
  const [evidencePreviewImage, setEvidencePreviewImage] = useState<string | null>(null);
  const [copiedClaimLinkId, setCopiedClaimLinkId] = useState<string | null>(null);
  const [claimFilterTab, setClaimFilterTab] = useState<'all' | 'pending' | 'approved' | 'active' | 'rejected'>('all');
  const [copiedClaimsSql, setCopiedClaimsSql] = useState(false);
  const [refreshingClaims, setRefreshingClaims] = useState(false);
  const [claimsSqlModalOpen, setClaimsSqlModalOpen] = useState(false);

  // Selected Restaurant for Menu Management
  const [selectedRestId, setSelectedRestId] = useState<string>('');

  // Restaurant Edit/Create Modal
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Partial<Restaurant>>({});

  // Menu Item Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({});

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<MenuCategory>>({});

  // Collection Modal
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Partial<Collection>>({});
  const [collectionItemsSelection, setCollectionItemsSelection] = useState<string[]>([]);
  const [collectionRestFilter, setCollectionRestFilter] = useState('');
  const [showOnlySelectedRests, setShowOnlySelectedRests] = useState(false);

  // Iconic Area Guides & 50-Cafe Importer state
  const [copiedIconicSql, setCopiedIconicSql] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [bulkAreaModalOpen, setBulkAreaModalOpen] = useState(false);
  const [bulkAreaName, setBulkAreaName] = useState('Nangloi');
  const [bulkAreaZone, setBulkAreaZone] = useState('West Delhi');
  const [bulkAreaVibe, setBulkAreaVibe] = useState('Generous portions, pure desi ghee classics, lively family dining & party addas.');
  const [bulkAreaFamousFor, setBulkAreaFamousFor] = useState('Rich Desi Ghee Thalis, Paneer Tikka Platters, Crispy Momos & Budget Student Addas.');
  const [bulkAreaMetro, setBulkAreaMetro] = useState('Nangloi Metro Station (Green Line), Exit Gate 2');
  const [bulkAreaParking, setBulkAreaParking] = useState('Street parking available along Rohtak Road. E-rickshaws available from Metro.');
  const [bulkAreaCostForTwo, setBulkAreaCostForTwo] = useState(450);
  const [bulkAreaLat, setBulkAreaLat] = useState(28.6833);
  const [bulkAreaLng, setBulkAreaLng] = useState(77.0667);
  const [bulkAreaCafesText, setBulkAreaCafesText] = useState('');
  const [bulkAreaLoading, setBulkAreaLoading] = useState(false);

  // Bulk Menu Import Modal
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');

  // Supabase Config state in Settings
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [writeTestStatus, setWriteTestStatus] = useState<{ checked: boolean; canWrite: boolean; error?: string } | null>(null);
  const [checkingWrite, setCheckingWrite] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);

  useEffect(() => {
    checkAdminGuard();

    const handleClaimBroadcast = async () => {
      try {
        const freshClaims = await api.getRestaurantClaims();
        setClaims(freshClaims);
      } catch (e) {}
    };

    window.addEventListener('menumap_claim_updated', handleClaimBroadcast);
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.includes('claim_broadcast') || e.key?.includes('restaurant_claims')) {
        handleClaimBroadcast();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('menumap_claim_updated', handleClaimBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleRefreshClaims = async () => {
    setRefreshingClaims(true);
    try {
      const fresh = await api.getRestaurantClaims();
      setClaims(fresh);
      showToast(`Refreshed claims! Loaded ${fresh.length} request(s).`, 'success');
    } catch (e) {
      showToast('Failed to refresh claims from cloud.', 'error');
    } finally {
      setRefreshingClaims(false);
    }
  };

  const copyClaimsSql = () => {
    try {
      navigator.clipboard.writeText(OWNERSHIP_CLAIMS_SQL_FEATURE);
      setCopiedClaimsSql(true);
      showToast('Claims & Owner Supabase SQL copied to clipboard! Run in Supabase SQL editor.', 'success');
      setTimeout(() => setCopiedClaimsSql(false), 3000);
    } catch (e) {
      showToast('Please copy the SQL script manually.', 'info');
    }
  };

  const checkAdminGuard = () => {
    const session = getCurrentAdminSession();
    if (session && session.email === ADMIN_EMAIL) {
      setIsAuthenticated(true);
      loadAllAdminData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [rests, items, revs, cols, anl, sets, allClaims, allOwners] = await Promise.all([
        api.getRestaurants(false),
        api.getMenuItems(),
        api.getReviews(undefined, false),
        api.getCollections(false),
        api.getSearchAnalytics(),
        api.getSettings(),
        api.getRestaurantClaims(),
        api.getRestaurantOwners ? api.getRestaurantOwners() : Promise.resolve([]),
      ]);

      setRestaurants(rests);
      setMenuItems(items);
      setReviews(revs);
      setCollections(cols);
      setAnalytics(anl);
      setSettings(sets);
      setClaims(allClaims || []);
      setOwners(allOwners || []);

      if (rests.length > 0 && !selectedRestId) {
        setSelectedRestId(rests[0].id);
        const cats = await api.getCategories(rests[0].id);
        setCategories(cats);
      }

      const cfg = getSavedSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);
    } catch (e) {
      console.error('Error loading admin data:', e);
      showToast('Error loading database records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const updated = await api.approveRestaurantClaim(claimId, 'Approved by administrator');
      if (updated) {
        setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
        showToast(
          `🎉 Approved claim for "${updated.restaurant_name}"! Activation link generated for ${updated.owner_email}.`,
          'success'
        );
      }
    } catch (e) {
      showToast('Failed to approve claim.', 'error');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    const reason = window.prompt('Enter reason for rejection:') || 'Business credentials could not be verified.';
    try {
      const updated = await api.updateClaimStatus(claimId, 'rejected', reason);
      if (updated) {
        setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
        showToast('Claim request rejected.', 'info');
      }
    } catch (e) {
      showToast('Failed to reject claim.', 'error');
    }
  };

  // Change selected restaurant for menu management
  const handleSelectRestaurant = async (id: string) => {
    setSelectedRestId(id);
    const [cats, allItems] = await Promise.all([
      api.getCategories(id),
      api.getMenuItems(),
    ]);
    setCategories(cats);
    setMenuItems(allItems);
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const normalizedEmail = loginEmail.trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL) {
      setLoginLoading(false);
      setLoginError('Unauthorized: Access restricted to authorized platform administrators only.');
      showToast('Unauthorized access. Redirecting...', 'error');
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    const res = await adminLogin(loginPassword, normalizedEmail);
    setLoginLoading(false);

    if (res.success) {
      setIsAuthenticated(true);
      showToast('Welcome back, Administrator!', 'success');
      loadAllAdminData();
    } else {
      setLoginError(res.error || 'Invalid administrator password.');
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    showToast('Signed out of admin panel.', 'info');
    navigate('/');
  };

  // --------------------------------------------------------------------------
  // RESTAURANTS CRUD HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenAddRestaurant = () => {
    setEditingRestaurant({
      name: '',
      slug: '',
      short_description: '',
      long_description: '',
      cuisine_types: ['Cafe', 'Bakes'],
      meal_types: ['Breakfast', 'Lunch', 'Dinner'],
      price_range: '₹₹',
      average_cost_for_two: 600,
      address_line1: '',
      city: settings?.default_city || 'Delhi NCR',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      latitude: settings?.default_lat || 28.6139,
      longitude: settings?.default_lng || 77.2090,
      phone: '',
      whatsapp_number: '',
      email: '',
      website_url: '',
      cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
      is_open: true,
      delivery_available: true,
      takeaway_available: true,
      dine_in_available: true,
      facilities: ['WiFi', 'Air Conditioned', 'Outdoor Seating'],
      dietary_options: ['Vegan Options'],
      rating_avg: 4.5,
      rating_count: 1,
      is_featured: false,
      is_active: true,
      is_temporarily_closed: false,
      temporary_closed_reason: '',
      known_for_dishes: [],
    });
    setRestaurantModalOpen(true);
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant.name?.trim()) {
      showToast('Restaurant name is required.', 'error');
      return;
    }
    try {
      const saved = await api.saveRestaurant(editingRestaurant);
      await api.logAdminAction('Saved restaurant', { name: saved.name, id: saved.id });
      setRestaurantModalOpen(false);
      showToast(`Restaurant "${saved.name}" saved successfully!`, 'success');
      loadAllAdminData();
    } catch (err: any) {
      showToast('Failed to save restaurant.', 'error');
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (window.confirm(`Permanently delete restaurant "${name}" and all its menu categories, items, and reviews?`)) {
      await api.deleteRestaurant(id);
      await api.logAdminAction('Deleted restaurant', { name, id });
      showToast(`Deleted ${name}.`, 'info');
      loadAllAdminData();
    }
  };

  // --------------------------------------------------------------------------
  // CATEGORIES CRUD
  // --------------------------------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestId || !editingCategory.name?.trim()) return;
    try {
      await api.saveCategory({
        ...editingCategory,
        restaurant_id: selectedRestId,
      });
      setCategoryModalOpen(false);
      showToast('Menu category saved!', 'success');
      const cats = await api.getCategories(selectedRestId);
      setCategories(cats);
    } catch (err) {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}" and its associated dishes?`)) {
      await api.deleteCategory(id);
      showToast(`Deleted category ${name}.`, 'info');
      const cats = await api.getCategories(selectedRestId);
      setCategories(cats);
      const items = await api.getMenuItems(selectedRestId);
      setMenuItems(items);
    }
  };

  // --------------------------------------------------------------------------
  // MENU ITEMS CRUD
  // --------------------------------------------------------------------------
  const handleOpenAddItem = () => {
    if (categories.length === 0) {
      showToast('Please create at least one category first (e.g. Beverages or Starters).', 'info');
      setCategoryModalOpen(true);
      setEditingCategory({ name: 'Specialties', sort_order: 1, is_active: true });
      return;
    }
    setEditingItem({
      restaurant_id: selectedRestId,
      category_id: categories[0]?.id,
      name: '',
      slug: '',
      description: '',
      price: 250,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      dietary_tags: ['Veg'],
      spice_level: 0,
      portion_size: 'Regular',
      is_available: true,
      is_featured: false,
      sort_order: 0,
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name?.trim() || !editingItem.category_id) {
      showToast('Item name and category are required.', 'error');
      return;
    }
    try {
      await api.saveMenuItem({
        ...editingItem,
        restaurant_id: selectedRestId,
      });
      setItemModalOpen(false);
      showToast('Menu dish saved successfully!', 'success');
      const items = await api.getMenuItems();
      setMenuItems(items);
    } catch (e) {
      showToast('Failed to save dish.', 'error');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (window.confirm(`Delete menu item "${name}"?`)) {
      await api.deleteMenuItem(id);
      showToast(`Deleted ${name}.`, 'info');
      const items = await api.getMenuItems();
      setMenuItems(items);
    }
  };

  // Bulk Menu Import
  const handleBulkImport = async () => {
    if (!bulkCategoryId) {
      showToast('Please select a category for imported items.', 'error');
      return;
    }
    if (!bulkImportText.trim()) {
      showToast('Please enter CSV or JSON menu data.', 'error');
      return;
    }

    try {
      let itemsToCreate: Array<Partial<MenuItem>> = [];
      const trimmed = bulkImportText.trim();

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const array = Array.isArray(parsed) ? parsed : [parsed];
        itemsToCreate = array.map((p) => ({
          name: p.name || 'Dish',
          price: Number(p.price) || 199,
          description: p.description || '',
          dietary_tags: p.dietary_tags || ['Veg'],
          spice_level: Number(p.spice_level) || 0,
          portion_size: p.portion_size || 'Regular',
          image_url: p.image_url || '',
        }));
      } else {
        // CSV parsing: Name, Price, Description, Dietary
        const lines = trimmed.split('\n');
        for (const line of lines) {
          const parts = line.split(',');
          if (parts[0] && parts[0].trim()) {
            itemsToCreate.push({
              name: parts[0].trim(),
              price: Number(parts[1]?.trim()) || 199,
              description: parts[2]?.trim() || '',
              dietary_tags: (parts[3]?.trim() as any) ? [parts[3].trim() as any] : ['Veg'],
            });
          }
        }
      }

      for (const item of itemsToCreate) {
        await api.saveMenuItem({
          ...item,
          restaurant_id: selectedRestId,
          category_id: bulkCategoryId,
          is_available: true,
        });
      }

      showToast(`Imported ${itemsToCreate.length} menu items successfully!`, 'success');
      setBulkImportModalOpen(false);
      setBulkImportText('');
      const items = await api.getMenuItems();
      setMenuItems(items);
    } catch (err: any) {
      showToast(`Bulk import error: ${err.message}`, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // COLLECTIONS & ICONIC AREA GUIDES CRUD
  // --------------------------------------------------------------------------
  const copyIconicSql = () => {
    navigator.clipboard.writeText(ICONIC_AREAS_SQL_FEATURE);
    setCopiedIconicSql(true);
    showToast('Iconic Area Guides Supabase SQL copied to clipboard! Paste into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedIconicSql(false), 3000);
  };

  const handleBulkImportAreaCafes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAreaName.trim()) {
      showToast('Area Name is required.', 'error');
      return;
    }
    if (!bulkAreaCafesText.trim()) {
      showToast('Please paste your list of cafes.', 'error');
      return;
    }
    setBulkAreaLoading(true);
    try {
      const res = await api.bulkImportAreaWithRestaurants({
        areaName: bulkAreaName.trim(),
        zone: bulkAreaZone,
        vibeBadge: bulkAreaVibe,
        famousForSummary: bulkAreaFamousFor,
        nearestMetro: bulkAreaMetro,
        parkingTips: bulkAreaParking,
        avgCostForTwo: Number(bulkAreaCostForTwo) || 450,
        latitude: Number(bulkAreaLat) || 28.6833,
        longitude: Number(bulkAreaLng) || 77.0667,
        rawCafesData: bulkAreaCafesText,
      });
      showToast(res.message, 'success');
      setBulkAreaModalOpen(false);
      setBulkAreaCafesText('');
      loadAllAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to import cafes.', 'error');
    } finally {
      setBulkAreaLoading(false);
    }
  };

  const handleOpenAddCollection = (type: 'Area-Guide' | 'Editorial' = 'Area-Guide') => {
    setEditingCollection({
      title: '',
      slug: '',
      description: '',
      cover_image_url: type === 'Area-Guide'
        ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      type: type,
      is_featured: true,
      is_active: true,
      sort_order: 0,
      area_metadata: type === 'Area-Guide' ? {
        area_name: '',
        zone: 'North Delhi',
        vibe_badge: 'Buzzing food hub with lively atmosphere and great prices.',
        famous_for_summary: 'Celebrated for iconic dishes, budget addas, and popular hangout spots.',
        best_time_to_visit: '5:00 PM – 11:30 PM',
        nearest_metro: '',
        parking_tips: 'Street parking available nearby.',
        avg_cost_for_two: 500,
        latitude: 28.6139,
        longitude: 77.2090,
        sub_guide_filters: ['Top Cafes', 'Budget Addas', 'Late Night', 'Sweet Treats'],
        famous_dishes: [],
        food_crawl_stops: [],
      } : undefined,
    });
    setCollectionItemsSelection([]);
    setCollectionModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection.title?.trim()) {
      showToast('Collection title is required.', 'error');
      return;
    }
    try {
      const saved = await api.saveCollection(editingCollection);
      // Map selected restaurants into collection items
      const items = collectionItemsSelection.map((rid) => ({
        item_type: 'restaurant' as const,
        id: rid,
      }));
      await api.setCollectionItems(saved.id, items);
      setCollectionModalOpen(false);
      showToast('Collection saved!', 'success');
      loadAllAdminData();
    } catch (err) {
      showToast('Failed to save collection.', 'error');
    }
  };

  const handleDeleteCollection = async (id: string, title: string) => {
    if (window.confirm(`Delete collection "${title}"?`)) {
      await api.deleteCollection(id);
      showToast(`Deleted ${title}.`, 'info');
      loadAllAdminData();
    }
  };

  // --------------------------------------------------------------------------
  // REVIEWS MODERATION
  // --------------------------------------------------------------------------
  const handleToggleReviewApproval = async (rev: Review) => {
    await api.updateReview(rev.id, { is_approved: !rev.is_approved });
    showToast(`Review marked as ${!rev.is_approved ? 'Approved' : 'Hidden'}.`, 'info');
    const revs = await api.getReviews(undefined, false);
    setReviews(revs);
  };

  const handleToggleReviewFeatured = async (rev: Review) => {
    await api.updateReview(rev.id, { is_featured: !rev.is_featured });
    showToast(`Review marked as ${!rev.is_featured ? 'Featured' : 'Regular'}.`, 'info');
    const revs = await api.getReviews(undefined, false);
    setReviews(revs);
  };

  const handleOwnerReply = async (revId: string) => {
    const reply = window.prompt('Enter official restaurant reply:');
    if (reply !== null) {
      await api.updateReview(revId, {
        owner_response: reply,
        owner_response_date: new Date().toISOString(),
      });
      showToast('Owner reply saved!', 'success');
      const revs = await api.getReviews(undefined, false);
      setReviews(revs);
    }
  };

  // --------------------------------------------------------------------------
  // SETTINGS & SUPABASE CONFIG
  // --------------------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.saveSettings(settings);
    saveSupabaseConfig({ url: supabaseUrl, anonKey: supabaseAnonKey });
    showToast('Admin settings saved successfully!', 'success');
  };

  const handleSyncCloud = async () => {
    setSyncingCloud(true);
    try {
      const res = await api.syncAllToSupabase();
      if (res.success) {
        showToast(res.message, 'success');
        loadAllAdminData();
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to sync to Supabase.', 'error');
    } finally {
      setSyncingCloud(false);
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    showToast('Full PostgreSQL schema copied to clipboard! Paste it into Supabase SQL Editor.', 'success');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  const handleTestWrite = async () => {
    setCheckingWrite(true);
    try {
      const res = await api.checkSupabaseWriteAccess();
      setWriteTestStatus({ checked: true, canWrite: res.canWrite, error: res.error });
      if (res.canWrite) {
        showToast('Supabase write test passed! Cloud database writes are active.', 'success');
      } else {
        showToast(`Supabase write blocked: ${res.error || 'Row Level Security policy active'}. Run Safe SQL in Database Setup.`, 'error');
      }
    } catch (e: any) {
      setWriteTestStatus({ checked: true, canWrite: false, error: e?.message });
    } finally {
      setCheckingWrite(false);
    }
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD COMPUTATIONS & HOOKS
  // (Must be declared before any early return to satisfy React Rules of Hooks)
  // --------------------------------------------------------------------------
  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId);
  const currentMenuItems = menuItems.filter((i) => i.restaurant_id === selectedRestId);

  const isCreatedToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const isLast24h = now.getTime() - d.getTime() <= 24 * 60 * 60 * 1000 && d.getTime() <= now.getTime();
    return isSameDay || isLast24h;
  };

  const isCreatedThisWeek = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr).getTime();
    const now = Date.now();
    return now - d <= 7 * 24 * 60 * 60 * 1000;
  };

  const formatJoinDate = (isoStr?: string) => {
    if (!isoStr) return 'Recently';
    const d = new Date(isoStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatJoinTime = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const recentOnboardedList = React.useMemo(() => {
    const list: Array<{
      id: string;
      uniqueKey: string;
      type: 'new_restaurant' | 'claim';
      restaurant_name: string;
      restaurant_slug: string;
      restaurant_id: string;
      locality: string;
      owner_name: string;
      owner_email: string;
      owner_phone: string;
      created_at: string;
      status_badge: string;
      status_label: string;
    }> = [];

    // 1. Process restaurants created by owners or added to system
    restaurants.forEach((r) => {
      const matchedOwner = owners.find(
        (o) => o.restaurant_id === r.id || (o.restaurant_slug && o.restaurant_slug === r.slug)
      );
      const date = r.created_at || matchedOwner?.created_at;
      if (!date) return;

      list.push({
        id: r.id,
        uniqueKey: `rest-${r.id}`,
        type: 'new_restaurant',
        restaurant_name: r.name,
        restaurant_slug: r.slug,
        restaurant_id: r.id,
        locality: r.city || r.address_line1 || 'Delhi NCR',
        owner_name: matchedOwner?.owner_name || (r.is_claimed ? 'Verified Owner' : 'Direct Listed Cafe'),
        owner_email: matchedOwner?.owner_email || r.email || '',
        owner_phone: matchedOwner?.phone_number || r.phone || '',
        created_at: date,
        status_badge: r.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-stone-600 border-stone-200',
        status_label: r.is_active ? 'Live on Site' : 'Draft / Inactive',
      });
    });

    // 2. Process claims submitted by users/owners
    claims.forEach((c) => {
      list.push({
        id: c.id,
        uniqueKey: `claim-${c.id}`,
        type: 'claim',
        restaurant_name: c.restaurant_name,
        restaurant_slug: c.restaurant_slug || '',
        restaurant_id: c.restaurant_id,
        locality: 'Delhi NCR',
        owner_name: c.owner_name,
        owner_email: c.owner_email,
        owner_phone: c.phone_number,
        created_at: c.created_at,
        status_badge: c.status === 'ownership_active'
          ? 'bg-teal-50 text-teal-700 border-teal-200'
          : c.status === 'pending_admin_approval'
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-rose-50 text-rose-700 border-rose-200',
        status_label: c.status === 'ownership_active'
          ? 'Ownership Active'
          : c.status === 'pending_admin_approval'
          ? 'Claim Pending Approval'
          : c.status,
      });
    });

    // Sort newest first
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [restaurants, owners, claims]);

  const todayJoinedCount = recentOnboardedList.filter((item) => isCreatedToday(item.created_at)).length;
  const weekJoinedCount = recentOnboardedList.filter((item) => isCreatedThisWeek(item.created_at)).length;

  const displayedOnboardedItems = React.useMemo(() => {
    let base = recentOnboardedList;
    if (todayActivityTab === 'today') {
      base = recentOnboardedList.filter((item) => isCreatedToday(item.created_at));
    } else if (todayActivityTab === 'week') {
      base = recentOnboardedList.filter((item) => isCreatedThisWeek(item.created_at));
    }

    if (!todayActivitySearch.trim()) return base;
    const q = todayActivitySearch.toLowerCase().trim();
    return base.filter(
      (item) =>
        item.restaurant_name.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.owner_name.toLowerCase().includes(q) ||
        item.owner_email.toLowerCase().includes(q) ||
        item.owner_phone.includes(q)
    );
  }, [recentOnboardedList, todayActivityTab, todayActivitySearch]);

  // --------------------------------------------------------------------------
  // UN-AUTHENTICATED LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-stone-100 via-stone-50 to-orange-50/40">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-white p-2 flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 border border-orange-100">
              <MenuMapLogo className="w-full h-full" />
            </div>
            <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
              Admin Access Gate
            </h1>
            <p className="text-xs text-slate-500">
              Restricted portal. Only authorized management credentials may proceed.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-rose-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loginLoading ? 'Verifying Credentials...' : 'Authenticate Admin'}
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ← Return to Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20">
      
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
              <MenuMapLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                Menu Maps Admin
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {ADMIN_EMAIL}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-stone-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>Live Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Section Tabs Bar */}
      <div className="bg-white border-b border-stone-200 shadow-2xs sticky top-16 z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 sm:gap-2 py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { 
              id: 'owner_claims', 
              label: `Owner Claims (${claims.filter(c => c.status === 'pending_admin_approval').length})`, 
              icon: ShieldCheck 
            },
            { id: 'restaurants', label: `Restaurants (${restaurants.length})`, icon: UtensilsCrossed },
            { id: 'menu', label: 'Menu Management', icon: Layers },
            { id: 'collections', label: `Area Guides (${collections.length})`, icon: Sparkles },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: MessageSquare },
            { id: 'analytics', label: 'Search Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings & Supabase', icon: Settings },
            { id: 'system_intel', label: 'Website Vault & Timeline', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as AdminSection)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-stone-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================================================================ */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ================================================================ */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Joined Today</span>
                  {todayJoinedCount > 0 ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-400">0h-24h</span>
                  )}
                </div>
                <div className="text-3xl font-heading font-black text-emerald-600">
                  {todayJoinedCount}
                </div>
                <div className="text-[11px] text-stone-500 font-semibold truncate">
                  {weekJoinedCount} new joins this week
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Total Cafes & Venues</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {restaurants.length}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold truncate">
                  {restaurants.filter((r) => r.is_active).length} active on live site
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Total Menu Dishes</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {menuItems.length}
                </div>
                <div className="text-[11px] text-teal-600 font-semibold truncate">
                  {menuItems.filter((i) => i.is_available).length} available to order
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Moderated Reviews</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {reviews.length}
                </div>
                <div className="text-[11px] text-amber-600 font-semibold truncate">
                  {reviews.filter((r) => r.is_approved).length} approved
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold text-slate-500">Curated Collections</span>
                <div className="text-3xl font-heading font-black text-slate-900">
                  {collections.length}
                </div>
                <div className="text-[11px] text-purple-600 font-semibold truncate">
                  {collections.filter((c) => c.is_featured).length} featured on homepage
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 rounded-3xl p-6 border border-orange-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  Ready to add new cafe or food data?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  The live website reflects changes instantly without hardcoded placeholders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveSection('owner_claims')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Review Claims ({claims.filter(c => c.status === 'pending_admin_approval').length})</span>
                </button>

                <button
                  onClick={handleOpenAddRestaurant}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Restaurant</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSection('menu');
                    if (restaurants.length > 0) handleOpenAddItem();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Menu Dish</span>
                </button>

                <button
                  onClick={() => handleOpenAddCollection('Area-Guide')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>New Area Guide</span>
                </button>
              </div>
            </div>

            {/* ================================================================ */}
            {/* LIVE NEW RESTAURANTS & ONBOARDED CAFE OWNERS LEDGER */}
            {/* ================================================================ */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900">
                        New Restaurants & Onboarded Owners
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {todayJoinedCount} Joined Today
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live real-time feed of cafe owners and venues newly registered or claimed on Menu Maps.
                    </p>
                  </div>
                </div>

                {/* Filter and Search Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Period Filter Tabs */}
                  <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setTodayActivityTab('today')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        todayActivityTab === 'today'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Today ({todayJoinedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTodayActivityTab('week')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        todayActivityTab === 'week'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Last 7 Days ({weekJoinedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTodayActivityTab('all')}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        todayActivityTab === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      All ({recentOnboardedList.length})
                    </button>
                  </div>

                  {/* Search Filter */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Filter by cafe, name, phone..."
                      value={todayActivitySearch}
                      onChange={(e) => setTodayActivitySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Table / List */}
              {displayedOnboardedItems.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50/70 border border-dashed border-stone-200 rounded-2xl space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-heading font-bold text-sm text-stone-700">
                      {todayActivityTab === 'today'
                        ? 'No new restaurant pages created yet today.'
                        : 'No records matching your search filter.'}
                    </p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {todayActivityTab === 'today'
                        ? "Check back as cafe owners register via /list-cafe or claim their pages, or switch to view past week's joins."
                        : 'Try searching by a different name, locality, or clear the search input.'}
                    </p>
                  </div>
                  {todayActivityTab === 'today' && weekJoinedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setTodayActivityTab('week')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-slate-700 hover:bg-stone-50 shadow-2xs cursor-pointer"
                    >
                      <span>View {weekJoinedCount} joins from this week</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 rounded-l-xl">Restaurant / Cafe</th>
                        <th className="py-3 px-4">Owner / Contact</th>
                        <th className="py-3 px-4">Registration Type</th>
                        <th className="py-3 px-4">Joined At</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {displayedOnboardedItems.map((item) => (
                        <tr key={item.uniqueKey} className="hover:bg-stone-50/70 transition-colors">
                          {/* Cafe Info */}
                          <td className="py-3.5 px-4 font-medium">
                            <div className="font-heading font-extrabold text-slate-900 text-sm">
                              {item.restaurant_name}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{item.locality}</span>
                              {item.restaurant_slug && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[10px] text-stone-400">/{item.restaurant_slug}</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Owner Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">
                              {item.owner_name}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px]">
                              {item.owner_email && (
                                <a
                                  href={`mailto:${item.owner_email}`}
                                  className="text-stone-500 hover:text-rose-600 flex items-center gap-1 truncate max-w-[200px]"
                                  title={item.owner_email}
                                >
                                  <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="truncate">{item.owner_email}</span>
                                </a>
                              )}
                              {item.owner_phone && (
                                <a
                                  href={`tel:${item.owner_phone}`}
                                  className="text-stone-500 hover:text-emerald-600 flex items-center gap-1 font-mono"
                                >
                                  <PhoneCall className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span>{item.owner_phone}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            {item.type === 'new_restaurant' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>New Cafe Created</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <ShieldCheck className="w-3 h-3 text-amber-600" />
                                <span>Cafe Claimed</span>
                              </span>
                            )}
                          </td>

                          {/* Joined At */}
                          <td className="py-3.5 px-4 text-stone-600">
                            <div className="font-semibold text-slate-800">
                              {formatJoinDate(item.created_at)}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                              {formatJoinTime(item.created_at)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status_badge}`}>
                              {item.status_label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {item.restaurant_slug && (
                                <a
                                  href={`/restaurant/${item.restaurant_slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                                  title="View Live Page in New Tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {item.type === 'new_restaurant' && item.restaurant_id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const target = restaurants.find(r => r.id === item.restaurant_id);
                                    if (target) {
                                      setEditingRestaurant(target);
                                      setRestaurantModalOpen(true);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium transition-colors cursor-pointer"
                                  title="Edit Restaurant in Admin"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {item.type === 'claim' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveSection('owner_claims')}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium transition-colors cursor-pointer"
                                  title="Review Claim in Owner Claims Section"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Search Queries & Top Items from Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analytics preview */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    <h3 className="font-heading font-extrabold text-base text-slate-900">
                      Recent Search Activity
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {analytics.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {analytics.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                      >
                        <span className="font-bold text-slate-800">"{a.query}"</span>
                        <span className="text-slate-400">
                          {a.results_count} results •{' '}
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No search logs yet.</p>
                )}
              </div>

              {/* Status summary */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    Database Health
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">PostgreSQL / Supabase Adapter</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Active & Syncing
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">Admin Authentication</span>
                    <span className="font-bold text-slate-800">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-2xl bg-stone-50">
                    <span className="font-medium text-slate-600">Default Discovery City</span>
                    <span className="font-bold text-slate-800">{settings?.default_city || 'Delhi NCR'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
        {/* ================================================================ */}
        {/* 2. RESTAURANTS CRUD */}
        {/* ================================================================ */}
        {activeSection === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Restaurants & Cafes Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Create, edit, and maintain detailed profiles with opening hours, geolocation, and amenities.
                </p>
              </div>

              <button
                onClick={handleOpenAddRestaurant}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Add Restaurant</span>
              </button>
            </div>

            {restaurants.length > 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Venue</th>
                        <th className="px-5 py-3.5">Cuisines</th>
                        <th className="px-5 py-3.5">Cost for 2</th>
                        <th className="px-5 py-3.5">Rating</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {restaurants.map((rest) => (
                        <tr key={rest.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={rest.cover_image_url}
                                alt={rest.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{rest.name}</div>
                                <div className="text-[11px] text-slate-400">{rest.city} • /{rest.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {rest.cuisine_types?.map((c) => (
                                <span key={c} className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold">
                            ₹{rest.average_cost_for_two} ({rest.price_range})
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {rest.rating_avg.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {rest.is_temporarily_closed ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Temp Closed
                              </span>
                            ) : rest.is_active ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active Live
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedRestId(rest.id);
                                  setActiveSection('menu');
                                }}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-teal-600 font-bold"
                                title="Manage menu"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRestaurant(rest);
                                  setRestaurantModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-slate-600"
                                title="Edit restaurant"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"
                                title="Delete restaurant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-4">
                <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-heading font-extrabold text-xl text-slate-800">
                  No restaurants added yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Add Restaurant" to create your first venue. Real data only, exactly as required.
                </p>
                <button
                  onClick={handleOpenAddRestaurant}
                  className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Create First Restaurant
                </button>
              </div>
            )}
          </div>
        )}
        {/* ================================================================ */}
        {/* 3. MENU MANAGEMENT */}
        {/* ================================================================ */}
        {activeSection === 'menu' && (
          <div className="space-y-6">
            
            {/* Restaurant Selector Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Active Restaurant:</span>
                <select
                  value={selectedRestId}
                  onChange={(e) => handleSelectRestaurant(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-slate-900 font-extrabold text-sm rounded-xl px-3 py-2 focus:outline-hidden"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.city})
                    </option>
                  ))}
                </select>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
                  {categories.length} Categories • {currentMenuItems.length} Total Dishes
                </span>
              </div>

              {currentRestaurant && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory({
                        restaurant_id: selectedRestId,
                        name: '',
                        sort_order: categories.length + 1,
                        is_active: true,
                      });
                      setCategoryModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs"
                  >
                    + Add Category
                  </button>

                  <button
                    onClick={handleOpenAddItem}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs"
                  >
                    + Add Dish
                  </button>

                  <button
                    onClick={() => {
                      setBulkCategoryId(categories[0]?.id || '');
                      setBulkImportModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-xs"
                  >
                    Bulk Import (CSV/JSON)
                  </button>
                </div>
              )}
            </div>

            {restaurants.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-stone-200">
                Please add a restaurant before managing menus.
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-heading font-bold text-lg text-slate-800">
                  No menu categories yet for {currentRestaurant?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Create categories like "Appetizers", "Main Course", "Beverages", or "Desserts".
                </p>
                <button
                  onClick={() => {
                    setEditingCategory({ name: 'Specialties', sort_order: 1, is_active: true });
                    setCategoryModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl"
                >
                  Create Category
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((cat) => {
                  const itemsInCat = currentMenuItems.filter((i) => i.category_id === cat.id);
                  return (
                    <div key={cat.id} className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <h3 className="font-heading font-extrabold text-lg text-slate-900">
                            {cat.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-slate-600">
                            {itemsInCat.length} items
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem({
                                restaurant_id: selectedRestId,
                                category_id: cat.id,
                                name: '',
                                price: 200,
                                dietary_tags: ['Veg'],
                                spice_level: 0,
                                is_available: true,
                              });
                              setItemModalOpen(true);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1"
                          >
                            + Add to {cat.name}
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                            className="p-1 hover:bg-stone-100 rounded-lg text-slate-500"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 hover:bg-rose-50 rounded-lg text-rose-500"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items table / grid */}
                      {itemsInCat.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemsInCat.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-orange-200 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-extrabold text-sm text-slate-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="text-xs font-bold text-slate-800">
                                    ₹{item.price}{' '}
                                    <span className="text-[10px] font-normal text-slate-400">
                                      ({item.portion_size})
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setItemModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-white rounded-lg text-slate-600 shadow-2xs"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                          No dishes yet in this category. Click "+ Add to {cat.name}" above.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ================================================================ */}
        {/* 5. REVIEWS MODERATION */}
        {/* ================================================================ */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Reviews & Ratings Moderation
                </h2>
                <p className="text-xs text-slate-500">
                  Approve, feature, reply to customer feedback, or remove abuse.
                </p>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const rest = restaurants.find((r) => r.id === rev.restaurant_id);
                  return (
                    <div
                      key={rev.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {rev.user_name}
                          </span>{' '}
                          <span className="text-xs text-slate-400">
                            for {rest?.name || 'Restaurant'} •{' '}
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            {rev.rating} / 5
                          </span>

                          <button
                            onClick={() => handleToggleReviewApproval(rev)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                              rev.is_approved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rev.is_approved ? 'Approved' : 'Hidden'}
                          </button>

                          <button
                            onClick={() => handleToggleReviewFeatured(rev)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                              rev.is_featured
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-stone-100 text-slate-600'
                            }`}
                          >
                            {rev.is_featured ? 'Featured' : 'Regular'}
                          </button>

                          <button
                            onClick={() => handleOwnerReply(rev.id)}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-stone-100 text-slate-700 hover:bg-stone-200"
                          >
                            Reply
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm('Delete this review?')) {
                                await api.deleteReview(rev.id);
                                const revs = await api.getReviews(undefined, false);
                                setReviews(revs);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                        {rev.review_text}
                      </p>

                      {rev.owner_response && (
                        <div className="p-3 rounded-xl bg-orange-50/80 text-xs text-orange-950 border border-orange-200 space-y-1">
                          <span className="font-bold">Owner Response:</span>
                          <p>{rev.owner_response}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-stone-200">
                No customer reviews submitted yet.
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* 6. COLLECTIONS CRUD */}
        {/* ================================================================ */}
        {activeSection === 'collections' && (
          <div className="space-y-6">
            {/* Header with Title and Primary Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Living Neighborhood Food Guides
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-slate-600">
                    {collections.length} Total Guides
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
                  Iconic Area Guides & Curated Neighborhood Hubs
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                  Complete living food guides featuring live GPS distance tracking, Delhi Metro station & gate advice, local vibe badges, top 3–5 famous dishes with prices in ₹, and curated 3-stop food crawls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* View / Copy Supabase SQL */}
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer hover:bg-stone-50"
                  title="View ready-to-run Supabase SQL script"
                >
                  <Code2 className="w-4 h-4 text-rose-500" />
                  <span>View Supabase SQL</span>
                </button>

                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  title="Copy ready-to-run Supabase SQL script"
                >
                  {copiedIconicSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-extrabold">SQL Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-300" />
                      <span>Copy Supabase SQL</span>
                    </>
                  )}
                </button>

                {/* ⚡ Bulk 50-Cafe Importer */}
                <button
                  type="button"
                  onClick={() => setBulkAreaModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200 animate-pulse" />
                  <span>⚡ Bulk 50-Cafe Importer</span>
                </button>

                {/* New Area Guide */}
                <button
                  type="button"
                  onClick={() => handleOpenAddCollection('Area-Guide')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Area Guide</span>
                </button>
              </div>
            </div>

            {/* Supabase Schema Sync Callout */}
            <div className="bg-gradient-to-r from-stone-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                    Supabase PostgreSQL Sync
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Iconic Area Guides Stored with JSONB Metadata & Cafe Links
                </h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Every guide stores its zone, live coordinates, vibe badge, nearest metro station & gate, top famous dishes with prices in ₹, and 3-stop food crawls in the <code className="px-1.5 py-0.5 bg-black/40 rounded text-rose-300 font-mono text-[11px]">collections.area_metadata</code> column. Cafes are linked in <code className="px-1.5 py-0.5 bg-black/40 rounded text-rose-300 font-mono text-[11px]">collection_items</code>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors flex items-center gap-1.5 border border-stone-700"
                >
                  <Code2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Inspect Script</span>
                </button>
                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copiedIconicSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIconicSql ? 'Copied to Clipboard' : 'Copy Supabase SQL'}</span>
                </button>
              </div>
            </div>

            {/* Area Guides & Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => {
                const meta = col.area_metadata;
                const isArea = col.type === 'Area-Guide' || !!meta;
                const famousDishesCount = meta?.famous_dishes?.length || 0;
                const crawlStopsCount = meta?.food_crawl_stops?.length || 0;

                return (
                  <div
                    key={col.id}
                    className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
                  >
                    <div>
                      {/* Image Header with Badges */}
                      <div className="aspect-[16/9] relative overflow-hidden bg-stone-100">
                        <img
                          src={col.cover_image_url}
                          alt={col.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                            isArea ? 'bg-rose-500/90 text-white shadow-xs' : 'bg-black/60 text-white'
                          }`}>
                            {isArea ? '📍 Iconic Area Guide' : col.type}
                          </span>
                          {meta?.zone && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md">
                              {meta.zone}
                            </span>
                          )}
                        </div>

                        {/* Title overlay */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-heading font-extrabold text-base leading-snug drop-shadow-sm">
                            {col.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-stone-200 mt-0.5">
                            <span>/{col.slug}</span>
                            {meta?.avg_cost_for_two && (
                              <span>• ₹{meta.avg_cost_for_two} for two</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details & Metadata */}
                      <div className="p-4 space-y-3">
                        {/* Vibe badge */}
                        {meta?.vibe_badge ? (
                          <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-950 text-xs italic leading-relaxed">
                            "{meta.vibe_badge}"
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {col.description}
                          </p>
                        )}

                        {/* Metro & Parking Highlights */}
                        {meta?.nearest_metro && (
                          <div className="flex items-start gap-2 text-xs text-slate-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                            <Navigation className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1 font-medium">{meta.nearest_metro}</span>
                          </div>
                        )}

                        {/* Famous Dishes & Crawl Stats */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {famousDishesCount > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              <span>{famousDishesCount} Famous Dishes</span>
                            </span>
                          )}
                          {crawlStopsCount > 0 && (
                            <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] flex items-center gap-1">
                              <Compass className="w-3 h-3" />
                              <span>{crawlStopsCount}-Stop Crawl</span>
                            </span>
                          )}
                          {meta?.latitude && meta?.longitude && (
                            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[10px] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>GPS Ready</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Footer */}
                    <div className="px-4 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate(`/collections/${col.slug}`)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live Guide</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setEditingCollection(col);
                            const items = await api.getCollectionItems(col.id);
                            setCollectionItemsSelection(items.map((i) => i.restaurant_id || '').filter(Boolean));
                            setCollectionModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-stone-200/70 rounded-lg text-slate-700 transition-colors"
                          title="Edit Guide & Famous Dishes"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col.id, col.title)}
                          className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                          title="Delete Guide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 7. SEARCH & ANALYTICS */}
        {/* ================================================================ */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Search & Traffic Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Track what dishes and cuisines diners are actively searching for.
                </p>
              </div>

              <button
                onClick={() => {
                  const csv =
                    'Query,Results,Time\n' +
                    analytics
                      .map((a) => `"${a.query}",${a.results_count},"${a.created_at}"`)
                      .join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `menumap-analytics-${Date.now()}.csv`;
                  a.click();
                  showToast('Exported analytics CSV!', 'success');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-slate-700 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Query / Click</th>
                    <th className="px-5 py-3.5">Results Returned</th>
                    <th className="px-5 py-3.5">Filters Used</th>
                    <th className="px-5 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {analytics.map((a) => (
                    <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {a.query}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.results_count === 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.results_count} results
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {a.filters ? JSON.stringify(a.filters) : 'None'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-400">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 8. SETTINGS & SUPABASE SQL SCHEMA GENERATOR */}
        {/* ================================================================ */}
        {activeSection === 'settings' && settings && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-slate-900">
                  Site Configuration & Supabase Connection
                </h2>
                <p className="text-xs text-slate-500">
                  Manage database connectivity, default city coordinates, brand settings, and copy the full SQL script.
                </p>
              </div>
            </div>

            {/* Supabase Connection Setup Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">
                      Supabase PostgreSQL Connection & Live Sync
                    </h3>
                    {writeTestStatus?.checked && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        writeTestStatus.canWrite 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {writeTestStatus.canWrite ? '● Cloud Writes Active' : '▲ RLS Protected'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect your Supabase project URL and Anon Public Key. All cafe, category, and dish edits sync with Supabase cloud.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWrite}
                    disabled={checkingWrite}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                  >
                    <Check className={`w-4 h-4 ${checkingWrite ? 'animate-spin' : ''}`} />
                    <span>{checkingWrite ? 'Testing...' : 'Test Cloud Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncCloud}
                    disabled={syncingCloud}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingCloud ? 'animate-spin' : ''}`} />
                    <span>{syncingCloud ? 'Syncing to Cloud...' : '⚡ Sync All 88 Restaurants & 1,162 Dishes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={copySqlSchema}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedSchema ? 'Copied!' : 'Copy Safe Fix SQL (No 42710 Error)'}</span>
                  </button>
                </div>
              </div>

              {/* Notice regarding Error 42710 resolution & Supabase SQL */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-950 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Idempotent SQL Schema (Resolved "ERROR: 42710 policy already exists")</span>
                </div>
                <p className="text-teal-800 leading-relaxed">
                  PostgreSQL raises <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">ERROR: 42710</code> when executing <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">CREATE POLICY</code> if a policy was previously created. The updated schema includes <code className="bg-teal-100/70 px-1 py-0.5 rounded font-mono font-semibold">DROP POLICY IF EXISTS</code> before each table policy, making it 100% safe to run multiple times in your Supabase SQL Editor.
                </p>
                <p className="text-teal-800 leading-relaxed font-semibold">
                  Once you copy and run this updated SQL in your Supabase dashboard, full write access is granted so that creating or editing restaurants, categories, and dishes in this Admin Panel immediately saves to your Supabase cloud tables.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Administrator Account & Password Management */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF5A36] flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-slate-900">
                      Administrator Account & Password Security
                    </h3>
                    <p className="text-xs text-slate-500">
                      Secure administrator password and credentials management.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Set / Update Custom Admin Password
                  </label>
                  <input
                    type="password"
                    value={newAdminPasswordInput}
                    onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                    placeholder="Enter new password (at least 6 characters)"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-rose-500"
                  />
                  <p className="text-[11px] text-stone-500">
                    Active Status: {getAdminCustomPassword() ? <span className="font-mono font-bold text-emerald-600">Custom password active</span> : <span className="text-stone-400">Default administrator password active</span>}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAdminPasswordInput.trim() || newAdminPasswordInput.trim().length < 6) {
                        showToast('Password must be at least 6 characters long.', 'error');
                        return;
                      }
                      setAdminCustomPassword(newAdminPasswordInput.trim());
                      setNewAdminPasswordInput('');
                      showToast('Custom administrator password updated successfully!', 'success');
                    }}
                    className="btn bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Save Custom Password
                  </button>
                  {getAdminCustomPassword() && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('menumap_admin_custom_password');
                        setNewAdminPasswordInput('');
                        showToast('Reset to default administrator password', 'info');
                      }}
                      className="btn bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* General Site Settings Form */}
            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <h3 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-stone-100">
                Default Geolocation & Brand Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default City Name
                  </label>
                  <input
                    type="text"
                    value={settings.default_city}
                    onChange={(e) => setSettings({ ...settings, default_city: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.default_lat}
                    onChange={(e) => setSettings({ ...settings, default_lat: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={settings.default_lng}
                    onChange={(e) => setSettings({ ...settings, default_lng: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currency_symbol}
                    onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>



              {/* Feature Flags */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-slate-400">
                  Feature Flags
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'feature_reviews', label: 'User Reviews' },
                    { key: 'feature_bookmarks', label: 'Bookmarks' },
                    { key: 'feature_collections', label: 'Curated Lists' },
                    { key: 'feature_nearby', label: 'GPS Discovery' },
                  ].map((f) => (
                    <label key={f.key} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={(settings as any)[f.key]}
                        onChange={(e) => setSettings({ ...settings, [f.key]: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-colors"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* ================================================================ */}
        {/* 10. RESTAURANT OWNER CLAIMS & TWILIO OTP APPROVAL */}
        {/* ================================================================ */}
        {activeSection === 'owner_claims' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evidence-Based Verification & Email Activation</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshClaims}
                    disabled={refreshingClaims}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                    title="Force refresh claims from Supabase database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingClaims ? 'animate-spin text-emerald-300' : ''}`} />
                    <span>{refreshingClaims ? 'Refreshing...' : 'Refresh Claims'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyClaimsSql}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                    title="Copy ready-to-run Supabase SQL script"
                  >
                    {copiedClaimsSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedClaimsSql ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClaimsSqlModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
                    title="Inspect Supabase SQL script"
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View SQL</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  Restaurant Ownership Claims
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
                  Review submitted business credentials and 1 to 3 evidence photos. Once you click <strong>Approve Claim & Generate Link</strong>, an exclusive activation link is generated and dispatched to the owner's email address, allowing them to take ownership and set their password without SMS OTP.
                </p>
              </div>
            </div>

            {/* Claims Table / List */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
              {/* Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    All Ownership Requests ({claims.length})
                  </h3>
                  <p className="text-xs text-stone-500">
                    Evidence-based verification with dedicated email activation links
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'pending', 'approved', 'active', 'rejected'] as const).map((tab) => {
                    const count = tab === 'all' 
                      ? claims.length 
                      : tab === 'pending'
                      ? claims.filter(c => c.status === 'pending_admin_approval').length
                      : tab === 'approved'
                      ? claims.filter(c => c.status === 'approved').length
                      : tab === 'active'
                      ? claims.filter(c => c.status === 'ownership_active').length
                      : claims.filter(c => c.status === 'rejected').length;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setClaimFilterTab(tab)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          claimFilterTab === tab
                            ? 'bg-[#1C1917] text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        <span className="capitalize">{tab}</span> ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {claims.length === 0 ? (
                <div className="py-12 text-center space-y-3 text-slate-400">
                  <ShieldCheck className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="font-heading font-bold text-sm text-slate-600">No ownership claims found yet</p>
                  <p className="text-xs max-w-sm mx-auto">
                    When restaurant owners click "Claim Ownership" on their restaurant page, their requests with 1 to 3 evidence images will appear here for verification.
                  </p>
                  <button
                    type="button"
                    onClick={handleRefreshClaims}
                    disabled={refreshingClaims}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingClaims ? 'animate-spin' : ''}`} />
                    <span>Check Supabase Cloud for New Claims</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {claims
                    .filter((c) => {
                      if (claimFilterTab === 'all') return true;
                      if (claimFilterTab === 'pending') return c.status === 'pending_admin_approval';
                      if (claimFilterTab === 'approved') return c.status === 'approved';
                      if (claimFilterTab === 'active') return c.status === 'ownership_active';
                      if (claimFilterTab === 'rejected') return c.status === 'rejected';
                      return true;
                    })
                    .map((claim) => {
                      const cleanPhone = (claim.phone_number || '').replace(/\D/g, '');
                      const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                      const activationUrl = claim.activation_link || (typeof window !== 'undefined' ? `${window.location.origin}/claim-verify?token=${claim.activation_token}` : '');

                      const mailtoUrl = `mailto:${claim.owner_email}?subject=${encodeURIComponent(`Approved: Claim your cafe ownership for ${claim.restaurant_name} on MenuMaps`)}&body=${encodeURIComponent(
                        `Dear ${claim.owner_name},\n\nCongratulations! Your ownership claim for ${claim.restaurant_name} has been verified and approved by the MenuMaps team.\n\nClick your exclusive activation link below to set your password and access your verified cafe dashboard:\n${activationUrl}\n\nThis link is securely tied to ${claim.restaurant_name} and will allow you to update digital menus, manage live announcements, view customer order trays, and print QR codes.\n\nBest regards,\nMenuMaps Verification Team\nhttps://menumaps.in`
                      )}`;

                      const waShareUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Hello ${claim.owner_name}! 🎉 Your ownership claim for *${claim.restaurant_name}* on MenuMaps has been approved!\n\nClick your exclusive link to set your password and take ownership of your cafe:\n${activationUrl}`
                      )}`;

                      return (
                        <div key={claim.id} className="py-5 flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          <div className="space-y-2.5 max-w-2xl flex-1">
                            {/* Title & Status Badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-heading font-black text-base text-slate-900">
                                {claim.restaurant_name}
                              </h4>
                              {claim.status === 'pending_admin_approval' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  Pending Verification
                                </span>
                              )}
                              {claim.status === 'approved' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                  Approved • Activation Link Ready
                                </span>
                              )}
                              {claim.status === 'ownership_active' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  ✓ Ownership Active
                                </span>
                              )}
                              {claim.status === 'rejected' && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-300">
                                  Rejected
                                </span>
                              )}
                            </div>

                            {/* Claimant Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                              <div>
                                <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Owner / Claimant</span>
                                <strong className="text-[#1C1917] font-extrabold">{claim.owner_name}</strong>
                                {claim.designation && <span className="text-stone-500 ml-1">({claim.designation})</span>}
                              </div>

                              <div>
                                <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Email Address</span>
                                <a href={`mailto:${claim.owner_email}`} className="text-[#0F766E] font-bold underline truncate block">
                                  {claim.owner_email}
                                </a>
                              </div>

                              <div>
                                <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Mobile / WhatsApp</span>
                                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                                  {claim.phone_number}
                                </a>
                              </div>

                              <div>
                                <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Document Type</span>
                                <span className="font-bold text-stone-800 uppercase">{claim.proof_type}</span>
                                {claim.proof_reference && <span className="text-stone-500 ml-1">({claim.proof_reference})</span>}
                              </div>
                            </div>

                            {/* 1 to 3 Evidence Images Preview */}
                            {claim.evidence_images && claim.evidence_images.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1">
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Uploaded Evidence Documents ({claim.evidence_images.length}) - Tap to Inspect</span>
                                </span>
                                <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                                  {claim.evidence_images.map((imgUrl, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      onClick={() => setEvidencePreviewImage(imgUrl)}
                                      className="relative w-24 h-18 rounded-xl overflow-hidden border-2 border-stone-200 hover:border-[#0F766E] cursor-pointer group shadow-2xs shrink-0 bg-stone-100 transition-all"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Proof ${imgIdx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-white">
                                        Doc #{imgIdx + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {claim.message && (
                              <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                                "{claim.message}"
                              </p>
                            )}

                            {/* Active Link Box for Approved Claims */}
                            {claim.status === 'approved' && activationUrl && (
                              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                                <div className="flex items-center justify-between text-xs font-black text-teal-950">
                                  <span>Dedicated Activation Link for {claim.owner_name}:</span>
                                  <span className="text-[10px] text-teal-700 bg-white px-2 py-0.5 rounded-md border border-teal-200 font-bold">
                                    Single-Use Cafe Lock
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-teal-200 text-xs text-stone-700 font-mono truncate">
                                  <span className="truncate flex-1">{activationUrl}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(activationUrl);
                                      setCopiedClaimLinkId(claim.id);
                                      showToast('Activation link copied!', 'success');
                                      setTimeout(() => setCopiedClaimLinkId(null), 2500);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#0F766E] hover:bg-[#0D9488] text-white text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedClaimLinkId === claim.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedClaimLinkId === claim.id ? 'Copied' : 'Copy Link'}</span>
                                  </button>
                                </div>

                                {/* Direct Dispatch Shortcuts */}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  <a
                                    href={mailtoUrl}
                                    className="px-3 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-950 font-bold text-xs flex items-center gap-1.5 hover:bg-teal-100 transition-colors"
                                  >
                                    <Mail className="w-3.5 h-3.5 text-[#0F766E]" />
                                    <span>Send Link via Email ({claim.owner_email})</span>
                                  </a>
                                  <a
                                    href={waShareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 fill-white" />
                                    <span>Send via WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            <p className="text-[11px] text-slate-400">
                              Submitted on {new Date(claim.created_at).toLocaleString()}
                              {claim.admin_notes && ` • Notes: ${claim.admin_notes}`}
                            </p>
                          </div>

                          {/* Admin Actions */}
                          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 pt-2 lg:pt-0">
                            {claim.status === 'pending_admin_approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveClaim(claim.id)}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Approve & Generate Link</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectClaim(claim.id)}
                                  className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-red-50 text-red-600 border border-stone-200 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                            {claim.status === 'approved' && (
                              <div className="flex flex-col gap-1 items-end">
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 inline-block">
                                  Approved • Invitation Active
                                </span>
                              </div>
                            )}
                            {claim.status === 'ownership_active' && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                                Active & Logged In
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 9. SYSTEM INTEL & ARCHITECTURE VAULT */}
        {/* ================================================================ */}
        {activeSection === 'system_intel' && (
          <SystemIntelVault
            restaurants={restaurants}
            menuItems={menuItems}
            collections={collections}
            claims={claims}
            owners={owners}
            reviews={reviews}
            analytics={analytics}
          />
        )}

      </main>

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT RESTAURANT */}
      {/* ==================================================================== */}
      {restaurantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                {editingRestaurant.id ? 'Edit Restaurant' : 'Add New Restaurant'}
              </h3>
              <button onClick={() => setRestaurantModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRestaurant} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingRestaurant({
                        ...editingRestaurant,
                        name,
                        slug: editingRestaurant.id ? editingRestaurant.slug : slugify(name),
                      });
                    }}
                    placeholder="e.g. Roastery Coffee House"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Slug * (auto-generated)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.slug || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description (1-2 lines) *
                </label>
                <input
                  type="text"
                  required
                  value={editingRestaurant.short_description || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, short_description: e.target.value })}
                  placeholder="Cozy specialty cafe known for pour-overs, artisanal bakes, and lush garden seating."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Long Description / Story
                </label>
                <textarea
                  rows={3}
                  value={editingRestaurant.long_description || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, long_description: e.target.value })}
                  placeholder="Full background, sourcing of beans/produce, atmosphere, and special dining experience..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cuisine Types (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.cuisine_types?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        cuisine_types: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Cafe, Italian, Desserts"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price Range
                  </label>
                  <select
                    value={editingRestaurant.price_range || '₹₹'}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, price_range: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="₹">₹ (Budget-Friendly)</option>
                    <option value="₹₹">₹₹ (Moderate)</option>
                    <option value="₹₹₹">₹₹₹ (Fine Dine / Upscale)</option>
                    <option value="₹₹₹₹">₹₹₹₹ (Luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost for Two (INR)
                  </label>
                  <input
                    type="number"
                    value={editingRestaurant.average_cost_for_two || 600}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, average_cost_for_two: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.address_line1 || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address_line1: e.target.value })}
                    placeholder="Plot 12, Main Market, Sector 29"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRestaurant.city || 'Delhi NCR'}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Latitude (for map & nearby) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingRestaurant.latitude || 28.6139}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, latitude: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingRestaurant.longitude || 77.2090}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, longitude: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingRestaurant.phone || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editingRestaurant.whatsapp_number || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, whatsapp_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={editingRestaurant.website_url || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, website_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps Profile Link (Direct Place URL)
                </label>
                <input
                  type="url"
                  value={editingRestaurant.google_maps_url || ''}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, google_maps_url: e.target.value })}
                  placeholder="https://maps.app.goo.gl/... or https://google.com/maps/place/..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Cover Image URL with Live Preview & Curated Ambiance Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Cover Photo Visual Asset *
                </label>
                
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-16 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingRestaurant.cover_image_url ? (
                      <img 
                        src={editingRestaurant.cover_image_url} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      required
                      value={editingRestaurant.cover_image_url || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, cover_image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                    />

                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Vibe Presets:</span>
                      {[
                        { label: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Modern Bistro', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Rooftop Lounge', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Heritage Dining', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1000&auto=format&fit=crop&q=80' },
                        { label: 'Coffee Adda', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setEditingRestaurant({ ...editingRestaurant, cover_image_url: preset.url })}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                            editingRestaurant.cover_image_url === preset.url
                              ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                              : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_active ?? true}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_active: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Active on Live Site</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_featured ?? false}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_featured: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.is_open ?? true}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, is_open: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Open Now</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRestaurant.heritage_area ?? false}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, heritage_area: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>🏛️ Heritage Area</span>
                </label>
              </div>

              {/* Best For Tags Selection */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Best For Tags (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Studying', 'Date Night', 'Groups', 'Budget', 'Coffee', 'Breakfast', 'Late Night', 'Traditional Food', 'Views'].map((tag) => {
                    const isSelected = (editingRestaurant.best_for_tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = new Set(editingRestaurant.best_for_tags || []);
                          if (isSelected) current.delete(tag);
                          else current.add(tag);
                          setEditingRestaurant({ ...editingRestaurant, best_for_tags: Array.from(current) });
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ambience & Vibe Tags Selection */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ambience & Dining Vibe Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Cozy & Quiet', 'Lively & Social', 'Romantic & Intimate', 'Modern & Trendy', 'Traditional & Heritage', 'Outdoor Seating Available'].map((tag) => {
                    const isSelected = (editingRestaurant.ambience_tags || []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = new Set(editingRestaurant.ambience_tags || []);
                          if (isSelected) current.delete(tag);
                          else current.add(tag);
                          setEditingRestaurant({ ...editingRestaurant, ambience_tags: Array.from(current) });
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nearby Landmarks & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearby Landmarks (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.nearby_landmarks?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        nearby_landmarks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Delhi University North Campus, Metro Gate 4, Hudson Lane"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialty / Must-Try Dishes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.specialty_dishes?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingRestaurant({
                        ...editingRestaurant,
                        specialty_dishes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Cheese Bomb Burger, Baked Alfredo Pasta, Thick Shake"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {editingRestaurant.is_temporarily_closed && (
                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-1">
                    Temporary Closure Reason
                  </label>
                  <input
                    type="text"
                    value={editingRestaurant.temporary_closed_reason || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, temporary_closed_reason: e.target.value })}
                    placeholder="e.g. Renovation until next week"
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRestaurantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ==================================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                {editingItem.id ? 'Edit Menu Dish' : 'Add Dish to Menu'}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={editingItem.category_id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="Truffle Mushroom Pasta"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingItem.price || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Ingredients, flavors, preparation method..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              {/* Dish Photo Visual Asset with Auto-match & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Dish Photo Visual Asset
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingItem.name && editingItem.name.trim()) {
                        const matched = getSmartDishImage(editingItem.name);
                        setEditingItem({ ...editingItem, image_url: matched });
                        showToast(`Auto-matched accurate food photo for "${editingItem.name}"`, 'success');
                      } else {
                        showToast('Please type the dish name first to auto-match photo', 'info');
                      }
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg border border-orange-200 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-orange-500" />
                    <span>Auto-Match Food Photo</span>
                  </button>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingItem.image_url ? (
                      <img 
                        src={editingItem.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold text-center px-1">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      value={editingItem.image_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      placeholder="Enter photo URL or pick from presets below..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                    />

                    {/* Curated Food Preset Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Curated Category Presets:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200/80">
                        {DISH_IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, image_url: preset.imageUrl })}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                              editingItem.image_url === preset.imageUrl
                                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs font-bold'
                                : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                            }`}
                            title={preset.name}
                          >
                            {preset.name.split('/')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spice Level (0 to 5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editingItem.spice_level ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, spice_level: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Portion Size
                  </label>
                  <input
                    type="text"
                    value={editingItem.portion_size || 'Regular'}
                    onChange={(e) => setEditingItem({ ...editingItem, portion_size: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Available to Order</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <span>Chef's Special / Featured</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_must_try ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_must_try: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded"
                  />
                  <span>🔥 Must-Try Signature Dish</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CATEGORY */}
      {/* ==================================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              {editingCategory.id ? 'Edit Category' : 'New Menu Category'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Woodfired Pizzas"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editingCategory.sort_order ?? 0}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: BULK MENU IMPORT */}
      {/* ==================================================================== */}
      {bulkImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                Bulk Import Menu Items
              </h3>
              <button onClick={() => setBulkImportModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste JSON or CSV (Format: <code>Name, Price, Description, DietaryTag</code>).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Category *
              </label>
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={8}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder={`Classic Cappuccino, 180, Double espresso with velvety foam, Veg\nCold Brew, 210, 18-hour slow steep, Vegan\nAvocado Toast, 320, Sourdough with cherry tomatoes, Veg`}
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Run Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: COLLECTION & ICONIC AREA GUIDE */}
      {/* ==================================================================== */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  {editingCollection.id ? 'Edit Guide / Collection' : 'Create Living Area Guide'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure neighborhood identity, Metro station/gate, GPS pin, vibe badge, and top famous dishes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectionModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Guide Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCollection.title || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value, slug: slugify(e.target.value) })}
                    placeholder="e.g. Hudson Lane / North Campus Food Guide"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCollection.slug || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, slug: slugify(e.target.value) })}
                    placeholder="e.g. hudson-lane-food-guide"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  placeholder="The undisputed student food hub of Delhi University. Famous for giant monster shakes, crispy momos..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cover Photo URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingCollection.cover_image_url || ''}
                    onChange={(e) => setEditingCollection({ ...editingCollection, cover_image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collection Type
                  </label>
                  <select
                    value={editingCollection.type || 'Area-Guide'}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setEditingCollection({
                        ...editingCollection,
                        type: t,
                        area_metadata: t === 'Area-Guide' ? (editingCollection.area_metadata || {
                          area_name: editingCollection.title || '',
                          zone: 'North Delhi',
                          vibe_badge: 'Buzzing student adda, late-night waffles & pocket-friendly platters.',
                          best_time_to_visit: '4:00 PM – 11:30 PM',
                          nearest_metro: 'GTB Nagar Metro Station (Yellow Line), Exit Gate 4',
                          parking_tips: 'Paid municipal parking near Hudson Lane gate.',
                          avg_cost_for_two: 500,
                          latitude: 28.6942,
                          longitude: 77.2045,
                          famous_dishes: [],
                          food_crawl_stops: [],
                        }) : undefined
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Area-Guide">📍 Living Area Guide (with Metro, GPS & Vibe)</option>
                    <option value="Editorial">Editorial Themed List</option>
                    <option value="City-based">City-based</option>
                    <option value="Cuisine-based">Cuisine-based</option>
                    <option value="Occasion-based">Occasion-based</option>
                  </select>
                </div>
              </div>

              {/* AREA METADATA SECTION */}
              {(editingCollection.type === 'Area-Guide' || !!editingCollection.area_metadata) && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Area Guide Metadata & Insider Tips</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Zone</label>
                      <select
                        value={editingCollection.area_metadata?.zone || 'North Delhi'}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            zone: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      >
                        <option value="North Delhi">North Delhi</option>
                        <option value="West Delhi">West Delhi</option>
                        <option value="Central Delhi">Central Delhi</option>
                        <option value="South Delhi">South Delhi</option>
                        <option value="East Delhi">East Delhi</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Noida">Noida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Avg Cost for Two (₹)</label>
                      <input
                        type="number"
                        value={editingCollection.area_metadata?.avg_cost_for_two || 500}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            avg_cost_for_two: Number(e.target.value) || 500
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Vibe Badge</label>
                    <input
                      type="text"
                      value={editingCollection.area_metadata?.vibe_badge || ''}
                      onChange={(e) => setEditingCollection({
                        ...editingCollection,
                        area_metadata: {
                          ...(editingCollection.area_metadata || {} as any),
                          vibe_badge: e.target.value
                        }
                      })}
                      placeholder="e.g. Buzzing student adda, late-night waffles & pocket-friendly platters."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nearest Metro & Exit Gate</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.nearest_metro || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            nearest_metro: e.target.value
                          }
                        })}
                        placeholder="e.g. GTB Nagar Metro Station (Yellow Line), Gate 4"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Parking Advice</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.parking_tips || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            parking_tips: e.target.value
                          }
                        })}
                        placeholder="e.g. Paid municipal parking near Hudson Lane gate."
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Best Time to Visit</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.best_time_to_visit || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            best_time_to_visit: e.target.value
                          }
                        })}
                        placeholder="e.g. 4:00 PM – 11:30 PM (Lively student addas & evening bites)"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Famous For Summary</label>
                      <input
                        type="text"
                        value={editingCollection.area_metadata?.famous_for_summary || ''}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            famous_for_summary: e.target.value
                          }
                        })}
                        placeholder="e.g. Monster Shakes, Kurkure Momos, Desi Ghee Thalis..."
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingCollection.area_metadata?.latitude || 28.6139}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            latitude: Number(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingCollection.area_metadata?.longitude || 77.2090}
                        onChange={(e) => setEditingCollection({
                          ...editingCollection,
                          area_metadata: {
                            ...(editingCollection.area_metadata || {} as any),
                            longitude: Number(e.target.value)
                          }
                        })}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setEditingCollection({
                              ...editingCollection,
                              area_metadata: {
                                ...(editingCollection.area_metadata || {} as any),
                                latitude: Number(pos.coords.latitude.toFixed(5)),
                                longitude: Number(pos.coords.longitude.toFixed(5))
                              }
                            });
                            showToast('GPS coordinates updated from your device!', 'info');
                          });
                        }
                      }}
                      className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-rose-500" />
                      <span>Use My GPS</span>
                    </button>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* FAMOUS DISHES SPOTLIGHT MANAGER */}
                  {/* -------------------------------------------------------- */}
                  <div className="pt-3 border-t border-rose-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Top Famous Dishes Spotlight ({(editingCollection.area_metadata?.famous_dishes || []).length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentDishes = editingCollection.area_metadata?.famous_dishes || [];
                          const newDish: FamousDishSpotlight = {
                            name: '',
                            price: 180,
                            restaurant_name: '',
                            why_famous: '',
                            image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
                            is_veg: true,
                          };
                          setEditingCollection({
                            ...editingCollection,
                            area_metadata: {
                              ...(editingCollection.area_metadata || {} as any),
                              famous_dishes: [...currentDishes, newDish],
                            },
                          });
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Famous Dish</span>
                      </button>
                    </div>

                    {(editingCollection.area_metadata?.famous_dishes || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-3 bg-white rounded-xl border border-stone-200 text-center">
                        No famous dishes added yet. Click "+ Add Famous Dish" to spotlight iconic dishes of this area.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {(editingCollection.area_metadata?.famous_dishes || []).map((dish, dIdx) => (
                          <div
                            key={dIdx}
                            className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                Dish #{dIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingCollection.area_metadata?.famous_dishes || []).filter((_, idx) => idx !== dIdx);
                                  setEditingCollection({
                                    ...editingCollection,
                                    area_metadata: {
                                      ...(editingCollection.area_metadata || {} as any),
                                      famous_dishes: updated,
                                    },
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Dish Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={dish.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Crispy Kurkure Momos"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Price (₹) *</label>
                                <input
                                  type="number"
                                  required
                                  value={dish.price}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], price: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Restaurant / Cafe Name</label>
                                <input
                                  type="text"
                                  value={dish.restaurant_name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], restaurant_name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Big Yellow Door"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Why It's Famous</label>
                                <input
                                  type="text"
                                  value={dish.why_famous}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], why_famous: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="Double fried panko crusted dumplings with fiery dip"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-1">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="url"
                                  value={dish.image_url || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], image_url: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  placeholder="Image URL..."
                                  className="flex-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (dish.name) {
                                      const matched = getSmartDishImage(dish.name);
                                      const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                      dishes[dIdx] = { ...dishes[dIdx], image_url: matched };
                                      setEditingCollection({
                                        ...editingCollection,
                                        area_metadata: {
                                          ...(editingCollection.area_metadata || {} as any),
                                          famous_dishes: dishes,
                                        },
                                      });
                                      showToast(`Matched photo for "${dish.name}"`, 'success');
                                    } else {
                                      showToast('Please type dish name first', 'info');
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold shrink-0 hover:bg-rose-100"
                                >
                                  Auto-Match Photo
                                </button>
                              </div>

                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={dish.is_veg ?? true}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    const dishes = [...(editingCollection.area_metadata?.famous_dishes || [])];
                                    dishes[dIdx] = { ...dishes[dIdx], is_veg: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        famous_dishes: dishes,
                                      },
                                    });
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                                />
                                <span>Pure Veg</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* 3-STOP FOOD CRAWL ITINERARY MANAGER */}
                  {/* -------------------------------------------------------- */}
                  <div className="pt-3 border-t border-rose-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Curated 3-Stop Food Crawl ({(editingCollection.area_metadata?.food_crawl_stops || []).length} stops)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentStops = editingCollection.area_metadata?.food_crawl_stops || [];
                          const stopNum = currentStops.length + 1;
                          const newStop: FoodCrawlStop = {
                            stop_number: stopNum,
                            time: stopNum === 1 ? '4:30 PM' : stopNum === 2 ? '7:00 PM' : '9:30 PM',
                            type: stopNum === 1 ? 'Afternoon Starters & Momos' : stopNum === 2 ? 'Main Course Dinner Feast' : 'Late Night Shakes & Desserts',
                            venue_name: '',
                            recommended_dish: '',
                            distance_to_next: stopNum === 3 ? 'End of Trail' : '150m (2 min walk)',
                            note: stopNum === 1 ? 'Start early to beat the rush' : stopNum === 2 ? 'Spacious indoor seating' : 'Wind down with sweet dessert',
                          };
                          setEditingCollection({
                            ...editingCollection,
                            area_metadata: {
                              ...(editingCollection.area_metadata || {} as any),
                              food_crawl_stops: [...currentStops, newStop],
                            },
                          });
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Crawl Stop</span>
                      </button>
                    </div>

                    {(editingCollection.area_metadata?.food_crawl_stops || []).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic p-3 bg-white rounded-xl border border-stone-200 text-center">
                        No crawl stops added yet. Click "+ Add Crawl Stop" to configure a recommended neighborhood walk!
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {(editingCollection.area_metadata?.food_crawl_stops || []).map((stop, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Stop #{stop.stop_number || sIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingCollection.area_metadata?.food_crawl_stops || []).filter((_, idx) => idx !== sIdx);
                                  setEditingCollection({
                                    ...editingCollection,
                                    area_metadata: {
                                      ...(editingCollection.area_metadata || {} as any),
                                      food_crawl_stops: updated,
                                    },
                                  });
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                                title="Delete Stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Time</label>
                                <input
                                  type="text"
                                  value={stop.time}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], time: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. 4:30 PM"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Course / Experience Type</label>
                                <input
                                  type="text"
                                  value={stop.type}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], type: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Afternoon Crispy Momos & Chai"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Venue / Cafe Name</label>
                                <input
                                  type="text"
                                  value={stop.venue_name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], venue_name: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Ricos Cafe"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Recommended Dish</label>
                                <input
                                  type="text"
                                  value={stop.recommended_dish}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], recommended_dish: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Crispy Kurkure Momos"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Distance to Next Stop</label>
                                <input
                                  type="text"
                                  value={stop.distance_to_next || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], distance_to_next: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. 150m (2 min walk)"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Local Pro Tip / Note</label>
                                <input
                                  type="text"
                                  value={stop.note || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const stops = [...(editingCollection.area_metadata?.food_crawl_stops || [])];
                                    stops[sIdx] = { ...stops[sIdx], note: val };
                                    setEditingCollection({
                                      ...editingCollection,
                                      area_metadata: {
                                        ...(editingCollection.area_metadata || {} as any),
                                        food_crawl_stops: stops,
                                      },
                                    });
                                  }}
                                  placeholder="e.g. Beat the evening college rush"
                                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enhanced Multi-select & Filter for Linked Cafes */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Linked Cafes & Restaurants:
                    </label>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                      {collectionItemsSelection.length} of {restaurants.length} Linked
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const filteredIds = restaurants
                          .filter((r) => {
                            if (!collectionRestFilter.trim()) return true;
                            const text = `${r.name} ${r.city} ${r.address_line1}`.toLowerCase();
                            return text.includes(collectionRestFilter.toLowerCase());
                          })
                          .map((r) => r.id);
                        setCollectionItemsSelection((prev) => Array.from(new Set([...prev, ...filteredIds])));
                      }}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10.5px] font-bold"
                    >
                      Select Filtered
                    </button>
                    <button
                      type="button"
                      onClick={() => setCollectionItemsSelection([])}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[10.5px] font-bold"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOnlySelectedRests(!showOnlySelectedRests)}
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border transition-colors ${
                        showOnlySelectedRests
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-stone-200 text-slate-600'
                      }`}
                    >
                      {showOnlySelectedRests ? 'Showing Linked Only' : 'Show All'}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={collectionRestFilter}
                    onChange={(e) => setCollectionRestFilter(e.target.value)}
                    placeholder="Search cafe name, locality or city to quickly link..."
                    className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-stone-50 rounded-2xl border border-stone-200">
                  {restaurants
                    .filter((r) => {
                      if (showOnlySelectedRests && !collectionItemsSelection.includes(r.id)) return false;
                      if (!collectionRestFilter.trim()) return true;
                      const text = `${r.name} ${r.city} ${r.address_line1}`.toLowerCase();
                      return text.includes(collectionRestFilter.toLowerCase());
                    })
                    .map((r) => {
                      const checked = collectionItemsSelection.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-center justify-between text-xs font-medium p-2 rounded-xl transition-all cursor-pointer ${
                            checked
                              ? 'bg-white border border-rose-200 text-slate-900 shadow-2xs font-semibold'
                              : 'hover:bg-white text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setCollectionItemsSelection((prev) =>
                                  checked ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                                );
                              }}
                              className="w-4 h-4 text-rose-600 rounded shrink-0 cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="truncate">{r.name}</span>
                              <span className="text-[11px] text-slate-400 ml-1.5">
                                • {r.city} ({r.price_range})
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                            {r.cuisine_types?.[0] && (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-slate-600">
                                {r.cuisine_types[0]}
                              </span>
                            )}
                            <span className="text-amber-600 font-bold">★ {r.rating_avg}</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Guide & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ⚡ BULK 50-CAFE & ICONIC AREA IMPORTER */}
      {/* ==================================================================== */}
      {bulkAreaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Zap className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Bulk 50-Cafe & Iconic Area Importer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste your list of cafes (e.g. 50 cafes of Nangloi, Hudson Lane, etc.) and auto-generate the complete Iconic Area Guide!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBulkAreaModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkImportAreaCafes} className="space-y-4">
              {/* Area Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area / Locality Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkAreaName}
                    onChange={(e) => setBulkAreaName(e.target.value)}
                    placeholder="e.g. Nangloi, Hudson Lane, Rajouri Garden"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Zone
                  </label>
                  <select
                    value={bulkAreaZone}
                    onChange={(e) => setBulkAreaZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="West Delhi">West Delhi</option>
                    <option value="North Delhi">North Delhi</option>
                    <option value="Central Delhi">Central Delhi</option>
                    <option value="South Delhi">South Delhi</option>
                    <option value="East Delhi">East Delhi</option>
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Noida">Noida</option>
                  </select>
                </div>
              </div>

              {/* Vibe and Famous For */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vibe Badge Summary
                  </label>
                  <input
                    type="text"
                    value={bulkAreaVibe}
                    onChange={(e) => setBulkAreaVibe(e.target.value)}
                    placeholder="e.g. Generous portions, pure desi ghee classics & party addas."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost for Two (₹)
                  </label>
                  <input
                    type="number"
                    value={bulkAreaCostForTwo}
                    onChange={(e) => setBulkAreaCostForTwo(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Famous For / Food Identity Summary
                </label>
                <input
                  type="text"
                  value={bulkAreaFamousFor}
                  onChange={(e) => setBulkAreaFamousFor(e.target.value)}
                  placeholder="e.g. Rich Desi Ghee Thalis, Paneer Tikka Platters, Crispy Momos & Budget Student Addas."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              {/* Metro & Parking Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearest Delhi Metro Station & Gate
                  </label>
                  <input
                    type="text"
                    value={bulkAreaMetro}
                    onChange={(e) => setBulkAreaMetro(e.target.value)}
                    placeholder="e.g. Nangloi Metro Station (Green Line), Exit Gate 2"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parking Realities
                  </label>
                  <input
                    type="text"
                    value={bulkAreaParking}
                    onChange={(e) => setBulkAreaParking(e.target.value)}
                    placeholder="e.g. Street parking available. Metro & e-rickshaws recommended."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bulkAreaLat}
                    onChange={(e) => setBulkAreaLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bulkAreaLng}
                    onChange={(e) => setBulkAreaLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setBulkAreaLat(Number(pos.coords.latitude.toFixed(5)));
                        setBulkAreaLng(Number(pos.coords.longitude.toFixed(5)));
                        showToast('Set to current GPS coordinates!', 'info');
                      });
                    }
                  }}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-rose-500" />
                  <span>Use My Location</span>
                </button>
              </div>

              {/* 50 Cafes Textarea Input */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Paste 50 Cafes List (Text, CSV, TSV, or JSON) *
                  </label>
                  {bulkAreaCafesText.trim() && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>
                        {bulkAreaCafesText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0 && !/^(name|cafe)[\s,\|\t]/i.test(l)).length} Cafes Detected
                      </span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <p className="font-semibold text-slate-700 mb-1">Supported Formats (accepts any):</p>
                  <ul className="list-disc list-inside space-y-0.5 font-mono text-[10.5px]">
                    <li>Delimited: <span className="text-rose-600">Cafe Name | Signature Dish | Dish Price | Cost for Two | Address</span></li>
                    <li>Simple text: <span className="text-rose-600">1. Cafe Name - Signature Dish - Address</span></li>
                    <li>Plain list: Just paste cafe names (one per line)</li>
                    <li>JSON array of restaurant/cafe objects</li>
                  </ul>
                </div>

                <textarea
                  rows={8}
                  required
                  value={bulkAreaCafesText}
                  onChange={(e) => setBulkAreaCafesText(e.target.value)}
                  placeholder={`Example list for Nangloi:\nNagpal Di Hatti | Chole Bhature | 140 | 300 | Main Rohtak Road, Nangloi\nBikaner Sweets & Restaurant | Paneer Butter Masala Thali | 240 | 500 | Near Nangloi Metro Gate 2\nThe Chai Adda | Kulhad Chai & Bun Maska | 80 | 200 | Nangloi Camp Market\nYellow Chilli Cafe | Tandoori Kurkure Momos | 160 | 400 | Shiv Ram Park, Nangloi\nAggarwal Sweet Corner | Special Rasmalai & Samosa | 90 | 220 | Railway Road, Nangloi`}
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBulkAreaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={bulkAreaLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {bulkAreaLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creating Cafes, Dishes & Area Guide...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>⚡ Import Cafes & Generate Iconic Guide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: 📋 SUPABASE SQL SCRIPT VIEWER & EXPORT */}
      {/* ==================================================================== */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Supabase PostgreSQL SQL Schema & RLS Policies
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ready-to-run SQL script for <code className="text-rose-600 font-bold">collections</code>, <code className="text-rose-600 font-bold">area_metadata JSONB</code>, and <code className="text-rose-600 font-bold">collection_items</code>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSqlModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">How to apply in Supabase:</span> Open your Supabase Dashboard, go to <strong>SQL Editor</strong> in the left sidebar, paste this script, and click <strong>Run</strong>. It is 100% idempotent and safe to re-run.
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 text-stone-200 font-mono text-[11px]">
                <div className="p-4 overflow-y-auto max-h-[46vh] whitespace-pre select-all leading-relaxed">
                  {ICONIC_AREAS_SQL_FEATURE}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-xs text-slate-400">
                Includes GIN index on <code className="text-slate-600">area_metadata</code> & RLS policies
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSqlModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={copyIconicSql}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedIconicSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy SQL to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: 📋 SUPABASE CLAIMS & OWNER LOGIN SQL SCRIPT VIEWER */}
      {/* ==================================================================== */}
      {claimsSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-stone-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Supabase SQL for Restaurant Claims & Owner Logins
                  </h3>
                  <p className="text-xs text-slate-500">
                    Creates & updates <code className="text-emerald-700 font-bold">restaurant_claims</code> and <code className="text-emerald-700 font-bold">restaurant_owners</code> tables in Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setClaimsSqlModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Instructions:</span> Open your Supabase Dashboard, click <strong>SQL Editor</strong> on the left, paste this script, and click <strong>Run</strong>. This enables storing evidence images, owner email, activation tokens, and direct email logins.
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 text-stone-200 font-mono text-[11px]">
                <div className="p-4 overflow-y-auto max-h-[46vh] whitespace-pre select-all leading-relaxed">
                  {OWNERSHIP_CLAIMS_SQL_FEATURE}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-xs text-slate-400">
                100% idempotent • Safe to run repeatedly
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClaimsSqlModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-stone-100 cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={copyClaimsSql}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedClaimsSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy SQL to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Full-Screen Lightbox Preview */}
      {evidencePreviewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEvidencePreviewImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Submitted Ownership Evidence Document</span>
              </span>
              <button
                type="button"
                onClick={() => setEvidencePreviewImage(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[80vh] flex items-center justify-center p-3 bg-black">
              <img
                src={evidencePreviewImage}
                alt="Evidence Fullscreen"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
