// js/components.js
async function loadComponents() {
  try {
    // Prefer local site-relative data first (relative path), fallback to absolute root
    const navbarRes = await fetch('data/navbar.json').catch(() => fetch('/data/navbar.json'));
    if (!navbarRes || !navbarRes.ok) throw new Error("Navbar Data not found");
    const navbarData = await navbarRes.json();
    renderNavbar(navbarData);
  } catch (error) {
    console.warn("Could not load navbar:", error);
  }

  try {
    const footerRes = await fetch('data/footer.json').catch(() => fetch('/data/footer.json'));
    if (!footerRes || !footerRes.ok) throw new Error("Footer Data not found");
    const footerData = await footerRes.json();
    renderFooter(footerData);
  } catch (error) {
    console.warn("Could not load footer:", error);
  }
}

function renderNavbar(data) {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  // Clear existing static nav
  topbar.innerHTML = '';

  const navInner = document.createElement('div');
  navInner.className = 'topbar-inner';

  // Create brand logo
  if (data.brand) {
    const brandA = document.createElement('a');
    brandA.href = data.brand.href;
    brandA.className = 'site-logo';
    const brandImg = document.createElement('img');
    brandImg.src = data.brand.logo;
    brandImg.alt = data.brand.title;
    brandImg.style.height = '22px';
    brandImg.style.verticalAlign = 'middle';
    brandA.appendChild(brandImg);
    navInner.appendChild(brandA);
  }

  // Create new nav
  const nav = document.createElement('nav');
  nav.id = 'topnav';

  // Support both new `links` shape and legacy `items` shape
  const links = data.links || (data.items ? transformLegacyItems(data.items) : []);

  links.forEach((link, index) => {
    if (link.submenu) {
      // Create dropdown
      const dropdown = document.createElement('div');
      dropdown.className = 'nav-dropdown';
      dropdown.style.display = 'inline-block';
      dropdown.style.position = 'relative';

      const dropA = document.createElement('a');
      dropA.href = link.href;
      dropA.innerHTML = link.title + ' &#x25BE;'; // Add dropdown arrow
      dropdown.appendChild(dropA);

      const menu = document.createElement('div');
      menu.className = 'nav-dropdown-content';
      menu.style.display = 'none';
      menu.style.position = 'absolute';
      menu.style.background = 'var(--s1)';
      menu.style.border = '1px solid var(--b1)';
      menu.style.zIndex = '1000';
      menu.style.minWidth = '150px';
      menu.style.top = '100%';
      if (index === links.length - 1) {
        menu.style.left = 'auto';
        menu.style.right = '0';
      } else {
        menu.style.left = '0';
        menu.style.right = 'auto';
      }

      link.submenu.forEach(sub => {
        const subA = document.createElement('a');
        subA.href = sub.href;
        subA.textContent = sub.title;
        subA.style.display = 'block';
        subA.style.padding = '0.5rem 1rem';
        subA.style.whiteSpace = 'nowrap';
        menu.appendChild(subA);
      });

      // Simple hover logic
      dropdown.addEventListener('mouseenter', () => menu.style.display = 'block');
      dropdown.addEventListener('mouseleave', () => menu.style.display = 'none');

      dropdown.appendChild(menu);
      nav.appendChild(dropdown);
    } else {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.title;
      nav.appendChild(a);
    }
  });

  navInner.appendChild(nav);
  topbar.appendChild(navInner);
}

function transformLegacyItems(items) {
  const out = [];
  items.forEach(it => {
    if (!it || it.type === 'separator') return;
    if (it.type === 'link') {
      out.push({ title: it.title, href: it.href });
    } else if (it.type === 'dropdown' && Array.isArray(it.categories)) {
      // Flatten categories into a submenu list under the dropdown title
      const submenu = [];
      it.categories.forEach(cat => {
        if (!cat || !Array.isArray(cat.items)) return;
        cat.items.forEach(i => {
          submenu.push({ title: i.title, href: i.href });
        });
      });
      out.push({ title: it.title, href: it.href || '#', submenu });
    }
  });
  return out;
}

function renderFooter(data) {
  const footer = document.getElementById('footer');
  if (!footer) return;

  // Clear existing
  footer.innerHTML = '';
  footer.style.textAlign = 'center';

  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.justifyContent = 'space-around';
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto 2rem auto';
  container.style.textAlign = 'left';

  // Apply responsive flex via inline styles or rely on css classes
  const cols = data.footerLinks || [];
  cols.forEach(col => {
    const colDiv = document.createElement('div');
    colDiv.style.flex = '1';
    colDiv.style.minWidth = '150px';
    colDiv.style.margin = '1rem';

    const colTitle = document.createElement('h4');
    colTitle.textContent = col.column;
    colTitle.style.marginBottom = '0.5rem';
    colTitle.style.color = 'var(--tx)';
    colTitle.style.fontFamily = "'EB Garamond', serif";
    colDiv.appendChild(colTitle);

    col.links.forEach(link => {
      const linkA = document.createElement('a');
      linkA.href = link.href;
      linkA.textContent = link.title;
      linkA.style.display = 'block';
      linkA.style.marginBottom = '0.25rem';
      linkA.style.color = 'var(--tm)';
      linkA.style.textDecoration = 'none';
      linkA.style.fontSize = '0.9rem';
      linkA.onmouseenter = () => linkA.style.color = 'var(--link)';
      linkA.onmouseleave = () => linkA.style.color = 'var(--tm)';
      colDiv.appendChild(linkA);
    });

    container.appendChild(colDiv);
  });

  footer.appendChild(container);

  // Copyright and version
  const bottomPara = document.createElement('p');
  bottomPara.style.fontSize = '0.8rem';
  bottomPara.style.color = 'var(--td)';
  bottomPara.style.fontFamily = "'Source Sans 3', sans-serif";
  bottomPara.innerHTML = `${data.copyright}<br>Version: ${data.version}`;
  footer.appendChild(bottomPara);
}

// Source file and GitHub links for the page being viewed
function pageSource() {
  const params = new URLSearchParams(window.location.search);
  const dino = params.get('dino');
  const category = dino ? 'dinosaurs' : params.get('category') || 'mechanics';
  const slug = dino || params.get('slug') || 'mutations';
  const repo = 'https://github.com/AstricX9/TheIsleDB';
  const issue = (title, ask) => `${repo}/issues/new?title=${encodeURIComponent(`${title}: ${category}/${slug}`)}` +
    `&body=${encodeURIComponent(`Page: ${window.location.href}

${ask}

Source (patch notes, in-game test, etc.):
`)}`;
  return {
    edit: `${repo}/edit/main/content/${category}/${slug}.md`,
    fix: issue('Fix/add info', 'What is missing or wrong?'),
    fill: issue('Fill in missing info', 'Which sections can you fill in?')
  };
}

// "Edit this page" / "Suggest a fix" links next to the last-updated line
function addEditLinks() {
  const anchor = document.getElementById('last-updated')?.parentElement;
  if (!anchor) return;

  const src = pageSource();
  const links = document.createElement('span');
  links.className = 'edit-links';
  links.innerHTML = `&nbsp;&middot;&nbsp;<a href="${src.edit}" target="_blank" rel="noopener"><i class="bi bi-pencil"></i> Edit this page</a>` +
    `&nbsp;&middot;&nbsp;<a href="${src.fix}" target="_blank" rel="noopener"><i class="bi bi-flag"></i> Suggest a fix</a>`;
  anchor.appendChild(links);
}

// Banner for pages with missing data; called by the page scripts after rendering
function showNeedsInfo(message) {
  if (document.querySelector('.needs-info')) return;
  const src = pageSource();
  const banner = document.createElement('div');
  banner.className = 'needs-info';
  banner.innerHTML = `<i class="bi bi-info-circle"></i> <strong>This page needs info.</strong> ${message} ` +
    `Know the answer? <a href="${src.fill}" target="_blank" rel="noopener">Tell us</a> or ` +
    `<a href="${src.edit}" target="_blank" rel="noopener">edit this page</a>.`;
  const bar = document.querySelector('.version-bar');
  if (bar) bar.after(banner);
  else document.getElementById('markdown-content')?.before(banner);
}

document.addEventListener('DOMContentLoaded', loadComponents);
document.addEventListener('DOMContentLoaded', addEditLinks);
