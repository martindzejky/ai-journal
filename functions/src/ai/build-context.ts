import { Context, ContextInclude } from '../../../types/context';
import { ChatCompletionRequestMessage } from 'openai';
import { logger } from 'firebase-functions';
import { getNotesFromDateRange, getNotesWithIds } from './get-notes';
import { getNoteContentAsText } from '../get-note-content';
import { format } from 'date-fns';
import journalNotesSystem from '../prompts/journal-notes-system';
import helpContextSystem from '../prompts/help-context-system';
import aiContextSystem from '../prompts/ai-context-system';

export async function buildContext(
    context: Context,
    uid: string,
): Promise<ChatCompletionRequestMessage[] | undefined> {
    const promises: Array<Promise<Array<ChatCompletionRequestMessage>>> = [];

    if (context.relevant) {
        promises.push(buildJournalRelevantContext(uid, context.relevant));
    }

    if (context.dates) {
        promises.push(buildJournalDatesContext(uid, context.dates.from, context.dates.to));
    }

    if (context.include) {
        if (context.include.includes(ContextInclude.Documentation)) {
            promises.push(
                Promise.resolve([
                    {
                        role: 'system',
                        content: helpContextSystem,
                    },
                ]),
            );
        }

        if (context.include.includes(ContextInclude.Ai)) {
            promises.push(
                Promise.resolve([
                    {
                        role: 'system',
                        content: aiContextSystem,
                    },
                ]),
            );
        }
    }

    const results = await Promise.allSettled(promises);

    const successfulResults = results
        .filter(
            (result): result is PromiseFulfilledResult<Array<ChatCompletionRequestMessage>> =>
                result.status === 'fulfilled',
        )
        .map((result) => result.value);

    const messages = successfulResults.flat();
    if (messages.length === 0) return undefined;
    return messages;
}

async function buildJournalRelevantContext(
    uid: string,
    ids: string[],
): Promise<ChatCompletionRequestMessage[]> {
    logger.info('Getting relevant journal entries for context', { uid, ids });

    const notes = await getNotesWithIds(uid, ids);
    if (notes.length === 0) return [];

    return [
        {
            role: 'system',
            content: journalNotesSystem,
        },
        ...notes.map((note) => {
            const content = getNoteContentAsText(note);
            const date = format(note.timestamp.toDate(), 'yyyy-MM-dd');

            return {
                role: 'system' as const,
                content: `${date}\n${content}`,
            };
        }),
    ];
}

async function buildJournalDatesContext(
    uid: string,
    from: Date,
    to: Date,
): Promise<ChatCompletionRequestMessage[]> {
    logger.info('Getting journal entries for context from date range', { uid, from, to });

    const notes = await getNotesFromDateRange(uid, from, to);
    if (notes.length === 0) return [];

    return [
        {
            role: 'system',
            content: journalNotesSystem,
        },
        ...notes.map((note) => {
            const content = getNoteContentAsText(note);
            const date = format(note.timestamp.toDate(), 'yyyy-MM-dd');

            return {
                role: 'system' as const,
                content: `${date}\n${content}`,
            };
        }),
    ];
}
