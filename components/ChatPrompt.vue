<template>
    <MarkdownEditor
        placeholder="Ask the AI anything. If you want it to use content from your notes, tell it do so."
        readonly-placeholder="Wait for the AI to respond..."
        class="resize-none bg-white px-4 py-2 border-t-stone-200 border-t !outline-none !ring-0"
        :class="{ 'bg-stone-50 cursor-not-allowed': disabled }"
        :readonly="disabled"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
    />
</template>

<script setup lang="ts">
defineProps({
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
</script>
