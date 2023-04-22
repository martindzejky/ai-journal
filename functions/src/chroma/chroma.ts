import { Note } from '../../../types/note';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { getNoteContentAsText } from '../get-note-content';
import { QueryEmbeddingIncludeEnum } from 'chromadb/dist/main/generated';

export class Chroma {
    private client = new ChromaClient();
    private embedder = new OpenAIEmbeddingFunction(this.openAiApiKey);

    constructor(private openAiApiKey: string) {}

    async query(prompt: string, owner: string, results = 4) {
        const collection = await this.prepareCollection();
        return await collection.query(undefined, results, { owner }, prompt, undefined, [
            QueryEmbeddingIncludeEnum.Distances,
        ]);
    }

    async createNote(note: Note) {
        const collection = await this.prepareCollection();
        await collection.add(
            note.id,
            undefined,
            {
                owner: note.owner,
            },
            getNoteContentAsText(note),
        );
    }

    async updateNote(note: Note) {
        const collection = await this.prepareCollection();
        await collection.update(
            note.id,
            undefined,
            {
                owner: note.owner,
            },
            getNoteContentAsText(note),
        );
    }

    async deleteNote(id: Note['id']) {
        const collection = await this.prepareCollection();
        await collection.delete([id]);
    }

    private async prepareCollection() {
        return await this.client.getOrCreateCollection('notes', {}, this.embedder);
    }
}
