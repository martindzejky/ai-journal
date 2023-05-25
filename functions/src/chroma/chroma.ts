import { Note } from '../../../types/note';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { getNoteContentAsText } from '../get-note-content';
import { IncludeEnum } from 'chromadb/dist/main/types';
import { takeWhile } from 'lodash';

export class Chroma {
    private client = new ChromaClient();
    private embedder = new OpenAIEmbeddingFunction({ openai_api_key: this.openAiApiKey });

    constructor(private openAiApiKey: string) {}

    async query(prompt: string, owner: string, results = 4): Promise<Array<string>> {
        const collection = await this.prepareCollection();

        const result = await collection.query({
            query_text: prompt,
            where: { owner },
            n_results: results,
            include: [IncludeEnum.Distances],
        });

        // @ts-expect-error incorrect types... :facepalm:
        const ids: string[] = result.ids?.[0] ?? [];
        const distances: number[] = result.distances?.[0] ?? [];

        // only return relevant results
        return takeWhile(ids, (id, index) => distances[index] < 0.4);
    }

    async createNote(note: Note) {
        const noteContentAsText = getNoteContentAsText(note).trim();
        if (!noteContentAsText) {
            // we have to return because chroma returns error 400 when an empty document is passed in
            return;
        }

        const collection = await this.prepareCollection();
        await collection.add({
            ids: note.id,
            metadatas: { owner: note.owner },
            documents: noteContentAsText,
        });
    }

    async updateNote(note: Note) {
        const collection = await this.prepareCollection();

        // first check if the note already exists in the collection and if not, create it
        const existingNote = await collection.get({ ids: note.id });

        if (existingNote.ids?.length > 0) {
            const noteContentAsText = getNoteContentAsText(note);
            if (!noteContentAsText) {
                // we have to return because chroma returns error 400 when an empty document is passed in
                return;
            }

            await collection.update({
                ids: note.id,
                metadatas: { owner: note.owner },
                documents: noteContentAsText,
            });
        } else {
            await this.createNote(note);
        }
    }

    async deleteNote(id: Note['id']) {
        const collection = await this.prepareCollection();
        await collection.delete({ ids: id });
    }

    private async prepareCollection() {
        return await this.client.getOrCreateCollection({
            name: 'notes',
            embeddingFunction: this.embedder,
        });
    }
}
