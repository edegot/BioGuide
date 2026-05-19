Recommendation for deploying BioGuide

Goal: produce a lightweight, functional artifact that's easy to deploy.

Best approach (recommended):

- Build static production assets locally or in CI using `npm run build`.
- Deploy the `build/` folder to any static host (Netlify, Vercel, GitHub Pages, S3+CloudFront, Surge, static Docker image).
- You do NOT need `node_modules` on the server for a static build.

Commands (local or CI):

1. Install dev deps and build (CI or dev machine):

```bash
npm ci
npm run build
```

2. Deploy the produced `build/` folder to your static host.

Alternative (server installs only production deps):

```bash
# remove current node_modules and lockfile (CAREFUL: local dev tools removed)
rm -rf node_modules package-lock.json
# install only production deps
npm ci --only=production
```

Space-saving suggestions:
- Run `npm prune --production` on staging servers to remove dev dependencies.
- Use `npx modclean -r default:safe` to remove docs/tests from `node_modules` (inspect the dry-run first).
- Consider using `pnpm` in CI to reduce disk footprint and deduplicate packages.

Notes:
- For reproducible builds, do builds in CI and publish artifacts; don't commit `build/` to git unless you need it.
- Keep `package.json` and `package-lock.json` in the repo; they define dependencies.

If you want, I can now remove `node_modules` from this workspace to free disk and keep a small repo copy. I can also run `npm ci --only=production` instead if you'd prefer a production-only install here.
