import { getFirestore } from 'firebase-admin/firestore';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { Note } from '../../../types/note';

export async function getNotesFromDateRange(uid: string, from: Date, to: Date) {
    if (from > to) throw new Error('from date cannot be after to date');

    const db = getFirestore();

    const messages = await db
        .collection('notes')
        .where('owner', '==', uid)
        .where('createdAt', '>=', startOfDay(from))
        .where('createdAt', '<=', endOfDay(to))
        .orderBy('createdAt', 'asc')
        .get();

    return messages.docs.map((doc) => doc.data() as Note);
}

export async function getNotesFromPastDays(uid: string, days: number) {
    if (days < 1) throw new Error('days must be at least 1');

    const db = getFirestore();

    const messages = await db
        .collection('notes')
        .where('owner', '==', uid)
        // the days-1 is because we want to include the current day, so days=1 means today only
        .where('createdAt', '>=', startOfDay(subDays(new Date(), days - 1)))
        .orderBy('createdAt', 'asc')
        .get();

    return messages.docs.map((doc) => doc.data() as Note);
}
