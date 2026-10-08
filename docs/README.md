# Docs

How this site is built, why it's built that way, and how to change it without breaking it.
Written for Soham and for any agent (Claude, Lovable) picking up the work cold.

## Start here

1. **Rules:** `AGENTS.md` at the repo root. Short, and non-negotiable.
2. **The shape of the app:** [architecture.md](architecture.md).
3. **The doc for the area you're touching** (table below).
4. **Before pushing:** [testing.md](testing.md); before shipping: [workflow.md](workflow.md).

| Doc | Read it when you… |
|---|---|
| [architecture.md](architecture.md) | touch anything that runs on every page: routing, page transitions, scroll, motion, cursor, styling, layers |
| [content-model.md](content-model.md) | add or change content: projects, papers, certificates, photos, links |
| [buddy.md](buddy.md) | change what Nimbus (the site buddy) says or does, or **any content it points at** |
| [videos.md](videos.md) | add, replace or debug a video; anything about the timeline or full screen |
| [testing.md](testing.md) | check a change: fast checks, `npm run qa`, `npm run qa:buddy`, browser checks |
| [workflow.md](workflow.md) | ship a change: branches, lockfiles, Lovable, hosting |
| [decisions.md](decisions.md) | wonder "why is it like this?" before changing it |

The root `README.md` covers the owner's everyday tasks (run it, update content).

## Keeping these docs true

Docs that drift are worse than none. When a change alters how something works, update its doc
**in the same change**:

| You changed… | Update |
|---|---|
| Routing, transitions, scroll, cursor, layers, a shared component | `architecture.md` |
| A data field or what it renders | `content-model.md` (and root `README.md` if it's an owner task) |
| **Site content** (a project, page section, video, paper, or a class name) | **`src/data/buddy.ts`**, then run `npm run qa:buddy`. See [buddy.md](buddy.md#keep-the-buddy-in-sync-with-the-site). |
| The video player or the streaming setup | `videos.md` |
| How to check or ship | `testing.md`, `workflow.md` |
| A significant choice (new library, new pattern, reversing an old decision) | add a dated line to `decisions.md` |
| A rule every agent must follow | `AGENTS.md` |
