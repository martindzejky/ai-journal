import { Note } from '../../../types/note';
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { getNoteContentAsText } from '../get-note-content';

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
        });

        return result.ids;
    }

    async createNote(note: Note) {
        const collection = await this.prepareCollection();
        await collection.add({
            ids: [note.id],
            metadatas: [{ owner: note.owner }],
            documents: [getNoteContentAsText(note)],
        });

        console.log('PEEK:');
        console.log(await collection.peek());
    }

    async updateNote(note: Note) {
        const collection = await this.prepareCollection();

        // first check if the note already exists in the collection and if not, create it
        const existingNote = await collection.get({ ids: [note.id] });
        console.log('existingNote', existingNote);

        await collection.update({
            ids: [note.id],
            metadatas: [{ owner: note.owner }],
            documents: [getNoteContentAsText(note)],
        });

        console.log('PEEK:');
        console.log(await collection.peek());
    }

    async deleteNote(id: Note['id']) {
        const collection = await this.prepareCollection();
        await collection.delete({ ids: [id] });

        console.log('PEEK:');
        console.log(await collection.peek());
    }

    private async prepareCollection() {
        return await this.client.getOrCreateCollection({
            name: 'notes',
            embeddingFunction: this.embedder,
        });
    }
}
