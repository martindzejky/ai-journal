<template>
    <div class="flex md:hidden">
        <NuxtLink
            href="/"
            class="grow text-3xl flex items-center justify-center py-2"
            exact-active-class="text-cyan-500"
        >
            <Icon name="material-symbols:menu" />
        </NuxtLink>

        <NuxtLink
            class="grow text-3xl flex items-center justify-center py-2"
            href="/profile"
            exact-active-class="text-cyan-500"
        >
            <Icon name="material-symbols:person" />
        </NuxtLink>
    </div>

    <div class="md:flex hidden justify-end items-center">
        <p v-if="user">
            {{ user.email }}
        </p>

        <NuxtLink
            class="text-3xl flex items-center justify-center p-2"
            href="/"
            exact-active-class="text-cyan-500"
        >
            <Icon name="material-symbols:home" />
        </NuxtLink>

        <NuxtLink
            class="text-3xl flex items-center justify-center p-2"
            href="/profile"
            exact-active-class="text-cyan-500"
        >
            <Icon name="material-symbols:person" />
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
const user = useCurrentUser();
</script>
