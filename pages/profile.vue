<template>
    <Icon
        name="material-symbols:face"
        class="mb-4 text-slate-300 text-[120px]"
    />

    <p class="mb-2">
        {{ user?.email }}
    </p>

    <button
        @click="logout"
        class="px-4 bg-amber-400"
    >
        Logout
    </button>
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
