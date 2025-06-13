"use client";
import React, { useState } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookText, Wrench, Code, ClipboardList } from 'lucide-react';

type DocSectionId = 'user-guide' | 'technical' | 'api' | 'requirements';

interface DocSection {
  id: DocSectionId;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const documentationContent: DocSection[] = [
  {
    id: 'user-guide',
    title: 'User Guide',
    icon: BookText,
    content: (
      <>
        <h3 className="text-3xl font-semibold text-primary mb-4">User Guide</h3>
        <p className="mb-3 text-lg">Selamat datang di LogicLab! Aplikasi ini dirancang untuk membantu Anda mempelajari dan bereksperimen dengan rangkaian digital.</p>
        
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Logic Gates</h4>
        <p className="mb-3 text-lg">Bagian ini menampilkan berbagai jenis gerbang logika dengan tabel kebenarannya (truth table). Anda dapat berinteraksi dengan simulator untuk menguji gerbang.</p>
        
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Circuit Builder</h4>
        <p className="mb-3 text-lg">Buat rangkaian digital kustom Anda sendiri. Tambah komponen, hubungkan, dan jalankan simulasi. Gunakan AI Analyzer untuk mendapatkan masukan.</p>
        
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Number Converter</h4>
        <p className="mb-3 text-lg">Konversi antar sistem bilangan (Binary, Decimal, Hexadecimal, Octal) dan pelajari konsep lanjutan seperti Two's Complement.</p>

        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Learning Center</h4>
        <p className="mb-3 text-lg">Pelajari konsep rangkaian digital melalui tutorial interaktif, mulai dari dasar hingga aplikasi dunia nyata.</p>
      </>
    )
  },
  {
    id: 'technical',
    title: 'Technical Documentation',
    icon: Wrench,
    content: (
      <>
        <h3 className="text-3xl font-semibold text-primary mb-4">Technical Documentation</h3>
        <p className="mb-3 text-lg">Dokumentasi ini menjelaskan arsitektur dan implementasi teknis dari LogicLab.</p>
        
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Arsitektur Aplikasi</h4>
        <p className="mb-3 text-lg">Dibangun menggunakan Next.js (React) dengan TypeScript. Styling menggunakan Tailwind CSS dan ShadCN UI. AI fitur menggunakan Genkit.</p>
        
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Struktur Kode (Contoh)</h4>
        <pre className="bg-muted p-4 rounded-md text-base overflow-x-auto font-mono">
{`src/
├── app/                  # Next.js App Router (Pages)
│   ├── (section)/page.tsx
├── components/           # Reusable UI Components
│   ├── ui/               # ShadCN components
│   └── SiteHeader.tsx
├── lib/                  # Utility functions
├── ai/                   # Genkit flows
└── public/               # Static assets`}
        </pre>
      </>
    )
  },
  {
    id: 'api',
    title: 'API Reference (Contoh)',
    icon: Code,
    content: (
      <>
        <h3 className="text-3xl font-semibold text-primary mb-4">API Reference (Contoh)</h3>
        <p className="mb-3 text-lg">Contoh fungsi internal yang digunakan dalam aplikasi:</p>
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Logic Gate Evaluation</h4>
        <pre className="bg-muted p-4 rounded-md text-base overflow-x-auto font-mono">
{`// Fungsi evaluasi gerbang (disederhanakan)
function evaluateGate(type: GateType, inputs: number[]): number {
  switch(type) {
    case 'AND': return (inputs[0] && inputs[1]) ? 1 : 0;
    // ... implementasi gerbang lainnya
    default: return 0;
  }
}`}
        </pre>
        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Number Conversion</h4>
        <pre className="bg-muted p-4 rounded-md text-base overflow-x-auto font-mono">
{`// Fungsi konversi (disederhanakan)
function binToDec(binary: string): string {
  if (!/^[01]+$/.test(binary)) throw new Error('Invalid binary');
  return parseInt(binary, 2).toString(10);
}`}
        </pre>
      </>
    )
  },
  {
    id: 'requirements',
    title: 'Project Requirements',
    icon: ClipboardList,
    content: (
      <>
        <h3 className="text-3xl font-semibold text-primary mb-4">Project Requirements</h3>
        <p className="mb-3 text-lg">Berikut adalah persyaratan dan kriteria penilaian untuk project aplikasi rangkaian digital ini:</p>

        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Persyaratan Minimum</h4>
        <ul className="list-disc list-inside ml-4 mb-3 space-y-1 text-lg">
            <li>Implementasi minimal 4 gerbang logika dasar (AND, OR, NOT, XOR)</li>
            <li>Konverter sistem bilangan minimal untuk Biner, Desimal, dan Heksadesimal</li>
            <li>Tampilan responsif yang berfungsi di desktop dan mobile</li>
            <li>Dokumentasi penggunaan dasar</li>
        </ul>

        <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Fitur Tambahan (Bonus)</h4>
        <ul className="list-disc list-inside ml-4 mb-3 space-y-1 text-lg">
            <li>Implementasi gerbang logika lanjutan (NAND, NOR, XNOR)</li>
            <li>Circuit builder dengan kemampuan drag-and-drop dan simulasi</li>
            <li>AI Circuit Analyzer</li>
            <li>Konversi untuk two's complement dan floating point</li>
            <li>Pembelajaran interaktif dan contoh aplikasi dunia nyata</li>
            <li>Sistem manajemen tim dengan pembagian tugas</li>
            <li>Dokumentasi teknis yang lengkap</li>
        </ul>
         <h4 className="text-2xl font-semibold text-accent mt-6 mb-2">Tugas Utama dari Dosen</h4>
        <blockquote className="mt-2 border-l-2 border-primary pl-4 italic text-muted-foreground text-lg">
            "Mulai hari ini saya kasih tugas uas ya, tolong dikerjakan secara kelompok maksimal 5 orang. Membuat aplikasi rangkaian digital dasar dan konversi sederhana. Boleh website atau desktop."
        </blockquote>
      </>
    )
  }
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState<DocSectionId>('user-guide');

  const currentDoc = documentationContent.find(doc => doc.id === activeSection);

  return (
    <PageShell
      title="Documentation"
      subtitle="Panduan penggunaan, dokumentasi teknis, dan informasi relevan lainnya untuk LogicLab."
    >
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl">Navigasi Dokumen</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-auto md:h-[calc(100vh-200px)]">
                <nav className="flex flex-col space-y-1">
                  {documentationContent.map(doc => {
                    const Icon = doc.icon;
                    return (
                    <Button
                      key={doc.id}
                      variant={activeSection === doc.id ? 'default' : 'ghost'}
                      className={cn(
                        "w-full justify-start text-left h-auto py-3 px-3 text-base",
                        activeSection === doc.id && "shadow-md"
                      )}
                      onClick={() => setActiveSection(doc.id)}
                    >
                      <Icon className="mr-2 h-5 w-5 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </Button>
                  )})}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
          <Card className="shadow-xl">
            <CardContent className="p-6 md:p-8 min-h-[calc(100vh-200px)]"> 
              {currentDoc ? currentDoc.content : <p className="text-lg">Pilih bagian dokumentasi dari navigasi.</p>}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageShell>
  );
}
