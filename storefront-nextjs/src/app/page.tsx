'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  User,
  Product,
  Rfq,
  Supplier,
  Order,
  Inquiry,
  CalcResult,
  SourcingHub,
  ActiveTab,
  DetailTab,
  UserRole,
} from '@/types';

// Import modular components
import Header from '../components/Header';
import Marketplace from '../components/Marketplace';
import ProductDetail from '../components/ProductDetail';
import RfqBoard from '../components/RfqBoard';
import SupplierDashboard from '../components/SupplierDashboard';
import AuthModal from '../components/AuthModal';
import IntentSelector from '../components/IntentSelector';
import SellerOnboarding from '../components/SellerOnboarding';
import AdminDashboard from '../components/AdminDashboard';

// Centralized API client — single source of truth for URLs & session storage
import { GATEWAY_URL, COMPUTE_URL, STORAGE_KEYS, logoutApi } from '@/lib/apiClient';

const SEED_HUBS: SourcingHub[] = [
  { id: 'surat', name: 'Surat Sourcing Hub', location: 'Gujarat', category: 'Textiles & Apparel', count: '1,420+ Mills', icon: '🧵' },
  { id: 'morbi', name: 'Morbi Ceramic Hub', location: 'Gujarat', category: 'Building Materials', count: '850+ Factories', icon: '🧱' },
  { id: 'tirupur', name: 'Tirupur Garment Cluster', location: 'Tamil Nadu', category: 'Apparel & Knitwear', count: '1,100+ Manufacturers', icon: '👕' },
  { id: 'aligarh', name: 'Aligarh Hardware Hub', location: 'Uttar Pradesh', category: 'Industrial & Hardware', count: '620+ Units', icon: '🔐' },
  { id: 'assam', name: 'Assam Tea Plantations', location: 'Assam', category: 'Agriculture & Food', count: '340+ Estates', icon: '🍃' },
  { id: 'moradabad', name: 'Moradabad Brassware Hub', location: 'Uttar Pradesh', category: 'Handicrafts & Decor', count: '480+ Artisans', icon: '🏺' }
];

export default function StorefrontPortal() {
  const queryClient = useQueryClient();

  // Navigation & Workspace View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('marketplace'); // marketplace, rfqs, supplier-dashboard, product-detail, intent-selector
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Auth & Session state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('buyer'); // buyer vs supplier session simulation
  const [activeSupplierId, setActiveSupplierId] = useState<number>(1);

  // Dynamic Detail Sizing & Escrow Calculation State
  const [calcQty, setCalcQty] = useState<number>(0);
  const [buyerState, setBuyerState] = useState<string>('Gujarat');
  const [carrier, setCarrier] = useState<string>('vtrans');
  const [paymentMethod, setPaymentMethod] = useState<string>('NEFT');
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('description'); // description, supplier, shipping
  const [selectedThumb, setSelectedThumb] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // New Listing Forms Dynamic State
  const [newSupName, setNewSupName] = useState('');
  const [newSupLoc, setNewSupLoc] = useState('');
  const [newSupState, setNewSupState] = useState('Gujarat');
  const [newSupIso, setNewSupIso] = useState('');
  const [newSupGstin, setNewSupGstin] = useState('');

  const [newProdSupId, setNewProdSupId] = useState('1');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState('Textiles & Garments');
  const [newProdHub, setNewProdHub] = useState('surat');
  const [newProdMoq, setNewProdMoq] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Pieces');
  const [newProdPriceMax, setNewProdPriceMax] = useState('');
  const [newProdPriceMin, setNewProdPriceMin] = useState('');
  const [newProdHsn, setNewProdHsn] = useState('');
  const [newProdWeight, setNewProdWeight] = useState('1.0');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Bid Proposal State
  const [biddingRfqId, setBiddingRfqId] = useState<number | null>(null);
  const [bidPrice, setBidPrice] = useState<string>('');
  const [bidLogistics, setBidLogistics] = useState<string>('');

  // Local Storage inquiry Leads list state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Notification Alerts
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  
  // Dynamic Simulator Ref to keep it running
  const simulatorTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Alert Manager helper
  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper Headers injector
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Core Bootstrapper & Session Restorer
  useEffect(() => {
    // Load session from centralized storage keys
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setUserRole(parsedUser.role);
        if (parsedUser.supplierId) {
          setActiveSupplierId(parsedUser.supplierId);
        }
      } catch {
        // Corrupt session — clear it
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    // Bootstrap local inquiry leads if missing
    if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([
        { id: 'inq1', productName: 'Bio-Washed Wholesale Plain Tees', buyerName: 'Aman Gupta (TrendSet)', message: 'Order of 3,000 Pieces - Pending Escrow safe Payment Verification.', date: 'Today, 11:30 AM', status: 'Unread', supplierId: 3 },
        { id: 'inq2', productName: 'Double Charge Polished Vitrified Floor Tiles', buyerName: 'Preeti Builders', message: 'Requesting freight quote details for tiles shipment to Ahmedabad.', date: 'Yesterday', status: 'Replied', supplierId: 2 }
      ]));
    }
    
    setInquiries(JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || 'null') || []);
    initLiveSourcingSimulator();

    return () => {
      if (simulatorTimer.current) clearInterval(simulatorTimer.current);
    };
  }, []);

  // Sync session supplier variables
  useEffect(() => {
    if (user && user.role === 'supplier' && user.supplierId) {
      setActiveSupplierId(user.supplierId);
    }
  }, [user]);

  // Auth Functions
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setUserRole(newUser.role as UserRole);
    // Persist via centralized storage keys
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    
    if (newUser.role === 'admin') {
      setActiveTab('admin-dashboard');
      triggerAlert('Welcome to Admin Central dashboard.');
    } else if (newUser.role === 'supplier') {
      setActiveTab('supplier-dashboard');
      triggerAlert('Welcome back to the Factory Sales Workspace!');
    } else {
      // Redirect to Intent Selector landing dashboard
      setActiveTab('intent-selector');
    }
  };

  const handleLogout = async () => {
    await logoutApi(); // centralized logout — clears storage internally
    setToken(null);
    setUser(null);
    setUserRole('buyer');
    triggerAlert('Logged out successfully.');
    setActiveTab('marketplace');
  };

  const handleChooseRole = (chosenRole: UserRole) => {
    if (chosenRole === 'supplier') {
      if (!user) {
        setIsAuthOpen(true);
        triggerAlert('Please login or register to access the supplier workspace.', 'error');
        return;
      }
      
      setUserRole((user.role === 'admin' ? 'supplier' : user.role) as UserRole);
      
      if (user.role === 'admin') {
        setActiveTab('admin-dashboard');
        triggerAlert('Welcome to Admin Central dashboard.');
      } else if (user.role === 'supplier') {
        setActiveTab('supplier-dashboard');
        triggerAlert('Welcome back to the Factory Sales Workspace!');
      } else {
        // user is buyer, route based on onboarding state
        setActiveTab('seller-onboarding');
        triggerAlert('Redirecting to the Seller Onboarding wizard.');
      }
    } else {
      setUserRole('buyer');
      setActiveTab('marketplace');
      triggerAlert('Welcome back to the Buyer Sourcing Hub!');
    }
  };

  // --- REACT QUERY FOR DYNAMIC DATA ---

  // 1. Fetch Products Sourcing Catalog Query
  const { data: products = [], refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ['products', selectedHub, searchQuery, selectedCategories],
    queryFn: async () => {
      try {
        let queryParams = [];
        if (selectedHub) queryParams.push(`hub=${selectedHub}`);
        if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
        
        const res = await fetch(`${GATEWAY_URL}/products?${queryParams.join('&')}`);
        if (!res.ok) throw new Error('Gateway Offline');
        
        let data = await res.json();
        if (selectedCategories.length > 0) {
          data = data.filter((p: Product) => selectedCategories.includes(p.category));
        }
        return data;
      } catch (err) {
        // Local Cache offline Fallback
        const seedProducts = [
          { id: 'p1', name: 'Pure Banarasi Silk Designer Saree Collection', category: 'Textiles & Garments', hub: 'surat', weightPerUnit: 0.8, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', hsn: '50072010', unit: 'Pieces', moq: 100, tiers: [{ min: 100, max: 299, price: 850 }, { min: 300, max: 999, price: 720 }, { min: 1000, max: null, price: 600 }], description: 'Exquisite Banarasi sarees made with rich golden zari borders and premium synthetic-silk blend. Perfect for boutiques and large retailers.', supplier: { name: 'Gujarat Handloom Weaves', location: 'Surat', state: 'Gujarat', trustScore: '98%', responseTime: '< 2 Hours' } },
          { id: 'p2', name: 'Premium Double Charge Polished Vitrified Floor Tiles', category: 'Home & Ceramics', hub: 'morbi', weightPerUnit: 14.5, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80', hsn: '69072100', unit: 'Sqm', moq: 500, tiers: [{ min: 500, max: 1999, price: 340 }, { min: 2000, max: 4999, price: 290 }, { min: 5000, max: null, price: 250 }], description: '600x1200mm gloss finished vitrified floor tiles with exceptional scratch and stain resistance.', supplier: { name: 'Morbi Ceramic Export Corp', location: 'Morbi', state: 'Gujarat', trustScore: '96%', responseTime: '< 3 Hours' } },
          { id: 'p3', name: '100% Combed Cotton Wholesale Plain Tees', category: 'Textiles & Garments', hub: 'tirupur', weightPerUnit: 0.2, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', hsn: '61091000', unit: 'Pieces', moq: 200, tiers: [{ min: 200, max: 999, price: 110 }, { min: 1000, max: 4999, price: 95 }, { min: 5000, max: null, price: 80 }], description: '180 GSM, super-soft combed cotton wholesale shirts perfect for custom printing.', supplier: { name: 'Tirupur Apparel Craft Mills', location: 'Tirupur', state: 'Tamil Nadu', trustScore: '99%', responseTime: '< 1 Hour' } }
        ];
        return seedProducts.filter(p => {
          const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesHub = !selectedHub || p.hub === selectedHub;
          const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(p.category);
          return matchesSearch && matchesHub && matchesCat;
        });
      }
    }
  });

  // 2. Fetch RFQs Sourcing Board Feed
  const { data: rfqs = [], refetch: refetchRFQs } = useQuery<Rfq[]>({
    queryKey: ['rfqs'],
    queryFn: async () => {
      try {
        const res = await fetch(`${GATEWAY_URL}/rfqs`);
        if (!res.ok) throw new Error('Offline');
        return await res.json();
      } catch (err) {
        return [
          { id: 1, title: 'Sourcing 5,000 Pcs Bio-Washed Hoodies for Winter Sourcing', category: 'Textiles & Garments', quantity: 5000, unit: 'Pieces', targetPrice: 320, buyerName: 'Aman G. (TrendSet Apparel)', buyerLocation: 'Bengaluru, Karnataka', datePosted: '2 hours ago', description: 'Looking for 300 GSM fleece bio-washed hoodies in 5 mix corporate colors.', status: 'Active (1 Bids)', bids: [{ supplier: 'South Textile Mills', bidPrice: 310, date: '1 hour ago' }] }
        ];
      }
    }
  });

  // 3. Fetch Suppliers Session dropdowns list
  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const res = await fetch(`${GATEWAY_URL}/suppliers`);
        if (!res.ok) throw new Error('Offline');
        return await res.json();
      } catch (err) {
        return [
          { id: 1, name: 'Gujarat Handloom Weaves', location: 'Surat, Gujarat' },
          { id: 2, name: 'Morbi Ceramic Export Corp', location: 'Morbi, Gujarat' },
          { id: 3, name: 'Tirupur Apparel Craft Mills', location: 'Tirupur, Tamil Nadu' }
        ];
      }
    }
  });

  // 4. Fetch Active Orders scoped by active supplier id
  const { data: orders = [], refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ['orders', activeSupplierId],
    queryFn: async () => {
      try {
        const res = await fetch(`${GATEWAY_URL}/orders?supplierId=${activeSupplierId}`, {
          headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Offline');
        return await res.json();
      } catch (err) {
        return [];
      }
    }
  });

  // --- MUTATIONS USING REACT QUERY ---

  // 1. Broadcast RFQ Sourcing Request
  const createRfqMutation = useMutation({
    mutationFn: async (rfqData: Record<string, unknown>) => {
      if (!token) throw new Error('Please login to broadcast sourcing requests');
      const res = await fetch(`${GATEWAY_URL}/rfqs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rfqData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message ?? 'RFQ broadcasted!');
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setActiveTab('rfqs');
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  // 2. Submit Factory Bid Sourcing Quote
  const submitBidMutation = useMutation({
    mutationFn: async ({ rfqId, bidData }: { rfqId: number; bidData: Record<string, unknown> }) => {
      if (!token) throw new Error('Please login to submit bid quotes');
      const res = await fetch(`${GATEWAY_URL}/rfqs/${rfqId}/bids`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bidData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message ?? 'Bid submitted!');
      setBiddingRfqId(null);
      setBidPrice('');
      setBidLogistics('');
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  // 3. Create Product Wholesale Listing
  const listProductMutation = useMutation({
    mutationFn: async (prodData: Record<string, unknown>) => {
      if (!token) throw new Error('Please login to create wholesale listings');
      const res = await fetch(`${GATEWAY_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(prodData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message ?? 'Product listed!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetProductForm();
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  // 4. SafeTrade Escrow Sourcing Checkout Payment Commit
  const escrowCommitMutation = useMutation({
    mutationFn: async (orderPayload: Record<string, unknown>) => {
      if (!token) throw new Error('Please login to commit sourcing escrow contracts');
      const res = await fetch(`${GATEWAY_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message ?? 'Order placed!');
      setCalcResult(null);
      setSelectedProductId(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActiveTab('supplier-dashboard');
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  // Onboard Supplier (No Login needed - standard mock onboard)
  const onboardSupplierMutation = useMutation({
    mutationFn: async (supData: Record<string, unknown>) => {
      const res = await fetch(`${GATEWAY_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      return data;
    },
    onSuccess: (data: { message?: string }) => {
      triggerAlert(data.message ?? 'Supplier registered!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setNewSupName(''); setNewSupLoc(''); setNewSupGstin(''); setNewSupIso('');
    },
    onError: (err: Error) => {
      triggerAlert(err.message, 'error');
    }
  });

  // --- SIMULATION & CLICK HANDLERS ---

  const handleHubSelect = (hubId: string) => {
    setSelectedHub(selectedHub === hubId ? '' : hubId);
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const resetProductForm = () => {
    setNewProdName(''); setNewProdMoq(''); setNewProdPriceMin(''); setNewProdPriceMax('');
    setNewProdHsn(''); setNewProdDesc(''); setNewProdWeight('1.0');
  };

  // RFQ Submissions
  const handleFastRfq = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      triggerAlert('Please login or register to broadcast sourcing requests.', 'error');
      return;
    }
    const form = e.currentTarget;
    const product = (form.elements.namedItem('fast-rfq-prod') as HTMLInputElement)?.value;
    const quantity = parseInt((form.elements.namedItem('fast-rfq-qty') as HTMLInputElement)?.value || '0');
    const desc = (form.elements.namedItem('fast-rfq-desc') as HTMLTextAreaElement)?.value;
    if (!product || !quantity) return;

    createRfqMutation.mutate({
      title: `Sourcing requirement for: ${product}`,
      category: 'Textiles & Garments',
      quantity,
      unit: 'Pieces',
      targetPrice: 280, // default target price
      description: desc || 'Urgent wholesale supply contract broadcast.'
    });
    form.reset();
  };

  const handleFullRfq = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      triggerAlert('Please login or register to broadcast sourcing requests.', 'error');
      return;
    }
    const form = e.currentTarget;
    const title = (form.elements.namedItem('rfq-title') as HTMLInputElement)?.value;
    const cat = (form.elements.namedItem('rfq-cat') as HTMLSelectElement)?.value;
    const qty = parseInt((form.elements.namedItem('rfq-qty') as HTMLInputElement)?.value || '0');
    const price = parseFloat((form.elements.namedItem('rfq-price') as HTMLInputElement)?.value || '0');
    const desc = (form.elements.namedItem('rfq-desc') as HTMLTextAreaElement)?.value;

    createRfqMutation.mutate({
      title,
      category: cat,
      quantity: qty,
      unit: 'Pieces',
      targetPrice: price,
      description: desc
    });
    form.reset();
  };

  // Supplier Bid Submissions
  const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bidPrice || !bidLogistics || biddingRfqId === null) return;

    submitBidMutation.mutate({
      rfqId: biddingRfqId,
      bidData: {
        bidPrice: parseFloat(bidPrice),
        logisticsTerms: bidLogistics
      }
    });
  };

  // Onboard Sourcing Supplier Form
  const handleOnboardSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSupName || !newSupLoc || !newSupGstin) {
      triggerAlert('Mill Name, Location and Sourcing GSTIN are mandatory fields.', 'error');
      return;
    }

    onboardSupplierMutation.mutate({
      name: newSupName,
      location: newSupLoc,
      stateName: newSupState,
      gstin: newSupGstin,
      iso: newSupIso || 'ISO Certified MSME'
    });
  };

  // Create Product Sourcing Listing Form
  const handleListProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProdName || !newProdMoq || !newProdPriceMin || !newProdPriceMax) {
      triggerAlert('Title, MOQ, pricing scales, and supplier selection are mandatory.', 'error');
      return;
    }

    listProductMutation.mutate({
      name: newProdName,
      category: newProdCat,
      hub: newProdHub,
      weightPerUnit: parseFloat(newProdWeight),
      moq: parseInt(newProdMoq),
      unit: newProdUnit,
      priceMax: parseFloat(newProdPriceMax),
      priceMin: parseFloat(newProdPriceMin),
      hsn: newProdHsn || '84818030',
      description: newProdDesc,
      supplierId: parseInt(newProdSupId)
    });
  };

  // Dynamic server-side GST, Tax and freight Sizing call to Go Microservice
  const handleEscrowSizing = async () => {
    const selectedProd = products.find(p => p.id === selectedProductId);
    if (!selectedProd) return;

    if (calcQty < selectedProd.moq) {
      triggerAlert(`Minimum order quantity (MOQ) for this catalog item is ${selectedProd.moq} ${selectedProd.unit}.`, 'error');
      return;
    }

    setIsCalculating(true);
    try {
      const itemsPayload = [{
        productId: selectedProd.id,
        productName: selectedProd.name,
        quantity: parseInt(String(calcQty)),
        weightPerUnit: parseFloat(String(selectedProd.weightPerUnit)) || 1.0,
        tiers: (selectedProd.tiers || []).map(t => ({
          min: t.min,
          max: t.max ?? null,
          price: t.price
        })),
        supplierState: selectedProd.supplier?.state ?? selectedProd.Supplier?.state ?? 'Gujarat',
        supplierId: selectedProd.supplier?.id ?? selectedProd.Supplier?.id ?? 1
      }];

      const payload = {
        items: itemsPayload,
        buyerState,
        carrier,
        paymentMethod
      };

      const res = await fetch(`${COMPUTE_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Go calculations engine offline');
      const data = await res.json();
      setCalcResult(data);
      triggerAlert('Sizing and freight logistics calculated dynamically via HTTP/2 calculations microservice.');
    } catch (err) {
      // Local fallback calculation engine
      const unitWeight = parseFloat(String(selectedProd.weightPerUnit ?? 1.0)) || 1.0;
      const totalWeight = unitWeight * calcQty;
      
      const tiers = selectedProd.tiers || [];
      let unitPrice = tiers.length > 0 ? tiers[0].price : 850;
      tiers.forEach(t => {
        if (calcQty >= t.min && (!t.max || calcQty <= t.max)) {
          unitPrice = t.price;
        }
      });

      const subtotal = calcQty * unitPrice;
      const tax = subtotal * 0.18;
      
      let rate = 6.0;
      if (carrier === 'delhivery') rate = 18.0;
      else if (carrier === 'tci') rate = 4.0;
      const freight = Math.ceil(totalWeight * rate);
      const total = subtotal + tax + freight;

      const supplierState: string = selectedProd.supplier?.state ?? selectedProd.Supplier?.state ?? 'Gujarat';
      const taxType = supplierState.trim().toLowerCase() === buyerState.trim().toLowerCase() ? 
        'CGST (9%) + SGST (9%)' : 'IGST (18%)';

      const parentCode = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

      const localResult = {
        parentCode,
        suborders: [{
          orderCode: parentCode,
          productName: selectedProd.name,
          quantity: parseInt(String(calcQty)),
          subtotal,
          tax,
          freight,
          total,
          supplierId: selectedProd.supplier ? selectedProd.supplier.id : (selectedProd.Supplier ? selectedProd.Supplier.id : 1),
          supplierState,
          taxType
        }],
        grandSubtotal: subtotal,
        grandTax: tax,
        grandFreight: freight,
        grandTotal: total,
        message: `Dynamic checkout parameters compiled successfully offline.`
      };
      
      setCalcResult(localResult);
      triggerAlert('Dynamic freight rates and GST calculated locally (Go Service Offline fallback).');
    } finally {
      setIsCalculating(false);
    }
  };

  // Secure Escrow Contract Funding Payment Commit
  const handleEscrowCommit = () => {
    if (!calcResult) return;
    const selectedProd = products.find(p => p.id === selectedProductId);
    if (!selectedProd) return;

    escrowCommitMutation.mutate({
      items: [{ productId: selectedProd.id, quantity: parseInt(String(calcQty)) }],
      buyerState,
      carrier,
      paymentMethod
    });
  };

  // Background lead simulation (Mock Sourcing inbox leads creator)
  const initLiveSourcingSimulator = () => {
    if (simulatorTimer.current) clearInterval(simulatorTimer.current);

    const buyerNames = ['Vikram Rathore', 'Aman Singhal', 'Preeti Nair', 'Kunal Shah', 'Ankit Jain', 'Sunita Roy', 'Gaurav Mehta'];
    const cities = ['Noida, UP', 'Ahmedabad, Gujarat', 'Tirupur, TN', 'Ludhiana, Punjab', 'Surat, Gujarat', 'Mumbai, MH', 'Kolkata, WB'];
    const productsList = ['Surat Silk Weft Yarn', 'Morbi Gloss Vitrified Tiles', 'Aligarh Brass Padlocks', 'Assam Orthodox Black Tea', 'Bio-Washed Plain Shirts'];
    
    simulatorTimer.current = setInterval(() => {
      // 20% chance to generate a lead simulation per cycle
      if (Math.random() > 0.8) {
        const randomBuyer = buyerNames[Math.floor(Math.random() * buyerNames.length)];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomProd = productsList[Math.floor(Math.random() * productsList.length)];
        const qty = 500 + Math.floor(Math.random() * 4500);

        // Auto inquiry injector in dashboard
        let localInq = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || 'null') || [];
        const simInq = {
          id: 'inq_' + Date.now(),
          productName: randomProd,
          buyerName: randomBuyer,
          message: `Seeking bulk contract rates ex-factory. Target delivery: ${randomCity} with secure escrow checkout.`,
          date: 'Just now',
          status: 'Unread',
          supplierId: 1 + Math.floor(Math.random() * 4) // distribute
        };
        localInq.unshift(simInq);
        if (localInq.length > 20) localInq = localInq.slice(0, 20);
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(localInq));
        setInquiries(localInq);
      }
    }, 20000); // run every 20 seconds
  };

  // Helper variables
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Alert Banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--primary)' : 'var(--success)',
          color: '#ffffff',
          padding: '1rem 1.75rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          {toast.type === 'error' ? '⚠️ ' : '✅ '}
          {toast.message}
        </div>
      )}

      {/* Auth Modal overlay */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        triggerAlert={triggerAlert}
        gatewayUrl={GATEWAY_URL}
      />

      {/* Dynamic Digital KYC Verification Modal */}
      {isKycModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10005,
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsKycModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.8rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛡️ e-KYC Identity Check
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              To ensure platform integrity and eliminate trust issues, BuyEway requires dynamic validation of Aadhaar, PAN, or government credentials before broadcasting B2B RFQs or sending product inquiries.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.2rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              color: '#f59e0b'
            }}>
              💡 <strong>Demo Sandbox Quick-Verification:</strong> Click the button below to simulate Aadhaar dynamic OTP authentication via India's DigiLocker gateway.
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${GATEWAY_URL}/auth/verify-buyer`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    credentials: 'include'
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'e-KYC failed');
                  
                  // Update parent auth state
                  handleAuthSuccess(data.token, data.user);
                  triggerAlert('Dynamic Aadhaar & PAN verification complete! Sourcing unlocked.');
                  setIsKycModalOpen(false);
                } catch (err) {
                  triggerAlert(err instanceof Error ? err.message : 'Verification failed.', 'error');
                }
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)', border: 'none' }}
            >
              ⚡ Verify Identity via DigiLocker OTP ➔
            </button>
          </div>
        </div>
      )}

      {/* Header component */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedHub={selectedHub}
        setSelectedHub={setSelectedHub}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userRole={userRole}
        setUserRole={(role: string) => setUserRole(role as UserRole)}
        rfqsCount={rfqs.length}
        setSelectedProductId={setSelectedProductId}
        fetchProducts={refetchProducts}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Workspace Portal Content */}
      <main>
        
        {/* Tab Router Switch */}
        {activeTab === 'intent-selector' && (
          <IntentSelector onChooseRole={handleChooseRole} />
        )}

        {activeTab === 'seller-onboarding' && (
          <SellerOnboarding 
            user={user!}
            token={token}
            gatewayUrl={GATEWAY_URL}
            triggerAlert={triggerAlert}
            onAuthSuccess={handleAuthSuccess}
            setActiveTab={setActiveTab}
            handleLogout={handleLogout}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboard 
            token={token}
            gatewayUrl={GATEWAY_URL}
            triggerAlert={triggerAlert}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace 
            hubs={SEED_HUBS}
            selectedHub={selectedHub}
            handleHubSelect={handleHubSelect}
            products={products}
            selectedCategories={selectedCategories}
            handleCategorySelect={handleCategorySelect}
            setSelectedProductId={setSelectedProductId}
            setCalcQty={setCalcQty}
            setCalcResult={setCalcResult}
            setActiveTab={setActiveTab}
            handleFastRfq={handleFastRfq}
          />
        )}

        {activeTab === 'product-detail' && selectedProduct && (
          <ProductDetail 
            selectedProduct={selectedProduct}
            selectedThumb={selectedThumb}
            setSelectedThumb={setSelectedThumb}
            activeDetailTab={activeDetailTab}
            setActiveDetailTab={setActiveDetailTab}
            calcQty={calcQty}
            setCalcQty={setCalcQty}
            buyerState={buyerState}
            setBuyerState={setBuyerState}
            carrier={carrier}
            setCarrier={setCarrier}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            handleEscrowSizing={handleEscrowSizing}
            isCalculating={isCalculating}
            calcResult={calcResult}
            handleEscrowCommit={handleEscrowCommit}
            setActiveTab={setActiveTab}
            setSelectedProductId={setSelectedProductId}
          />
        )}

        {activeTab === 'rfqs' && (
          <RfqBoard 
            rfqs={rfqs}
            refreshData={refetchRFQs}
            biddingRfqId={biddingRfqId}
            setBiddingRfqId={setBiddingRfqId}
            bidPrice={bidPrice}
            setBidPrice={setBidPrice}
            bidLogistics={bidLogistics}
            setBidLogistics={setBidLogistics}
            handleBidSubmit={handleBidSubmit}
            handleFullRfq={handleFullRfq}
            userRole={userRole}
          />
        )}

        {activeTab === 'supplier-dashboard' && (
          <SupplierDashboard 
            activeSupplierId={activeSupplierId}
            setActiveSupplierId={setActiveSupplierId}
            suppliers={suppliers}
            orders={orders}
            inquiries={inquiries}
            products={products}
            handleOnboardSupplier={handleOnboardSupplierSubmit}
            newSupName={newSupName}
            setNewSupName={setNewSupName}
            newSupLoc={newSupLoc}
            setNewSupLoc={setNewSupLoc}
            newSupState={newSupState}
            setNewSupState={setNewSupState}
            newSupIso={newSupIso}
            setNewSupIso={setNewSupIso}
            newSupGstin={newSupGstin}
            setNewSupGstin={setNewSupGstin}
            handleListProduct={handleListProductSubmit}
            newProdSupId={newProdSupId}
            setNewProdSupId={setNewProdSupId}
            newProdName={newProdName}
            setNewProdName={setNewProdName}
            newProdCat={newProdCat}
            setNewProdCat={setNewProdCat}
            newProdHub={newProdHub}
            setNewProdHub={setNewProdHub}
            newProdMoq={newProdMoq}
            setNewProdMoq={setNewProdMoq}
            newProdUnit={newProdUnit}
            setNewProdUnit={setNewProdUnit}
            newProdPriceMax={newProdPriceMax}
            setNewProdPriceMax={setNewProdPriceMax}
            newProdPriceMin={newProdPriceMin}
            setNewProdPriceMin={setNewProdPriceMin}
            newProdHsn={newProdHsn}
            setNewProdHsn={setNewProdHsn}
            newProdWeight={newProdWeight}
            setNewProdWeight={setNewProdWeight}
            newProdDesc={newProdDesc}
            setNewProdDesc={setNewProdDesc}
            verifyDispatch={(o) => {
              triggerAlert(`Dispatch verification logged. Secure transport carrier matching initiated.`);
              // Simulate sync updating local query keys
              queryClient.setQueryData(['orders', activeSupplierId], (oldOrders: any) => {
                return (oldOrders || []).map((ord: any) => ord.id === o.id || ord.orderCode === o.orderCode ? { ...ord, status: 'Factory Dispatched' } : ord);
              });
            }}
            downloadSafeTrade={() => {
              triggerAlert('Sourcing escrow details successfully compiled and downloaded.');
            }}
          />
        )}

      </main>

      {/* Footer Section */}
      <footer style={{ marginTop: 'auto' }}>
        <div className="footer-container">
          <div>
            <div className="logo-wrapper">
              <div className="logo-icon">B</div>
              <span>BuyEway</span>
            </div>
            <p className="footer-col-desc">Connecting manufacturing clusters and industrial mega factories directly with global bulk sourcing buyers. Supporting scalable B2B logistics pipelines.</p>
          </div>

          <div>
            <h4 className="footer-title">Megacluster Hubs</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><span className="footer-link">Surat Synthetic Textiles</span></li>
              <li className="footer-link-item"><span className="footer-link">Morbi Premium Ceramics</span></li>
              <li className="footer-link-item"><span className="footer-link">Tirupur Apparel & Hosiery</span></li>
              <li className="footer-link-item"><span className="footer-link">Aligarh Heavy Brassware</span></li>
              <li className="footer-link-item"><span className="footer-link">Assam Quality Tea Gardens</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">SafeTrade Services</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><span className="footer-link" onClick={() => setActiveTab('rfqs')}>RFQ Sourcing Market Feed</span></li>
              <li className="footer-link-item"><span className="footer-link">SafeTrade Escrow Banking</span></li>
              <li className="footer-link-item"><span className="footer-link">Weight freight Logistics Quotes</span></li>
              <li className="footer-link-item"><span className="footer-link">GSTIN Compliance Verification</span></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">B2B Regulations</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Standardized trade compliance under HSN classification. GST taxation rules apply automatically based on interstate or intrastate wholesale contracts.
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 BuyEway B2B Sourcing Marketplace. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span className="footer-link">Terms of Use</span>
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">MSME Sourcing Regulations</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
