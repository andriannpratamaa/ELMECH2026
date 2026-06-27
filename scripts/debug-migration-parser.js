const fs = require("fs");
const path = require("path");
const code = fs.readFileSync(
  path.join(__dirname, "migrate-static-pages.js"),
  "utf8",
);
const extractExportFunc = code.match(/function extractExport\([\s\S]*?\n\}/);
const tsToJsonishFunc = code.match(/function tsToJsonish\([\s\S]*?\n\}/);
if (!extractExportFunc || !tsToJsonishFunc) {
  console.error("Cannot find parser functions");
  process.exit(1);
}
const extractExport = new Function(
  "name",
  "text",
  extractExportFunc[0].replace(
    /^function extractExport\(/,
    "return function extractExport(",
  ),
);
const tsToJsonish = new Function(
  "ts",
  tsToJsonishFunc[0].replace(
    /^function tsToJsonish\(/,
    "return function tsToJsonish(",
  ),
);
const files = [
  "about.ts",
  "programs.ts",
  "news.ts",
  "gallery.ts",
  "contact.ts",
  "reports.ts",
];
const names = {
  "about.ts": "ABOUT_DATA",
  "programs.ts": "PROGRAMS",
  "news.ts": "NEWS_ITEMS",
  "gallery.ts": "GALLERY_ITEMS",
  "contact.ts": "CONTACT_INFO",
  "reports.ts": "REPORTS",
};
for (const f of files) {
  const text = fs.readFileSync(
    path.join(__dirname, "..", "src", "data", f),
    "utf8",
  );
  const name = names[f];
  const raw = extractExport(name, text);
  console.log("---", f, name, raw ? "FOUND" : "NOT FOUND");
  if (raw) {
    const jsonish = tsToJsonish(raw);
    try {
      const parsed = JSON.parse(jsonish);
      console.log(
        "parse ok:",
        Array.isArray(parsed) ? `array ${parsed.length}` : typeof parsed,
      );
    } catch (e) {
      console.log("parse fail:", e.message);
    }
  }
}
