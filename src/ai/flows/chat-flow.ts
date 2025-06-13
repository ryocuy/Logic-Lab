
'use server';
/**
 * @fileOverview Alur Genkit untuk fungsionalitas chat AI.
 *
 * - chatWithAi - Fungsi untuk mengirim pesan ke AI dan mendapatkan balasan.
 * - ChatInput - Tipe input untuk fungsi chatWithAi.
 * - ChatOutput - Tipe output untuk fungsi chatWithAi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('Pesan dari pengguna untuk AI.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('Balasan yang dihasilkan oleh AI.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAi(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'logicLabChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `Anda adalah asisten AI yang ramah dan sangat membantu untuk LogicLab, sebuah aplikasi edukasi interaktif untuk mempelajari rangkaian digital.
Tugas Anda adalah menjawab pertanyaan pengguna dengan jelas dan informatif. Fokus pada topik-topik berikut:
- Konsep-konsep dasar sirkuit digital (misalnya, apa itu gerbang AND, perbedaan binary dan decimal, cara kerja flip-flop).
- Cara menggunakan berbagai fitur di aplikasi LogicLab (misalnya, "Bagaimana cara menambahkan komponen di Circuit Builder?", "Untuk apa halaman Number Converter?").
- Penjelasan singkat tentang topik terkait teknik digital yang mungkin relevan dengan pengguna LogicLab.

Instruksi Penting:
- SELALU balas dalam Bahasa Indonesia.
- Jaga agar jawaban tetap ringkas, padat, dan mudah dipahami oleh pemula.
- Jika pertanyaan di luar lingkup LogicLab atau sirkuit digital, berikan respons yang sopan bahwa Anda lebih fokus pada topik tersebut.
- Hindari memberikan informasi yang terlalu teknis atau kompleks kecuali diminta secara spesifik.

Pesan Pengguna:
{{{message}}}
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);
