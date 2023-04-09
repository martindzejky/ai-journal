<template>
    <section class="bg-white max-w-screen-sm flex-col flex items-center py-6 px-10 rounded-2xl">
        <Icon
            name="material-symbols:mail"
            class="mb-6 text-slate-300 text-[120px]"
        />

        <p class="text-center mb-2">
            You need to verify your email address before you can start using the app. Open your
            inbox and click the link we sent you.
        </p>

        <p class="text-center text-slate-400">
            Did not receive an email?

            <button
                v-if="state === State.Idle"
                class="text-amber-400"
                @click="sendVerification"
            >
                Resend
            </button>

            <span v-else-if="state === State.Sending"> Sending... </span>
            <span v-else-if="state === State.Done"> Sent! Check your inbox. </span>
        </p>
    </section>
</template>

<script setup lang="ts">
import { sendEmailVerification } from '@firebase/auth';

definePageMeta({
    middleware: ['logged-in'],
    name: 'verify-email',
    title: 'You need to verify your email address',
});

enum State {
    Idle,
    Sending,
    Done,
}

const user = useCurrentUser();
const route = useRoute();
const router = useRouter();
const state = ref<State>(State.Idle);

watch(
    user,
    (user) => {
        if (!user) return;
        if (!user.emailVerified) return;

        // redirect to the page the user was trying to access before being redirected to the
        // verification page WHEN the user becomes verified
        router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/');
    },
    { immediate: true },
);

async function sendVerification() {
    if (state.value !== State.Idle) return;

    if (!user.value) return;

    state.value = State.Sending;
    await sendEmailVerification(user.value);
    state.value = State.Done;
}
</script>
