import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { authService } from "../services/auth.js";

export default function SignOut() {
  const navigate = useNavigate();

  onMount(async () => {
    await authService.signOut();
    navigate("/");
  });

  return (
    <div class="flex justify-center items-center min-h-[60vh]">
      <span class="loading loading-spinner loading-lg" />
    </div>
  );
}