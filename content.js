(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFAULT_URLS = ["https://a5.ucsd.edu"];
  const PREFERRED_OPTIONS = ["Active Directory", "Business Systems"];
  const OBSERVER_TIMEOUT_MS = 10000;

  const storageGet = (defaults) => {
    try {
      const result = api.storage.local.get(defaults);
      if (result && typeof result.then === "function") {
        return result;
      }
    } catch (error) {
      // Ignore and fall back to callback-based API.
    }

    return new Promise((resolve) => api.storage.local.get(defaults, resolve));
  };

  const normalizeList = (list) =>
    (Array.isArray(list) ? list : [])
      .map((entry) => entry.trim())
      .filter(Boolean);

  const matchesEntry = (url, entry) => {
    if (!entry) return false;
    if (entry === "<all_urls>") return true;

    if (entry.includes("://")) {
      const prefix = entry.endsWith("*") ? entry.slice(0, -1) : entry;
      return url.startsWith(prefix);
    }

    try {
      const hostname = new URL(url).hostname;
      return hostname === entry || hostname.endsWith(`.${entry}`);
    } catch (error) {
      return false;
    }
  };

  const urlMatchesList = (url, list) => list.some((entry) => matchesEntry(url, entry));

  const findPreferredValue = (selectEl) => {
    const options = Array.from(selectEl.options);
    for (const label of PREFERRED_OPTIONS) {
      const match = options.find((option) => option.text.trim() === label);
      if (match) return match.value;
    }
    return null;
  };

  const applySelection = () => {
    const selectEl = document.querySelector("select#authtype");
    if (!selectEl) return false;

    const preferredValue = findPreferredValue(selectEl);
    if (!preferredValue) return false;

    selectEl.value = preferredValue;
    selectEl.dispatchEvent(new Event("input", { bubbles: true }));
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  };

  const waitForSelectAndApply = () => {
    if (applySelection()) return;

    const observer = new MutationObserver(() => {
      if (applySelection()) {
        observer.disconnect();
        clearTimeout(timeoutId);
      }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

    const timeoutId = setTimeout(() => observer.disconnect(), OBSERVER_TIMEOUT_MS);
  };

  const run = async () => {
    const stored = await storageGet({ urlList: DEFAULT_URLS });
    const urlList = normalizeList(stored.urlList || DEFAULT_URLS);

    if (!urlMatchesList(window.location.href, urlList)) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", waitForSelectAndApply, {
        once: true
      });
    } else {
      waitForSelectAndApply();
    }
  };

  run();
})();
