<template>
    <section>
        <h1 class="text-center text-lg mb-4">Notes</h1>

        <NuxtLink
            href="/note/new"
            class="block bg-amber-400 mb-4 text-center px-4"
        >
            New note
        </NuxtLink>

        <Notes />
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['logged-in'],
    layout: 'app',
});
</script>
