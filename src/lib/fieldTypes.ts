const IMAGE_KEYWORDS = [
  "image", "img", "photo", "photoUrl",
  "thumbnail", "thumb",
  "cover", "coverDesktop", "coverMobile",
  "banner",
  "background", "backgroundImage", "bgImage", "bg",
  "logo", "partnerLogo", "sponsorLogo",
  "avatar",
  "icon", "iconImage",
  "poster",
  "heroImage", "heroBg",
  "galleryImage",
  "speakerPhoto",
];

const IMAGE_ARRAY_NAMES = new Set([
  "images", "imagesUrl",
  "gallery", "galleries",
  "photos", "photoGallery",
  "logos", "partners",
]);

const RICH_TEXT_NAMES = new Set([
  "body", "description", "content", "summary", "excerpt", "text",
]);

const ARRAY_ITEM_NAMES = new Set([
  "items", "buttons", "cards",
  "bento_items", "programs", "facilities",
  "kerjasama", "featured",
  "sejarah", "misi", "pimpinan",
]);

const TEXTAREA_NAMES = new Set(["visi", "motto", "alamat"]);

export type FieldType =
  | "image"
  | "image-array"
  | "richtext"
  | "icon"
  | "textarea"
  | "array"
  | "text";

export function isImageField(name: string): boolean {
  const lower = name.toLowerCase();
  if (IMAGE_ARRAY_NAMES.has(lower)) return false;
  return IMAGE_KEYWORDS.some((kw) => lower === kw || lower.endsWith(kw) || lower.startsWith(kw));
}

export function isImageArrayField(name: string): boolean {
  return IMAGE_ARRAY_NAMES.has(name.toLowerCase());
}

export function isRichtextField(name: string): boolean {
  return RICH_TEXT_NAMES.has(name.toLowerCase());
}

export function isArrayField(name: string): boolean {
  return ARRAY_ITEM_NAMES.has(name.toLowerCase());
}

export function isTextareaField(name: string): boolean {
  return TEXTAREA_NAMES.has(name.toLowerCase());
}

export function resolveFieldType(name: string): FieldType {
  if (isImageArrayField(name)) return "image-array";
  if (isImageField(name)) return "image";
  if (isRichtextField(name)) return "richtext";
  if (name === "icon") return "icon";
  if (isTextareaField(name)) return "textarea";
  if (isArrayField(name)) return "array";
  return "text";
}
