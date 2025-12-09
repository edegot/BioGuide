import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  MapPin,
  Trophy,
  Settings,
  Leaf,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Moon,
  Sun,
  Camera,
  BarChart2,
  List,
  Grid,
  CheckCircle,
  ArrowLeft,
  Layers,
  AlertTriangle,
  Target,
  Home,
  Sparkles,
  Info,
  Filter,
  Menu,
} from "lucide-react";

// ==========================================
// === 1. DATA & CONFIGURATION ===
// ==========================================

const RAW_CSV_TRANSLATIONS = `key,fr,en,es,de,it
explore,Explorer,Explore,Explorar,Entdecken,Esplora
obs,Collection,Collection,Colección,Sammlung,Collezione
stats,Stats,Stats,Estad.,Statistik,Statistiche
settings,Réglages,Settings,Ajustes,Einstellungen,Impostazioni
searchPlaceholder,Rechercher une espèce...,Search species...,Buscar...,Suchen...,Cerca...
results,Résultats,Results,Resultados,Ergebnisse,Risultati
suggestions,Suggestions,Suggestions,Sugerencias,Vorschläge,Suggerimenti
emptyObs,Votre carnet est vide.,Your notebook is empty.,Cuaderno vacío.,Leer.,Vuoto.
deleteData,Tout supprimer,Delete All,Borrar todo,Löschen,Cancella
confirmReset,Cette action est irréversible.,Irreversible action.,Irreversible.,Irreversibel.,Irreversibile.
language,Langue,Language,Idioma,Sprache,Lingua
darkMode,Mode Sombre,Dark Mode,Modo Oscuro,Dunkelmodus,Modalità Scura
export,Exporter CSV,Export CSV,Exportar CSV,CSV Exportieren,Esporta CSV
speciesOfDay,Espèce du jour,Featured Species,Especie destacada,Vorgestellt,Specie in evidenza
add,Ajouter au carnet,Add to notebook,Añadir,Hinzufügen,Aggiungi
remove,Retirer du carnet,Remove,Quitar,Entfernen,Rimuovere
countries,Lieux observés,Seen Locations,Lugares,Orte,Luoghi
addCountry,Ajouter un pays...,Add country...,Añadir país...,Land...,Paese...
taxonomy,Taxonomie,Taxonomy,Taxonomía,Taxonomie,Tassonomia
viewList,Liste,List,Lista,Liste,Lista
viewGrid,Grille,Grid,Cuadrícula,Gitter,Griglia
searchObs,Filtrer ma collection...,Filter collection...,Filtrar...,Filtern...,Filtra...
alreadySeen,Déjà observé,Already seen,Ya visto,Gesehen,Visto
overview,Vue d'ensemble,Overview,Resumen,Übersicht,Panoramica
trophies,Succès,Achievements,Logros,Erfolge,Successi
all,Tous,All,Todos,Alle,Tutti
deleteSecurity,Zone de Danger,Danger Zone,Zona Peligro,Gefahrenzone,Zona Pericolo
typeDelete,Tapez 'SUPPRIMER',Type 'DELETE',Escriba 'BORRAR',Tippen 'LOSCHEN',Digita 'CANCELLA'
cancel,Annuler,Cancel,Cancelar,Abbrechen,Annulla
confirm,Confirmer,Confirm,Confirmar,Bestätigen,Conferma
collected,espèces collectées,species collected,especies,arten,specie
totalExisting,Total estimé,Total estimated,Total estimado,Geschätzt,Totale stimato
myCollection,Ma Collection,My Collection,Mi Colección,Meine Sammlung,La Mia Collezione
homeSubtitle,Compagnon naturaliste,Naturalist companion,Compañero naturalista,Naturführer,Compagno naturalista
strictCountry,Pays inconnu.,Unknown country.,País desconocido.,Unbekanntes Land.,Paese sconosciuto.
back,Retour,Back,Volver,Zurück,Indietro`;

const COUNTRY_NAMES = [
  "France",
  "Belgique",
  "Suisse",
  "Canada",
  "États-Unis",
  "Espagne",
  "Italie",
  "Allemagne",
  "Royaume-Uni",
  "Chine",
  "Japon",
  "Brésil",
  "Inde",
  "Australie",
  "Mexique",
  "Argentine",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Madagascar",
  "Portugal",
  "Costa Rica",
];

const API_URL = "https://api.inaturalist.org/v1";

const GLOBAL_SPECIES_ESTIMATES = {
  Mammalia: { total: 6400, icon: "🦁", color: "#F59E0B", label: "Mammalia" },
  Aves: { total: 11000, icon: "🐦", color: "#3B82F6", label: "Aves" },
  Reptilia: { total: 11000, icon: "🦎", color: "#EF4444", label: "Reptilia" },
  Amphibia: { total: 8000, icon: "🐸", color: "#8B5CF6", label: "Amphibia" },
  Actinopterygii: {
    total: 32000,
    icon: "🐟",
    color: "#0ea5e9",
    label: "Pisces",
  },
  Insecta: { total: 1000000, icon: "🐞", color: "#EC4899", label: "Insecta" },
  Arachnida: {
    total: 100000,
    icon: "🕷️",
    color: "#78350f",
    label: "Arachnida",
  },
  Mollusca: { total: 85000, icon: "🐌", color: "#f43f5e", label: "Mollusca" },
  Plantae: { total: 390000, icon: "🌿", color: "#10B981", label: "Plantae" },
  Fungi: { total: 140000, icon: "🍄", color: "#9CA3AF", label: "Fungi" },
};

const TROPHIES_DATA = [
  { id: "newbie", threshold: 1, icon: "🌱", title: "Novice" },
  { id: "explorer", threshold: 10, icon: "🔭", title: "Explorer" },
  { id: "expert", threshold: 50, icon: "🦁", title: "Master" },
  {
    id: "ornitho",
    family: "Aves",
    threshold: 5,
    icon: "🦅",
    title: "Bird Watcher",
  },
  {
    id: "botanist",
    family: "Plantae",
    threshold: 5,
    icon: "🌻",
    title: "Botanist",
  },
  { id: "globetrotter", countryThreshold: 3, icon: "🌍", title: "Traveler" },
];

const SUPPORTED_LANGS = ["fr", "en", "es", "de", "it"];

// --- UTILITIES ---

const parseTranslations = (csvString) => {
  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const translations = {};
  SUPPORTED_LANGS.forEach((l) => (translations[l] = {}));

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",");
    if (row.length < 2) continue;
    const key = row[0].trim();
    for (let j = 1; j < headers.length; j++) {
      if (translations[headers[j]]) {
        translations[headers[j]][key] = row[j]?.trim() || key;
      }
    }
  }
  return translations;
};

const TRANSLATIONS = parseTranslations(RAW_CSV_TRANSLATIONS);

const getTaxonClass = (taxon) => {
  const classObj = taxon.ancestors?.find((a) => a.rank === "class");
  if (classObj) return classObj.name;
  const map = {
    Reptilia: "Reptilia",
    Aves: "Aves",
    Mammalia: "Mammalia",
    Amphibia: "Amphibia",
    Actinopterygii: "Actinopterygii",
    Insecta: "Insecta",
    Arachnida: "Arachnida",
    Mollusca: "Mollusca",
    Plantae: "Plantae",
    Fungi: "Fungi",
  };
  return map[taxon.iconic_taxon_name] || "Unknown";
};

// --- UI COMPONENTS ---

const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "px-5 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50";
  const variants = {
    primary:
      "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
    secondary:
      "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600",
    outline:
      "border-2 border-emerald-500 text-emerald-500 dark:text-emerald-400 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Header = ({ title, subtitle, rightAction }) => (
  <div className="sticky top-0 z-30 px-6 pt-6 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 lg:pt-8">
    <div className="flex justify-between items-end max-w-7xl mx-auto w-full">
      <div>
        {subtitle && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight capitalize">
          {title}
        </h1>
      </div>
      {rightAction}
    </div>
  </div>
);

// --- MAIN APP & LAYOUT ---

const App = () => {
  const [activeTab, setActiveTab] = useState("exploration");
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [observations, setObservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bioguide_obs")) || [];
    } catch {
      return [];
    }
  });
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("fr");

  useEffect(
    () => localStorage.setItem("bioguide_obs", JSON.stringify(observations)),
    [observations]
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const savedIds = useMemo(
    () => new Set(observations.map((o) => o.id)),
    [observations]
  );

  const toggleSaveSpecies = (species) => {
    if (savedIds.has(species.id)) {
      setObservations((prev) => prev.filter((o) => o.id !== species.id));
    } else {
      setObservations((prev) => [
        ...prev,
        { ...species, dateAdded: new Date().toISOString(), countries: [] },
      ]);
    }
  };

  const updateCountries = (id, countries) => {
    setObservations((prev) =>
      prev.map((obs) => (obs.id === id ? { ...obs, countries } : obs))
    );
    if (selectedSpecies && selectedSpecies.id === id)
      setSelectedSpecies((prev) => ({ ...prev, countries }));
  };

  const t = TRANSLATIONS[lang];
  const props = {
    observations,
    setObservations,
    onOpenSpecies: setSelectedSpecies,
    lang,
    savedIds,
    t,
    setLang,
    darkMode,
    setDarkMode,
    updateCountries,
  };

  // --- RESPONSIVE LAYOUT STRUCTURE ---
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900 overflow-hidden">
      {/* DESKTOP SIDEBAR (Visible on md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 shrink-0 z-40">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">BioGuide</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavBtn
            id="exploration"
            icon={<Search size={22} />}
            label={t.explore}
            active={activeTab}
            set={setActiveTab}
            layout="sidebar"
          />
          <NavBtn
            id="collection"
            icon={<Layers size={22} />}
            label={t.obs}
            active={activeTab}
            set={setActiveTab}
            badge={observations.length}
            layout="sidebar"
          />
          <NavBtn
            id="stats"
            icon={<BarChart2 size={22} />}
            label={t.stats}
            active={activeTab}
            set={setActiveTab}
            layout="sidebar"
          />
          <NavBtn
            id="settings"
            icon={<Settings size={22} />}
            label={t.settings}
            active={activeTab}
            set={setActiveTab}
            layout="sidebar"
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {t.collected}
            </p>
            <p className="text-3xl font-black text-slate-800 dark:text-white">
              {observations.length}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full h-full">
            {activeTab === "exploration" && <ExplorationTab {...props} />}
            {activeTab === "collection" && <CollectionTab {...props} />}
            {activeTab === "stats" && <StatsTab {...props} />}
            {activeTab === "settings" && <SettingsTab {...props} />}
          </div>
        </div>

        {/* MOBILE BOTTOM NAV (Visible on sm/mobile only) */}
        <nav className="md:hidden shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-safe z-40">
          <div className="flex justify-around items-center px-2 py-3">
            <NavBtn
              id="exploration"
              icon={<Search size={22} strokeWidth={2.5} />}
              label={t.explore}
              active={activeTab}
              set={setActiveTab}
              layout="mobile"
            />
            <NavBtn
              id="collection"
              icon={<Layers size={22} strokeWidth={2.5} />}
              label={t.obs}
              active={activeTab}
              set={setActiveTab}
              badge={observations.length}
              layout="mobile"
            />
            <NavBtn
              id="stats"
              icon={<BarChart2 size={22} strokeWidth={2.5} />}
              label={t.stats}
              active={activeTab}
              set={setActiveTab}
              layout="mobile"
            />
            <NavBtn
              id="settings"
              icon={<Settings size={22} strokeWidth={2.5} />}
              label={t.settings}
              active={activeTab}
              set={setActiveTab}
              layout="mobile"
            />
          </div>
        </nav>
      </main>

      {/* RESPONSIVE MODAL */}
      <SpeciesModal
        species={selectedSpecies}
        isOpen={!!selectedSpecies}
        onClose={() => setSelectedSpecies(null)}
        isSaved={savedIds.has(selectedSpecies?.id)}
        savedData={observations.find((o) => o?.id === selectedSpecies?.id)}
        onToggleSave={toggleSaveSpecies}
        onUpdateCountries={updateCountries}
        t={t}
        lang={lang}
      />
    </div>
  );
};

const NavBtn = ({ id, icon, label, active, set, badge, layout }) => {
  const isActive = active === id;

  if (layout === "sidebar") {
    return (
      <button
        onClick={() => set(id)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
          isActive
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <div
          className={`${
            isActive
              ? "text-white"
              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
          }`}
        >
          {icon}
        </div>
        <span className="font-bold text-sm tracking-tight flex-1 text-left">
          {label}
        </span>
        {badge > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  }

  // Mobile Layout
  return (
    <button
      onClick={() => set(id)}
      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
        isActive
          ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 scale-105"
          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
      {badge > 0 && !isActive && (
        <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
      )}
    </button>
  );
};

// --- VIEW 1: EXPLORATION ---

const ExplorationTab = ({ onOpenSpecies, lang, savedIds, t }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    fetch(
      `${API_URL}/observations?per_page=1&popular=true&iconic_taxa=Aves,Mammalia&locale=${lang}`
    )
      .then((res) => res.json())
      .then(
        (data) => data.results?.[0]?.taxon && setFeatured(data.results[0].taxon)
      )
      .catch(() => {});
  }, [lang]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/taxa?q=${query}&rank=species&is_active=true&per_page=20&locale=${lang}`
        );
        const json = await res.json();
        setResults(json.results);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="pb-32 md:pb-10">
      {/* Hero Header */}
      <div className="pt-14 pb-10 px-6 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 lg:pt-20 lg:px-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-emerald-500 rounded-lg text-white">
            <Leaf size={16} fill="currentColor" />
          </span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
            {t.homeSubtitle}
          </p>
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 max-w-2xl">
          {lang === "fr" ? "Découvrez la biodiversité" : "Discover the wild"}
        </h1>

        {/* Search Input */}
        <div className="relative group z-20 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              className="text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={20}
            />
          </div>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 focus:ring-0 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white font-bold placeholder-slate-400 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-12">
        {/* Featured Card */}
        {!query && !loading && featured && (
          <div
            onClick={() => onOpenSpecies(featured)}
            className="mt-2 relative aspect-[16/9] lg:aspect-[21/9] rounded-[32px] overflow-hidden shadow-2xl cursor-pointer group max-w-4xl"
          >
            <img
              src={
                featured.default_photo?.medium_url.replace("medium", "large") ||
                ""
              }
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Featured"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={12} /> {t.speciesOfDay}
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-none capitalize mb-2">
                {featured.preferred_common_name || featured.name}
              </h2>
              <p className="text-slate-300 italic text-sm opacity-90">
                {featured.name}
              </p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Results - RESPONSIVE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {results.map((species) => {
            const isSeen = savedIds.has(species.id);
            return (
              <div
                key={species.id}
                onClick={() => onOpenSpecies(species)}
                className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer active:scale-95 transition-all hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-900"
              >
                <div className="relative w-16 h-16 shrink-0">
                  <img
                    src={
                      species.default_photo?.square_url ||
                      "https://via.placeholder.com/75"
                    }
                    alt={species.name}
                    className="w-full h-full rounded-xl object-cover bg-slate-100 dark:bg-slate-700"
                  />
                  {isSeen && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-800 shadow-md">
                      <CheckCircle size={12} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base text-slate-900 dark:text-white truncate capitalize">
                    {species.preferred_common_name || species.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate">
                    {species.name}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- VIEW 2: COLLECTION ---

const CollectionTab = ({ observations, onOpenSpecies, lang, t }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const availableGroups = useMemo(() => {
    const groups = new Set(
      observations.map((o) => getTaxonClass(o)).filter((c) => c !== "Unknown")
    );
    return Array.from(groups);
  }, [observations]);

  const filtered = observations.filter((o) => {
    const name = o.names?.[lang] || o.preferred_common_name || o.name;
    const matchSearch = name.toLowerCase().includes(filter.toLowerCase());
    const matchGroup =
      groupFilter === "all" || getTaxonClass(o) === groupFilter;
    return matchSearch && matchGroup;
  });

  return (
    <div className="h-full flex flex-col">
      <Header
        title={t.obs}
        subtitle={`${observations.length} ${t.collected}`}
        rightAction={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["grid", "list"].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === m
                    ? "bg-white dark:bg-slate-600 shadow-sm text-emerald-600 dark:text-white"
                    : "text-slate-400"
                }`}
              >
                {m === "grid" ? <Grid size={18} /> : <List size={18} />}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-6 mt-6 space-y-4">
        {/* Search Filter */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t.searchObs}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 pl-11 pr-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-bold transition-all"
          />
        </div>
        {/* Category Chips */}
        {availableGroups.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setGroupFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                groupFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {t.all}
            </button>
            {availableGroups.map((grp) => (
              <button
                key={grp}
                onClick={() => setGroupFilter(grp)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 border ${
                  groupFilter === grp
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <span>{GLOBAL_SPECIES_ESTIMATES[grp]?.icon}</span>{" "}
                {GLOBAL_SPECIES_ESTIMATES[grp]?.label || grp}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center opacity-40 py-20 space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Camera size={32} />
            </div>
            <p className="font-bold">{t.emptyObs}</p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-3"
            }
          >
            {filtered.map((obs) => (
              <div
                key={obs.id}
                onClick={() => onOpenSpecies(obs)}
                className={`bg-white dark:bg-slate-800 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform hover:shadow-md ${
                  viewMode === "grid"
                    ? "rounded-3xl flex flex-col"
                    : "rounded-2xl flex items-center p-3 gap-4 max-w-3xl"
                }`}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "h-40 w-full relative bg-slate-100"
                      : "w-16 h-16 shrink-0 relative bg-slate-100 rounded-xl"
                  }
                >
                  <img
                    src={obs.default_photo?.medium_url || ""}
                    alt={obs.name}
                    className="w-full h-full object-cover"
                  />
                  {viewMode === "grid" && obs.countries?.length > 0 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md font-bold flex items-center gap-1">
                      <Globe size={10} /> {obs.countries.length}
                    </div>
                  )}
                </div>
                <div className={viewMode === "grid" ? "p-4" : "flex-1 min-w-0"}>
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate capitalize">
                    {obs.names?.[lang] || obs.preferred_common_name || obs.name}
                  </p>
                  <p className="text-xs text-slate-500 italic truncate capitalize opacity-80">
                    {obs.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- VIEW 3: STATS ---

const StatsTab = ({ observations, lang, t }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  const overviewStats = useMemo(() => {
    const presentKeys = new Set(
      observations.map((o) => getTaxonClass(o)).filter((k) => k !== "Unknown")
    );
    return Array.from(presentKeys)
      .map((key) => {
        const val = GLOBAL_SPECIES_ESTIMATES[key] || {
          total: 1000,
          color: "#999",
          icon: "?",
        };
        const count = observations.filter(
          (o) => getTaxonClass(o) === key
        ).length;
        return {
          key,
          count,
          total: val.total,
          label: val.label || key,
          icon: val.icon,
          color: val.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [observations]);

  const drillDownData = useMemo(() => {
    if (!selectedGroup) return null;
    const filtered = observations.filter(
      (o) => getTaxonClass(o) === selectedGroup
    );
    const tree = {};
    filtered.forEach((o) => {
      const order =
        o.ancestors?.find((a) => a.rank === "order")?.name || "Order Unknown";
      const family =
        o.ancestors?.find((a) => a.rank === "family")?.name || "Family Unknown";
      if (!tree[order]) tree[order] = {};
      if (!tree[order][family]) tree[order][family] = [];
      tree[order][family].push(o);
    });
    return tree;
  }, [observations, selectedGroup]);

  return (
    <div className="h-full flex flex-col">
      <Header title={t.stats} />
      <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-10 space-y-10">
        {!selectedGroup ? (
          <div className="animate-in fade-in space-y-8">
            {/* Trophies Section */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} /> {t.trophies}
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
                {TROPHIES_DATA.map((badge) => {
                  const uniqueCountries = new Set(
                    observations.flatMap((o) => o.countries || [])
                  ).size;
                  let unlocked = false;
                  if (badge.threshold) {
                    if (badge.family)
                      unlocked =
                        observations.filter((o) =>
                          o.ancestors?.some((a) => a.name === badge.family)
                        ).length >= badge.threshold;
                    else unlocked = observations.length >= badge.threshold;
                  }
                  if (badge.countryThreshold)
                    unlocked = uniqueCountries >= badge.countryThreshold;

                  return (
                    <div
                      key={badge.title}
                      className={`shrink-0 w-28 md:w-32 p-4 rounded-3xl flex flex-col items-center justify-center text-center border-2 transition-all duration-500 ${
                        unlocked
                          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg scale-100 opacity-100"
                          : "bg-slate-50 border-slate-100 grayscale opacity-40 scale-95"
                      }`}
                    >
                      <div className="text-4xl mb-3 drop-shadow-sm filter">
                        {badge.icon}
                      </div>
                      <span className="text-[10px] uppercase font-black text-slate-800 tracking-wide">
                        {badge.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categories Grid - RESPONSIVE */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="text-emerald-500" size={20} /> {t.overview}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {overviewStats.map((stat) => (
                  <button
                    key={stat.key}
                    onClick={() => setSelectedGroup(stat.key)}
                    className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-100 dark:border-slate-700 flex flex-col items-start text-left hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden group"
                  >
                    <div
                      className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150"
                      style={{ backgroundColor: stat.color }}
                    ></div>
                    <div className="flex justify-between w-full mb-4 relative z-10">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        {stat.icon}
                      </div>
                      <span className="font-black text-3xl text-slate-800 dark:text-white">
                        {stat.count}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2 relative z-10 capitalize">
                      {stat.label}
                    </span>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(
                            5,
                            (stat.count / stat.total) * 100
                          )}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </button>
                ))}
                {overviewStats.length === 0 && (
                  <div className="col-span-2 text-center text-slate-400 italic py-10">
                    No stats available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setSelectedGroup(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-6 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full w-fit transition-colors"
            >
              <ArrowLeft size={16} /> {t.back}
            </button>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3 capitalize">
              {GLOBAL_SPECIES_ESTIMATES[selectedGroup]?.icon}{" "}
              {GLOBAL_SPECIES_ESTIMATES[selectedGroup]?.label || selectedGroup}
            </h2>
            <div className="columns-1 md:columns-2 xl:columns-3 gap-4 space-y-4">
              {Object.entries(drillDownData).map(([orderName, families]) => (
                <div
                  key={orderName}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden p-5 shadow-sm break-inside-avoid mb-4"
                >
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 capitalize flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {orderName}
                  </h3>
                  <div className="space-y-4 pl-4 border-l-2 border-slate-100 dark:border-slate-700">
                    {Object.entries(families).map(([familyName, species]) => (
                      <div key={familyName}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize">
                            {familyName}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {species.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {species.map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] font-medium text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg truncate max-w-[150px]"
                            >
                              {s.names?.[lang] ||
                                s.preferred_common_name ||
                                s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- VIEW 4: SETTINGS ---

const SettingsTab = ({
  darkMode,
  setDarkMode,
  observations,
  setObservations,
  lang,
  setLang,
  t,
}) => {
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "id,name_fr,scientific_name\n" +
      observations
        .map(
          (o) =>
            `${o.id},"${o.names?.fr || o.preferred_common_name}","${o.name}"`
        )
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "bioguide_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = () => {
    if (
      deleteInput.trim().toUpperCase() ===
      (lang === "fr" ? "SUPPRIMER" : "DELETE")
    ) {
      setObservations([]);
      setShowDelete(false);
      setDeleteInput("");
    }
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto">
      <Header title={t.settings} />
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <Card className="divide-y divide-slate-100 dark:divide-slate-700">
          <div className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-200">
              <Moon size={20} className="text-purple-500" />{" "}
              <span>{t.darkMode}</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                darkMode ? "bg-slate-700" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  darkMode ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
          <div className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-200">
              <Globe size={20} className="text-blue-500" />{" "}
              <span>{t.language}</span>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent font-bold outline-none text-right dark:text-white cursor-pointer"
            >
              {SUPPORTED_LANGS.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full justify-between"
          >
            <span>{t.export}</span> <Download size={18} />
          </Button>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <Button
              variant="danger"
              onClick={() => setShowDelete(true)}
              className="w-full justify-between bg-red-50 text-red-600 hover:bg-red-100 shadow-none border-transparent"
            >
              <span>{t.deleteSecurity}</span> <Trash2 size={18} />
            </Button>
          </div>
        </Card>

        {showDelete && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-3xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-3">
              <AlertTriangle size={20} /> {t.deleteData}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {t.typeDelete}
            </p>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-red-200 dark:border-red-800 mb-4 uppercase text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-red-500"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDelete(false)}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
              >
                {t.confirm}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- RESPONSIVE MODAL ---

const SpeciesModal = ({
  species,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  savedData,
  onUpdateCountries,
  t,
  lang,
}) => {
  const [countriesInput, setCountriesInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  if (!isOpen || !species) return null;
  const currentCountries = savedData?.countries || [];

  const handleInputChange = (val) => {
    setCountriesInput(val);
    setSuggestions(
      val.length > 0
        ? COUNTRY_NAMES.filter((c) =>
            c.toLowerCase().startsWith(val.toLowerCase())
          ).slice(0, 4)
        : []
    );
  };

  const addCountry = (name) => {
    if (name) {
      onUpdateCountries(species.id, [...new Set([...currentCountries, name])]);
      setCountriesInput("");
      setSuggestions([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl md:h-[80vh] h-[90vh] rounded-t-[40px] md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-20 duration-300">
        {/* Modal Header Image - Split on desktop */}
        <div className="relative h-72 md:h-full md:w-5/12 shrink-0 bg-slate-200">
          <img
            src={
              species.default_photo?.medium_url.replace("medium", "large") || ""
            }
            alt={species.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all md:hidden"
          >
            <X size={24} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent text-white pt-20">
            <h2 className="text-3xl font-extrabold leading-tight capitalize mb-1">
              {species.names?.[lang] ||
                species.preferred_common_name ||
                species.name}
            </h2>
            <p className="italic opacity-80 font-medium text-lg">
              {species.name}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-slate-900 relative">
          <button
            onClick={onClose}
            className="hidden md:block absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"
          >
            <X size={24} />
          </button>

          <Button
            variant={isSaved ? "danger" : "primary"}
            onClick={() => onToggleSave(species)}
            className="w-full py-4 text-lg shadow-xl"
          >
            {isSaved ? (
              <>
                <Trash2 size={20} /> {t.remove}
              </>
            ) : (
              <>
                <Plus size={20} /> {t.add}
              </>
            )}
          </Button>

          {isSaved && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <MapPin size={18} className="text-emerald-500" /> {t.countries}
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentCountries.map((c, i) => (
                  <span
                    key={i}
                    className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2"
                  >
                    {c}{" "}
                    <button
                      onClick={() =>
                        onUpdateCountries(
                          species.id,
                          currentCountries.filter((x) => x !== c)
                        )
                      }
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative group">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={countriesInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={t.addCountry}
                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => addCountry(countriesInput)}
                    className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 bottom-full mb-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-2">
                    {suggestions.map((s, idx) => (
                      <li
                        key={idx}
                        onClick={() => addCountry(s)}
                        className="px-4 py-2 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer text-sm font-medium"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> {t.taxonomy}
            </h3>
            <div className="space-y-3 relative">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
              {species.ancestors?.slice(0, 6).map((tax, i) => (
                <div
                  key={tax.id}
                  className="flex items-center gap-4 relative z-10"
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      i === species.ancestors.length - 1
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  ></div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {tax.rank}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {tax.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
