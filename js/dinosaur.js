document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const dinoId = params.get('dino') || 'carnotaurus';

    try {
        const response = await fetch(`content/dinosaurs/${dinoId}.md`);
        if (!response.ok) throw new Error('Dinosaur not found');
        const text = await response.text();
        const { data, content } = ContentParser.parseDocument(text);
        renderDinosaur(data, content);
    } catch (err) {
        console.error(err);
        document.getElementById('firstHeading').textContent = 'Dinosaur Not Found';
        document.getElementById('markdown-content').innerHTML = '<p>Could not load dinosaur data.</p>';
    }
});

// ─────────────────────────────────────────────
// Lightweight markdown helpers (no full dump)
// ─────────────────────────────────────────────

/** Extract the text content of a named ## or ### section from markdown */
function extractSection(md, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(
        `^#{2,4}\\s+${escaped}\\s*$([\\s\\S]*?)(?=^#{2,4}\\s+|$)`,
        'im'
    );
    const m = md.match(re);
    return m ? m[1].trim() : null;
}

/** Extract the first H1 heading from markdown */
function extractTitle(md) {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : '';
}

/** Parse a markdown table into [{col: val}] */
function parseTable(md) {
    const lines = md.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = lines.filter(l => l.startsWith('|') && !l.match(/^\|[-| :]+\|$/));
    if (rows.length < 2) return [];
    const headers = rows[0].split('|').map(h => h.trim()).filter(Boolean);
    return rows.slice(1).map(row => {
        const cells = row.split('|').map(c => c.trim()).filter(Boolean);
        return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
    });
}

/** Parse a markdown bullet list into string[] */
function parseBullets(md) {
    return md.split('\n')
        .filter(l => l.match(/^[-*]\s/))
        .map(l => l.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim());
}

/** Parse floating images with alt syntax like ![right|Alt text](image.jpg) */
function parseFloatImages(html) {
    const sizePresets = new Set(['xs', 'sm', 'md', 'lg', 'xl', 'full']);

    return html.replace(
        /<img src="([^"]+)" alt="([^"]*)">/g,
        (_, src, rawAlt) => {
            const parts = rawAlt.split('|').map(part => part.trim());
            let align = 'right';
            let size = 'md';
            let alt = rawAlt;
            let description = '';

            if (parts.length >= 2 && ['left', 'right', 'center'].includes(parts[0])) {
                align = parts[0];

                if (parts.length === 2) {
                    alt = parts[1];
                } else if (sizePresets.has(parts[1])) {
                    size = parts[1];
                    alt = parts[2] || '';
                    description = parts[3] || '';
                } else {
                    alt = parts[1] || '';
                    description = parts[2] || '';
                }
            }

            if (align === 'center') {
                size = 'full';
            }

            const figureClasses = ['media-figure', `media-${align}`, `media-size-${size}`];
            const captionHtml = description ? `<div class="media-caption">${description}</div>` : '';

            return `
                <div class="${figureClasses.join(' ')}">
                    <img src="${src}" alt="${alt}">
                    ${captionHtml}
                </div>
            `;
        }
    );
}

function parseInteractiveShortcodes(html) {
    return html.replace(/\{\{(key|kbd)\|([\s\S]*?)\}\}/g, (_, tag, body) => {
        const parts = body.split('|').map(part => part.trim()).filter(Boolean);
        const hasLayout = parts.length && ['left', 'right', 'center', 'xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(parts[0]);

        if (!hasLayout) {
            return renderInlineKeyChips(parts.join(' | '));
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────

function renderDinosaur(data, md) {
    const markdownTitle = extractTitle(md);
    const pageTitle = data.title || markdownTitle || 'Unknown';

    // Title & version
    document.title = `${pageTitle} - The Isle Wiki`;
    document.getElementById('firstHeading').textContent = pageTitle;
    document.getElementById('last-updated').textContent = data.lastUpdated?.date || data.date || 'Unknown';
    document.getElementById('game-version').textContent = data.lastUpdated?.gameVersion || 'N/A';

    // Infobox
    const heroImg = document.getElementById('hero-img');
    heroImg.src = data.heroImage?.src || '';
    heroImg.alt = data.heroImage?.alt || data.title || '';
    heroImg.style.cursor = heroImg.src ? 'zoom-in' : 'default';
    if (heroImg.src && heroImg.dataset.viewerBound !== 'true') {
        heroImg.dataset.viewerBound = 'true';
        heroImg.addEventListener('click', () => {
            openMediaViewer([{ src: heroImg.src, label: heroImg.alt || data.title || '' }], 0);
        });
    }
    document.getElementById('class-diet').textContent   = data.basicStats?.diet       || 'N/A';
    document.getElementById('class-size').textContent   = data.basicStats?.size       || 'N/A';
    document.getElementById('class-speed').textContent  = data.basicStats?.speed      || 'N/A';
    document.getElementById('class-diff').textContent   = data.basicStats?.difficulty || 'N/A';
    document.getElementById('stat-weight').textContent  = data.adultStats?.weight      ? data.adultStats.weight + ' kg' : 'N/A';
    document.getElementById('stat-bite').textContent    = data.adultStats?.biteDamage  || 'N/A';
    document.getElementById('stat-sprint').textContent  = data.adultStats?.sprintSpeed ? data.adultStats.sprintSpeed + ' km/h' : 'N/A';
    document.getElementById('stat-stam').textContent    = data.adultStats?.stamina      || 'N/A';

    // Mutations
    const mutBody = document.getElementById('mutations-body');
    mutBody.innerHTML = '';
    if (data.recommendedMutations?.length) {
        data.recommendedMutations.forEach((m, i) => {
            mutBody.innerHTML += `
            <div class="mut-row">
                <div class="mut-num">${i + 1}</div>
                <div>
                    <div class="mut-name">${m.name}</div>
                    <div class="mut-desc">${m.description || ''}</div>
                </div>
            </div>`;
        });
    } else {
        mutBody.innerHTML = '<p class="no-data">No mutations data available.</p>';
    }

    // ── Overview (intro paragraph from MD) ──────────────────────
    const gameDescriptionSec = extractSection(md, 'Game Description');
    const overviewSec = extractSection(md, 'Overview');
    const introPara = data.description || overviewSec?.split('\n')[0] || '';
    const gameDescriptionParts = gameDescriptionSec
        ? gameDescriptionSec.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
        : [];
    const gameDescription = gameDescriptionParts[0] || '';
    const gameDescriptionSource = gameDescriptionParts[1] || '';

    let gameDescriptionHtml = '';
    if (gameDescriptionSec) {
        if (typeof marked !== 'undefined') {
            gameDescriptionHtml = marked.parse(`## Game Description\n\n${gameDescriptionSec}`);
        } else {
            gameDescriptionHtml = `
            <h2>Game Description</h2>
            <p>${escapeHtml(gameDescription || '')}</p>
            <p class="game-quote-src">— ${escapeHtml(gameDescriptionSource || 'Source unknown')}</p>`;
        }
    }

    // Game quote
    let overviewHtml = '';
    if (gameDescriptionHtml) {
        overviewHtml += gameDescriptionHtml;
    }
    if (introPara) {
        overviewHtml += `<p>${introPara}</p>`;
    }

    overviewHtml = parseInteractiveShortcodes(overviewHtml);

    // Characteristics bullets
    const chars = data.characteristics || [];
    if (chars.length) {
        overviewHtml += `<ul class="tips">${chars.map(c => `<li>${c}</li>`).join('')}</ul>`;
    }
    document.getElementById('markdown-content').innerHTML = parseFloatImages(overviewHtml);

    // ── Survival tips ────────────────────────────────────────────
    const survivalSec = extractSection(md, 'Survival Tips');
    const survivalEl = document.getElementById('survival-body');
    if (survivalEl) {
        let html = '';
        // Try JSON data first
        if (data.survivalTips && data.survivalTips.length) {
            html += `<ul class="tips">${data.survivalTips.map(t => `<li>${t}</li>`).join('')}</ul>`;
        } else if (survivalSec) {
            // Fall back to markdown
            const tips = parseBullets(survivalSec);
            const paras = survivalSec.split('\n').filter(l => l && !l.startsWith('-') && !l.startsWith('*'));
            if (paras.length) html += paras.map(p => `<p>${p}</p>`).join('');
            if (tips.length) html += `<ul class="tips">${tips.map(t => `<li>${t}</li>`).join('')}</ul>`;
        }
        survivalEl.innerHTML = html || '<p class="no-data">No survival tips available.</p>';
    }

    // ── Attacks ──────────────────────────────────────────────────
    const attacksSec = extractSection(md, 'Attacks');
    const attacksEl = document.getElementById('attacks-body');
    if (attacksEl) {
        let html = '';
        // Try JSON data first
        if (data.attacks && data.attacks.length) {
            html += data.attacks.map(a => `
            <div class="attack-item">
                <div class="atk-name">
                    ${a.name}
                    <span class="atk-key">${renderInlineKeyChips(a.key || '')}</span>
                </div>
                <div class="atk-desc">${a.description}</div>
            </div>`).join('');
        } else if (attacksSec) {
            // Fall back to markdown
            const rows = parseTable(attacksSec);
            if (rows.length) {
                html += rows.map(r => `
                <div class="attack-item">
                    <div class="atk-name">
                        ${r['Attack'] || r['attack'] || ''}
                        <span class="atk-key">${renderInlineKeyChips(r['Key'] || r['key'] || '')}</span>
                    </div>
                    <div class="atk-desc">${r['Description'] || r['description'] || ''}</div>
                </div>`).join('');
            }
        }
        attacksEl.innerHTML = html || '<p class="no-data">No attacks data available.</p>';
    }

    // ── Biomes ───────────────────────────────────────────────────
    const biomeSec  = extractSection(md, 'Biome Information');
    const biomeEl   = document.getElementById('biome-body');
    if (biomeEl) {
        let html = '';
        // Try JSON data first
        if (data.biomeInfo) {
            const preferred = data.biomeInfo.preferred || [];
            const avoid     = data.biomeInfo.avoid || [];
            if (preferred.length) {
                html += `<div class="biome-label-row">Preferred</div>
                         <div class="biome-chips">
                           ${preferred.map(b => `<span class="bchip pref">${b}</span>`).join('')}
                         </div>`;
            }
            if (avoid.length) {
                html += `<div class="biome-label-row" style="margin-top:0.5rem">Avoid</div>
                         <div class="biome-chips">
                           ${avoid.map(b => `<span class="bchip avd">${b}</span>`).join('')}
                         </div>`;
            }
        } else if (biomeSec) {
            // Fall back to markdown
            const rows = parseTable(biomeSec);
            const preferred = rows.map(r => r['Preferred Biomes']).filter(Boolean);
            const avoid     = rows.map(r => r['Avoid Biomes']).filter(Boolean);
            if (preferred.length) {
                html += `<div class="biome-label-row">Preferred</div>
                         <div class="biome-chips">
                           ${preferred.map(b => `<span class="bchip pref">${b}</span>`).join('')}
                         </div>`;
            }
            if (avoid.filter(Boolean).length) {
                html += `<div class="biome-label-row" style="margin-top:0.5rem">Avoid</div>
                         <div class="biome-chips">
                           ${avoid.filter(Boolean).map(b => `<span class="bchip avd">${b}</span>`).join('')}
                         </div>`;
            }
        }
        biomeEl.innerHTML = html || '<p class="no-data">No biome data available.</p>';
    }

    // ── Combat tactics (from MD, not combatMatchups JSON) ────────
    const strongSec = extractSection(md, 'Strong Against');
    const weakSec   = extractSection(md, 'Weak Against');
    const tacticStrongEl = document.getElementById('tactic-strong');
    const tacticWeakEl   = document.getElementById('tactic-weak');

    function renderTacticTable(sec, el) {
        if (!el || !sec) return;
        const rows = parseTable(sec);
        if (!rows.length) { el.innerHTML = '<tr><td colspan="2" class="no-data-cell">No data</td></tr>'; return; }
        el.innerHTML = rows.map(r => `
        <tr>
            <td><strong>${r['Opponent'] || ''}</strong></td>
            <td style="color:var(--tm)">${r['Tactics'] || r['tactics'] || ''}</td>
        </tr>`).join('');
    }
    renderTacticTable(strongSec, tacticStrongEl);
    renderTacticTable(weakSec,   tacticWeakEl);

    // ── Nesting ──────────────────────────────────────────────────
    const nestSec = extractSection(md, 'Nesting');
    const nestEl  = document.getElementById('nesting-body');
    if (nestEl) {
        let html = '';
        // Try JSON data first
        if (data.nesting) {
            html += `<ul class="tips">
                <li><strong>Eggs:</strong> ${data.nesting.eggs}</li>
                <li><strong>Incubation Time:</strong> ${data.nesting.incubationTime}</li>
                <li><strong>Nest Type:</strong> ${data.nesting.nestType}</li>
            </ul>`;
        } else if (nestSec) {
            // Fall back to markdown
            const items = parseBullets(nestSec);
            html = items.length
                ? `<ul class="tips">${items.map(i => `<li>${i}</li>`).join('')}</ul>`
                : '';
        }
        nestEl.innerHTML = html || '<p class="no-data">No nesting data available.</p>';
    }

    // ── Growth table ─────────────────────────────────────────────
    const growthTbody = document.getElementById('growth-tbody');
    growthTbody.innerHTML = '';
    if (data.growthTable?.length) {
        data.growthTable.forEach(s => {
            growthTbody.innerHTML += `
            <tr>
                <td>${s.stage}</td>
                <td>${s.weight ?? 'N/A'}</td>
                <td>${s.bite   ?? 'N/A'}</td>
                <td>${s.sprint ?? 'N/A'}</td>
                <td>${s.stamina ?? 'N/A'}</td>
            </tr>`;
        });
    } else {
        growthTbody.innerHTML = '<tr><td colspan="5" class="no-data-cell">No growth data available.</td></tr>';
    }

    // ── Diet grid ────────────────────────────────────────────────
    const dietGrid = document.getElementById('diet-grid');
    dietGrid.innerHTML = '';
    const addDietGroup = (arr, cls, label) => {
        if (!arr || !arr.length) return;
        const groupHtml = arr.map(f => `
            <div class="food-item">
                <span class="fdot ${cls}"></span>
                <div>
                    <span class="fn">${f.name}</span>
                    <span class="fl">${f.location || ''}</span>
                </div>
            </div>`).join('');
        dietGrid.innerHTML += `<div class="diet-group">
            <div class="diet-group-label">${label}</div>
            ${groupHtml}
        </div>`;
    };
    if (data.diet) {
        addDietGroup(data.diet.alpha, 'a', 'Alpha');
        addDietGroup(data.diet.beta,  'b', 'Beta');
        addDietGroup(data.diet.gamma, 'g', 'Gamma');
    } else {
        dietGrid.innerHTML = '<p class="no-data">No diet data available.</p>';
    }

    // ── Combat matchups (JSON win-rate data) ─────────────────────
    document.getElementById('matchup-date').textContent = data.combatMatchups?.dataDate || 'N/A';

    function renderMatchupTable(arr, tbodyId, isWeak) {
        const tbody = document.getElementById(tbodyId);
        tbody.innerHTML = '';
        if (arr?.length) {
            arr.forEach(m => {
                tbody.innerHTML += `
                <tr>
                    <td>${m.name}</td>
                    <td>
                        <span class="wrbar${isWeak ? ' weak' : ''}" style="width:${m.winRate ?? 0}px"></span>
                        ${m.winRate ?? '—'}${m.winRate != null ? '%' : ''}
                    </td>
                </tr>`;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="2" class="no-data-cell">No data</td></tr>`;
        }
    }
    renderMatchupTable(data.combatMatchups?.strongAgainst, 'matchup-strong', false);
    renderMatchupTable(data.combatMatchups?.weakAgainst,   'matchup-weak',   true);

    // ── Calls ────────────────────────────────────────────────────
    const callsTbody = document.getElementById('calls-tbody');
    callsTbody.innerHTML = '';
    if (data.calls?.length) {
        data.calls.forEach(c => {
            callsTbody.innerHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.key}</td>
                <td>${c.cooldown}</td>
                <td>${c.range}</td>
            </tr>`;
        });
    } else {
        callsTbody.innerHTML = '<tr><td colspan="4" class="no-data-cell">No calls data available.</td></tr>';
    }

    // ── Skins ────────────────────────────────────────────────────
    const skinGrid = document.getElementById('skin-grid');
    skinGrid.innerHTML = '';
    const allSkins = data.skins || [];
    if (allSkins.length) {
        allSkins.forEach((skin, i) => {
            const card = document.createElement('div');
            card.className = 'skin-card';
            card.innerHTML = `
                <img src="${skin.src}" alt="${skin.label}" loading="lazy">
                <div class="skin-label">${skin.label}</div>`;
            card.addEventListener('click', () => openMediaViewer(allSkins, i));
            skinGrid.appendChild(card);
        });
    } else {
        skinGrid.innerHTML = '<p class="no-data">No skins data available.</p>';
    }
}

// ─────────────────────────────────────────────
// Media viewer
// ─────────────────────────────────────────────
let _images = [], _idx = 0;

function openMediaViewer(images, index) {
    _images = images; _idx = index;
    _updateViewer();
    document.getElementById('media-viewer').style.display = 'flex';
}
function closeMediaViewer() {
    document.getElementById('media-viewer').style.display = 'none';
}
function _updateViewer() {
    if (!_images.length) return;
    document.getElementById('media-viewer-image').src    = _images[_idx].src;
    document.getElementById('media-viewer-image').alt    = _images[_idx].label;
    document.getElementById('media-viewer-caption').textContent = _images[_idx].label;
}
function nextImage() { _idx = (_idx + 1) % _images.length; _updateViewer(); }
function prevImage() { _idx = (_idx - 1 + _images.length) % _images.length; _updateViewer(); }

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('media-viewer-close')?.addEventListener('click', closeMediaViewer);
    document.getElementById('media-viewer-next')?.addEventListener('click', nextImage);
    document.getElementById('media-viewer-prev')?.addEventListener('click', prevImage);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape')      closeMediaViewer();
        if (e.key === 'ArrowRight')  nextImage();
        if (e.key === 'ArrowLeft')   prevImage();
    });
    document.getElementById('media-viewer')?.addEventListener('click', e => {
        if (e.target.id === 'media-viewer') closeMediaViewer();
    });
});