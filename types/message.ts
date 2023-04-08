import { Timestamp } from '@firebase/firestore';

export interface Message {
    id: string;
    author: 'user' | 'ai';
    timestamp: Timestamp;
    content: string;
}
