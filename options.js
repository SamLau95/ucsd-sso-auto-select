(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const DEFAULT_URLS = ["https://a5.ucsd.edu"];

  const urlListEl = document.getElementById("urlList");
  const statusEl = document.getElementById("status");
  const saveBtn = document.getElementById("save");
  const resetBtn = document.getElementById("reset");

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

  const storageSet = (payload) => {
    try {
      const result = api.storage.local.set(payload);
      if (result && typeof result.then === "function") {
        return result;
      }
    } catch (error) {
      // Ignore and fall back to callback-based API.
    }

    return new Promise((resolve) => api.storage.local.set(payload, resolve));
  };

  const setStatus = (message) => {
    statusEl.textContent = message;
  };

  const getTextareaLines = () =>
    urlListEl.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const load = async () => {
    const stored = await storageGet({ urlList: DEFAULT_URLS });
    const list = Array.isArray(stored.urlList) ? stored.urlList : DEFAULT_URLS;
    urlListEl.value = list.join("\n");
  };

  const save = async () => {
    const list = getTextareaLines();
    await storageSet({ urlList: list.length ? list : DEFAULT_URLS });
    setStatus("Saved.");
  };

  const reset = async () => {
    urlListEl.value = DEFAULT_URLS.join("\n");
    await storageSet({ urlList: DEFAULT_URLS });
    setStatus("Reset to default.");
  };

  saveBtn.addEventListener("click", () => void save());
  resetBtn.addEventListener("click", () => void reset());

  load().catch(() => setStatus("Unable to load settings."));
})();
