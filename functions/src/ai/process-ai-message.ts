import type { SecretParam } from 'firebase-functions/lib/params/types';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Chat } from '../../../types/chat';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { generateResponse } from './generate-response';
import { AIMessageStatus } from '../../../types/message';
import { figureOutNecessaryContext } from './figure-out-necessary-context';
import { buildContext } from './build-context';

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

        const context = await figureOutNecessaryContext(uid, chatId, messageId, openAi, messageRef);

        let messages: ChatCompletionRequestMessage[] | undefined;
        if (context) {
            logger.info('Generated context for prompt', {
                chatId,
                messageId,
                context,
            });

            messages = await buildContext(context, uid);
        }

        await generateResponse(uid, chatId, messageId, openAi, messageRef, messages);

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
