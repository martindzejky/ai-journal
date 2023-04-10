import type { SecretParam } from 'firebase-functions/lib/params/types';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Chat } from '../../../types/chat';
import { Configuration, OpenAIApi } from 'openai';
import { generateResponse } from './generate-response';
import { AIMessageStatus } from '../../../types/message';

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

        await generateResponse(uid, chatId, messageId, openAi, messageRef);

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
