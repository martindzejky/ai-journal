import { IncomingMessage } from 'http';
import { logger, runWith } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { AIMessageStatus, Message } from '../../types/message';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { Chat } from '../../types/chat';

initializeApp();

const openAiApiKey = defineSecret('OPEN_AI_API_KEY');

export const respondToMessage = runWith({ secrets: [openAiApiKey] })
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
        // Start processing the AI message by marking it as processing

        const db = getFirestore();
        const messageRef = db.collection('chat').doc(chatId).collection('messages').doc(messageId);

        await messageRef.update({
            status: AIMessageStatus.Processing,
        });

        // Get the chat data to get the owner's user ID

        const chat = await db.collection('chat').doc(chatId).get();
        const chatData = chat.data() as Chat;
        const uid = chatData.owner;

        // Create a new OpenAI API client

        const openAiConfiguration = new Configuration({
            apiKey: openAiApiKey.value(),
        });

        const openAi = new OpenAIApi(openAiConfiguration);

        // Get the last 10 messages from the chat to use as context

        logger.log('Getting the last 10 messages from the chat', {
            chatId,
            messageId,
        });

        const messages = await db
            .collection('chat')
            .doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const chatCompletionMessages: ChatCompletionRequestMessage[] = messages.docs
            .reverse()
            .map((message) => {
                const messageData = message.data() as Message;

                const roleLookup: Record<Message['author'], ChatCompletionRequestMessage['role']> =
                    {
                        user: 'user',
                        ai: 'assistant',
                    };

                return {
                    role: roleLookup[messageData.author] ?? 'system',
                    content: messageData.content,
                };
            });

        // Prepend the system message to the context

        chatCompletionMessages.unshift({
            role: 'system',
            content:
                'You are a helpful AI assistant in a journaling app. ' +
                'Your role is to help the user answer questions using the content of their journal. ' +
                'You can access their journal entries and use them as context. ' +
                `Current date: ${new Date().toString()}.`,
        });

        // Create the completion request and stream the response. Most of the code below is
        // based on this discussion:
        // https://github.com/openai/openai-node/issues/18

        logger.log('Creating the completion request and streaming the response', {
            chatId,
            messageId,
        });

        const response = await openAi.createChatCompletion(
            {
                messages: chatCompletionMessages,
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                max_tokens: 200,
                stream: true,
                user: uid,
            },
            { responseType: 'stream' },
        );

        const stream = response.data as unknown as IncomingMessage;

        // Read the response from the stream

        let fullContent = '';

        stream.on('data', (chunk: Buffer) => {
            const payloads = chunk.toString().split('\n\n');
            for (const payload of payloads) {
                if (payload.includes('[DONE]')) return;
                if (payload.startsWith('data:')) {
                    const data = payload.replace(/(\n)?^data:\s*/g, '');
                    try {
                        const delta = JSON.parse(data.trim());
                        const content = delta.choices[0].delta?.content;

                        if (content) {
                            fullContent += content;
                            logger.log('Received response from the stream', {
                                chatId,
                                messageId,
                            });

                            // Update the message with the response from the stream
                            messageRef.update({
                                content: fullContent,
                            });
                        }
                    } catch (error) {
                        logger.error('Error while parsing AI response', {
                            chatId,
                            messageId,
                            error,
                        });
                    }
                }
            }
        });

        // Wait until the stream ends

        await new Promise<void>((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });

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
