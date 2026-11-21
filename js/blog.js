// Blog: Beitragslisten, Kategorie-Filter, Einzelansicht
import { CATEGORIES } from "./config.js";
import { getClient, getCurrentMember, categoryName, formatDate, esc, paragraphs, notConfiguredHtml } from "./supabase.js";

const excerpt = (text, n = 220) => {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n).trimEnd() + " …" : t;
};

const postCard = (p) => `
  <article class="post-card">
    <p class="post-meta"><a class="chip small" href="blog.html?kategorie=${esc(p.category)}">${esc(categoryName(p.category))}</a>
      ${esc(formatDate(p.created_at))} · von ${esc(p.author)}</p>
    <h3><a href="blog.html?post=${p.id}">${esc(p.title)}</a></h3>
    <p>${esc(excerpt(p.content))}</p>
    <a href="blog.html?post=${p.id}">Weiterlesen →</a>
  </article>`;

/** Beitragsliste in ein Element rendern. */
export async function renderPostList(el, { category = null, limit = 50 } = {}) {
  if (!el) return;
  const sb = await getClient().catch(() => null);
  if (!sb) { el.innerHTML = notConfiguredHtml; return; }

  let q = sb.from("posts_public").select("*").order("created_at", { ascending: false }).limit(limit);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;

  if (error) { el.innerHTML = `<p class="notice">Beiträge konnten nicht geladen werden.</p>`; return; }
  el.innerHTML = data.length ? data.map(postCard).join("") : `<p class="muted">Noch keine Beiträge in diesem Bereich.</p>`;
}

/** Komplette Blog-Seite (blog.html). */
export async function initBlogPage() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("post");
  const category = params.get("kategorie");
  const filters = document.getElementById("filters");
  const list = document.getElementById("posts");
  const heading = document.getElementById("blog-heading");

  // "Neuer Beitrag" nur für angemeldete Mitglieder
  getCurrentMember().then((m) => {
    if (m) document.getElementById("new-post-btn")?.classList.remove("hidden");
  }).catch(() => {});

  // Einzelner Beitrag
  if (postId) {
    filters.classList.add("hidden");
    const sb = await getClient().catch(() => null);
    if (!sb) { list.innerHTML = notConfiguredHtml; return; }
    const { data: p } = await sb.from("posts_public").select("*").eq("id", postId).maybeSingle();
    if (!p) { heading.textContent = "Beitrag nicht gefunden"; list.innerHTML = '<p><a href="blog.html">← Zur Übersicht</a></p>'; return; }
    document.title = `${p.title} – Niko Vöhr`;
    heading.textContent = p.title;
    list.innerHTML = `
      <article class="post-full">
        <p class="post-meta"><a class="chip small" href="blog.html?kategorie=${esc(p.category)}">${esc(categoryName(p.category))}</a>
          ${esc(formatDate(p.created_at))} · von ${esc(p.author)}${p.updated_at ? " · bearbeitet" : ""}</p>
        <div class="post-body">${paragraphs(p.content)}</div>
        <p><a href="blog.html?kategorie=${esc(p.category)}">← Mehr aus ${esc(categoryName(p.category))}</a></p>
      </article>`;
    return;
  }

  // Übersicht mit Filter
  const valid = CATEGORIES.some((c) => c.slug === category) ? category : null;
  filters.innerHTML =
    `<a class="chip ${valid ? "" : "active"}" href="blog.html">Alle</a>` +
    CATEGORIES.map((c) => `<a class="chip ${c.slug === valid ? "active" : ""}" href="blog.html?kategorie=${c.slug}">${esc(c.name)}</a>`).join("");
  heading.textContent = valid ? `Blog: ${categoryName(valid)}` : "Blog";
  await renderPostList(list, { category: valid });
}
