<template>
    <div class="flex md:hidden items-stretch border-t border-stone-200">
        <NuxtLink
            href="/notes"
            class="grow text-3xl flex items-center text-slate-400 justify-center py-2"
            active-class="!text-cyan-600"
            :class="{ '!text-cyan-600': $route.name === 'note' }"
        >
            <Icon name="material-symbols:menu" />
        </NuxtLink>

        <NuxtLink
            href="/ai"
            class="grow text-3xl flex items-center text-slate-400 justify-center py-2"
            active-class="!text-cyan-600"
        >
            <Icon name="material-symbols:chat" />
        </NuxtLink>

        <NuxtLink
            href="/profile"
            class="grow text-3xl flex items-center text-slate-400 justify-center py-2"
            active-class="!text-cyan-600"
        >
            <Icon name="material-symbols:person" />
        </NuxtLink>
    </div>

    <div class="md:flex hidden h-full">
        <div class="border-r border-stone-200 h-full flex flex-col py-2 items-center">
            <NuxtLink
                href="/notes"
                class="text-3xl flex items-center justify-center py-2 px-3 text-slate-400"
                active-class="!text-cyan-600"
                :class="{ '!text-cyan-600': $route.name === 'note' }"
            >
                <Icon name="material-symbols:menu" />
            </NuxtLink>

            <NuxtLink
                href="/ai"
                class="text-3xl flex items-center justify-center py-2 px-3 text-slate-400"
                active-class="!text-cyan-600"
            >
                <Icon name="material-symbols:chat" />
            </NuxtLink>

            <NuxtLink
                href="/profile"
                class="text-3xl flex items-center justify-center py-2 px-3 text-slate-400"
                active-class="!text-cyan-600"
            >
                <Icon name="material-symbols:person" />
            </NuxtLink>
        </div>

        <div class="border-r w-60 border-stone-200 h-full flex flex-col py-2">
            <h1 class="font-bold text-3xl p-6">Notes</h1>

            <Notes />
        </div>
    </div>
</template>
<script setup lang="ts"></script>
