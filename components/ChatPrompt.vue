<template>
    <textarea
        name="prompt"
        id="prompt"
        class="resize-none disabled:bg-stone-50 disabled:cursor-not-allowed placeholder-slate-400 !border-stone-200 border-b-0 border-x-0 !outline-none !ring-0"
        :placeholder="placeholder"
        :rows="rows"
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

const rows = computed(() => {
    const lines = props.modelValue.split(/\r\n|\r|\n/);
    return lines.length;
});

const placeholder = computed(() => {
    if (props.disabled) {
        return 'Wait for the AI to respond';
    }

    return 'Ask the AI anything';
});
</script>
