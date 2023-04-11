import { endOfDay, format, parse, startOfDay, subDays } from 'date-fns';
import { ChatCompletionRequestMessage, OpenAIApi } from 'openai';
import { DocumentReference, getFirestore } from 'firebase-admin/firestore';
import { AIMessageStatus, Message } from '../../../types/message';
import { logger } from 'firebase-functions';
import { Context, ContextType } from '../../../types/context';

export async function figureOutNecessaryContext(
    uid: string,
    chatId: string,
    messageId: string,
    openAi: OpenAIApi,
    messageRef: DocumentReference,
): Promise<Context | void> {
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
        .collection('chat')
        .doc(chatId)
        .collection('messages')
        .where('author', '==', 'user')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

    const lastUserMessage = messages.docs[0]?.data() as Message | undefined;
    if (!lastUserMessage) return;

    // Step 1. Ask the AI to figure out what context it will need based on the prompt.

    const contextMessages: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content:
                'You are a context-building text decoder. ' +
                `Current date: ${format(new Date(), 'yyyy-MM-dd')}, ${format(new Date(), 'EEEE')}.`,
        },
        {
            role: 'user',
            content: `Given a prompt from a user of a journaling app, figure out what context you need to access before you can answer. If the user mentions their journal, notes, or entries, output "journal". If they mention any date period, such as their last week, output "journal". If they mention that they need help with the app, or they ask how to use it, or they ask what the app is capable of, output "help". If they ask about app settings or where they can change their profile, output "help". If they ask about you, the AI assistant, in any way, such as what can you do, output "ai". Otherwise, output "nothing". Make sure to always wrap your output in "quotes". Short answer: "journal", "help", "ai", or "nothing". Here's the prompt:`,
        },
        {
            role: 'user',
            content: lastUserMessage.content,
        },
    ];

    // Generate the response for figuring out what context is necessary

    logger.log('Generating context response', {
        chatId,
        messageId,
    });

    const contextResponse = await openAi.createChatCompletion({
        messages: contextMessages,
        model: 'gpt-3.5-turbo',
        temperature: 0.05,
        max_tokens: 100,
        user: uid,
    });

    const contextResponseContent = contextResponse.data?.choices?.[0]?.message?.content;
    if (!contextResponseContent) return;

    // Parse the output, look for strings of "journal", "help", "ai", or "nothing". If they cannot
    // be found, assume "nothing" and return. Here I assume that the AI outputted some text that contains
    // one of the strings, but it could also be that the AI outputted multiple quoted strings. I'm assuming
    // that the last quoted string is the actual answer and before that might be some explanation.

    logger.log('Parsing context response', {
        chatId,
        messageId,
    });

    let foundJournal = false;
    const contextOutputs = [...contextResponseContent.matchAll(/"[^"]+"/g)].reverse();
    for (const contextOutput of contextOutputs) {
        const context = contextOutput[0].slice(1, -1);

        if (context === 'help') {
            const context: Context = { type: ContextType.Help };
            await messageRef.update({ context });
            return context;
        }
        if (context === 'ai') {
            const context: Context = { type: ContextType.AI };
            await messageRef.update({ context });
            return context;
        }
        if (context === 'journal') {
            foundJournal = true;
            break;
        }
    }

    // Only continue if "journal" was found

    if (!foundJournal) {
        // sometimes the model outputs just a single word as a result, without quotes, so check for that
        if (contextResponseContent === 'help') {
            const context: Context = { type: ContextType.Help };
            await messageRef.update({ context });
            return context;
        }
        if (contextResponseContent === 'ai') {
            const context: Context = { type: ContextType.AI };
            await messageRef.update({ context });
            return context;
        }

        if (contextResponseContent !== 'journal') {
            return; // nothing
        }
        // else, output is "journal", so continue
    }

    await messageRef.update({ context: { type: ContextType.Journal } });

    // Step 2. Ask the AI to figure out what date period is necessary based on the prompt.
    // For example, when the user asks to summarize their week, the AI needs to output the dates
    // of the week.

    const datePeriodMessages: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content:
                'You are a context-building date decoder. You output dates only. ' +
                `Current date: ${format(new Date(), 'yyyy-MM-dd')}, ${format(new Date(), 'EEEE')}.`,
        },
        {
            role: 'user',
            content: `Given a prompt from a user of a journaling app, figure out what dates of notes they are referring to in their prompt. Output either a single date such as "${format(
                subDays(new Date(), 1),
                'yyyy-MM-dd',
            )}", or a date range such as "${format(subDays(new Date(), 7), 'yyyy-MM-dd')} ${format(
                subDays(new Date(), 2),
                'yyyy-MM-dd',
            )}". Wrap your output in "quotes". For example, if the user mentions the last week, output the correct date range. If the user mentions last Thursday, output a single date of that day. Here's the prompt:`,
        },
        {
            role: 'user',
            content: lastUserMessage.content,
        },
    ];

    // Generate the response for figuring out the dates

    logger.log('Generating dates response', {
        chatId,
        messageId,
    });

    const datesResponse = await openAi.createChatCompletion({
        messages: datePeriodMessages,
        model: 'gpt-3.5-turbo',
        temperature: 0.05,
        max_tokens: 100,
        user: uid,
    });

    const datesResponseContent = datesResponse.data?.choices?.[0]?.message?.content;
    if (!datesResponseContent) return;

    // Once again, parse the output. Look for a quoted string that contains a date or date range.

    logger.log('Parsing dates response', {
        chatId,
        messageId,
    });

    const dateOutputs = [...datesResponseContent.matchAll(/"[^"]+"/g)].reverse();
    for (const dateOutput of dateOutputs) {
        const date = dateOutput[0].slice(1, -1);

        try {
            if (date.includes(' ')) {
                const [start, end] = date.split(' ');

                const startDate = parse(start, 'yyyy-MM-dd', new Date());
                const endDate = parse(end, 'yyyy-MM-dd', new Date());

                const context = {
                    type: ContextType.Journal,
                    from: startOfDay(startDate),
                    to: endOfDay(endDate),
                };

                await messageRef.update({ context });
                return context;
            } else {
                const startDate = parse(date, 'yyyy-MM-dd', new Date());

                const context = {
                    type: ContextType.Journal,
                    from: startOfDay(startDate),
                    to: endOfDay(startDate),
                };

                await messageRef.update({ context });
                return context;
            }
        } catch (error) {
            // Ignore and continue
        }
    }

    // If no date or date range was found, return nothing
}
