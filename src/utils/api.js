import { INAT_API_BASE, IUCN_TOKEN_KEY } from "../data/config";

// Utility functions for string processing
export const getGenus = (scientificName) =>
  scientificName ? scientificName.split(" ")[0] : "Unknown";

export const formatCommonName = (name) => {
  if (!name) return "Unknown";
  const cleaned = name.replace(/-/g, " ");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Parse taxonomy data
export const parseAncestry = (item) => {
  let order = "Unknown Order";
  let family = "Unknown Family";
  let genus = null;
  let genusId = null;
  let familyId = null;

  if (item.ancestry) {
    const parts = item.ancestry.split("/").filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const taxonId = parseInt(parts[i]);
      if (item.ancestors) {
        const ancestor = item.ancestors.find((a) => a.id === taxonId);
        if (ancestor) {
          const rank = ancestor.rank?.toLowerCase();
          if (rank === "order" && order === "Unknown Order") {
            order = ancestor.name || order;
          } else if (rank === "family" && family === "Unknown Family") {
            family = ancestor.name || family;
            familyId = ancestor.id;
          } else if (rank === "genus" && !genus) {
            genus = ancestor.name;
            genusId = ancestor.id;
          }
        }
      }
    }
  }

  return { order, family, genus, genusId, familyId };
};

// IUCN status utilities
const iucnCache = new Map();

export const getIucnToken = () => localStorage.getItem(IUCN_TOKEN_KEY) || "";

export const saveIucnToken = (token) =>
  localStorage.setItem(IUCN_TOKEN_KEY, token);

export const clearIucnCache = () => iucnCache.clear();

export const fetchIUCNStatus = async (scientificName, token = null) => {
  if (!scientificName || !token) return null;
  if (iucnCache.has(scientificName))
    return iucnCache.get(scientificName);

  try {
    const response = await fetch(
      `https://www.sis.nrcs.usda.gov/api/v1/?scientific_name=${encodeURIComponent(
        scientificName
      )}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const status = data.results?.[0]?.assessment?.red_list_category || null;
    iucnCache.set(scientificName, status);
    return status;
  } catch (error) {
    console.error("IUCN fetch error:", error);
    return null;
  }
};

// iNaturalist API functions
export const searchRemoteTaxa = async (query, locale = "en", signal = null) => {
  try {
    const response = await fetch(
      `${INAT_API_BASE}/taxa/autocomplete?q=${encodeURIComponent(
        query
      )}&locale=${locale}&all_names=true`,
      { signal }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    return (
      data.results
        ?.filter(
          (t) =>
            t.rank === "species" &&
            t.default_photo &&
            (t.observations_count || 0) > 0
        )
        .map(t => ({
          id: t.id,
          name: t.name,
          scientific_name: t.name,
          common_name: t.preferred_common_name || t.name,
          iconic: t.iconic_taxon_name || "Species",
          observations: t.observations_count || 0,
          image: t.default_photo?.medium_url || null,
        }))
        .slice(0, 12) || []
    );
  } catch (error) {
    console.error("Taxa search error:", error);
    return [];
  }
};

export const fetchTaxonDetails = async (taxonId, locale = "en") => {
  try {
    const response = await fetch(`${INAT_API_BASE}/taxa/${taxonId}?locale=${locale}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error("Taxon details error:", error);
    return null;
  }
};

export const fetchTaxonChildrenCount = async (
  taxonId = null,
  familyName = null,
  rank = null
) => {
  try {
    let query = `${INAT_API_BASE}/taxa?`;

    if (taxonId && rank === "genus") {
      query += `parent_id=${taxonId}&rank=species`;
    } else if (familyName && rank === "family") {
      query += `family=${encodeURIComponent(familyName)}&rank=species`;
    } else {
      return null;
    }

    query += "&page=1&per_page=1";

    const response = await fetch(query);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.total_results || 0;
  } catch (error) {
    console.error("Children count error:", error);
    return 0;
  }
};
