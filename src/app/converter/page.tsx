
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
  const sanitizedInput = input.trim();
  if (sanitizedInput === "") return "Input kosong, tidak ada langkah konversi.";

  switch (type) {
    case 'binToDec':
      if (!/^[01]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan biner yang valid.`;
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke desimal:\n`;
      steps += `1. Setiap digit biner dikalikan dengan 2 pangkat posisinya (dimulai dari 0 dari kanan).\n`;
      steps += `   Input Biner: ${sanitizedInput}\n\n`;
      let decValue = 0;
      const binDigits = sanitizedInput.split(''); // Keep original order for display
      const reversedBinDigits = [...binDigits].reverse(); // For calculation
      let calculationSteps = [];

      reversedBinDigits.forEach((digit, index) => {
        const term = parseInt(digit) * (2 ** index);
        steps += `   - Digit '${digit}' (pada posisi ${index} dari kanan) dikalikan dengan 2^${index}:\n`;
        steps += `     ${digit} * ${2 ** index} = ${digit} * ${Math.pow(2,index)} = ${term}\n`;
        decValue += term;
        calculationSteps.push(`${digit} × 2^${index}`);
      });
      steps += `\n2. Jumlahkan semua hasil perkalian:\n`;
      steps += `   ${calculationSteps.join(' + ')} = ${output}\n`;
      steps += `\nJadi, ${sanitizedInput} (biner) = ${output} (desimal).`;
      break;

    case 'decToBin':
      let numDecToBin = parseInt(sanitizedInput);
      if (isNaN(numDecToBin) || numDecToBin < 0) return `Input "${sanitizedInput}" bukan desimal non-negatif yang valid.`;
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke biner:\n`;
      steps += `1. Bagi bilangan desimal dengan 2 secara berulang hingga hasil bagi adalah 0.\n`;
      steps += `2. Catat sisa dari setiap pembagian.\n`;
      steps += `3. Urutan biner adalah sisa pembagian dibaca dari bawah ke atas (sisa terakhir ke sisa pertama).\n\n`;
      if (numDecToBin === 0) {
        steps += `   - ${sanitizedInput} (desimal) langsung dikonversi menjadi 0 (biner).\n`;
        steps += `\nJadi, ${sanitizedInput} (desimal) = 0 (biner).`;
        break;
      }
      const remaindersDecToBin: number[] = [];
      let currentNum = numDecToBin;
      let stepCounter = 1;
      while (currentNum > 0) {
        const remainder = currentNum % 2;
        const quotient = Math.floor(currentNum / 2);
        steps += `   Langkah ${stepCounter}: ${currentNum} ÷ 2 = ${quotient}, Sisa = ${remainder}\n`;
        remaindersDecToBin.push(remainder);
        currentNum = quotient;
        stepCounter++;
      }
      steps += `\n4. Baca semua sisa dari yang terakhir (paling bawah) ke yang pertama (paling atas):\n`;
      steps += `   Sisa (dari bawah ke atas): ${remaindersDecToBin.slice().reverse().join('')}\n`;
      steps += `\nJadi, ${sanitizedInput} (desimal) = ${output} (biner).`;
      break;

    case 'hexToBin':
      if (!/^[0-9A-Fa-f]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan heksadesimal yang valid.`;
      steps += `Untuk mengonversi bilangan heksadesimal ${sanitizedInput.toUpperCase()} ke biner:\n`;
      steps += `1. Setiap digit heksadesimal dikonversi menjadi representasi biner 4-bit.\n\n`;
      const inputHexToBin = sanitizedInput.toUpperCase();
      let binResultHexToBin = "";
      for (let i = 0; i < inputHexToBin.length; i++) {
        const hexDigit = inputHexToBin[i];
        const decEquiv = parseInt(hexDigit, 16);
        const binEquiv = decEquiv.toString(2).padStart(4, '0');
        steps += `   - Digit heksadesimal '${hexDigit}':\n`;
        steps += `     Nilai desimalnya adalah ${decEquiv}.\n`;
        steps += `     ${decEquiv} (desimal) dikonversi ke biner 4-bit menjadi ${binEquiv}.\n`;
        steps += `     Jadi, '${hexDigit}' (heksadesimal) = ${binEquiv} (biner).\n\n`;
        binResultHexToBin += binEquiv;
      }
      steps += `2. Gabungkan semua hasil biner 4-bit tersebut:\n`;
      steps += `   ${inputHexToBin.split('').map(d => parseInt(d,16).toString(2).padStart(4,'0')).join(' ')} = ${binResultHexToBin}\n`;
      
      let finalOutputHexToBin = binResultHexToBin.replace(/^0+(?!$)/, '');
      if (finalOutputHexToBin === "") finalOutputHexToBin = "0"; // Handle case like input "0" or "00"

      if (binResultHexToBin !== finalOutputHexToBin && sanitizedInput !== "0") {
          steps += `3. (Opsional) Hilangkan nol di bagian paling kiri (leading zeros), kecuali jika hasilnya hanya "0":\n`;
          steps += `   Hasil akhir: ${finalOutputHexToBin}\n`;
      }
      steps += `\nJadi, ${inputHexToBin} (heksadesimal) = ${finalOutputHexToBin} (biner).`;
      // Ensure the 'output' parameter matches finalOutputHexToBin if steps are shown
      // This is a bit tricky as 'output' is from the main conversion logic.
      // For consistency, if we show steps, we should show the result from these steps.
      // However, the prompt asks to use 'output' parameter.
      // The main conversion should already produce the correct finalOutputHexToBin.
      break;

    case 'octToBin':
      if (!/^[0-7]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan oktal yang valid.`;
      steps += `Untuk mengonversi bilangan oktal ${sanitizedInput} ke biner:\n`;
      steps += `1. Setiap digit oktal dikonversi menjadi representasi biner 3-bit.\n\n`;
      let binResultOctToBin = "";
      for (let i = 0; i < sanitizedInput.length; i++) {
        const octDigit = sanitizedInput[i];
        const binEquiv = parseInt(octDigit, 8).toString(2).padStart(3, '0');
        steps += `   - Digit oktal '${octDigit}':\n`;
        steps += `     Dikonversi ke biner 3-bit menjadi ${binEquiv}.\n`;
        steps += `     Jadi, '${octDigit}' (oktal) = ${binEquiv} (biner).\n\n`;
        binResultOctToBin += binEquiv;
      }
      steps += `2. Gabungkan semua hasil biner 3-bit tersebut:\n`;
      steps += `   ${sanitizedInput.split('').map(d => parseInt(d,8).toString(2).padStart(3,'0')).join(' ')} = ${binResultOctToBin}\n`;

      let finalOutputOctToBin = binResultOctToBin.replace(/^0+(?!$)/, '');
      if (finalOutputOctToBin === "") finalOutputOctToBin = "0";

      if (binResultOctToBin !== finalOutputOctToBin && sanitizedInput !== "0") {
          steps += `3. (Opsional) Hilangkan nol di bagian paling kiri (leading zeros), kecuali jika hasilnya hanya "0":\n`;
          steps += `   Hasil akhir: ${finalOutputOctToBin}\n`;
      }
      steps += `\nJadi, ${sanitizedInput} (oktal) = ${finalOutputOctToBin} (biner).`;
      break;

    // --- Fallback for other conversions (existing logic or simplified) ---
    case 'binToHex':
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke heksadesimal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 4-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToHex = sanitizedInput;
      while (paddedInputBinToHex.length % 4 !== 0) {
        paddedInputBinToHex = '0' + paddedInputBinToHex;
      }
      if (sanitizedInput === "0") paddedInputBinToHex = "0000";
      else if (paddedInputBinToHex.length === 0) paddedInputBinToHex = "0000";

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
      steps += `Jadi, ${sanitizedInput} (biner) = ${output} (heksadesimal).`;
      break;
      
    case 'decToHex':
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke heksadesimal:\n`;
      let numDecToHex = parseInt(sanitizedInput);
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
          steps += `- ${currentNumHex} dibagi 16 = ${Math.floor(currentNumHex / 16)} sisa ${remainder} (Heks: ${hexMap[remainder]})\n`;
          remaindersDecToHex.push(hexMap[remainder]);
          currentNumHex = Math.floor(currentNumHex / 16);
      }
      steps += `\nBaca sisa dari bawah ke atas: ${remaindersDecToHex.reverse().join('')}\n`;
      steps += `Jadi, ${sanitizedInput} (desimal) = ${output} (heksadesimal).`;
      break;

    case 'hexToDec':
      steps += `Untuk mengonversi bilangan heksadesimal ${sanitizedInput.toUpperCase()} ke desimal:\n`;
      let decValueHexToDec = 0;
      const hexDigits = sanitizedInput.toUpperCase().split('').reverse();
      hexDigits.forEach((digit, index) => {
        const val = parseInt(digit, 16);
        const term = val * (16 ** index);
        steps += `- Digit '${digit}' (nilai desimal: ${val}) pada posisi ${index} (dari kanan) dikalikan dengan 16^${index}:\n`;
        steps += `  ${val} * ${16 ** index} = ${term}\n`;
        decValueHexToDec += term;
      });
      steps += `\nTotal jumlah: ${hexDigits.reverse().map((d, i, arr) => `${d}×(16^${arr.length - 1 - i})`).join(' + ')} = ${output}\n`;
      steps += `Jadi, ${sanitizedInput.toUpperCase()} (heksadesimal) = ${output} (desimal).`;
      break;
    
    case 'binToOct':
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke oktal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 3-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToOct = sanitizedInput;
      while (paddedInputBinToOct.length % 3 !== 0) {
        paddedInputBinToOct = '0' + paddedInputBinToOct;
      }
      if (sanitizedInput === "0") paddedInputBinToOct = "000";
      else if (paddedInputBinToOct.length === 0) paddedInputBinToOct = "000";
      
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
      steps += `Jadi, ${sanitizedInput} (biner) = ${output} (oktal).`;
      break;

    case 'decToOct':
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke oktal:\n`;
      let numDecToOct = parseInt(sanitizedInput);
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
      steps += `Jadi, ${sanitizedInput} (desimal) = ${output} (oktal).`;
      break;

    case 'octToDec':
      steps += `Untuk mengonversi bilangan oktal ${sanitizedInput} ke desimal:\n`;
      let decValueOctToDec = 0;
      const octDigits = sanitizedInput.split('').reverse();
      octDigits.forEach((digit, index) => {
        const term = parseInt(digit) * (8 ** index);
        steps += `- Digit '${digit}' pada posisi ${index} (dari kanan) dikalikan dengan 8^${index}:\n`;
        steps += `  ${digit} * ${8 ** index} = ${term}\n`;
        decValueOctToDec += term;
      });
      steps += `\nTotal jumlah: ${octDigits.reverse().map((d, i, arr) => `${d}×(8^${arr.length - 1 - i})`).join(' + ')} = ${output}\n`;
      steps += `Jadi, ${sanitizedInput} (oktal) = ${output} (desimal).`;
      break;
    
    case 'hexToOct':
      steps += `Untuk mengonversi Heksadesimal (${sanitizedInput.toUpperCase()}) ke Oktal (${output}):\n`;
      steps += `Ini adalah konversi dua tahap: Heksadesimal → Biner → Oktal.\n\n`;
      steps += `Langkah 1: Konversi Heksadesimal ke Biner (setiap digit hex ke 4-bit biner).\n`;
      let tempBin_hexToOct = "";
      for (let i = 0; i < sanitizedInput.length; i++) {
        const binPart = parseInt(sanitizedInput[i], 16).toString(2).padStart(4, '0');
        steps += `  Digit '${sanitizedInput[i].toUpperCase()}' (hex) = ${binPart} (biner)\n`;
        tempBin_hexToOct += binPart;
      }
      tempBin_hexToOct = tempBin_hexToOct.replace(/^0+(?!$)/, '') || "0";
      steps += `  Hasil biner gabungan: ${tempBin_hexToOct}\n\n`;
      steps += `Langkah 2: Konversi Biner (${tempBin_hexToOct}) ke Oktal (kelompokkan biner jadi 3-bit dari kanan).\n`;
      let paddedTempBin_hexToOct = tempBin_hexToOct;
      while (paddedTempBin_hexToOct.length % 3 !== 0) {
        paddedTempBin_hexToOct = '0' + paddedTempBin_hexToOct;
      }
      if (tempBin_hexToOct === "0") paddedTempBin_hexToOct = "000"; // Handle "0"
      else if (paddedTempBin_hexToOct.length === 0 && tempBin_hexToOct!=="0") paddedTempBin_hexToOct = "000"; // Should not happen if input is valid hex
      
      let tempOct_hexToOct = "";
      const binGroups = [];
      for (let i = 0; i < paddedTempBin_hexToOct.length; i += 3) {
        const group = paddedTempBin_hexToOct.substring(i, i+3);
        binGroups.push(group);
        tempOct_hexToOct += parseInt(group, 2).toString(8);
      }
      steps += `  Biner setelah padding (jika perlu): ${paddedTempBin_hexToOct}\n`;
      steps += `  Kelompokkan biner menjadi 3-bit: ${binGroups.join(' | ')}\n`;
      binGroups.forEach(group => {
        steps += `    Grup '${group}' (biner) = ${parseInt(group, 2).toString(8)} (oktal)\n`;
      });
      steps += `  Hasil oktal gabungan: ${tempOct_hexToOct}\n`;
      steps += `\nJadi, ${sanitizedInput.toUpperCase()} (heksadesimal) = ${output} (oktal).`;
      break;

    case 'octToHex':
      steps += `Untuk mengonversi Oktal (${sanitizedInput}) ke Heksadesimal (${output.toUpperCase()}):\n`;
      steps += `Ini adalah konversi dua tahap: Oktal → Biner → Heksadesimal.\n\n`;
      steps += `Langkah 1: Konversi Oktal ke Biner (setiap digit oktal ke 3-bit biner).\n`;
      let tempBin_octToHex = "";
      for (let i = 0; i < sanitizedInput.length; i++) {
         const binPart = parseInt(sanitizedInput[i], 8).toString(2).padStart(3, '0');
        steps += `  Digit '${sanitizedInput[i]}' (oktal) = ${binPart} (biner)\n`;
        tempBin_octToHex += binPart;
      }
      tempBin_octToHex = tempBin_octToHex.replace(/^0+(?!$)/, '') || "0";
      steps += `  Hasil biner gabungan: ${tempBin_octToHex}\n\n`;
      steps += `Langkah 2: Konversi Biner (${tempBin_octToHex}) ke Heksadesimal (kelompokkan biner jadi 4-bit dari kanan).\n`;
      let paddedTempBin_octToHex = tempBin_octToHex;
      while (paddedTempBin_octToHex.length % 4 !== 0) {
        paddedTempBin_octToHex = '0' + paddedTempBin_octToHex;
      }
       if (tempBin_octToHex === "0") paddedTempBin_octToHex = "0000";
       else if (paddedTempBin_octToHex.length === 0 && tempBin_octToHex !== "0") paddedTempBin_octToHex = "0000";

      let tempHex_octToHex = "";
      const binGroupsHex = [];
      for (let i = 0; i < paddedTempBin_octToHex.length; i += 4) {
        const group = paddedTempBin_octToHex.substring(i, i+4);
        binGroupsHex.push(group);
        tempHex_octToHex += parseInt(group, 2).toString(16).toUpperCase();
      }
      steps += `  Biner setelah padding (jika perlu): ${paddedTempBin_octToHex}\n`;
      steps += `  Kelompokkan biner menjadi 4-bit: ${binGroupsHex.join(' | ')}\n`;
      binGroupsHex.forEach(group => {
        steps += `    Grup '${group}' (biner) = ${parseInt(group, 2).toString(16).toUpperCase()} (heksadesimal)\n`;
      });
      steps += `  Hasil heksadesimal gabungan: ${tempHex_octToHex}\n`;
      steps += `\nJadi, ${sanitizedInput} (oktal) = ${output.toUpperCase()} (heksadesimal).`;
      break;

    default:
      steps += 'Langkah-langkah manual detail untuk konversi spesifik ini belum tersedia secara rinci di sini, namun prinsip umumnya adalah mengubah ke basis 10 (desimal) atau basis 2 (biner) sebagai perantara jika diperlukan.';
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
      // Don't hide manual steps here automatically, let user control it via eye icon.
      // setShowManualSteps(false); 
      let convertedValue = '';
      const currentInputVal = inputValue.trim(); // Use trimmed value for conversion
      switch (conversionType) {
        case 'binToDec':
          if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
          convertedValue = parseInt(currentInputVal, 2).toString(10);
          break;
        case 'decToBin':
          if (!/^\d+$/.test(currentInputVal)) throw new Error('Input desimal tidak valid (hanya angka).');
          if (parseInt(currentInputVal, 10) < 0) throw new Error('Input desimal harus non-negatif.');
          convertedValue = parseInt(currentInputVal, 10).toString(2);
          break;
        case 'decToHex':
          if (!/^\d+$/.test(currentInputVal)) throw new Error('Input desimal tidak valid (hanya angka).');
          if (parseInt(currentInputVal, 10) < 0) throw new Error('Input desimal harus non-negatif.');
          convertedValue = parseInt(currentInputVal, 10).toString(16).toUpperCase();
          break;
        case 'hexToDec':
          if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
          convertedValue = parseInt(currentInputVal, 16).toString(10);
          break;
        case 'binToOct':
            if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
            convertedValue = parseInt(currentInputVal, 2).toString(8);
            break;
        case 'octToBin':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            convertedValue = parseInt(currentInputVal, 8).toString(2);
            break;
        case 'decToOct':
            if (!/^\d+$/.test(currentInputVal)) throw new Error('Input desimal tidak valid (hanya angka).');
            if (parseInt(currentInputVal, 10) < 0) throw new Error('Input desimal harus non-negatif.');
            convertedValue = parseInt(currentInputVal, 10).toString(8);
            break;
        case 'octToDec':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            convertedValue = parseInt(currentInputVal, 8).toString(10);
            break;
        case 'binToHex':
            if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
            convertedValue = parseInt(currentInputVal, 2).toString(16).toUpperCase();
            break;
        case 'hexToBin':
            if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
            // Ensure leading zeros are handled correctly by main conversion if it's simpler
            // The generateManualConversionSteps will detail the process with padding
            let binFromHexVal = parseInt(currentInputVal, 16).toString(2);
            // The step-by-step might show 0000 for "0", but parseInt("0",16).toString(2) is "0"
            // So, ensure consistency if the input was "0"
            if (currentInputVal.match(/^0+$/)) binFromHexVal = "0";
            convertedValue = binFromHexVal;
            break;
        case 'hexToOct':
            if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
            const binFromHexForOct = parseInt(currentInputVal, 16).toString(2);
            convertedValue = parseInt(binFromHexForOct, 2).toString(8);
            break;
        case 'octToHex':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            const binFromOctForHex = parseInt(currentInputVal, 8).toString(2);
            convertedValue = parseInt(binFromOctForHex, 2).toString(16).toUpperCase();
            break;
        default:
          throw new Error('Tipe konversi tidak valid.');
      }
      setResult(convertedValue);
      // Generate manual steps using the original non-trimmed inputValue for display in steps, but use currentInputVal for internal calcs in steps
      setManualStepsContent(generateManualConversionSteps(conversionType, inputValue.trim(), convertedValue));
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan konversi.");
      setResult('');
      setManualStepsContent('');
      setShowManualSteps(false); // Hide steps on error
    }
  }, [inputValue, conversionType]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  const handleConversionTypeChange = (value: ConversionType) => {
    setConversionType(value);
    // setInputValue(''); // Keep input value if user wants to convert same number to different base
    setResult('');
    setError('');
    setManualStepsContent('');
    setShowManualSteps(false); // Reset visibility on type change
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Reset visibility on input change, conversion will re-evaluate and re-populate steps
    setShowManualSteps(false); 
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl text-primary text-center">Number System Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select value={conversionType} onValueChange={handleConversionTypeChange}>
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
          onChange={handleInputChange}
          placeholder={currentConversion?.placeholder || "Enter value..."}
          className={`h-16 text-2xl font-mono ${error ? 'border-destructive ring-destructive' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? "conversion-error" : undefined}
        />

        {error && <p id="conversion-error" className="text-destructive text-base text-center">{error}</p>}
        
        {result && !error && (
          <div className="p-6 bg-primary/10 rounded-lg text-center shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <p className="text-base text-muted-foreground mb-1">Hasil Konversi:</p>
            </div>
            <div className="flex items-center justify-center gap-x-3">
                <p className="text-4xl font-mono font-bold text-primary break-all">{result}</p>
                {manualStepsContent && (
                    <Button variant="ghost" size="icon" onClick={() => setShowManualSteps(prev => !prev)} title="Tampilkan/Sembunyikan Langkah Manual" className="text-primary hover:text-accent" aria-expanded={showManualSteps}>
                        <Eye className="h-7 w-7" />
                    </Button>
                )}
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
            // Invert bits
            let inverted = '';
            for (let i = 0; i < bits; i++) inverted += (binary[i] === '0' ? '1' : '0');
            
            // Add 1
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

        // Using ArrayBuffer and DataView to get IEEE 754 representation
        const buffer = new ArrayBuffer(4); // 32-bit float
        const view = new DataView(buffer);
        view.setFloat32(0, num, false); // false for big-endian

        let binaryString = "";
        for (let i = 0; i < 4; i++) { // 4 bytes for 32-bit
            binaryString += view.getUint8(i).toString(2).padStart(8, '0');
        }
        
        setFloatResult({
            full: binaryString,
            sign: binaryString[0],
            exponent: binaryString.substring(1, 9), // Next 8 bits
            mantissa: binaryString.substring(9)   // Remaining 23 bits
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
                            <p>IEEE 754 (32-bit): {floatResult.full}</p>
                            <p>Sign (1 bit): {floatResult.sign}</p>
                            <p>Exponent (8 bits): {floatResult.exponent}</p>
                            <p>Mantissa (23 bits): {floatResult.mantissa}</p>
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
    

