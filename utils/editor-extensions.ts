import { Node } from '@tiptap/vue-3';

import Document from '@tiptap/extension-document';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

export function editorExtensions() {
    return [
        Document.extend({
            content: 'header main',
        }),

        Node.create({
            name: 'header',
            group: 'block',
            content: 'heading',
            renderHTML() {
                return ['header', 0];
            },
        }),

        Node.create({
            name: 'main',
            group: 'block',
            content: 'list+',
            renderHTML() {
                return ['main', 0];
            },
        }),

        Heading.configure({
            levels: [1],
            HTMLAttributes: {
                class: 'text-2xl font-bold',
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

        Paragraph,
        Text,
    ];
}
