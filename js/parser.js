class ContentParser {
    /**
     * Parses a custom hybrid Markdown file containing JSON frontmatter.
     * Expects format:
     * ---json
     * { "key": "value" }
     * ---
     * # Markdown Content
     * 
     * @param {string} fileContent Raw text of the .md file 
     * @returns {Object} Object containing { data: Object, content: String }
     */
    static parseDocument(fileContent) {
        const regex = /^---json\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
        const match = fileContent.match(regex);
        
        if (!match) {
            console.warn("Could not find properly formatted JSON frontmatter. Make sure it starts with '---json' and ends with '---'");
            return { data: {}, content: fileContent };
        }

        try {
            const rawJson = match[1];
            const markdownContext = match[2];
            return {
                data: JSON.parse(rawJson),
                content: markdownContext.trim()
            };
        } catch(e) {
            console.error("Failed to parse JSON block entirely.", e);
            return { data: {}, content: fileContent };
        }
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
    } catch(err) {
        console.error("Failed to fetch or parse dinosaur data", err);
    }
}