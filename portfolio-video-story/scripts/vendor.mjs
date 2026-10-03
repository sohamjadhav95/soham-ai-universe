// Offline-first vendoring: copies the exact GSAP build from node_modules into ./vendor so renders never need a CDN.
// The fonts in vendor/fonts come from the Motion Graphics starter kit (SIL OFL 1.1, see vendor/fonts/OFL.txt).
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "vendor"), { recursive: true });
copyFileSync(join(root, "node_modules/gsap/dist/gsap.min.js"), join(root, "vendor/gsap.min.js"));
console.log("[vendor] gsap.min.js vendored");
