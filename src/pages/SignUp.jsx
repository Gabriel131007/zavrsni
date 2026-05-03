import { createSignal, Show } from "solid-js";
import { useNavigate }        from "@solidjs/router";
import { authService }        from "../services/auth.js";
import { SignUpSchema }       from "../lib/schemas.js";

export default function SignUp() {
  const navigate = useNavigate();

  const [fields,  setFields]  = createSignal({ name: "", email: "", password: "", passwordConfirm: "" });
  const [errors,  setErrors]  = createSignal({});
  const [apiErr,  setApiErr]  = createSignal("");
  const [loading, setLoading] = createSignal(false);

  function update(field, value) {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function passwordStrength() {
    const p = fields().password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)           s++;
    if (p.length >= 10)          s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  const strengthMeta = () => {
    const s = passwordStrength();
    if (s <= 1) return { label: "Slaba",   color: "progress-error"   };
    if (s <= 2) return { label: "Srednja", color: "progress-warning" };
    if (s <= 3) return { label: "Dobra",   color: "progress-info"    };
    return              { label: "Jaka",   color: "progress-success" };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setApiErr("");

    const result = SignUpSchema.safeParse(fields());
    if (!result.success) {
      const errs = {};
      result.error.errors.forEach((err) => { errs[err.path[0]] = err.message; });
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authService.signUp(fields().email, fields().password, fields().name);
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
            <h1 class="text-3xl font-bold">Registracija</h1>
            <p class="text-base-content/60 text-sm mt-1">Kreiraj svoj GameCrit račun</p>
          </div>

          <form onSubmit={handleSubmit} class="flex flex-col gap-4">

            <div class="form-control">
              <label class="label"><span class="label-text">Korisničko ime</span></label>
              <input
                type="text"
                placeholder="npr. gamer123"
                class={`input input-bordered w-full ${errors().name ? "input-error" : ""}`}
                value={fields().name}
                onInput={(e) => update("name", e.target.value)}
                autocomplete="username"
              />
              <Show when={errors().name}>
                <label class="label"><span class="label-text-alt text-error">{errors().name}</span></label>
              </Show>
            </div>

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
              <label class="label"><span class="label-text">Zaporka</span></label>
              <input
                type="password"
                placeholder="••••••••"
                class={`input input-bordered w-full ${errors().password ? "input-error" : ""}`}
                value={fields().password}
                onInput={(e) => update("password", e.target.value)}
                autocomplete="new-password"
              />
              <Show when={fields().password.length > 0}>
                <div class="mt-2 flex items-center gap-2">
                  <progress
                    class={`progress w-full ${strengthMeta().color}`}
                    value={passwordStrength()}
                    max="5"
                  />
                  <span class="text-xs whitespace-nowrap opacity-70">{strengthMeta().label}</span>
                </div>
              </Show>
              <Show when={errors().password}>
                <label class="label"><span class="label-text-alt text-error">{errors().password}</span></label>
              </Show>
            </div>

            <div class="form-control">
              <label class="label"><span class="label-text">Potvrdi zaporku</span></label>
              <input
                type="password"
                placeholder="••••••••"
                class={`input input-bordered w-full ${errors().passwordConfirm ? "input-error" : ""}`}
                value={fields().passwordConfirm}
                onInput={(e) => update("passwordConfirm", e.target.value)}
                autocomplete="new-password"
              />
              <Show when={errors().passwordConfirm}>
                <label class="label"><span class="label-text-alt text-error">{errors().passwordConfirm}</span></label>
              </Show>
            </div>

            <Show when={apiErr()}>
              <div class="alert alert-error text-sm py-2">{apiErr()}</div>
            </Show>

            <button type="submit" disabled={loading()} class="btn btn-primary w-full mt-1">
              {loading() ? <span class="loading loading-spinner loading-sm" /> : null}
              {loading() ? "Kreiranje računa..." : "Registriraj se"}
            </button>
          </form>

          <div class="divider text-xs opacity-50">Već imaš račun?</div>
          <a href="/user/signin" class="btn btn-ghost btn-sm w-full">Prijavi se</a>
        </div>
      </div>
    </div>
  );
}