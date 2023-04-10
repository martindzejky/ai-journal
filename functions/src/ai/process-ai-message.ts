import type { SecretParam } from 'firebase-functions/lib/params/types';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Chat } from '../../../types/chat';
import { Configuration, OpenAIApi } from 'openai';
import { generateResponse } from './generate-response';
import { AIMessageStatus } from '../../../types/message';
import { generateAction } from './generate-action';
import { Action } from './actions';
import { getNotesFromDateRange, getNotesFromPastDays } from './get-notes';

export async function processAiMessage(
    chatId: string,
    messageId: string,
    openAiApiKey: SecretParam,
) {
    logger.info('Processing new AI message', {
        chatId,
        messageId,
    });

    try {
        const db = getFirestore();
        const messageRef = db.collection('chat').doc(chatId).collection('messages').doc(messageId);

        // Get the chat data to get the owner's user ID

        const chat = await db.collection('chat').doc(chatId).get();
        const chatData = chat.data() as Chat;
        const uid = chatData.owner;

        // Create a new OpenAI API client

        const openAiConfiguration = new Configuration({
            apiKey: openAiApiKey.value(),
        });

        const openAi = new OpenAIApi(openAiConfiguration);

        // Process the message

        const action = await generateAction(uid, chatId, messageId, openAi, messageRef);

        logger.info('Generated action', {
            chatId,
            messageId,
            action,
        });

        switch (action.action) {
            default:
                await generateResponse(uid, chatId, messageId, openAi, messageRef);
                break;

            case Action.GetNotes: {
                const notes = await getNotesFromDateRange(uid, action.startDate, action.endDate);
                await generateResponse(uid, chatId, messageId, openAi, messageRef, notes);
                break;
            }

            case Action.GetPastNotes: {
                const notes = await getNotesFromPastDays(uid, action.days);
                await generateResponse(uid, chatId, messageId, openAi, messageRef, notes);
                break;
            }
        }

        await messageRef.update({
            status: AIMessageStatus.Success,
        });
    } catch (e) {
        logger.error('Error while generating an AI response', {
            chatId,
            messageId,
            error: e,
        });

        const db = getFirestore();
        await db.collection('chat').doc(chatId).collection('messages').doc(messageId).update({
            status: AIMessageStatus.Error,
        });
    }
}
