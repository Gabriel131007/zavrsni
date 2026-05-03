import { createSignal, Show } from "solid-js";
import { authService }        from "../services/auth.js";
import { ResetPasswordSchema } from "../lib/schemas.js";

export default function ResetPassword() {
  const [email,   setEmail]   = createSignal("");
  const [error,   setError]   = createSignal("");
  const [sent,    setSent]    = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const result = ResetPasswordSchema.safeParse({ email: email() });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await authService.passwordReset(email());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="card bg-base-200 shadow-xl w-full max-w-md">
        <div class="card-body gap-5">

          <Show
            when={!sent()}
            fallback={
              <div class="text-center flex flex-col items-center gap-4 py-4">
                <div class="text-5xl">📬</div>
                <h2 class="text-2xl font-bold">E-mail je poslan!</h2>
                <p class="text-base-content/70 text-sm">
                  Ako postoji račun za{" "}
                  <span class="font-mono font-semibold text-base-content">{email()}</span>,
                  poslali smo link za resetiranje zaporke. Provjeri i spam mapu.
                </p>
                <a href="/user/signin" class="btn btn-primary w-full mt-2">
                  Natrag na prijavu
                </a>
              </div>
            }
          >
            <div class="text-center">
              <h1 class="text-3xl font-bold">Resetiranje zaporke</h1>
              <p class="text-base-content/60 text-sm mt-1">
                Upiši svoju e-mail adresu i poslat ćemo ti link.
              </p>
            </div>

            <form onSubmit={handleSubmit} class="flex flex-col gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">E-mail adresa</span></label>
                <input
                  type="email"
                  placeholder="tvoj@email.com"
                  class={`input input-bordered w-full ${error() ? "input-error" : ""}`}
                  value={email()}
                  onInput={(e) => { setEmail(e.target.value); setError(""); }}
                  autocomplete="email"
                />
                <Show when={error()}>
                  <label class="label"><span class="label-text-alt text-error">{error()}</span></label>
                </Show>
              </div>

              <button type="submit" disabled={loading()} class="btn btn-primary w-full">
                {loading() ? <span class="loading loading-spinner loading-sm" /> : null}
                {loading() ? "Slanje..." : "Pošalji link za resetiranje"}
              </button>
            </form>

            <div class="divider text-xs opacity-50" />
            <a href="/user/signin" class="btn btn-ghost btn-sm w-full">Natrag na prijavu</a>
          </Show>
        </div>
      </div>
    </div>
  );
}