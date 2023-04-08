import { Timestamp } from '@firebase/firestore';

export enum AIMessageStatus {
    Pending = 'pending',
    Processing = 'processing',
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
    content: string;
    status: AIMessageStatus;
}

export type Message = UserMessage | AIMessage;
