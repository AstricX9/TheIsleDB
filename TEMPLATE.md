# Page template

Every page is two files with the same name. The Markdown file holds only the article text, and the TOML file holds the metadata.

## Articles (mechanics, support, ui, upcoming)

`content/<category>/<slug>.toml`

```toml
title = "Page Title"
date = "YYYY-MM-DD"
```

`content/<category>/<slug>.md`

```markdown
Plain Markdown, with no front matter.

## A section

Text here.
```

The category and slug come from the folder and file name. The page is served at `page.html?category=<category>&slug=<slug>`.

## Dinosaurs

`content/dinosaurs/<slug>.md` is plain Markdown. All of its data lives in `data/dinosaurs/<slug>/`:

| File | Contents |
|------|----------|
| `metadata.toml` | title, date, description, hero image, `[lastUpdated]` |
| `attacks.toml`, `biome.toml`, `calls.toml`, `classification.toml`, `mutations.toml`, `nesting.toml`, `appearance.toml` | The matching page sections |
| `manifest.txt` | Which of the files above the page loads |

Copy an existing dinosaur folder, such as `data/dinosaurs/troodon/`, as a starting point.
