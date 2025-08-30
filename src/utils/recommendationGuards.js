"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedBagsForTheme = exports.normalizeBagType = exports.normalizeTheme = void 0;
exports.strictFilter = strictFilter;
const normalizeTheme = (s) => {
    const t = (s || "").trim().toLowerCase();
    const map = {
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
                                t.includes("food") || t.includes("drink") ? "Food & Drink" : "Other"));
};
exports.normalizeTheme = normalizeTheme;
const normalizeBagType = (s) => {
    const v = (s || "").trim().toLowerCase();
    if (!v)
        return null;
    if (/\b(cross[- ]?body|sling|messenger)\b/.test(v))
        return "crossbody";
    if (/\bhobo\b/.test(v))
        return "hobo";
    if (/\b(satchel|tote|shopper)\b/.test(v))
        return "satchel";
    if (/\b(wallet|card holder|cardholder|money clip)\b/.test(v))
        return "wallet";
    if (/\b(clutch|evening)\b/.test(v))
        return "clutch";
    if (/\b(pouch|organizer|cosmetic|makeup|kit|tech pouch)\b/.test(v))
        return "pouch";
    if (/\b(charm|keychain|strap|scarf|twilly|accessor)/.test(v))
        return "accessory";
    return null;
};
exports.normalizeBagType = normalizeBagType;
exports.allowedBagsForTheme = {
    "Animal": ["crossbody", "satchel", "hobo"],
    "Flowers/Plants": ["clutch", "pouch", "satchel"],
    "Nature/Landscape": ["crossbody", "satchel", "hobo"],
    "Symbols/Emblems": ["clutch", "accessory", "pouch"],
    "Pattern/Abstract": ["clutch", "pouch", "accessory"],
    "Vehicles/Transport": ["crossbody", "satchel", "hobo"],
    "Food & Drink": ["pouch", "accessory", "clutch"],
    "Other": ["satchel", "crossbody", "pouch"],
};
function strictFilter(rows, userThemeRaw, userBagRaw) {
    const t = (0, exports.normalizeTheme)(userThemeRaw);
    const bag = userBagRaw ? (0, exports.normalizeBagType)(userBagRaw) : null;
    const allowed = exports.allowedBagsForTheme[t];
    const validatedBag = bag && allowed.includes(bag) ? bag : null;
    const suggestedBagType = validatedBag || allowed[0];
    const themeLocked = rows.filter(r => {
        const rowTheme = (0, exports.normalizeTheme)(r["Themes"] || "");
        return rowTheme === t;
    });
    const afterBag = themeLocked.filter(r => {
        const inferred = (0, exports.normalizeBagType)(r["Product Name"] || "");
        if (!inferred)
            return false;
        if (!allowed.includes(inferred))
            return false;
        if (validatedBag) {
            return inferred === validatedBag;
        }
        return true;
    });
    const validatedItems = afterBag.filter(r => {
        const rowTheme = (0, exports.normalizeTheme)(r["Themes"] || "");
        const inferredBag = (0, exports.normalizeBagType)(r["Product Name"] || "");
        if (rowTheme !== t)
            return false;
        if (!inferredBag || !allowed.includes(inferredBag))
            return false;
        if (validatedBag && inferredBag !== validatedBag)
            return false;
        return true;
    });
    const sortedItems = validatedItems.sort((a, b) => (a["Product Name"] || '').localeCompare(b["Product Name"] || ''));
    return {
        theme: t,
        bag: validatedBag ?? "auto",
        suggestedBagType,
        allowedBags: allowed,
        counts: {
            total: rows.length,
            themeLocked: themeLocked.length,
            final: validatedItems.length,
        },
        allThemeOk: validatedItems.every(r => (0, exports.normalizeTheme)(r["Themes"] || "") === t),
        allBagOk: validatedItems.every(r => {
            const inferred = (0, exports.normalizeBagType)(r["Product Name"] || "");
            return inferred && allowed.includes(inferred) && (!validatedBag || inferred === validatedBag);
        }),
        items: sortedItems,
    };
}
