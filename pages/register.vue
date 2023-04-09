<template>
    <section class="max-w-full w-80">
        <h1 class="text-3xl font-bold text-center mb-6">Register</h1>

        <form
            @submit.prevent="register"
            class="flex flex-col gap-1"
        >
            <label for="name">Name</label>
            <input
                type="text"
                name="name"
                id="name"
                autocomplete="name"
                v-model="name"
                required
                :placeholder="placeholderName"
            />

            <label for="email">Email</label>
            <input
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                v-model="email"
                required
                :placeholder="placeholderEmail"
            />

            <label for="password">Password</label>
            <input
                type="password"
                name="password"
                id="password"
                autocomplete="new-password"
                v-model="password"
                required
                placeholder="********"
            />

            <Button
                type="submit"
                class="mt-6"
                :loading="state === State.Loading"
            >
                Register
            </Button>
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
import { updateCurrentUserProfile } from 'vuefire';

definePageMeta({
    middleware: ['logged-out'],
});

enum State {
    Idle,
    Loading,
}

const state = ref(State.Idle);

const name = ref('');
const email = ref('');
const password = ref('');

const auth = useFirebaseAuth();
const route = useRoute();
const router = useRouter();

const placeholderName = getPlaceholderName();
const placeholderEmail = getPlaceholderEmail(placeholderName);

async function register() {
    if (!auth) return;
    if (!name.value || !email.value || !password.value) return;
    if (state.value !== State.Idle) return;

    state.value = State.Loading;

    const result = await createUserWithEmailAndPassword(auth, email.value, password.value);
    await updateCurrentUserProfile({ displayName: name.value });
    await sendEmailVerification(result.user);

    await router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
}
</script>
