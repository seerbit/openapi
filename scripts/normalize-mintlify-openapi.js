const fs = require("fs");
const YAML = require("yaml");

const file = process.argv[2] || "specs/external-api.yml";
const source = fs.readFileSync(file, "utf8");
const spec = YAML.parse(source);

function parseBodyFields(description) {
  const lines = description.split("\n");
  const fields = [];
  const keptLines = [];
  let removedTable = false;

  for (let index = 0; index < lines.length; index += 1) {
    if (
      !/^\s*\|\s*Field\s*\|/i.test(lines[index]) ||
      !lines[index + 1]?.includes("|---")
    ) {
      keptLines.push(lines[index]);
      continue;
    }

    removedTable = true;
    for (
      index += 2;
      index < lines.length && /^\s*\|/.test(lines[index]);
      index += 1
    ) {
      const cells = lines[index]
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.length < 4) continue;

      const name = cells[0].replace(/^`|`$/g, "");
      const type = cells[1].toLowerCase();
      if (!name || name.startsWith("(") || name.startsWith("*") || name === "—")
        continue;
      if (!/^[A-Za-z][A-Za-z0-9_.[\]-]*$/.test(name)) continue;

      const propertyName = name.replace(/\[\]$/, "").replace(/\.[^.]+$/, "");
      if (fields.some((field) => field.name === propertyName)) continue;

      fields.push({
        name: propertyName,
        type: ["number", "integer", "boolean", "array"].includes(type)
          ? type
          : "string",
        description: cells[3],
        required: /^yes\b/i.test(cells[2]),
      });
    }
    index -= 1;
  }

  if (!removedTable) return { description, fields };

  const withoutTable = keptLines
    .join("\n")
    .replace(/\*\*Body fields[^\n]*\*\*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { description: withoutTable, fields };
}

let normalized = 0;
const tagDescriptions = Object.fromEntries(
  (spec.tags || [])
    .map((tag) => [tag.name, tag.description])
    .filter(([, description]) => description),
);

for (const path of Object.keys(spec.paths || {})) {
  for (const operation of Object.values(spec.paths[path] || {})) {
    if (!operation || typeof operation !== "object" || !operation.requestBody)
      continue;
    const mediaType = operation.requestBody.content?.["application/json"];
    if (!mediaType || !mediaType.schema || operation.description == null)
      continue;

    const sourceDescription =
      operation.requestBody.description || operation.description;
    if (!operation.requestBody.description) {
      operation.requestBody.description = sourceDescription;
      const pageDescription = operation.tags
        ?.map((tag) => tagDescriptions[tag])
        .find(Boolean);
      if (pageDescription) operation.description = pageDescription;
    }

    const parsed = parseBodyFields(sourceDescription);
    if (
      !parsed.fields.length &&
      (mediaType.schema.properties || mediaType.schema.type === "array")
    )
      continue;
    const example = Object.values(mediaType.examples || {})[0]?.value;
    const exampleObject = Array.isArray(example) ? example[0] : example;
    const exampleFields =
      !parsed.fields.length &&
      exampleObject &&
      typeof exampleObject === "object"
        ? Object.entries(exampleObject).map(([name, value]) => ({
            name,
            type: Array.isArray(value)
              ? "array"
              : value === null
                ? "string"
                : typeof value,
            description: undefined,
            required: false,
          }))
        : [];
    const fields = parsed.fields.length ? parsed.fields : exampleFields;
    if (!fields.length) continue;

    operation.description = parsed.description;
    const itemSchema = {
      type: "object",
      properties: Object.fromEntries(
        fields.map((field) => [
          field.name,
          Object.assign(
            { type: field.type },
            field.description ? { description: field.description } : {},
          ),
        ]),
      ),
    };
    const required = fields
      .filter((field) => field.required)
      .map((field) => field.name);
    if (required.length) itemSchema.required = required;
    mediaType.schema = Array.isArray(example)
      ? { type: "array", items: itemSchema }
      : itemSchema;
    normalized += 1;
  }
}

fs.writeFileSync(file, YAML.stringify(spec));
console.log(`Normalized ${normalized} request-body schemas in ${file}`);
