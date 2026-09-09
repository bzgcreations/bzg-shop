# bzg-shop — GitHub Pages

Full-screen wrapper for `https://bzgcreations.wixsite.com/shop`.

## GitHub Pages URL

`https://bzgcreations.github.io/bzg-shop/`

## Routes

- `/` → Wix `/shop`
- `/home` → Wix `/shop`
- `/items` → Wix `/shop/items`
- `/items/...` → Wix `/shop/items/...`
- Other routes mirror the corresponding `bzgcreations.wixsite.com` path.

`404.html` provides the SPA fallback needed for direct GitHub Pages routes.

`WIX-PAGE-CODE.js` is the Wix/Velo bridge. Put it in Wix Site Code / masterPage.js to synchronize Wix navigation with the wrapper.

## Note

Because this is a GitHub Pages project site, the repository name `/bzg-shop/` is part of the public URL. A true domain root would require a custom domain or a `bzgcreations.github.io` user-site repository.
