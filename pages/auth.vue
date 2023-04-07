<template>
    <p>Auth</p>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['logged-out'],
});
</script>
