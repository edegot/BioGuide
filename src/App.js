import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, MapPin, Camera, Download, Upload, Settings, List, X, Leaf,
  Database, Save, Loader, ExternalLink, Trash2, AlertTriangle, PieChart,
  Filter, Globe, Trophy, Plus, Edit2, ChevronDown, Sparkles, CheckCircle,
  Lock, ArrowLeft, Layers, Info, Languages, LayoutGrid, Menu, RefreshCw,
} from "lucide-react";

// Data imports
import { TRANSLATIONS } from "./data/translations";
import {
  COUNTRIES, INAT_LANGUAGES, FEATURED_QUERIES,
  GLOBAL_SPECIES_ESTIMATES, TROPHIES_DATA, INAT_API_BASE,
  IUCN_TOKEN_KEY, COLLECTION_STORAGE_KEY, LOCALE_STORAGE_KEY,
} from "./data/config";

// Utility imports
import {
  getGenus, formatCommonName, parseAncestry,
  searchRemoteTaxa, fetchTaxonDetails, fetchTaxonChildrenCount,
  fetchIUCNStatus, getIucnToken, saveIucnToken as saveIucnTokenLocal,
  clearIucnCache,
} from "./utils/api";
import {
  loadCollection, saveCollection, loadLocale,
  generateCSV, parseCSV, downloadFile, mergeCollections,
} from "./utils/storage";
import {
  calculateStats, calculateAchievements, getGroupCompletion,
} from "./utils/gamification";

// Component imports
import { Toast, Modal, LoadingSpinner, EmptyState, Badge, Button, Card } from "./components/UI";

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const TaxonCard = ({ taxon, onObserve, inCollection, featured = false, t, iucnToken }) => {
  return (
    <div className={`taxon-tile bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative group transition-all h-full ${featured ? "featured ring-4 ring-emerald-500/20 shadow-lg" : "hover:shadow-md"}`}>
      <div className="bg-slate-100 relative overflow-hidden">
        {taxon.image ? (
          <div className={featured ? "w-full h-56 md:h-64" : "w-full h-48 md:h-56"}>
            <img src={taxon.image} alt={taxon.common_name || taxon.scientific_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          </div>
        ) : (
          <div className={featured ? "w-full h-56 md:h-64 flex items-center justify-center bg-slate-50" : "w-full h-48 md:h-56 flex items-center justify-center bg-slate-50"}>
            <Leaf className="w-14 h-14 opacity-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
          <div className="text-white">
            <h3 className={`font-extrabold drop-shadow line-clamp-2 ${featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}>
              {formatCommonName(taxon.common_name || taxon.scientific_name)}
            </h3>
            <p className="text-[12px] text-slate-200 italic mt-1 line-clamp-2">{taxon.scientific_name}</p>
          </div>
        </div>

        <div className="absolute top-3 left-3">
          <div className="bg-white/90 text-xs text-slate-800 px-3 py-1 rounded-full font-bold">{taxon.iconic || "Species"}</div>
        </div>

        <div className="absolute top-3 right-3">
          <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-2">
            <span>{(taxon.observations || taxon.observations_count || 0).toLocaleString()}</span>
            <span className="text-[11px] opacity-80">obs</span>
          </div>
        </div>
        {featured && (
          <div className="absolute top-12 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" /> {t.discover}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="space-y-2">
          {taxon.genus && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold">Genus:</span> {taxon.genus}
            </div>
          )}
          {taxon.family && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold">Family:</span> {taxon.family}
            </div>
          )}
          {taxon.order && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold">Order:</span> {taxon.order}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="text-sm text-slate-600">{taxon.iconic && `${taxon.iconic}`}</div>
          {inCollection && (
            <div className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t.added}
            </div>
          )}
        </div>

        <button
          onClick={() => onObserve(taxon)}
          disabled={inCollection}
          className={`w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 text-sm ${
            inCollection
              ? "bg-slate-100 text-slate-600 cursor-default"
              : featured
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          <Camera className="w-4 h-4" /> 
          {inCollection ? t.added : featured ? t.addCollection : t?.observe || "Observe"}
        </button>
      </div>
    </div>
  );
};

const CollectionItem = ({ item, onRequestDelete, onEdit, iucnToken, t, locale }) => {
  const [showCountries, setShowCountries] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDate = item.dateObserved ? new Date(item.dateObserved).toLocaleDateString(locale || "en-US") : null;

  // Compact view - photo, name, scientific name, and group
  const CompactView = () => (
    <div className="flex flex-col items-start gap-3 h-full justify-between cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-lg transition-colors" onClick={() => setIsExpanded(true)}>
      <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative">
        {item.image ? (
          <img src={item.image} alt={item.commonName || item.scientificName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Leaf className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 w-full">
        <h4 className="font-bold text-slate-800 text-base line-clamp-2 leading-snug">
          {formatCommonName(item.commonName)}
        </h4>
        <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">{item.scientificName}</p>
      </div>
      {item.iconicGroup && (
        <span className="uppercase font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs tracking-wide">
          {item.iconicGroup}
        </span>
      )}
      <button 
        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors w-full text-center"
        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
      >
        {t?.viewDetails || "View Details"}
      </button>
    </div>
  );

  // Expanded view - full details
  const ExpandedView = () => (
    <div className="cursor-pointer" onClick={() => setIsExpanded(false)}>
      <div className="flex items-start gap-4">
        <div className="w-28 h-24 md:w-32 md:h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative">
          {item.image ? (
            <img src={item.image} alt={item.commonName || item.scientificName} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Leaf className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="pr-16">
            <h4 className="font-bold text-slate-800 text-base sm:text-lg line-clamp-2 leading-snug">
              {formatCommonName(item.commonName)}
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 italic mt-0.5 line-clamp-1">{item.scientificName}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
            {item.iconicGroup && (
              <span className="uppercase font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded tracking-wide">{item.iconicGroup}</span>
            )}
            {item.genus && <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Genus: <strong className="text-slate-700">{item.genus}</strong></span>}
            {item.family && <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Family: <strong className="text-slate-700">{item.family}</strong></span>}
            {item.order && <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">Order: <strong className="text-slate-700">{item.order}</strong></span>}

            {item.countries && item.countries.length > 0 && (
              <div className="relative" onMouseEnter={() => setShowCountries(true)} onMouseLeave={() => setShowCountries(false)} onClick={(e) => { e.stopPropagation(); setShowCountries(!showCountries); }}>
                <button className="text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded flex items-center gap-2 cursor-pointer hover:bg-indigo-100 transition-colors">
                  <Globe className="w-4 h-4" /> {item.countries.length} {t?.locations || "locations"}
                </button>
                {showCountries && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t?.locations || "Locations"}</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{item.countries.length}</span>
                    </div>
                    <ul className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1 text-sm">
                      {item.countries.map((c) => (
                        <li key={c} className="flex items-center gap-2 text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> <span className="truncate">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {item.note && (
            <p className="text-sm text-slate-600 mt-3 rounded-md bg-slate-50 p-3 border border-slate-100">{item.note}</p>
          )}

          <div className="mt-3 text-xs text-slate-500 flex items-center gap-3">
            {formattedDate && <span>Observed: <strong className="text-slate-700">{formattedDate}</strong></span>}
            {item.dateObserved && <span className="mx-1">•</span>}
            {item.source && <span className="italic">{item.source}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative h-full group hover:z-30">
      <div className="absolute top-3 right-3 flex gap-1 z-10 bg-white/80 backdrop-blur-sm rounded-lg pl-1">
        <a
          href={item.taxonId ? `https://www.inaturalist.org/taxa/${item.taxonId}` : "#"}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg transition-colors"
          title={t?.viewOnInat || "View on iNaturalist"}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors" title={t?.edit || "Edit"}>
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRequestDelete(item); }} className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors" title={t?.remove || "Remove"}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isExpanded ? <ExpandedView /> : <CompactView />}
    </div>
  );
};

const CountryTag = ({ name, onRemove }) => (
  <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap">
    <MapPin className="w-3 h-3" /> {name}
    <button onClick={() => onRemove(name)} className="text-indigo-400 hover:text-indigo-600 ml-1">
      <X className="w-3 h-3" />
    </button>
  </div>
);

const CompletedGeneraView = ({ completedList, t }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const availableGroups = useMemo(() => {
    const groups = new Set(completedList.map((data) => data.species[0]?.iconicGroup).filter(Boolean));
    return Array.from(groups).sort();
  }, [completedList]);

  const filteredList = useMemo(() => {
    if (activeFilter === "All") return completedList;
    return completedList.filter((data) => data.species[0]?.iconicGroup === activeFilter);
  }, [completedList, activeFilter]);

  if (completedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64 opacity-60 animate-in fade-in">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-700 text-lg">No Completed Genera Yet</h3>
        <p className="text-sm text-slate-500 max-w-xs mt-2">Collect every species within a specific genus to unlock a trophy here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="bg-white p-3 rounded-full text-yellow-600 shadow-sm">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-yellow-800 text-lg">Trophy Room</h3>
          <p className="text-xs text-yellow-700">You have completed <strong>{completedList.length}</strong> full genera!</p>
        </div>
      </div>
      {availableGroups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === "All"
                ? "bg-yellow-600 text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200 hover:border-yellow-300"
            }`}
          >
            All
          </button>
          {availableGroups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveFilter(group)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === group
                  ? "bg-yellow-600 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-yellow-300"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
        {filteredList.map((data) => {
          const coverImage = data.species.find((s) => s.image)?.image;
          return (
            <div key={data.genus} className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-default">
              {coverImage ? (
                <img src={coverImage} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0" alt={data.genus} />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-0">
                  <Leaf className="w-12 h-12 text-slate-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 z-0 pointer-events-none" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                <div className="self-end">
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                    {data.count}/{data.total}
                  </span>
                </div>
                <div className="transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-1 text-yellow-400 mb-1">
                    <Sparkles className="w-3 h-3 fill-yellow-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Completed</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white italic tracking-tight leading-none drop-shadow-md break-words">
                    {data.genus}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AchievementsView = ({ collection, t }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-yellow-800 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6" /> Achievements
        </h2>
        <p className="text-sm text-yellow-700 mt-1">Unlock badges by exploring nature!</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TROPHIES_DATA.map((badge) => {
          const uniqueCountries = new Set(collection.flatMap((o) => o.countries || [])).size;
          let current = 0, total = badge.threshold || badge.countryThreshold, unlocked = false;
          
          if (badge.countryThreshold) {
            current = uniqueCountries;
            unlocked = current >= total;
          } else if (badge.family) {
            current = collection.filter((o) => o.iconicGroup === badge.family || o.family === badge.family || o.order === badge.family).length;
            unlocked = current >= total;
          } else {
            current = collection.length;
            unlocked = current >= total;
          }
          
          const progress = Math.min(100, (current / total) * 100);
          return (
            <div key={badge.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all relative overflow-hidden ${unlocked ? "bg-white border-yellow-400 shadow-lg" : "bg-slate-50 border-slate-200 opacity-60 grayscale"}`}>
              <div className="text-4xl mb-2 filter drop-shadow-sm">{badge.icon}</div>
              <h3 className="font-bold text-slate-800 text-sm">{badge.title}</h3>
              <p className="text-[10px] text-slate-500 mb-3">{badge.desc}</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-auto">
                <div className={`h-full transition-all duration-1000 ${unlocked ? "bg-yellow-400" : "bg-slate-400"}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-1">{current} / {total}</div>
              {unlocked && <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-yellow-400 blur-xl opacity-50"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function SpeciesApp() {
  const [activeTab, setActiveTab] = useState("explore");
  const [statsSubTab, setStatsSubTab] = useState("breakdown");
  const [searchQuery, setSearchQuery] = useState("");
  const [userCollection, setUserCollection] = useState(() => loadCollection());
  const [listFilter, setListFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [locale, setLocaleState] = useState(() => loadLocale());

  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [featuredTaxon, setFeaturedTaxon] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const translateCollectionRef = useRef(null);

  const [modalMode, setModalMode] = useState("add");
  const [selectedTaxon, setSelectedTaxon] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [observationNote, setObservationNote] = useState("");
  const [observationCountries, setObservationCountries] = useState([]);
  const [countryInput, setCountryInput] = useState("");
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deleteCodeInput, setDeleteCodeInput] = useState("");
  const [importStatus, setImportStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null);
  const [iucnToken, setIucnToken] = useState(() => localStorage.getItem(IUCN_TOKEN_KEY) || "");

  const DELETE_CONFIRMATION_CODE = "DELETE";
  const t = useMemo(() => TRANSLATIONS[locale] || TRANSLATIONS["en"], [locale]);
  const stats = useMemo(() => calculateStats(userCollection), [userCollection]);

  // Save data when collection or locale changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveCollection(userCollection);
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }, 500);
    return () => clearTimeout(saveTimer);
  }, [userCollection, locale]);

  // Load featured species
  useEffect(() => {
    const loadFeatured = async () => {
      const query = FEATURED_QUERIES[Math.floor(Math.random() * FEATURED_QUERIES.length)];
      try {
        const results = await searchRemoteTaxa(query, locale);
        if (results.length > 0) setFeaturedTaxon(results[0]);
      } catch (e) {
        console.error("Failed to load featured", e);
      }
    };
    loadFeatured();
  }, [locale]);

  // Translate collection
  useEffect(() => {
    if (!userCollection?.length || translateCollectionRef.current === locale) return;
    let cancelled = false;

    const translateCollection = async () => {
      setIsTranslating(true);
      try {
        const ids = userCollection.map((i) => i.taxonId);
        const uniqueIds = [...new Set(ids)];
        const chunkSize = 30;
        const newNamesMap = {};
        
        for (let i = 0; i < uniqueIds.length; i += chunkSize) {
          if (cancelled) break;
          const chunk = uniqueIds.slice(i, i + chunkSize);
          const response = await fetch(`${INAT_API_BASE}/taxa/${chunk.join(",")}?locale=${locale}`);
          const data = await response.json();
          if (data.results) {
            data.results.forEach((taxon) => {
              newNamesMap[taxon.id] = taxon.preferred_common_name || taxon.name;
            });
          }
        }
        
        if (!cancelled) {
          setUserCollection((prev) =>
            prev.map((item) => ({
              ...item,
              commonName: newNamesMap[item.taxonId] || item.commonName,
            }))
          );
          translateCollectionRef.current = locale;
        }
      } catch (err) {
        console.error("Translation failed", err);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    };

    translateCollection();
    return () => { cancelled = true; };
  }, [locale, userCollection]);

  // Search handling
  useEffect(() => {
    if (searchQuery.length < 2) {
      setApiResults([]);
      return;
    }
    const controller = new AbortController();
    const timerId = setTimeout(async () => {
      setIsSearching(true);
      setApiError(null);
      try {
        const results = await searchRemoteTaxa(searchQuery, locale, controller.signal);
        setApiResults(results);
      } catch (err) {
        setApiError("Could not connect to iNaturalist.");
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => { clearTimeout(timerId); controller.abort(); };
  }, [searchQuery, locale]);

  // Country suggestions
  useEffect(() => {
    if (countryInput.length > 0) {
      const matches = COUNTRIES.filter(
        (c) => c.toLowerCase().startsWith(countryInput.toLowerCase()) && !observationCountries.includes(c)
      ).slice(0, 5);
      setCountrySuggestions(matches);
    } else {
      setCountrySuggestions([]);
    }
  }, [countryInput, observationCountries]);

  // Toast timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const setLocale = (newLocale) => {
    setLocaleState(newLocale);
  };

  const saveIucnToken = () => {
    saveIucnTokenLocal(iucnToken);
    clearIucnCache();
    setToastMessage("IUCN token saved");
  };

  const clearIucnTokenLocal = () => {
    saveIucnTokenLocal("");
    clearIucnCache();
    setIucnToken("");
    setToastMessage("IUCN token cleared");
  };

  const openAddModal = async (taxon) => {
    setModalMode("add");
    setSelectedTaxon(taxon);
    setIsLoadingDetails(true);
    try {
      const detailedTaxon = await fetchTaxonDetails(taxon.id, locale);
      let ancestryData = {};
      let genusId = null;
      let familyId = null;
      let commonName = taxon.common_name;
      
      if (detailedTaxon) {
        const deep = parseAncestry(detailedTaxon);
        ancestryData = { order: deep.order, family: deep.family, genus: deep.genus };
        genusId = deep.genusId;
        familyId = deep.familyId;
        if (detailedTaxon.preferred_common_name) commonName = detailedTaxon.preferred_common_name;
      } else {
        const shallow = parseAncestry(taxon);
        ancestryData = { order: shallow.order, family: shallow.family, genus: shallow.genus };
        genusId = shallow.genusId;
        familyId = shallow.familyId;
      }
      
      const [realGenusTotal, realFamilyTotal] = await Promise.all([
        fetchTaxonChildrenCount(genusId, ancestryData.genus, "genus"),
        fetchTaxonChildrenCount(familyId, ancestryData.family, "family"),
      ]);
      
      setSelectedTaxon((prev) => ({
        ...prev,
        ...ancestryData,
        common_name: commonName,
        genusTotal: realGenusTotal || 5,
        familyTotal: realFamilyTotal,
      }));
    } catch (err) {
      console.warn("Details error", err);
    } finally {
      setIsLoadingDetails(false);
    }
    
    setObservationNote("");
    setObservationCountries([]);
    setCountryInput("");
    setCountrySuggestions([]);
  };

  const openEditModal = async (item) => {
    setModalMode("edit");
    setSelectedTaxon(item);
    setObservationNote(item.note || "");
    setObservationCountries(item.countries || []);
    setCountryInput("");
    setCountrySuggestions([]);
    
    if (!item.genusTotal || item.genusTotal === 5 || !item.familyTotal) {
      setIsLoadingDetails(true);
      try {
        const { genusId, familyId } = parseAncestry(item);
        let gId = genusId, fId = familyId;
        
        if (!gId || !fId) {
          const details = await fetchTaxonDetails(item.taxonId, locale);
          if (details) {
            const deep = parseAncestry(details);
            gId = deep.genusId;
            fId = deep.familyId;
          }
        }
        
        const [gCount, fCount] = await Promise.all([
          fetchTaxonChildrenCount(gId, item.genus, "genus"),
          fetchTaxonChildrenCount(fId, item.family, "family"),
        ]);
        
        setSelectedTaxon((prev) => ({
          ...prev,
          genusTotal: gCount || prev.genusTotal,
          familyTotal: fCount || prev.familyTotal,
        }));
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const addCountry = (name) => {
    const c = name || countryInput.trim();
    if (c && !observationCountries.includes(c)) {
      setObservationCountries([...observationCountries, c]);
      setCountryInput("");
      setCountrySuggestions([]);
    }
  };

  const removeCountry = (name) => setObservationCountries(observationCountries.filter((c) => c !== name));

  const saveObservation = () => {
    if (!selectedTaxon) return;
    const baseData = {
      note: observationNote,
      countries: observationCountries,
      genusTotal: selectedTaxon.genusTotal,
      familyTotal: selectedTaxon.familyTotal,
    };
    
    if (modalMode === "add") {
      const newObs = {
        uuid: crypto.randomUUID(),
        taxonId: selectedTaxon.id,
        scientificName: selectedTaxon.scientific_name,
        commonName: selectedTaxon.common_name,
        iconicGroup: selectedTaxon.iconic,
        genus: selectedTaxon.genus || getGenus(selectedTaxon.scientific_name),
        order: selectedTaxon.order || "Unknown",
        family: selectedTaxon.family || "Unknown",
        image: selectedTaxon.image,
        dateObserved: new Date().toISOString(),
        ...baseData,
      };
      setUserCollection((prev) => [newObs, ...prev]);
      setToastMessage(`${t.added} ${formatCommonName(selectedTaxon.common_name)}`);
    } else {
      setUserCollection((prev) =>
        prev.map((item) =>
          item.uuid === selectedTaxon.uuid ? { ...item, ...baseData } : item
        )
      );
      setToastMessage(`${t.updated} ${formatCommonName(selectedTaxon.commonName)}`);
    }
    
    setSelectedTaxon(null);
  };

  const handleDeleteRequest = (item) => setItemToDelete(item);
  const executeDelete = () => {
    if (itemToDelete) {
      setUserCollection((prev) => prev.filter((item) => item.uuid !== itemToDelete.uuid));
      setItemToDelete(null);
    }
  };

  const openClearAllModal = () => {
    setDeleteCodeInput("");
    setIsClearingAll(true);
  };

  const executeClearAll = () => {
    if (deleteCodeInput === DELETE_CONFIRMATION_CODE) {
      setUserCollection([]);
      setIsClearingAll(false);
      setToastMessage("All data cleared successfully");
    }
  };

  const handleExport = () => {
    const csv = generateCSV(userCollection);
    downloadFile(csv, "bioguide_backup.csv", "text/csv");
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const items = parseCSV(e.target.result);
        const merged = mergeCollections(userCollection, items);
        setUserCollection(merged);
        setImportStatus("success");
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        console.error("Import error:", err);
        setImportStatus("error");
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 w-full overflow-hidden">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} type={toastType} />
      )}

      {/* SIDEBAR - Desktop Only */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 shadow-xl">
        <div className="p-6">
          <h1 className="font-bold flex items-center gap-3 text-2xl tracking-tight">
            <Leaf className="w-8 h-8 text-emerald-400" /> BioGuide
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: "explore", icon: Search, label: t.explore },
            { id: "collection", icon: List, label: t.myList, badge: userCollection.length },
            { id: "stats", icon: PieChart, label: t.stats },
            { id: "settings", icon: Settings, label: t.settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === item.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800">
          <div className="flex items-center justify-center gap-1 opacity-70">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Saved locally
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white shrink-0 p-4 shadow-md z-10 flex justify-between items-center">
          <h1 className="font-bold flex items-center gap-2 text-lg">
            <Leaf className="w-5 h-5 text-emerald-400" /> BioGuide
          </h1>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Saved
          </div>
        </header>

        {/* Search Bar */}
        {activeTab === "explore" && (
          <div className="bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm z-10 sticky top-0">
            <div className="max-w-3xl mx-auto relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm text-lg"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="max-w-7xl mx-auto">
            {activeTab === "explore" && (
              <div className="space-y-6">
                {apiError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {apiError}
                  </div>
                )}
                {searchQuery.length < 2 ? (
                  <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
                    {featuredTaxon ? (
                      <div className="space-y-6">
                        <TaxonCard
                          taxon={featuredTaxon}
                          onObserve={openAddModal}
                          inCollection={userCollection.some((u) => u.taxonId === featuredTaxon.id)}
                          featured={true}
                          t={t}
                          iucnToken={iucnToken}
                        />
                        <div className="text-center text-slate-400 text-sm">{t.startTyping}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center mt-20 opacity-50">
                        <Search className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">{t.discover}</h3>
                        <p className="text-slate-400 mt-2">{t.loadingFeatured}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        {apiResults.length} {t.results}
                      </span>
                      <a
                        href="https://www.inaturalist.org"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 flex items-center gap-1 hover:underline"
                      >
                        iNaturalist <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                      {apiResults.map((taxon) => (
                        <TaxonCard
                          key={taxon.id}
                          taxon={taxon}
                          onObserve={openAddModal}
                          inCollection={userCollection.some((u) => u.taxonId === taxon.id)}
                          t={t}
                          iucnToken={iucnToken}
                        />
                      ))}
                    </div>
                    {apiResults.length === 0 && !isSearching && (
                      <div className="text-center py-20 text-slate-400">{t.noResults}</div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "collection" && (
              <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
                <div className="p-4 md:p-6 pb-2 border-b border-slate-200 shrink-0 bg-white z-10 sticky top-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      {t.myObservations}
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {userCollection.length}
                      </span>
                    </h2>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative min-w-[140px]">
                        <select
                          value={countryFilter}
                          onChange={(e) => setCountryFilter(e.target.value)}
                          className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <option value="All">All Countries</option>
                          {[...new Set(userCollection.flatMap((i) => i.countries || []))].sort().map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t.searchList}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-3 pl-10 pr-10 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {(() => {
                  const observationsForGroup =
                    listFilter === "All"
                      ? userCollection
                      : userCollection.filter((obs) => obs.iconicGroup === listFilter);
                  const observationsForCountry =
                    countryFilter === "All"
                      ? observationsForGroup
                      : observationsForGroup.filter((obs) =>
                          (obs.countries || []).includes(countryFilter)
                        );
                  const lowerCaseSearch = searchTerm.toLowerCase();
                  const filteredObservations = observationsForCountry
                    .filter((obs) => {
                      if (!searchTerm) return true;
                      return (
                        (obs.commonName && obs.commonName.toLowerCase().includes(lowerCaseSearch)) ||
                        (obs.scientificName && obs.scientificName.toLowerCase().includes(lowerCaseSearch)) ||
                        (obs.family && obs.family.toLowerCase().includes(lowerCaseSearch))
                      );
                    })
                    .sort((a, b) => (a.commonName || "").localeCompare(b.commonName || ""));

                  return (
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                      {filteredObservations.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20 md:pb-0">
                          {filteredObservations.map((obs) => (
                            <CollectionItem
                              key={obs.uuid}
                              item={obs}
                              onEdit={() => openEditModal(obs)}
                              onRequestDelete={() => handleDeleteRequest(obs)}
                              iucnToken={iucnToken}
                              t={t}
                              locale={locale}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center mt-20 opacity-60">
                          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="font-bold text-slate-700 text-lg">
                            {searchTerm ? t.noMatch : t.emptyList}
                          </h3>
                          <p className="text-sm text-slate-500 max-w-xs mt-2">
                            {searchTerm
                              ? "Try adjusting your search terms or filters."
                              : `No observations found for ${
                                  countryFilter !== "All" ? countryFilter : listFilter
                                }.`}
                          </p>
                          {!searchTerm && listFilter === "All" && countryFilter === "All" && (
                            <button
                              onClick={() => setActiveTab("explore")}
                              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                            >
                              {t.findSpecies}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto">
                <div className="flex p-1 bg-slate-200 rounded-xl mb-4 shrink-0 w-full md:max-w-md gap-1">
                  {["breakdown", "global", "achievements"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setStatsSubTab(tab); setSelectedGroupForDetails(null); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        statsSubTab === tab
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab === "breakdown" && t.breakdown}
                      {tab === "global" && t.globalContext}
                      {tab === "achievements" && t.trophies}
                    </button>
                  ))}
                </div>
                
                {statsSubTab === "breakdown" && (
                  <div className="flex-1 relative min-h-[50vh] space-y-8">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                          <PieChart className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <div className="text-4xl font-bold">{stats.totalSpecies}</div>
                          <div className="text-emerald-100 font-medium">{t.observedSpecies}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
                        <Database className="w-5 h-5 text-blue-500" /> {t.taxonomicGroups}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stats.groups.map(({ name, count }) => (
                          <div key={name} className="relative p-4 rounded-xl border-2 border-slate-200 bg-white hover:shadow-md transition-all text-left flex flex-col h-28 justify-between overflow-hidden group">
                            <span className="text-3xl font-bold text-slate-700">{count}</span>
                            <span className="font-bold text-slate-600 text-sm uppercase tracking-wide">
                              {GLOBAL_SPECIES_ESTIMATES[name]?.label || name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {statsSubTab === "global" && (
                  <div className="relative min-h-[50vh]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                              <Globe className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-lg">{t.globalCompletion}</h3>
                              <p className="text-xs text-slate-500">{t.globalSubtitle}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {Object.entries(GLOBAL_SPECIES_ESTIMATES).map(([key, data]) => {
                              const userCount = userCollection.filter(
                                (i) => i.iconicGroup === data.label || i.iconicGroup === key
                              ).length;
                              return (
                                <div key={key} className="mb-4">
                                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                                    <span className="font-bold">{data.label}</span>
                                    <div className="flex gap-1">
                                      <span className="text-emerald-700 font-bold">{userCount.toLocaleString()}</span>
                                      {data.total && <span className="text-slate-400">/ {data.total.toLocaleString()}</span>}
                                    </div>
                                  </div>
                                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                                    <div
                                      className={`h-full ${data.color} transition-all duration-500`}
                                      style={{ width: `${data.total ? (userCount / data.total) * 100 : 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div
                          onClick={() => setSelectedGroupForDetails("completed_genera")}
                          className="cursor-pointer transition-transform active:scale-95 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
                              <Trophy className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-slate-800">{stats.completedGenera.length}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.completedGenera}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100">
                              <Database className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-slate-800">{stats.groups.length}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Groups</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedGroupForDetails === "completed_genera" && (
                      <div className="absolute inset-0 bg-white rounded-xl p-6 shadow-xl z-20">
                        <button
                          onClick={() => setSelectedGroupForDetails(null)}
                          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full"
                        >
                          <X className="w-5 h-5 text-slate-600" />
                        </button>
                        <CompletedGeneraView completedList={stats.completedGenera} t={t} />
                      </div>
                    )}
                  </div>
                )}

                {statsSubTab === "achievements" && (
                  <AchievementsView collection={userCollection} t={t} />
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-purple-500" /> {t.language}
                  </h2>
                  <div className="relative">
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      {INAT_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{t.langSubtitle}</p>
                  {isTranslating && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg animate-pulse">
                      <Loader className="w-3 h-3 animate-spin" /> {t.translating}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-blue-500" /> {t.dataBackup}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleExport}
                      disabled={userCollection.length === 0}
                      className="flex items-center justify-center gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-5 h-5" /> {t.exportCSV}
                    </button>
                    <label className="flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-600 p-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 cursor-pointer transition-all">
                      <Upload className="w-5 h-5" /> {t.importCSV}
                      <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    </label>
                  </div>
                  {importStatus === "success" && (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 text-xs font-bold rounded-lg text-center">
                      Import Successful!
                    </div>
                  )}
                  {importStatus === "error" && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg text-center">
                      Import Failed.
                    </div>
                  )}
                </div>

                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <h2 className="font-bold text-red-800 mb-2 text-sm uppercase tracking-wide">{t.dangerZone}</h2>
                  <button
                    onClick={openClearAllModal}
                    className="text-red-600 text-sm font-medium hover:underline flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> {t.clearAll}
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-sm mb-2">IUCN Red List token (optional)</h3>
                  <p className="text-xs text-slate-400 mb-2">Add your IUCN API token to show conservation status badges.</p>
                  <div className="flex gap-2">
                    <input
                      value={iucnToken}
                      onChange={(e) => setIucnToken(e.target.value)}
                      placeholder="paste token here"
                      className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <button onClick={saveIucnToken} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Save</button>
                    <button onClick={clearIucnTokenLocal} className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold">Clear</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around p-2 pb-6 shrink-0 z-20">
          {[
            { id: "explore", icon: Search, label: t.explore },
            { id: "collection", icon: List, label: t.myList },
            { id: "stats", icon: PieChart, label: t.stats },
            { id: "settings", icon: Settings, label: t.settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center p-2 rounded-xl w-20 transition-all ${
                activeTab === item.id ? "text-emerald-600 bg-emerald-50" : "text-slate-400"
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
              {item.id === "collection" && userCollection.length > 0 && (
                <span className="absolute top-2 right-5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={!!selectedTaxon}
        onClose={() => setSelectedTaxon(null)}
        title={modalMode === "add" ? t.addCollection : t.updateObs}
        isLoading={isLoadingDetails}
        loadingText={t.fetchingTaxonomy}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-2 bg-slate-50 rounded-xl">
            {selectedTaxon?.image && (
              <img
                src={selectedTaxon.image}
                className="w-16 h-16 rounded-lg object-cover shadow-sm border border-white"
                alt="Species"
              />
            )}
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">
                {formatCommonName(
                  selectedTaxon?.common_name || selectedTaxon?.commonName
                )}
              </h3>
              <p className="text-sm text-slate-500 italic">
                {selectedTaxon?.scientific_name || selectedTaxon?.scientificName}
              </p>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              {t.where}
            </label>
            <div className="flex gap-2 mb-2 relative">
              <input
                type="text"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                placeholder="e.g. France"
                className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
              />
              <button
                onClick={() => addCountry()}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={!countryInput}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {countrySuggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-12 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1 top-full">
                {countrySuggestions.map((country) => (
                  <li
                    key={country}
                    onClick={() => addCountry(country)}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                  >
                    {country}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {observationCountries.map((c) => (
                <CountryTag key={c} name={c} onRemove={removeCountry} />
              ))}
              {observationCountries.length === 0 && (
                <span className="text-xs text-slate-300 italic">{t.noCountry}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              {t.notes}
            </label>
            <textarea
              value={observationNote}
              onChange={(e) => setObservationNote(e.target.value)}
              placeholder="e.g. Found in the backyard, 3pm..."
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm min-h-[100px] resize-none transition-colors"
            />
          </div>
          <button
            onClick={saveObservation}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> {modalMode === "add" ? t.save : t.update}
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title={t.removeTitle}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-slate-600">
            {t.removeMsg} <strong>{formatCommonName(itemToDelete?.commonName)}</strong>?
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setItemToDelete(null)}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={executeDelete}
              className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
            >
              {t.yesRemove}
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear All Modal */}
      <Modal
        isOpen={isClearingAll}
        onClose={() => setIsClearingAll(false)}
        title={t.resetTitle}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-4 border-red-50">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-lg">{t.protectedAction}</p>
            <p className="text-slate-500 text-sm mt-2">
              {t.resetMsg} <strong>{userCollection.length}</strong> {t.observations}, {t.typeDelete} below.
            </p>
          </div>
          <input
            type="text"
            value={deleteCodeInput}
            onChange={(e) => setDeleteCodeInput(e.target.value)}
            placeholder={t.typeDelete}
            className="w-full p-3 border-2 border-slate-200 rounded-xl text-center font-bold tracking-widest uppercase focus:border-red-500 outline-none"
          />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setIsClearingAll(false)}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={executeClearAll}
              disabled={deleteCodeInput !== DELETE_CONFIRMATION_CODE}
              className="py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-200"
            >
              {t.deleteEverything}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
