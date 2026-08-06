import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW_DIR = join(ROOT, "src/icons/raw");
const OUT_DIR = join(ROOT, "src/icons/generated");

const RE_SVG_EXT = /\.svg$/;
const RE_VIEWBOX = /viewBox="([^"]+)"/;
const RE_SVG_INNER = /<svg[^>]*>([\s\S]*?)<\/svg>\s*$/;
const RE_SVG_OPEN_TAG = /<svg([^>]*)>/;
const RE_ROOT_FILL = /\bfill="([^"]+)"/;
const RE_HYPHEN_ATTR = /([a-zA-Z][\w]*(?:-[a-zA-Z][\w]*)+)=/g;
const RE_KEBAB = /-([a-z])/g;

function jsxifyAttrs(svg: string): string {
  return svg.replace(RE_HYPHEN_ATTR, (match, attr: string) => {
    if (attr.startsWith("data-") || attr.startsWith("aria-")) {
      return match;
    }
    return `${attr.replace(RE_KEBAB, (_, c: string) => c.toUpperCase())}=`;
  });
}

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

function toComponentName(filename: string): string {
  return `${filename
    .replace(RE_SVG_EXT, "")
    .split("-")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("")}Icon`;
}

function extractViewBox(svg: string): string {
  const match = RE_VIEWBOX.exec(svg);
  return match ? match[1] : "0 0 24 24";
}

function extractInnerContent(svg: string): string {
  const match = RE_SVG_INNER.exec(svg);
  return match ? match[1].trim() : "";
}

function extractRootFill(svg: string): string | null {
  const openTag = RE_SVG_OPEN_TAG.exec(svg);
  if (!openTag) {
    return null;
  }
  const fillMatch = RE_ROOT_FILL.exec(openTag[1]);
  return fillMatch ? fillMatch[1] : null;
}

function generateComponent(
  name: string,
  viewBox: string,
  inner: string,
  sourceFile: string,
  rootFill: string | null
): string {
  const fillAttr = rootFill === null ? "" : `\n\t\t\tfill="${rootFill}"`;
  return `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Source: src/icons/raw/${sourceFile}
import type { IconProps } from "../icon-props";

export function ${name}({
	size = 20,
	className,
	...props
}: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="${viewBox}"${fillAttr}
			aria-hidden="true"
			className={className}
			{...props}
		>
			${inner}
		</svg>
	);
}
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  rmSync(join(OUT_DIR, f));
}

const svgFiles = readdirSync(RAW_DIR).filter((f) => RE_SVG_EXT.test(f));

if (svgFiles.length === 0) {
  // biome-ignore lint/suspicious/noConsole: script output
  console.log(`${red("[err]")} no SVG files found in src/icons/raw/`);
  process.exit(0);
}

// biome-ignore lint/suspicious/noConsole: script output
console.log(`${dim("[")}gen${dim("]")} ${svgFiles.length} file(s) found\n`);

let generated = 0;

type IconMeta = { name: string; componentName: string };
const generatedIcons: IconMeta[] = [];

for (const file of svgFiles) {
  const raw = readFileSync(join(RAW_DIR, file), "utf-8").replace(
    /(<\/svg>)[\s\S]*$/i,
    "$1"
  );

  const rootFill = extractRootFill(raw);

  const result = optimize(raw, {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      {
        name: "convertColors",
        params: {
          currentColor: true,
        },
      },
    ],
  });

  const optimized = result.data;
  const viewBox = extractViewBox(optimized);
  const inner = jsxifyAttrs(extractInnerContent(optimized));
  const name = basename(file).replace(RE_SVG_EXT, "");
  const componentName = toComponentName(basename(file));
  const outFile = `${name}.tsx`;

  const content = generateComponent(
    componentName,
    viewBox,
    inner,
    file,
    rootFill
  );
  writeFileSync(join(OUT_DIR, outFile), content, "utf-8");

  generatedIcons.push({ componentName, name });

  // biome-ignore lint/suspicious/noConsole: script output
  console.log(
    `  ${green("ok")}  ${dim(file)} ${dim("→")} ${outFile}  ${dim(componentName)}`
  );
  generated += 1;
}

const sorted = [...generatedIcons].sort((a, b) => a.name.localeCompare(b.name));

const metadataContent = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
// Run \`pnpm gen:icons\` to regenerate.
import type React from "react";
import type { IconProps } from "../icon-props";

${sorted.map((i) => `import { ${i.componentName} } from "./${i.name}";`).join("\n")}

export type IconEntry = { name: string; Component: React.ComponentType<IconProps> };

export const iconGallery: IconEntry[] = [
${sorted.map((i) => `  { name: "${i.name}", Component: ${i.componentName} },`).join("\n")}
];
`;

writeFileSync(join(OUT_DIR, "icon-metadata.ts"), metadataContent, "utf-8");

// biome-ignore lint/suspicious/noConsole: script output
console.log(
  `\n${dim("[")}done${dim("]")} ${bold(String(generated))} generated  ${dim("src/icons/generated/")}`
);
