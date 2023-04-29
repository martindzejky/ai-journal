import { Extension, Node } from '@tiptap/vue-3';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

interface EditorExtensionOptions {
    variant: 'full' | 'minimal';
}

export function editorExtensions(options: Partial<EditorExtensionOptions> = {}) {
    return [
        Extension.create({
            addKeyboardShortcuts() {
                return {
                    // capture TAB key in editor, make sure it does not move focus
                    Tab: () => true,
                };
            },
        }),

        Document.extend({
            content: 'header main',
        }),

        Node.create({
            name: 'header',
            content: 'heading',
            renderHTML() {
                return [
                    'header',
                    {
                        class: options.variant === 'minimal' ? 'mb-2' : 'mb-6',
                    },
                    0,
                ];
            },
            addKeyboardShortcuts() {
                return {
                    Enter: () => {
                        // if the cursor is inside a header, move the cursor to the beginning of main

                        if (!this.editor.isActive('header')) return false;
                        if (!this.editor.state.selection.empty) return false;

                        const $pos = this.editor.state.doc.resolve(
                            this.editor.state.selection.anchor,
                        );

                        try {
                            return this.editor.commands.setTextSelection($pos.after(1) + 1);
                        } catch (e) {
                            return false;
                        }
                    },
                };
            },
        }),

        Node.create({
            name: 'main',
            content: 'block+',
            renderHTML() {
                return ['main', 0];
            },
        }),

        Heading.extend({
            // make sure that headings are not available in note content
            group: '',
        }).configure({
            levels: [1],
            HTMLAttributes: {
                class: `${
                    options.variant === 'minimal' ? 'text-lg' : 'text-4xl'
                } font-bold text-black`,
            },
        }),

        ListItem.extend({
            content: 'paragraph list?',
        }),

        BulletList.configure({
            HTMLAttributes: {
                class: 'list-disc ml-4',
            },
        }),

        OrderedList.configure({
            HTMLAttributes: {
                class: 'list-decimal ml-4',
            },
        }),

        Paragraph.configure({
            HTMLAttributes: {
                class: 'leading-snug py-1',
            },
        }),

        Text,

        Extension.create({
            name: 'placeholder',

            addProseMirrorPlugins() {
                return [
                    new Plugin({
                        props: {
                            decorations: ({ doc, selection }) => {
                                const decorations: Decoration[] = [];

                                doc.descendants((node, pos, parent) => {
                                    const isEmpty = !node.isLeaf && !node.childCount;

                                    if (!isEmpty) {
                                        // Don't display a placeholder for non-empty nodes, but do descend into their
                                        // child nodes. This is useful, for example, for empty paragraphs inside of lists.
                                        return true;
                                    }

                                    // determine the placeholder to show based on the type of the node and its parent
                                    let placeholder = '';

                                    switch (node.type.name) {
                                        default:
                                            // unknown node, don't display any placeholder
                                            return false;

                                        case 'heading':
                                            // note title
                                            placeholder = 'Untitled';
                                            break;

                                        case 'paragraph': {
                                            // Paragraphs are usually nested inside other nodes like lists,
                                            // so we have to check the parent node. Also check whether this is the first paragraph,
                                            // do not display the placeholder for other paragraphs in lists.

                                            switch (parent?.type.name) {
                                                default:
                                                    // unknown parent node, don't display any placeholder
                                                    return false;

                                                case 'main':
                                                    // This is a top-level paragraph, display the placeholder about / commands
                                                    // only when the cursor is on this line.

                                                    // do not display the hint if anything is selected
                                                    if (!selection.empty) return false;

                                                    // only display the placeholder when the cursor is inside
                                                    if (
                                                        selection.head < pos ||
                                                        selection.head > pos + node.nodeSize
                                                    )
                                                        return false;

                                                    // do not display the empty line placeholder if the editor is not focused
                                                    if (!this.editor.isFocused) return false;

                                                    placeholder =
                                                        'One day... type ' +
                                                        '<code class="bg-slate-100 px-1 text-center w-6 inline-block rounded-md font-sans">/</code>' +
                                                        ' for actions, ' +
                                                        '<code class="bg-slate-100 px-1 text-center w-6 inline-block rounded-md font-sans">@</code>' +
                                                        ' for mentions, ' +
                                                        '<code class="bg-slate-100 px-1 text-center w-6 inline-block rounded-md font-sans">#</code>' +
                                                        ' for tags, etc.';

                                                    break;

                                                case 'listItem':
                                                    if (parent.firstChild !== node) return false;
                                                    placeholder = 'List';
                                                    break;
                                            }

                                            break;
                                        }
                                    }

                                    decorations.push(
                                        Decoration.node(pos, pos + node.nodeSize, {
                                            class: 'relative',
                                        }),

                                        Decoration.widget(pos + node.nodeSize - 1, () => {
                                            // create an element for the placeholder
                                            const element = document.createElement('span');

                                            element.className = [
                                                'absolute empty-block-placeholder pointer-events-none select-none',
                                                'text-slate-300 cursor-text',
                                            ].join(' ');

                                            element.innerHTML = placeholder;

                                            return element;
                                        }),
                                    );

                                    // don't descend into the child nodes, we already displayed a placeholder for this node
                                    return false;
                                });

                                return DecorationSet.create(doc, decorations);
                            },
                        },
                    }),
                ];
            },
        }),
    ];
}
