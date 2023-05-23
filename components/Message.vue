<template>
    <div
        class="rounded-lg bg-white lg:max-w-[80%] px-4 py-2"
        :class="{
            'self-start': message.author === 'ai',
            'self-end': message.author === 'user',
            '!bg-rose-400 !text-white':
                message.author === 'ai' && message.status === AIMessageStatus.Error,
        }"
    >
        <div
            class="mb-1 text-xs italic text-slate-400"
            :class="{
                '!text-white': message.author === 'ai' && message.status === AIMessageStatus.Error,
            }"
        >
            <span
                v-if="message.author === 'user'"
                class="flex items-center gap-0.5"
            >
                <Icon name="material-symbols:person" />
                You
            </span>

            <span
                v-else
                class="flex items-center gap-0.5"
            >
                <Icon name="material-symbols:robot" />
                AI
            </span>
        </div>

        <template v-if="message.author === 'ai'">
            <p
                class="text-xs mb-1 italic text-slate-400 font-medium"
                v-if="![AIMessageStatus.Success, AIMessageStatus.Error].includes(message.status)"
            >
                <span v-if="message.status === AIMessageStatus.Pending"> Thinking... </span>

                <span v-else-if="message.status === AIMessageStatus.GeneratingContext">
                    <span v-if="message.context"> Gathering required context... </span>
                    <span v-else> Figuring out what to do... </span>
                </span>

                <span v-else-if="message.status === AIMessageStatus.GeneratingResponse">
                    Answering...
                </span>

                <span v-else-if="message.status === AIMessageStatus.Cancelled"> Cancelled </span>
            </p>

            <p
                class="text-xs mb-1 italic flex flex-wrap items-center gap-1 text-slate-400 font-medium"
                v-if="message.context"
            >
                <span> Using context: </span>

                <span
                    v-for="include in message.context.include"
                    :key="include"
                    class="px-1 py-0.5 rounded bg-slate-100"
                >
                    {{ contextIncludeLabel[include] }}
                </span>

                <MessageNoteContextLink
                    v-for="relevant in message.context.relevant"
                    :key="relevant"
                    :note-id="relevant"
                    class="px-1 py-0.5 rounded bg-slate-100"
                />

                <span v-if="message.context.dates">
                    notes from
                    <span class="px-1 py-0.5 rounded bg-slate-100">
                        {{ formatRelativeDay(message.context.dates.from.toDate()) }}
                    </span>
                    to
                    <span class="px-1 py-0.5 rounded bg-slate-100">
                        {{ formatRelativeDay(message.context.dates.to.toDate()) }}
                    </span>
                </span>
            </p>
        </template>

        <p v-if="message.author === 'ai' && message.status === AIMessageStatus.Error">
            Something went wrong 😢!
        </p>

        <MarkdownEditor
            v-else
            readonly
            :model-value="message.content"
        />
    </div>
</template>

<script setup lang="ts">
import { PropType } from '@vue/runtime-core';
import { AIMessageStatus, Message } from '~/types/message';
import { formatRelative } from 'date-fns';
import { ContextInclude } from '~/types/context';
import MessageNoteContextLink from '~/components/MessageNoteContextLink.vue';

defineProps({
    message: {
        type: Object as PropType<Message>,
        required: true,
    },
});

const contextIncludeLabel: Record<ContextInclude, string> = {
    [ContextInclude.Documentation]: 'app documentation',
    [ContextInclude.Ai]: 'AI assistant',
};

function formatRelativeDay(date: Date) {
    const formatted = formatRelative(date, new Date());
    const split = formatted.split(' at ');
    return split[0];
}
</script>
