<template>
    <section>
        <h1 class="text-center text-lg mb-4">Notes</h1>

        <NuxtLink
            class="block bg-amber-400 mb-4 text-center px-4"
            :href="'/note/' + newId"
        >
            New note
        </NuxtLink>

        <Notes />
    </section>
</template>

<script setup lang="ts">
import { collection, doc } from '@firebase/firestore';

definePageMeta({
    middleware: ['logged-in'],
    layout: 'app',
});

const db = useFirestore();
const newId = doc(collection(db, 'notes')).id;
</script>
