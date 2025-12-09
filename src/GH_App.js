// --- 0. IMPORTS ---

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Leaf,
  Globe,
  BarChart2,
  Download,
  Upload,
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  Camera,
  Trash2,
  Edit2,
  Home,
  Compass,
  Grid,
  Trophy,
  BookOpen,
  Sparkles,
  CheckCircle,
  Loader,
  Sun,
  Moon,
  AlertTriangle,
  Info,
  Layers,
} from "lucide-react";

// --- 1. CONSTANTS, DATA & CONFIGURATION ---

const INAT_API_BASE = "https://api.inaturalist.org/v1";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const GLOBAL_SPECIES_ESTIMATES = {
  Animalia: {
    label: "Animals",
    color: "bg-blue-500",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "🦁",
  },
  Plantae: {
    label: "Plants",
    color: "bg-green-500",
    border: "border-green-200",
    text: "text-green-700",
    icon: "🌿",
  },
  Fungi: {
    label: "Fungi",
    color: "bg-orange-500",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "🍄",
  },
  Protozoa: {
    label: "Protozoans",
    color: "bg-purple-500",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: "🔬",
  },
  Archaea: {
    label: "Archaea",
    color: "bg-indigo-500",
    border: "border-indigo-200",
    text: "text-indigo-700",
    icon: "⚛️",
  },
  Bacteria: {
    label: "Bacteria",
    color: "bg-red-500",
    border: "border-red-200",
    text: "text-red-700",
    icon: "🦠",
  },
};

const TROPHIES_DATA = [
  {
    id: 1,
    icon: "🌍",
    title: "World Explorer",
    desc: "Observe in 5+ countries",
    countryThreshold: 5,
  },
  {
    id: 2,
    icon: "🌎",
    title: "Continental Collector",
    desc: "Observe in 10+ countries",
    countryThreshold: 10,
  },
  {
    id: 3,
    icon: "🌏",
    title: "Global Naturalist",
    desc: "Observe in 20+ countries",
    countryThreshold: 20,
  },
  {
    id: 4,
    icon: "🔟",
    title: "Decade Devotee",
    desc: "Collect 10 species",
    threshold: 10,
  },
  {
    id: 5,
    icon: "💯",
    title: "Century Seeker",
    desc: "Collect 100 species",
    threshold: 100,
  },
  {
    id: 6,
    icon: "🏆",
    title: "Master Collector",
    desc: "Collect 500+ species",
    threshold: 500,
  },
  {
    id: 7,
    icon: "🦁",
    title: "Beast Mode",
    desc: "Collect 10 animals",
    family: "Animalia",
    threshold: 10,
  },
  {
    id: 8,
    icon: "🌿",
    title: "Green Thumb",
    desc: "Collect 10 plants",
    family: "Plantae",
    threshold: 10,
  },
  {
    id: 9,
    icon: "🍄",
    title: "Fungal Finder",
    desc: "Collect 5 fungi",
    family: "Fungi",
    threshold: 5,
  },
  {
    id: 10,
    icon: "🎯",
    title: "Genus Master",
    desc: "Complete 1 genus",
  },
  {
    id: 11,
    icon: "👑",
    title: "Royalty",
    desc: "Complete 5 genera",
  },
  {
    id: 12,
    icon: "⭐",
    title: "Star Scientist",
    desc: "Complete 10 genera",
  },
];

const TRANSLATIONS = {
  en: {
    home: "Home",
    myCollection: "My Collection",
    discover: "Discover",
    searchSpecies: "Search Species",
    searchPlaceholder: "Search for plants, animals, fungi...",
    searching: "Searching...",
    noResults: "No Results Found",
    tryDifferent: "Try a different search term or add observations manually",
    totalSpecies: "Total Species",
    countries: "Countries",
    genera: "Genera",
    families: "Families",
    orders: "Orders",
    browseByGroup: "Browse by Group",
    completedGenera: "Completed Genera",
    addToCollection: "Add to Collection",
    editObservation: "Edit Observation",
    countriesObserved: "Countries Observed",
    typeCountry: "Type country name...",
    add: "Add",
    selectCountries: "Please select at least one country",
    note: "Note (Optional)",
    addNote: "Add a note about your observation...",
    cancel: "Cancel",
    addObservation: "Add Observation",
    save: "Save Changes",
    alreadyObserved: "You already have this species from these countries",
    addedSpecies: "Added",
    observationUpdated: "Observation updated successfully",
    delete: "Delete",
    deleteObservation: "Delete Observation",
    confirmDelete: "Are you sure you want to delete",
    observationDeleted: "Observation deleted",
    collectionEmpty: "Your collection is empty",
    startSearching: "Start Searching",
    collectionStats: "Collection Statistics",
    filterByCountry: "Filter by Country",
    filterByGroup: "Filter by Group",
    search: "Search",
    observations: "Observations",
    exportCSV: "Export as CSV",
    exportJSON: "Export as JSON",
    importCSV: "Import from CSV",
    exported: "Exported successfully",
    exportedSuccessfully: "Collection exported successfully",
    imported: "Imported",
    importError: "Error importing file. Please check the format.",
    translating: "Translating collection...",
    translationComplete: "Collection translated",
    translationError: "Translation error. Please try again.",
    completed: "Completed",
    viewAll: "View All",
    trophyRoom: "Trophy Room",
    breakdown: "Breakdown",
    addCollection: "Add to Collection",
    added: "Added",
    noObservations: "No observations",
    startCollecting: "Start collecting observations to see them here",
    invalidCountry: "Please select a valid country from the list",
  },
  fr: {
    home: "Accueil",
    myCollection: "Ma Collection",
    discover: "Découvrir",
    searchSpecies: "Rechercher des Espèces",
    searchPlaceholder: "Rechercher des plantes, animaux, champignons...",
    searching: "Recherche en cours...",
    noResults: "Aucun Résultat Trouvé",
    tryDifferent:
      "Essayez un terme de recherche différent ou ajoutez des observations manuellement",
    totalSpecies: "Espèces Totales",
    countries: "Pays",
    genera: "Genres",
    families: "Familles",
    orders: "Ordres",
    browseByGroup: "Parcourir par Groupe",
    completedGenera: "Genres Complétés",
    addToCollection: "Ajouter à la Collection",
    editObservation: "Modifier l'Observation",
    countriesObserved: "Pays Observés",
    typeCountry: "Tapez le nom du pays...",
    add: "Ajouter",
    selectCountries: "Veuillez sélectionner au moins un pays",
    note: "Note (Optionnel)",
    addNote: "Ajoutez une note sur votre observation...",
    cancel: "Annuler",
    addObservation: "Ajouter l'Observation",
    save: "Enregistrer les Modifications",
    alreadyObserved: "Vous avez déjà cette espèce de ces pays",
    addedSpecies: "Ajoutée",
    observationUpdated: "Observation mise à jour avec succès",
    delete: "Supprimer",
    deleteObservation: "Supprimer l'Observation",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer",
    observationDeleted: "Observation supprimée",
    collectionEmpty: "Votre collection est vide",
    startSearching: "Commencer à Rechercher",
    collectionStats: "Statistiques de Collection",
    filterByCountry: "Filtrer par Pays",
    filterByGroup: "Filtrer par Groupe",
    search: "Recherche",
    observations: "Observations",
    exportCSV: "Exporter en CSV",
    exportJSON: "Exporter en JSON",
    importCSV: "Importer depuis CSV",
    exported: "Exporté avec succès",
    exportedSuccessfully: "Collection exportée avec succès",
    imported: "Importée",
    importError:
      "Erreur lors de l'importation du fichier. Veuillez vérifier le format.",
    translating: "Traduction de la collection...",
    translationComplete: "Collection traduite",
    translationError: "Erreur de traduction. Veuillez réessayer.",
    completed: "Complété",
    viewAll: "Voir Tout",
    trophyRoom: "Salle des Trophées",
    breakdown: "Répartition",
    addCollection: "Ajouter à la Collection",
    added: "Ajoutée",
    noObservations: "Aucune observation",
    startCollecting: "Commencez à collecter des observations pour les voir ici",
    invalidCountry: "Veuillez sélectionner un pays valide dans la liste",
  },
  es: {
    home: "Inicio",
    myCollection: "Mi Colección",
    discover: "Descubrir",
    searchSpecies: "Buscar Especies",
    searchPlaceholder: "Buscar plantas, animales, hongos...",
    searching: "Buscando...",
    noResults: "No Se Encontraron Resultados",
    tryDifferent:
      "Intenta con un término de búsqueda diferente o agrega observaciones manualmente",
    totalSpecies: "Especies Totales",
    countries: "Países",
    genera: "Géneros",
    families: "Familias",
    orders: "Órdenes",
    browseByGroup: "Explorar por Grupo",
    completedGenera: "Géneros Completados",
    addToCollection: "Agregar a la Colección",
    editObservation: "Editar Observación",
    countriesObserved: "Países Observados",
    typeCountry: "Escribe el nombre del país...",
    add: "Agregar",
    selectCountries: "Selecciona al menos un país",
    note: "Nota (Opcional)",
    addNote: "Agrega una nota sobre tu observación...",
    cancel: "Cancelar",
    addObservation: "Agregar Observación",
    save: "Guardar Cambios",
    alreadyObserved: "Ya tienes esta especie de estos países",
    addedSpecies: "Agregada",
    observationUpdated: "Observación actualizada exitosamente",
    delete: "Eliminar",
    deleteObservation: "Eliminar Observación",
    confirmDelete: "¿Estás seguro de que deseas eliminar",
    observationDeleted: "Observación eliminada",
    collectionEmpty: "Tu colección está vacía",
    startSearching: "Empezar a Buscar",
    collectionStats: "Estadísticas de Colección",
    filterByCountry: "Filtrar por País",
    filterByGroup: "Filtrar por Grupo",
    search: "Búsqueda",
    observations: "Observaciones",
    exportCSV: "Exportar como CSV",
    exportJSON: "Exportar como JSON",
    importCSV: "Importar desde CSV",
    exported: "Exportado exitosamente",
    exportedSuccessfully: "Colección exportada exitosamente",
    imported: "Importada",
    importError: "Error al importar archivo. Verifica el formato.",
    translating: "Traduciendo colección...",
    translationComplete: "Colección traducida",
    translationError: "Error de traducción. Intenta de nuevo.",
    completed: "Completado",
    viewAll: "Ver Todo",
    trophyRoom: "Galería de Trofeos",
    breakdown: "Desglose",
    addCollection: "Agregar a la Colección",
    added: "Agregada",
    noObservations: "Sin observaciones",
    startCollecting: "Comienza a recopilar observaciones para verlas aquí",
    invalidCountry: "Selecciona un país válido de la lista",
  },
  de: {
    home: "Startseite",
    myCollection: "Meine Sammlung",
    discover: "Entdecken",
    searchSpecies: "Arten Suchen",
    searchPlaceholder: "Pflanzen, Tiere, Pilze suchen...",
    searching: "Wird gesucht...",
    noResults: "Keine Ergebnisse Gefunden",
    tryDifferent:
      "Versuchen Sie einen anderen Suchbegriff oder fügen Sie Beobachtungen manuell hinzu",
    totalSpecies: "Gesamtarten",
    countries: "Länder",
    genera: "Gattungen",
    families: "Familien",
    orders: "Ordnungen",
    browseByGroup: "Nach Gruppe Durchsuchen",
    completedGenera: "Vervollständigte Gattungen",
    addToCollection: "Zur Sammlung Hinzufügen",
    editObservation: "Beobachtung Bearbeiten",
    countriesObserved: "Beobachtete Länder",
    typeCountry: "Landesnamen eingeben...",
    add: "Hinzufügen",
    selectCountries: "Bitte wählen Sie mindestens ein Land",
    note: "Notiz (Optional)",
    addNote: "Geben Sie eine Notiz zu Ihrer Beobachtung an...",
    cancel: "Abbrechen",
    addObservation: "Beobachtung Hinzufügen",
    save: "Änderungen Speichern",
    alreadyObserved: "Sie haben diese Art aus diesen Ländern bereits",
    addedSpecies: "Hinzugefügt",
    observationUpdated: "Beobachtung erfolgreich aktualisiert",
    delete: "Löschen",
    deleteObservation: "Beobachtung Löschen",
    confirmDelete: "Sind Sie sicher, dass Sie löschen möchten",
    observationDeleted: "Beobachtung gelöscht",
    collectionEmpty: "Ihre Sammlung ist leer",
    startSearching: "Mit Der Suche Beginnen",
    collectionStats: "Sammlungsstatistiken",
    filterByCountry: "Nach Land Filtern",
    filterByGroup: "Nach Gruppe Filtern",
    search: "Suche",
    observations: "Beobachtungen",
    exportCSV: "Als CSV Exportieren",
    exportJSON: "Als JSON Exportieren",
    importCSV: "Aus CSV Importieren",
    exported: "Erfolgreich exportiert",
    exportedSuccessfully: "Sammlung erfolgreich exportiert",
    imported: "Importiert",
    importError:
      "Fehler beim Importieren der Datei. Bitte überprüfen Sie das Format.",
    translating: "Sammlung wird übersetzt...",
    translationComplete: "Sammlung übersetzt",
    translationError: "Übersetzungsfehler. Bitte versuchen Sie es erneut.",
    completed: "Abgeschlossen",
    viewAll: "Alles Anzeigen",
    trophyRoom: "Trophäenkammer",
    breakdown: "Aufschlüsselung",
    addCollection: "Zur Sammlung Hinzufügen",
    added: "Hinzugefügt",
    noObservations: "Keine Beobachtungen",
    startCollecting:
      "Beginnen Sie mit dem Sammeln von Beobachtungen, um diese hier zu sehen",
    invalidCountry: "Bitte wählen Sie ein gültiges Land aus der Liste",
  },
};

// --- 2. HELPERS (Optimized & Robust) ---

const getGenus = (scientificName) =>
  scientificName ? scientificName.split(" ")[0] : "Unknown";

const formatCommonName = (name) => {
  if (!name) return "Unknown";
  const cleaned = name.replace(/-/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const parseAncestry = (item) => {
  let order = "Unknown Order";
  let family = "Unknown Family";
  let genus = null;
  let genusId = null;
  let familyId = null;

  if (item.ancestors && Array.isArray(item.ancestors)) {
    const orderObj = item.ancestors.find((a) => a.rank === "order");
    const familyObj = item.ancestors.find((a) => a.rank === "family");
    const genusObj = item.ancestors.find((a) => a.rank === "genus");

    if (orderObj) order = orderObj.name;
    if (familyObj) {
      family = familyObj.name;
      familyId = familyObj.id;
    }
    if (genusObj) {
      genus = genusObj.name;
      genusId = genusObj.id;
    }
  }

  // Fallback: If API didn't provide ancestors, try to guess Genus from scientific name
  if (!genus && item.name) {
    genus = item.name.split(" ")[0];
  }

  return { order, family, genus, genusId, familyId };
};

// FIX: Safer API handling with try/catch to prevent 'message is read-only' crash
const searchRemoteTaxa = async (query, locale = "en", signal = null) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(
      `${INAT_API_BASE}/taxa?q=${encodeURIComponent(
        query
      )}&rank=species&is_active=true&per_page=30&locale=${locale}`,
      { signal }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.results
      .filter((item) => item.observations_count > 0)
      .map((item) => ({
        id: item.id,
        scientific_name: item.name,
        common_name: item.preferred_common_name || item.name,
        rank: item.rank,
        observations: item.observations_count,
        iconic: item.iconic_taxon_name || "Unknown",
        image: item.default_photo
          ? item.default_photo.medium_url || item.default_photo.square_url
          : null,
        ...parseAncestry(item),
      }));
  } catch (error) {
    if (error.name !== "AbortError")
      console.log("Search error - check network");
    return [];
  }
};

const fetchTaxonDetails = async (taxonId, locale = "en") => {
  try {
    const response = await fetch(
      `${INAT_API_BASE}/taxa/${taxonId}?locale=${locale}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.log("Details error - check network");
    return null;
  }
};

const fetchTaxonChildrenCount = async (
  taxonId,
  taxonName = null,
  rank = "family"
) => {
  try {
    let effectiveId = taxonId;
    if (!effectiveId && taxonName) {
      const searchRes = await fetch(
        `${INAT_API_BASE}/taxa?q=${encodeURIComponent(
          taxonName
        )}&rank=${rank}&per_page=1`
      );
      const searchData = await searchRes.json();
      effectiveId = searchData.results?.[0]?.id;
    }
    if (!effectiveId) return null;

    const response = await fetch(
      `${INAT_API_BASE}/taxa?taxon_id=${effectiveId}&rank=species&per_page=0`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.total_results || 0;
  } catch (error) {
    console.log("Count fetch error - check network");
    return null;
  }
};

// Enhanced CSV Generation with proper quote escaping
const generateCSV = (collection) => {
  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    if (
      stringField.includes(",") ||
      stringField.includes('"') ||
      stringField.includes("\n")
    ) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const headers = [
    "uuid",
    "taxon_id",
    "scientific_name",
    "common_name",
    "iconic_group",
    "order",
    "family",
    "genus",
    "genus_total",
    "note",
    "countries",
    "image_url",
  ];

  const rows = collection.map((item) => [
    escapeCSVField(item.uuid),
    escapeCSVField(item.taxonId),
    escapeCSVField(item.scientificName),
    escapeCSVField(item.commonName),
    escapeCSVField(item.iconicGroup || "Unknown"),
    escapeCSVField(item.order || ""),
    escapeCSVField(item.family || ""),
    escapeCSVField(item.genus || "Unknown"),
    escapeCSVField(item.genusTotal || 0),
    escapeCSVField(item.note || ""),
    escapeCSVField((item.countries || []).join("|")),
    escapeCSVField(item.image || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
};

// Enhanced CSV Parser with proper quote handling
const parseCSV = (text) => {
  const parseCSVRow = (line) => {
    const result = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const lines = text.split("\n");
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    try {
      const cols = parseCSVRow(lines[i]);

      if (cols.length >= 6) {
        const countryStr = cols[10] ? cols[10].replace(/"/g, "") : "";

        items.push({
          uuid: cols[0],
          taxonId: parseInt(cols[1]) || 0,
          scientificName: cols[2],
          commonName: cols[3],
          iconicGroup: cols[4],
          order: cols[5] || "Unknown",
          family: cols[6] || "Unknown",
          genus: cols[7] || getGenus(cols[2]),
          genusTotal: parseInt(cols[8]) || 5,
          note: cols[9] || "",
          countries: countryStr ? countryStr.split("|").filter(Boolean) : [],
          image: cols[11] || null,
          dateObserved: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn(`Failed to parse CSV row ${i}:`, error);
      continue;
    }
  }

  return items;
};

// Utility: Check if genus is complete
const isGenusComplete = (genus, genusTotal, speciesCount) => {
  return genusTotal > 0 && speciesCount >= genusTotal;
};

// Utility: Calculate collection statistics
const calculateCollectionStats = (collection) => {
  const stats = {
    totalSpecies: collection.length,
    uniqueTaxa: new Set(collection.map((c) => c.taxonId)).size,
    uniqueCountries: new Set(collection.flatMap((c) => c.countries || [])).size,
    uniqueGenera: new Set(collection.map((c) => c.genus || "Unknown")).size,
    uniqueOrders: new Set(collection.map((c) => c.order || "Unknown")).size,
    uniqueFamilies: new Set(collection.map((c) => c.family || "Unknown")).size,
  };

  return stats;
};

// Utility: Get all unique countries from collection
const getUniqueCountries = (collection) => {
  const countries = new Set();
  collection.forEach((item) => {
    if (item.countries && Array.isArray(item.countries)) {
      item.countries.forEach((c) => countries.add(c));
    }
  });
  return Array.from(countries).sort();
};

// Utility: Filter collection by group
const filterCollectionByGroup = (collection, group) => {
  return collection.filter(
    (item) =>
      item.iconicGroup === group ||
      (GLOBAL_SPECIES_ESTIMATES[group] &&
        item.iconicGroup === GLOBAL_SPECIES_ESTIMATES[group].label)
  );
};

// Utility: Filter collection by country
const filterCollectionByCountry = (collection, country) => {
  if (country === "All") return collection;
  return collection.filter(
    (item) => item.countries && item.countries.includes(country)
  );
};

// Utility: Search collection with multiple criteria
const searchCollection = (collection, searchTerm, filterCriteria = {}) => {
  if (!searchTerm && Object.keys(filterCriteria).length === 0) {
    return collection;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return collection.filter((item) => {
    // Apply text search
    const matchesText =
      !searchTerm ||
      (item.commonName &&
        item.commonName.toLowerCase().includes(lowerSearchTerm)) ||
      (item.scientificName &&
        item.scientificName.toLowerCase().includes(lowerSearchTerm)) ||
      (item.family && item.family.toLowerCase().includes(lowerSearchTerm)) ||
      (item.order && item.order.toLowerCase().includes(lowerSearchTerm));

    if (!matchesText) return false;

    // Apply filter criteria
    if (filterCriteria.group && item.iconicGroup !== filterCriteria.group) {
      return false;
    }

    if (
      filterCriteria.country &&
      filterCriteria.country !== "All" &&
      (!item.countries || !item.countries.includes(filterCriteria.country))
    ) {
      return false;
    }

    if (filterCriteria.family && item.family !== filterCriteria.family) {
      return false;
    }

    return true;
  });
};

// Utility: Build taxonomy tree from collection
const buildTaxonomyTree = (collection) => {
  const tree = {};

  collection.forEach((item) => {
    const order = item.order || "Unclassified";
    const family = item.family || "Unclassified";
    const genus = item.genus || "Unclassified";

    if (!tree[order]) tree[order] = {};
    if (!tree[order][family]) tree[order][family] = {};
    if (!tree[order][family][genus]) tree[order][family][genus] = [];

    // Avoid duplicates
    if (!tree[order][family][genus].some((s) => s.uuid === item.uuid)) {
      tree[order][family][genus].push(item);
    }
  });

  return tree;
};

// Utility: Validate if taxon data is complete
const isTaxonDataComplete = (taxon) => {
  return (
    taxon &&
    taxon.id &&
    taxon.scientific_name &&
    taxon.common_name &&
    taxon.iconic &&
    taxon.order &&
    taxon.family &&
    taxon.genus
  );
};

// Utility: Format date for display
const formatDateObserved = (dateString, locale = "en") => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
};

// Utility: Batch fetch taxa details with caching
const batchFetchTaxaDetails = async (
  taxonIds,
  locale = "en",
  cacheDuration = 3600000
) => {
  const cache = new Map();
  const cacheKey = `taxa_details_${locale}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < cacheDuration) {
        return parsed.data;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const uniqueIds = [...new Set(taxonIds)];
  const chunkSize = 30;
  const results = {};

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);

    try {
      const response = await fetch(
        `${INAT_API_BASE}/taxa/${chunk.join(",")}?locale=${locale}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results) {
          data.results.forEach((taxon) => {
            results[taxon.id] = taxon;
          });
        }
      }
    } catch (error) {
      console.log("Batch fetch error:", error);
    }
  }

  // Cache the results
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data: results,
      timestamp: Date.now(),
    })
  );

  return results;
};

// Utility: Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

// Utility: Validate country name
const isValidCountry = (countryName) => {
  return COUNTRIES.includes(countryName);
};

// Utility: Get common name or fallback to scientific name
const getDisplayName = (item, preference = "common") => {
  if (preference === "common" && item.commonName) {
    return formatCommonName(item.commonName);
  }
  return item.scientificName || item.scientific_name || "Unknown";
};

// --- 3. COMPONENTS ---

const Toast = ({ message, onClose, type = "success" }) => (
  <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 whitespace-nowrap">
    {type === "loading" ? (
      <Loader className="w-5 h-5 text-emerald-400 animate-spin" />
    ) : (
      <CheckCircle className="w-5 h-5 text-emerald-400" />
    )}
    <span className="font-medium text-sm">{message}</span>
  </div>
);

const CountryTag = ({ name, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
    {name}
    {onRemove && (
      <button onClick={() => onRemove(name)} className="hover:text-indigo-900">
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

const FilterChip = ({ label, active, onClick, color, count }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
      active
        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
        : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300"
    }`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[9px] ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const TaxonCard = ({ taxon, onObserve, inCollection, featured = false, t }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative group transition-all ${
      featured
        ? "h-auto ring-4 ring-emerald-500/20 shadow-lg"
        : "h-full hover:shadow-md"
    }`}
  >
    <div
      className={`${featured ? "h-64 md:h-80" : "h-40"} bg-slate-100 relative`}
    >
      {taxon.image ? (
        <img
          src={taxon.image}
          alt={taxon.common_name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
          <Leaf className="w-12 h-12 opacity-20" />
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
        <h3
          className={`font-bold text-white truncate shadow-sm ${
            featured ? "text-2xl" : "text-base"
          }`}
        >
          {formatCommonName(taxon.common_name || taxon.scientific_name)}
        </h3>
        <p className="text-xs text-slate-200 italic">{taxon.scientific_name}</p>
      </div>
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
        {taxon.iconic || "Species"}
      </div>
      {featured && (
        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
          <Sparkles className="w-3 h-3" /> {t.discover}
        </div>
      )}
    </div>
    <div className="p-3 flex items-center justify-between gap-3 mt-auto">
      <div className="text-xs text-slate-500">
        <span className="font-semibold">
          {taxon.observations.toLocaleString()}
        </span>{" "}
        obs
      </div>
      {inCollection ? (
        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
          <MapPin className="w-3 h-3" />
          {t.added.toUpperCase()}
        </div>
      ) : (
        <button
          onClick={() => onObserve(taxon)}
          className={`flex-1 py-2 ${
            featured
              ? "bg-emerald-600 hover:bg-emerald-700 text-sm"
              : "bg-slate-900 hover:bg-slate-700 text-xs"
          } text-white rounded-lg font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2`}
        >
          <Camera className="w-3 h-3" />
          {featured ? t.addCollection : "Observe"}
        </button>
      )}
    </div>
  </div>
);

const CollectionItem = ({ item, onRequestDelete, onEdit }) => {
  const [showCountries, setShowCountries] = useState(false);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative h-full group hover:z-30">
      {/* Edit/Delete Buttons */}
      <div className="absolute top-3 right-3 flex gap-1 z-10 bg-white/80 backdrop-blur-sm rounded-lg pl-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors"
          aria-label="Edit observation"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(item);
          }}
          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
          aria-label="Delete observation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative">
          {item.image ? (
            <img
              src={item.image}
              alt={item.commonName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Leaf className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="pr-16">
            <h4 className="font-bold text-slate-800 text-base leading-snug break-words">
              {formatCommonName(item.commonName)}
            </h4>
            <p className="text-xs text-slate-500 italic mt-0.5 break-words">
              {item.scientificName}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded tracking-wide">
              {item.iconicGroup}
            </span>

            {item.countries && item.countries.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setShowCountries(true)}
                onMouseLeave={() => setShowCountries(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCountries(!showCountries);
                }}
              >
                <button
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-indigo-100 transition-colors"
                  aria-label={`Observed in ${item.countries.length} locations`}
                >
                  <Globe className="w-3 h-3" /> {item.countries.length}
                </button>

                {showCountries && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Locations
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                        {item.countries.length}
                      </span>
                    </div>
                    <ul className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
                      {item.countries.map((c) => (
                        <li
                          key={c}
                          className="text-xs text-slate-700 font-medium flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="truncate">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {item.note && (
            <p className="text-sm text-slate-600 mt-2 italic border-l-2 border-slate-200 pl-2 line-clamp-1">
              "{item.note}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CompletedGeneraView = ({ completedList, t }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const availableGroups = useMemo(() => {
    const groups = new Set(
      completedList.map((data) => data.species[0]?.iconicGroup).filter(Boolean)
    );
    return Array.from(groups).sort();
  }, [completedList]);

  const filteredList = useMemo(() => {
    if (activeFilter === "All") return completedList;
    return completedList.filter(
      (data) => data.species[0]?.iconicGroup === activeFilter
    );
  }, [completedList, activeFilter]);

  if (completedList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-64 opacity-60 animate-in fade-in">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-700 text-lg">
          No Completed Genera Yet
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mt-2">
          Collect every species within a specific genus to unlock a trophy here!
        </p>
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
          <p className="text-xs text-yellow-700">
            You have completed <strong>{completedList.length}</strong> full
            genera!
          </p>
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
            <div
              key={data.genus}
              className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-default"
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                  alt={data.genus}
                />
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
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Completed
                    </span>
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
        <p className="text-sm text-yellow-700 mt-1">
          Unlock badges by exploring nature!
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TROPHIES_DATA.map((badge) => {
          const uniqueCountries = new Set(
            collection.flatMap((o) => o.countries || [])
          ).size;
          let current = 0;
          let total = badge.threshold || badge.countryThreshold;
          let unlocked = false;
          if (badge.countryThreshold) {
            current = uniqueCountries;
            unlocked = current >= total;
          } else if (badge.family) {
            current = collection.filter(
              (o) =>
                o.iconicGroup === badge.family ||
                o.family === badge.family ||
                o.order === badge.family
            ).length;
            unlocked = current >= total;
          } else {
            current = collection.length;
            unlocked = current >= total;
          }
          const progress = Math.min(100, (current / total) * 100);
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all relative overflow-hidden ${
                unlocked
                  ? "bg-white border-yellow-400 shadow-lg"
                  : "bg-slate-50 border-slate-200 opacity-60 grayscale"
              }`}
            >
              <div className="text-4xl mb-2 filter drop-shadow-sm">
                {badge.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                {badge.title}
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">{badge.desc}</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-auto">
                <div
                  className={`h-full transition-all duration-1000 ${
                    unlocked ? "bg-yellow-400" : "bg-slate-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[9px] font-bold text-slate-400 mt-1">
                {current} / {total}
              </div>
              {unlocked && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-8 h-8 bg-yellow-400 blur-xl opacity-50"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GroupBox = ({ group, count, onClick, t }) => {
  const config = GLOBAL_SPECIES_ESTIMATES[group] || {
    color: "bg-slate-500",
    border: "border-slate-200",
    text: "text-slate-700",
    label: group,
  };
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 ${config.border} bg-white hover:shadow-md transition-all text-left flex flex-col h-28 justify-between overflow-hidden group`}
      aria-label={`View ${config.label} species`}
    >
      <div
        className={`absolute top-0 right-0 p-2 rounded-bl-xl ${config.color} bg-opacity-10`}
      >
        <Layers className={`w-5 h-5 ${config.text}`} />
      </div>
      <span className={`text-3xl font-bold ${config.text}`}>{count}</span>
      <span className="font-bold text-slate-600 text-sm uppercase tracking-wide">
        {config.label}
      </span>
    </button>
  );
};

const StatBar = ({ label, count, total, colorClass }) => {
  const percentage = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
        <span className="font-bold">{label}</span>
        <div className="flex gap-1">
          <span className="text-emerald-700 font-bold">
            {count.toLocaleString()}
          </span>
          {total && (
            <span className="text-slate-400">/ {total.toLocaleString()}</span>
          )}
          {total && (
            <span className="text-slate-400 text-[10px]">({percentage}%)</span>
          )}
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
        <div
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${total ? (count / total) * 100 : 0}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

const GlobalStatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  textColor,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 ${
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    }`}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
  >
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-10`}
    >
      <Icon
        className={`w-6 h-6 ${textColor || color.replace("bg-", "text-")}`}
      />
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </div>
      {subtext && (
        <div className="text-[10px] text-slate-400 mt-0.5">{subtext}</div>
      )}
    </div>
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  isLoading,
  loadingText,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md sm:max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Loading Overlay inside Modal */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col">
            <Loader className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
            <span className="text-xs font-bold text-emerald-700">
              {loadingText}
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="font-bold text-lg text-slate-800" id="modal-title">
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const DrillDownView = ({ group, data, onBack, t }) => {
  const taxonomyTree = useMemo(() => {
    const tree = {};
    data.forEach((item) => {
      const order = item.order || "Unclassified";
      const family = item.family || "Unclassified";
      if (!tree[order]) tree[order] = {};
      if (!tree[order][family]) tree[order][family] = [];
      tree[order][family].push(item);
    });
    return tree;
  }, [data]);

  const [openOrder, setOpenOrder] = useState(null);
  const [openFamily, setOpenFamily] = useState(null);
  const [missingCounts, setMissingCounts] = useState({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  useEffect(() => {
    const fetchMissing = async () => {
      setIsLoadingCounts(true);
      const familiesToFetch = new Set();
      Object.values(taxonomyTree).forEach((families) => {
        Object.entries(families).forEach(([familyName, speciesList]) => {
          if (!speciesList[0].familyTotal && !missingCounts[familyName]) {
            familiesToFetch.add(familyName);
          }
        });
      });
      for (const familyName of familiesToFetch) {
        const count = await fetchTaxonChildrenCount(null, familyName, "family");
        if (count)
          setMissingCounts((prev) => ({ ...prev, [familyName]: count }));
      }
      setIsLoadingCounts(false);
    };
    fetchMissing();
  }, [taxonomyTree]);

  return (
    <div className="absolute inset-0 bg-slate-50 z-20 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="font-bold text-lg text-slate-800">
          {group} {t.breakdown}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Object.entries(taxonomyTree).map(([order, families]) => (
          <div
            key={order}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <button
              onClick={() => setOpenOrder(openOrder === order ? null : order)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              aria-expanded={openOrder === order}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {Object.values(families).reduce(
                    (acc, arr) => acc + arr.length,
                    0
                  )}
                </div>
                <span className="font-bold text-slate-700">{order}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openOrder === order ? "rotate-180" : ""
                }`}
              />
            </button>
            {openOrder === order && (
              <div className="bg-slate-50 border-t border-slate-100 p-2 space-y-2">
                {Object.entries(families).map(([family, species]) => {
                  const savedTotal = species[0].familyTotal;
                  const liveTotal = missingCounts[family];
                  const total = savedTotal || liveTotal;
                  const count = species.length;
                  const isComplete = total && count >= total;
                  return (
                    <div
                      key={family}
                      className="bg-white rounded-lg border border-slate-200 p-3"
                    >
                      <button
                        onClick={() =>
                          setOpenFamily(openFamily === family ? null : family)
                        }
                        className="w-full flex justify-between items-center mb-2"
                        aria-expanded={openFamily === family}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {family}
                          </span>
                          {total ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isComplete
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              {count} / {total.toLocaleString()}{" "}
                              {isComplete && "🏆"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                              {count} collected{" "}
                              {isLoadingCounts && (
                                <Loader className="w-2 h-2 animate-spin ml-1 text-slate-400" />
                              )}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-3 h-3 text-slate-300 transition-transform ${
                            openFamily === family ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openFamily === family && (
                        <div className="space-y-2 pl-2 border-l-2 border-slate-100">
                          {species.map((s) => (
                            <div
                              key={s.uuid}
                              className="flex items-center gap-3 py-1"
                            >
                              {s.image ? (
                                <img
                                  src={s.image}
                                  className="w-8 h-8 rounded object-cover bg-slate-200"
                                  alt={s.commonName}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                  <Leaf className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-700 leading-none truncate">
                                  {formatCommonName(s.commonName)}
                                </div>
                                <div className="text-[10px] text-slate-400 italic truncate">
                                  {s.scientificName}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyStateMessage = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center mt-20 opacity-60 animate-in fade-in">
    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
      <Icon className="w-10 h-10 text-slate-400" />
    </div>
    <h3 className="font-bold text-slate-700 text-lg">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mt-2">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

const LoadingSpinner = ({ message, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader
        className={`${sizeClasses[size]} text-emerald-500 animate-spin`}
      />
      {message && (
        <span className="text-xs font-bold text-slate-600">{message}</span>
      )}
    </div>
  );
};

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDangerous = false,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title}>
    <div className="text-center space-y-4">
      <div
        className={`w-16 h-16 ${
          isDangerous ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
        } rounded-full flex items-center justify-center mx-auto`}
      >
        {isDangerous ? (
          <AlertTriangle className="w-8 h-8" />
        ) : (
          <Info className="w-8 h-8" />
        )}
      </div>
      <p className="text-slate-600">{message}</p>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={onCancel}
          className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`py-3 ${
            isDangerous
              ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
          } text-white rounded-xl font-bold transition-colors`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

// --- 4. MAIN APP COMPONENT ---

export default function App() {
  // ===== STATE =====
  const [userCollection, setUserCollection] = useState(() => {
    const saved = localStorage.getItem("bioguide_collection");
    return saved ? JSON.parse(saved) : [];
  });

  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem("bioguide_locale");
    return saved || "en";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("bioguide_darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [selectedTaxon, setSelectedTaxon] = useState(null);
  const [observationCountries, setObservationCountries] = useState([]);
  const [countryInput, setCountryInput] = useState("");
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [observationNote, setObservationNote] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [currentView, setCurrentView] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedGeneraList, setCompletedGeneraList] = useState([]);
  const [hasTranslated, setHasTranslated] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [currentTranslationLocale, setCurrentTranslationLocale] =
    useState(locale);

  // ===== TRANSLATIONS =====
  const t = useMemo(() => TRANSLATIONS[locale] || TRANSLATIONS.en, [locale]);

  // ===== PERSIST DATA =====
  useEffect(() => {
    localStorage.setItem("bioguide_collection", JSON.stringify(userCollection));
  }, [userCollection]);

  useEffect(() => {
    localStorage.setItem("bioguide_locale", locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem("bioguide_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // ===== AUTO-TRANSLATE COLLECTION =====
  useEffect(() => {
    if (
      userCollection.length === 0 ||
      hasTranslated ||
      locale === currentTranslationLocale
    ) {
      return;
    }

    const translateCollection = async () => {
      setToastMessage(t.translating);
      setToastType("loading");
      const controller = new AbortController();

      try {
        const translated = await Promise.all(
          userCollection.map(async (item) => {
            const details = await fetchTaxonDetails(item.taxonId, locale);
            if (details) {
              return {
                ...item,
                commonName: details.preferred_common_name || item.commonName,
                scientificName: details.name || item.scientificName,
              };
            }
            return item;
          })
        );

        setUserCollection(translated);
        setHasTranslated(true);
        setCurrentTranslationLocale(locale);
        setToastMessage(t.translationComplete);
        setToastType("success");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Translation error:", error);
          setToastMessage(t.translationError);
          setToastType("error");
        }
      }

      return () => controller.abort();
    };

    const timer = setTimeout(translateCollection, 500);
    return () => clearTimeout(timer);
  }, [
    locale,
    userCollection.length,
    hasTranslated,
    t,
    currentTranslationLocale,
  ]);

  // ===== SEARCH FUNCTIONALITY =====
  useEffect(() => {
    if (searchQuery.length < 2) {
      setApiResults([]);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    const performSearch = async () => {
      const results = await searchRemoteTaxa(
        searchQuery,
        locale,
        controller.signal
      );
      setApiResults(results);
      setIsSearching(false);
    };

    const timerId = setTimeout(performSearch, 600);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [searchQuery, locale]);

  // ===== COUNTRY SUGGESTIONS =====
  useEffect(() => {
    if (countryInput.length < 1) {
      setCountrySuggestions([]);
      return;
    }

    const filtered = COUNTRIES.filter(
      (c) =>
        c.toLowerCase().includes(countryInput.toLowerCase()) &&
        !observationCountries.includes(c)
    ).slice(0, 5);

    setCountrySuggestions(filtered);
  }, [countryInput, observationCountries]);

  // ===== CALCULATE COMPLETED GENERA =====
  useEffect(() => {
    const calculateCompleted = async () => {
      const generaMap = {};

      for (const item of userCollection) {
        const genus = item.genus || "Unknown";
        if (!generaMap[genus]) {
          generaMap[genus] = {
            genus,
            species: [],
            total: item.genusTotal || 0,
          };
        }
        generaMap[genus].species.push(item);
      }

      const completed = [];

      for (const [genus, data] of Object.entries(generaMap)) {
        let total = data.total;

        if (!total || total === 0) {
          total = await fetchTaxonChildrenCount(null, genus, "genus");
        }

        if (total && data.species.length >= total) {
          completed.push({
            genus,
            species: data.species,
            count: data.species.length,
            total: total || data.species.length,
          });
        }
      }

      setCompletedGeneraList(completed.sort((a, b) => b.count - a.count));
    };

    calculateCompleted();
  }, [userCollection]);

  // ===== HANDLERS =====
  const handleAddObservation = async () => {
    if (!selectedTaxon || observationCountries.length === 0) {
      setToastMessage(t.selectCountries);
      setToastType("error");
      return;
    }

    const newObservation = {
      uuid: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taxonId: selectedTaxon.id,
      scientificName: selectedTaxon.scientific_name,
      commonName: selectedTaxon.common_name,
      iconicGroup: selectedTaxon.iconic,
      order: selectedTaxon.order || "Unknown",
      family: selectedTaxon.family || "Unknown",
      genus: selectedTaxon.genus || getGenus(selectedTaxon.scientific_name),
      genusTotal: selectedTaxon.genusTotal || 0,
      note: observationNote,
      countries: observationCountries,
      image: selectedTaxon.image || null,
      dateObserved: new Date().toISOString(),
    };

    // Check for duplicates
    const isDuplicate = userCollection.some(
      (item) =>
        item.taxonId === selectedTaxon.id &&
        JSON.stringify(item.countries.sort()) ===
          JSON.stringify(observationCountries.sort())
    );

    if (isDuplicate) {
      setToastMessage(t.alreadyObserved);
      setToastType("error");
      return;
    }

    setUserCollection([...userCollection, newObservation]);
    setToastMessage(`${t.addedSpecies} ${selectedTaxon.common_name}`);
    setToastType("success");

    // Reset form
    resetForm();
    setShowModal(false);
  };

  const handleEditObservation = (updatedItem) => {
    setUserCollection(
      userCollection.map((item) =>
        item.uuid === updatedItem.uuid ? updatedItem : item
      )
    );
    setToastMessage(t.observationUpdated);
    setToastType("success");
    setEditingItem(null);
  };

  const handleDeleteObservation = (item) => {
    setUserCollection(userCollection.filter((i) => i.uuid !== item.uuid));
    setToastMessage(t.observationDeleted);
    setToastType("success");
    setShowDeleteConfirm(null);
  };

  const handleObserveClick = (taxon) => {
    setSelectedTaxon(taxon);
    resetForm();
    setShowModal(true);
    setEditingItem(null);
  };

  const handleEditClick = (item) => {
    setSelectedTaxon({
      id: item.taxonId,
      scientific_name: item.scientificName,
      common_name: item.commonName,
      iconic: item.iconicGroup,
      order: item.order,
      family: item.family,
      genus: item.genus,
      image: item.image,
    });
    setObservationCountries(item.countries || []);
    setObservationNote(item.note || "");
    setEditingItem(item);
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedTaxon(null);
    setObservationCountries([]);
    setCountryInput("");
    setCountrySuggestions([]);
    setObservationNote("");
    setSearchQuery("");
    setApiResults([]);
    setEditingItem(null);
  };

  const handleAddCountry = (name) => {
    const c = (name || countryInput.trim()).trim();
    if (c && isValidCountry(c) && !observationCountries.includes(c)) {
      setObservationCountries([...observationCountries, c]);
      setCountryInput("");
      setCountrySuggestions([]);
    } else if (c && !isValidCountry(c)) {
      setToastMessage(t.invalidCountry);
      setToastType("error");
    }
  };

  const handleRemoveCountry = (country) => {
    setObservationCountries(observationCountries.filter((c) => c !== country));
  };

  const handleExportCSV = () => {
    const csv = generateCSV(userCollection);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bioguide_collection_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(t.exportedSuccessfully);
    setToastType("success");
  };

  const handleImportCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const imported = parseCSV(csv);
        const newItems = imported.filter(
          (item) =>
            !userCollection.some((existing) => existing.uuid === item.uuid)
        );
        setUserCollection([...userCollection, ...newItems]);
        setToastMessage(`${t.imported} ${newItems.length} ${t.observations}`);
        setToastType("success");
      } catch (error) {
        console.log("Import error:", error);
        setToastMessage(t.importError);
        setToastType("error");
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(userCollection, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bioguide_collection_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(t.exportedSuccessfully);
    setToastType("success");
  };

  // ===== COMPUTED VALUES =====
  const stats = useMemo(
    () => calculateCollectionStats(userCollection),
    [userCollection]
  );

  const filteredCollection = useMemo(() => {
    let result = userCollection;

    if (filterCountry !== "All") {
      result = result.filter(
        (item) => item.countries && item.countries.includes(filterCountry)
      );
    }

    if (filterGroup !== "All") {
      result = result.filter((item) => item.iconicGroup === filterGroup);
    }

    if (searchText) {
      result = searchCollection(result, searchText);
    }

    return result;
  }, [userCollection, filterCountry, filterGroup, searchText]);

  const groupedData = useMemo(() => {
    const groups = {};
    userCollection.forEach((item) => {
      const group = item.iconicGroup || "Unknown";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    return groups;
  }, [userCollection]);

  const featuredTaxon = useMemo(() => {
    return apiResults.length > 0 ? apiResults[0] : null;
  }, [apiResults]);

  const uniqueCountries = useMemo(
    () => getUniqueCountries(userCollection),
    [userCollection]
  );

  // ===== RENDER =====
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="font-extrabold text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
                BioGuide
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Selector */}
              <select
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value);
                  setHasTranslated(false);
                }}
                className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                aria-label="Select language"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="de">DE</option>
              </select>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Menu Button */}
              <div className="relative group">
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-700 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <button
                    onClick={() => {
                      setCurrentView("home");
                      setActiveGroup(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" /> {t.home}
                  </button>
                  <button
                    onClick={() => setCurrentView("collection")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <BarChart2 className="w-4 h-4" /> {t.myCollection}
                  </button>
                  <button
                    onClick={() => setCurrentView("discover")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4" /> {t.discover}
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-600 my-2"></div>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> {t.exportCSV}
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> {t.exportJSON}
                  </button>
                  <label className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> {t.importCSV}
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImportCSV(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      aria-label="Import CSV file"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
          {/* HOME VIEW */}
          {currentView === "home" && !activeGroup && (
            <div className="animate-in slide-in-from-right duration-300 space-y-8">
              {/* SEARCH SECTION */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Search className="w-6 h-6 text-emerald-600" />
                  {t.searchSpecies}
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium"
                    aria-label="Search for species"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="mt-6">
                    <LoadingSpinner message={t.searching} />
                  </div>
                )}

                {!isSearching && apiResults.length > 0 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {apiResults.map((taxon, idx) => (
                        <TaxonCard
                          key={`${taxon.id}-${idx}`}
                          taxon={taxon}
                          onObserve={handleObserveClick}
                          inCollection={userCollection.some(
                            (i) => i.taxonId === taxon.id
                          )}
                          featured={idx === 0}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!isSearching &&
                  searchQuery.length >= 2 &&
                  apiResults.length === 0 && (
                    <EmptyStateMessage
                      icon={Search}
                      title={t.noResults}
                      description={t.tryDifferent}
                    />
                  )}
              </div>

              {/* QUICK STATS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlobalStatCard
                  label={t.totalSpecies}
                  value={stats.totalSpecies.toLocaleString()}
                  icon={Leaf}
                  color="bg-emerald-500"
                />
                <GlobalStatCard
                  label={t.countries}
                  value={stats.uniqueCountries.toLocaleString()}
                  icon={Globe}
                  color="bg-blue-500"
                />
                <GlobalStatCard
                  label={t.genera}
                  value={stats.uniqueGenera.toLocaleString()}
                  icon={Layers}
                  color="bg-purple-500"
                />
                <GlobalStatCard
                  label={t.families}
                  value={stats.uniqueFamilies.toLocaleString()}
                  icon={BookOpen}
                  color="bg-orange-500"
                />
              </div>

              {/* BROWSE BY GROUP */}
              {Object.keys(GLOBAL_SPECIES_ESTIMATES).length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Grid className="w-6 h-6 text-emerald-600" />
                    {t.browseByGroup}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Object.entries(GLOBAL_SPECIES_ESTIMATES).map(
                      ([key, config]) => (
                        <GroupBox
                          key={key}
                          group={key}
                          count={groupedData[key]?.length || 0}
                          onClick={() => {
                            setActiveGroup(key);
                          }}
                          t={t}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* COMPLETED GENERA */}
              {completedGeneraList.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    {t.completedGenera}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {completedGeneraList.slice(0, 6).map((data) => {
                      const coverImage = data.species.find(
                        (s) => s.image
                      )?.image;
                      return (
                        <div
                          key={data.genus}
                          className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer"
                          onClick={() => setShowCompletedModal(true)}
                        >
                          {coverImage ? (
                            <img
                              src={coverImage}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                              alt={data.genus}
                            />
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
                            <div>
                              <div className="flex items-center gap-1 text-yellow-400 mb-1">
                                <Sparkles className="w-3 h-3 fill-yellow-400" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">
                                  {t.completed}
                                </span>
                              </div>
                              <h3 className="text-lg font-extrabold text-white italic tracking-tight leading-none drop-shadow-md">
                                {data.genus}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {completedGeneraList.length > 6 && (
                    <button
                      onClick={() => setShowCompletedModal(true)}
                      className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                    >
                      {t.viewAll} ({completedGeneraList.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUP VIEW */}
          {activeGroup && (
            <div className="animate-in slide-in-from-right duration-300 space-y-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveGroup(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold">{activeGroup}</h1>
                  <p className="text-sm text-slate-500">
                    {groupedData[activeGroup]?.length || 0} {t.observations}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {(groupedData[activeGroup] || []).map((item) => (
                    <CollectionItem
                      key={item.uuid}
                      item={item}
                      onRequestDelete={(item) => setShowDeleteConfirm(item)}
                      onEdit={handleEditClick}
                    />
                  ))}
                </div>
                {(groupedData[activeGroup] || []).length === 0 && (
                  <EmptyStateMessage
                    icon={Leaf}
                    title={t.noObservations}
                    description={t.startCollecting}
                  />
                )}
              </div>
            </div>
          )}

          {/* COLLECTION VIEW */}
          {currentView === "collection" && (
            <div className="animate-in slide-in-from-right duration-300 space-y-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart2 className="w-8 h-8 text-emerald-600" />
                {t.myCollection}
              </h1>

              {/* STATISTICS */}
              {userCollection.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h2 className="font-bold text-lg">{t.collectionStats}</h2>
                  <StatBar
                    label={t.totalSpecies}
                    count={stats.totalSpecies}
                    colorClass="bg-emerald-500"
                  />
                  <StatBar
                    label={t.countries}
                    count={stats.uniqueCountries}
                    colorClass="bg-blue-500"
                  />
                  <StatBar
                    label={t.genera}
                    count={stats.uniqueGenera}
                    colorClass="bg-purple-500"
                  />
                  <StatBar
                    label={t.orders}
                    count={stats.uniqueOrders}
                    colorClass="bg-orange-500"
                  />
                  <StatBar
                    label={t.families}
                    count={stats.uniqueFamilies}
                    colorClass="bg-pink-500"
                  />
                </div>
              )}

              {/* FILTERS */}
              {userCollection.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-4 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                      {t.filterByCountry}
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      <button
                        onClick={() => setFilterCountry("All")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          filterCountry === "All"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                        }`}
                      >
                        All
                      </button>
                      {uniqueCountries.map((country) => (
                        <button
                          key={country}
                          onClick={() => setFilterCountry(country)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            filterCountry === country
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                      {t.filterByGroup}
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      <button
                        onClick={() => setFilterGroup("All")}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          filterGroup === "All"
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                        }`}
                      >
                        All
                      </button>
                      {Object.keys(groupedData)
                        .sort()
                        .map((group) => (
                          <button
                            key={group}
                            onClick={() => setFilterGroup(group)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                              filterGroup === group
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                      {t.search}
                    </label>
                    <input
                      type="text"
                      placeholder={t.searchSpecies}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-emerald-500 outline-none"
                      aria-label="Search collection"
                    />
                  </div>
                </div>
              )}

              {/* COLLECTION ITEMS */}
              {userCollection.length > 0 ? (
                <div>
                  <div className="text-sm text-slate-500 mb-4">
                    {filteredCollection.length} / {userCollection.length}{" "}
                    {t.observations}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCollection.map((item) => (
                      <CollectionItem
                        key={item.uuid}
                        item={item}
                        onRequestDelete={(item) => setShowDeleteConfirm(item)}
                        onEdit={handleEditClick}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyStateMessage
                  icon={Search}
                  title={t.collectionEmpty}
                  description={t.startSearching}
                  action={
                    <button
                      onClick={() => setCurrentView("home")}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                    >
                      {t.startSearching}
                    </button>
                  }
                />
              )}
            </div>
          )}

          {/* DISCOVER VIEW */}
          {currentView === "discover" && (
            <div className="animate-in slide-in-from-right duration-300 space-y-8">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Compass className="w-8 h-8 text-emerald-600" />
                {t.discover}
              </h1>

              {/* Completed Genera */}
              <CompletedGeneraView completedList={completedGeneraList} t={t} />

              {/* Achievements */}
              <AchievementsView collection={userCollection} t={t} />
            </div>
          )}
        </main>

        {/* MODALS */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={
            editingItem
              ? `${t.editObservation} - ${selectedTaxon?.common_name || ""}`
              : `${t.addToCollection} - ${selectedTaxon?.common_name || ""}`
          }
        >
          <div className="space-y-4">
            {/* Taxon Info */}
            {selectedTaxon && (
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 flex gap-4">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden shrink-0">
                  {selectedTaxon.image ? (
                    <img
                      src={selectedTaxon.image}
                      alt={selectedTaxon.common_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Leaf className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    {formatCommonName(selectedTaxon.common_name)}
                  </h3>
                  <p className="italic text-slate-500 dark:text-slate-400">
                    {selectedTaxon.scientific_name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                      {selectedTaxon.iconic}
                    </span>
                    {selectedTaxon.family && (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                        {selectedTaxon.family}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Countries Section */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t.countriesObserved} *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCountry();
                    }
                  }}
                  placeholder={t.typeCountry}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-emerald-500 outline-none text-sm"
                  aria-label="Type country"
                />
                <button
                  onClick={() => handleAddCountry()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  {t.add}
                </button>
              </div>

              {countrySuggestions.length > 0 && (
                <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg flex flex-wrap gap-2">
                  {countrySuggestions.map((country) => (
                    <button
                      key={country}
                      onClick={() => handleAddCountry(country)}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 text-sm rounded-lg font-medium transition-colors"
                    >
                      {country}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {observationCountries.map((country) => (
                  <CountryTag
                    key={country}
                    name={country}
                    onRemove={handleRemoveCountry}
                  />
                ))}
              </div>
              {observationCountries.length === 0 && (
                <p className="text-xs text-red-500 mt-1">{t.selectCountries}</p>
              )}
            </div>

            {/* Note Section */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t.note}
              </label>
              <textarea
                value={observationNote}
                onChange={(e) => setObservationNote(e.target.value)}
                placeholder={t.addNote}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-emerald-500 outline-none text-sm resize-none"
                aria-label="Add observation note"
              />
              <div className="text-xs text-slate-400 mt-1">
                {observationNote.length}/500
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (editingItem) {
                    handleEditObservation({
                      ...editingItem,
                      countries: observationCountries,
                      note: observationNote,
                    });
                  } else {
                    handleAddObservation();
                  }
                }}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
              >
                {editingItem ? t.save : t.addObservation}
              </button>
            </div>
          </div>
        </Modal>

        {/* Completed Genera Modal */}
        <Modal
          isOpen={showCompletedModal}
          onClose={() => setShowCompletedModal(false)}
          title={`${t.trophyRoom} (${completedGeneraList.length})`}
        >
          <CompletedGeneraView completedList={completedGeneraList} t={t} />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!showDeleteConfirm}
          title={t.deleteObservation}
          message={`${t.confirmDelete} "${showDeleteConfirm?.commonName}"?`}
          confirmText={t.delete}
          cancelText={t.cancel}
          onConfirm={() => {
            if (showDeleteConfirm) {
              handleDeleteObservation(showDeleteConfirm);
            }
          }}
          onCancel={() => setShowDeleteConfirm(null)}
          isDangerous={true}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </div>
  );
}
