export enum ContextType {
    Journal = 'journal',
    Help = 'help',
    AI = 'ai',
}

interface JournalContext {
    type: ContextType.Journal;
    from?: Date | null;
    to?: Date | null;
}

interface HelpContext {
    type: ContextType.Help;
}

interface AIContext {
    type: ContextType.AI;
}

export type Context = JournalContext | HelpContext | AIContext;
