import { firestore, logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { AIMessageStatus, Message } from '../../types/message';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();
export const respondToMessage = firestore
    .document('chat/{chat}/messages/{message}')
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
                await processAiMessage(context.params.chat, context.params.message);
                break;
        }
    });

async function processUserMessage(chatId: string, messageId: string) {
    logger.info('Processing new user message', {
        chatId,
        messageId,
    });

    const db = getFirestore();
    await db.collection('chat').doc(chatId).collection('messages').add({
        timestamp: FieldValue.serverTimestamp(),
        author: 'ai',
        content: '',
        status: AIMessageStatus.Pending,
    });
}

async function processAiMessage(chatId: string, messageId: string) {
    logger.info('Processing new AI message', {
        chatId,
        messageId,
    });

    try {
        const db = getFirestore();
        const messageRef = db.collection('chat').doc(chatId).collection('messages').doc(messageId);

        await messageRef.update({
            status: AIMessageStatus.Processing,
        });

        await wait(3000);

        await messageRef.update({
            content: 'Hello',
        });

        await wait(2000);

        await messageRef.update({
            content: 'Hello world!',
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

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
