# Workflow: how changes ship

## Who changes this repo

Three sources commit to `main`. **Always fetch `main` before starting.**

| Who | How |
|---|---|
| **Soham** | Direct commits on GitHub, and uploads |
| **Lovable** (`gpt-engineer-app[bot]`) | Commits made from the Lovable editor ("Changes", "Lovable update") |
| **Claude Code** | Works on a `claude/…` branch, opens a pull request, merges it |

```sh
git fetch origin main
git checkout -B claude/<branch> origin/main   # if the branch's earlier PR is already merged
```

## Shipping

1. **Make the change on a branch.** Keep it to one topic where you can.
2. **Run the checks** in [testing.md](testing.md): types, lint, build, `npm run qa`, `npm run qa:buddy`,
   plus browser checks for what you touched.
3. **Update the docs** that describe what you changed (see [README.md](README.md#keeping-these-docs-true)).
4. **Commit, push, open a pull request** against `main`, and merge it once it's green.
5. **Publish:** Soham publishes from Lovable (**Publish → Update**). Merging alone doesn't update the live site.

## Dependencies: two lockfiles

- **`package-lock.json`** (npm) is what Claude and local `npm install` use.
- **`bun.lock`** (bun) is maintained by Lovable's bot. Its existing entries point at Lovable's private
  registry, so `bun install` doesn't work outside Lovable.

**When you add a dependency, add it to both:**
1. `npm install <pkg>@<version>`, which updates `package.json` and `package-lock.json`.
2. In `bun.lock`, add the package to `workspaces[""].dependencies` (alphabetical) and add a
   `packages` entry in the same format as its neighbours: `"name": ["name@version", "", {}, "sha512-…"]`.
   The `sha512` integrity comes from `package-lock.json`.

Lovable rewrites `bun.lock` on its next sync; that's fine.

## Hosting facts that shape the code

- **Live URL:** `https://soham-ai-universe.pages.dev` (Cloudflare Pages).
- **No HTTP range requests.** The host always sends whole files, so a big video can't be sought.
  That's why videos stream as HLS pieces (see [videos.md](videos.md)).
- **Max 25 MiB per file.** Keep media under that.
- **Single-page app fallback:** `public/_redirects` (`/* /index.html 200`) and `vercel.json` (same rewrite),
  so deep links like `/work/predict-studio` load the app.
- **`robots.txt` disallows `/lab`.** The buddy lab page also sets `noindex` itself.
- **The contact form key** (`SITE.web3formsKey`) is public by design (Web3Forms).

## What is and isn't the site

| Path | Part of the site? |
|---|---|
| `src/`, `public/`, `index.html`, configs | Yes |
| `scripts/` | Tooling: `make-hls.sh` (video streams) and `qa/` (checks) |
| `docs/` | These docs |
| `portfolio-video-story/` | **No.** A separate project (the 50 s story film, built with HyperFrames). Its render is copied into `public/videos/`. |
| `photos/` | Source photo; not used by the site |
| `dist/` | Build output, gitignored |

## Commit and PR conventions

- Write commit messages in plain language: what changed and why, as a short summary plus bullets.
- Don't add model names or IDs to commits, PRs or code.
- Never commit `dist/`, `node_modules/` or secrets.
