import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { Chat } from '../../../types/chat';
import { Configuration, OpenAIApi } from 'openai';
import { generateResponse } from './generate-response';
import { AIMessageStatus } from '../../../types/message';
import { figureOutNecessaryContext } from './figure-out-necessary-context';
import { buildContext } from './build-context';
import { Chroma } from '../chroma/chroma';

export async function processAiMessage(chatId: string, messageId: string, openAiApiKey: string) {
    logger.info('Processing new AI message', {
        chatId,
        messageId,
    });

    try {
        const db = getFirestore();
        const messageRef = db.collection('chats').doc(chatId).collection('messages').doc(messageId);

        // TODO: DO NOT COMMIT!
        await messageRef.update({
            status: AIMessageStatus.Success,
            content: 'TODO in **markdown**!',
        });
        return;

        // Get the chat data to get the owner's user ID

        const chat = await db.collection('chats').doc(chatId).get();
        const chatData = chat.data() as Omit<Chat, 'id'>;
        const uid = chatData.owner;

        // Create clients

        const openAiConfiguration = new Configuration({ apiKey: openAiApiKey });
        const openAi = new OpenAIApi(openAiConfiguration);
        const chroma = new Chroma(openAiApiKey);

        // Process the message

        const context = await figureOutNecessaryContext(
            uid,
            chatId,
            messageId,
            messageRef,
            openAi,
            chroma,
        );

        logger.info('Generated context for prompt', {
            chatId,
            messageId,
            context,
        });

        const messages = await buildContext(context, uid);

        await generateResponse(uid, chatId, messageId, openAi, messageRef, messages);

        await messageRef.update({
            status: AIMessageStatus.Success,
        });
    } catch (e) {
        logger.error('Error while generating an AI response', {
            chatId,
            messageId,
        });

        logger.error(e);

        const db = getFirestore();
        await db.collection('chats').doc(chatId).collection('messages').doc(messageId).update({
            status: AIMessageStatus.Error,
        });
    }
}
