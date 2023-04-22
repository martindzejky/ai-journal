import { getFirestore } from 'firebase-admin/firestore';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { Note } from '../../../types/note';

export async function getNotesFromDateRange(uid: string, from: Date, to: Date) {
    if (from > to) throw new Error('from date cannot be after to date');

    const db = getFirestore();

    const messages = await db
        .collection('notes')
        .where('owner', '==', uid)
        .where('timestamp', '>=', startOfDay(from))
        .where('timestamp', '<=', endOfDay(to))
        .orderBy('timestamp', 'asc')
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
        .where('timestamp', '>=', startOfDay(subDays(new Date(), days - 1)))
        .orderBy('timestamp', 'asc')
        .get();

    return messages.docs.map((doc) => doc.data() as Note);
}

export async function getNotesWithIds(uid: string, ids: string[]) {
    if (ids.length === 0) return [];

    const db = getFirestore();

    const messages = await db
        .collection('notes')
        .where('owner', '==', uid)
        .where('id', 'in', ids)
        .orderBy('timestamp', 'asc')
        .get();

    return messages.docs.map((doc) => doc.data() as Note);
}
