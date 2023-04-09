<template>
    <section class="max-w-full w-60">
        <h1 class="text-3xl font-bold text-center mb-6">Register</h1>

        <form
            @submit.prevent="register"
            class="flex flex-col gap-1"
        >
            <label for="email">Email</label>
            <input
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                v-model="email"
                required
            />

            <label for="password">Password</label>
            <input
                type="password"
                name="password"
                id="password"
                autocomplete="new-password"
                v-model="password"
                required
            />

            <button
                type="submit"
                class="bg-amber-400 py-2 px-3 mt-6"
            >
                Register
            </button>
        </form>

        <p class="text-slate-500 text-center mt-2 text-sm">
            Already have an account?
            <NuxtLink
                class="text-amber-400"
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
import { createUserWithEmailAndPassword, sendEmailVerification } from '@firebase/auth';

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

    const result = await createUserWithEmailAndPassword(auth, email.value, password.value);
    await sendEmailVerification(result.user);

    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}
</script>
