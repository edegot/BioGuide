import { TROPHIES_DATA } from "../data/config";

/**
 * Calculate statistics from the collection
 */
export const calculateStats = (collection) => {
  const total = collection.length;
  const groupCounts = {};
  const genusData = {};
  const countrySet = new Set();

  collection.forEach((item) => {
    // Count by iconic group
    const group = item.iconicGroup || "Unknown";
    groupCounts[group] = (groupCounts[group] || 0) + 1;

    // Count countries
    if (item.countries && Array.isArray(item.countries)) {
      item.countries.forEach((country) => countrySet.add(country));
    }

    // Build genus data
    const genus = item.genus || "Unknown";
    if (!genusData[genus]) {
      genusData[genus] = {
        count: 0,
        total: item.genusTotal || 5,
        species: [],
      };
    }

    // Check if species already exists in genus
    const isDuplicate = genusData[genus].species.some(
      (s) => s.taxonId === item.taxonId
    );

    if (!isDuplicate) {
      genusData[genus].count += 1;
      genusData[genus].species.push(item);
    }

    // Update genus total if needed
    if (item.genusTotal && item.genusTotal > genusData[genus].total) {
      genusData[genus].total = item.genusTotal;
    }
  });

  const groups = Object.entries(groupCounts)
    .map(([key, value]) => ({ name: key, count: value }))
    .sort((a, b) => b.count - a.count);

  const completedGenera = Object.entries(genusData)
    .map(([genus, data]) => ({ genus, ...data }))
    .filter((g) => g.count >= g.total && g.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    totalSpecies: total,
    groups,
    genusData,
    completedGenera,
    uniqueCountries: countrySet.size,
    countryList: Array.from(countrySet).sort(),
  };
};

/**
 * Calculate earned achievements/trophies
 */
export const calculateAchievements = (collection) => {
  const stats = calculateStats(collection);
  const achievements = [];

  TROPHIES_DATA.forEach((trophy) => {
    let isUnlocked = false;
    let current = 0;
    let target = 0;

    if (trophy.countryThreshold) {
      // Country-based trophy
      current = stats.uniqueCountries;
      target = trophy.countryThreshold;
      isUnlocked = current >= target;
    } else if (trophy.family) {
      // Family-based trophy
      const familyCount = collection.filter(
        (item) =>
          item.iconicGroup === trophy.family ||
          item.family === trophy.family ||
          item.order === trophy.family
      ).length;
      current = familyCount;
      target = trophy.threshold || trophy.countryThreshold;
      isUnlocked = current >= target;
    } else {
      // Total species trophy
      current = stats.totalSpecies;
      target = trophy.threshold || 1;
      isUnlocked = current >= target;
    }

    const progress = Math.min(100, (current / target) * 100);

    achievements.push({
      ...trophy,
      isUnlocked,
      current,
      target,
      progress,
    });
  });

  return achievements;
};

/**
 * Get next milestone for a specific achievement type
 */
export const getNextMilestone = (collection, achievementType) => {
  const achievements = calculateAchievements(collection);
  const achievement = achievements.find((a) => a.id === achievementType);

  if (!achievement) return null;

  return {
    ...achievement,
    remaining: Math.max(0, achievement.target - achievement.current),
  };
};

/**
 * Get collection completion percentage by group
 */
export const getGroupCompletion = (collection, GLOBAL_SPECIES_ESTIMATES) => {
  const stats = calculateStats(collection);

  return Object.entries(GLOBAL_SPECIES_ESTIMATES).map(([group, data]) => {
    const collected = stats.groupCounts[group] || 0;
    const estimated = data.total;
    const percentage = (collected / estimated) * 100;

    return {
      group,
      label: data.label,
      collected,
      estimated,
      percentage: Math.min(100, percentage),
      color: data.color,
      text: data.text,
    };
  });
};

/**
 * Get recommended next actions based on progress
 */
export const getRecommendations = (collection) => {
  const stats = calculateStats(collection);
  const recommendations = [];

  // If no collection, recommend starting
  if (stats.totalSpecies === 0) {
    recommendations.push({
      type: "start",
      title: "Start your collection",
      description: "Search for a species to add your first observation!",
    });
  }

  // Check for near-complete genera
  const almostComplete = Object.entries(stats.genusData)
    .filter(([ , data]) => data.count > 0 && data.count < data.total)
    .sort((a, b) => {
      const ratioA = a[1].count / a[1].total;
      const ratioB = b[1].count / b[1].total;
      return ratioB - ratioA;
    })
    .slice(0, 3);

  if (almostComplete.length > 0) {
    const [genus, data] = almostComplete[0];
    recommendations.push({
      type: "complete-genus",
      title: `Complete ${genus}`,
      description: `You have ${data.count}/${data.total} species. ${data.total - data.count} more to go!`,
      genus,
      progress: (data.count / data.total) * 100,
    });
  }

  // Check for untapped groups
  const groupsSorted = Object.entries(stats.groupCounts)
    .sort((a, b) => b[1] - a[1]);
  
  const missingGroups = Object.keys(stats.genusData).filter(
    (genus) => !stats.groupCounts[genus]
  );

  if (missingGroups.length > 0 && stats.totalSpecies > 5) {
    recommendations.push({
      type: "explore-group",
      title: "Explore new groups",
      description: `Try collecting from groups you haven't explored yet!`,
    });
  }

  return recommendations;
};
