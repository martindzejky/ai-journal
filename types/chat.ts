import { Timestamp } from '@firebase/firestore';

export interface Chat {
    id: string;
    owner: string;
    createdAt: Timestamp;
}
