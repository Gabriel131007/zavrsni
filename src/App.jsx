// src/App.jsx
import { Router, Route, Navigate } from "@solidjs/router";
import { isAuthenticated, authLoading, isAdmin } from "./services/auth.js";
import { Show } from "solid-js";
import Toast from "./components/Toast.jsx"

import Home from "./pages/Home";
import Games from "./pages/Games";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Error from "./pages/Error";
import SignOut from "./pages/SignOut";
import ResetPassword from "./pages/ResetPassword";
import EventManagement from "./pages/EventManagement";
import PrivateEvents from "./pages/PrivateEvents.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import UserProfile from "./pages/UserProfile.jsx";

export default function App() {
    return (
        <Router root={Layout}>
            <Route path="/" component={Home} />
            <Route path="/games" component={Games} />
            <Route path="/user">
                <Route path="/signin" component={SignIn} />
                <Route path="/signup" component={SignUp} />
                <Route path="/signout" component={SignOut} />
                <Route path="/resetpassword" component={ResetPassword} />
                <Route path="/profile" component={AuthBoundary}>
                    <Route path="/" component={UserProfile} />
                </Route>
            </Route>
            <Route path="/event">
                <Route path="/view/:id" component={EventDetail} />
                <Route component={AuthBoundary}>
                    <Route path="/management" component={EventManagement} />
                    <Route path="/private" component={PrivateEvents} />
                </Route>
            </Route>
            <Route path="/error" component={Error} />
            <Route path="*" component={NotFound} />
        </Router>
    )
}

function Layout(props) {
    return (
        <>
            <div class="navbar bg-base-100 shadow-sm">
                <div class="navbar-start">
                    <div class="dropdown">
                        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                            </svg>
                        </div>
                        <ul tabindex="-1" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <li><a href="/games">🎮 Igre</a></li>
                            <Show when={isAdmin()}>
                                <li><a href="/event/management">⚡ Admin panel</a></li>
                            </Show>
                        </ul>
                    </div>
                </div>
                <div class="navbar-center">
                    <a href="/" class="btn btn-ghost text-xl font-bold tracking-wider">
                        🎮 GameCrit
                    </a>
                </div>
                <div class="navbar-end">
                    <Show when={!isAuthenticated()}>
                        <a href="/user/signin" class="btn btn-ghost btn-sm">Prijava</a>
                        <a href="/user/signup" class="btn btn-primary btn-sm ml-1">Registracija</a>
                    </Show>
                    <Show when={isAuthenticated()}>
                        <Show when={isAdmin()}>
                            <span class="badge badge-error badge-sm mr-2">admin</span>
                        </Show>
                        <a href="/user/profile" class="btn btn-ghost btn-square text-xl">👤</a>
                        <a href="/user/signout" class="btn btn-ghost btn-square text-xl">🚪</a>
                    </Show>
                </div>
            </div>

            <main class="min-h-[65vh] p-2">{props.children}</main>

            <footer class="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
                <nav class="grid grid-flow-col gap-4">
                    <a class="link link-hover">O nama</a>
                    <a class="link link-hover">Kontakt</a>
                </nav>
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - GameCrit — Recenzije video igara</p>
                </aside>
            </footer>

            <Toast />
        </>
    );
}

function NotFound() {
    return <Navigate href="/error" state={{ error: { title: "404", message: "Tražena stranica ne postoji." } }} />
}

function AuthBoundary(props) {
    return (
        <Show when={!authLoading()} fallback={
            <div class="flex justify-center items-center min-h-screen">
                <span class="loading loading-spinner loading-xl"></span>
            </div>
        }>
            {isAuthenticated() ?
                (props.children) :
                (<Navigate href="/error" state={{ error: { title: "401", message: "Pristup traženoj stranici nije dozvoljen." } }} />)}
        </Show>
    );
}