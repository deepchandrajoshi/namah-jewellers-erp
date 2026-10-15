import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Camera, 
  Upload, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  UserCheck, 
  Search, 
  Clock,
  Layers, 
  PackageCheck, 
  PackageSearch, 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  X,
  AlertCircle
} from 'lucide-react';

const SALES_PERSONS = ["sohil", "mohit", "hema", "akansha", "yogita", "ziya", "deepika"];
const ORDERS_PERSONS = ["amardeep", "gautam"];
const WORK_TYPES = ["new", "repair", "customization"];

const INITIAL_STAFF = [
  { id: 1, name: "Sohil", role: "Sales Person", status: "Present", checkIn: "09:45 AM" },
  { id: 2, name: "Mohit", role: "Sales Person", status: "Present", checkIn: "10:00 AM" },
  { id: 3, name: "Hema", role: "Sales Person", status: "Present", checkIn: "09:30 AM" },
  { id: 4, name: "Akansha", role: "Sales Person", status: "Absent", checkIn: "-" },
  { id: 5, name: "Yogita", role: "Sales Person", status: "Present", checkIn: "10:15 AM" },
  { id: 6, name: "Ziya", role: "Sales Person", status: "Present", checkIn: "10:05 AM" },
  { id: 7, name: "Deepika", role: "Sales Person", status: "Present", checkIn: "09:50 AM" },
  { id: 8, name: "Amardeep", role: "Orders Person", status: "Present", checkIn: "09:15 AM" },
  { id: 9, name: "Gautam", role: "Orders Person", status: "Present", checkIn: "09:20 AM" },
];

export default function App() {
  const [activeModule, setActiveModule] = useState('orders');
  const [activeTab, setActiveTab] = useState('master');
  
  const [googleScriptUrl, setGoogleScriptUrl] = useState(
    import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwqfcSJkqfRy5O-1_8AjKKhPjASJZJsLOybOC1nQ1MKoRLjNd93Jn0_1pPmeRmFwWoy/exec'
  );

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [karigarOrders, setKarigarOrders] = useState([]);
  const [selectedOrderForKarigar, setSelectedOrderForKarigar] = useState(null);
  const [attendance, setAttendance] = useState(INITIAL_STAFF);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [salesFilter, setSalesFilter] = useState('All');
  const [deskFilter, setDeskFilter] = useState('All');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');

  // Complete Form Data State
  const [formData, setFormData] = useState({
    orderSheetNumber: `NJ-2026-${Math.floor(100 + Math.random() * 900)}`,
    tagNumber: '',
    customerName: '',
    contactNumber: '',
    salesPersonName: 'sohil',
    jewelleryItem: '',
    goldWeight: '',
    diamondWeight: '',
    colorTone: 'Yellow Gold',
    size: '',
    purity: '22K',
    orderDescription: '',
    orderTakenDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderPersonName: 'amardeep',
    orderType: 'new'
  });

  const [karigarForm, setKarigarForm] = useState({
    karigarName: '',
    colorStone: '',
    alternation: '',
    karigarDod: ''
  });

  // Camera & Image Handlers
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Live Data from Google Sheet
  const fetchOrdersFromSheet = async () => {
    if (!googleScriptUrl) return;
    setIsLoading(true);
    try {
      const res = await fetch(googleScriptUrl);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromSheet();
  }, [googleScriptUrl]);

  // Camera Functions
  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Unable to access camera on this device.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      setImagePreview(dataUrl);
      setImageBase64(dataUrl);

      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Order directly to Google Sheet
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (googleScriptUrl) {
      try {
        const payload = {
          action: "NEW_ORDER",
          ...formData,
          imageBase64: imageBase64 || "",
          imageName: `Jewel_${Date.now()}.jpg`,
          imageMimeType: 'image/jpeg'
        };
        await fetch(googleScriptUrl, { 
          method: 'POST', 
          body: JSON.stringify(payload) 
        });
      } catch (err) {
        console.error("Sync error:", err);
      }
    }

    setIsSubmitting(false);
    setShowIntakeModal(false);
    alert(`Order logged for Tag #${formData.tagNumber || 'PENDING'}!`);
    fetchOrdersFromSheet();

    // Reset Form
    setImagePreview(null);
    setImageBase64(null);
    setFormData({
      orderSheetNumber: `NJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      tagNumber: '',
      customerName: '',
      contactNumber: '',
      salesPersonName: 'sohil',
      jewelleryItem: '',
      goldWeight: '',
      diamondWeight: '',
      colorTone: 'Yellow Gold',
      size: '',
      purity: '22K',
      orderDescription: '',
      orderTakenDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      orderPersonName: 'amardeep',
      orderType: 'new'
    });
  };

  // Karigar Assignment
  const handleAssignKarigar = async (e) => {
    e.preventDefault();
    if (!selectedOrderForKarigar) return;

    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrderForKarigar.id) {
        return { 
          ...o, 
          karigarName: karigarForm.karigarName,
          onOffStatus: true,
          productStatus: 'Under Process'
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    setKarigarOrders([{ ...selectedOrderForKarigar, karigarName: karigarForm.karigarName, ...karigarForm }, ...karigarOrders]);
    setSelectedOrderForKarigar(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, productStatus: newStatus } : o));
  };

  const handleToggleOnOff = (id, isAssigned) => {
    if (!isAssigned) return;
    setOrders(orders.map(o => o.id === id ? { ...o, onOffStatus: !o.onOffStatus } : o));
  };

  // Filter Logic
  const filteredOrders = orders.filter(o => {
    const isAssigned = Boolean(o.karigarName);

    if (activeTab === 'notassign' && isAssigned) return false;
    if (activeTab === 'underprocess' && o.productStatus !== 'Under Process') return false;
    if (activeTab === 'ready' && o.productStatus !== 'ready but bill pending') return false;
    if (activeTab === 'packed' && o.productStatus !== 'packed') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCust = (o.customerName || '').toLowerCase().includes(q);
      const matchTag = (o.tagNumber || '').toLowerCase().includes(q);
      const matchSheet = (o.orderSheetNumber || '').toLowerCase().includes(q);
      const matchItem = (o.jewelleryItem || '').toLowerCase().includes(q);
      if (!matchCust && !matchTag && !matchSheet && !matchItem) return false;
    }

    if (salesFilter !== 'All' && (o.salesPersonName || '').toLowerCase() !== salesFilter.toLowerCase()) return false;
    if (deskFilter !== 'All' && (o.orderPersonName || '').toLowerCase() !== deskFilter.toLowerCase()) return false;
    if (workTypeFilter !== 'All' && (o.orderType || '').toLowerCase() !== workTypeFilter.toLowerCase()) return false;

    return true;
  });

  const totalCount = orders.length;
  const notAssignCount = orders.filter(o => !o.karigarName).length;
  const underProcessCount = orders.filter(o => o.productStatus === 'Under Process').length;
  const readyCount = orders.filter(o => o.productStatus === 'ready but bill pending').length;
  const packedCount = orders.filter(o => o.productStatus === 'packed').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header Bar */}
      <header className="bg-[#111827] border-b border-amber-500/20 px-6 py-3 flex flex-wrap justify-between items-center shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/10">
            NJ
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-amber-400 font-serif">NAMAH JEWELLERS</h1>
            <p className="text-[10px] tracking-widest text-slate-400 uppercase font-mono">Bespoke Jewellery & Operations ERP</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-2 sm:mt-0">
          <button 
            onClick={fetchOrdersFromSheet}
            className="p-2 bg-[#1f293d] hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Live Sheet Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Sheet
          </button>

          <div className="flex bg-[#1f293d] p-1 rounded-xl border border-slate-700/60">
            <button 
              onClick={() => setActiveModule('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                activeModule === 'orders' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Orders Management
            </button>
            <button 
              onClick={() => setActiveModule('attendance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                activeModule === 'attendance' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Attendance Check
            </button>
          </div>

          <button 
            onClick={() => setShowConfigModal(true)}
            className="p-2 bg-[#1f293d] hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl transition"
            title="Configure Apps Script Link"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="w-full px-4 sm:px-8 py-6 space-y-6">
        {activeModule === 'orders' && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Total Items</p>
                  <h3 className="text-2xl font-black text-slate-100 mt-1">{totalCount}</h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Not Assign</p>
                  <h3 className="text-2xl font-black text-red-400 mt-1">{notAssignCount}</h3>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Under Process</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-1">{underProcessCount}</h3>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Check_Ready</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">{readyCount}</h3>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <PackageCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Check_Packed</p>
                  <h3 className="text-2xl font-black text-purple-400 mt-1">{packedCount}</h3>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <PackageSearch className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter Tabs Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex bg-[#111827] p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('master')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'master' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Master All ({totalCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('notassign')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'notassign' ? 'bg-red-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    --Not Assign-- ({notAssignCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('underprocess')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'underprocess' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Under Process ({underProcessCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('ready')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'ready' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Check_Ready ({readyCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('packed')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'packed' ? 'bg-purple-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Check_Packed ({packedCount})
                  </button>

                  <button
                    onClick={() => setActiveTab('karigar')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      activeTab === 'karigar' ? 'bg-amber-300 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Karigar Dispatch ({karigarOrders.length})
                  </button>
                </div>

                <button 
                  onClick={() => setShowIntakeModal(true)}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <PlusCircle className="w-4 h-4" /> + New Item Intake
                </button>
              </div>

              {/* Filters */}
              <div className="bg-[#111827] p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search Tag Number, customer, sheet #, or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Sales Person:</span>
                  <select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} className="bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold outline-none capitalize">
                    <option value="All">All Salespersons</option>
                    {SALES_PERSONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Order Desk:</span>
                  <select value={deskFilter} onChange={(e) => setDeskFilter(e.target.value)} className="bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold outline-none capitalize">
                    <option value="All">All Executives</option>
                    {ORDERS_PERSONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table View */}
            {activeTab !== 'karigar' ? (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0b0f19] text-amber-400 border-b border-slate-800 text-[11px] font-mono tracking-wider uppercase">
                        <th className="p-4 w-20">Image</th>
                        <th className="p-4">Tag # / Sheet</th>
                        <th className="p-4">Customer & Dates</th>
                        <th className="p-4">Jewellery Specs & Purity</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Order Exec</th>
                        <th className="p-4">Place Order ➔</th>
                        <th className="p-4 text-center">ON/OFF</th>
                        <th className="p-4">Product Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-sans">
                      {isLoading ? (
                        <tr>
                          <td colSpan="9" className="text-center py-12 text-amber-400 font-mono">
                            Loading items from Google Sheet...
                          </td>
                        </tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-12 text-slate-500 font-medium">No items found matching the filter.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          const isAssigned = Boolean(ord.karigarName);

                          return (
                            <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                              <td className="p-4">
                                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden relative group">
                                  <img src={ord.productImageLink} alt="Product" className="w-full h-full object-cover" />
                                  <a href={ord.productImageLink} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-amber-300">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </td>

                              <td className="p-4 space-y-1">
                                <div className="font-mono font-black text-amber-300 text-sm">{ord.tagNumber || 'TAG-PENDING'}</div>
                                <div className="text-[11px] text-slate-400 font-mono font-bold">{ord.orderSheetNumber}</div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {ord.orderType}
                                </span>
                              </td>

                              <td className="p-4 space-y-1">
                                <div className="font-bold text-slate-100 text-sm">{ord.customerName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{ord.contactNumber}</div>
                                <div className="text-[10px] text-amber-400/90 font-mono">Taken: {ord.orderTakenDate || '-'}</div>
                                <div className="text-[10px] text-emerald-400 font-mono">DOD: {ord.deliveryDate || '-'}</div>
                              </td>

                              <td className="p-4 space-y-0.5 font-mono text-[11px]">
                                <div className="font-bold text-slate-200 text-xs">{ord.jewelleryItem} ({ord.purity || '22K'})</div>
                                <div className="text-slate-400">
                                  Gold: <span className="text-amber-300 font-bold">{ord.goldWeight}g</span> | Dia: <span className="text-amber-300 font-bold">{ord.diamondWeight}ct</span>
                                </div>
                                <div className="text-slate-400">{ord.colorTone} | Size: {ord.size || '-'}</div>
                              </td>

                              <td className="p-4 text-xs text-slate-300 max-w-xs truncate">
                                {ord.orderDescription || '-'}
                              </td>

                              <td className="p-4">
                                <span className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold capitalize">
                                  {ord.orderPersonName}
                                </span>
                              </td>

                              <td className="p-4">
                                {isAssigned ? (
                                  <div className="text-xs">
                                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> {ord.karigarName}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">Assigned</span>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setSelectedOrderForKarigar(ord)}
                                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm"
                                  >
                                    Place Order ➔
                                  </button>
                                )}
                              </td>

                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleToggleOnOff(ord.id, isAssigned)}
                                  disabled={!isAssigned}
                                  title={!isAssigned ? "Place order to Karigar to enable" : ""}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-black font-mono flex items-center gap-1 mx-auto transition ${
                                    !isAssigned 
                                      ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60' 
                                      : ord.onOffStatus 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer' 
                                        : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer'
                                  }`}
                                >
                                  {ord.onOffStatus && isAssigned ? (
                                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <ToggleLeft className="w-4 h-4 text-slate-600" />
                                  )}
                                  {ord.onOffStatus && isAssigned ? 'ON' : 'OFF'}
                                </button>
                              </td>

                              <td className="p-4">
                                {isAssigned ? (
                                  <select 
                                    value={ord.productStatus || 'Under Process'}
                                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold outline-none border transition ${
                                      ord.productStatus === 'ready but bill pending' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                                      ord.productStatus === 'packed' ? 'bg-purple-950/80 text-purple-300 border-purple-500/40' :
                                      'bg-slate-900 text-amber-300 border-amber-500/40'
                                    }`}
                                  >
                                    <option value="Under Process">Under Process</option>
                                    <option value="ready but bill pending">Ready but Bill Pending</option>
                                    <option value="packed">Packed</option>
                                  </select>
                                ) : (
                                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 bg-red-950/30 border border-red-800/40 inline-block font-mono">
                                    --Not Assign--
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="text-base font-bold text-amber-400 font-serif">Karigar Dispatch Sheet Logs</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0b0f19] text-amber-300 border-b border-slate-800">
                        <th className="p-3">Tag Number</th>
                        <th className="p-3">Order Sheet</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Jewellery Item</th>
                        <th className="p-3">Assigned Karigar</th>
                        <th className="p-3">Karigar DOD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-sans">
                      {karigarOrders.map((k, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-3 font-mono text-amber-300 font-bold">{k.tagNumber || '-'}</td>
                          <td className="p-3 font-mono text-amber-400 font-bold">{k.orderSheetNumber}</td>
                          <td className="p-3 font-semibold">{k.customerName}</td>
                          <td className="p-3">{k.jewelleryItem}</td>
                          <td className="p-3 font-bold text-emerald-400">{k.karigarName}</td>
                          <td className="p-3 font-mono text-slate-300">{k.karigarDod || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Single Item Sales Intake Modal */}
        {showIntakeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[#111827] border border-amber-500/40 rounded-2xl p-6 max-w-4xl w-full my-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-amber-400 font-serif">New Item Sales Intake</h3>
                  <p className="text-xs text-slate-400">Log an individual item entry directly to Google Sheet</p>
                </div>
                <button onClick={() => setShowIntakeModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Photo Section */}
                <div className="text-center bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-amber-300 block">Product Photo (Saved to Google Drive)</label>
                  {isCapturing ? (
                    <div className="space-y-2">
                      <video ref={videoRef} autoPlay playsInline className="w-full max-w-xs mx-auto h-36 bg-black rounded object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <button type="button" onClick={capturePhoto} className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded text-xs">
                        Snap Photo
                      </button>
                    </div>
                  ) : imagePreview ? (
                    <div className="space-y-1">
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 mx-auto object-cover rounded-xl border-2 border-amber-500" />
                      <button type="button" onClick={() => setImagePreview(null)} className="text-[10px] text-red-400 underline">Remove Photo</button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-3">
                      <button type="button" onClick={startCamera} className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Snap Photo
                      </button>
                      <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-800 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                  )}
                </div>

                {/* Main Item Intake Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Order Sheet Number *</label>
                    <input required type="text" value={formData.orderSheetNumber} onChange={(e) => setFormData({...formData, orderSheetNumber: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-amber-400 font-mono font-bold outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Tag Number *</label>
                    <input required type="text" placeholder="e.g. TAG-101" value={formData.tagNumber} onChange={(e) => setFormData({...formData, tagNumber: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Customer Name *</label>
                    <input required type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Contact Number *</label>
                    <input required type="tel" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Sales Person *</label>
                    <select value={formData.salesPersonName} onChange={(e) => setFormData({...formData, salesPersonName: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 capitalize outline-none focus:border-amber-500">
                      {SALES_PERSONS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Jewellery Item *</label>
                    <input required placeholder="e.g. Gold Ring" type="text" value={formData.jewelleryItem} onChange={(e) => setFormData({...formData, jewelleryItem: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Gold Weight (gms)</label>
                    <input type="text" placeholder="12.5" value={formData.goldWeight} onChange={(e) => setFormData({...formData, goldWeight: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Diamond Weight (cts)</label>
                    <input type="text" placeholder="0.5" value={formData.diamondWeight} onChange={(e) => setFormData({...formData, diamondWeight: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Color Tone</label>
                    <input type="text" placeholder="Yellow Gold" value={formData.colorTone} onChange={(e) => setFormData({...formData, colorTone: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Size</label>
                    <input type="text" placeholder="2.4" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Purity</label>
                    <input type="text" placeholder="22K" value={formData.purity} onChange={(e) => setFormData({...formData, purity: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-amber-300 font-bold outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Order Taken Date</label>
                    <input type="date" value={formData.orderTakenDate} onChange={(e) => setFormData({...formData, orderTakenDate: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Delivery Date (DOD)</label>
                    <input type="date" value={formData.deliveryDate} onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Order Executive *</label>
                    <select value={formData.orderPersonName} onChange={(e) => setFormData({...formData, orderPersonName: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 capitalize outline-none focus:border-amber-500">
                      {ORDERS_PERSONS.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Order Type *</label>
                    <select value={formData.orderType} onChange={(e) => setFormData({...formData, orderType: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-amber-300 uppercase font-bold outline-none">
                      {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Order Description / Design Remarks</label>
                  <textarea rows="2" placeholder="Enter special customization instructions..." value={formData.orderDescription} onChange={(e) => setFormData({...formData, orderDescription: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg">
                  {isSubmitting ? "Saving to Sheet..." : "Save Item to Google Sheet"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Config Modal */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111827] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-amber-400 font-serif">Google Apps Script Link</h3>
                <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <input 
                type="text" 
                placeholder="https://script.google.com/macros/s/.../exec"
                value={googleScriptUrl}
                onChange={(e) => setGoogleScriptUrl(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl p-2.5 text-xs text-amber-200 outline-none font-mono"
              />
              <button onClick={() => { setShowConfigModal(false); fetchOrdersFromSheet(); }} className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">
                Save & Reload Sheet Data
              </button>
            </div>
          </div>
        )}

        {/* Karigar Placement Modal */}
        {selectedOrderForKarigar && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#111827] border border-amber-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-amber-400 font-serif">Place Order to Karigar</h3>
                <button onClick={() => setSelectedOrderForKarigar(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <div className="bg-[#0b0f19] p-3 rounded-lg text-xs space-y-1 font-mono text-slate-300 border border-slate-800">
                <p><span className="text-slate-500">Tag #:</span> {selectedOrderForKarigar.tagNumber || 'PENDING'}</p>
                <p><span className="text-slate-500">Sheet #:</span> {selectedOrderForKarigar.orderSheetNumber}</p>
                <p><span className="text-slate-500">Customer:</span> {selectedOrderForKarigar.customerName}</p>
                <p><span className="text-slate-500">Item:</span> {selectedOrderForKarigar.jewelleryItem}</p>
              </div>

              <form onSubmit={handleAssignKarigar} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Karigar Name *</label>
                  <input required type="text" placeholder="e.g. Craftsman Vijay" value={karigarForm.karigarName} onChange={(e) => setKarigarForm({...karigarForm, karigarName: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Karigar DOD</label>
                  <input type="date" value={karigarForm.karigarDod} onChange={(e) => setKarigarForm({...karigarForm, karigarDod: e.target.value})} className="w-full mt-1 bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500" />
                </div>

                <button type="submit" className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg mt-2">
                  Assign Karigar (Enable Toggle & Set Status 'Under Process')
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}