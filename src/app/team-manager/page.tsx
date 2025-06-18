
"use client";
import React, { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  nim: string;
  task: string;
  progress: number;
}

const defaultTeamMembers: TeamMember[] = [
  { id: '1', name: 'SATRIO AIL SYAMSUDIN', nim: '112410044', task: 'Circuit Builder Development', progress: 100 },
  { id: '2', name: 'ACH RIZKY NUR FEBRIAN', nim: '112410004', task: 'Converter & Calculator', progress: 100 },
  { id: '3', name: 'AIZ SALAS AL FAUZY', nim: '112410013', task: 'UI/UX Design', progress: 100 },
  { id: '4', name: 'M FATICHUL ICHSAN', nim: '112410026', task: 'Testing', progress: 100 },
  { id: '5', name: 'MUHAMMAD NENDRA AFIFUDIN', nim: '112410036', task: 'Logic Gate Functionality', progress: 100 },
];

export default function TeamManagerPage() {
  const [teamMembers] = useState<TeamMember[]>(defaultTeamMembers);

  return (
    <PageShell
      title="Team Project Manager"
      subtitle="Kelola tim dan pembagian tugas untuk project rangkaian digital Anda."
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <Card className="shadow-lg md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl"><Users className="mr-2 h-7 w-7 text-primary" /> Daftar Anggota Tim</CardTitle>
            <CardDescription className="text-base">Total Anggota: {teamMembers.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2"> {/* Reduced space-y for compactness */}
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-lg">Tidak ada anggota tim.</p>
            ) : (
              teamMembers.map(member => (
                <Card key={member.id} className="p-2 bg-muted/50"> {/* Reduced padding */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-md text-accent">{member.name} <span className="text-xs text-muted-foreground">({member.nim})</span></h4> {/* Reduced font size */}
                      <p className="text-xs text-muted-foreground">{member.task}</p> {/* Reduced font size */}
                    </div>
                    {/* Delete button removed */}
                  </div>
                  <div className="mt-1"> {/* Reduced margin */}
                    <div className="flex justify-between text-xs mb-0.5"> {/* Reduced font size and margin */}
                      <span>Progress:</span>
                      <span>{member.progress}%</span>
                    </div>
                    <Progress value={member.progress} className="h-2" /> {/* Reduced height */}
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
       <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Informasi Tugas Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-primary text-lg">Instruksi Proyek:</p>
            <blockquote className="mt-2 border-l-2 border-primary pl-4 italic text-muted-foreground text-base">
              "Mulai hari ini saya kasih tugas uas ya, tolong dikerjakan secara kelompok maksimal 5 orang. Membuat aplikasi rangkaian digital dasar dan konversi sederhana. Boleh website atau desktop."
            </blockquote>
          </CardContent>
        </Card>
    </PageShell>
  );
}
