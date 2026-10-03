// Offline-first vendoring for this HyperFrames project.
//
// Registry blocks reference GSAP / Three.js / fonts on cdn.jsdelivr.net. That makes renders
// depend on the network (and fail in sandboxed CI). This script:
//   1. copies the exact runtime libraries from node_modules into ./vendor
//   2. rewrites every CDN reference in the project's HTML to the local copies
// Run it after every `hyperframes add`:  node scripts/vendor.mjs
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nm = join(root, "node_modules");
const vendor = join(root, "vendor");

const copies = [
  ["gsap/dist/gsap.min.js", "gsap.min.js"],
  ["three/build/three.module.min.js", "three/three.module.min.js"],
  ["three/build/three.core.min.js", "three/three.core.min.js"],
  ["three/examples/jsm/geometries/TextGeometry.js", "three/addons/geometries/TextGeometry.js"],
  ["three/examples/jsm/loaders/FontLoader.js", "three/addons/loaders/FontLoader.js"],
  ["three/examples/jsm/environments/RoomEnvironment.js", "three/addons/environments/RoomEnvironment.js"],
  ["@fontsource/fraunces/files/fraunces-latin-400-italic.woff2", "fonts/fraunces-latin-400-italic.woff2"],
  ["@fontsource/fraunces/files/fraunces-latin-600-italic.woff2", "fonts/fraunces-latin-600-italic.woff2"],
  ["@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2", "fonts/archivo-black-latin-400-normal.woff2"],
  ["@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", "fonts/ibm-plex-mono-latin-400-normal.woff2"],
  ["@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff2", "fonts/ibm-plex-mono-latin-700-normal.woff2"],
];
for (const [from, to] of copies) {
  mkdirSync(dirname(join(vendor, to)), { recursive: true });
  copyFileSync(join(nm, from), join(vendor, to));
}

const rewrites = [
  // GSAP (any version) -> local copy, path relative to the project root (sub-compositions are
  // inlined into index.html, so every reference resolves from the root).
  [/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@[^/"']+\/dist\/gsap\.min\.js/g, "vendor/gsap.min.js"],
  // Three.js core, as +esm or as the module build -> bare specifier resolved by index.html's importmap.
  [/https:\/\/cdn\.jsdelivr\.net\/npm\/three@[^/"']+\/(?:\+esm|build\/three\.module(?:\.min)?\.js)/g, "three"],
  // Three.js addons.
  [/https:\/\/cdn\.jsdelivr\.net\/npm\/three@[^/"']+\/examples\/jsm\/([^"']+?\.js)(?:\/\+esm)?/g, "three/addons/$1"],
];

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", "vendor", ".git", "renders", ".hyperframes"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

let changed = 0;
for (const file of htmlFiles(root)) {
  const before = readFileSync(file, "utf8");
  let after = before;
  for (const [re, to] of rewrites) after = after.replace(re, to);
  if (after !== before) {
    writeFileSync(file, after);
    changed++;
    console.log(`[vendor] rewrote ${relative(root, file)}`);
  }
  const leftover = after.match(/https:\/\/cdn\.jsdelivr\.net[^"')\s]*/g);
  if (leftover) console.warn(`[vendor] remaining CDN refs in ${relative(root, file)}:`, [...new Set(leftover)]);
}
console.log(`[vendor] ${copies.length} files vendored, ${changed} HTML files rewritten`);
