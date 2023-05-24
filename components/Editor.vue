<template>
    <EditorContent
        v-if="editor"
        class="editor"
        :editor="editor"
    />
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { isEqual } from 'lodash-es';
import { PropType } from '@vue/runtime-core';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    variant: {
        type: String as PropType<'full' | 'minimal'>,
        default: 'full',
    },
});

const emit = defineEmits(['update:modelValue']);

const modelValue = toRef(props, 'modelValue');

const modelValueParsed = computed(() => {
    try {
        return JSON.parse(modelValue.value);
    } catch (e) {
        return modelValue.value;
    }
});

const editor = useEditor({
    extensions: editorExtensions({ variant: props.variant }),
    content: modelValueParsed.value,
    editable: !props.readonly,
    autofocus: props.readonly ? false : 'start',

    onUpdate: ({ editor }) => {
        emit('update:modelValue', JSON.stringify(editor.getJSON()));
    },

    editorProps: {
        attributes: {
            class: `${props.variant === 'minimal' ? 'text-slate-500 text-sm' : ''} outline-none`,
        },
    },
});

watch(modelValueParsed, (value) => {
    if (!editor.value) return;

    const isSame = isEqual(editor.value.getJSON(), value);
    if (isSame) return;

    editor.value.commands.setContent(value, false);
});
</script>

<style scoped>
.editor :deep(.ProseMirror) {
    outline: none !important;
}
</style>
