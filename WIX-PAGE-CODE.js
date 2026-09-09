// bzg-shop GitHub Pages <-> bzgcreations.wixsite.com bridge
// Put this in Wix Site Code / masterPage.js so navigation updates the
// wrapper URL without reloading the iframe.

import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from 'wix-members-frontend';

const MESSAGE_TYPE = 'BZG_SHOP_WIX_NAVIGATION';
const AUTH_MESSAGE_TYPE = 'BZG_SHOP_WIX_AUTH_NAVIGATION';
const GITHUB_SHOP_ORIGIN = 'https://bzgcreations.github.io';
const RETURN_KEY = 'bzg_shop_auth_return';

function isEmbedded() {
  try { return window.parent !== window; } catch (e) { return false; }
}

function tellWrapper() {
  if (!isEmbedded()) return;
  window.parent.postMessage({ type: MESSAGE_TYPE, url: window.location.href }, GITHUB_SHOP_ORIGIN);
}

function looksLikeLoginPage(urlString) {
  try {
    const path = new URL(urlString).pathname.toLowerCase();
    return /(^|\/)login(?:\/|$)/.test(path) || /(^|\/)(signup|sign-up|register)(?:\/|$)/.test(path);
  } catch (e) { return false; }
}

function getReturnPath() {
  try {
    const p = new URLSearchParams(window.location.search);
    const marker = p.get('bzg_shop_auth');
    const path = p.get('bzg_shop_return');
    if (marker !== '1' || !path || !path.startsWith('/') || path.startsWith('//')) return null;
    return path;
  } catch (e) { return null; }
}

function saveAuthReturn() {
  if (isEmbedded()) return;
  const path = getReturnPath();
  if (path) { try { localStorage.setItem(RETURN_KEY, path); } catch (e) {} }
}

async function returnToWrapperIfAuthenticated() {
  if (isEmbedded()) return;
  let path = null;
  try { path = localStorage.getItem(RETURN_KEY); } catch (e) { return; }
  if (!path) return;
  try {
    const member = await currentMember.getMember();
    if (!member) return;
    localStorage.removeItem(RETURN_KEY);
    window.location.replace(`https://bzgcreations.github.io/bzg-shop${path === '/' ? '/' : path}`);
  } catch (e) {}
}

function requestTopLevelAuth() {
  if (!isEmbedded() || !looksLikeLoginPage(window.location.href)) return;
  window.parent.postMessage({ type: AUTH_MESSAGE_TYPE, url: window.location.href }, GITHUB_SHOP_ORIGIN);
}

$w.onReady(() => {
  saveAuthReturn();
  tellWrapper();
  requestTopLevelAuth();
  returnToWrapperIfAuthenticated();
  wixLocationFrontend.onChange(() => {
    tellWrapper();
    requestTopLevelAuth();
  });
});
