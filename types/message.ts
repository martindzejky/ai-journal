import { Timestamp } from '@firebase/firestore';
import { Context } from './context';

export enum AIMessageStatus {
    Pending = 'pending',
    GeneratingContext = 'generating-context',
    GeneratingResponse = 'generating-response',
    Success = 'success',
    Error = 'error',
    Cancelled = 'cancelled',
}

interface UserMessage {
    id: string;
    author: 'user';
    timestamp: Timestamp;
    content: string;
}

interface AIMessage {
    id: string;
    author: 'ai';
    timestamp: Timestamp;

    status: AIMessageStatus;
    context?: Context | null;

    content: string;
}

export type Message = UserMessage | AIMessage;
