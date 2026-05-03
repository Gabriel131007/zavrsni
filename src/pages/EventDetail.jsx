// src/pages/EventDetail.jsx
import { createSignal, createEffect, Show, For } from "solid-js";
import { useParams } from "@solidjs/router";
import { db } from "../lib/firebase";
import { isAuthenticated, currentUser, userProfile } from "../services/auth.js";
import {
  doc, getDoc, collection, query, where,
  orderBy, getDocs, updateDoc,
  serverTimestamp, runTransaction,
} from "firebase/firestore";

export default function EventDetail() {
  const params = useParams();

  const [game,       setGame]       = createSignal(null);
  const [reviews,    setReviews]    = createSignal([]);
  const [loading,    setLoading]    = createSignal(true);
  const [myReview,   setMyReview]   = createSignal(null);

  const [rating,     setRating]     = createSignal(5);
  const [text,       setText]       = createSignal("");
  const [formErr,    setFormErr]    = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [editing,    setEditing]    = createSignal(false);

  createEffect(async () => {
    const id = params.id;
    if (!id) return;
    try {
      const gameSnap = await getDoc(doc(db, "games", id));
      if (!gameSnap.exists()) { setLoading(false); return; }
      setGame({ id: gameSnap.id, ...gameSnap.data() });
      await loadReviews(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  async function loadReviews(gameId) {
    const q = query(
      collection(db, "reviews"),
      where("gameId", "==", gameId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setReviews(all);

    if (isAuthenticated() && currentUser()) {
      const mine = all.find((r) => r.userId === currentUser().uid);
      setMyReview(mine ?? null);
      if (mine) { setRating(mine.rating); setText(mine.text); }
    }
  }

  function avgRating() {
    const r = reviews();
    if (!r.length) return null;
    return (r.reduce((sum, x) => sum + x.rating, 0) / r.length).toFixed(1);
  }

  function ratingColor(r) {
    if (!r) return "badge-ghost";
    if (r >= 8) return "badge-success";
    if (r >= 6) return "badge-warning";
    return "badge-error";
  }

  function ratingLabel(r) {
    if (r >= 9) return "Remek-djelo";
    if (r >= 8) return "Izvrsno";
    if (r >= 7) return "Dobro";
    if (r >= 6) return "Solidno";
    if (r >= 5) return "Prosječno";
    if (r >= 3) return "Loše";
    return "Katastrofa";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormErr("");

    if (!text().trim() || text().trim().length < 10) {
      setFormErr("Recenzija mora imati najmanje 10 znakova.");
      return;
    }

    setSubmitting(true);
    try {
      const gameId = params.id;
      const uid    = currentUser().uid;
      const name   = userProfile()?.displayName ?? currentUser()?.displayName ?? "Anonimni";

      if (editing() && myReview()) {
        await updateDoc(doc(db, "reviews", myReview().id), {
          rating:    rating(),
          text:      text().trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await runTransaction(db, async (t) => {
          const gameRef  = doc(db, "games", gameId);
          const gameSnap = await t.get(gameRef);
          const data     = gameSnap.data();
          const newCount = (data.reviewCount ?? 0) + 1;
          const newAvg   = ((data.averageRating ?? 0) * (data.reviewCount ?? 0) + rating()) / newCount;

          const reviewRef = doc(collection(db, "reviews"));
          t.set(reviewRef, {
            gameId,
            gameTitle:  data.title,
            userId:     uid,
            authorName: name,
            rating:     rating(),
            text:       text().trim(),
            createdAt:  serverTimestamp(),
            updatedAt:  serverTimestamp(),
          });
          t.update(gameRef, {
            reviewCount:   newCount,
            averageRating: Math.round(newAvg * 10) / 10,
          });
        });
      }

      await loadReviews(gameId);
      setEditing(false);
    } catch (err) {
      setFormErr("Greška: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Jesi li siguran/na da želiš obrisati svoju recenziju?")) return;
    const gameId = params.id;
    try {
      await runTransaction(db, async (t) => {
        const gameRef  = doc(db, "games", gameId);
        const gameSnap = await t.get(gameRef);
        const data     = gameSnap.data();
        const newCount = Math.max((data.reviewCount ?? 1) - 1, 0);
        const newAvg   = newCount === 0
          ? 0
          : ((data.averageRating ?? 0) * (data.reviewCount ?? 1) - myReview().rating) / newCount;

        t.delete(doc(db, "reviews", myReview().id));
        t.update(gameRef, {
          reviewCount:   newCount,
          averageRating: newCount === 0 ? 0 : Math.round(newAvg * 10) / 10,
        });
      });

      setMyReview(null);
      setText("");
      setRating(5);
      setEditing(false);
      await loadReviews(gameId);
    } catch (err) {
      console.error(err);
    }
  }

  function formatDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("hr-HR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div class="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

      <a href="/games" class="btn btn-ghost btn-sm self-start gap-1">
        ← Natrag na igre
      </a>

      <Show when={loading()}>
        <div class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg" />
        </div>
      </Show>

      <Show when={!loading() && !game()}>
        <div class="alert alert-error">Igra ne postoji.</div>
      </Show>

      <Show when={!loading() && game()}>

        {/* ── Hero igre ── */}
        <div class="card bg-base-200 shadow-xl overflow-hidden">
          <Show when={game().coverUrl}>
            <figure class="w-full">
              <img
                src={game().coverUrl}
                alt={game().title}
                class="w-full object-contain max-h-80 bg-base-300"
                onError={(e) => e.target.style.display = "none"}
              />
            </figure>
          </Show>
          <div class="card-body gap-4">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex-1">
                <h1 class="text-4xl font-black mb-2">{game().title}</h1>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="badge badge-outline badge-md">{game().genre}</span>
                  <span class="text-base-content/50 text-sm">📅 {game().releaseYear}</span>
                  <Show when={game().reviewCount > 0}>
                    <span class="text-base-content/50 text-sm">💬 {game().reviewCount} recenzija</span>
                  </Show>
                </div>
              </div>
              <Show when={game().reviewCount > 0}>
                <div class="flex flex-col items-center gap-1">
                  <div class={`badge ${ratingColor(parseFloat(avgRating()))} text-2xl font-black px-5 py-6`}>
                    {avgRating()}
                  </div>
                  <span class="text-xs text-base-content/40">od 10</span>
                </div>
              </Show>
            </div>
            <p class="text-base-content/70 leading-relaxed">{game().description}</p>
          </div>
        </div>

        {/* ── Forma za recenziju ── */}
        <Show
          when={isAuthenticated()}
          fallback={
            <div class="alert shadow">
              <span class="text-sm">
                <a href="/user/signin" class="link link-primary font-semibold">Prijavi se</a>{" "}
                da bi napisao/la recenziju.
              </span>
            </div>
          }
        >
          <div class="card bg-base-200 shadow">
            <div class="card-body gap-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h2 class="text-lg font-bold">
                  {myReview() && !editing() ? "✅ Tvoja recenzija" : editing() ? "✏️ Uredi recenziju" : "✍️ Napiši recenziju"}
                </h2>
                <Show when={myReview() && !editing()}>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-xs" onClick={() => setEditing(true)}>Uredi</button>
                    <button class="btn btn-ghost btn-xs text-error" onClick={handleDelete}>Obriši</button>
                  </div>
                </Show>
              </div>

              <Show when={myReview() && !editing()}>
                <div class="flex items-center gap-3 flex-wrap">
                  <span class={`badge ${ratingColor(myReview().rating)} font-mono font-bold badge-lg`}>
                    {myReview().rating}/10
                  </span>
                  <span class="font-semibold text-sm text-base-content/60">{ratingLabel(myReview().rating)}</span>
                  <span class="text-xs text-base-content/40 ml-auto">{formatDate(myReview().createdAt)}</span>
                </div>
                <p class="text-base-content/80 leading-relaxed">{myReview().text}</p>
              </Show>

              <Show when={!myReview() || editing()}>
                <form onSubmit={handleSubmit} class="flex flex-col gap-5">
                  <div class="form-control gap-2">
                    <div class="flex items-center justify-between">
                      <span class="label-text font-semibold">Ocjena</span>
                      <div class="flex items-center gap-2">
                        <span class={`badge ${ratingColor(rating())} font-mono font-bold badge-lg`}>
                          {rating()}/10
                        </span>
                        <span class="text-sm text-base-content/50">{ratingLabel(rating())}</span>
                      </div>
                    </div>
                    <input
                      type="range" min="1" max="10" step="1"
                      class="range range-primary w-full"
                      onInput={(e) => setRating(parseInt(e.target.value))}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                    />
                    <div class="flex justify-between text-xs text-base-content/30 px-0.5">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>

                  <div class="form-control">
                    <label class="label"><span class="label-text font-semibold">Recenzija</span></label>
                    <textarea
                      rows="5"
                      placeholder="Napiši svoje mišljenje o igri (min. 10 znakova)..."
                      class={`textarea textarea-bordered resize-none text-sm leading-relaxed ${formErr() ? "textarea-error" : ""}`}
                      value={text()}
                      onInput={(e) => { setText(e.target.value); setFormErr(""); }}
                    />
                    <div class="flex justify-between mt-1">
                      <Show when={formErr()}>
                        <span class="text-error text-xs">{formErr()}</span>
                      </Show>
                      <span class="text-xs text-base-content/30 ml-auto">{text().length} znakova</span>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <button type="submit" disabled={submitting()} class="btn btn-primary">
                      {submitting() ? <span class="loading loading-spinner loading-sm" /> : null}
                      {submitting() ? "Objavljujem..." : editing() ? "Spremi izmjene" : "Objavi recenziju"}
                    </button>
                    <Show when={editing()}>
                      <button
                        type="button"
                        class="btn btn-ghost"
                        onClick={() => { setEditing(false); setRating(myReview().rating); setText(myReview().text); }}
                      >
                        Odustani
                      </button>
                    </Show>
                  </div>
                </form>
              </Show>
            </div>
          </div>
        </Show>

        {/* ── Sve recenzije ── */}
        <div>
          <h2 class="text-xl font-bold mb-4">
            Recenzije
            <span class="text-base-content/40 font-normal text-base ml-2">({reviews().length})</span>
          </h2>

          <Show
            when={reviews().length > 0}
            fallback={
              <div class="card bg-base-200 shadow">
                <div class="card-body items-center text-center py-10">
                  <p class="text-4xl mb-2">🎮</p>
                  <p class="text-base-content/60">Još nema recenzija. Budi prvi!</p>
                </div>
              </div>
            }
          >
            <div class="flex flex-col gap-3">
              <For each={reviews()}>
                {(r) => (
                  <div class={`card shadow ${r.userId === currentUser()?.uid ? "border border-primary/30 bg-base-200" : "bg-base-200"}`}>
                    <div class="card-body py-4 gap-3">
                      <div class="flex items-center gap-2 flex-wrap">
                        <div class="avatar placeholder">
                          <div class="bg-neutral text-neutral-content rounded-full w-8">
                            <span class="text-sm font-bold">{r.authorName?.[0]?.toUpperCase() ?? "?"}</span>
                          </div>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-semibold text-sm">{r.authorName}</span>
                            <Show when={r.userId === currentUser()?.uid}>
                              <span class="badge badge-primary badge-xs">ti</span>
                            </Show>
                            <span class="text-base-content/40 text-xs ml-auto">{formatDate(r.createdAt)}</span>
                          </div>
                        </div>
                        <span class={`badge ${ratingColor(r.rating)} font-mono font-bold`}>
                          {r.rating}/10
                        </span>
                      </div>
                      <p class="text-base-content/80 text-sm leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

      </Show>
    </div>
  );
}