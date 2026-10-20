class ContentParser {
    /**
     * Parses a custom hybrid Markdown file containing JSON or TOML frontmatter.
     * Expects format:
     * ---json or ---toml
     * { "key": "value" } or key = "value"
     * ---
     * # Markdown Content
     *
     * @param {string} fileContent Raw text of the .md file
     * @returns {Object} Object containing { data: Object, content: String }
     */
    static parseDocument(fileContent) {
        const normalized = fileContent.replace(/^\uFEFF/, '');
        const regex = /^\uFEFF?---(json|toml)\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n([\s\S]*))?$/;
        const match = normalized.match(regex);

        if (!match) {
            if (/^---/.test(normalized)) {
                console.warn("Could not find properly formatted frontmatter. Make sure it starts with '---json' or '---toml' and ends with '---'");
            }
            return { data: {}, content: ContentParser.normalizeImagePaths(normalized) };
        }

        try {
            const format = match[1];
            const rawFrontmatter = match[2];
            const markdownContext = match[3] || '';
            return {
                data: format === 'toml' ? ContentParser.parseToml(rawFrontmatter) : JSON.parse(rawFrontmatter),
                content: ContentParser.normalizeImagePaths(markdownContext.trim())
            };
        } catch (e) {
            console.error("Failed to parse frontmatter block entirely.", e);
            return { data: {}, content: ContentParser.normalizeImagePaths(normalized) };
        }
    }

    static parseToml(source) {
        const result = {};
        let currentPath = [];

        for (const rawLine of source.split(/\r?\n/)) {
            const line = rawLine.trim();
            if (!line || line.startsWith('#')) continue;

            const arrayTable = line.match(/^\[\[([^\]]+)\]\]$/);
            if (arrayTable) {
                const path = arrayTable[1].split('.');
                const key = path.pop();
                const parent = ContentParser.getTomlTable(result, path);
                if (!Array.isArray(parent[key])) parent[key] = [];
                const entry = {};
                parent[key].push(entry);
                currentPath = path.concat(key);
                continue;
            }

            const table = line.match(/^\[([^\]]+)\]$/);
            if (table) {
                currentPath = table[1].split('.');
                ContentParser.getTomlTable(result, currentPath);
                continue;
            }

            const assignment = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.*)$/);
            if (!assignment) throw new Error(`Invalid TOML line: ${rawLine}`);

            const target = ContentParser.getTomlTable(result, currentPath);
            target[assignment[1]] = ContentParser.parseTomlValue(assignment[2]);
        }

        return result;
    }

    static getTomlTable(root, path) {
        return path.reduce((table, key) => {
            if (!table[key] || typeof table[key] !== 'object') table[key] = {};
            return Array.isArray(table[key]) ? table[key][table[key].length - 1] : table[key];
        }, root);
    }

    static parseTomlValue(value) {
        const trimmed = value.trim();
        if (trimmed === '{}') return {};
        if (trimmed === '[]') return [];
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return JSON.parse(trimmed);
        }
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return JSON.parse(trimmed.replace(/'/g, '"'));
        }
        if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return Number(trimmed);
        throw new Error(`Unsupported TOML value: ${value}`);
    }

    /** Rewrite relative asset paths to site-root paths for consistent loading. */
    static normalizeImagePaths(content) {
        if (!content) return content;
        return content
            .replace(/\]\(\.\/assets\/images\//g, '](/assets/images/')
            .replace(/src="\.\/assets\/images\//g, 'src="/assets/images/')
            .replace(/\]\(assets\/images\//g, '](/assets/images/')
            .replace(/src="assets\/images\//g, 'src="/assets/images/');
    }
}

// Example usage to render a dinosaur page dynamically:
async function loadDinosaur(id) {
    try {
        const response = await fetch(`/content/dinosaurs/${id}.md`);
        const text = await response.text();
        const { data, content } = ContentParser.parseDocument(text);

        console.log("Parsed Data:", data);

        // At this point, simply inject 'data.adultStats.weight', etc., into your
        // HTML templates, and parse 'content' via a standard Markdown-to-HTML parser (like marked.js)

        return { data, content };
    } catch (err) {
        console.error("Failed to fetch or parse dinosaur data", err);
    }
}
