import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import Strike from '@tiptap/extension-strike';
import Typography from '@tiptap/extension-typography';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import { Extension, isNodeEmpty } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

interface EditorExtensionOptions {
    placeholder: string;
    readonlyPlaceholder: string;
}

// Inspired by: https://github.com/ProseMirror/prosemirror-markdown/blob/master/src/schema.ts
export function markdownEditorExtensions(options: Partial<EditorExtensionOptions> = {}) {
    return [
        Extension.create({
            addKeyboardShortcuts() {
                return {
                    // capture TAB key in editor, make sure it does not move focus
                    Tab: () => true,
                };
            },
        }),

        Document,

        Paragraph.configure({
            HTMLAttributes: {
                class: 'leading-snug py-0.5',
            },
        }),

        Blockquote.configure({
            HTMLAttributes: {
                class: 'border-l-4 border-stone-200 pl-2',
            },
        }),

        HorizontalRule.configure({
            HTMLAttributes: {
                class: 'my-4 text-stone-200',
            },
        }),

        Heading.configure({
            levels: [1, 2, 3],
        }),

        CodeBlock.configure({
            HTMLAttributes: {
                class: 'bg-slate-100 px-1.5 py-0.5 rounded-md font-sans',
            },
        }),

        OrderedList.configure({
            HTMLAttributes: {
                class: 'list-decimal ml-4',
            },
        }),

        BulletList.configure({
            HTMLAttributes: {
                class: 'list-disc ml-4',
            },
        }),

        ListItem.extend({
            content: 'paragraph list?',
        }),

        Text,
        HardBreak,

        Bold,
        Italic,
        Link,
        Strike,
        Typography,

        Code.configure({
            HTMLAttributes: {
                class: 'bg-slate-100 px-1.5 py-0.5 rounded-md font-sans',
            },
        }),

        Extension.create({
            name: 'placeholder',

            addProseMirrorPlugins() {
                return [
                    new Plugin({
                        props: {
                            decorations: ({ doc }) => {
                                if (!isNodeEmpty(doc)) return;

                                return DecorationSet.create(doc, [
                                    Decoration.widget(doc.content.size, () => {
                                        // create an element for the placeholder
                                        const element = document.createElement('span');

                                        element.className = [
                                            'empty-editor-placeholder pointer-events-none select-none',
                                            '!m-0 absolute top-0',
                                            'text-slate-300 cursor-text',
                                            '!truncate w-full max-h-full',
                                            'left-1/2 -translate-x-1/2',
                                        ].join(' ');

                                        element.innerHTML =
                                            (this.editor.isEditable
                                                ? options.placeholder
                                                : options.readonlyPlaceholder) ?? '';

                                        return element;
                                    }),
                                ]);
                            },
                        },
                    }),
                ];
            },
        }),
    ];
}
