<template>
    <section>
        <h1 class="text-lg mb-4">Log in</h1>

        <form
            @submit.prevent="login"
            class="flex flex-col gap-1"
        >
            <label for="email">Email</label>
            <input
                class="border border-slate-400"
                name="email"
                id="email"
                type="email"
                autocomplete="email"
                v-model="email"
                required
            />

            <label for="password">Password</label>
            <input
                class="border border-slate-400"
                name="password"
                id="password"
                type="password"
                autocomplete="current-password"
                v-model="password"
                required
            />

            <button
                type="submit"
                class="bg-amber-400 mt-4"
            >
                Log in
            </button>
        </form>

        <p>
            Don't have an account yet?
            <NuxtLink
                class="text-amber-500"
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
definePageMeta({
    middleware: ['logged-out'],
});
import { signInWithEmailAndPassword } from '@firebase/auth';

const email = ref('');
const password = ref('');

const auth = useFirebaseAuth();
const route = useRoute();
const router = useRouter();

async function login() {
    if (!auth) return;

    await signInWithEmailAndPassword(auth, email.value, password.value);
    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}
</script>
