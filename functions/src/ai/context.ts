interface JournalContext {
    type: 'journal';
    from: Date;
    to: Date;
}

interface HelpContext {
    type: 'help';
}

interface AIContext {
    type: 'ai';
}

export type Context = JournalContext | HelpContext | AIContext;
