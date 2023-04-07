<template>
    <div class="h-screen grid">
        <nav class="nav">
            <Nav />
        </nav>

        <main class="main">
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
            'nav' auto
            'main' 1fr
            / 1fr;
    }
}

.main {
    @apply overflow-auto flex flex-col items-center justify-center;

    grid-area: main;
}

.nav {
    @apply border-t border-slate-200 md:border-t-0 md:border-b;

    grid-area: nav;
}
</style>
