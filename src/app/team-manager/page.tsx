
"use client";
import React, { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const storedMembers = localStorage.getItem('teamMembersLogicLab');
    if (storedMembers) {
      try {
        const parsedMembers = JSON.parse(storedMembers);
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          setTeamMembers(parsedMembers);
        } else {
          setTeamMembers(defaultTeamMembers);
        }
      } catch (error) {
        console.error("Error parsing team members from localStorage:", error);
        setTeamMembers(defaultTeamMembers); 
      }
    } else {
      setTeamMembers(defaultTeamMembers);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage only if teamMembers is not empty, to avoid overwriting with empty on initial load issue
    if (teamMembers.length > 0) {
      localStorage.setItem('teamMembersLogicLab', JSON.stringify(teamMembers));
    }
  }, [teamMembers]);

  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast({ title: "Member Removed", description: "Team member has been removed." });
  };

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
          <CardContent className="space-y-3">
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-lg">Memuat anggota tim default...</p>
            ) : (
              teamMembers.map(member => (
                <Card key={member.id} className="p-3 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg text-accent">{member.name} <span className="text-sm text-muted-foreground">({member.nim})</span></h4>
                      <p className="text-sm text-muted-foreground">{member.task}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)} aria-label={`Hapus ${member.name}`}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress:</span>
                      <span>{member.progress}%</span>
                    </div>
                    <Progress value={member.progress} className="h-3" />
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
