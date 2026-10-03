// Converts Archivo Black (OFL, via @fontsource) into three.js typeface JSON for the 3D name in
// Frame 2, so the extruded letters use the same "machine voice" as the rest of the film.
// Same output format as facetype.js: glyph outlines in "m/l/q/b" commands, end point first.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff");
const out = join(root, "compositions/assets/fonts/ArchivoBlack.typeface.json");

const buf = readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const scale = (1000 * 100) / ((font.unitsPerEm || 2048) * 72);
const r = (v) => Math.round(v * scale);
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .'-?";

const glyphs = {};
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  let o = "";
  for (const c of g.path.commands) {
    if (c.type === "M") o += `m ${r(c.x)} ${r(c.y)} `;
    else if (c.type === "L") o += `l ${r(c.x)} ${r(c.y)} `;
    else if (c.type === "Q") o += `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} `;
    else if (c.type === "C") o += `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} `;
  }
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: r(g.xMin || 0), x_max: r(g.xMax || 0), o: o.trim() };
}

const json = {
  glyphs,
  familyName: "Archivo Black",
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition),
  underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { yMin: r(font.tables.head.yMin), xMin: r(font.tables.head.xMin), yMax: r(font.tables.head.yMax), xMax: r(font.tables.head.xMax) },
  resolution: 1000,
  original_font_information: { format: 0, copyright: "Archivo Black — SIL Open Font License 1.1", fontFamily: "Archivo Black" },
  cssFontWeight: "normal",
  cssFontStyle: "normal",
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(json));
console.log(`[typeface] ${Object.keys(glyphs).length} glyphs -> ${out}`);
