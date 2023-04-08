<template>
    <section>
        <h1 class="font-bold text-3xl p-6">Notes</h1>

        <Notes />
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'notes',
    middleware: ['logged-in'],
    layout: 'app',
    disableCenterLayout: true,
});
</script>
