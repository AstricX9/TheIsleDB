document.addEventListener('DOMContentLoaded', async () => {
    // Get category and slug from URL parameters
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || 'mechanics';
    const slug = params.get('slug') || 'mutations';

    try {
        const [response, metaResponse] = await Promise.all([
            fetch(`content/${category}/${slug}.md`),
            fetch(`content/${category}/${slug}.toml`)
        ]);
        if (!response.ok) throw new Error('Page not found');

        const parsed = ContentParser.parseDocument(await response.text());
        const content = parsed.content;
        // legacy frontmatter (e.g. written by the Decap CMS) still works when there is no .toml
        const data = metaResponse.ok ? ContentParser.parseToml(await metaResponse.text()) : parsed.data;

        renderPage(data, content);
    } catch (err) {
        console.error(err);
        document.getElementById('firstHeading').textContent = 'Page Not Found';
        document.getElementById('markdown-content').innerHTML = '<p>Could not load page data.</p>';
    }
});

function renderPage(data, mdContent) {
    // Update Title and basic text
    document.title = `${data.title || 'Unknown'} - The Isle Database`;
    document.getElementById('firstHeading').textContent = data.title || 'Unknown';
    document.getElementById('last-updated').textContent = data.date || 'Unknown';

    // Render Markdown Content
    if (typeof marked !== 'undefined') {
        const mdHtml = marked.parse(parseInteractiveShortcodes(mdContent));
        document.getElementById('markdown-content').innerHTML = parseFloatImages(mdHtml);
        setupMediaViewer();
        // shortcut: stub test is a text-length/placeholder guess, tune if real short pages get flagged
        if (/work in progress/i.test(mdContent) || mdContent.replace(/[#\s]/g, '').length < 200) {
            showNeedsInfo('This section is a stub.');
        }
    } else {
        document.getElementById('markdown-content').innerHTML = `<pre>${mdContent}</pre>`;
    }
}

function parseInteractiveShortcodes(mdContent) {
    return mdContent.replace(/\{\{(key|kbd)\|([\s\S]*?)\}\}/g, (_, tag, body) => {
        const parts = body.split('|').map(part => part.trim()).filter(Boolean);
        const hasLayout = parts.length && ['left', 'right', 'center', 'xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(parts[0]);

        if (!hasLayout) {
            const label = parts.join(' | ');
            return renderInlineKeyChips(label);
        }

        let align = 'right';
        let size = 'md';
        let label = '';
        let caption = '';

        if (parts.length && ['left', 'right', 'center'].includes(parts[0])) {
            align = parts.shift();
        }

        if (parts.length && ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(parts[0])) {
            size = parts.shift();
        }

        label = parts.shift() || '';
        caption = parts.join(' | ');

        if (align === 'center') {
            size = 'full';
        }

        const keyHtml = renderInlineKeyChips(label);
        const captionHtml = caption ? `<div class="input-caption">${escapeHtml(caption)}</div>` : '';

        return `
<div class="input-figure input-${align} input-size-${size}">
  <div class="input-keys">${keyHtml}</div>
  ${captionHtml}
</div>`;
    });
}

function renderInlineKeyChips(label) {
    return label
        .split(/\s*\+\s*/)
        .filter(Boolean)
        .map((keycap, index, keycaps) => {
            const keySpan = renderInputToken(keycap);
            const plus = index < keycaps.length - 1 ? '<span class="input-plus input-inline-plus">+</span>' : '';
            return `${keySpan}${plus}`;
        })
        .join('');
}

function renderInputToken(token) {
    const normalized = String(token).trim().toUpperCase();
    const mouseButtonMap = {
        LMB: 'left',
        RMB: 'right',
        MMB: 'middle',
        MB4: 'back',
        MB5: 'forward'
    };

    if (mouseButtonMap[normalized]) {
        return `
<span class="input-mouse input-mouse-${mouseButtonMap[normalized]}">
  <span class="input-mouse-shell" aria-hidden="true">
    <span class="input-mouse-btn input-mouse-btn-left"></span>
    <span class="input-mouse-btn input-mouse-btn-middle"></span>
    <span class="input-mouse-btn input-mouse-btn-right"></span>
  </span>
  <span class="input-mouse-label">${escapeHtml(normalized)}</span>
</span>`;
    }

    return `<kbd class="input-keycap input-inline-key">${escapeHtml(token)}</kbd>`;
}

/** Parse floating images with alt syntax like ![right|Alt text](image.jpg) */
function parseFloatImages(html) {
    const sizePresets = new Set(['xs', 'sm', 'md', 'lg', 'xl', 'full']);

    return html.replace(
        /<img src="([^"]+)" alt="([^"]*)">/g,
        (_, src, rawAlt) => {
            const parts = rawAlt.split('|').map(part => part.trim());
            const hasAlignment = parts.length >= 2 && ['left', 'right', 'center'].includes(parts[0]);

            if (!hasAlignment) {
                return `<img src="${escapeAttr(src)}" alt="${escapeAttr(rawAlt)}" data-viewer-caption="${escapeAttr(rawAlt)}" class="media-inline-image">`;
            }

            let align = parts[0];
            let size = 'md';
            let alt = parts[1] || '';
            let description = '';

            if (parts.length > 2 && sizePresets.has(parts[1])) {
                size = parts[1];
                alt = parts[2] || '';
                description = parts[3] || '';
            } else if (parts.length > 2) {
                description = parts[2] || '';
            }

            if (align === 'center') {
                size = 'full';
            }

            const figureClasses = ['media-figure', `media-${align}`, `media-size-${size}`];
            const viewerCaption = description || alt || '';
            const captionHtml = description ? `<div class="media-caption">${escapeHtml(description)}</div>` : '';

            return `
                <div class="${figureClasses.join(' ')}">
                    <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" data-viewer-caption="${escapeAttr(viewerCaption)}">
                    ${captionHtml}
                </div>
            `;
        }
    );
}

function setupMediaViewer() {
    ensureMediaViewer();

    const content = document.getElementById('markdown-content');
    if (!content || content.dataset.mediaViewerBound === 'true') return;
    content.dataset.mediaViewerBound = 'true';

    content.addEventListener('click', (event) => {
        const image = event.target.closest('img');
        if (image && content.contains(image)) {
            if (image.dataset.noViewer === 'true' || image.classList.contains('no-viewer')) {
                return;
            }

            const images = Array.from(content.querySelectorAll('img')).map((img) => ({
                src: img.currentSrc || img.src,
                label: img.dataset.viewerCaption || img.alt || ''
            }));
            const index = Math.max(0, images.findIndex(item => item.src === (image.currentSrc || image.src)));
            openMediaViewer(images, index === -1 ? 0 : index);
        }
    });
}

function ensureMediaViewer() {
    if (document.getElementById('media-viewer')) return;

    const viewer = document.createElement('div');
    viewer.id = 'media-viewer';
    viewer.className = 'media-viewer';
    viewer.setAttribute('aria-hidden', 'true');
    viewer.innerHTML = `
        <div class="media-viewer-content" role="dialog" aria-modal="true" aria-label="Image viewer">
            <button type="button" class="media-viewer-close" id="media-viewer-close" aria-label="Close image viewer">&times;</button>
            <button type="button" class="media-viewer-nav media-viewer-prev" id="media-viewer-prev" aria-label="Previous image">&#10094;</button>
            <img id="media-viewer-image" src="" alt="" class="media-viewer-image">
            <button type="button" class="media-viewer-nav media-viewer-next" id="media-viewer-next" aria-label="Next image">&#10095;</button>
            <div class="media-viewer-caption" id="media-viewer-caption"></div>
        </div>
    `;

    document.body.appendChild(viewer);

    document.getElementById('media-viewer-close')?.addEventListener('click', closeMediaViewer);
    document.getElementById('media-viewer-next')?.addEventListener('click', nextImage);
    document.getElementById('media-viewer-prev')?.addEventListener('click', prevImage);
    viewer.addEventListener('click', (event) => {
        if (event.target === viewer) closeMediaViewer();
    });

    if (document.body.dataset.mediaViewerBound === 'true') return;
    document.body.dataset.mediaViewerBound = 'true';

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMediaViewer();
        if (event.key === 'ArrowRight') nextImage();
        if (event.key === 'ArrowLeft') prevImage();
    });
}

let _images = [], _idx = 0;

function openMediaViewer(images, index) {
    ensureMediaViewer();

    const viewer = document.getElementById('media-viewer');
    const viewerImage = document.getElementById('media-viewer-image');
    const viewerCaption = document.getElementById('media-viewer-caption');
    if (!viewer || !viewerImage || !viewerCaption) return;

    _images = images || [];
    _idx = Math.max(0, Math.min(index || 0, _images.length - 1));
    updateViewer();
    viewer.classList.add('active');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('media-viewer-open');
}

function updateViewer() {
    if (!_images.length) return;
    const image = _images[_idx];
    const viewerImage = document.getElementById('media-viewer-image');
    const viewerCaption = document.getElementById('media-viewer-caption');
    if (!viewerImage || !viewerCaption) return;

    viewerImage.src = image.src;
    viewerImage.alt = image.label || '';
    viewerCaption.textContent = image.label || '';
}

function nextImage() {
    if (!_images.length) return;
    _idx = (_idx + 1) % _images.length;
    updateViewer();
}

function prevImage() {
    if (!_images.length) return;
    _idx = (_idx - 1 + _images.length) % _images.length;
    updateViewer();
}

function closeMediaViewer() {
    const viewer = document.getElementById('media-viewer');
    if (!viewer) return;

    viewer.classList.remove('active');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('media-viewer-open');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}
