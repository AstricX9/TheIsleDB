# TheIsleDB

A community wiki for **The Isle: Evrima**: dinosaur stats, calls and skins, plus game mechanics. It is a static site (plain HTML, CSS and JS, with Markdown and TOML content), so there is no build step.

Live site: https://theisledb.netlify.app/

## Help fill it in

Most mechanics pages are still stubs, and several dinosaurs have empty sections. Pages with missing data show a **"This page needs info"** banner.

- **Know something?** Open any page and click **Suggest a fix**. It opens a prefilled GitHub issue, so you don't need to edit any files.
- **Want to edit directly?** Click **Edit this page**. GitHub forks the repo and opens a pull request for you.
- Cite a source for numbers: patch notes, the official roadmap, or an in-game test with the game version.

## Run locally

Requires [Node.js](https://nodejs.org/).

```bash
node scripts/static-server.mjs
```

Then open http://localhost:5174/. A different port can be passed as an argument.

## Layout

| Path | What it is |
|------|------------|
| `content/<category>/<slug>.md` | Page text. A JSON front-matter block, then Markdown. Categories: `dinosaurs`, `mechanics`, `support`, `ui`, `upcoming`. |
| `data/dinosaurs/<name>/*.toml` | Per-dinosaur data: attacks, biomes, calls, mutations, nesting, and so on. |
| `data/navbar.json`, `data/footer.json` | Site navigation and footer. |
| `assets/` | Images and dinosaur call audio. See `assets/images/README.md`. |
| `page.html`, `dinosaur.html`, `article.html` | Page templates. They are filled from the `?category=&slug=` or `?dino=` URL. |
| `js/`, `css/` | Rendering code and styles. |
| `admin/` | Optional [Decap CMS](https://decapcms.org/) editor. |
| `scripts/` | Local server and the dinosaur data generator. |

### Adding a page

Copy `TEMPLATE.md` to `content/<category>/<slug>.md` and fill it in. Then add a link in `data/navbar.json`.

Pages support extra syntax:

- Key and mouse chips: `{{key|W + LMB}}`
- Floating images: `![right|md|Alt text|Caption](path.png)`

## Dinosaur data generator

`scripts/generate-dinosaur-data.mjs` builds the dinosaur data from a local export of the game files. Set `THE_ISLE_EXPORT_ROOT` to your export folder before running it. It rewrites `content/dinosaurs/*.md` and the data files, so **hand edits to those files are lost when it runs**. Commit or back up first.

## License

GNU GPL v2. See [LICENSE](LICENSE). Game names, art and audio belong to their owners (Afterthought LLC).
