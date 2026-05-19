import { COLLECTION_STORAGE_KEY, LOCALE_STORAGE_KEY } from "../data/config";
import { getGenus } from "./api";

// Storage keys
export const STORAGE_KEYS = {
  COLLECTION: COLLECTION_STORAGE_KEY,
  LOCALE: LOCALE_STORAGE_KEY,
};

// Load collection from localStorage
export const loadCollection = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTION);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load collection:", error);
    return [];
  }
};

// Save collection to localStorage
export const saveCollection = (collection) => {
  try {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(collection));
    return true;
  } catch (error) {
    console.error("Failed to save collection:", error);
    return false;
  }
};

// Load locale from localStorage
export const loadLocale = () => {
  return localStorage.getItem(STORAGE_KEYS.LOCALE) || "en";
};

// Save locale to localStorage
export const saveLocale = (locale) => {
  localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
};

// CSV Export
export const generateCSV = (collection) => {
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
    "date_observed",
  ];

  const rows = collection.map((item) => [
    item.uuid || "",
    item.taxonId || "",
    `"${item.scientificName || ""}"`,
    `"${item.commonName || ""}"`,
    `"${item.iconicGroup || "Unknown"}"`,
    `"${item.order || ""}"`,
    `"${item.family || ""}"`,
    `"${item.genus || "Unknown"}"`,
    item.genusTotal || 0,
    `"${item.note || ""}"`,
    `"${(item.countries || []).join("|")}"`,
    `"${item.image || ""}"`,
    item.dateObserved || new Date().toISOString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  return csvContent;
};

// CSV Import
export const parseCSV = (text) => {
  const lines = text.split("\n").filter((line) => line.trim());
  const items = [];

  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles quoted fields)
    const cols = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        cols.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current);

    if (cols.length >= 6) {
      const countryStr = cols[10] ? cols[10].replace(/"/g, "") : "";
      const newItem = {
        uuid: cols[0]?.trim() || `uuid_${Date.now()}_${Math.random()}`,
        taxonId: parseInt(cols[1]) || 0,
        scientificName: cols[2]?.replace(/"/g, "").trim() || "Unknown",
        commonName: cols[3]?.replace(/"/g, "").trim() || "Unknown",
        iconicGroup: cols[4]?.replace(/"/g, "").trim() || "Unknown",
        order: cols[5]?.replace(/"/g, "").trim() || "Unknown",
        family: cols[6]?.replace(/"/g, "").trim() || "Unknown",
        genus:
          cols[7]?.replace(/"/g, "").trim() ||
          getGenus(cols[2]?.replace(/"/g, "")),
        genusTotal: parseInt(cols[8]) || 5,
        note: cols[9]?.replace(/"/g, "").trim() || "",
        countries: countryStr
          ? countryStr.split("|").map((c) => c.trim())
          : [],
        image: cols[11]?.replace(/"/g, "").trim() || null,
        dateObserved: cols[12]?.replace(/"/g, "").trim() || new Date().toISOString(),
      };
      items.push(newItem);
    }
  }

  return items;
};

// Download file utility
export const downloadFile = (content, filename, mimeType = "text/plain") => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Merge collections (for import)
export const mergeCollections = (existing, imported) => {
  const merged = [...existing];
  const existingIds = new Set(existing.map((item) => item.taxonId));

  imported.forEach((item) => {
    if (existingIds.has(item.taxonId)) {
      // Update existing item
      const index = merged.findIndex((m) => m.taxonId === item.taxonId);
      if (index !== -1) {
        merged[index] = { ...merged[index], ...item };
      }
    } else {
      // Add new item
      merged.push(item);
    }
  });

  return merged;
};
