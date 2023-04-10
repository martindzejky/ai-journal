export enum Action {
    Answer = 'answer',
    GetNotes = 'get-notes',
    GetPastNotes = 'get-past-notes',
}

export interface ActionDescription {
    action: Action;
    description: string;
    args?: string[];
}

export const actionDescriptions = [
    {
        action: Action.Answer,
        description: 'Answer the users question without any additional context',
    },
    {
        action: Action.GetNotes,
        description: 'Get the journal notes from days within a range of dates',
        args: ['start-date', 'end-date'],
    },
    {
        action: Action.GetPastNotes,
        description: 'Get the journal notes from the past few days',
        args: ['days'],
    },
];

export function getActionDescriptionText(action: ActionDescription) {
    const args = action.args ? ' ' + action.args.map((a) => `[${a}]`).join(' ') : '';
    return `- ${action.action}${args} (${action.description})`;
}

interface AnswerActionResponse {
    action: Action.Answer;
}

interface GetNotesActionResponse {
    action: Action.GetNotes;
    startDate: Date;
    endDate: Date;
}

interface GetPastNotesActionResponse {
    action: Action.GetPastNotes;
    days: number;
}

export type ActionResponse =
    | AnswerActionResponse
    | GetNotesActionResponse
    | GetPastNotesActionResponse;
