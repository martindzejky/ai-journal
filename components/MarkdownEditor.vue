<template>
    <EditorContent
        v-if="editor"
        :editor="editor"
    />
</template>

<script setup lang="ts">
import { EditorContent, JSONContent, useEditor } from '@tiptap/vue-3';

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
        return defaultMarkdownParser.parse(modelValue.value) as JSONContent | null;
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
        emit('update:modelValue', defaultMarkdownSerializer.serialize(editor.state.doc));
    },
});

watch(modelValueParsed, (value) => {
    if (!editor.value) return;

    // compare with modelValue to compare strings instead of ProseMirror nodes
    const serializedEditorValue = defaultMarkdownSerializer.serialize(editor.value.state.doc);
    if (modelValue.value === serializedEditorValue) return;

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
