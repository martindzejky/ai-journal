import {
    addDoc,
    collection,
    doc,
    orderBy,
    query,
    serverTimestamp,
    where,
} from '@firebase/firestore';
import { Chat } from '~/types/chat';
import { Message } from '~/types/message';

export const useChat = defineStore('chat', () => {
    const user = useCurrentUser();
    const db = useFirestore();

    const chatCollection = collection(db, 'chat');

    const chatQuery = computed(() => {
        if (!user.value) return undefined;
        return query(
            chatCollection,
            where('owner', '==', user.value.uid),
            orderBy('createdAt', 'desc'),
        );
    });

    const chats = useCollection<Chat>(chatQuery);

    const chat = computed(() => {
        if (!chats.value) return undefined;
        return chats.value[0];
    });

    const chatSource = computed(() => {
        if (!chat.value) return undefined;
        return doc(db, 'chat', chat.value.id);
    });

    const messagesCollection = computed(() => {
        if (!chatSource.value) return undefined;
        return collection(chatSource.value, 'messages');
    });

    const messagesQuery = computed(() => {
        if (!messagesCollection.value) return undefined;
        return query(messagesCollection.value, orderBy('timestamp'));
    });

    const messages = useCollection<Message>(messagesQuery);

    async function submitPrompt(prompt: string) {
        if (!prompt) return;
        if (!user.value) return;

        let existingOrNewChatSource = chatSource.value;
        if (!existingOrNewChatSource) {
            existingOrNewChatSource = await addDoc(chatCollection, {
                owner: user.value.uid,
                createdAt: serverTimestamp(),
            } as Omit<Chat, 'id'>);
        }

        const messagesCollection = collection(existingOrNewChatSource, 'messages');

        await addDoc(messagesCollection, {
            author: 'user',
            timestamp: serverTimestamp(),
            content: prompt,
        } as Omit<Message, 'id'>);
    }

    return {
        chat: readonly(chat),
        messages: readonly(messages),
        submitPrompt,
    };
});
