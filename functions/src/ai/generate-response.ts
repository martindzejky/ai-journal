import { ChatCompletionRequestMessage, OpenAIApi } from 'openai';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { AIMessageStatus, Message } from '../../../types/message';
import { logger } from 'firebase-functions';
import { IncomingMessage } from 'http';
import chatAnswerSystem from '../prompts/chat-answer-system';
import systemCurrentDate from '../prompts/system-current-date';

/**
 * Based on the given context, ask the ChatGPT API for a response.
 * Stream the response directly to the message in Firestore.
 */
export async function generateResponse(
    uid: string,
    chatId: string,
    messageId: string,
    openAi: OpenAIApi,
    messageRef: DocumentReference,
    context?: ChatCompletionRequestMessage[],
) {
    const db = getFirestore();

    await messageRef.update({
        status: AIMessageStatus.GeneratingResponse,
    });

    // Get the last 10 messages from the chat to use as context

    logger.log('Getting the last 10 messages from the chat', {
        chatId,
        messageId,
    });

    const messages = await db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

    const chatCompletionMessages: ChatCompletionRequestMessage[] = messages.docs
        .reverse()
        .map((message) => {
            const messageData = message.data() as Message;

            const roleLookup: Record<Message['author'], ChatCompletionRequestMessage['role']> = {
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
        content: chatAnswerSystem + systemCurrentDate(),
    });

    // Append the context to the chat completion messages if provided

    if (context) {
        chatCompletionMessages.push(...context);
    }

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
            max_tokens: 1000,
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
            if (!payload.startsWith('data:')) continue;

            const data = payload.replace(/(\n)?^data:\s*/g, '');
            try {
                const delta = JSON.parse(data.trim());
                const content = delta.choices[0].delta?.content;

                if (content) {
                    fullContent += content;

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
    });

    // Wait until the stream ends

    await new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });
}
