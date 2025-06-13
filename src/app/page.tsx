"use client";
import React, { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TruthTableRowProps {
  inputs: number[];
  output: number;
}

const TruthTableRow: React.FC<TruthTableRowProps> = ({ inputs, output }) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center p-3 my-2 bg-card rounded-lg shadow-sm transition-all duration-300 cursor-pointer",
        "hover:ring-2 hover:ring-primary hover:scale-[1.03] hover:bg-primary/5" // Simplified hover effect
      )}
    >
      <div className="flex gap-3"> {/* Increased gap for better spacing */}
        {inputs.map((input, index) => (
          <span key={index} className="truth-table bit">{input}</span>
        ))}
      </div>
      <span className="text-primary font-bold text-3xl mx-2">→</span> {/* Increased size and margin */}
      <span className={`truth-table bit bit-output ${output === 0 ? 'zero' : ''}`}>{output}</span>
    </div>
  );
};

interface GateProps {
  name: string;
  symbol: string;
  truthTable: { inputs: number[]; output: number }[];
  description: string;
}

const GateCard: React.FC<GateProps> = ({ name, symbol, truthTable, description }) => (
  <Card className="glow-card transition-shadow duration-300 hover:shadow-primary/20">
    <CardHeader className="text-center">
      <CardTitle className="text-4xl font-semibold text-primary">{name}</CardTitle>
      <div className="gate-symbol-display">{symbol}</div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 truth-table"> {/* Added truth-table class for context if needed */}
        {truthTable.map((row, index) => (
          <TruthTableRow key={index} inputs={row.inputs} output={row.output} />
        ))}
      </div>
      <CardDescription className="mt-6 text-center text-lg">{description}</CardDescription>
    </CardContent>
  </Card>
);

const basicGates: GateProps[] = [
  { name: "AND Gate", symbol: "∧", truthTable: [{ inputs: [0,0], output: 0}, { inputs: [0,1], output: 0}, { inputs: [1,0], output: 0}, { inputs: [1,1], output: 1}], description: "Output 1 hanya jika SEMUA input bernilai 1." },
  { name: "OR Gate", symbol: "∨", truthTable: [{ inputs: [0,0], output: 0}, { inputs: [0,1], output: 1}, { inputs: [1,0], output: 1}, { inputs: [1,1], output: 1}], description: "Output 1 jika SALAH SATU atau lebih input bernilai 1." },
  { name: "NOT Gate", symbol: "¬", truthTable: [{ inputs: [0], output: 1}, { inputs: [1], output: 0}], description: "Membalikkan nilai input." },
  { name: "XOR Gate", symbol: "⊕", truthTable: [{ inputs: [0,0], output: 0}, { inputs: [0,1], output: 1}, { inputs: [1,0], output: 1}, { inputs: [1,1], output: 0}], description: "Output 1 jika input BERBEDA." },
];

const advancedGates: GateProps[] = [
  { name: "NAND Gate", symbol: "↑", truthTable: [{ inputs: [0,0], output: 1}, { inputs: [0,1], output: 1}, { inputs: [1,0], output: 1}, { inputs: [1,1], output: 0}], description: "Kebalikan AND. Output 0 hanya jika SEMUA input 1." },
  { name: "NOR Gate", symbol: "↓", truthTable: [{ inputs: [0,0], output: 1}, { inputs: [0,1], output: 0}, { inputs: [1,0], output: 0}, { inputs: [1,1], output: 0}], description: "Kebalikan OR. Output 1 hanya jika SEMUA input 0." },
  { name: "XNOR Gate", symbol: "⊙", truthTable: [{ inputs: [0,0], output: 1}, { inputs: [0,1], output: 0}, { inputs: [1,0], output: 0}, { inputs: [1,1], output: 1}], description: "Kebalikan XOR. Output 1 jika input SAMA." },
  { name: "Buffer Gate", symbol: "→", truthTable: [{ inputs: [0], output: 0}, { inputs: [1], output: 1}], description: "Output sama dengan input. Digunakan untuk memperkuat sinyal." },
];

const GateSimulator: React.FC = () => {
  const [inputA, setInputA] = useState(false);
  const [inputB, setInputB] = useState(false);
  const [gateType, setGateType] = useState<string>("AND");
  const [output, setOutput] = useState(0);
  const [gateSymbol, setGateSymbol] = useState("∧");
  const [gateDescription, setGateDescription] = useState("AND Gate: Output 1 hanya jika SEMUA input bernilai 1.");
  const [showInputB, setShowInputB] = useState(true);

  useEffect(() => {
    let newOutput = 0;
    let newSymbol = "";
    let newDescription = "";
    let newShowInputB = true;

    const valA = inputA ? 1 : 0;
    const valB = inputB ? 1 : 0;

    switch (gateType) {
      case "AND": newOutput = (valA && valB) ? 1 : 0; newSymbol = "∧"; newDescription = "AND Gate: Output 1 hanya jika SEMUA input bernilai 1."; break;
      case "OR": newOutput = (valA || valB) ? 1 : 0; newSymbol = "∨"; newDescription = "OR Gate: Output 1 jika SALAH SATU atau lebih input bernilai 1."; break;
      case "NOT": newOutput = valA ? 0 : 1; newSymbol = "¬"; newDescription = "NOT Gate: Membalikkan nilai input."; newShowInputB = false; break;
      case "XOR": newOutput = (valA !== valB) ? 1 : 0; newSymbol = "⊕"; newDescription = "XOR Gate: Output 1 jika input BERBEDA."; break;
      case "NAND": newOutput = !(valA && valB) ? 1 : 0; newSymbol = "↑"; newDescription = "NAND Gate: Kebalikan dari AND. Output 0 hanya jika SEMUA input bernilai 1."; break;
      case "NOR": newOutput = !(valA || valB) ? 1 : 0; newSymbol = "↓"; newDescription = "NOR Gate: Kebalikan dari OR. Output 1 hanya jika SEMUA input bernilai 0."; break;
      case "XNOR": newOutput = (valA === valB) ? 1 : 0; newSymbol = "⊙"; newDescription = "XNOR Gate: Kebalikan dari XOR. Output 1 jika input SAMA."; break;
    }
    setOutput(newOutput);
    setGateSymbol(newSymbol);
    setGateDescription(newDescription);
    setShowInputB(newShowInputB);
  }, [inputA, inputB, gateType]);

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
      <CardHeader>
        <CardTitle className="text-center text-4xl text-primary">Gate Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center space-x-2">
            <Switch id="inputA-sim" checked={inputA} onCheckedChange={setInputA} />
            <Label htmlFor="inputA-sim" className="text-2xl">Input A: {inputA ? 1 : 0}</Label>
          </div>
          {showInputB && (
            <div className="flex items-center space-x-2">
              <Switch id="inputB-sim" checked={inputB} onCheckedChange={setInputB} />
              <Label htmlFor="inputB-sim" className="text-2xl">Input B: {inputB ? 1 : 0}</Label>
            </div>
          )}
          <Select value={gateType} onValueChange={setGateType}>
            <SelectTrigger className="w-full sm:w-[220px] text-xl h-14"> {/* Increased size */}
              <SelectValue placeholder="Select Gate" />
            </SelectTrigger>
            <SelectContent>
              {["AND", "OR", "NOT", "XOR", "NAND", "NOR", "XNOR"].map(gate => (
                <SelectItem key={gate} value={gate} className="text-xl">{gate} Gate</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-center p-6 bg-muted rounded-lg shadow-inner">
          <div className="text-5xl font-mono mb-4 flex items-center justify-center space-x-3"> {/* Increased size */}
            <span>{inputA ? 1 : 0}</span>
            <span className="text-primary text-6xl">{gateSymbol}</span> {/* Increased size */}
            {showInputB && <span>{inputB ? 1 : 0}</span>}
            <span className="text-muted-foreground mx-1">=</span>
            <span className={`font-bold text-6xl ${output === 1 ? 'text-green-500' : 'text-red-500'}`}>{output}</span> {/* Increased size */}
          </div>
          <div className="gate-symbol-display text-8xl mb-4">{gateSymbol}</div>
          <p className="text-muted-foreground text-lg">{gateDescription}</p>
        </div>
      </CardContent>
    </Card>
  );
};


export default function LogicGatesPage() {
  return (
    <PageShell
      title="Logic Gates Playground"
      subtitle="Jelajahi berbagai gerbang logika, tabel kebenarannya, dan simulasikan perilakunya secara interaktif."
    >
      <Tabs defaultValue="basic-gates" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="basic-gates" className="text-lg py-3">Basic Gates</TabsTrigger> {/* Increased size */}
          <TabsTrigger value="advanced-gates" className="text-lg py-3">Advanced Gates</TabsTrigger> {/* Increased size */}
          <TabsTrigger value="gate-simulator" className="text-lg py-3">Gate Simulator</TabsTrigger> {/* Increased size */}
        </TabsList>
        <TabsContent value="basic-gates">
          <div className="grid md:grid-cols-2 gap-8"> {/* Increased gap */}
            {basicGates.map(gate => <GateCard key={gate.name} {...gate} />)}
          </div>
        </TabsContent>
        <TabsContent value="advanced-gates">
          <div className="grid md:grid-cols-2 gap-8"> {/* Increased gap */}
            {advancedGates.map(gate => <GateCard key={gate.name} {...gate} />)}
          </div>
        </TabsContent>
        <TabsContent value="gate-simulator">
          <GateSimulator />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
