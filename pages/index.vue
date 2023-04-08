<template></template>

<script setup lang="ts">
definePageMeta({
    middleware: ['logged-in'],
    redirect: '/notes',
});
</script>
