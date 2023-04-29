<template>
    <section class="md:hidden grow">
        <h1 class="font-bold text-3xl p-6">Chats</h1>
        <Chats />
    </section>

    <section class="hidden md:flex grow flex-col items-center justify-center">
        <Icon
            name="material-symbols:wb-sunny"
            class="text-slate-300 text-[160px]"
        />
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'chats',
    title: 'Your conversations with AI',
    middleware: ['logged-in', 'verified-email'],
    layout: 'app',
    disableCenterLayout: true,
});
</script>
