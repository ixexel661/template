#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro"]);
const SKIP_FILES = new Set(["pnpm-lock.yaml"]);
const TEXT_EXTENSIONS = new Set([
	".astro",
	".js",
	".json",
	".md",
	".mdx",
	".mjs",
	".ts",
	".yaml",
	".yml",
]);

/** Current placeholders shipped with the template. */
const PLACEHOLDER_SCOPE = "@template/";
const PLACEHOLDER_REPO = "ixexel661/template";
const PLACEHOLDER_AUTHOR = "ixexel661";

function tryGit(command) {
	try {
		return execSync(command, { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
			.toString()
			.trim();
	} catch {
		return "";
	}
}

/** Derive sensible defaults from the git remote and the folder name. */
function deriveDefaults() {
	const remote = tryGit("git remote get-url origin");
	const match = remote.match(/[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
	const owner = match?.[1] ?? "";
	const repoName = match?.[2] ?? root.split(/[\\/]/).pop() ?? "";
	return {
		scope: owner || repoName,
		author: owner,
		repo: owner && repoName ? `${owner}/${repoName}` : "",
	};
}

function walk(dir, files = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), files);
		} else if (
			!SKIP_FILES.has(entry.name) &&
			TEXT_EXTENSIONS.has(extname(entry.name))
		) {
			files.push(join(dir, entry.name));
		}
	}
	return files;
}

async function main() {
	const defaults = deriveDefaults();
	const rl = createInterface({ input: process.stdin, output: process.stdout });

	const ask = async (label, fallback) => {
		const suffix = fallback ? ` (${fallback})` : "";
		const answer = (await rl.question(`${label}${suffix}: `)).trim();
		return answer || fallback;
	};

	console.log("\nConfigure this template for your project.\n");
	const rawScope = await ask("npm scope (without @)", defaults.scope);
	const author = await ask("author", defaults.author);
	const repo = await ask("repository (owner/name)", defaults.repo);

	const scope = rawScope.replace(/^@/, "");
	if (!scope) {
		console.error("A scope is required. Aborting.");
		rl.close();
		process.exitCode = 1;
		return;
	}

	let changed = 0;
	for (const file of walk(root)) {
		const original = readFileSync(file, "utf8");
		let next = original.split(PLACEHOLDER_SCOPE).join(`@${scope}/`);
		if (repo) next = next.split(PLACEHOLDER_REPO).join(repo);
		if (author) {
			next = next.replaceAll(
				`"author": "${PLACEHOLDER_AUTHOR}"`,
				`"author": "${author}"`,
			);
		}
		if (next !== original) {
			writeFileSync(file, next);
			changed++;
		}
	}

	console.log(`\nUpdated ${changed} file(s).`);

	const cleanup = (
		await ask("Remove the setup script now? [Y/n]", "Y")
	).toLowerCase();
	if (cleanup !== "n") {
		removeSelf();
		console.log("Removed scripts/setup.mjs and its package.json/knip entries.");
	}

	rl.close();

	console.log("\nNext steps:");
	console.log("  1. pnpm install   # relink the workspace under the new scope");
	console.log("  2. pnpm check:fix\n");
}

function removeSelf() {
	const pkgPath = join(root, "package.json");
	const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
	if (pkg.scripts) delete pkg.scripts.setup;
	writeFileSync(pkgPath, `${JSON.stringify(pkg, null, "\t")}\n`);

	const knipPath = join(root, "knip.json");
	const knip = JSON.parse(readFileSync(knipPath, "utf8"));
	const entry = knip.workspaces?.["."]?.entry;
	if (Array.isArray(entry)) {
		knip.workspaces["."].entry = entry.filter((e) => e !== "scripts/setup.mjs");
	}
	writeFileSync(knipPath, `${JSON.stringify(knip, null, "\t")}\n`);

	rmSync(fileURLToPath(import.meta.url));
	const scriptsDir = join(root, "scripts");
	if (readdirSync(scriptsDir).length === 0) {
		rmSync(scriptsDir, { recursive: true });
	}
}

main();
