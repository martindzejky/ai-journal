import { logger, runWith } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { Message } from '../../types/message';
import { defineSecret } from 'firebase-functions/params';
import { processUserMessage } from './ai/process-user-message';
import { processAiMessage } from './ai/process-ai-message';

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
                await processAiMessage(context.params.chat, context.params.message, openAiApiKey);
                break;
        }
    });
