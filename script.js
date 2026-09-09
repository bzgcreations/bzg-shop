(() => {
  'use strict';

  const WIX_ORIGIN = 'https://bzgcreations.wixsite.com';
  const SHOP_ROOT = `${WIX_ORIGIN}/shop`;
  const WIX_BRIDGE_MESSAGE = 'BZG_SHOP_WIX_NAVIGATION';
  const WIX_AUTH_MESSAGE = 'BZG_SHOP_WIX_AUTH_NAVIGATION';

  const frame = document.getElementById('shopFrame');
  let currentIframeUrl = '';
  let authEscapeInProgress = false;

  // GitHub Pages project sites run under /REPOSITORY-NAME/.
  // This keeps the public routes /, /home and /items relative to that base.
  function getRepoBase() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return window.location.hostname.endsWith('.github.io') && parts.length ? `/${parts[0]}` : '';
  }

  const REPO_BASE = getRepoBase();

  function normalizePath(pathname) {
    let path = pathname || '/';
    if (!path.startsWith('/')) path = `/${path}`;
    if (path.length > 1) path = path.replace(/\/+$|\/+$ /g, '');
    return path || '/';
  }

  function outerPath() {
    let path = window.location.pathname || '/';
    if (REPO_BASE && (path === REPO_BASE || path.startsWith(`${REPO_BASE}/`))) {
      path = path.slice(REPO_BASE.length) || '/';
    }
    return normalizePath(path);
  }

  function sameUrl(a, b) {
    try { return new URL(a).href === new URL(b).href; } catch { return a === b; }
  }

  function iframeUrlForOuterPath(pathname) {
    const path = normalizePath(pathname);
    if (path === '/' || path === '/home') return SHOP_ROOT;
    if (path === '/items') return `${SHOP_ROOT}/items`;
    return `${WIX_ORIGIN}${path}`;
  }

  function outerPathForWixUrl(urlString) {
    try {
      const url = new URL(urlString, WIX_ORIGIN);
      if (url.origin !== WIX_ORIGIN) return null;
      const wixPath = normalizePath(url.pathname);
      if (wixPath === '/shop') return '/';
      if (wixPath === '/shop/home') return '/home';
      if (wixPath === '/shop/items' || wixPath.startsWith('/shop/items/')) return '/items';
      return wixPath;
    } catch { return null; }
  }

  function publicUrl(path) {
    const normalized = normalizePath(path);
    return `${REPO_BASE}${normalized === '/' ? '/' : normalized}`;
  }

  function setOuterUrl(path, replace = false) {
    const normalized = normalizePath(path);
    if (outerPath() === normalized) return;
    const url = publicUrl(normalized);
    if (replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
  }

  function loadIframe(url, replaceOuterUrl = false) {
    if (!url || sameUrl(currentIframeUrl, url)) return;
    currentIframeUrl = url;
    frame.src = url;
    if (replaceOuterUrl) {
      const path = outerPathForWixUrl(url);
      if (path) window.history.replaceState({}, '', publicUrl(path));
    }
  }

  function loadFromOuterUrl() {
    loadIframe(iframeUrlForOuterPath(outerPath()));
  }

  function buildAuthEscapeUrl(wixUrl) {
    const url = new URL(wixUrl);
    url.searchParams.set('bzg_shop_auth', '1');
    url.searchParams.set('bzg_shop_return', outerPath());
    return url.href;
  }

  function escapeToWixForLogin(wixUrl) {
    if (authEscapeInProgress) return;
    authEscapeInProgress = true;
    window.location.assign(buildAuthEscapeUrl(wixUrl));
  }

  window.addEventListener('popstate', loadFromOuterUrl);
  window.addEventListener('pageshow', loadFromOuterUrl);

  window.addEventListener('message', (event) => {
    if (event.origin !== WIX_ORIGIN || !event.data || typeof event.data !== 'object') return;

    if (event.data.type === WIX_AUTH_MESSAGE) {
      const url = event.data.url || event.data.href;
      if (url && !authEscapeInProgress) escapeToWixForLogin(url);
      return;
    }

    if (event.data.type !== WIX_BRIDGE_MESSAGE) return;
    const path = outerPathForWixUrl(event.data.url || event.data.href);
    if (path) setOuterUrl(path, false);
  });

  loadFromOuterUrl();

  window.bzgShop = {
    getIframeUrl: () => currentIframeUrl,
    getOuterPath: outerPath,
    getRepoBase: () => REPO_BASE
  };
})();
