<template>
    <div class="h-screen grid">
        <nav class="nav">
            <Nav />
        </nav>

        <main
            class="main overflow-auto flex flex-col"
            :class="{
                'bg-stone-100': !$route.meta.disableDarkBackground,
                'items-center justify-center': !$route.meta.disableCenterLayout,
            }"
        >
            <slot />
        </main>
    </div>
</template>

<style scoped>
.grid {
    grid-template:
        'main' 1fr
        'nav' auto
        / 1fr;

    @media (min-width: 768px) {
        grid-template:
            'nav main' auto
            / auto 1fr;
    }
}

.main {
    grid-area: main;
}

.nav {
    grid-area: nav;
}
</style>
