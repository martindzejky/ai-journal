import { logger, runWith } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { Message } from '../../types/message';
import { defineSecret } from 'firebase-functions/params';
import { processUserMessage } from './ai/process-user-message';
import { processAiMessage } from './ai/process-ai-message';
import { Note } from '../../types/note';
import { Chroma } from './chroma/chroma';

initializeApp();

const openAiApiKey = defineSecret('OPEN_AI_API_KEY');

export const respondToMessage = runWith({
    secrets: [openAiApiKey],
    timeoutSeconds: 540,
})
    .firestore.document('chat/{chat}/messages/{message}')
    .onCreate(async (snapshot, context) => {
        logger.info('New message has been posted in chat', {
            chatId: context.params.chat,
            messageId: context.params.message,
        });

        const messageData = snapshot.data() as Message;

        switch (messageData.author) {
            case 'user':
                await processUserMessage(context.params.chat, context.params.message);
                break;

            case 'ai':
                await processAiMessage(
                    context.params.chat,
                    context.params.message,
                    openAiApiKey.value(),
                );
                break;
        }
    });

export const createNoteInChroma = runWith({
    secrets: [openAiApiKey],
})
    .firestore.document('notes/{note}')
    .onCreate(async (snapshot, context) => {
        logger.info('Storing new note in Chroma', {
            noteId: context.params.note,
        });

        const noteData = snapshot.data() as Omit<Note, 'id'>;

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.createNote({
            id: context.params.note,
            ...noteData,
        });
    });

export const updateNoteInChroma = runWith({
    secrets: [openAiApiKey],
})
    .firestore.document('notes/{note}')
    .onUpdate(async (change, context) => {
        logger.info('Updating note in Chroma', {
            noteId: context.params.note,
        });

        const noteData = change.after.data() as Omit<Note, 'id'>;

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.updateNote({
            id: context.params.note,
            ...noteData,
        });
    });

export const deleteNoteInChroma = runWith({
    secrets: [openAiApiKey],
})
    .firestore.document('notes/{note}')
    .onDelete(async (snapshot, context) => {
        logger.info('Deleting note in Chroma', {
            noteId: context.params.note,
        });

        const chroma = new Chroma(openAiApiKey.value());
        await chroma.deleteNote(context.params.note);
    });
