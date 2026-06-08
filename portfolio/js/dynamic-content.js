(function () {
  // ─── CONFIG ──────────────────────────────────────────────────
  var GH_OWNER = "jaydendancer12";
  var GH_REPO = "portfolio-content";
  var GH_BRANCH = "main";
  // To raise rate limit from 60 to 5000 req/hr, uncomment and paste a
  // fine-grained read-only personal access token:
  // var GH_TOKEN = "";
  // ─────────────────────────────────────────────────────────────

  var API =
    "https://api.github.com/repos/" +
    GH_OWNER +
    "/" +
    GH_REPO +
    "/contents/";

  function apiHeaders() {
    var h = { Accept: "application/vnd.github.v3+json" };
    // if (typeof GH_TOKEN !== "undefined" && GH_TOKEN) {
    //   h["Authorization"] = "token " + GH_TOKEN;
    // }
    return h;
  }

  // ─── FETCH HELPERS ───────────────────────────────────────────

  async function fetchDir(folder) {
    try {
      var res = await fetch(API + folder + "?ref=" + GH_BRANCH, {
        headers: apiHeaders(),
      });
      if (!res.ok) return [];
      var files = await res.json();
      return Array.isArray(files)
        ? files.filter(function (f) {
            return f.name.endsWith(".md");
          })
        : [];
    } catch (e) {
      return [];
    }
  }

  async function fetchFile(url) {
    try {
      var res = await fetch(url);
      return res.ok ? res.text() : null;
    } catch (e) {
      return null;
    }
  }

  // ─── FRONTMATTER PARSER ──────────────────────────────────────

  function parseFrontmatter(text) {
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    var meta = {};
    match[1].split(/\r?\n/).forEach(function (line) {
      var sep = line.indexOf(":");
      if (sep === -1) return;
      var key = line.slice(0, sep).trim();
      var val = line.slice(sep + 1).trim();
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val
          .slice(1, -1)
          .split(",")
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
      }
      meta[key] = val;
    });
    return { meta: meta, body: match[2].trim() };
  }

  // ─── MARKDOWN RENDERER ───────────────────────────────────────

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inlineFormat(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /`([^`]+)`/g,
        "<code style='background:#374151;padding:0 4px;border-radius:3px;font-size:0.875em;color:#93c5fd;'>$1</code>"
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        "<a href='$2' target='_blank' rel='noopener noreferrer' style='color:#60a5fa;text-decoration:underline;'>$1</a>"
      );
  }

  function renderMarkdown(md) {
    var lines = md.split(/\r?\n/);
    var html = "";
    var inList = false;
    var inCode = false;
    var codeBlock = "";

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (line.startsWith("```")) {
        if (!inCode) {
          inCode = true;
          codeBlock = "";
        } else {
          html +=
            "<pre style='background:#1f2937;border-radius:6px;padding:12px;margin:12px 0;font-size:0.875em;color:#d1d5db;overflow-x:auto;'><code>" +
            escHtml(codeBlock) +
            "</code></pre>";
          inCode = false;
        }
        continue;
      }
      if (inCode) { codeBlock += line + "\n"; continue; }
      if (inList && !/^[-*] /.test(line)) { html += "</ul>"; inList = false; }

      if (/^### /.test(line)) {
        html += "<h3 style='font-size:1.1em;font-weight:600;color:#fff;margin:20px 0 8px;'>" + inlineFormat(line.slice(4)) + "</h3>";
      } else if (/^## /.test(line)) {
        html += "<h2 style='font-size:1.3em;font-weight:700;color:#fff;margin:24px 0 8px;'>" + inlineFormat(line.slice(3)) + "</h2>";
      } else if (/^# /.test(line)) {
        html += "<h1 style='font-size:1.5em;font-weight:700;color:#fff;margin:24px 0 12px;'>" + inlineFormat(line.slice(2)) + "</h1>";
      } else if (/^[-*] /.test(line)) {
        if (!inList) { html += "<ul style='list-style:disc;padding-left:20px;color:#d1d5db;margin:12px 0;'>"; inList = true; }
        html += "<li style='margin:4px 0;'>" + inlineFormat(line.slice(2)) + "</li>";
      } else if (line.trim() === "") {
        // gap
      } else {
        html += "<p style='color:#d1d5db;line-height:1.7;margin-bottom:12px;'>" + inlineFormat(line) + "</p>";
      }
    }
    if (inList) html += "</ul>";
    return html;
  }

  function formatDate(d) {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) { return String(d); }
  }

  // ─── MODAL ───────────────────────────────────────────────────

  function buildModal() {
    var modal = document.createElement("div");
    modal.id = "pc-modal";
    modal.style.cssText = "display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);overflow-y:auto;";
    modal.innerHTML =
      '<div style="max-width:780px;margin:48px auto;padding:0 16px 72px;">' +
      '<div style="background:#111827;border-radius:16px;border:1px solid #374151;overflow:hidden;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:24px;border-bottom:1px solid #374151;">' +
      '<div id="pc-modal-title" style="font-size:1.25rem;font-weight:700;color:#fff;padding-right:16px;"></div>' +
      '<button id="pc-modal-close" style="font-size:1.75rem;line-height:1;background:none;border:none;cursor:pointer;color:#9ca3af;padding:0 4px;">×</button>' +
      '</div>' +
      '<div style="padding:16px 24px 0;"><span id="pc-modal-date" style="font-size:0.8rem;color:#6b7280;"></span></div>' +
      '<div id="pc-modal-body" style="padding:16px 24px 24px;"></div>' +
      '</div></div>';
    document.body.appendChild(modal);

    function close() { modal.style.display = "none"; document.body.style.overflow = ""; }
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.getElementById("pc-modal-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  function openModal(title, date, bodyHtml) {
    if (!document.getElementById("pc-modal")) buildModal();
    document.getElementById("pc-modal-title").textContent = title;
    document.getElementById("pc-modal-date").textContent = date ? formatDate(date) : "";
    document.getElementById("pc-modal-body").innerHTML = bodyHtml;
    document.getElementById("pc-modal").style.display = "block";
    document.body.style.overflow = "hidden";
  }

  // ─── CARD BUILDERS ───────────────────────────────────────────

  var CARD_BASE = "background:rgba(31,41,55,0.5);border-radius:12px;border:1px solid rgba(55,65,81,0.5);overflow:hidden;display:flex;flex-direction:column;transition:border-color 0.3s;";

  function techPill(label) {
    return "<span style='font-size:0.7rem;padding:2px 8px;border-radius:6px;background:rgba(55,65,81,0.5);color:#d1d5db;'>" + escHtml(label) + "</span>";
  }

  function navigateInBrowser(url) {
    try {
      window.parent.postMessage({ type: "pc-navigate", url: url }, window.location.origin);
    } catch (e) {
      window.location.href = url;
    }
  }

  function buildBlogCard(meta, body, slug) {
    var tags = Array.isArray(meta.tags) ? meta.tags : (meta.tags ? String(meta.tags).split(",").map(function(t){return t.trim();}) : []);
    var isExternal = Boolean(meta.link);
    var bodyHtml = isExternal ? "" : renderMarkdown(body);

    var card = document.createElement("div");
    card.style.cssText = CARD_BASE + "cursor:pointer;";
    card.innerHTML =
      '<div style="padding:24px;display:flex;flex-direction:column;flex:1;">' +
      '<h3 style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:8px;line-height:1.4;">' + escHtml(meta.title || slug) + '</h3>' +
      (meta.date ? '<p style="font-size:0.75rem;color:#6b7280;margin-bottom:12px;">' + formatDate(meta.date) + '</p>' : '') +
      '<p style="color:#9ca3af;font-size:0.875rem;margin-bottom:16px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + escHtml(meta.description || "") + '</p>' +
      (tags.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' + tags.map(techPill).join("") + '</div>' : '') +
      '</div>' +
      '<div style="padding:0 24px 20px;"><span style="font-size:0.875rem;color:#60a5fa;">' + (isExternal ? 'Read article →' : 'Read more →') + '</span></div>';

    card.addEventListener("mouseenter", function() { card.style.borderColor = "rgba(107,114,128,0.5)"; });
    card.addEventListener("mouseleave", function() { card.style.borderColor = "rgba(55,65,81,0.5)"; });
    card.addEventListener("click", function () {
      if (isExternal) {
        navigateInBrowser(meta.link);
      } else {
        openModal(meta.title || slug, meta.date, bodyHtml);
      }
    });
    return card;
  }

  function buildProjectCard(meta, body, slug) {
    var techs = Array.isArray(meta.tech) ? meta.tech : (meta.tech ? String(meta.tech).split(",").map(function(t){return t.trim();}) : []);
    var githubIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';
    var extIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

    var links =
      (meta.github ? '<a href="' + escHtml(meta.github) + '" target="_blank" rel="noopener noreferrer" style="color:#9ca3af;transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#9ca3af\'">' + githubIcon + '</a>' : '') +
      (meta.live   ? '<a href="' + escHtml(meta.live)   + '" target="_blank" rel="noopener noreferrer" style="color:#9ca3af;transition:color 0.2s;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#9ca3af\'">' + extIcon   + '</a>' : '');

    var card = document.createElement("div");
    card.style.cssText = CARD_BASE;
    card.innerHTML =
      (meta.image ? '<div style="height:192px;overflow:hidden;"><img src="' + escHtml(meta.image) + '" alt="' + escHtml(meta.title||slug) + '" style="width:100%;height:100%;object-fit:cover;"></div>' : '') +
      '<div style="padding:24px;display:flex;flex-direction:column;flex:1;">' +
      '<h3 style="font-size:1.1rem;font-weight:600;color:#fff;margin-bottom:12px;">' + escHtml(meta.title || slug) + '</h3>' +
      '<p style="color:#9ca3af;font-size:0.875rem;margin-bottom:16px;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + escHtml(meta.description || "") + '</p>' +
      (techs.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">' + techs.map(techPill).join("") + '</div>' : '') +
      (links ? '<div style="display:flex;align-items:center;gap:16px;margin-top:auto;">' + links + '</div>' : '') +
      '</div>';

    card.addEventListener("mouseenter", function() { card.style.borderColor = "rgba(107,114,128,0.5)"; });
    card.addEventListener("mouseleave", function() { card.style.borderColor = "rgba(55,65,81,0.5)"; });
    return card;
  }

  function buildCreativeCard(meta, body, slug) {
    var extIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="margin-left:4px;vertical-align:middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

    var card = document.createElement("div");
    card.style.cssText = CARD_BASE;
    card.innerHTML =
      (meta.image ? '<div style="height:192px;overflow:hidden;"><img src="' + escHtml(meta.image) + '" alt="' + escHtml(meta.title||slug) + '" style="width:100%;height:100%;object-fit:cover;"></div>' : '') +
      '<div style="padding:24px;display:flex;flex-direction:column;flex:1;">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">' +
      '<h3 style="font-size:1.1rem;font-weight:600;color:#fff;line-height:1.4;">' + escHtml(meta.title || slug) + '</h3>' +
      (meta.type ? '<span style="margin-left:12px;flex-shrink:0;font-size:0.7rem;padding:2px 10px;border-radius:9999px;background:rgba(168,85,247,0.1);color:#c084fc;border:1px solid rgba(168,85,247,0.2);">' + escHtml(meta.type) + '</span>' : '') +
      '</div>' +
      '<p style="color:#9ca3af;font-size:0.875rem;flex:1;margin-bottom:16px;">' + escHtml(meta.description || "") + '</p>' +
      (meta.link ? '<a href="' + escHtml(meta.link) + '" target="_blank" rel="noopener noreferrer" style="font-size:0.875rem;color:#c084fc;margin-top:auto;display:inline-flex;align-items:center;">View Work' + extIcon + '</a>' : '') +
      '</div>';

    card.addEventListener("mouseenter", function() { card.style.borderColor = "rgba(107,114,128,0.5)"; });
    card.addEventListener("mouseleave", function() { card.style.borderColor = "rgba(55,65,81,0.5)"; });
    return card;
  }

  // ─── SECTION BUILDER ─────────────────────────────────────────

  function buildSection(id, titleHtml, subtitle) {
    var section = document.createElement("section");
    section.id = id;
    section.style.cssText = "padding:80px 0;";
    section.innerHTML =
      '<div style="max-width:1280px;margin:0 auto;padding:0 16px;">' +
      '<div style="text-align:center;margin-bottom:64px;">' +
      '<h2 style="font-size:clamp(2rem,5vw,3rem);font-weight:700;background:' + titleHtml + ';-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px;">' +
      (id === "pc-projects" ? "Projects" : id === "pc-creative" ? "Creative Work" : "Blog") +
      '</h2>' +
      '<p style="font-size:1.1rem;color:#9ca3af;">' + subtitle + '</p>' +
      '</div>' +
      '<div id="' + id + '-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;">' +
      '<p style="color:#6b7280;text-align:center;grid-column:1/-1;padding:48px 0;">Loading...</p>' +
      '</div>' +
      '</div>';
    return section;
  }

  // ─── LOAD SECTIONS ───────────────────────────────────────────

  async function loadSection(folder, gridId, buildCard) {
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var files = await fetchDir(folder);
    if (!files.length) {
      grid.innerHTML = '<p style="color:#6b7280;text-align:center;grid-column:1/-1;padding:48px 0;">Nothing here yet — check back soon.</p>';
      return;
    }

    grid.innerHTML = "";

    var results = await Promise.all(
      files.map(async function (file) {
        var content = await fetchFile(file.download_url);
        if (!content) return null;
        var parsed = parseFrontmatter(content);
        return { meta: parsed.meta, body: parsed.body, slug: file.name.replace(/\.md$/, "") };
      })
    );

    results
      .filter(Boolean)
      .sort(function (a, b) {
        var da = a.meta.date ? new Date(a.meta.date) : 0;
        var db = b.meta.date ? new Date(b.meta.date) : 0;
        return db - da;
      })
      .forEach(function (item) {
        grid.appendChild(buildCard(item.meta, item.body, item.slug));
      });
  }

  // ─── INIT — runs after window load so React has fully hydrated ─

  function init() {
    var footer = document.querySelector("footer#contact");
    if (!footer) return;

    var projectsSection = buildSection("pc-projects", "linear-gradient(to right,#60a5fa,#a78bfa)", "Things I've built");
    var creativeSection = buildSection("pc-creative", "linear-gradient(to right,#c084fc,#f472b6)", "Art, music, and other creative pursuits");
    var blogsSection    = buildSection("pc-blogs",    "linear-gradient(to right,#34d399,#60a5fa)", "Thoughts, tutorials, and deep-dives");

    var parent = footer.parentNode;
    parent.insertBefore(projectsSection, footer);
    parent.insertBefore(creativeSection, footer);
    parent.insertBefore(blogsSection,    footer);

    loadSection("projects", "pc-projects-grid", buildProjectCard);
    loadSection("creative", "pc-creative-grid", buildCreativeCard);
    loadSection("blogs",    "pc-blogs-grid",    buildBlogCard);
  }

  // Use window load (fires after all async scripts including React) to avoid
  // conflicting with Next.js hydration
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }
})();
