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
            href="/chats"
            class="grow text-3xl flex items-center text-slate-400 justify-center py-2"
            active-class="!text-cyan-600"
            :class="{ '!text-cyan-600': $route.name === 'chat' }"
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
                href="/chats"
                class="text-3xl flex items-center justify-center py-2 px-3 text-slate-400"
                active-class="!text-cyan-600"
                :class="{ '!text-cyan-600': $route.name === 'chat' }"
            >
                <Icon name="material-symbols:chat" />
            </NuxtLink>

            <div class="grow"></div>

            <NuxtLink
                href="/profile"
                class="text-3xl flex items-center justify-center py-2 px-3 text-slate-400"
                active-class="!text-cyan-600"
            >
                <Icon name="material-symbols:person" />
            </NuxtLink>
        </div>

        <div
            v-if="$route.name === 'notes' || $route.name === 'note'"
            class="border-r w-60 border-stone-200 overflow-y-auto overflow-x-hidden h-full flex flex-col py-2"
        >
            <h1 class="font-bold text-3xl p-6">Notes</h1>

            <Notes />
        </div>

        <div
            v-else-if="$route.name === 'chats' || $route.name === 'chat'"
            class="border-r w-60 border-stone-200 h-full flex flex-col py-2"
        >
            <h1 class="font-bold text-3xl p-6">Chats</h1>

            <Chats />
        </div>
    </div>
</template>
<script setup lang="ts"></script>
