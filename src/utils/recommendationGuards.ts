export type CanonTheme =
  | "Animal"
  | "Flowers/Plants"
  | "Nature/Landscape"
  | "Symbols/Emblems"
  | "Pattern/Abstract"
  | "Vehicles/Transport"
  | "Food & Drink"
  | "Other";

export type CanonBag =
  | "wallet"
  | "crossbody"
  | "satchel"
  | "hobo"
  | "clutch"
  | "pouch"
  | "accessory";

export const normalizeTheme = (s: string): CanonTheme => {
  const t = (s || "").trim().toLowerCase();
  const map: Record<string, CanonTheme> = {
    "animal": "Animal",
    "animals": "Animal",
    "flowers": "Flowers/Plants",
    "flowers/plants": "Flowers/Plants",
    "floral": "Flowers/Plants",
    "nature": "Nature/Landscape",
    "landscape": "Nature/Landscape",
    "symbols": "Symbols/Emblems",
    "emblems": "Symbols/Emblems",
    "pattern": "Pattern/Abstract",
    "abstract": "Pattern/Abstract",
    "pattern/abstract": "Pattern/Abstract",
    "vehicles": "Vehicles/Transport",
    "transport": "Vehicles/Transport",
    "vehicles/transport": "Vehicles/Transport",
    "food": "Food & Drink",
    "drink": "Food & Drink",
    "food & drink": "Food & Drink",
    "other": "Other",
    "other (unspecified)": "Other",
  };
  return (map[t] ||
    (t.includes("animal") ? "Animal" :
     t.includes("flor") || t.includes("flower") ? "Flowers/Plants" :
     t.includes("landscape") || t.includes("nature") ? "Nature/Landscape" :
     t.includes("symbol") || t.includes("emblem") ? "Symbols/Emblems" :
     t.includes("abstract") || t.includes("pattern") ? "Pattern/Abstract" :
     t.includes("vehicle") || t.includes("transport") ? "Vehicles/Transport" :
     t.includes("food") || t.includes("drink") ? "Food & Drink" : "Other")) as CanonTheme;
};

export const normalizeBagType = (s: string): CanonBag | null => {
  const v = (s || "").trim().toLowerCase();
  if (!v) return null;
  if (/\b(cross[- ]?body|sling|messenger)\b/.test(v)) return "crossbody";
  if (/\bhobo\b/.test(v)) return "hobo";
  if (/\b(satchel|tote|shopper)\b/.test(v)) return "satchel";
  if (/\b(wallet|card holder|cardholder|money clip)\b/.test(v)) return "wallet";
  if (/\b(clutch|evening)\b/.test(v)) return "clutch";
  if (/\b(pouch|organizer|cosmetic|makeup|kit|tech pouch)\b/.test(v)) return "pouch";
  if (/\b(charm|keychain|strap|scarf|twilly|accessor)/.test(v)) return "accessory";
  return null;
};

export const allowedBagsForTheme: Record<CanonTheme, CanonBag[]> = {
  "Animal": ["crossbody", "satchel", "hobo"],
  "Flowers/Plants": ["clutch", "pouch", "satchel"],
  "Nature/Landscape": ["crossbody", "satchel", "hobo"],
  "Symbols/Emblems": ["clutch", "accessory", "pouch"],
  "Pattern/Abstract": ["clutch", "pouch", "accessory"],
  "Vehicles/Transport": ["crossbody", "satchel", "hobo"],
  "Food & Drink": ["pouch", "accessory", "clutch"],
  "Other": ["satchel", "crossbody", "pouch"],
};

export type CatalogRow = {
  ["Artwork Name"]: string;
  ["Product Name"]: string;
  ["Product URL"]?: string;
  ["Image URL"]?: string;
  ["Price"]?: string | number;
  ["Themes"]?: string; // Excel value
};

export function strictFilter(
  rows: CatalogRow[],
  userThemeRaw: string,
  userBagRaw?: string | null
) {
  const t = normalizeTheme(userThemeRaw);
  const bag = userBagRaw ? normalizeBagType(userBagRaw) : null;
  const allowed = allowedBagsForTheme[t];

  // HARD VALIDATION: Ensure user's bag type is allowed for the theme
  const validatedBag = bag && allowed.includes(bag) ? bag : null;
  const suggestedBagType = validatedBag || allowed[0]; // Always use allowed[T][0] as fallback

  // Step 1: Theme lock - EXACT MATCH ONLY
  const themeLocked = rows.filter(r => {
    const rowTheme = normalizeTheme(r["Themes"] || "");
    return rowTheme === t; // Exact theme match only
  });

  // Step 2: Bag lock - STRICT VALIDATION
  const afterBag = themeLocked.filter(r => {
    const inferred = normalizeBagType(r["Product Name"] || "") as CanonBag | null;
    if (!inferred) return false; // Must infer a bag subtype
    
    // HARD RULE: Only allow items whose bag type is in allowed[T]
    if (!allowed.includes(inferred)) return false;
    
    // If user specified a bag type, it must match exactly (and be validated)
    if (validatedBag) {
      return inferred === validatedBag;
    }
    
    // Otherwise, accept any allowed bag type
    return true;
  });

  // HARD VALIDATION: Double-check all items comply with constraints
  const validatedItems = afterBag.filter(r => {
    const rowTheme = normalizeTheme(r["Themes"] || "");
    const inferredBag = normalizeBagType(r["Product Name"] || "") as CanonBag | null;
    
    // Must have exact theme match
    if (rowTheme !== t) return false;
    
    // Must have valid bag type
    if (!inferredBag || !allowed.includes(inferredBag)) return false;
    
    // If user specified bag type, must match exactly
    if (validatedBag && inferredBag !== validatedBag) return false;
    
    return true;
  });

  // Sort items by Product Name for consistent ordering
  const sortedItems = validatedItems.sort((a, b) => 
    (a["Product Name"] || '').localeCompare(b["Product Name"] || '')
  );

  return {
    theme: t,
    bag: validatedBag ?? "auto",
    suggestedBagType, // Always valid for the theme
    allowedBags: allowed, // For reference
    counts: {
      total: rows.length,
      themeLocked: themeLocked.length,
      final: validatedItems.length,
    },
    allThemeOk: validatedItems.every(r => normalizeTheme(r["Themes"] || "") === t),
    allBagOk: validatedItems.every(r => {
      const inferred = normalizeBagType(r["Product Name"] || "") as CanonBag | null;
      return inferred && allowed.includes(inferred) && (!validatedBag || inferred === validatedBag);
    }),
    items: sortedItems,
  };
}
