<template>
    <section>
        <h1 class="text-lg mb-4">Register</h1>

        <form
            @submit.prevent="register"
            class="flex flex-col gap-1"
        >
            <label for="email">Email</label>
            <input
                class="border border-slate-400"
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                v-model="email"
                required
            />

            <label for="password">Password</label>
            <input
                class="border border-slate-400"
                type="password"
                name="password"
                id="password"
                autocomplete="new-password"
                v-model="password"
                required
            />

            <button
                type="submit"
                class="bg-amber-400 mt-4"
            >
                Register
            </button>
        </form>

        <p>
            Already have an account?
            <NuxtLink
                class="text-amber-500"
                :href="
                    '/login' + ($route.query?.redirect ? `?redirect=${$route.query.redirect}` : '')
                "
            >
                Log in
            </NuxtLink>
        </p>
    </section>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword } from '@firebase/auth';

definePageMeta({
    middleware: ['logged-out'],
});

const email = ref('');
const password = ref('');

const auth = useFirebaseAuth();
const route = useRoute();
const router = useRouter();

async function register() {
    if (!auth) return;

    await createUserWithEmailAndPassword(auth, email.value, password.value);
    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}
</script>
