<template>
    <EditorContent
        v-if="editor"
        :editor="editor"
    />
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { isEqual } from 'lodash-es';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: undefined,
    },
    readonlyPlaceholder: {
        type: String,
        default: undefined,
    },
});

const emit = defineEmits(['update:modelValue']);

const modelValue = toRef(props, 'modelValue');
const readonly = toRef(props, 'readonly');

const modelValueParsed = computed(() => {
    try {
        return JSON.parse(modelValue.value);
    } catch (e) {
        return modelValue.value;
    }
});

const editor = useEditor({
    extensions: markdownEditorExtensions({
        placeholder: props.placeholder,
        readonlyPlaceholder: props.readonlyPlaceholder,
    }),
    content: modelValueParsed.value,
    editable: !props.readonly,
    autofocus: props.readonly ? false : 'start',

    onUpdate: ({ editor }) => {
        emit('update:modelValue', JSON.stringify(editor.getJSON()));
    },
});

watch(modelValueParsed, (value) => {
    if (!editor.value) return;

    const isSame = isEqual(editor.value.getJSON(), value);
    if (isSame) return;

    editor.value.commands.setContent(value, false);
});

watch(readonly, (value) => {
    if (!editor.value) return;

    editor.value.setOptions({
        editable: !value,
        autofocus: value ? false : 'start',
    });
});
</script>
