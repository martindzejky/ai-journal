import { Context } from '../../../types/context';
import { ChatCompletionRequestMessage } from 'openai';
import { logger } from 'firebase-functions';
import { getNotesFromDateRange } from './get-notes';
import { getNoteContentAsText } from '../get-note-content';
import { format } from 'date-fns';

export async function buildContext(
    context: Context,
    uid: string,
): Promise<ChatCompletionRequestMessage[] | undefined> {
    switch (context.type) {
        case 'help':
            return buildHelpContext();

        case 'ai':
            return buildAiContext();

        case 'journal':
            if (context.from && context.to)
                return await buildJournalContext(uid, context.from, context.to);
    }
}

function buildHelpContext(): ChatCompletionRequestMessage[] {
    return [
        {
            role: 'system',
            content: `You are an AI guide in a journaling app, you assist the user in using the app and help them write their journal entries. In the main navigation of the app, the first button navigates to a list of user's notes. They can edit notes or write new ones. Second button navigates to the AI chat where the user currently is, writing with you. The last button takes them to their profile where they can find and change their name and email address. They can also sign out from the app on this page.`,
        },
        {
            role: 'system',
            content: `The app is in a technical preview right now. It is severely limited in functionality. It allows the users to write journal entries and chat with the AI, you. There are also basic settings on the profile page. The app cannot currently send notifications, emails, or any other reminders.`,
        },
    ];
}

function buildAiContext(): ChatCompletionRequestMessage[] {
    return [
        {
            role: 'system',
            content: `You are a helpful AI assistant in a journaling app. Your goal is to help the user write their journal and answer their questions using their journal entries. You can summarize their notes, offer insights, and so on. You can also help them navigate the journal app. You cannot send reminders, you can only offer advice and help.`,
        },
    ];
}

async function buildJournalContext(
    uid: string,
    from: Date,
    to: Date,
): Promise<ChatCompletionRequestMessage[]> {
    logger.info('Getting journal entries for context', { uid, from, to });

    const notes = await getNotesFromDateRange(uid, from, to);

    return [
        {
            role: 'system',
            content:
                "Use the content of these user's journal notes as additional context. Each note has an associated date, a title, and content.",
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
