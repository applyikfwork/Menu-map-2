import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ExternalLink, 
  Train, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Zap, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Utensils
} from 'lucide-react';
import { Restaurant } from '../../types/database';
import { 
  DELHI_LOCATIONS, 
  DELHI_ZONES, 
  DelhiLocation, 
  computeDelhiCoverage 
} from '../../lib/delhiLocationsData';
import { parseDelhiScoutCsv, ingestDelhiScoutData, CsvParseResult } from '../../lib/delhiCsvIngestion';
import { useToast } from '../Toast';

interface DelhiExpansionHubProps {
  restaurants: Restaurant[];
  navigate: (path: string) => void;
  onRefreshRestaurants?: () => Promise<void>;
}

export const DelhiExpansionHub: React.FC<DelhiExpansionHubProps> = ({
  restaurants,
  navigate,
  onRefreshRestaurants,
}) => {
  const { showToast } = useToast();

  // Active view tab in the hub
  const [hubTab, setHubTab] = useState<'matrix' | 'tester' | 'marketing'>('matrix');

  // Filter & Search state
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uncovered' | 'partial' | 'covered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Location for Prompt Preview Modal
  const [previewLocation, setPreviewLocation] = useState<DelhiLocation | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // In-Hub CSV Ingestion Tester State
  const [testCsvText, setTestCsvText] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<CsvParseResult | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // Compute live coverage
  const coverageData = useMemo(() => {
    return computeDelhiCoverage(restaurants);
  }, [restaurants]);

  // Filtered locations list
  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return DELHI_LOCATIONS.filter((loc) => {
      // Zone filter
      if (selectedZone !== 'all' && loc.zoneKey !== selectedZone) {
        return false;
      }

      // Status filter
      const count = coverageData.locationCounts[loc.id] || 0;
      if (statusFilter === 'uncovered' && count > 0) return false;
      if (statusFilter === 'partial' && (count === 0 || count >= 3)) return false;
      if (statusFilter === 'covered' && count < 3) return false;

      // Text search
      if (q) {
        const matchesName = loc.name.toLowerCase().includes(q) || loc.shortName.toLowerCase().includes(q);
        const matchesMetro = loc.metroStation.toLowerCase().includes(q);
        const matchesSpecialty = loc.famousSpecialties.some((s) => s.toLowerCase().includes(q));
        const matchesLandmark = (loc.landmarks || []).some((lm) => lm.toLowerCase().includes(q));
        if (!matchesName && !matchesMetro && !matchesSpecialty && !matchesLandmark) return false;
      }

      return true;
    });
  }, [selectedZone, statusFilter, searchQuery, coverageData]);

  /**
   * Generates the Master Gemini Spark CSV Prompt for a given Delhi locality.
   */
  const generateGeminiPrompt = (loc: DelhiLocation) => {
    return `You are a Delhi NCR food scouting expert helping build "Menu Maps" (menumaps.online).

TARGET LOCALITY:
- Area Name: ${loc.name}
- Zone: ${loc.zone}
- Nearest Metro Station: ${loc.metroStation} (${loc.metroLines.join(', ')})
- Local Food Specialties: ${loc.famousSpecialties.join(', ')}
- Known Landmarks: ${(loc.landmarks || []).join(', ') || 'Main Market'}

TASK:
Scout 3 to 4 REAL, highly-popular, established medium-to-large dine-in or takeaway restaurants/cafes in ${loc.name}.

STRICT RULES:
1. NO generic international fast-food chains (STRICTLY NO McDonald's, Domino's, Pizza Hut, Subway, KFC, Burger King). Only authentic, established local favorites, famous dhabas, celebrated cafes, and popular eateries.
2. For each venue, provide 8 to 12 realistic menu items spanning 3 to 4 categories:
   - Starters / Appetizers / Momos / Chaat
   - Mains / Curries / Thalis / Pizzas / Pastas
   - Breads / Rice
   - Beverages / Cold Coffee / Shakes
   - Desserts / Waffles / Sweets
3. All prices must be genuine Indian Rupee (₹) counter rates (e.g. ₹120 to ₹350 per dish, not inflated delivery app rates).
4. Output STRICTLY in CSV format inside a \`\`\`csv code block with the exact header below. No markdown table, no conversational preamble.

EXACT CSV HEADER & FORMAT:
Restaurant Name,Locality,Zone,Landmark,Nearest Metro,Avg Cost for 2,Cuisine Types,Category Name,Dish Name,Price,Description,Is Veg,Is Must Try

SAMPLE ROWS (Follow this exact syntax):
"Sample Cafe","${loc.shortName}","${loc.zone}","${loc.landmarks?.[0] || 'Main Market'}","${loc.metroStation}",450,"Cafe, Fast Food","Momos & Starters","Kurkure Paneer Momos",169,"Crispy panko crusted dumplings with fiery momo chutney",true,true
"Sample Cafe","${loc.shortName}","${loc.zone}","${loc.landmarks?.[0] || 'Main Market'}","${loc.metroStation}",450,"Cafe, Fast Food","Beverages","Monster Cold Coffee",189,"Thick blended cold coffee topped with vanilla ice cream",true,true

Now generate the complete CSV for 3 to 4 top restaurants in ${loc.name}:`;
  };

  const handleCopyPrompt = (loc: DelhiLocation) => {
    const text = generateGeminiPrompt(loc);
    navigator.clipboard.writeText(text);
    setCopiedPromptId(loc.id);
    showToast(`Copied Gemini Spark prompt for ${loc.shortName}! Paste in Gemini to get CSV.`, 'success');
    setTimeout(() => setCopiedPromptId(null), 3000);
  };

  const handleTestParse = () => {
    if (!testCsvText.trim()) {
      showToast('Please paste CSV text first', 'info');
      return;
    }
    const result = parseDelhiScoutCsv(testCsvText);
    setParsedResult(result);
    if (result.errors.length > 0) {
      showToast(`Parsed with warnings: ${result.errors[0]}`, 'warning');
    } else {
      showToast(`Successfully parsed ${result.totalVenues} venues and ${result.totalDishes} dishes!`, 'success');
    }
  };

  const handleExecuteIngestion = async () => {
    if (!parsedResult || parsedResult.venues.length === 0) {
      showToast('No venues to ingest', 'info');
      return;
    }
    setIsIngesting(true);
    try {
      const res = await ingestDelhiScoutData(parsedResult, (msg) => {
        console.log(msg);
      });
      showToast(`Successfully ingested ${res.restaurantsCount} cafes and ${res.dishesCount} dishes into Menu Maps!`, 'success');
      setTestCsvText('');
      setParsedResult(null);
      if (onRefreshRestaurants) {
        await onRefreshRestaurants();
      }
    } catch (e: any) {
      console.error('Ingestion failed:', e);
      showToast(`Ingestion error: ${e.message}`, 'error');
    } finally {
      setIsIngesting(false);
    }
  };

  const stats = coverageData.stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. HEADER & COVERAGE METRICS BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-stone-900 via-neutral-900 to-[#1C1917] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(255,90,54,0.35),transparent_70%)] pointer-events-none"
        />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-black uppercase tracking-wider text-amber-300">
            <Compass className="w-3.5 h-3.5" />
            <span>Full Delhi Expansion Mission Control</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            Delhi Coverage Matrix &amp; Gemini Scout Hub
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
            Track all 64 Delhi localities across 9 zones. Copy precision CSV prompts for Gemini Spark with 1 click, hand the CSV over to Antigravity, and see the restaurants go live with zero image mismatches.
          </p>

          {/* PROGRESS METRICS BAR */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">Delhi Localities</div>
              <div className="text-2xl font-black text-white mt-0.5">{stats.totalLocations}</div>
              <div className="text-[10px] text-stone-400">All 11 Districts covered</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/30">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Covered (3+ Cafes)</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{stats.coveredCount}</div>
              <div className="text-[10px] text-emerald-200/80">Active dining hubs</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-amber-500/30">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Partially (1-2 Cafes)</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">{stats.partialCount}</div>
              <div className="text-[10px] text-amber-200/80">Needs 1-2 more spots</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-rose-500/30">
              <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Left / Uncovered</div>
              <div className="text-2xl font-black text-rose-400 mt-0.5">{stats.uncoveredCount}</div>
              <div className="text-[10px] text-rose-200/80">Ready to scout now</div>
            </div>
          </div>

          {/* Visual Percentage Line */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-300 mb-1">
              <span>Overall Delhi NCR Coverage</span>
              <span className="text-[#FF8A6B]">{stats.coveragePercentage}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-[#FF5A36] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(5, stats.coveragePercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB CONTROLS (MATRIX / CSV TESTER / MARKETING PLAYBOOK) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setHubTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              hubTab === 'matrix'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Coverage Matrix ({stats.totalLocations})</span>
          </button>

          <button
            type="button"
            onClick={() => setHubTab('tester')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              hubTab === 'tester'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV Assistant &amp; Ingestion</span>
          </button>

          <button
            type="button"
            onClick={() => setHubTab('marketing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              hubTab === 'marketing'
                ? 'bg-[#D8350F] text-white shadow-xs'
                : 'bg-white text-[#D8350F] border border-orange-200 hover:bg-orange-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>360° Delhi Marketing Playbook</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs font-bold text-stone-500">
          <span>Target: 3–5 cafes per locality</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COVERAGE MATRIX & GEMINI PROMPT GENERATOR */}
      {/* ========================================================================= */}
      {hubTab === 'matrix' && (
        <div className="space-y-6">
          {/* FILTER CONTROLS */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any locality, metro station, or specialty (e.g. Rohini, Momos, Yellow Line)..."
                className="w-full pl-9 pr-14 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:border-[#FF5A36] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">Status:</span>
              {[
                { id: 'all', label: `All Areas (${stats.totalLocations})` },
                { id: 'uncovered', label: `🔴 Left / Uncovered (${stats.uncoveredCount})` },
                { id: 'partial', label: `🟡 Partial (${stats.partialCount})` },
                { id: 'covered', label: `🟢 Covered (${stats.coveredCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#1C1917] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Zone Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1 shrink-0">Zone:</span>
              {DELHI_ZONES.map((zone) => (
                <button
                  key={zone.key}
                  type="button"
                  onClick={() => setSelectedZone(zone.key)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedZone === zone.key
                      ? 'bg-[#D8350F] text-white font-bold shadow-2xs'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>{zone.icon}</span>
                  <span className="ml-1">{zone.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LOCALITIES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocations.map((loc) => {
              const count = coverageData.locationCounts[loc.id] || 0;
              const isCovered = count >= 3;
              const isPartial = count > 0 && count < 3;
              const isLeft = count === 0;

              return (
                <div
                  key={loc.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isLeft ? 'border-rose-200/80 bg-rose-50/20' : isPartial ? 'border-amber-200/80' : 'border-stone-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Zone & Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                        {loc.zone}
                      </span>

                      {isLeft && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                          🔴 Left / 0 Cafes
                        </span>
                      )}
                      {isPartial && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          🟡 {count} Cafe{count > 1 ? 's' : ''} Live
                        </span>
                      )}
                      {isCovered && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🟢 {count} Cafes (Covered)
                        </span>
                      )}
                    </div>

                    {/* Name & Tagline */}
                    <div>
                      <h3 className="font-heading font-black text-base sm:text-lg text-[#1C1917] leading-tight">
                        {loc.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {loc.tagline}
                      </p>
                    </div>

                    {/* Metro Details */}
                    <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 text-xs text-[#0F766E] font-bold">
                      <Train className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{loc.metroStation}</span>
                    </div>

                    {/* Food Specialties */}
                    <div className="flex flex-wrap gap-1">
                      {loc.famousSpecialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewLocation(loc)}
                      className="text-xs font-bold text-stone-500 hover:text-stone-800 underline p-1 cursor-pointer"
                    >
                      View Prompt
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(loc)}
                      className={`btn text-xs font-bold px-3.5 py-2 min-h-[36px] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs ${
                        copiedPromptId === loc.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1C1917] hover:bg-[#D8350F] text-white'
                      }`}
                    >
                      {copiedPromptId === loc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-6 space-y-3">
              <p className="text-sm font-bold text-stone-700">No Delhi localities match your current filters.</p>
              <button
                type="button"
                onClick={() => { setSelectedZone('all'); setStatusFilter('all'); setSearchQuery(''); }}
                className="btn bg-[#D8350F] text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IN-HUB CSV ASSISTANT & TESTER */}
      {/* ========================================================================= */}
      {hubTab === 'tester' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1C1917]">
                  CSV Ingestion Assistant
                </h3>
                <p className="text-xs text-stone-500">
                  Inspect the CSV output generated by Gemini Spark or test ingestion directly into the live site.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Zero-Mismatch Image Engine Active
              </span>
            </div>

            <textarea
              rows={8}
              value={testCsvText}
              onChange={(e) => setTestCsvText(e.target.value)}
              placeholder='Paste Gemini CSV response here (e.g. "Restaurant Name,Locality,Zone,Landmark...")...'
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#FF5A36] focus:bg-white transition-all"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => { setTestCsvText(''); setParsedResult(null); }}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 p-2 cursor-pointer"
              >
                Clear Box
              </button>

              <button
                type="button"
                onClick={handleTestParse}
                className="btn bg-[#1C1917] hover:bg-[#D8350F] text-white text-xs font-bold px-5 py-2.5 min-h-[40px] rounded-xl cursor-pointer"
              >
                Parse &amp; Preview CSV
              </button>
            </div>
          </div>

          {/* PARSED STAGING TABLE */}
          {parsedResult && parsedResult.venues.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-base text-[#1C1917]">
                    Staging Preview: {parsedResult.totalVenues} Cafes, {parsedResult.totalDishes} Dishes
                  </h4>
                  <p className="text-xs text-stone-500">
                    Smart images will be mapped automatically with identical dishes receiving identical CDN-cached photos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteIngestion}
                  disabled={isIngesting}
                  className="btn bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white text-xs font-bold px-6 py-2.5 min-h-[42px] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isIngesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Venues to Live Database</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {parsedResult.venues.map((venue, idx) => (
                  <div key={idx} className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-heading font-black text-sm text-[#1C1917]">
                          {venue.name} ({venue.locality})
                        </h5>
                        <div className="text-xs text-stone-500">
                          {venue.landmark} · Metro: {venue.nearestMetro} · ₹{venue.avgCostForTwo} for two
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-600">
                        {venue.categories.reduce((acc, c) => acc + c.dishes.length, 0)} Dishes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {venue.categories.flatMap((cat) => cat.dishes).slice(0, 6).map((dish, dIdx) => (
                        <div key={dIdx} className="bg-white rounded-xl p-2.5 border border-stone-200 flex justify-between items-center text-xs">
                          <span className="font-medium truncate mr-2">{dish.name}</span>
                          <span className="font-extrabold text-[#D8350F] shrink-0">₹{dish.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 360° DELHI MARKETING PLAYBOOK */}
      {/* ========================================================================= */}
      {hubTab === 'marketing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strategy 1: DU College Campus Engine */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#D8350F] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                1. DU College Campus Takeover
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Target 150,000+ students across DU North Campus (Hudson Lane &amp; Kamla Nagar) and South Campus (Satya Niketan). Students eat out 4–5x weekly on tight budgets (₹150–₹300).
              </p>
              <div className="pt-2 text-xs text-stone-700 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Distribute pocket 3-Stop Food Crawl cards in college canteens.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sticker QR codes on PG hostel message boards.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Campus Ambassador referral credits.</span>
                </div>
              </div>
            </div>

            {/* Strategy 2: Metro Exit Gate Commuter Funnel */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <Train className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                2. Metro Exit Gate QR Signage
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Delhi Metro carries 5.5 Million daily passengers. Place high-visibility physical QR signage outside busy food exit gates:
              </p>
              <div className="pt-2 text-xs text-stone-700 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span><strong>GTB Nagar Gate 3:</strong> "Exiting metro? View menus of 18 Hudson Lane cafes before walking in."</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span><strong>Rajiv Chowk Gate 6:</strong> "Complete CP Inner Circle cafe menus with counter prices."</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span><strong>NSP Gate 1:</strong> "All 30 Netaji Subhash Place food stalls in one tap."</span>
                </div>
              </div>
            </div>

            {/* Strategy 3: WhatsApp Viral Food Crawls */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                3. WhatsApp 1-Tap Food Crawl Sharing
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Over 80% of dining outings in Delhi are planned inside WhatsApp friend groups ("Kahan chalein aaj shaam?").
              </p>
              <div className="pt-2 text-xs text-stone-700 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1-Tap "Share Crawl with Friends" creates ready-to-send itinerary.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Includes estimated budget for 2 or 4 people.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Direct walking route link in Google Maps.</span>
                </div>
              </div>
            </div>

            {/* Strategy 4: Zero-Commission Cafe Owner Flywheel */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-base text-[#1C1917]">
                4. Cafe Owner Zero-Commission Flywheel
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Delhi cafe owners resent losing 25%–35% of every order to Zomato &amp; Swiggy.
              </p>
              <div className="pt-2 text-xs text-stone-700 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Provide free counter display stands: "Our verified menu is on Menu Maps."</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Direct WhatsApp table booking &amp; takeaway orders with 0% commission.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Cafes promote Menu Maps to their own walk-in customers!</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PROMPT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewLocation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-lg text-[#1C1917]">
                  Gemini Spark Prompt: {previewLocation.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Copy and paste into Gemini Spark to receive the exact standardized CSV.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLocation(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <pre className="flex-1 overflow-y-auto p-4 bg-stone-900 text-stone-200 text-[11px] rounded-2xl font-mono leading-relaxed whitespace-pre-wrap select-all border border-stone-800">
              {generateGeminiPrompt(previewLocation)}
            </pre>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewLocation(null)}
                className="btn bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-4 py-2 min-h-[38px] rounded-xl cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCopyPrompt(previewLocation);
                  setPreviewLocation(null);
                }}
                className="btn bg-[#D8350F] hover:bg-rose-600 text-white text-xs font-bold px-5 py-2 min-h-[38px] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Master Prompt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
