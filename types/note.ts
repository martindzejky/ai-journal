import { Timestamp } from '@firebase/firestore';

export interface Note {
    id: string;
    owner: string;

    content: string;

    timestamp: Timestamp;
    lastUpdate: Timestamp;
}
