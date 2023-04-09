<template>
    <section class="bg-white max-w-screen-sm flex-col flex items-center py-6 px-10 rounded-2xl">
        <Icon
            name="material-symbols:face"
            class="mb-6 text-slate-300 text-[160px]"
        />

        <h1 class="font-bold text-xl">
            {{ user?.displayName }}
        </h1>

        <p class="mb-2 text-base text-slate-600">
            {{ user?.email }}
        </p>

        <Button @click="logout"> Logout </Button>
    </section>
</template>

<script setup lang="ts">
import { signOut } from '@firebase/auth';

definePageMeta({
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    name: 'profile',
    title: 'Profile',
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
