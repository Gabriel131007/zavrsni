// src/pages/Games.jsx
import { createSignal, Show, For, onMount } from "solid-js";
import { db } from "../lib/firebase.js";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function Games() {
    const [games,   setGames]   = createSignal([]);
    const [loading, setLoading] = createSignal(true);
    const [search,  setSearch]  = createSignal("");

    onMount(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "games"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setGames(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Greška pri učitavanju igara:", err);
        } finally {
            setLoading(false);
        }
    });

    const filtered = () => {
        const s = search().toLowerCase();
        if (!s) return games();
        return games().filter(g =>
            g.title?.toLowerCase().includes(s) ||
            g.genre?.toLowerCase().includes(s)
        );
    };

    function ratingColor(r) {
        if (!r || r === 0) return "badge-ghost";
        if (r >= 8) return "badge-success";
        if (r >= 6) return "badge-warning";
        return "badge-error";
    }

    return (
        <div class="max-w-5xl mx-auto px-4 py-8">
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h1 class="text-3xl font-bold">🎮 Igre</h1>
                <span class="text-base-content/40 text-sm">{games().length} igara u bazi</span>
            </div>

            <div class="max-w-md mb-8">
                <input
                    type="text"
                    placeholder="Pretraži po nazivu ili žanru..."
                    class="input input-bordered w-full"
                    value={search()}
                    onInput={(e) => setSearch(e.target.value)}
                />
            </div>

            <Show when={loading()}>
                <div class="flex justify-center py-16">
                    <span class="loading loading-spinner loading-lg" />
                </div>
            </Show>

            <Show when={!loading() && games().length === 0}>
                <div class="text-center py-16">
                    <p class="text-5xl mb-4">🕹️</p>
                    <p class="text-base-content/60">Još nema igara u bazi.</p>
                </div>
            </Show>

            <Show when={!loading() && filtered().length === 0 && games().length > 0}>
                <div class="text-center py-10">
                    <p class="text-base-content/60">Nema igara za "{search()}"</p>
                    <button class="btn btn-ghost btn-sm mt-2" onClick={() => setSearch("")}>
                        Poništi pretragu
                    </button>
                </div>
            </Show>

            <Show when={!loading() && filtered().length > 0}>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <For each={filtered()}>
                        {(game) => (
                            <a href={`/event/view/${game.id}`} class="card bg-base-200 shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                                <Show
                                    when={game.coverUrl}
                                    fallback={
                                        <div class="h-48 bg-base-300 rounded-t-2xl flex items-center justify-center text-4xl">
                                            🎮
                                        </div>
                                    }
                                >
                                    <figure>
                                        <img
                                            src={game.coverUrl}
                                            alt={game.title}
                                            class="w-full h-48 object-cover rounded-t-2xl"
                                            onError={(e) => { e.target.style.display = "none"; }}
                                        />
                                    </figure>
                                </Show>

                                <div class="card-body py-4 gap-2">
                                    <div class="flex items-start justify-between gap-2">
                                        <h2 class="card-title text-base">{game.title}</h2>
                                        <Show when={game.reviewCount > 0}>
                                            <span class={`badge ${ratingColor(game.averageRating)} badge-sm font-mono font-bold flex-shrink-0`}>
                                                {game.averageRating?.toFixed(1)}/10
                                            </span>
                                        </Show>
                                    </div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="badge badge-outline badge-xs">{game.genre}</span>
                                        <span class="text-base-content/40 text-xs">{game.releaseYear}</span>
                                    </div>
                                    <p class="text-base-content/60 text-xs line-clamp-2">{game.description}</p>
                                    <div class="text-xs text-base-content/40 mt-1">
                                        {game.reviewCount > 0 ? `${game.reviewCount} recenzija` : "Još nema recenzija"}
                                    </div>
                                </div>
                            </a>
                        )}
                    </For>
                </div>
            </Show>
        </div>
    );
}