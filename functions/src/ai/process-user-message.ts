import { logger } from 'firebase-functions';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { AIMessageStatus } from '../../../types/message';

export async function processUserMessage(chatId: string, messageId: string) {
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
