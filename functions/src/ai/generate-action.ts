import { OpenAIApi } from 'openai';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';

async function generateAction(
    uid: string,
    chatId: string,
    messageId: string,
    openAi: OpenAIApi,
    messageRef: DocumentReference,
) {
    const db = getFirestore();
}
