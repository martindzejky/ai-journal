import { Note } from '../../types/note';
import { generateText } from '@tiptap/core';
import { editorExtensions } from '../../utils/editor-extensions';

export function getNoteContentAsText(note: Note) {
    if (!note?.content) return '';

    const parsedContent = JSON.parse(note.content);
    return generateText(parsedContent, editorExtensions(), { blockSeparator: '\n' });
}
