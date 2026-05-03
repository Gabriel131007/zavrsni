import { createSignal, Show, onMount, For } from "solid-js";
import { isAdmin, authLoading } from "../services/auth.js";
import { z } from "zod";
import {
  collection, addDoc, serverTimestamp,
  getDocs, query, orderBy, deleteDoc, doc, updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase.js";

const GENRES = [
  "Akcija", "Avantura", "RPG", "Strategija", "Pucačina",
  "Sport", "Simulacija", "Horror", "Puzzle", "Indie", "Ostalo",
];

const LocalGameSchema = z.object({
  title: z.string().min(1, "Naziv igre je obavezan").max(100, "Naziv može imati najviše 100 znakova"),
  description: z.string().min(10, "Opis mora imati najmanje 10 znakova").max(1000, "Opis može imati najviše 1000 znakova"),
  genre: z.string().min(1, "Žanr je obavezan"),
  releaseYear: z.coerce.number().int().min(1970, "Godina mora biti 1970 ili novija").max(new Date().getFullYear() + 2, "Godina ne može biti toliko u budućnosti"),
});

export default function EventManagement() {
  const [fields,  setFields]  = createSignal({
    title: "", description: "", genre: "",
    releaseYear: new Date().getFullYear(), coverUrl: "",
  });
  const [formErrors, setFormErrors] = createSignal({});
  const [addMsg,  setAddMsg]  = createSignal("");
  const [adding,  setAdding]  = createSignal(false);

  const [reviews,   setReviews]   = createSignal([]);
  const [revLoad,   setRevLoad]   = createSignal(true);
  const [games,     setGames]     = createSignal([]);
  const [gamesLoad, setGamesLoad] = createSignal(true);

  // Edit stanje
  const [editingGame,   setEditingGame]   = createSignal(null);
  const [editFields,    setEditFields]    = createSignal({});
  const [editErrors,    setEditErrors]    = createSignal({});
  const [editMsg,       setEditMsg]       = createSignal("");
  const [saving,        setSaving]        = createSignal(false);

  onMount(async () => {
    await Promise.all([loadReviews(), loadGames()]);
  });

  async function loadReviews() {
    setRevLoad(true);
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setRevLoad(false);
    }
  }

  async function loadGames() {
    setGamesLoad(true);
    try {
      const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setGamesLoad(false);
    }
  }

  function update(field, value) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function updateEdit(field, value) {
    setEditFields((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function startEdit(game) {
    setEditingGame(game.id);
    setEditFields({
      title:       game.title,
      description: game.description,
      genre:       game.genre,
      releaseYear: game.releaseYear,
      coverUrl:    game.coverUrl ?? "",
    });
    setEditErrors({});
    setEditMsg("");
  }

  function cancelEdit() {
    setEditingGame(null);
    setEditFields({});
    setEditErrors({});
    setEditMsg("");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditMsg("");
    setEditErrors({});

    const result = LocalGameSchema.safeParse(editFields());
    if (!result.success) {
      const errs = {};
      const issues = result.error?.issues ?? result.error?.errors ?? [];
      issues.forEach((err) => { errs[err.path[0]] = err.message; });
      setEditErrors(errs);
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "games", editingGame()), {
        title:       editFields().title.trim(),
        description: editFields().description.trim(),
        genre:       editFields().genre,
        releaseYear: parseInt(editFields().releaseYear),
        coverUrl:    editFields().coverUrl.trim(),
      });
      setEditMsg("✅ Igra je uspješno ažurirana!");
      await loadGames();
      setTimeout(() => { setEditingGame(null); setEditMsg(""); }, 1500);
    } catch (err) {
      setEditMsg("❌ Greška: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGame(e) {
    e.preventDefault();
    setAddMsg("");
    setFormErrors({});

    const result = LocalGameSchema.safeParse(fields());
    if (!result.success) {
      const errs = {};
      const issues = result.error?.issues ?? result.error?.errors ?? [];
      issues.forEach((err) => { errs[err.path[0]] = err.message; });
      setFormErrors(errs);
      return;
    }

    setAdding(true);
    try {
      await addDoc(collection(db, "games"), {
        title:         fields().title.trim(),
        description:   fields().description.trim(),
        genre:         fields().genre,
        releaseYear:   parseInt(fields().releaseYear),
        coverUrl:      fields().coverUrl.trim(),
        averageRating: 0,
        reviewCount:   0,
        createdAt:     serverTimestamp(),
      });
      setAddMsg(`✅ Igra "${fields().title}" je uspješno dodana!`);
      setFields({ title: "", description: "", genre: "", releaseYear: new Date().getFullYear(), coverUrl: "" });
      setTimeout(() => setAddMsg(""), 4000);
      await loadGames();
    } catch (err) {
      setAddMsg("❌ Greška: " + err.message);
    } finally {
      setAdding(false);
    }
  }

  async function deleteGame(gameId, gameTitle) {
    if (!confirm(`Obrisati igru "${gameTitle}"?`)) return;
    await deleteDoc(doc(db, "games", gameId));
    setGames((prev) => prev.filter((g) => g.id !== gameId));
  }

  async function deleteReview(reviewId) {
    if (!confirm("Obrisati ovu recenziju?")) return;
    await deleteDoc(doc(db, "reviews", reviewId));
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("hr-HR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function ratingColor(r) {
    if (!r || r === 0) return "badge-ghost";
    if (r >= 8) return "badge-success";
    if (r >= 6) return "badge-warning";
    return "badge-error";
  }

  return (
    <Show
      when={!authLoading()}
      fallback={<div class="flex justify-center items-center min-h-[60vh]"><span class="loading loading-spinner loading-lg" /></div>}
    >
      <Show
        when={isAdmin()}
        fallback={<div class="flex justify-center items-center min-h-[60vh]"><div class="alert alert-error max-w-sm">Nemate pristup admin panelu.</div></div>}
      >
        <div class="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-10">

          <div>
            <h1 class="text-3xl font-bold">⚡ Admin panel</h1>
            <p class="text-base-content/60 mt-1">Upravljanje igrama i moderacija recenzija</p>
          </div>

          {/* Statistike */}
          <div class="stats stats-horizontal shadow w-full bg-base-200">
            <div class="stat">
              <div class="stat-title">Ukupno igara</div>
              <div class="stat-value text-primary">{games().length}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Ukupno recenzija</div>
              <div class="stat-value text-secondary">{reviews().length}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Uloga</div>
              <div class="stat-value text-error text-2xl">Admin</div>
            </div>
          </div>

          {/* Dodaj igru */}
          <div class="card bg-base-200 shadow">
            <div class="card-body gap-5">
              <h2 class="card-title">Dodaj novu igru</h2>
              <form onSubmit={handleAddGame} class="flex flex-col gap-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label"><span class="label-text">Naziv igre *</span></label>
                    <input type="text" placeholder="npr. Elden Ring"
                      class={`input input-bordered ${formErrors().title ? "input-error" : ""}`}
                      value={fields().title} onInput={(e) => update("title", e.target.value)} />
                    <Show when={formErrors().title}>
                      <label class="label"><span class="label-text-alt text-error">{formErrors().title}</span></label>
                    </Show>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text">Žanr *</span></label>
                    <select class={`select select-bordered ${formErrors().genre ? "select-error" : ""}`}
                      value={fields().genre} onChange={(e) => update("genre", e.target.value)}>
                      <option value="">Odaberi žanr</option>
                      <For each={GENRES}>{(g) => <option value={g}>{g}</option>}</For>
                    </select>
                    <Show when={formErrors().genre}>
                      <label class="label"><span class="label-text-alt text-error">{formErrors().genre}</span></label>
                    </Show>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text">Godina izlaska</span></label>
                    <input type="number" placeholder="2024" min="1970" max="2030"
                      class={`input input-bordered ${formErrors().releaseYear ? "input-error" : ""}`}
                      value={fields().releaseYear} onInput={(e) => update("releaseYear", e.target.value)} />
                    <Show when={formErrors().releaseYear}>
                      <label class="label"><span class="label-text-alt text-error">{formErrors().releaseYear}</span></label>
                    </Show>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text">URL naslovnice (neobavezno)</span></label>
                    <input type="text" placeholder="https://..."
                      class="input input-bordered"
                      value={fields().coverUrl} onInput={(e) => update("coverUrl", e.target.value)} />
                  </div>
                </div>

                <div class="form-control">
                  <label class="label"><span class="label-text">Opis igre *</span></label>
                  <textarea placeholder="Kratki opis igre..." rows="4"
                    class={`textarea textarea-bordered resize-none ${formErrors().description ? "textarea-error" : ""}`}
                    value={fields().description} onInput={(e) => update("description", e.target.value)} />
                  <Show when={formErrors().description}>
                    <label class="label"><span class="label-text-alt text-error">{formErrors().description}</span></label>
                  </Show>
                </div>

                <Show when={addMsg()}>
                  <div class={`alert text-sm py-2 ${addMsg().startsWith("✅") ? "alert-success" : "alert-error"}`}>{addMsg()}</div>
                </Show>

                <div class="card-actions">
                  <button type="submit" disabled={adding()} class="btn btn-primary">
                    {adding() ? <span class="loading loading-spinner loading-sm" /> : null}
                    {adding() ? "Dodavanje..." : "+ Dodaj igru"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Popis igara */}
          <div>
            <h2 class="text-xl font-bold mb-4">
              Popis igara
              <span class="text-base-content/40 font-normal text-base ml-2">({games().length})</span>
            </h2>

            <Show when={!gamesLoad()} fallback={<div class="flex justify-center py-6"><span class="loading loading-spinner loading-lg" /></div>}>
              <Show when={games().length > 0} fallback={<p class="text-base-content/60 text-sm">Nema igara.</p>}>
                <div class="flex flex-col gap-3">
                  <For each={games()}>
                    {(g) => (
                      <div class="card bg-base-200 shadow">
                        {/* Prikaz igre */}
                        <Show when={editingGame() !== g.id}>
                          <div class="card-body py-3 flex-row items-center gap-3">
                            <Show
                              when={g.coverUrl}
                              fallback={<div class="w-12 h-12 rounded-lg bg-base-300 flex items-center justify-center text-xl flex-shrink-0">🎮</div>}
                            >
                              <img src={g.coverUrl} alt={g.title}
                                class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => e.target.style.display = "none"} />
                            </Show>

                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-semibold text-sm">{g.title}</span>
                                <span class="badge badge-outline badge-xs">{g.genre}</span>
                                <span class="text-base-content/40 text-xs">{g.releaseYear}</span>
                                <Show when={g.reviewCount > 0}>
                                  <span class={`badge ${ratingColor(g.averageRating)} badge-xs font-mono`}>
                                    {g.averageRating?.toFixed(1)}/10
                                  </span>
                                </Show>
                              </div>
                            </div>

                            <div class="flex gap-1 flex-shrink-0">
                              <button class="btn btn-ghost btn-xs" onClick={() => startEdit(g)} title="Uredi">✏️</button>
                              <button class="btn btn-ghost btn-xs text-error" onClick={() => deleteGame(g.id, g.title)} title="Obriši">🗑️</button>
                            </div>
                          </div>
                        </Show>

                        {/* Edit forma */}
                        <Show when={editingGame() === g.id}>
                          <div class="card-body gap-4">
                            <h3 class="font-bold text-sm">✏️ Uredi: {g.title}</h3>
                            <form onSubmit={handleSaveEdit} class="flex flex-col gap-3">
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div class="form-control">
                                  <label class="label"><span class="label-text text-xs">Naziv *</span></label>
                                  <input type="text" class={`input input-bordered input-sm ${editErrors().title ? "input-error" : ""}`}
                                    value={editFields().title} onInput={(e) => updateEdit("title", e.target.value)} />
                                  <Show when={editErrors().title}>
                                    <label class="label"><span class="label-text-alt text-error">{editErrors().title}</span></label>
                                  </Show>
                                </div>

                                <div class="form-control">
                                  <label class="label"><span class="label-text text-xs">Žanr *</span></label>
                                  <select class={`select select-bordered select-sm ${editErrors().genre ? "select-error" : ""}`}
                                    value={editFields().genre} onChange={(e) => updateEdit("genre", e.target.value)}>
                                    <option value="">Odaberi žanr</option>
                                    <For each={GENRES}>{(g) => <option value={g}>{g}</option>}</For>
                                  </select>
                                  <Show when={editErrors().genre}>
                                    <label class="label"><span class="label-text-alt text-error">{editErrors().genre}</span></label>
                                  </Show>
                                </div>

                                <div class="form-control">
                                  <label class="label"><span class="label-text text-xs">Godina</span></label>
                                  <input type="number" min="1970" max="2030"
                                    class={`input input-bordered input-sm ${editErrors().releaseYear ? "input-error" : ""}`}
                                    value={editFields().releaseYear} onInput={(e) => updateEdit("releaseYear", e.target.value)} />
                                  <Show when={editErrors().releaseYear}>
                                    <label class="label"><span class="label-text-alt text-error">{editErrors().releaseYear}</span></label>
                                  </Show>
                                </div>

                                <div class="form-control">
                                  <label class="label"><span class="label-text text-xs">URL naslovnice</span></label>
                                  <input type="text" class="input input-bordered input-sm"
                                    value={editFields().coverUrl} onInput={(e) => updateEdit("coverUrl", e.target.value)} />
                                </div>
                              </div>

                              <div class="form-control">
                                <label class="label"><span class="label-text text-xs">Opis *</span></label>
                                <textarea rows="3" class={`textarea textarea-bordered resize-none text-sm ${editErrors().description ? "textarea-error" : ""}`}
                                  value={editFields().description} onInput={(e) => updateEdit("description", e.target.value)} />
                                <Show when={editErrors().description}>
                                  <label class="label"><span class="label-text-alt text-error">{editErrors().description}</span></label>
                                </Show>
                              </div>

                              <Show when={editMsg()}>
                                <div class={`alert text-sm py-2 ${editMsg().startsWith("✅") ? "alert-success" : "alert-error"}`}>{editMsg()}</div>
                              </Show>

                              <div class="flex gap-2">
                                <button type="submit" disabled={saving()} class="btn btn-primary btn-sm">
                                  {saving() ? <span class="loading loading-spinner loading-xs" /> : null}
                                  {saving() ? "Spremanje..." : "Spremi"}
                                </button>
                                <button type="button" class="btn btn-ghost btn-sm" onClick={cancelEdit}>Odustani</button>
                              </div>
                            </form>
                          </div>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>

          {/* Moderacija recenzija */}
          <div>
            <h2 class="text-xl font-bold mb-4">
              Moderacija recenzija
              <span class="text-base-content/40 font-normal text-base ml-2">({reviews().length})</span>
            </h2>

            <Show when={!revLoad()} fallback={<div class="flex justify-center py-6"><span class="loading loading-spinner loading-lg" /></div>}>
              <Show when={reviews().length > 0} fallback={<p class="text-base-content/60 text-sm">Nema recenzija.</p>}>
                <div class="flex flex-col gap-3">
                  <For each={reviews()}>
                    {(r) => (
                      <div class="card bg-base-200 shadow">
                        <div class="card-body py-3 flex-row items-start gap-3">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                              <span class="badge badge-outline badge-sm font-mono font-bold">{r.rating}/10</span>
                              <span class="font-semibold text-sm">{r.gameTitle ?? "Igra"}</span>
                              <span class="text-base-content/50 text-xs">od {r.authorName ?? "?"}</span>
                              <span class="text-base-content/40 text-xs ml-auto">{formatDate(r.createdAt)}</span>
                            </div>
                            <p class="text-base-content/70 text-sm line-clamp-2">{r.text}</p>
                          </div>
                          <button class="btn btn-ghost btn-xs text-error hover:bg-error/10 flex-shrink-0"
                            onClick={() => deleteReview(r.id)} title="Obriši recenziju">🗑️</button>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>

        </div>
      </Show>
    </Show>
  );
}