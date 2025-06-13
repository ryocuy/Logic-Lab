
'use server';

/**
 * @fileOverview Penganalisis sirkuit bertenaga AI yang mengidentifikasi potensi masalah, menyarankan optimasi, dan dapat membuat desain sirkuit berdasarkan deskripsi.
 *
 * - analyzeCircuit - Menganalisis desain sirkuit yang diberikan (dari kanvas dan/atau teks) dan mengembalikan potensi masalah serta optimasi. Dapat juga menghasilkan desain sirkuit baru.
 * - AnalyzeCircuitInput - Tipe input untuk fungsi analyzeCircuit.
 * - AnalyzeCircuitOutput - Tipe output untuk fungsi analyzeCircuit.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCircuitInputSchema = z.object({
  circuitDescription: z
    .string()
    .optional()
    .describe(
      'Deskripsi tekstual opsional atau pertanyaan spesifik tentang sirkuit. Jika kanvas kosong, ini bisa menjadi permintaan untuk membuat sirkuit.'
    ),
  canvasCircuitData: z
    .string()
    .optional()
    .describe(
      'String JSON yang merepresentasikan komponen (node) dan koneksi (edge) dari sirkuit yang dirancang di kanvas. ' +
      'Ini mencakup tipe komponen (misalnya, "AND", "OR", "INPUT", "OUTPUT"), ID uniknya, nilai (untuk INPUT/OUTPUT), input yang terhubung, dan bagaimana mereka terhubung. ' +
      'Struktur: { "components": [{"id": "...", "type": "...", "x": ..., "y": ..., "value": ..., "inputs": {...}, "connections": [...]}, ...], ' +
      '"connections": [{"id": "...", "sourceId": "...", "sourcePort": "...", "targetId": "...", "targetPort": "..."}, ...] }'
    ),
});
export type AnalyzeCircuitInput = z.infer<typeof AnalyzeCircuitInputSchema>;

const AnalyzeCircuitOutputSchema = z.object({
  issues: z
    .array(z.string())
    .describe('Daftar potensi masalah yang teridentifikasi dalam sirkuit.'),
  optimizations: z
    .array(z.string())
    .describe('Saran optimasi untuk sirkuit.'),
  explanation: z
    .string()
    .describe('Penjelasan rinci tentang masalah dan optimasi, atau deskripsi sirkuit yang dihasilkan.'),
  generatedCircuitJson: z
    .string()
    .optional()
    .describe(
      'Opsional. Jika AI diminta untuk membuat sirkuit berdasarkan deskripsi (dan kanvas kosong), ' +
      'bidang ini akan berisi string JSON dari sirkuit yang dihasilkan. Formatnya sama dengan canvasCircuitData. ' +
      'Jika hanya menganalisis sirkuit yang ada, bidang ini mungkin kosong atau berisi versi sirkuit yang dioptimalkan.'
    ),
});
export type AnalyzeCircuitOutput = z.infer<typeof AnalyzeCircuitOutputSchema>;

export async function analyzeCircuit(
  input: AnalyzeCircuitInput
): Promise<AnalyzeCircuitOutput> {
  const isCanvasEffectivelyEmpty = (!input.canvasCircuitData || input.canvasCircuitData === '{"components":[],"connections":[]}');
  const isDescriptionEmpty = (!input.circuitDescription || input.circuitDescription.trim() === '');

  if (isCanvasEffectivelyEmpty && isDescriptionEmpty) {
    return {
      issues: [],
      optimizations: [],
      explanation: 'Tidak ada data sirkuit dari kanvas maupun deskripsi yang diberikan untuk dianalisis. Silakan buat sirkuit atau berikan deskripsi.',
      // generatedCircuitJson will be undefined
    };
  }
  return analyzeCircuitFlow(input);
}

const analyzeCircuitPrompt = ai.definePrompt({
  name: 'analyzeCircuitPrompt',
  input: {schema: AnalyzeCircuitInputSchema},
  output: {schema: AnalyzeCircuitOutputSchema},
  prompt: `Anda adalah penganalisis dan perancang sirkuit digital bertenaga AI. Tugas Anda adalah menganalisis atau merancang sirkuit digital.
Pastikan semua teks dalam output, termasuk penjelasan, isu, dan optimasi, menggunakan Bahasa Indonesia.

{{#if canvasCircuitData}}
Data Kanvas Sirkuit (JSON):
{{{canvasCircuitData}}}

String JSON ini merepresentasikan sirkuit yang dibangun di kanvas. Ini berisi dua kunci utama:
- "components": Array objek. Setiap objek adalah gerbang logika atau titik I/O.
- "connections": Array objek, mendefinisikan kabel.
{{else}}
Tidak ada data kanvas sirkuit yang disediakan.
{{/if}}

{{#if circuitDescription}}
Deskripsi Tekstual / Pertanyaan Spesifik:
{{{circuitDescription}}}
{{/if}}

PENTING: Dalam penjelasan, masalah, dan optimasi Anda, **JANGAN GUNAKAN ID komponen internal** seperti 'NOR-123456789'. Rujuk komponen berdasarkan **jenisnya** atau deskripsi fungsionalnya.

**Tugas Utama:**

1.  **Jika \`canvasCircuitData\` kosong atau tidak signifikan (misalnya, \\\`{"components":[],"connections":[]}\\\`) DAN \`circuitDescription\` berisi permintaan untuk MEMBUAT atau MERANCANG sirkuit tertentu** (misalnya, "buatkan saya full adder", "rancang sirkuit untuk lampu yang dikontrol dua saklar", "saya butuh gerbang AND dengan dua input dan satu output"):
    *   Tugas utama Anda adalah **MERANCANG SIRKUIT TERSEBUT**.
    *   Hasil rancangan sirkuit Anda HARUS dimasukkan ke dalam field \`generatedCircuitJson\` sebagai string JSON.
    *   **Format JSON untuk \`generatedCircuitJson\` HARUS SAMA PERSIS dengan format \`canvasCircuitData\`**:
        \\\`{ "components": [...], "connections": [...] }\\\`
    *   **Detail untuk \`components\` array:** Setiap objek komponen HARUS memiliki:
        *   \`id\`: string, unik (e.g., "TYPE-timestamp" seperti "AND-1701234567890" atau "INPUT-UNIQUE_STRING").
        *   \`type\`: string, (e.g., 'INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR').
        *   \`x\`: number (koordinat x, e.g., antara 50-700).
        *   \`y\`: number (koordinat y, e.g., antara 50-400).
        *   \`value\`: number (opsional, 0 atau 1, hanya untuk 'INPUT' dan 'OUTPUT'. Untuk 'INPUT', ini adalah nilai default).
        *   \`inputs\`: object (e.g., \`{"in1": "ID_KOMPONEN_SUMBER_A", "in2": "ID_KOMPONEN_SUMBER_B"}\` jika ada input terhubung, atau \`{}\` jika tidak).
        *   \`connections\`: array (e.g., \`[{"port":"out", "targetId":"ID_KOMPONEN_TARGET_X", "targetPort":"in1"}]\` untuk koneksi keluar dari port 'out' komponen ini, atau \`[]\` jika tidak ada).
    *   **Detail untuk \`connections\` array (level atas):** Setiap objek koneksi HARUS memiliki:
        *   \`id\`: string, unik (e.g., "conn-timestamp" atau "conn-UNIQUE_STRING").
        *   \`sourceId\`: string (ID komponen sumber, harus cocok dengan \`id\` salah satu komponen di array \`components\`).
        *   \`sourcePort\`: string (nama port output pada komponen sumber, e.g., "out").
        *   \`targetId\`: string (ID komponen target, harus cocok dengan \`id\` salah satu komponen di array \`components\`).
        *   \`targetPort\`: string (nama port input pada komponen target, e.g., "in1", "in2").
    *   Atur posisi komponen (x, y) secara logis. INPUT umumnya di sisi kiri, OUTPUT di sisi kanan. Gerbang di tengah. Hindari komponen yang tumpang tindih. Berikan jarak yang cukup antar komponen.
    *   \`explanation\` Anda kemudian harus menjelaskan sirkuit yang Anda rancang.
    *   \`issues\` dan \`optimizations\` harus merujuk pada sirkuit yang Anda rancang (idealnya, \`issues\` akan minimal jika rancangan Anda bagus).

2.  **Jika \`canvasCircuitData\` sudah berisi sirkuit yang signifikan:**
    *   Fokus pada **ANALISIS** sirkuit tersebut. Identifikasi potensi masalah dan sarankan optimasi.
    *   \`generatedCircuitJson\` bisa dibiarkan kosong, atau jika Anda menyarankan perubahan struktural yang signifikan (optimasi), Anda dapat mengisinya dengan JSON dari versi sirkuit yang dioptimalkan.
    *   \`explanation\`, \`issues\`, dan \`optimizations\` harus merujuk pada sirkuit yang ada di kanvas (atau versi optimalnya jika Anda menyediakannya di \`generatedCircuitJson\`).

{{#unless canvasCircuitData}}
{{#unless circuitDescription}}
Jika tidak ada data kanvas dan tidak ada deskripsi yang diberikan, nyatakan bahwa tidak ada yang perlu dianalisis/dirancang. Kembalikan array kosong untuk masalah dan optimasi, penjelasan yang sesuai seperti "Tidak ada informasi sirkuit yang diberikan untuk analisis atau perancangan." dalam Bahasa Indonesia, dan biarkan \`generatedCircuitJson\` kosong.
{{/unless}}
{{/unless}}

Kembalikan respons Anda dalam format JSON sesuai dengan skema output. Pastikan semua string dalam JSON menggunakan Bahasa Indonesia untuk penjelasan, isu, dan optimasi.
Contoh \`generatedCircuitJson\` untuk gerbang AND sederhana:
\\\`{
  "components": [
    {"id":"INPUT-1","type":"INPUT","x":100,"y":100,"value":0,"inputs":{},"connections":[]},
    {"id":"INPUT-2","type":"INPUT","x":100,"y":200,"value":0,"inputs":{},"connections":[]},
    {"id":"AND-1","type":"AND","x":250,"y":150,"inputs":{"in1":"INPUT-1","in2":"INPUT-2"},"connections":[{"port":"out","targetId":"OUTPUT-1","targetPort":"in"}]},
    {"id":"OUTPUT-1","type":"OUTPUT","x":400,"y":150,"value":0,"inputs":{"in":"AND-1"},"connections":[]}
  ],
  "connections": [
    {"id":"conn-1","sourceId":"INPUT-1","sourcePort":"out","targetId":"AND-1","targetPort":"in1"},
    {"id":"conn-2","sourceId":"INPUT-2","sourcePort":"out","targetId":"AND-1","targetPort":"in2"},
    {"id":"conn-3","sourceId":"AND-1","sourcePort":"out","targetId":"OUTPUT-1","targetPort":"in"}
  ]
}\\\`
(Catatan: Untuk implementasi nyata, \`INPUT-1.connections\` akan berisi koneksi ke AND-1, dst. Struktur di atas disederhanakan untuk prompt. Patuhi struktur data yang benar seperti yang dijelaskan di detail format \`components\` dan \`connections\`.)
Pastikan ID unik dan koordinat (x,y) masuk akal.
`,
});

const analyzeCircuitFlow = ai.defineFlow(
  {
    name: 'analyzeCircuitFlow',
    inputSchema: AnalyzeCircuitInputSchema,
    outputSchema: AnalyzeCircuitOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeCircuitPrompt(input);
    return output!;
  }
);
    

    
