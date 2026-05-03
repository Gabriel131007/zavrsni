import { createSignal, Show, onMount, For } from "solid-js";
import { currentUser, userProfile, isAdmin, authService } from "../services/auth.js";
import { ProfileSchema } from "../lib/schemas.js";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase.js";

export default function UserProfile() {
  const [editing,     setEditing]     = createSignal(false);
  const [displayName, setDisplayName] = createSignal("");
  const [nameError,   setNameError]   = createSignal("");
  const [saveMsg,     setSaveMsg]     = createSignal("");
  const [saving,      setSaving]      = createSignal(false);

  const [reviews, setReviews] = createSignal([]);
  const [revLoad, setRevLoad] = createSignal(true);

  onMount(async () => {
    setDisplayName(userProfile()?.displayName ?? currentUser()?.displayName ?? "");
    await loadReviews();
  });

  async function loadReviews() {
    setRevLoad(true);
    try {
      const q = query(
        collection(db, "reviews"),
        where("userId", "==", currentUser().uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Greška pri dohvaćanju recenzija:", err);
    } finally {
      setRevLoad(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setNameError("");
    setSaveMsg("");

    const result = ProfileSchema.safeParse({ displayName: displayName() });
    if (!result.success) {
      setNameError(result.error.errors[0].message);
      return;
    }

    setSaving(true);
    try {
      await authService.updateName(displayName().trim());
      setSaveMsg("Profil je uspješno ažuriran!");
      setEditing(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setNameError(err.message ?? "Greška pri spremanju.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm("Jesi li siguran/na da želiš obrisati ovu recenziju?")) return;
    await deleteDoc(doc(db, "reviews", reviewId));
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("hr-HR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function ratingColor(r) {
    if (r >= 8) return "badge-success";
    if (r >= 6) return "badge-warning";
    return "badge-error";
  }

  return (
    <div class="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">

      <div class="card bg-base-200 shadow">
        <div class="card-body gap-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-4">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content rounded-full w-14">
                  <span class="text-2xl font-bold">
                    {(userProfile()?.displayName ?? currentUser()?.email ?? "?")[0].toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-lg font-bold">
                    {userProfile()?.displayName ?? currentUser()?.displayName ?? "Korisnik"}
                  </span>
                  <Show when={isAdmin()}>
                    <span class="badge badge-error badge-sm">admin</span>
                  </Show>
                </div>
                <p class="text-base-content/60 text-sm">{currentUser()?.email}</p>
                <p class="text-base-content/40 text-xs mt-0.5">
                  Član od: {formatDate(userProfile()?.createdAt)}
                </p>
              </div>
            </div>

            <Show when={!editing()}>
              <button
                class="btn btn-ghost btn-sm"
                onClick={() => { setEditing(true); setSaveMsg(""); setNameError(""); }}
              >
                ✏️ Uredi profil
              </button>
            </Show>
          </div>

          <Show when={editing()}>
            <div class="divider my-1" />
            <form onSubmit={handleSave} class="flex flex-col gap-3 max-w-sm">
              <div class="form-control">
                <label class="label"><span class="label-text">Korisničko ime</span></label>
                <input
                  type="text"
                  class={`input input-bordered w-full ${nameError() ? "input-error" : ""}`}
                  value={displayName()}
                  onInput={(e) => { setDisplayName(e.target.value); setNameError(""); }}
                />
                <Show when={nameError()}>
                  <label class="label">
                    <span class="label-text-alt text-error">{nameError()}</span>
                  </label>
                </Show>
              </div>
              <div class="flex gap-2">
                <button type="submit" disabled={saving()} class="btn btn-primary btn-sm">
                  {saving() ? <span class="loading loading-spinner loading-xs" /> : null}
                  {saving() ? "Spremanje..." : "Spremi"}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm"
                  onClick={() => { setEditing(false); setNameError(""); }}
                >
                  Odustani
                </button>
              </div>
            </form>
          </Show>

          <Show when={saveMsg()}>
            <div class="alert alert-success text-sm py-2">{saveMsg()}</div>
          </Show>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-bold mb-4">
          Moje recenzije
          <span class="text-base-content/40 font-normal text-base ml-2">
            ({reviews().length})
          </span>
        </h2>

        <Show
          when={!revLoad()}
          fallback={
            <div class="flex justify-center py-10">
              <span class="loading loading-spinner loading-lg" />
            </div>
          }
        >
          <Show
            when={reviews().length > 0}
            fallback={
              <div class="card bg-base-200 shadow">
                <div class="card-body items-center text-center gap-3">
                  <p class="text-base-content/60">Još nisi napisao/la nijednu recenziju.</p>
                  <a href="/" class="btn btn-primary btn-sm">Pregledaj igre</a>
                </div>
              </div>
            }
          >
            <div class="flex flex-col gap-3">
              <For each={reviews()}>
                {(review) => (
                  <div class="card bg-base-200 shadow">
                    <div class="card-body py-4 gap-2">
                      <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class={`badge ${ratingColor(review.rating)} badge-sm font-mono font-bold`}>
                            {review.rating}/10
                          </span>
                          <span class="font-semibold text-sm">
                            {review.gameTitle ?? "Nepoznata igra"}
                          </span>
                          <span class="text-base-content/40 text-xs">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <button
                          class="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          onClick={() => deleteReview(review.id)}
                          title="Obriši recenziju"
                        >
                          🗑️
                        </button>
                      </div>
                      <p class="text-base-content/70 text-sm line-clamp-3">{review.text}</p>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}