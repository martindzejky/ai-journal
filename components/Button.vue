<template>
    <button
        class="bg-amber-400 py-2 px-3 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        :disabled="disabled || loading"
    >
        <Icon
            name="svg-spinners:270-ring"
            v-if="loading"
        />

        <slot />
    </button>
</template>

<script setup lang="ts">
defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
</script>
