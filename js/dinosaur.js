document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const dinoId = params.get('dino') || 'carnotaurus';

    try {
        const [response, balanceManifest, sectionsData] = await Promise.all([
            fetch(`content/dinosaurs/${dinoId}.md`),
            loadRawStatsManifest(dinoId),
            loadSectionsManifest(dinoId)
        ]);

        if (!response.ok) throw new Error('Dinosaur not found');

        const text = await response.text();
        const { data, content } = ContentParser.parseDocument(text);
        renderDinosaur(data, content, balanceManifest, sectionsData);
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

async function loadSectionsManifest(dinoId) {
    // Try per-dino manifest first (data/dinosaurs/<dinoId>/manifest.txt),
    // then fall back to top-level sections txt (data/dinosaurs/<dinoId>.sections.txt).
    const perDinoManifest = `data/dinosaurs/${dinoId}/manifest.txt`;
    const topLevelManifest = `data/dinosaurs/${dinoId}.sections.txt`;

    let manifestText = null;
    let basePath = `data/dinosaurs/`;

    // attempt per-dino manifest
    try {
        const resp = await fetch(perDinoManifest);
        if (resp.ok) {
            manifestText = await resp.text();
            basePath = `data/dinosaurs/${dinoId}/`;
        }
    } catch (e) {
        // ignore
    }

    // fallback to top-level manifest
    if (manifestText == null) {
        try {
            const resp = await fetch(topLevelManifest);
            if (resp.ok) {
                manifestText = await resp.text();
                basePath = `data/dinosaurs/`;
            }
        } catch (e) {
            // ignore
        }
    }

    if (!manifestText) return null;

    const lines = String(manifestText).split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('//'));
    const entries = [];

    for (const raw of lines) {
        const line = raw.replace(/\t+/g, ' ').trim();
        if (!line) continue;

        const parts = line.split(':').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
            // key: filename
            entries.push({ key: parts[0], file: parts.slice(1).join(':') });
            continue;
        }

        // plain filename -> infer key
        const file = parts[0];
        const base = file.replace(/\.json$/i, '');
        const inferredKey = inferSectionKeyFromFilename(base);
        entries.push({ key: inferredKey, file });
    }

    const result = {};
    await Promise.all(entries.map(async ({ key, file }) => {
        try {
            const url = basePath + file;
            const resp = await fetch(url);
            if (!resp.ok) return;
            const json = await resp.json();
            result[key] = json;
        } catch (e) {
            // ignore individual failures
        }
    }));

    return Object.keys(result).length ? result : null;
}

function inferSectionKeyFromFilename(base) {
    const b = base.toLowerCase();
    if (b === 'biome' || b === 'biomeinfo') return 'biomeInfo';
    if (b === 'nest' || b === 'nesting') return 'nesting';
    if (b === 'attack' || b === 'attacks') return 'attacks';
    if (b === 'classification') return 'classification';
    if (b === 'mutations' || b === 'recommendedmutations' || b === 'mutations') return 'recommendedMutations';
    if (b === 'diet') return 'diet';
    // fallback: use base as key
    return base;
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

async function loadRawStatsManifest(dinoId) {
    const txtPath = `data/dinosaurs/balance/${dinoId}.txt`;
    const valuesPath = `data/dinosaurs/balance/${dinoId}.values.json`;
    const fallbackJsonPath = `data/dinosaurs/balance/${dinoId}.json`;

    const txtResponse = await fetch(txtPath);
    const valuesResponse = await fetch(valuesPath);
    const fallbackResponse = await fetch(fallbackJsonPath);

    if (txtResponse.ok && (valuesResponse.ok || fallbackResponse.ok)) {
        const manifestText = await txtResponse.text();
        const manifest = parseRawStatsManifest(manifestText, txtPath);
        const valuePayload = valuesResponse.ok ? await valuesResponse.json() : await fallbackResponse.json();
        return mergeRawStatsManifest(valuePayload, manifest);
    }

    if (valuesResponse.ok) {
        return await valuesResponse.json();
    }

    if (fallbackResponse.ok) {
        return await fallbackResponse.json();
    }

    if (txtResponse.ok) {
        const manifestText = await txtResponse.text();
        return parseRawStatsManifest(manifestText, txtPath);
    }

    return null;
}

function parseRawStatsManifest(manifestText, sourcePath) {
    const lines = String(manifestText).split(/\r?\n/);
    const result = {
        source: sourcePath,
        curveOrder: [],
        staminaDurations: {
            regen: [],
            spending: []
        },
        movementCurves: []
    };

    const assignTopLevel = line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) return false;

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        if (!key) return false;

        if (key === 'name' || key === 'source' || key === 'package' || key === 'notes') {
            result[key] = value;
            return true;
        }

        return false;
    };

    let section = 'header';
    let curve = null;

    const pushCurve = () => {
        if (!curve) return;
        curve.points = curve.points || [];
        result.movementCurves.push(curve);
        curve = null;
    };

    const parsePoint = line => {
        const pointBody = line.replace(/^point\s*:\s*/i, '').trim();
        const [timeText, valueText, modeText] = pointBody.split(',').map(part => part.trim());
        const time = Number(timeText);
        const value = Number(valueText);

        if (!Number.isFinite(time) || !Number.isFinite(value)) return;

        curve.points = curve.points || [];
        curve.points.push({
            time,
            speed_kmh: value,
            interp_mode: modeText || 'RCIM_Linear'
        });
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('//')) continue;

        const sectionMatch = line.match(/^\[(.+)]$/);
        if (sectionMatch) {
            pushCurve();
            const sectionName = sectionMatch[1].trim().toLowerCase();
            if (sectionName.startsWith('stamina.regen')) {
                section = 'stamina.regen';
            } else if (sectionName.startsWith('stamina.spending')) {
                section = 'stamina.spending';
            } else if (sectionName.startsWith('curve')) {
                section = 'curve';
                curve = { points: [] };
                const curveParts = sectionMatch[1].split(/\s+/).slice(1);
                if (curveParts.length) {
                    curve.name = curveParts.join(' ');
                }
            } else {
                section = sectionName;
            }
            continue;
        }

        if (section === 'header') {
            assignTopLevel(line);
            continue;
        }

        if (section === 'stamina.regen' || section === 'stamina.spending') {
            result.staminaDurations[section.split('.')[1]].push(line);
            continue;
        }

        if (section === 'curve') {
            const parts = line.split('|').map(part => part.trim()).filter(Boolean);
            if (!parts.length) continue;

            const curveName = parts[0];
            const curveLabel = parts[1] || curveName;
            result.curveOrder.push({ name: curveName, label: curveLabel });
        }
    }

    pushCurve();

    if (!result.name) {
        result.name = sourcePath.split(/[\\/]/).pop().replace(/\.[^.]+$/, '');
    }

    return result;
}

function mergeRawStatsManifest(valuesPayload, manifest) {
    if (!valuesPayload || typeof valuesPayload !== 'object') {
        return manifest;
    }

    const merged = {
        ...valuesPayload,
        source: manifest.source,
        manifest
    };

    if (Array.isArray(merged.movementCurves) && Array.isArray(manifest.curveOrder) && manifest.curveOrder.length) {
        const labelMap = new Map(manifest.curveOrder.map(entry => [entry.name, entry.label]));
        merged.movementCurves = merged.movementCurves.map(curve => {
            const label = labelMap.get(curve.name);
            return label ? { ...curve, label } : curve;
        });

        merged.movementCurves.sort((left, right) => {
            const leftIndex = manifest.curveOrder.findIndex(entry => entry.name === left.name);
            const rightIndex = manifest.curveOrder.findIndex(entry => entry.name === right.name);
            return leftIndex - rightIndex;
        });
    }

    return merged;
}

function formatNumber(value, digits = 3) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '—';
    return numericValue.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

function getRawCurveValue(point) {
    const candidate = point?.speed_kmh ?? point?.speed ?? point?.value ?? point?.y;
    const numericValue = Number(candidate);
    return Number.isFinite(numericValue) ? numericValue : null;
}

function getRawCurvePoints(curve) {
    return Array.isArray(curve?.points) ? curve.points : [];
}

function buildRawCurveSummary(curve) {
    const points = getRawCurvePoints(curve);
    const values = points.map(getRawCurveValue).filter(value => value != null);

    if (!values.length) {
        return {
            pointCount: points.length,
            min: null,
            max: null,
            start: null,
            end: null
        };
    }

    return {
        pointCount: points.length,
        min: Math.min(...values),
        max: Math.max(...values),
        start: values[0],
        end: values[values.length - 1]
    };
}

function renderRawStatsTables(rawStats) {
    const stamina = rawStats?.staminaDurations || {};
    const regen = stamina.regen || {};
    const spending = stamina.spending || {};
    const staminaKeys = Array.from(new Set([
        ...Object.keys(regen),
        ...Object.keys(spending)
    ]));
    const staminaManifest = rawStats?.manifest?.staminaDurations || {};
    const regenOrder = Array.isArray(staminaManifest.regen) && staminaManifest.regen.length ? staminaManifest.regen : Object.keys(regen);
    const spendingOrder = Array.isArray(staminaManifest.spending) && staminaManifest.spending.length ? staminaManifest.spending : Object.keys(spending);

    const curves = Array.isArray(rawStats?.movementCurves) ? rawStats.movementCurves : [];
    let html = '';

    if (staminaKeys.length) {
        html += `
        <section class="raw-stats-block">
            <h3 class="sec">Stamina durations</h3>
            <table class="wikitable raw-table">
                <thead>
                    <tr><th>Action</th><th>Regen</th><th>Spending</th></tr>
                </thead>
                <tbody>
                    ${Array.from(new Set([...regenOrder, ...spendingOrder])).map(key => `
                        <tr>
                            <td>${escapeHtml(key)}</td>
                            <td>${escapeHtml(regen[key] || '—')}</td>
                            <td>${escapeHtml(spending[key] || '—')}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </section>`;
    }

    if (curves.length) {
        html += `
        <section class="raw-stats-block">
            <h3 class="sec">Movement curves</h3>
            <table class="wikitable raw-table raw-summary-table">
                <thead>
                    <tr>
                        <th>Curve</th>
                        <th>Points</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Min</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    ${curves.map(curve => {
                        const summary = buildRawCurveSummary(curve);
                        return `
                        <tr>
                            <td>${escapeHtml(curve.label || curve.name || 'Curve')}</td>
                            <td>${summary.pointCount}</td>
                            <td>${formatNumber(summary.start)}</td>
                            <td>${formatNumber(summary.end)}</td>
                            <td>${formatNumber(summary.min)}</td>
                            <td>${formatNumber(summary.max)}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            ${curves.map(curve => {
                const points = getRawCurvePoints(curve);
                const summary = buildRawCurveSummary(curve);
                return `
                <div class="raw-curve-block">
                    <div class="raw-curve-head">
                        <div>
                            <div class="raw-curve-title">${escapeHtml(curve.label || curve.name || 'Curve')}</div>
                            <div class="raw-curve-meta">${escapeHtml(curve.name || '')}${curve.unit ? ` · ${escapeHtml(curve.unit)}` : ''}</div>
                        </div>
                        <div class="raw-curve-meta">Points: ${summary.pointCount}</div>
                    </div>
                    <table class="wikitable raw-table raw-curve-table">
                        <thead>
                            <tr><th>Time</th><th>Speed (${escapeHtml(curve.unit || 'unit')})</th><th>Interp mode</th></tr>
                        </thead>
                        <tbody>
                            ${points.map(point => `
                                <tr>
                                    <td>${formatNumber(point.time, 3)}</td>
                                    <td>${formatNumber(getRawCurveValue(point))}</td>
                                    <td>${escapeHtml(point.interp_mode || '—')}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            }).join('')}
        </section>`;
    }

    return html || '<p class="no-data">No raw stats data available.</p>';
}

function buildRawStatsChartConfig(rawStats) {
    const curves = Array.isArray(rawStats?.movementCurves) ? rawStats.movementCurves : [];
    const palette = [
        { border: 'rgba(66, 133, 244, 1)', fill: 'rgba(66, 133, 244, 0.14)' },
        { border: 'rgba(52, 168, 83, 1)', fill: 'rgba(52, 168, 83, 0.14)' },
        { border: 'rgba(251, 188, 5, 1)', fill: 'rgba(251, 188, 5, 0.14)' },
        { border: 'rgba(234, 67, 53, 1)', fill: 'rgba(234, 67, 53, 0.14)' },
        { border: 'rgba(123, 97, 255, 1)', fill: 'rgba(123, 97, 255, 0.14)' },
        { border: 'rgba(0, 172, 193, 1)', fill: 'rgba(0, 172, 193, 0.14)' }
    ];

    return {
        type: 'line',
        data: {
            datasets: curves.map((curve, index) => {
                const color = palette[index % palette.length];
                return {
                    label: curve.label || curve.name || `Curve ${index + 1}`,
                    data: getRawCurvePoints(curve)
                        .map(point => ({ x: Number(point.time), y: getRawCurveValue(point) }))
                        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y)),
                    borderColor: color.border,
                    backgroundColor: color.fill,
                    pointBackgroundColor: color.border,
                    pointBorderColor: color.border,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    tension: 0.25,
                    fill: false
                };
            })
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            const label = context.dataset.label || 'Curve';
                            return `${label}: ${formatNumber(context.parsed.y)} km/h at ${formatNumber(context.parsed.x, 3)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Normalized time'
                    },
                    ticks: {
                        callback(value) {
                            return formatNumber(value, 2);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Speed (km/h)'
                    },
                    beginAtZero: false
                }
            }
        }
    };
}

let rawStatsChart = null;

function bindRawStatsViewToggle(rawStats, sectionEl) {
    const viewButtons = sectionEl.querySelectorAll('[data-raw-view]');
    const tableWrap = document.getElementById('raw-stats-tables');
    const chartWrap = document.getElementById('raw-stats-chart-wrap');
    const chartButton = sectionEl.querySelector('[data-raw-view="chart"]');

    const showTables = () => {
        tableWrap.hidden = false;
        chartWrap.hidden = true;
        viewButtons.forEach(button => button.classList.toggle('is-active', button.dataset.rawView === 'tables'));
    };

    const showChart = () => {
        if (!rawStats?.movementCurves?.length || typeof Chart === 'undefined') {
            return;
        }

        tableWrap.hidden = true;
        chartWrap.hidden = false;
        viewButtons.forEach(button => button.classList.toggle('is-active', button.dataset.rawView === 'chart'));

        if (rawStatsChart) {
            rawStatsChart.destroy();
        }

        const canvas = document.getElementById('raw-stats-canvas');
        if (!canvas) {
            return;
        }

        rawStatsChart = new Chart(canvas, buildRawStatsChartConfig(rawStats));
    };

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.rawView === 'chart') {
                showChart();
                return;
            }

            showTables();
        });
    });

    if (!rawStats?.movementCurves?.length || typeof Chart === 'undefined') {
        chartButton.hidden = true;
        showTables();
        return;
    }

    showTables();
}

// ─────────────────────────────────────────────
// Main render
// ─────────────────────────────────────────────

function renderDinosaur(data, md, balanceStats = null, sections = null) {
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
    // prefer external classification JSON when present
    const classificationPayload = sections?.classification?.classification || sections?.classification || { basicStats: data.basicStats, characteristics: data.characteristics };
    document.getElementById('class-diet').textContent   = classificationPayload?.basicStats?.diet       || 'N/A';
    document.getElementById('class-size').textContent   = classificationPayload?.basicStats?.size       || 'N/A';
    document.getElementById('class-speed').textContent  = classificationPayload?.basicStats?.speed      || 'N/A';
    document.getElementById('class-diff').textContent   = classificationPayload?.basicStats?.difficulty || 'N/A';
    document.getElementById('stat-weight').textContent  = data.adultStats?.weight      ? data.adultStats.weight + ' kg' : 'N/A';
    document.getElementById('stat-bite').textContent    = data.adultStats?.biteDamage  || 'N/A';
    document.getElementById('stat-sprint').textContent  = data.adultStats?.sprintSpeed ? data.adultStats.sprintSpeed + ' km/h' : 'N/A';
    document.getElementById('stat-stam').textContent    = data.adultStats?.stamina      || 'N/A';

    // Mutations
    const mutBody = document.getElementById('mutations-body');
    mutBody.innerHTML = '';
    const mutationsPayload = sections?.recommendedMutations?.recommendedMutations || sections?.recommendedMutations || data.recommendedMutations;
    if (mutationsPayload && mutationsPayload.length) {
        mutationsPayload.forEach((m, i) => {
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
    const chars = classificationPayload?.characteristics || data.characteristics || [];
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
        // Prefer external sections JSON, then frontmatter, then markdown
        const attacksPayload = sections?.attacks?.attacks || sections?.attacks || data.attacks;
        if (attacksPayload && attacksPayload.length) {
            html += attacksPayload.map(a => `
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
                // Prefer external sections JSON, then frontmatter, then markdown
                const biomePayload = sections?.biomeInfo?.biomeInfo || sections?.biomeInfo || data.biomeInfo;
                if (biomePayload) {
                        const preferred = biomePayload.preferred || [];
                        const avoid     = biomePayload.avoid || [];
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
        // Prefer external sections JSON, then frontmatter, then markdown
        const nestingPayload = sections?.nesting?.nesting || sections?.nesting || data.nesting;
        if (nestingPayload) {
            html += `<ul class="tips">
                <li><strong>Eggs:</strong> ${nestingPayload.eggs}</li>
                <li><strong>Incubation Time:</strong> ${nestingPayload.incubationTime}</li>
                <li><strong>Nest Type:</strong> ${nestingPayload.nestType}</li>
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

    // ── Raw stats ───────────────────────────────────────────────
    const rawStatsCard = document.getElementById('raw-stats-card');
    const rawStatsMeta = document.getElementById('raw-stats-meta');
    const rawStatsTables = document.getElementById('raw-stats-tables');
    const rawStats = data.balanceStats || balanceStats || null;
    if (rawStatsCard && rawStatsTables) {
        if (rawStats) {
            rawStatsCard.hidden = false;
            rawStatsMeta.textContent = [rawStats.name, rawStats.source].filter(Boolean).join(' · ');
            rawStatsTables.innerHTML = renderRawStatsTables(rawStats);
            bindRawStatsViewToggle(rawStats, rawStatsCard);
        } else {
            rawStatsCard.hidden = true;
        }
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
    const dietPayload = sections?.diet?.diet || sections?.diet || data.diet;
    if (dietPayload) {
        addDietGroup(dietPayload.alpha, 'a', 'Alpha');
        addDietGroup(dietPayload.beta,  'b', 'Beta');
        addDietGroup(dietPayload.gamma, 'g', 'Gamma');
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