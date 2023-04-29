import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from '@firebase/firestore';
import { Chat } from '~/types/chat';
import { AIMessageStatus, Message } from '~/types/message';
import { last } from 'lodash-es';

export const useChat = defineStore('chat', () => {
    const app = useNuxtApp();
    const route = app.$router.currentRoute;
    const router = app.$router;

    const user = useCurrentUser();
    const db = useFirestore();

    const chatId = computed(() => {
        if (route.value.name !== 'chat') return undefined;
        if (typeof route.value.params.id !== 'string') return undefined;
        return route.value.params.id;
    });

    const chatSource = computed(() => {
        if (!chatId.value) return undefined;
        return doc(db, 'chats', chatId.value);
    });

    const { data: chat, pending, error } = useDocument<Chat>(chatSource);

    // reset error when chat changes
    watch(chatId, () => (error.value = undefined));

    const messagesCollection = computed(() => {
        if (!chatSource.value) return undefined;
        return collection(chatSource.value, 'messages');
    });

    const messagesQuery = computed(() => {
        if (!messagesCollection.value) return undefined;
        return query(messagesCollection.value, orderBy('timestamp'));
    });

    const messages = useCollection<Message>(messagesQuery);

    const messagesWithPlaceholder = computed(() => {
        // assuming that the AI always responds with a message, which
        // it should, display a placeholder on frontend message while waiting for
        // the backend to catch up

        if (!messages.value) return undefined;

        const lastMessage = last(messages.value);
        if (!lastMessage) return messages.value;

        if (lastMessage.author !== 'user') return messages.value;

        return [
            ...messages.value,
            {
                author: 'ai',
                timestamp: Timestamp.now(),
                content: '',
                status: AIMessageStatus.Pending,
            } as Message,
        ];
    });

    async function submitPrompt(prompt: string) {
        if (!prompt) return;
        if (!user.value) return;
        if (!messagesCollection.value) return;

        await addDoc(messagesCollection.value, {
            author: 'user',
            timestamp: serverTimestamp(),
            content: prompt,
        } as Omit<Message, 'id'>);
    }

    async function createChat() {
        if (!user.value) return;

        const chatRef = await addDoc(collection(db, 'chats'), {
            owner: user.value.uid,
            timestamp: serverTimestamp(),
        } as Omit<Chat, 'id'>);

        return chatRef.id;
    }

    async function deleteChat() {
        if (!chatSource.value) return;

        await deleteDoc(chatSource.value);
        await router.push('/chats');
    }

    return {
        chat: readonly(chat),
        pending: readonly(pending),
        error: readonly(error),
        messages: readonly(messagesWithPlaceholder),
        submitPrompt,
        createChat,
        deleteChat,
    };
});
