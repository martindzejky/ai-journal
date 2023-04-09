<template>
    <section class="max-w-full w-80">
        <h1 class="text-3xl font-bold text-center mb-6">Log in</h1>

        <form
            @submit.prevent="login"
            class="flex flex-col gap-1"
        >
            <label for="email">Email</label>
            <input
                name="email"
                id="email"
                type="email"
                autocomplete="email"
                v-model="email"
                required
                :placeholder="placeholderName"
            />

            <label for="password">Password</label>
            <input
                name="password"
                id="password"
                type="password"
                autocomplete="current-password"
                v-model="password"
                required
                :placeholder="placeholderEmail"
            />

            <button
                type="submit"
                class="bg-amber-400 py-2 px-3 mt-6"
            >
                Log in
            </button>
        </form>

        <p class="text-slate-500 mt-2 text-center text-sm">
            Don't have an account yet?
            <NuxtLink
                class="text-amber-400"
                :href="
                    '/register' +
                    ($route.query?.redirect ? `?redirect=${$route.query.redirect}` : '')
                "
            >
                Register
            </NuxtLink>
        </p>
    </section>
</template>

<script setup lang="ts">
import { signInWithEmailAndPassword } from '@firebase/auth';

definePageMeta({
    middleware: ['logged-out'],
    name: 'login',
    title: 'Log in',
});

const email = ref('');
const password = ref('');

const auth = useFirebaseAuth();
const route = useRoute();
const router = useRouter();

const placeholderName = getPlaceholderName();
const placeholderEmail = getPlaceholderEmail(placeholderName);

async function login() {
    if (!auth) return;

    await signInWithEmailAndPassword(auth, email.value, password.value);
    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}
</script>
