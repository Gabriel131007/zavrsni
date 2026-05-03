// src/pages/Home.jsx
import { createSignal, Show, onMount } from "solid-js";
import { isAuthenticated } from "../services/auth.js";
import { db } from "../lib/firebase.js";
import { collection, getDocs, query } from "firebase/firestore";

export default function Home() {
    const [gameCount, setGameCount] = createSignal(0);
    const [loading,   setLoading]   = createSignal(true);

    onMount(async () => {
        try {
            const snap = await getDocs(query(collection(db, "games")));
            setGameCount(snap.size);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    });

    return (
        <div>
            {/* Hero sekcija */}
            <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
                {/* Pozadinska dekoracija */}
                <div class="absolute inset-0 -z-10 opacity-5">
                    <div class="absolute top-10 left-10 text-9xl">🎮</div>
                    <div class="absolute top-20 right-20 text-7xl">🕹️</div>
                    <div class="absolute bottom-20 left-20 text-7xl">👾</div>
                    <div class="absolute bottom-10 right-10 text-9xl">🎯</div>
                </div>

                <div class="text-8xl mb-6">🎮</div>
                <h1 class="text-6xl md:text-8xl font-black tracking-tight mb-4">
                    Game<span class="text-primary">Crit</span>
                </h1>
                <p class="text-xl text-base-content/60 max-w-lg mb-10">
                    Recenzije video igara od pravih igrača — bez marketinga, bez hype-a.
                </p>

                <div class="flex flex-wrap gap-4 justify-center">
                    <a href="/games" class="btn btn-primary btn-lg">
                        🕹️ Pregledaj igre
                        <Show when={!loading()}>
                            <span class="badge badge-primary-content ml-1">{gameCount()}</span>
                        </Show>
                    </a>
                    <Show when={!isAuthenticated()}>
                        <a href="/user/signup" class="btn btn-outline btn-lg">
                            Registriraj se
                        </a>
                    </Show>
                </div>
            </div>

            {/* Info kartice */}
            <div class="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card bg-base-200 shadow text-center">
                    <div class="card-body items-center">
                        <div class="text-4xl mb-2">⭐</div>
                        <h3 class="font-bold text-lg">Ocjeni igre</h3>
                        <p class="text-base-content/60 text-sm">Daj ocjenu od 1 do 10 i napiši što misliš.</p>
                    </div>
                </div>
                <div class="card bg-base-200 shadow text-center">
                    <div class="card-body items-center">
                        <div class="text-4xl mb-2">💬</div>
                        <h3 class="font-bold text-lg">Čitaj recenzije</h3>
                        <p class="text-base-content/60 text-sm">Mišljenja pravih igrača prije nego kupiš igru.</p>
                    </div>
                </div>
                <div class="card bg-base-200 shadow text-center">
                    <div class="card-body items-center">
                        <div class="text-4xl mb-2">🏆</div>
                        <h3 class="font-bold text-lg">Otkrij najbolje</h3>
                        <p class="text-base-content/60 text-sm">Pronađi igre s najvišim ocjenama zajednice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}