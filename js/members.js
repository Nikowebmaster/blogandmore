// Mitgliederbereich: Beiträge schreiben/bearbeiten, Profil, Admin-Verwaltung
import { CATEGORIES } from "./config.js";
import { getClient, getCurrentMember, categoryName, formatDate, esc, notConfiguredHtml } from "./supabase.js";

const $ = (id) => document.getElementById(id);
const status = (form, text, type = "") => {
  const el = form.querySelector(".form-status");
  el.textContent = text;
  el.className = "form-status " + type;
};

const sb = await getClient().catch(() => null);
if (!sb) {
  $("loading").outerHTML = notConfiguredHtml;
} else {
  const member = await getCurrentMember();
  if (!member) {
    location.replace("login.html");
  } else {
    init(member);
  }
}

function init({ user, profile }) {
  const isAdmin = profile.role === "admin";
  $("loading").remove();
  $("members-app").classList.remove("hidden");
  $("hello-name").textContent = profile.first_name;

  $("logout-btn").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.href = "index.html";
  });

  // ---------- Beiträge ----------
  const postForm = $("post-form");
  const pf = postForm.elements; // Felder (postForm.id/.title wären Attribute des Formulars)
  pf.category.innerHTML = CATEGORIES.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join("");

  const resetPostForm = () => {
    postForm.reset();
    pf.id.value = "";
    $("post-form-title").textContent = "Neuer Beitrag";
    postForm.querySelector("button[type=submit]").textContent = "Veröffentlichen";
    $("cancel-edit").classList.add("hidden");
  };
  $("cancel-edit").addEventListener("click", () => { resetPostForm(); status(postForm, ""); });

  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!postForm.reportValidity()) return;
    const values = {
      category: pf.category.value,
      title: pf.title.value.trim(),
      content: pf.content.value.trim(),
    };
    const editing = pf.id.value;
    status(postForm, "Wird gespeichert …");
    const { data, error } = editing
      ? await sb.from("posts").update({ ...values, updated_at: new Date().toISOString() }).eq("id", editing).select("id").single()
      : await sb.from("posts").insert({ ...values, author_id: user.id }).select("id").single();
    if (error) return status(postForm, "Speichern fehlgeschlagen: " + error.message, "err");
    resetPostForm();
    status(postForm, "", "ok");
    postForm.querySelector(".form-status").innerHTML = `Gespeichert. <a href="blog.html?post=${data.id}">Beitrag ansehen →</a>`;
    loadPosts();
  });

  async function loadPosts() {
    $("my-posts-title").textContent = isAdmin ? "Alle Beiträge" : "Meine Beiträge";
    let q = sb.from("posts_public").select("*").order("created_at", { ascending: false });
    if (!isAdmin) q = q.eq("author_id", user.id);
    const { data, error } = await q;
    const box = $("my-posts");
    if (error) { box.innerHTML = '<p class="notice">Beiträge konnten nicht geladen werden.</p>'; return; }
    if (!data.length) { box.innerHTML = '<p class="muted">Noch keine Beiträge.</p>'; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Titel</th><th>Kategorie</th><th>Datum</th>${isAdmin ? "<th>Autor</th>" : ""}<th></th></tr></thead><tbody>${
      data.map((p) => `<tr>
        <td><a href="blog.html?post=${p.id}">${esc(p.title)}</a></td>
        <td>${esc(categoryName(p.category))}</td>
        <td>${esc(formatDate(p.created_at))}</td>
        ${isAdmin ? `<td>${esc(p.author)}</td>` : ""}
        <td class="actions">
          <button class="link-btn" data-edit="${p.id}">Bearbeiten</button>
          <button class="link-btn danger" data-delete="${p.id}">Löschen</button>
        </td></tr>`).join("")
    }</tbody></table>`;
    box.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => {
      const p = data.find((x) => String(x.id) === b.dataset.edit);
      pf.id.value = p.id;
      pf.category.value = p.category;
      pf.title.value = p.title;
      pf.content.value = p.content;
      $("post-form-title").textContent = "Beitrag bearbeiten";
      postForm.querySelector("button[type=submit]").textContent = "Änderungen speichern";
      $("cancel-edit").classList.remove("hidden");
      $("neu").scrollIntoView();
    }));
    box.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Diesen Beitrag wirklich löschen?")) return;
      const { error } = await sb.from("posts").delete().eq("id", b.dataset.delete);
      if (error) alert("Löschen fehlgeschlagen: " + error.message);
      loadPosts();
    }));
  }
  loadPosts();

  // ---------- Profil ----------
  const profileForm = $("profile-form");
  $("profile-username").textContent = profile.username;
  for (const k of ["first_name", "last_name", "birth_date", "city", "about"]) profileForm[k].value = profile[k] ?? "";
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = (k) => profileForm[k].value.trim() || null;
    const { error } = await sb.from("profiles").update({
      first_name: v("first_name"), last_name: v("last_name"), birth_date: v("birth_date"), city: v("city"), about: v("about"),
    }).eq("id", user.id);
    status(profileForm, error ? "Speichern fehlgeschlagen: " + error.message : "Profil gespeichert.", error ? "err" : "ok");
  });

  // ---------- Admin ----------
  if (!isAdmin) return;
  $("admin-panel").classList.remove("hidden");
  const memberForm = $("member-form");

  memberForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!memberForm.reportValidity()) return;
    status(memberForm, "Wird angelegt …");
    const body = Object.fromEntries(new FormData(memberForm));
    const { data, error } = await sb.functions.invoke("manage-members", { body: { action: "create", ...body } });
    const msg = data?.error ?? (error ? await errorText(error) : null);
    if (msg) return status(memberForm, msg, "err");
    memberForm.reset();
    status(memberForm, `Mitglied „${data.username}“ wurde angelegt.`, "ok");
    loadMembers();
  });

  async function loadMembers() {
    const { data, error } = await sb.from("profiles").select("id, username, first_name, last_name, city, birth_date, role, created_at").order("created_at");
    const box = $("member-list");
    if (error) { box.innerHTML = '<p class="notice">Mitglieder konnten nicht geladen werden.</p>'; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Username</th><th>Name</th><th>Wohnort</th><th>Rolle</th><th></th></tr></thead><tbody>${
      data.map((m) => `<tr>
        <td>${esc(m.username)}</td>
        <td>${esc(m.first_name)} ${esc(m.last_name)}</td>
        <td>${esc(m.city ?? "")}</td>
        <td>${m.role === "admin" ? "Admin" : "Mitglied"}</td>
        <td class="actions">${m.id === user.id ? "" : `<button class="link-btn danger" data-remove="${m.id}" data-name="${esc(m.username)}">Entfernen</button>`}</td>
      </tr>`).join("")
    }</tbody></table>`;
    box.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm(`Mitglied „${b.dataset.name}“ und alle seine Beiträge endgültig löschen?`)) return;
      const { data, error } = await sb.functions.invoke("manage-members", { body: { action: "delete", id: b.dataset.remove } });
      const msg = data?.error ?? (error ? await errorText(error) : null);
      if (msg) alert(msg);
      loadMembers();
      loadPosts();
    }));
  }
  loadMembers();
}

// Fehlermeldung aus der Edge Function lesen
async function errorText(error) {
  try {
    const body = await error.context?.json();
    if (body?.error) return body.error;
  } catch {}
  return error.message || "Unbekannter Fehler.";
}
