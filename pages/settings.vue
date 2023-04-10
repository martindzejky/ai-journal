<template>
    <section class="bg-white max-w-screen-sm flex-col flex items-center py-6 px-10 rounded-2xl">
        <form
            @submit.prevent="save"
            class="flex flex-col gap-1"
        >
            <label for="name">Name</label>
            <Input
                type="text"
                name="name"
                id="name"
                autocomplete="name"
                v-model="name"
                required
                :placeholder="placeholderName"
            />

            <label for="email">Email</label>
            <Input
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                required
                :value="email"
                :placeholder="placeholderEmail"
                disabled
                class="opacity-75"
            />

            <Button
                :loading="state === State.Saving"
                type="submit"
                class="mt-6"
            >
                <span v-if="state === State.Saved"> Saved </span>
                <span v-else> Save </span>
            </Button>
        </form>
    </section>
</template>

<script setup lang="ts">
import { updateCurrentUserProfile } from 'vuefire';

definePageMeta({
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    name: 'settings',
    title: 'Your settings',
});

enum State {
    Idle,
    Saving,
    Saved,
}

const state = ref(State.Idle);

const placeholderName = getPlaceholderName();
const placeholderEmail = getPlaceholderEmail(placeholderName);

const name = ref('');
const email = ref('');

const user = useCurrentUser();
const router = useRouter();

watchOnce(
    user,
    (user) => {
        if (!user) return;
        name.value = user.displayName ?? '';
        email.value = user.email ?? '';
    },
    { immediate: true },
);

async function save() {
    if (state.value !== State.Idle) return;

    state.value = State.Saving;

    await updateCurrentUserProfile({
        displayName: name.value,
    });

    state.value = State.Saved;
}
</script>
