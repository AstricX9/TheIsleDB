document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('main-search');
    const searchResults = document.getElementById('search-results');
    let indexData = [];

    async function loadDinosaurFiles() {
        try {
            const rosterResponse = await fetch('data/dinosaurs/roster.json');
            if (!rosterResponse.ok) throw new Error('Roster not found');
            const roster = await rosterResponse.json();
            return roster.map(item => item.slug).filter(Boolean);
        } catch (error) {
            return ['carnotaurus', 'tyrannosaurus'];
        }
    }

    // 1. Build the search index directly from the Markdown files
    try {
        // Define the categories and their paths
        const categories = [
            { name: 'dinosaurs', path: 'content/dinosaurs' },
            { name: 'mechanics', path: 'content/mechanics' },
            { name: 'support', path: 'content/support' },
            { name: 'upcoming', path: 'content/upcoming' }
        ];

        // Fetch all markdown files from all categories
        for (const category of categories) {
            try {
                // Try to fetch the directory listing (this may not work in all environments)
                // For now, we'll use a known list of files per category
                let files = [];
                
                if (category.name === 'dinosaurs') {
                    files = await loadDinosaurFiles();
                } else if (category.name === 'mechanics') {
                    files = ['mutations', 'gore-and-decay', 'health-and-injuries', 'hunting-and-ai', 'illnesses', 'keybinds', 'movement', 'packs-and-herds', 'stamina', 'wallowing', 'diet-and-nutrients', 'courting-and-nesting', 'elder-system', 'entomb', 'fighting-and-effects', 'fishing-and-foraging', 'gathering-and-flora', 'migrations-and-patrol-zones', 'navigation', 'sanctuary', 'vulnona-map'];
                } else if (category.name === 'support') {
                    files = ['lore', 'bugs-and-fixes', 'community'];
                } else if (category.name === 'upcoming') {
                    files = ['upcoming-creatures', 'speculations'];
                }

                // Fetch all markdown files in this category in parallel
                const responses = await Promise.all(
                    files.map(file => fetch(`${category.path}/${file}.md`))
                );

                for (const response of responses) {
                    if (response.ok) {
                        const text = await response.text();
                        // We reuse your ContentParser to extract the document frontmatter.
                        const parsed = ContentParser.parseDocument(text);
                        const data = parsed.data;
                        const content = parsed.content;
                        if (category.name === 'dinosaurs' && !data.title) {
                            try {
                                const metadataResponse = await fetch(`data/dinosaurs/${file}/metadata.toml`);
                                if (metadataResponse.ok) {
                                    Object.assign(data, ContentParser.parseToml(await metadataResponse.text()));
                                }
                            } catch (error) {
                                console.warn(`Failed to load metadata for ${file}:`, error);
                            }
                        }

                        // We strip out markdown formatting for an even cleaner text body
                        const cleanContent = content.replace(/[#>*_\[\]`-]/g, '').trim();

                        // Determine URL based on category
                        let url;
                        if (data.category === 'dinosaurs') {
                            url = `dinosaur.html?dino=${data.slug || ''}`;
                        } else {
                            url = `page.html?category=${data.category}&slug=${data.slug || ''}`;
                        }

                        indexData.push({
                            id: data.slug || '',
                            title: data.title || 'Unknown',
                            type: data.category || 'Unknown',
                            url: url,
                            description: cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : ''),
                            keywords: [
                                data.slug,
                                data.title,
                                data.category
                            ].filter(Boolean),
                            fullText: cleanContent.toLowerCase(),
                            rawText: cleanContent
                        });
                    }
                }
            } catch (e) {
                console.warn(`Failed to load category ${category.name}:`, e);
            }
        }

        searchInput.placeholder = "Search dinosaurs, guides, maps...";
        searchInput.disabled = false;
    } catch (e) {
        console.error("Failed to build search index:", e);
        searchInput.placeholder = "Error loading search...";
    }

    // 2. Add event listener for filtering
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // Clear results if empty
        if (!query) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        // Filter index data
        const results = indexData.filter(item => {
            const matchesTitle = (item.title || '').toLowerCase().includes(query);
            const matchesType = (item.type || '').toLowerCase().includes(query);

            const matchesKeywords = (item.keywords || []).some(kw =>
                (kw || '').toLowerCase().includes(query)
            );

            const matchesFullText = (item.fullText || '').includes(query);

            return matchesTitle || matchesType || matchesKeywords || matchesFullText;
        });

        // Display results
        if (results.length > 0) {
            searchResults.innerHTML = results.map(item => {
                let displayDesc = item.description;

                // If it was a deep text match, create a contextual snippet
                const matchIndex = item.fullText.indexOf(query);
                if (matchIndex !== -1) {
                    const startLength = 30;
                    const endLength = 40;
                    let start = Math.max(0, matchIndex - startLength);
                    let end = Math.min(item.rawText.length, matchIndex + query.length + endLength);

                    // Create snippet, sanitize newline block formatting
                    let snippet = item.rawText.substring(start, end).replace(/\s+/g, ' ');
                    if (start > 0) snippet = '...' + snippet;
                    if (end < item.rawText.length) snippet = snippet + '...';
                    displayDesc = snippet;
                }

                // Bold the matched keyword wherever it appears (description, snippet, title, or type)
                const regex = new RegExp(`(${query})`, 'gi');
                const highlightTag = '<strong style="color: #fff; background: rgba(255,255,255,0.15); padding: 0 2px; border-radius: 2px;">$1</strong>';

                displayDesc = displayDesc.replace(regex, highlightTag);
                const displayTitle = item.title.replace(regex, highlightTag);
                const displayType = item.type.replace(regex, highlightTag);

                return `
                <a href="${item.url}" class="search-result-item">
                    <div class="result-title">${displayTitle} <span class="result-type badge">${displayType}</span></div>
                    <div class="result-desc">${displayDesc}</div>
                </a>
                `;
            }).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = `<div class="search-result-item"><div class="result-desc">No results found for "${query}"</div></div>`;
            searchResults.style.display = 'block';
        }
    });

    // 3. Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // 4. Show results again if clicking on input and there is a query
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() && searchResults.innerHTML !== '') {
            searchResults.style.display = 'block';
        }
    });
});
