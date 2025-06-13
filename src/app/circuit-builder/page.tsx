
"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Download, Trash2, Play, AlertTriangle, Lightbulb, Save, XCircle } from 'lucide-react';
import { analyzeCircuit, AnalyzeCircuitInput, AnalyzeCircuitOutput } from '@/ai/flows/circuit-analyzer';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Component {
  id: string;
  type: 'INPUT' | 'OUTPUT' | 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';
  x: number;
  y: number;
  value?: number; // For INPUT and OUTPUT
  inputs?: { [key: string]: string | null }; // sourceComponentId for each input port
  connections?: { port: string; targetId: string; targetPort: string }[]; // For output ports
}

interface Connection {
  id: string;
  sourceId: string;
  sourcePort: string;
  targetId: string;
  targetPort: string;
}

const gateSymbols: Record<Component['type'], string> = {
  INPUT: "I", OUTPUT: "O", AND: "∧", OR: "∨", NOT: "¬", XOR: "⊕", NAND: "↑", NOR: "↓", XNOR: "⊙"
};

const gateInputPorts: Record<Component['type'], string[]> = {
  INPUT: [],
  OUTPUT: ['in'],
  AND: ['in1', 'in2'],
  OR: ['in1', 'in2'],
  NOT: ['in1'],
  XOR: ['in1', 'in2'],
  NAND: ['in1', 'in2'],
  NOR: ['in1', 'in2'],
  XNOR: ['in1', 'in2'],
};

const gateOutputPorts: Record<Component['type'], string[]> = {
  INPUT: ['out'],
  OUTPUT: [],
  AND: ['out'],
  OR: ['out'],
  NOT: ['out'],
  XOR: ['out'],
  NAND: ['out'],
  NOR: ['out'],
  XNOR: ['out'],
};


export default function CircuitBuilderPage() {
  const { toast } = useToast();
  const [components, setComponents] = useState<Component[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ sourceId: string; sourcePort: string; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [circuitDescription, setCircuitDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<Pick<AnalyzeCircuitOutput, 'issues' | 'optimizations' | 'explanation'> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const [isConnectionDeleteDialogOpen, setIsConnectionDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);

  const [isComponentDeleteDialogOpen, setIsComponentDeleteDialogOpen] = useState(false);
  const [componentToDeleteId, setComponentToDeleteId] = useState<string | null>(null);


  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.random() * 200 + 30, 
      y: Math.random() * 150 + 30, 
      value: type === 'INPUT' ? 0 : undefined,
      inputs: {},
      connections: [],
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const handleInteractionStart = (clientX: number, clientY: number, id: string, target: EventTarget | null) => {
    if ((target as HTMLElement)?.closest('.delete-component-button')) {
      return; 
    }
    const component = components.find(c => c.id === id);
    if (component && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setDraggingComponent(id);
      setDragOffset({
        x: clientX - canvasRect.left - component.x,
        y: clientY - canvasRect.top - component.y,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    handleInteractionStart(e.clientX, e.clientY, id, e.target);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, id: string) => {
    // e.preventDefault(); // Might be needed to prevent default scroll/zoom on touch
    handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY, id, e.target);
  };
  
  const handlePortClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, componentId: string, portName: string, isOutputPort: boolean) => {
    e.stopPropagation();
    if (!connecting) {
      if (isOutputPort) { 
        const portElement = e.currentTarget;
        const componentElement = portElement.closest('.gate-component-render');
        if (canvasRef.current && componentElement) {
            const sourceComp = components.find(c => c.id === componentId);
            if (!sourceComp) return;

            const sourcePortPos = getPortPosition(sourceComp, portName, true);
            
            setConnecting({ 
                sourceId: componentId, 
                sourcePort: portName, 
                x: sourcePortPos.x, 
                y: sourcePortPos.y  
            });
        }
      }
    } else { 
      if (!isOutputPort) { 
        if (componentId === connecting.sourceId) {
            toast({ title: "Koneksi Tidak Valid", description: "Tidak dapat menghubungkan komponen ke dirinya sendiri.", variant: "destructive" });
            setConnecting(null);
            return;
        }

        const targetComponent = components.find(c => c.id === componentId);
        if (targetComponent?.inputs?.[portName]) {
            toast({ title: "Koneksi Tidak Valid", description: `Port input ${portName} sudah terhubung.`, variant: "destructive" });
            setConnecting(null);
            return;
        }
        
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          sourceId: connecting.sourceId,
          sourcePort: connecting.sourcePort,
          targetId: componentId,
          targetPort: portName,
        };
        setConnections(prev => [...prev, newConnection]);
        
        setComponents(prevComps => prevComps.map(c => {
            if (c.id === connecting.sourceId) {
                return { ...c, connections: [...(c.connections || []), { port: connecting.sourcePort, targetId: componentId, targetPort: portName }] };
            }
            if (c.id === componentId) {
                return { ...c, inputs: { ...(c.inputs || {}), [portName]: connecting.sourceId } };
            }
            return c;
        }));

        setConnecting(null);
      } else { 
        toast({ title: "Koneksi Tidak Valid", description: "Tidak dapat menghubungkan port output ke port output lainnya.", variant: "destructive" });
        setConnecting(null); 
      }
    }
  };

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (draggingComponent && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const compWidth = (typeof window !== 'undefined' && window.innerWidth < 768) ? 75 : 90;
      const compHeight = (typeof window !== 'undefined' && window.innerWidth < 768) ? 50 : 60;
      const x = clientX - canvasRect.left - dragOffset.x;
      const y = clientY - canvasRect.top - dragOffset.y;
      setComponents(prev => prev.map(c => c.id === draggingComponent ? { ...c, x: Math.max(0, Math.min(x, canvasRect.width - compWidth)), y: Math.max(0, Math.min(y, canvasRect.height - compHeight)) } : c));
    }
    if (connecting && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setConnecting(prev => prev ? { ...prev, x: clientX - canvasRect.left, y: clientY - canvasRect.top } : null);
    }
  }, [draggingComponent, dragOffset, connecting]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteractionMove(e.clientX, e.clientY);
  }, [handleInteractionMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // e.preventDefault(); // May be needed depending on desired scroll/zoom behavior
    if (e.touches.length > 0) {
        handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleInteractionMove]);


  const handleInteractionEnd = useCallback(() => {
    setDraggingComponent(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  const handleTouchEnd = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);


  const handleCanvasClick = () => {
    if (connecting) {
        setConnecting(null); 
        toast({ title: "Koneksi Dibatalkan", description: "Klik pada area kanvas kosong." });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false }); // passive: false for preventDefault
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const runSimulation = () => {
    const componentMap = new Map(components.map(c => [c.id, {...c, currentValue: c.value } ])); 

    const getComponentValue = (componentId: string, visited: Set<string> = new Set()): number | undefined => {
        if (visited.has(componentId)) {
            toast({ title: "Simulasi Error", description: `Loop terdeteksi atau dependensi sirkular pada ${componentId}.`, variant: "destructive" });
            return undefined; 
        }
        visited.add(componentId);

        const component = componentMap.get(componentId);
        if (!component) return undefined;

        if (component.currentValue !== undefined && component.type !== 'INPUT' && !isNaN(Number(component.currentValue))) {
            return component.currentValue;
        }
        
        if (component.type === 'INPUT') {
            return component.value ?? 0;
        }

        let calculatedValue: number | undefined;

        if (component.type === 'NOT') {
            const inputId = component.inputs?.['in1'];
            if (!inputId) return undefined;
            const inputValue = getComponentValue(inputId, new Set(visited));
            calculatedValue = inputValue === undefined ? undefined : (inputValue === 1 ? 0 : 1);
        } else if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(component.type)) {
            const input1Id = component.inputs?.['in1'];
            const input2Id = component.inputs?.['in2'];

            if (!input1Id || !input2Id) return undefined; 
            
            const val1 = getComponentValue(input1Id, new Set(visited));
            const val2 = getComponentValue(input2Id, new Set(visited));

            if (val1 === undefined || val2 === undefined) return undefined;

            switch (component.type) {
                case 'AND': calculatedValue = (val1 && val2) ? 1 : 0; break;
                case 'OR': calculatedValue = (val1 || val2) ? 1 : 0; break;
                case 'XOR': calculatedValue = (val1 !== val2) ? 1 : 0; break;
                case 'NAND': calculatedValue = !(val1 && val2) ? 1 : 0; break;
                case 'NOR': calculatedValue = !(val1 || val2) ? 1 : 0; break;
                case 'XNOR': calculatedValue = (val1 === val2) ? 1 : 0; break;
            }
        }
        
        if (componentId) {
            const compToUpdate = componentMap.get(componentId);
            if (compToUpdate) {
                componentMap.set(componentId, {...compToUpdate, currentValue: calculatedValue });
            }
        }
        return calculatedValue;
    };

    const finalComponents = components.map(comp => {
        if (comp.type === 'OUTPUT') {
            const incomingConnection = connections.find(conn => conn.targetId === comp.id && conn.targetPort === 'in');
            if (incomingConnection) {
                const sourceComponentId = incomingConnection.sourceId;
                const outputValue = getComponentValue(sourceComponentId, new Set()); 
                return { ...comp, value: outputValue };
            }
            return { ...comp, value: undefined }; 
        }
        return comp; 
    });

    setComponents(finalComponents);
    toast({ title: "Simulasi Dijalankan", description: "Output sirkuit telah dihitung (simulasi dasar)." });
};
  
  const toggleInputValue = (id: string) => {
    setComponents(prev => prev.map(c => c.id === id && c.type === 'INPUT' ? { ...c, value: c.value === 1 ? 0 : 1 } : c));
  };


  const clearCanvas = () => {
    setComponents([]);
    setConnections([]);
    setCircuitDescription('');
    setAnalysisResult(null);
    toast({ title: "Kanvas Dibersihkan", description: "Semua komponen, koneksi, dan analisis dihapus." });
  };

  const handleAnalyzeCircuit = async () => {
    const canvasIsEmpty = components.length === 0 && connections.length === 0;
    const descriptionIsEmpty = !circuitDescription.trim();

    if (canvasIsEmpty && descriptionIsEmpty) {
      toast({
        title: "Tidak Ada yang Dianalisis/Dibuat",
        description: "Silakan buat sirkuit di kanvas atau berikan deskripsi untuk AI membuat sirkuit.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const canvasCircuitDataString = !canvasIsEmpty ? JSON.stringify({ components, connections }) : '{"components":[],"connections":[]}';
      
      const input: AnalyzeCircuitInput = { 
        circuitDescription: descriptionIsEmpty ? undefined : circuitDescription,
        canvasCircuitData: canvasCircuitDataString
      };
      
      const result = await analyzeCircuit(input);

      if (result.generatedCircuitJson) {
        try {
          const parsedGeneratedCircuit = JSON.parse(result.generatedCircuitJson);
          if (parsedGeneratedCircuit.components && parsedGeneratedCircuit.connections) {
            setComponents(parsedGeneratedCircuit.components);
            setConnections(parsedGeneratedCircuit.connections);
            toast({
              title: "Sirkuit Dibuat AI",
              description: "Sirkuit berdasarkan deskripsi Anda telah dimuat ke kanvas.",
            });
          } else {
             toast({
              title: "Format Sirkuit AI Tidak Sesuai",
              description: "AI memberikan format sirkuit yang tidak lengkap.",
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error("Error parsing generated circuit JSON:", e);
          toast({
            title: "Error Memproses Sirkuit AI",
            description: "Tidak dapat memproses JSON sirkuit yang dihasilkan AI.",
            variant: "destructive",
          });
        }
      }
      
      setAnalysisResult({ 
        issues: result.issues, 
        optimizations: result.optimizations, 
        explanation: result.explanation 
      });

      toast({
        title: "Analisis/Pembuatan Selesai",
        description: "Proses AI berhasil diselesaikan.",
      });

    } catch (error) {
      console.error("Kesalahan Analisis/Pembuatan AI:", error);
      toast({
        title: "Proses AI Gagal",
        description: "Terjadi kesalahan saat AI memproses permintaan Anda.",
        variant: "destructive",
      });
    }
    setIsAnalyzing(false);
  };
  
  const getPortPosition = (component: Component, portName: string, isOutput: boolean): { x: number; y: number } => {
    let componentWidth = 90; 
    let componentHeight = 60;

    if (typeof window !== 'undefined' && window.innerWidth < 768) { 
        componentWidth = 75; 
        componentHeight = 50; 
    }
    
    if (isOutput) {
        return { x: component.x + componentWidth, y: component.y + componentHeight / 2 };
    } else {
        const inputPortsArray = gateInputPorts[component.type];
        const portIndex = inputPortsArray.indexOf(portName);
        const numPorts = inputPortsArray.length;

        if (numPorts === 0 || portIndex === -1) { 
             return { x: component.x, y: component.y + componentHeight / 2 };
        }
        
        const yOffset = (numPorts > 1) 
                        ? (componentHeight / (numPorts + 1)) * (portIndex + 1) 
                        : componentHeight / 2;
        return { x: component.x, y: component.y + yOffset };
    }
  };

  const saveCircuitToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const circuitData = { components, connections, circuitDescription };
        localStorage.setItem('logicLabCurrentCircuit', JSON.stringify(circuitData));
        toast({ title: "Sirkuit Disimpan", description: "Desain sirkuit dan deskripsi Anda telah disimpan di browser." });
      } catch (error) {
        console.error("Gagal menyimpan sirkuit:", error);
        toast({ title: "Gagal Menyimpan", description: "Tidak dapat menyimpan sirkuit ke local storage.", variant: "destructive" });
      }
    }
  };

  const loadCircuitFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedDataString = localStorage.getItem('logicLabCurrentCircuit');
        if (savedDataString) {
          const savedData = JSON.parse(savedDataString);
          if (savedData && savedData.components && savedData.connections) {
            setComponents(savedData.components);
            setConnections(savedData.connections);
            setCircuitDescription(savedData.circuitDescription || '');
            setAnalysisResult(null); 
            toast({ title: "Sirkuit Dimuat", description: "Desain sirkuit yang tersimpan telah dimuat." });
          } else {
            toast({ title: "Data Tidak Valid", description: "Format data sirkuit yang tersimpan tidak valid.", variant: "destructive" });
          }
        } else {
          toast({ title: "Tidak Ada Sirkuit Tersimpan", description: "Tidak ditemukan desain sirkuit yang tersimpan di browser." });
        }
      } catch (error) {
        console.error("Gagal memuat sirkuit:", error);
        toast({ title: "Gagal Memuat", description: "Tidak dapat memuat sirkuit dari local storage.", variant: "destructive" });
      }
    }
  };

  const openDeleteConnectionDialog = (connection: Connection) => {
    setConnectionToDelete(connection);
    setIsConnectionDeleteDialogOpen(true);
  };

  const handleDeleteConnection = () => {
    if (connectionToDelete) {
      const conn = connectionToDelete;
      setConnections(prev => prev.filter(c => c.id !== conn.id));
      setComponents(prevComps => prevComps.map(comp => {
        if (comp.id === conn.sourceId) {
          return { ...comp, connections: comp.connections?.filter(c => !(c.targetId === conn.targetId && c.port === conn.sourcePort && c.targetPort === conn.targetPort)) };
        }
        if (comp.id === conn.targetId) {
          const newInputs = { ...comp.inputs };
          if (newInputs) delete newInputs[conn.targetPort];
          return { ...comp, inputs: newInputs };
        }
        return comp;
      }));
      toast({ title: "Koneksi Dihapus", description: "Koneksi telah berhasil dihapus." });
    }
    setConnectionToDelete(null);
    setIsConnectionDeleteDialogOpen(false);
  };

  const openDeleteComponentDialog = (id: string) => {
    setComponentToDeleteId(id);
    setIsComponentDeleteDialogOpen(true);
  };

  const handleDeleteComponent = () => {
    if (!componentToDeleteId) return;

    const newComponents = components.filter(c => c.id !== componentToDeleteId);
    const newConnections = connections.filter(conn => conn.sourceId !== componentToDeleteId && conn.targetId !== componentToDeleteId);
    
    const updatedComponents = newComponents.map(comp => {
        let newInputs = { ...comp.inputs };
        let changedInputs = false;
        if (comp.inputs) {
            for (const port in comp.inputs) {
                if (comp.inputs[port] === componentToDeleteId) {
                    delete newInputs[port];
                    changedInputs = true;
                }
            }
        }

        let newInternalConnections = comp.connections ? [...comp.connections] : [];
        let changedInternalConnections = false;
        if (comp.connections) {
            newInternalConnections = comp.connections.filter(c => c.targetId !== componentToDeleteId);
            if(newInternalConnections.length !== comp.connections.length) {
                changedInternalConnections = true;
            }
        }
        
        if(changedInputs || changedInternalConnections) {
            return { ...comp, inputs: newInputs, connections: newInternalConnections };
        }
        return comp;
    });

    setComponents(updatedComponents);
    setConnections(newConnections);
    toast({ title: "Komponen Dihapus", description: `Komponen ${componentToDeleteId} dan koneksinya telah dihapus.` });
    setComponentToDeleteId(null);
    setIsComponentDeleteDialogOpen(false);
  };


  return (
    <PageShell
      title="Circuit Builder"
      subtitle="Buat, simulasikan, dan analisis rangkaian digital Anda. AI dapat membantu membuatkan sirkuit dari deskripsi!"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl sm:text-2xl"><Zap className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Toolbar</CardTitle>
            <CardDescription className="text-sm sm:text-base">Tambahkan komponen ke kanvas.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(['INPUT', 'OUTPUT', 'AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR'] as Component['type'][]).map(type => (
              <Button key={type} variant="outline" onClick={() => addComponent(type)} className="text-sm sm:text-base py-2.5 sm:py-3">
                {gateSymbols[type]} {type}
              </Button>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
             <Button className="w-full text-base sm:text-lg py-2.5 sm:py-3" onClick={runSimulation}><Play className="mr-2 h-5 w-5"/> Run Simulation</Button>
             <Button className="w-full text-base sm:text-lg py-2.5 sm:py-3" variant="outline" onClick={clearCanvas}><Trash2 className="mr-2 h-5 w-5"/> Clear Canvas & AI</Button>
             <Button className="w-full text-base sm:text-lg py-2.5 sm:py-3" variant="outline" onClick={saveCircuitToLocalStorage}><Save className="mr-2 h-5 w-5"/> Save Circuit</Button>
             <Button className="w-full text-base sm:text-lg py-2.5 sm:py-3" variant="outline" onClick={loadCircuitFromLocalStorage}><Download className="mr-2 h-5 w-5"/> Load Circuit</Button>
          </CardFooter>
        </Card>

        <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg min-h-[380px] sm:min-h-[450px] md:min-h-[500px] relative circuit-canvas-bg" ref={canvasRef} onClick={handleCanvasClick}>
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Circuit Canvas</CardTitle>
                    {components.length === 0 && connections.length === 0 && (
                      <CardDescription className="text-sm sm:text-base pt-2">Kanvas kosong. Tambahkan komponen dari toolbar, atau minta AI membuatkan sirkuit dari deskripsi di bawah.</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="h-full">
                {components.map(comp => (
                    <div
                      key={comp.id}
                      className="gate-component-render group"
                      style={{ left: comp.x, top: comp.y, zIndex: draggingComponent === comp.id ? 10 : 1 }}
                      onMouseDown={(e) => handleMouseDown(e, comp.id)}
                      onTouchStart={(e) => handleTouchStart(e, comp.id)}
                    >
                    <button 
                        className="delete-component-button absolute -top-2 -right-2 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-70 group-hover:opacity-100 transition-opacity z-20"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            openDeleteComponentDialog(comp.id);
                        }}
                        title={`Hapus komponen ${comp.type}`}
                    >
                        <XCircle className="h-4 w-4" />
                    </button>
                    <div className="font-bold text-base md:text-base">{comp.type}</div>
                    <div className="gate-symbol-inner">{gateSymbols[comp.type]}</div>
                    {comp.type === 'INPUT' && (
                         <div className="flex items-center space-x-0.5 md:space-x-1 mt-0.5 md:mt-1">
                            <Label htmlFor={`input-switch-${comp.id}`} className="text-xs md:text-sm">{comp.value}</Label>
                            <Switch id={`input-switch-${comp.id}`} checked={comp.value === 1} onCheckedChange={() => toggleInputValue(comp.id)} className="w-8 h-4 sm:w-10 sm:h-5 [&>span]:w-3 [&>span]:h-3 sm:[&>span]:w-4 sm:[&>span]:h-4 [&>span[data-state=checked]]:translate-x-4 sm:[&>span[data-state=checked]]:translate-x-[1.125rem]" />
                        </div>
                    )}
                    {comp.type === 'OUTPUT' && (
                        <div className={`text-sm md:text-base font-bold ${comp.value === 1 ? 'text-green-500' : comp.value === 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            Output: {comp.value ?? '?'}
                        </div>
                    )}
                    
                    {gateInputPorts[comp.type].map((portName, index) => {
                        const portHeight = (typeof window !== 'undefined' && window.innerWidth < 768) ? 50 : 60;
                        return (
                        <div key={portName}
                             className="connection-point-render input"
                             style={{ top: `${(index + 1) * (portHeight / (gateInputPorts[comp.type].length + 1)) - 6}px` }}
                             onClick={(e) => handlePortClick(e, comp.id, portName, false)}
                             onTouchStart={(e) => handlePortClick(e, comp.id, portName, false)}
                             title={`Input: ${portName}`}
                        />
                    );})}
                     {gateOutputPorts[comp.type].map((portName, index) => {
                        const portHeight = (typeof window !== 'undefined' && window.innerWidth < 768) ? 50 : 60;
                        return ( 
                        <div key={portName}
                             className="connection-point-render output"
                             style={{ top: `${(index + 1) * (portHeight / (gateOutputPorts[comp.type].length + 1)) - 6}px`}} 
                             onClick={(e) => handlePortClick(e, comp.id, portName, true)}
                             onTouchStart={(e) => handlePortClick(e, comp.id, portName, true)}
                             title={`Output: ${portName}`}
                        />
                    );})}
                    </div>
                ))}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                    {connections.map(conn => {
                        const sourceComp = components.find(c => c.id === conn.sourceId);
                        const targetComp = components.find(c => c.id === conn.targetId);
                        if (!sourceComp || !targetComp) return null;
                        
                        const sourcePos = getPortPosition(sourceComp, conn.sourcePort, true);
                        const targetPos = getPortPosition(targetComp, conn.targetPort, false);

                        return (
                            <line key={conn.id} x1={sourcePos.x} y1={sourcePos.y} x2={targetPos.x} y2={targetPos.y} stroke="hsl(var(--accent))" strokeWidth="3" className="pointer-events-auto cursor-pointer hover:stroke-destructive" onClick={(e) => {
                                e.stopPropagation(); 
                                openDeleteConnectionDialog(conn);
                            }} />
                        );
                    })}
                    {connecting && components.find(c=>c.id === connecting.sourceId) && (
                         <line x1={getPortPosition(components.find(c=>c.id === connecting.sourceId)!, connecting.sourcePort, true).x} 
                               y1={getPortPosition(components.find(c=>c.id === connecting.sourceId)!, connecting.sourcePort, true).y} 
                               x2={connecting.x} y2={connecting.y} stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="6,6" />
                    )}
                </svg>
                </CardContent>
            </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl sm:text-2xl"><Lightbulb className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" /> AI Circuit Analyzer & Generator</CardTitle>
              <CardDescription className="text-sm sm:text-base">AI dapat menganalisis sirkuit dari kanvas, atau membuatkan sirkuit baru berdasarkan deskripsi Anda jika kanvas kosong.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="circuitDescription" className="text-base sm:text-lg">Deskripsi / Permintaan Sirkuit ke AI</Label>
                <Textarea
                  id="circuitDescription"
                  placeholder="Contoh: 'Buatkan saya half-adder.' atau 'Analisis sirkuit AND ini.' Jika kanvas kosong dan Anda mendeskripsikan sirkuit, AI akan mencoba membuatnya."
                  value={circuitDescription}
                  onChange={(e) => setCircuitDescription(e.target.value)}
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>
              <Button onClick={handleAnalyzeCircuit} disabled={isAnalyzing} className="w-full text-base sm:text-lg py-2.5 sm:py-3">
                {isAnalyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                Proses dengan AI
              </Button>
            </CardContent>
            {analysisResult && (
              <CardFooter className="flex flex-col items-start space-y-4 pt-4 border-t">
                <h4 className="font-semibold text-lg sm:text-xl text-primary">Hasil Proses AI:</h4>
                {analysisResult.explanation && (
                    <div>
                        <h5 className="font-medium text-base sm:text-lg">Penjelasan/Deskripsi:</h5>
                        <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{analysisResult.explanation}</p>
                    </div>
                )}
                {analysisResult.issues && analysisResult.issues.length > 0 && (
                    <div>
                    <h5 className="font-medium flex items-center text-base sm:text-lg"><AlertTriangle className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-destructive" /> Potensi Masalah:</h5>
                    <ul className="list-disc list-inside ml-4 text-sm sm:text-base">
                        {analysisResult.issues.map((issue, index) => <li key={index}>{issue}</li>)}
                    </ul>
                    </div>
                )}
                 {analysisResult.issues && analysisResult.issues.length === 0 && analysisResult.explanation && !analysisResult.explanation.includes("Tidak ada") && (
                     <p className="text-sm sm:text-base text-muted-foreground">Tidak ada masalah signifikan yang ditemukan pada sirkuit yang dianalisis/dihasilkan.</p>
                 )}


                {analysisResult.optimizations && analysisResult.optimizations.length > 0 && (
                    <div>
                    <h5 className="font-medium flex items-center text-base sm:text-lg"><Lightbulb className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-green-500" /> Saran Optimasi:</h5>
                    <ul className="list-disc list-inside ml-4 text-sm sm:text-base">
                        {analysisResult.optimizations.map((opt, index) => <li key={index}>{opt}</li>)}
                    </ul>
                    </div>
                )}
                 {analysisResult.optimizations && analysisResult.optimizations.length === 0 && analysisResult.explanation && !analysisResult.explanation.includes("Tidak ada") && (
                    <p className="text-sm sm:text-base text-muted-foreground">Tidak ada saran optimasi spesifik saat ini.</p>
                 )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      <AlertDialog open={isConnectionDeleteDialogOpen} onOpenChange={setIsConnectionDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Koneksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus koneksi ini? Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConnectionToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConnection}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isComponentDeleteDialogOpen} onOpenChange={setIsComponentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komponen?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus komponen ini? Semua koneksi yang terhubung juga akan dihapus. Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setComponentToDeleteId(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComponent}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
    
