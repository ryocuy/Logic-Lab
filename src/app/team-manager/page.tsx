
"use client";
import React, { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { UserPlus, Users, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  nim: string;
  task: string;
  progress: number;
}

const availableTasks = [
  "UI/UX Design", "Front-End Development", "Logic Gate Functionality", 
  "Circuit Builder Development", "Converter & Calculator", "Documentation", "Testing"
];

export default function TeamManagerPage() {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberNim, setMemberNim] = useState('');
  const [memberTask, setMemberTask] = useState('');

  useEffect(() => {
    // Load team members from local storage
    const storedMembers = localStorage.getItem('teamMembersLogicLab');
    if (storedMembers) {
      setTeamMembers(JSON.parse(storedMembers));
    }
  }, []);

  useEffect(() => {
    // Save team members to local storage whenever they change
    localStorage.setItem('teamMembersLogicLab', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberNim || !memberTask) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: memberName,
      nim: memberNim,
      task: memberTask,
      progress: 0, // Initial progress set to 0
    };
    setTeamMembers(prev => [...prev, newMember]);
    setMemberName('');
    setMemberNim('');
    setMemberTask('');
    toast({ title: "Success", description: `${memberName} added to the team.` });
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast({ title: "Member Removed", description: "Team member has been removed." });
  };

  const handleProgressChange = (id: string, newProgress: number) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, progress: Math.max(0, Math.min(100, newProgress)) } : member
    ));
  };

  return (
    <PageShell
      title="Team Project Manager"
      subtitle="Kelola tim dan pembagian tugas untuk project rangkaian digital Anda."
    >
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl"><UserPlus className="mr-2 h-7 w-7 text-primary" /> Tambah Anggota Tim</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <Label htmlFor="memberName" className="text-lg">Nama Anggota</Label>
                <Input id="memberName" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Masukkan nama..." className="h-12 text-base"/>
              </div>
              <div>
                <Label htmlFor="memberNim" className="text-lg">NIM</Label>
                <Input id="memberNim" value={memberNim} onChange={(e) => setMemberNim(e.target.value)} placeholder="Masukkan NIM..." className="h-12 text-base"/>
              </div>
              <div>
                <Label htmlFor="memberTask" className="text-lg">Tugas</Label>
                <Select value={memberTask} onValueChange={setMemberTask}>
                  <SelectTrigger id="memberTask" className="h-12 text-base">
                    <SelectValue placeholder="-- Pilih Tugas --" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(task => (
                      <SelectItem key={task} value={task} className="text-base">{task}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full text-lg py-3">Tambah Anggota</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl"><Users className="mr-2 h-7 w-7 text-primary" /> Daftar Anggota Tim</CardTitle>
            <CardDescription className="text-base">Total Anggota: {teamMembers.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-lg">Belum ada anggota tim.</p>
            ) : (
              teamMembers.map(member => (
                <Card key={member.id} className="p-4 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-xl text-accent">{member.name} <span className="text-base text-muted-foreground">({member.nim})</span></h4>
                      <p className="text-base text-muted-foreground">{member.task}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-base mb-1">
                      <span>Progress:</span>
                      <span>{member.progress}%</span>
                    </div>
                    <Progress value={member.progress} className="h-3" />
                     <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => handleProgressChange(member.id, member.progress - 10)}>-</Button>
                        <Button size="sm" variant="outline" onClick={() => handleProgressChange(member.id, member.progress + 10)}>+</Button>
                    </div>
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
            <p className="mt-4 font-semibold text-primary text-lg">Saran Pembagian Tugas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-base text-muted-foreground">
              {availableTasks.map(task => <li key={task}>{task}</li>)}
            </ul>
             <p className="mt-4 text-base text-accent-foreground">Pastikan setiap anggota tim memahami tugasnya dan bekerja secara kolaboratif!</p>
          </CardContent>
        </Card>
    </PageShell>
  );
}

