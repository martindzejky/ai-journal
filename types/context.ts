export enum ContextInclude {
    Documentation = 'documentation',
    Ai = 'ai',
}

/** Context that is passed to OpenAI as an addition to the prompt from the user. */
export interface Context {
    /** Relevant note IDs according to Chroma. */
    relevant?: string[];

    /**
     * If the user asks about specific dates, include notes from those dates in the context.
     * Both dates are inclusive.
     */
    dates?: {
        from: Date;
        to: Date;
    };

    /** Can contain more context if the AI determines that it needs it, like the app documentation. */
    include?: ContextInclude[];
}
