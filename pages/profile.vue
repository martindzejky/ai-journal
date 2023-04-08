<template>
    <section class="bg-white flex-col flex items-center py-6 px-10 rounded-2xl">
        <Icon
            name="material-symbols:face"
            class="mb-6 text-slate-300 text-[160px]"
        />

        <p class="mb-2">
            {{ user?.email }}
        </p>

        <button
            @click="logout"
            class="px-3 py-2 bg-amber-400"
        >
            Logout
        </button>
    </section>
</template>

<script setup lang="ts">
import { signOut } from '@firebase/auth';

definePageMeta({
    middleware: ['logged-in'],
    layout: 'app',
});

const auth = useFirebaseAuth();
const user = useCurrentUser();
const router = useRouter();

async function logout() {
    if (!auth) return;

    await signOut(auth);
    await router.push('/login');
}
</script>
