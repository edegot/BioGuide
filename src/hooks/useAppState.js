import { useState, useCallback, useMemo } from "react";
import { loadCollection, saveCollection, loadLocale } from "../utils/storage";
import { calculateStats, calculateAchievements } from "../utils/gamification";

/**
 * Custom hook for managing species collection state
 */
export const useCollection = () => {
  const [collection, setCollection] = useState(() => loadCollection());

  const stats = useMemo(() => calculateStats(collection), [collection]);
  const achievements = useMemo(() => calculateAchievements(collection), [collection]);

  const addToCollection = useCallback(
    (item) => {
      const newCollection = [...collection, item];
      setCollection(newCollection);
      saveCollection(newCollection);
      return true;
    },
    [collection]
  );

  const updateInCollection = useCallback(
    (uuid, updates) => {
      const newCollection = collection.map((item) =>
        item.uuid === uuid ? { ...item, ...updates } : item
      );
      setCollection(newCollection);
      saveCollection(newCollection);
      return true;
    },
    [collection]
  );

  const removeFromCollection = useCallback(
    (uuid) => {
      const newCollection = collection.filter((item) => item.uuid !== uuid);
      setCollection(newCollection);
      saveCollection(newCollection);
      return true;
    },
    [collection]
  );

  const clearCollection = useCallback(() => {
    setCollection([]);
    saveCollection([]);
    return true;
  }, []);

  const mergeCollection = useCallback(
    (items) => {
      const existing = new Set(collection.map((item) => item.taxonId));
      const newItems = items.filter((item) => !existing.has(item.taxonId));
      const newCollection = [...collection, ...newItems];
      setCollection(newCollection);
      saveCollection(newCollection);
      return newItems.length;
    },
    [collection]
  );

  return {
    collection,
    stats,
    achievements,
    addToCollection,
    updateInCollection,
    removeFromCollection,
    clearCollection,
    mergeCollection,
  };
};

/**
 * Custom hook for managing application language/locale
 */
export const useLocale = () => {
  const [locale, setLocaleState] = useState(() => loadLocale());

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem("bioguide_locale", newLocale);
  }, []);

  return [locale, setLocale];
};

/**
 * Custom hook for managing modal state
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setLoading(false);
  }, []);

  return {
    isOpen,
    data,
    loading,
    open,
    close,
    setLoading,
  };
};

/**
 * Custom hook for managing debounced search
 */
export const useDebouncedSearch = (callback, delay = 300) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useState(null)[1];

  const search = useCallback(
    (value) => {
      setQuery(value);

      if (timeoutRef) clearTimeout(timeoutRef);

      if (value.trim()) {
        setIsSearching(true);
        const timeout = setTimeout(() => {
          callback(value);
          setIsSearching(false);
        }, delay);
        
        useState(() => null, () => {
          // Store timeout for cleanup
          timeoutRef = timeout;
        });
      } else {
        setIsSearching(false);
        callback("");
      }
    },
    [callback, delay, timeoutRef]
  );

  return { query, isSearching, search, setQuery };
};

/**
 * Custom hook for managing toast notifications
 */
export const useToast = () => {
  const [message, setMessageState] = useState(null);
  const [type, setTypeState] = useState("success");

  const showToast = useCallback(
    (msg, toastType = "success", duration = 3000) => {
      setMessageState(msg);
      setTypeState(toastType);

      const timeout = setTimeout(() => {
        setMessageState(null);
      }, duration);

      return () => clearTimeout(timeout);
    },
    []
  );

  const closeToast = useCallback(() => {
    setMessageState(null);
  }, []);

  return {
    message,
    type,
    showToast,
    closeToast,
  };
};
