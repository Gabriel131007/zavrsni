import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authService } from "../services/auth.js";
import { SignInSchema } from "../lib/schemas.js";

export default function SignIn() {
  const navigate = useNavigate();

  const [fields,  setFields]  = createSignal({ email: "", password: "" });
  const [errors,  setErrors]  = createSignal({});
  const [apiErr,  setApiErr]  = createSignal("");
  const [loading, setLoading] = createSignal(false);

  function update(field, value) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiErr("");

    const result = SignInSchema.safeParse(fields());
    if (!result.success) {
      const errs = {};
      result.error.errors.forEach((err) => { errs[err.path[0]] = err.message; });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authService.signIn(fields().email, fields().password);
      navigate("/");
    } catch (err) {
      setApiErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div class="card bg-base-200 shadow-xl w-full max-w-md">
        <div class="card-body gap-5">
          <div class="text-center">
            <h1 class="text-3xl font-bold">Prijava</h1>
            <p class="text-base-content/60 text-sm mt-1">Dobrodošao/la natrag!</p>
          </div>
          <form onSubmit={handleSubmit} class="flex flex-col gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text">E-mail adresa</span></label>
              <input
                type="email"
                placeholder="tvoj@email.com"
                class={`input input-bordered w-full ${errors().email ? "input-error" : ""}`}
                value={fields().email}
                onInput={(e) => update("email", e.target.value)}
                autocomplete="email"
              />
              <Show when={errors().email}>
                <label class="label"><span class="label-text-alt text-error">{errors().email}</span></label>
              </Show>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">Zaporka</span>
                <a href="/user/resetpassword" class="label-text-alt link link-primary">
                  Zaboravili ste zaporku?
                </a>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                class={`input input-bordered w-full ${errors().password ? "input-error" : ""}`}
                value={fields().password}
                onInput={(e) => update("password", e.target.value)}
                autocomplete="current-password"
              />
              <Show when={errors().password}>
                <label class="label"><span class="label-text-alt text-error">{errors().password}</span></label>
              </Show>
            </div>
            <Show when={apiErr()}>
              <div class="alert alert-error text-sm py-2">{apiErr()}</div>
            </Show>
            <button type="submit" disabled={loading()} class="btn btn-primary w-full mt-1">
              {loading() ? <span class="loading loading-spinner loading-sm" /> : null}
              {loading() ? "Prijava u tijeku..." : "Prijavi se"}
            </button>
          </form>
          <div class="divider text-xs opacity-50">Nemaš račun?</div>
          <a href="/user/signup" class="btn btn-ghost btn-sm w-full">Registriraj se</a>
        </div>
      </div>
    </div>
  );
}