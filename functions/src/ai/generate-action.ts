import { format, parse, subDays } from 'date-fns';
import { ChatCompletionRequestMessage, OpenAIApi } from 'openai';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { AIMessageStatus, Message } from '../../../types/message';
import { logger } from 'firebase-functions';
import { Action, actionDescriptions, ActionResponse, getActionDescriptionText } from './actions';

/**
 * Based on the chat messages, ask the ChatGPT API
 * to choose an action to take before generating the response.
 * Actions are defined in {@see Action}
 */
export async function generateAction(
    uid: string,
    chatId: string,
    messageId: string,
    openAi: OpenAIApi,
    messageRef: DocumentReference,
): Promise<ActionResponse> {
    const db = getFirestore();

    await messageRef.update({
        status: AIMessageStatus.GeneratingAction,
    });

    // Get the last user message from the chat to use as the context

    logger.log('Getting the last user message from the chat', {
        chatId,
        messageId,
    });

    const messages = await db
        .collection('chat')
        .doc(chatId)
        .collection('messages')
        .where('author', '==', 'user')
        .orderBy('timestamp', 'desc')
        .limit(1)
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

    // Prepend the system message to the context. The system message instructs the AI to generate a single action
    // response based on the input.

    chatCompletionMessages.unshift(
        {
            role: 'system',
            content:
                'Your role is to choose an action from a list of available actions. ' +
                `Current date: ${format(new Date(), 'yyyy-MM-dd')}, ${format(new Date(), 'EEEE')}.`,
        },
        {
            role: 'user',
            content: `Given a list of available commands, convert the provided text to the best command and provide its arguments, if any. If you cannot choose a suitable command, output "answer".

Available commands:
${actionDescriptions.map(getActionDescriptionText).join('\n')}

Example: Hello, how are you doing?
answer
Example: Based on my notes, what did I do today?
${Action.GetPastNotes} 1
Example: What happened in the past few days?
${Action.GetPastNotes} 3
Example: What did I do yesterday?
${Action.GetNotes} ${format(subDays(new Date(), 1), 'yyyy-MM-dd')} ${format(
                subDays(new Date(), 1),
                'yyyy-MM-dd',
            )}
Example: Summarize my journal from the last 7 days.
${Action.GetNotes} ${format(subDays(new Date(), 7), 'yyyy-MM-dd')} ${format(
                new Date(),
                'yyyy-MM-dd',
            )}
            `,
        },
    );

    // Generate the action response

    logger.log('Generating action response', {
        chatId,
        messageId,
    });

    const response = await openAi.createChatCompletion({
        messages: chatCompletionMessages,
        model: 'gpt-3.5-turbo',
        temperature: 0.1,
        max_tokens: 30,
        user: uid,
    });

    const responseContent = response.data?.choices?.[0]?.message?.content;
    const responseParts = responseContent?.split(' ') ?? [];

    if (responseParts.length === 0) {
        throw new Error('No action response generated');
    }

    const action = responseParts[0] as Action;
    const args = responseParts.slice(1);

    switch (action) {
        case Action.Answer:
            return {
                action,
            };

        case Action.GetPastNotes:
            return {
                action,
                days: parseInt(args[0], 10),
            };

        case Action.GetNotes:
            return {
                action,
                startDate: parse(args[0], 'yyyy-MM-dd', new Date()),
                endDate: parse(args[1], 'yyyy-MM-dd', new Date()),
            };

        default:
            logger.error(`Unknown action generated: ${action}`, {
                chatId,
                messageId,
                responseContent,
            });

            throw new Error(`Unknown action generated: ${action}`);
    }
}
