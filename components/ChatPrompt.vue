<template>
    <textarea
        name="prompt"
        id="prompt"
        class="resize-none disabled:bg-stone-50 disabled:cursor-not-allowed placeholder-slate-400 !border-stone-200 border-b-0 border-x-0 !outline-none !ring-0"
        rows="3"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
</template>

<script setup lang="ts">
const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

defineEmits(['update:modelValue']);

const placeholder = computed(() => {
    if (props.disabled) {
        return 'Wait for the AI to respond...';
    }

    return 'Ask the AI anything. If you want it to use content from your notes, tell it do so.';
});
</script>
