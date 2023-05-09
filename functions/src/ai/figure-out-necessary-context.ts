import { parse } from 'date-fns';
import { ChatCompletionRequestMessage, OpenAIApi } from 'openai';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { AIMessageStatus, Message } from '../../../types/message';
import { logger } from 'firebase-functions';
import { Context, ContextInclude } from '../../../types/context';
import { Chroma } from '../chroma/chroma';
import contextBuildingSystem from '../prompts/context-building-system';
import contextBuilding from '../prompts/context-building';
import systemCurrentDate from '../prompts/system-current-date';

export async function figureOutNecessaryContext(
    uid: string,
    chatId: string,
    messageId: string,
    messageRef: DocumentReference,
    openAi: OpenAIApi,
    chroma: Chroma,
): Promise<Context> {
    const db = getFirestore();

    await messageRef.update({
        status: AIMessageStatus.GeneratingContext,
        context: null,
    });

    // Get the last user message from the chat to use as the prompt

    logger.log('Getting the last user message from the chat', {
        chatId,
        messageId,
    });

    const messages = await db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .where('author', '==', 'user')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    const lastUserMessage = messages.docs[0]?.data() as Omit<Message, 'id'> | undefined;
    if (!lastUserMessage) return {};

    // Step 1. Ask Chroma to get notes relevant to the prompt. This will be done in parallel to the next step.

    const chromaPromise = chroma.query(lastUserMessage.content, uid) as Promise<{
        ids: string[][];
        distances: number[][];
    }>;

    // Step 2. Ask the AI to figure out what context is necessary based on the prompt. Try to get
    // the context in one request so ask both for dates and what the user's intent is.

    const contextMessages: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content: contextBuildingSystem + systemCurrentDate(),
        },
        {
            role: 'user',
            content: contextBuilding + lastUserMessage.content,
        },
    ];

    // TODO: can this be streamed to show partial progress in UI?
    const contextResponsePromise = openAi.createChatCompletion({
        messages: contextMessages,
        model: 'gpt-3.5-turbo',
        temperature: 0.05,
        max_tokens: 100,
        user: uid,
    });

    // Step 3. Put both of those together to form the context.

    logger.log('Making context building requests to Chroma and OpenAI', {
        chatId,
        messageId,
    });

    const [chromaResponse, contextResponse] = await Promise.allSettled([
        chromaPromise,
        contextResponsePromise,
    ]);

    const contextResponseContent =
        contextResponse.status === 'fulfilled'
            ? contextResponse.value.data?.choices?.[0]?.message?.content
            : undefined;

    // Parse the response

    const responseContentLines = contextResponseContent?.split('\n') ?? [];
    const context: Context = {};

    logger.log('Parsing context building response', {
        chatId,
        messageId,
    });

    for (const line of responseContentLines) {
        try {
            if (line.startsWith('dates:')) {
                logger.log('Found a line starting with dates:', {
                    chatId,
                    messageId,
                    line,
                });

                let value = line.slice('dates:'.length).trim();

                if (value) {
                    const dates = value.split(' ');

                    const from = parse(dates[0], 'yyyy-MM-dd', new Date());
                    const to = parse(dates[1] ?? dates[0], 'yyyy-MM-dd', new Date());

                    context.dates = { from, to };

                    logger.log('Parsed dates successfully', {
                        chatId,
                        messageId,
                    });
                } else {
                    logger.log('No dates specified', {
                        chatId,
                        messageId,
                    });
                }
            } else if (line.startsWith('include:')) {
                logger.log('Found a line starting with include:', {
                    chatId,
                    messageId,
                    line,
                });

                let value = line.slice('include:'.length).trim();

                if (value) {
                    const include = value.split(' ');

                    context.include = include.filter((name): name is ContextInclude =>
                        Object.values(ContextInclude).includes(name as ContextInclude),
                    );

                    logger.log('Parsed include successfully', {
                        chatId,
                        messageId,
                        include: context.include,
                    });
                } else {
                    logger.log('No includes specified', {
                        chatId,
                        messageId,
                    });
                }
            }
        } catch (e) {
            // ignore lines that can't be parsed

            logger.log('Ignoring line that could not be parsed', {
                chatId,
                messageId,
                line,
            });
        }
    }

    // Add the Chroma notes to the context
    if (
        chromaResponse.status === 'fulfilled' &&
        chromaResponse.value &&
        'ids' in chromaResponse.value &&
        chromaResponse.value.ids.length > 0 &&
        chromaResponse.value.ids[0].length > 0
    ) {
        logger.log('Chroma db returned relevant notes', {
            chatId,
            messageId,
            ids: chromaResponse.value.ids[0],
        });

        context.relevant = chromaResponse.value.ids[0];
    }

    await messageRef.update({ context });

    return context;
}
