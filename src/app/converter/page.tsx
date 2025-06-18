
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '@/components/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Eye } from 'lucide-react';

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

const generateManualConversionSteps = (type: ConversionType, input: string, output: string): string => {
  let steps = `Langkah-langkah konversi ${conversionTypes.find(ct => ct.value === type)?.label} dari "${input}" menjadi "${output}":\n\n`;

  switch (type) {
    case 'binToDec':
      steps += `Untuk mengonversi bilangan biner ${input} ke desimal:\n`;
      let decValue = 0;
      const binDigits = input.split('').reverse();
      binDigits.forEach((digit, index) => {
        const term = parseInt(digit) * (2 ** index);
        steps += `- Digit ${digit} (pada posisi ${index} dari kanan, dimulai dari 0) dikalikan dengan 2^${index} = ${parseInt(digit)} * ${2 ** index} = ${term}\n`;
        decValue += term;
      });
      steps += `\nTotal jumlah: ${binDigits.map((d, i) => `${parseInt(d)}*(2^${i})`).join(' + ')} = ${output}\n`;
      steps += `Jadi, ${input} (biner) = ${output} (desimal).`;
      break;

    case 'decToBin':
      steps += `Untuk mengonversi bilangan desimal ${input} ke biner:\n`;
      let numDecToBin = parseInt(input);
      if (isNaN(numDecToBin) || numDecToBin < 0) return "Input desimal tidak valid untuk konversi manual ini.";
      if (numDecToBin === 0) {
        steps += `- 0 (desimal) = 0 (biner).\n`;
        break;
      }
      const remaindersDecToBin: number[] = [];
      let currentNum = numDecToBin;
      while (currentNum > 0) {
        const remainder = currentNum % 2;
        steps += `- ${currentNum} dibagi 2 = ${Math.floor(currentNum / 2)} sisa ${remainder}\n`;
        remaindersDecToBin.push(remainder);
        currentNum = Math.floor(currentNum / 2);
      }
      steps += `\nBaca sisa dari bawah ke atas: ${remaindersDecToBin.reverse().join('')}\n`;
      steps += `Jadi, ${input} (desimal) = ${output} (biner).`;
      break;

    case 'binToHex':
      steps += `Untuk mengonversi bilangan biner ${input} ke heksadesimal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 4-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToHex = input;
      while (paddedInputBinToHex.length % 4 !== 0) {
        paddedInputBinToHex = '0' + paddedInputBinToHex;
      }
      steps += `   Input setelah padding: ${paddedInputBinToHex}\n`;
      const groupsBinToHex: string[] = [];
      for (let i = 0; i < paddedInputBinToHex.length; i += 4) {
        groupsBinToHex.push(paddedInputBinToHex.substring(i, i + 4));
      }
      steps += `   Grup 4-bit: ${groupsBinToHex.join(' | ')}\n`;
      steps += `2. Konversi setiap grup 4-bit ke nilai heksadesimalnya:\n`;
      const hexChars: string[] = [];
      groupsBinToHex.forEach(group => {
        const decVal = parseInt(group, 2);
        const hexVal = decVal.toString(16).toUpperCase();
        steps += `   - ${group} (biner) = ${decVal} (desimal) = ${hexVal} (heksadesimal)\n`;
        hexChars.push(hexVal);
      });
      steps += `\nHasil gabungan: ${hexChars.join('')}\n`;
      steps += `Jadi, ${input} (biner) = ${output} (heksadesimal).`;
      break;

    case 'hexToBin':
      steps += `Untuk mengonversi bilangan heksadesimal ${input} ke biner:\n`;
      steps += `1. Konversi setiap digit heksadesimal ke representasi biner 4-bit:\n`;
      const inputHexToBin = input.toUpperCase();
      let binResultHexToBin = "";
      for (let i = 0; i < inputHexToBin.length; i++) {
        const hexDigit = inputHexToBin[i];
        const decEquiv = parseInt(hexDigit, 16);
        const binEquiv = decEquiv.toString(2).padStart(4, '0');
        steps += `   - ${hexDigit} (heksadesimal) = ${binEquiv} (biner)\n`;
        binResultHexToBin += binEquiv;
      }
      steps += `\nGabungkan semua hasil biner: ${binResultHexToBin}\n`;
      steps += `(Opsional: hilangkan nol di depan jika ada, kecuali jika hanya '0')\n`;
      steps += `Jadi, ${input} (heksadesimal) = ${output} (biner).`;
      break;

    case 'decToHex':
      steps += `Untuk mengonversi bilangan desimal ${input} ke heksadesimal:\n`;
      let numDecToHex = parseInt(input);
      if (isNaN(numDecToHex) || numDecToHex < 0) return "Input desimal tidak valid.";
      if (numDecToHex === 0) {
          steps += `- 0 (desimal) = 0 (heksadesimal).\n`;
          break;
      }
      const remaindersDecToHex: string[] = [];
      const hexMap = "0123456789ABCDEF";
      let currentNumHex = numDecToHex;
      while (currentNumHex > 0) {
          const remainder = currentNumHex % 16;
          steps += `- ${currentNumHex} dibagi 16 = ${Math.floor(currentNumHex / 16)} sisa ${remainder} (${hexMap[remainder]})\n`;
          remaindersDecToHex.push(hexMap[remainder]);
          currentNumHex = Math.floor(currentNumHex / 16);
      }
      steps += `\nBaca sisa dari bawah ke atas: ${remaindersDecToHex.reverse().join('')}\n`;
      steps += `Jadi, ${input} (desimal) = ${output} (heksadesimal).`;
      break;

    case 'hexToDec':
      steps += `Untuk mengonversi bilangan heksadesimal ${input} ke desimal:\n`;
      let decValueHexToDec = 0;
      const hexDigits = input.toUpperCase().split('').reverse();
      hexDigits.forEach((digit, index) => {
        const val = parseInt(digit, 16);
        const term = val * (16 ** index);
        steps += `- Digit ${digit} (pada posisi ${index} dari kanan) dikalikan dengan 16^${index} = ${val} * ${16 ** index} = ${term}\n`;
        decValueHexToDec += term;
      });
      steps += `\nTotal jumlah: ${hexDigits.reverse().map((d, i, arr) => `${d}*(16^${arr.length - 1 - i})`).join(' + ')} = ${output}\n`;
      steps += `Jadi, ${input} (heksadesimal) = ${output} (desimal).`;
      break;
    
    // Octal Conversions
    case 'binToOct':
      steps += `Untuk mengonversi bilangan biner ${input} ke oktal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 3-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToOct = input;
      while (paddedInputBinToOct.length % 3 !== 0) {
        paddedInputBinToOct = '0' + paddedInputBinToOct;
      }
      if (input === "0") paddedInputBinToOct = "000"; // Handle case "0"
      else if (paddedInputBinToOct.length === 0) paddedInputBinToOct = "000"; // Handle empty input for safety
      
      steps += `   Input setelah padding: ${paddedInputBinToOct}\n`;
      const groupsBinToOct: string[] = [];
      for (let i = 0; i < paddedInputBinToOct.length; i += 3) {
        groupsBinToOct.push(paddedInputBinToOct.substring(i, i + 3));
      }
      steps += `   Grup 3-bit: ${groupsBinToOct.join(' | ')}\n`;
      steps += `2. Konversi setiap grup 3-bit ke nilai oktalnya:\n`;
      const octChars: string[] = [];
      groupsBinToOct.forEach(group => {
        const octVal = parseInt(group, 2).toString(8);
        steps += `   - ${group} (biner) = ${octVal} (oktal)\n`;
        octChars.push(octVal);
      });
      steps += `\nHasil gabungan: ${octChars.join('')}\n`;
      steps += `Jadi, ${input} (biner) = ${output} (oktal).`;
      break;

    case 'octToBin':
      steps += `Untuk mengonversi bilangan oktal ${input} ke biner:\n`;
      steps += `1. Konversi setiap digit oktal ke representasi biner 3-bit:\n`;
      let binResultOctToBin = "";
      for (let i = 0; i < input.length; i++) {
        const octDigit = input[i];
        const binEquiv = parseInt(octDigit, 8).toString(2).padStart(3, '0');
        steps += `   - ${octDigit} (oktal) = ${binEquiv} (biner)\n`;
        binResultOctToBin += binEquiv;
      }
       // Remove leading zeros, but keep '0' if that's the result
      let finalBinOutput = binResultOctToBin.replace(/^0+(?!$)/, '');
      if (finalBinOutput === "") finalBinOutput = "0"; // if all were zeros

      steps += `\nGabungkan semua hasil biner: ${binResultOctToBin}\n`;
      if (binResultOctToBin !== finalBinOutput) {
        steps += `Setelah menghilangkan nol di depan (jika ada): ${finalBinOutput}\n`;
      }
      steps += `Jadi, ${input} (oktal) = ${output} (biner).`;
      break;

    case 'decToOct':
      steps += `Untuk mengonversi bilangan desimal ${input} ke oktal:\n`;
      let numDecToOct = parseInt(input);
      if (isNaN(numDecToOct) || numDecToOct < 0) return "Input desimal tidak valid.";
      if (numDecToOct === 0) {
          steps += `- 0 (desimal) = 0 (oktal).\n`;
          break;
      }
      const remaindersDecToOct: number[] = [];
      let currentNumOct = numDecToOct;
      while (currentNumOct > 0) {
          const remainder = currentNumOct % 8;
          steps += `- ${currentNumOct} dibagi 8 = ${Math.floor(currentNumOct / 8)} sisa ${remainder}\n`;
          remaindersDecToOct.push(remainder);
          currentNumOct = Math.floor(currentNumOct / 8);
      }
      steps += `\nBaca sisa dari bawah ke atas: ${remaindersDecToOct.reverse().join('')}\n`;
      steps += `Jadi, ${input} (desimal) = ${output} (oktal).`;
      break;

    case 'octToDec':
      steps += `Untuk mengonversi bilangan oktal ${input} ke desimal:\n`;
      let decValueOctToDec = 0;
      const octDigits = input.split('').reverse();
      octDigits.forEach((digit, index) => {
        const term = parseInt(digit) * (8 ** index);
        steps += `- Digit ${digit} (pada posisi ${index} dari kanan) dikalikan dengan 8^${index} = ${parseInt(digit)} * ${8 ** index} = ${term}\n`;
        decValueOctToDec += term;
      });
      steps += `\nTotal jumlah: ${octDigits.reverse().map((d, i, arr) => `${d}*(8^${arr.length - 1 - i})`).join(' + ')} = ${output}\n`;
      steps += `Jadi, ${input} (oktal) = ${output} (desimal).`;
      break;
    
    case 'hexToOct':
      steps += `Untuk mengonversi Heksadesimal (${input}) ke Oktal (${output}):\n`;
      steps += `Langkah 1: Konversi Heksadesimal ke Biner.\n`;
      let tempBin_hexToOct = "";
      for (let i = 0; i < input.length; i++) {
        tempBin_hexToOct += parseInt(input[i], 16).toString(2).padStart(4, '0');
      }
      tempBin_hexToOct = tempBin_hexToOct.replace(/^0+(?!$)/, '') || "0";
      steps += `  ${input} (hex) = ${tempBin_hexToOct} (biner)\n\n`;
      steps += `Langkah 2: Konversi Biner (${tempBin_hexToOct}) ke Oktal.\n`;
      let paddedTempBin_hexToOct = tempBin_hexToOct;
      while (paddedTempBin_hexToOct.length % 3 !== 0) {
        paddedTempBin_hexToOct = '0' + paddedTempBin_hexToOct;
      }
      if (tempBin_hexToOct === "0") paddedTempBin_hexToOct = "000";
      else if (paddedTempBin_hexToOct.length === 0) paddedTempBin_hexToOct = "000";
      
      let tempOct_hexToOct = "";
      for (let i = 0; i < paddedTempBin_hexToOct.length; i += 3) {
        tempOct_hexToOct += parseInt(paddedTempBin_hexToOct.substring(i, i+3), 2).toString(8);
      }
      steps += `  Kelompokkan biner menjadi 3-bit: ${paddedTempBin_hexToOct.match(/.{1,3}/g)?.join(' | ')}\n`;
      steps += `  Konversi tiap grup: ${tempOct_hexToOct}\n`;
      steps += `Jadi, ${input} (heksadesimal) = ${output} (oktal).`;
      break;

    case 'octToHex':
      steps += `Untuk mengonversi Oktal (${input}) ke Heksadesimal (${output}):\n`;
      steps += `Langkah 1: Konversi Oktal ke Biner.\n`;
      let tempBin_octToHex = "";
      for (let i = 0; i < input.length; i++) {
        tempBin_octToHex += parseInt(input[i], 8).toString(2).padStart(3, '0');
      }
      tempBin_octToHex = tempBin_octToHex.replace(/^0+(?!$)/, '') || "0";
      steps += `  ${input} (oktal) = ${tempBin_octToHex} (biner)\n\n`;
      steps += `Langkah 2: Konversi Biner (${tempBin_octToHex}) ke Heksadesimal.\n`;
      let paddedTempBin_octToHex = tempBin_octToHex;
      while (paddedTempBin_octToHex.length % 4 !== 0) {
        paddedTempBin_octToHex = '0' + paddedTempBin_octToHex;
      }
       if (tempBin_octToHex === "0") paddedTempBin_octToHex = "0000";
       else if (paddedTempBin_octToHex.length === 0) paddedTempBin_octToHex = "0000";

      let tempHex_octToHex = "";
      for (let i = 0; i < paddedTempBin_octToHex.length; i += 4) {
        tempHex_octToHex += parseInt(paddedTempBin_octToHex.substring(i, i+4), 2).toString(16).toUpperCase();
      }
      steps += `  Kelompokkan biner menjadi 4-bit: ${paddedTempBin_octToHex.match(/.{1,4}/g)?.join(' | ')}\n`;
      steps += `  Konversi tiap grup: ${tempHex_octToHex}\n`;
      steps += `Jadi, ${input} (oktal) = ${output} (heksadesimal).`;
      break;

    default:
      steps += 'Langkah-langkah manual untuk konversi ini belum tersedia.';
  }
  return steps;
};


const NumberConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [conversionType, setConversionType] = useState<ConversionType>('binToDec');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showManualSteps, setShowManualSteps] = useState<boolean>(false);
  const [manualStepsContent, setManualStepsContent] = useState<string>('');

  const currentConversion = conversionTypes.find(ct => ct.value === conversionType);

  const performConversion = useCallback(() => {
    if (!inputValue.trim()) {
      setResult('');
      setError('');
      setManualStepsContent('');
      setShowManualSteps(false);
      return;
    }

    try {
      setError('');
      setShowManualSteps(false); 
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
            const binFromHex = parseInt(inputValue, 16).toString(2);
            convertedValue = parseInt(binFromHex, 2).toString(8);
            break;
        case 'octToHex':
            if (!/^[0-7]+$/.test(inputValue)) throw new Error('Invalid octal number');
            const binFromOct = parseInt(inputValue, 8).toString(2);
            convertedValue = parseInt(binFromOct, 2).toString(16).toUpperCase();
            break;
        default:
          throw new Error('Invalid conversion type');
      }
      setResult(convertedValue);
      setManualStepsContent(generateManualConversionSteps(conversionType, inputValue, convertedValue));
    } catch (e: any) {
      setError(e.message);
      setResult('');
      setManualStepsContent('');
    }
  }, [inputValue, conversionType]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

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
          setManualStepsContent('');
          setShowManualSteps(false);
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
        
        {result && !error && (
          <div className="p-6 bg-primary/10 rounded-lg text-center shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <p className="text-base text-muted-foreground mb-1">Hasil Konversi:</p>
            </div>
            <div className="flex items-center justify-center gap-x-3">
                <p className="text-4xl font-mono font-bold text-primary break-all">{result}</p>
                <Button variant="ghost" size="icon" onClick={() => setShowManualSteps(prev => !prev)} title="Tampilkan/Sembunyikan Langkah Manual" className="text-primary hover:text-accent">
                    <Eye className="h-7 w-7" />
                </Button>
            </div>
          </div>
        )}
        {showManualSteps && manualStepsContent && !error && (
            <Card className="mt-4 shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl text-accent">Langkah Konversi Manual</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-md overflow-x-auto">{manualStepsContent}</pre>
                </CardContent>
            </Card>
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
    
