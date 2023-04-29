import { collection, orderBy, query, where } from '@firebase/firestore';
import { Chat } from '~/types/chat';

export const useChats = defineStore('chats', () => {
    const user = useCurrentUser();
    const db = useFirestore();

    const chatsCollection = collection(db, 'chats');

    const chatsQuery = computed(() => {
        if (!user.value) return undefined;
        return query(
            chatsCollection,
            where('owner', '==', user.value.uid),
            orderBy('timestamp', 'desc'),
        );
    });

    const chats = useCollection<Chat>(chatsQuery);

    return {
        chats: readonly(chats),
    };
});
