import {
    onDocumentCreated,
    onDocumentDeleted,
    onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { Message } from '../../types/message';
import { defineSecret } from 'firebase-functions/params';
import { processUserMessage } from './ai/process-user-message';
import { processAiMessage } from './ai/process-ai-message';
import { Note } from '../../types/note';
import { Chroma } from './chroma/chroma';
import { logger } from 'firebase-functions';

initializeApp();

const openAiApiKey = defineSecret('OPEN_AI_API_KEY');

export const respondToMessage = onDocumentCreated(
    {
        secrets: [openAiApiKey],
        timeoutSeconds: 540,
        document: 'chats/{chat}/messages/{message}',
    },
    async (event) => {
        logger.info('New message has been posted in chat', {
            chatId: event.params.chat,
            messageId: event.params.message,
        });

        const messageData = event.data?.data() as undefined | Message;
        if (!messageData) throw new Error('Message data is undefined');

        switch (messageData.author) {
            case 'user':
                await processUserMessage(event.params.chat, event.params.message);
                break;

            case 'ai':
                await processAiMessage(
                    event.params.chat,
                    event.params.message,
                    openAiApiKey.value(),
                );
                break;
        }
    },
);

export const createNoteInChroma = onDocumentCreated(
    {
        secrets: [openAiApiKey],
        document: 'notes/{note}',
    },
    async (event) => {
        logger.info('Storing new note in Chroma', {
            noteId: event.params.note,
        });

        const noteData = event.data?.data() as undefined | Omit<Note, 'id'>;
        if (!noteData) throw new Error('Note data is undefined');

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.createNote({
            id: event.params.note,
            ...noteData,
        });
    },
);

export const updateNoteInChroma = onDocumentUpdated(
    {
        secrets: [openAiApiKey],
        document: 'notes/{note}',
    },
    async (event) => {
        logger.info('Updating note in Chroma', {
            noteId: event.params.note,
        });

        const noteData = event.data?.after.data() as undefined | Omit<Note, 'id'>;
        if (!noteData) throw new Error('Note data is undefined');

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.updateNote({
            id: event.params.note,
            ...noteData,
        });
    },
);

export const deleteNoteInChroma = onDocumentDeleted(
    {
        secrets: [openAiApiKey],
        document: 'notes/{note}',
    },
    async (event) => {
        logger.info('Deleting note in Chroma', {
            noteId: event.params.note,
        });

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.deleteNote(event.params.note);
    },
);
