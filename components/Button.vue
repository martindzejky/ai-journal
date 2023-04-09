<template>
    <Component
        class="bg-amber-400 py-2 px-3 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        :disabled="disabled || loading"
        :is="is"
    >
        <Icon
            name="svg-spinners:270-ring"
            v-if="loading"
        />

        <slot />
    </Component>
</template>

<script setup lang="ts">
import type { Component, PropType } from '@vue/runtime-core';

defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    is: {
        type: [String, Object] as PropType<string | Component>,
        default: 'button',
    },
});
</script>
