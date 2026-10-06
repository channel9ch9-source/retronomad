export const CATALOGUE_SCHEMA_VERSION = 1;

export const SUPPORTED_PLATFORMS = Object.freeze({
  PS1: Object.freeze({ id: "PS1", name: "PlayStation", manufacturer: "Sony" }),
  PS2: Object.freeze({ id: "PS2", name: "PlayStation 2", manufacturer: "Sony" }),
  Dreamcast: Object.freeze({ id: "Dreamcast", name: "Dreamcast", manufacturer: "Sega" })
});

export const RELEASE_INTELLIGENCE_COVERAGE = Object.freeze([
  "BASE_ONLY",
  "PALSCOUT_PARTIAL",
  "PALSCOUT_DEEP"
]);

export function normalizeCatalogueTitle(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugifyCatalogueValue(value) {
  return normalizeCatalogueTitle(value).replace(/\s+/g, "-");
}

export function makeCatalogueId(platform, title) {
  if (!SUPPORTED_PLATFORMS[platform]) throw new Error(`Unsupported platform: ${platform}`);
  const slug = slugifyCatalogueValue(title);
  if (!slug) throw new Error("Catalogue title cannot be empty");
  return `${platform.toLowerCase()}:${slug}`;
}

export function validateCatalogueGame(game) {
  const errors = [];
  if (!game || typeof game !== "object") return ["game must be an object"];
  if (!String(game.id || "").trim()) errors.push("id is required");
  if (!String(game.title || "").trim()) errors.push("title is required");
  if (!SUPPORTED_PLATFORMS[game.platform]) errors.push(`unsupported platform: ${game.platform}`);
  if (!Array.isArray(game.aliases)) errors.push("aliases must be an array");
  if (game.releaseYear != null && (!Number.isInteger(game.releaseYear) || game.releaseYear < 1980 || game.releaseYear > 2100)) {
    errors.push("releaseYear must be null or a reasonable integer year");
  }
  const coverage = game.releaseIntelligence?.coverage || "BASE_ONLY";
  if (!RELEASE_INTELLIGENCE_COVERAGE.includes(coverage)) errors.push(`invalid release intelligence coverage: ${coverage}`);
  if (game.artwork != null && typeof game.artwork !== "object") errors.push("artwork must be null or an object");
  if (game.externalRefs != null && typeof game.externalRefs !== "object") errors.push("externalRefs must be an object");
  if (!Array.isArray(game.provenance)) errors.push("provenance must be an array");
  return errors;
}

export function validateCatalogue(document) {
  const errors = [];
  if (!document || typeof document !== "object") return { ok: false, errors: ["catalogue must be an object"] };
  if (document.schemaVersion !== CATALOGUE_SCHEMA_VERSION) errors.push(`schemaVersion must be ${CATALOGUE_SCHEMA_VERSION}`);
  if (!Array.isArray(document.games)) errors.push("games must be an array");
  if (errors.length) return { ok: false, errors };

  const ids = new Set();
  for (let index = 0; index < document.games.length; index++) {
    const game = document.games[index];
    for (const error of validateCatalogueGame(game)) errors.push(`games[${index}]: ${error}`);
    if (game?.id) {
      if (ids.has(game.id)) errors.push(`duplicate game id: ${game.id}`);
      ids.add(game.id);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function buildCatalogueSearchIndex(document) {
  const validation = validateCatalogue(document);
  if (!validation.ok) throw new Error(`Invalid catalogue: ${validation.errors.join("; ")}`);
  return document.games
    .map(game => ({
      id: game.id,
      title: game.title,
      platform: game.platform,
      aliases: [...game.aliases],
      releaseYear: game.releaseYear ?? null,
      coverage: game.releaseIntelligence?.coverage || "BASE_ONLY"
    }))
    .sort((a,b) => a.title.localeCompare(b.title) || a.platform.localeCompare(b.platform));
}

export function findCatalogueMatches(index, query, platform = "") {
  const q = normalizeCatalogueTitle(query);
  if (!q) return [];
  return (index || [])
    .filter(game => !platform || game.platform === platform)
    .map(game => {
      const title = normalizeCatalogueTitle(game.title);
      const aliases = (game.aliases || []).map(normalizeCatalogueTitle);
      let score = 0;
      if (title === q) score = 100;
      else if (aliases.includes(q)) score = 95;
      else if (title.startsWith(q)) score = 80;
      else if (aliases.some(alias => alias.startsWith(q))) score = 75;
      else if (title.includes(q)) score = 60;
      else if (aliases.some(alias => alias.includes(q))) score = 55;
      return { game, score };
    })
    .filter(row => row.score > 0)
    .sort((a,b) => b.score - a.score || a.game.title.localeCompare(b.game.title))
    .map(row => row.game);
}
