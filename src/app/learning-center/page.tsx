"use client";
import React from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, BookOpen, Atom, Globe, Puzzle } from 'lucide-react';

const learningContent = {
  basics: {
    title: "Dasar Rangkaian Digital",
    icon: Atom,
    lessons: [
      { 
        title: "Pengantar Rangkaian Digital",
        content: "Rangkaian digital adalah sistem elektronik yang menggunakan sinyal diskrit (biasanya 0 dan 1) untuk merepresentasikan data. Keunggulannya meliputi noise immunity, penyimpanan data mudah, fleksibilitas, dan kemampuan diprogram ulang. Dasar dari semua rangkaian digital adalah gerbang logika.",
        example: { title: "Contoh: Saklar Lampu AND", text: "Lampu yang dikontrol dua saklar seri hanya menyala jika kedua saklar ON. Ini implementasi fisik gerbang AND." }
      },
      {
        title: "Boolean Algebra",
        content: "Dasar matematika rangkaian digital. Operasi dasar: AND (∧), OR (∨), NOT (¬). Aturan penting: A ∧ 0 = 0, A ∨ 1 = 1, ¬(¬A) = A, dll.",
      }
    ]
  },
  numberSystems: {
    title: "Sistem Bilangan",
    icon: Puzzle,
    lessons: [
      {
        title: "Sistem Bilangan dalam Komputasi",
        content: "Komputer menggunakan: Binary (basis 2), Octal (basis 8), Decimal (basis 10), Hexadecimal (basis 16). Masing-masing memiliki peran penting dalam representasi data.",
      },
      {
        title: "Representasi Khusus",
        content: "Two's Complement: Metode representasi bilangan negatif biner. Invert semua bit lalu tambah 1. IEEE 754 Floating Point: Standar representasi bilangan desimal biner (sign, exponent, mantissa).",
      }
    ]
  },
  complexCircuits: {
    title: "Rangkaian Kompleks",
    icon: Cpu,
    lessons: [
      {
        title: "Kombinasional vs Sequential",
        content: "Rangkaian Kombinasional: Output hanya tergantung input saat ini (cth: Multiplexer, Adder). Rangkaian Sequential: Output tergantung input saat ini DAN state sebelumnya/memori (cth: Flip-flops, Counters).",
        example: { title: "Contoh: SR Latch", text: "Rangkaian sequential sederhana penyimpan 1 bit data. Input S (Set), R (Reset). Output Q, Q̅." }
      },
      {
        title: "Komponen Rangkaian Kompleks",
        content: "Adder (Half/Full), Multiplexer (MUX), Decoder, Flip-Flops (D, JK, T), Register, Counter."
      }
    ]
  },
  realWorld: {
    title: "Aplikasi Dunia Nyata",
    icon: Globe,
    lessons: [
      {
        title: "Aplikasi Rangkaian Digital",
        content: "Komputer (CPU, RAM), Smartphone, Smart Home, Otomotif (ECU), Video Game, Keamanan (Enkripsi).",
      },
      {
        title: "Case Study: Kalkulator Sederhana",
        content: "Input -> Decoding -> Arithmetic Unit (Adders) -> Storage (Registers) -> Control Unit -> Display.",
        example: { title: "Contoh: 5 + 3", text: "1. 5 (101) + 3 (011)\n2. Penambahan biner -> 1000\n3. Hasil 1000 (biner) = 8 (desimal) ditampilkan."}
      }
    ]
  }
};

type LessonKey = keyof typeof learningContent;

export default function LearningCenterPage() {
  return (
    <PageShell
      title="Learning Center"
      subtitle="Pelajari dasar-dasar rangkaian digital, sistem bilangan, rangkaian kompleks, dan aplikasinya di dunia nyata."
    >
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          {(Object.keys(learningContent) as LessonKey[]).map(key => {
            const Icon = learningContent[key].icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2 text-base py-2.5">
                <Icon className="h-5 w-5" /> {learningContent[key].title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(learningContent) as LessonKey[]).map(key => (
          <TabsContent key={key} value={key} className="space-y-6">
            {learningContent[key].lessons.map((lesson, index) => (
              <Card key={index} className="shadow-lg hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-4">
                  <p className="whitespace-pre-line leading-relaxed text-lg">{lesson.content}</p>
                  {lesson.example && (
                    <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-md mt-4">
                      <h4 className="font-semibold text-accent mb-2 text-xl">{lesson.example.title}</h4>
                      <p className="text-base whitespace-pre-line">{lesson.example.text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  );
}
