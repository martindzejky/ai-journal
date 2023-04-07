<template>
    <EditorContent
        v-if="editor"
        :editor="editor"
    />
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { editorExtensions } from '~/utils/editor-extensions';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    readonly: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

const modelValue = toRef(props, 'modelValue');

const editor = useEditor({
    extensions: editorExtensions(),
    content: modelValue.value,
    editable: !props.readonly,
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML());
    },
});

watch(modelValue, (value) => {
    if (!editor.value) return;

    const isSame = editor.value.getHTML() === value;
    if (isSame) return;

    editor.value.commands.setContent(value, false);
});
</script>
