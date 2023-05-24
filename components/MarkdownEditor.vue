<template>
    <EditorContent
        v-if="editor"
        :editor="editor"
    />
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';

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

const { modelValue, readonly } = toRefs(props);

const editor = useEditor({
    extensions: markdownEditorExtensions({
        placeholder: props.placeholder,
        readonlyPlaceholder: props.readonlyPlaceholder,
    }),
    editable: !props.readonly,
    autofocus: props.readonly ? false : 'start',

    onUpdate: ({ editor }) => {
        emit('update:modelValue', defaultMarkdownSerializer.serialize(editor.state.doc));
    },
});

const modelValueParsed = computed(() => {
    if (!editor.value) return null;

    const parser = getDefaultMarkdownParserForSchema(editor.value.schema);
    return parser.parse(modelValue.value);
});

// Need to initialize the content this way, passing modelValueParsed directly to useEditor.content does not work :shrug:
// because the markdown parser produces a real ProseMirror Node instead of a JSONContent like TipTap expects.
const stopInitialWatch = watch([editor, modelValueParsed], ([editor, modelValueParsed]) => {
    if (!editor) return;
    if (!modelValueParsed) return;

    editor.commands.command(({ tr, state }) => {
        tr.replaceWith(0, state.doc.nodeSize - 2, modelValueParsed);
        return true;
    });

    stopInitialWatch();
});

watch(modelValueParsed, (value) => {
    if (!editor.value) return;
    if (!value) return;

    // compare with modelValue to compare strings instead of ProseMirror nodes
    const serializedEditorValue = defaultMarkdownSerializer.serialize(editor.value.state.doc);
    if (modelValue.value === serializedEditorValue) return;

    editor.value.commands.command(({ tr, state }) => {
        tr.replaceWith(0, state.doc.nodeSize - 2, value);
        return true;
    });
});

watch(readonly, (value) => {
    if (!editor.value) return;

    editor.value.setOptions({
        editable: !value,
        autofocus: value ? false : 'start',
    });
});
</script>
