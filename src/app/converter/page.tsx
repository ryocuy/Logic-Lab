
"use client";
import React, { useState, useEffect } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

type ConversionType = 
  | 'binToDec' | 'decToBin' | 'decToHex' | 'hexToDec' 
  | 'binToOct' | 'octToBin' | 'decToOct' | 'octToDec'
  | 'binToHex' | 'hexToBin' | 'hexToOct' | 'octToHex';

const conversionTypes: { value: ConversionType; label: string; placeholder: string }[] = [
  { value: 'binToDec', label: 'Binary → Decimal', placeholder: 'e.g., 1010' },
  { value: 'decToBin', label: 'Decimal → Binary', placeholder: 'e.g., 10' },
  { value: 'binToHex', label: 'Binary → Hexadecimal', placeholder: 'e.g., 10101111' },
  { value: 'decToHex', label: 'Decimal → Hexadecimal', placeholder: 'e.g., 255' },
  { value: 'hexToDec', label: 'Hexadecimal → Decimal', placeholder: 'e.g., FF' },
  { value: 'hexToBin', label: 'Hexadecimal → Binary', placeholder: 'e.g., AF' },
  { value: 'binToOct', label: 'Binary → Octal', placeholder: 'e.g., 101010' },
  { value: 'octToBin', label: 'Octal → Binary', placeholder: 'e.g., 52' },
  { value: 'decToOct', label: 'Decimal → Octal', placeholder: 'e.g., 42' },
  { value: 'octToDec', label: 'Octal → Decimal', placeholder: 'e.g., 52' },
  { value: 'hexToOct', label: 'Hexadecimal → Octal', placeholder: 'e.g., FF' },
  { value: 'octToHex', label: 'Octal → Hexadecimal', placeholder: 'e.g., 377' },
];

const NumberConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [conversionType, setConversionType] = useState<ConversionType>('binToDec');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentConversion = conversionTypes.find(ct => ct.value === conversionType);

  useEffect(() => {
    if (!inputValue.trim()) {
      setResult('');
      setError('');
      return;
    }

    try {
      setError('');
      let convertedValue = '';
      switch (conversionType) {
        case 'binToDec':
          if (!/^[01]+$/.test(inputValue)) throw new Error('Invalid binary number');
          convertedValue = parseInt(inputValue, 2).toString(10);
          break;
        case 'decToBin':
          if (!/^\d+$/.test(inputValue)) throw new Error('Invalid decimal number');
          convertedValue = parseInt(inputValue, 10).toString(2);
          break;
        case 'decToHex':
          if (!/^\d+$/.test(inputValue)) throw new Error('Invalid decimal number');
          convertedValue = parseInt(inputValue, 10).toString(16).toUpperCase();
          break;
        case 'hexToDec':
          if (!/^[0-9A-Fa-f]+$/.test(inputValue)) throw new Error('Invalid hexadecimal number');
          convertedValue = parseInt(inputValue, 16).toString(10);
          break;
        case 'binToOct':
            if (!/^[01]+$/.test(inputValue)) throw new Error('Invalid binary number');
            convertedValue = parseInt(inputValue, 2).toString(8);
            break;
        case 'octToBin':
            if (!/^[0-7]+$/.test(inputValue)) throw new Error('Invalid octal number');
            convertedValue = parseInt(inputValue, 8).toString(2);
            break;
        case 'decToOct':
            if (!/^\d+$/.test(inputValue)) throw new Error('Invalid decimal number');
            convertedValue = parseInt(inputValue, 10).toString(8);
            break;
        case 'octToDec':
            if (!/^[0-7]+$/.test(inputValue)) throw new Error('Invalid octal number');
            convertedValue = parseInt(inputValue, 8).toString(10);
            break;
        case 'binToHex':
            if (!/^[01]+$/.test(inputValue)) throw new Error('Invalid binary number');
            convertedValue = parseInt(inputValue, 2).toString(16).toUpperCase();
            break;
        case 'hexToBin':
            if (!/^[0-9A-Fa-f]+$/.test(inputValue)) throw new Error('Invalid hexadecimal number');
            convertedValue = parseInt(inputValue, 16).toString(2);
            break;
        case 'hexToOct':
            if (!/^[0-9A-Fa-f]+$/.test(inputValue)) throw new Error('Invalid hexadecimal number');
            convertedValue = parseInt(inputValue, 16).toString(8);
            break;
        case 'octToHex':
            if (!/^[0-7]+$/.test(inputValue)) throw new Error('Invalid octal number');
            convertedValue = parseInt(inputValue, 8).toString(16).toUpperCase();
            break;
        default:
          throw new Error('Invalid conversion type');
      }
      setResult(convertedValue);
    } catch (e: any) {
      setError(e.message);
      setResult('');
    }
  }, [inputValue, conversionType]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl text-primary text-center">Number System Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select value={conversionType} onValueChange={(value) => {
          setConversionType(value as ConversionType);
          setInputValue(''); 
          setResult('');
          setError('');
        }}>
          <SelectTrigger className="w-full h-12 text-lg">
            <SelectValue placeholder="Select conversion type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">Conversion Types</SelectLabel>
              {conversionTypes.sort((a,b) => a.label.localeCompare(b.label)).map(ct => (
                <SelectItem key={ct.value} value={ct.value} className="text-lg">{ct.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={currentConversion?.placeholder || "Enter value..."}
          className={`h-16 text-2xl font-mono ${error ? 'border-destructive ring-destructive' : ''}`}
        />

        {error && <p className="text-destructive text-base text-center">{error}</p>}
        
        {result && (
          <div className="p-6 bg-primary/10 rounded-lg text-center shadow-inner">
            <p className="text-base text-muted-foreground mb-1">Hasil Konversi:</p>
            <p className="text-4xl font-mono font-bold text-primary break-all">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdvancedConverter: React.FC = () => {
    const [twosComplInput, setTwosComplInput] = useState('');
    const [twosComplBits, setTwosComplBits] = useState<string>("8");
    const [twosComplResult, setTwosComplResult] = useState<{ binary: string; twosComplement: string } | null>(null);
    const [twosComplError, setTwosComplError] = useState<string>('');

    const [floatInput, setFloatInput] = useState('');
    const [floatResult, setFloatResult] = useState<{ full: string; sign: string; exponent: string; mantissa: string } | null>(null);
    const [floatError, setFloatError] = useState<string>('');


    const calculateTwosComplement = () => {
        setTwosComplError('');
        setTwosComplResult(null);
        const num = parseInt(twosComplInput);
        const bits = parseInt(twosComplBits);

        if (twosComplInput.trim() === '') {
            setTwosComplError("Please enter a decimal number.");
            return;
        }
        if (isNaN(num)) {
            setTwosComplError("Invalid decimal number entered.");
            return;
        }
        if (isNaN(bits) || bits <= 0) {
            setTwosComplError("Please select a valid bit length.");
            return;
        }
         const maxVal = (2 ** (bits - 1)) - 1;
         const minVal = -(2 ** (bits - 1));
         if (num > maxVal || num < minVal) {
             setTwosComplError(`Number out of range for ${bits}-bit representation (${minVal} to ${maxVal}).`);
             return;
         }


        let binary = Math.abs(num).toString(2).padStart(bits, '0');
        if (binary.length > bits) binary = binary.slice(-bits); 

        if (num >= 0) {
            setTwosComplResult({ binary: binary, twosComplement: binary });
        } else {
            let inverted = '';
            for (let i = 0; i < bits; i++) inverted += (binary[i] === '0' ? '1' : '0');
            
            let carry = 1;
            let twos = '';
            for (let i = bits - 1; i >= 0; i--) {
                const sum = parseInt(inverted[i]) + carry;
                twos = (sum % 2) + twos;
                carry = Math.floor(sum / 2);
            }
            setTwosComplResult({ binary: binary, twosComplement: twos });
        }
    };

    const convertFloatToBinary = () => {
        setFloatError('');
        setFloatResult(null);
        if (floatInput.trim() === '') {
            setFloatError("Please enter a floating point number.");
            return;
        }
        const num = parseFloat(floatInput);
        if (isNaN(num)) {
            setFloatError("Invalid floating point number entered.");
            return;
        }

        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, num, false); 

        let binaryString = "";
        for (let i = 0; i < 4; i++) {
            binaryString += view.getUint8(i).toString(2).padStart(8, '0');
        }
        
        setFloatResult({
            full: binaryString,
            sign: binaryString[0],
            exponent: binaryString.substring(1, 9),
            mantissa: binaryString.substring(9)
        });
    };
    
    return (
        <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Two's Complement</CardTitle>
                    <CardDescription className="text-base">Representasi bilangan negatif dalam sistem biner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input type="number" placeholder="Enter decimal number" value={twosComplInput} onChange={e => setTwosComplInput(e.target.value)} className={`h-12 text-lg ${twosComplError ? 'border-destructive' : ''}`}/>
                    <Select value={twosComplBits} onValueChange={setTwosComplBits}>
                        <SelectTrigger className="text-lg h-12"><SelectValue placeholder="Select bit length" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="4" className="text-lg">4-bit</SelectItem>
                            <SelectItem value="8" className="text-lg">8-bit</SelectItem>
                            <SelectItem value="16" className="text-lg">16-bit</SelectItem>
                            <SelectItem value="32" className="text-lg">32-bit</SelectItem>
                        </SelectContent>
                    </Select>
                    {twosComplError && <p className="text-destructive text-sm">{twosComplError}</p>}
                    <Button onClick={calculateTwosComplement} className="w-full text-lg py-3">Calculate</Button>
                    {twosComplResult && (
                        <div className="p-3 bg-muted rounded-md text-base space-y-1 font-mono">
                            <p>Binary (|num|): {twosComplResult.binary}</p>
                            <p>Two's Complement: {twosComplResult.twosComplement}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">IEEE 754 Floating Point</CardTitle>
                    <CardDescription className="text-base">Konversi desimal floating point ke representasi biner IEEE 754 (32-bit).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input type="number" step="any" placeholder="Enter float (e.g., 3.14)" value={floatInput} onChange={e => setFloatInput(e.target.value)} className={`h-12 text-lg ${floatError ? 'border-destructive' : ''}`}/>
                    {floatError && <p className="text-destructive text-sm">{floatError}</p>}
                    <Button onClick={convertFloatToBinary} className="w-full text-lg py-3">Convert</Button>
                    {floatResult && (
                         <div className="p-3 bg-muted rounded-md text-base space-y-1 font-mono break-all">
                            <p>IEEE 754: {floatResult.full}</p>
                            <p>Sign: {floatResult.sign}</p>
                            <p>Exponent: {floatResult.exponent}</p>
                            <p>Mantissa: {floatResult.mantissa}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


const infoCardsData = [
    { title: "Binary (Basis 2)", description: "Hanya menggunakan digit 0 dan 1. Setiap posisi merepresentasikan pangkat 2." },
    { title: "Decimal (Basis 10)", description: "Sistem bilangan sehari-hari menggunakan digit 0-9." },
    { title: "Hexadecimal (Basis 16)", description: "Menggunakan 0-9 dan A-F. Populer dalam programming." },
    { title: "Octal (Basis 8)", description: "Menggunakan digit 0-7. Dulu populer di sistem UNIX." },
];

export default function ConverterPage() {
  return (
    <PageShell
      title="Number System Converter"
      subtitle="Konversi antar sistem bilangan dengan mudah dan pelajari konsep lanjut."
    >
      <NumberConverter />
      <Tabs defaultValue="info" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="info" className="text-base py-2.5">Info Sistem Bilangan</TabsTrigger>
          <TabsTrigger value="advanced" className="text-base py-2.5">Advanced Conversions</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCardsData.map(card => (
                    <Card key={card.title} className="shadow-md">
                        <CardHeader><CardTitle className="text-xl text-accent">{card.title}</CardTitle></CardHeader>
                        <CardContent><p className="text-base text-muted-foreground">{card.description}</p></CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="advanced">
            <AdvancedConverter />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
    
