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

  let tipsAndTable = "\n\n---\n\nTips & Tabel Referensi:\n";

  switch (type) {
    case 'binToDec':
      if (!/^[01]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan biner yang valid.`;
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke desimal:\n`;
      steps += `1. Tuliskan bilangan biner: ${sanitizedInput}\n`;
      steps += `2. Kalikan setiap digit biner dengan 2 pangkat posisinya. Posisi dihitung dari kanan ke kiri, dimulai dari 0.\n`;
      let decValueBinToDec = 0;
      const binDigitsForDec = sanitizedInput.split('');
      const reversedBinDigitsForDec = [...binDigitsForDec].reverse();
      let calculationStepsBinToDec = [];
      reversedBinDigitsForDec.forEach((digit, index) => {
        const term = parseInt(digit) * (2 ** index);
        steps += `   - Digit '${digit}' (paling kanan ke-${index + 1}, posisi ${index}): ${digit} × 2^${index} = ${digit} × ${Math.pow(2, index)} = ${term}\n`;
        decValueBinToDec += term;
        calculationStepsBinToDec.push(`${digit}×2^${index}`);
      });
      steps += `\n3. Jumlahkan semua hasil perkalian:\n`;
      steps += `   ${calculationStepsBinToDec.join(' + ')}\n`;
      steps += `   = ${decValueBinToDec}\n`;
      steps += `\nJadi, ${sanitizedInput} (biner) = ${output} (desimal).`;
      tipsAndTable += `
Tips:
- Setiap digit biner dikalikan dengan 2 pangkat posisinya, dimulai dari 0 di paling kanan.
- Jumlahkan semua hasil perkalian untuk mendapatkan nilai desimal.

Tabel Singkat (Posisi dan Pangkat 2):
Posisi (dari kanan):  7    6    5    4    3    2    1    0
Nilai Pangkat 2:    128   64   32   16    8    4    2    1
Contoh untuk 1010: (0×2^0) + (1×2^1) + (0×2^2) + (1×2^3) = 0 + 2 + 0 + 8 = 10
`;
      break;

    case 'decToBin':
      let numDecToBin = parseInt(sanitizedInput);
      if (isNaN(numDecToBin) || numDecToBin < 0) return `Input "${sanitizedInput}" bukan desimal non-negatif yang valid.`;
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke biner:\n`;
      steps += `1. Bagi bilangan desimal dengan 2 secara berulang sampai hasil bagi adalah 0.\n`;
      steps += `2. Catat sisa dari setiap pembagian (sisa akan selalu 0 atau 1).\n`;
      if (numDecToBin === 0) {
        steps += `   - ${sanitizedInput} (desimal) langsung dikonversi menjadi 0 (biner).\n`;
        steps += `\nJadi, ${sanitizedInput} (desimal) = 0 (biner).`;
      } else {
        const remaindersDecToBin: number[] = [];
        let currentNumDecToBin = numDecToBin;
        let stepCounterDecToBin = 1;
        while (currentNumDecToBin > 0) {
          const remainder = currentNumDecToBin % 2;
          const quotient = Math.floor(currentNumDecToBin / 2);
          steps += `   Langkah ${stepCounterDecToBin}: ${currentNumDecToBin} ÷ 2 = ${quotient}, Sisa = ${remainder}\n`;
          remaindersDecToBin.push(remainder);
          currentNumDecToBin = quotient;
          stepCounterDecToBin++;
        }
        steps += `\n3. Tuliskan semua sisa pembagian dari yang terakhir (paling bawah) ke yang pertama (paling atas).\n`;
        steps += `   Sisa (dari bawah ke atas): ${remaindersDecToBin.slice().reverse().join('')}\n`;
        steps += `\nJadi, ${sanitizedInput} (desimal) = ${output} (biner).`;
      }
      tipsAndTable += `
Tips:
- Bagi bilangan desimal dengan 2 secara berulang hingga hasil bagi adalah 0.
- Catat sisa pembagian (0 atau 1) dari setiap langkah.
- Hasil biner adalah urutan sisa pembagian dibaca dari bawah ke atas.

Tabel Singkat (Desimal ke Biner):
Desimal   Biner (min. 4-bit)
0         0000
1         0001
2         0010
3         0011
4         0100
5         0101
6         0110
7         0111
8         1000
9         1001
10        1010
...       ...
15        1111
`;
      break;

    case 'binToHex':
      if (!/^[01]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan biner yang valid.`;
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke heksadesimal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 4-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToHex = sanitizedInput;
      if (sanitizedInput.length === 0) paddedInputBinToHex = "0000";
      else {
          while (paddedInputBinToHex.length % 4 !== 0) {
            paddedInputBinToHex = '0' + paddedInputBinToHex;
          }
      }
      if (sanitizedInput === "0" && paddedInputBinToHex !== "0000") paddedInputBinToHex = "0000";

      steps += `   Input setelah padding: ${paddedInputBinToHex}\n`;
      const groupsBinToHex: string[] = [];
      for (let i = 0; i < paddedInputBinToHex.length; i += 4) {
        groupsBinToHex.push(paddedInputBinToHex.substring(i, i + 4));
      }
      steps += `   Grup 4-bit: ${groupsBinToHex.join(' | ')}\n`;
      steps += `2. Konversi setiap grup 4-bit ke nilai heksadesimalnya (0-9, A-F):\n`;
      const hexChars: string[] = [];
      groupsBinToHex.forEach(group => {
        const decVal = parseInt(group, 2);
        const hexVal = decVal.toString(16).toUpperCase();
        steps += `   - ${group} (biner) = ${decVal} (desimal) = ${hexVal} (heksadesimal)\n`;
        hexChars.push(hexVal);
      });
      let finalHexOutput = hexChars.join('');
      if (finalHexOutput === "" && sanitizedInput === "0") finalHexOutput = "0";
      else if (finalHexOutput === "") finalHexOutput = "0"; 

      steps += `\n3. Gabungkan hasil heksadesimal:\n`;
      steps += `   Hasil: ${finalHexOutput}\n`;
      steps += `\nJadi, ${sanitizedInput} (biner) = ${output} (heksadesimal).`;
      tipsAndTable += `
Tips:
- Kelompokkan bit biner menjadi grup 4-bit dari kanan. Tambahkan nol ('0') di kiri jika perlu.
- Setiap grup 4-bit biner dikonversi menjadi satu digit heksadesimal.

Tabel Singkat (Biner ke Heksadesimal):
Biner (4-bit)  Heksadesimal  Desimal
0000           0             0
0001           1             1
0010           2             2
0011           3             3
0100           4             4
0101           5             5
0110           6             6
0111           7             7
1000           8             8
1001           9             9
1010           A             10
1011           B             11
1100           C             12
1101           D             13
1110           E             14
1111           F             15
`;
      break;
      
    case 'decToHex':
      let numDecToHex = parseInt(sanitizedInput);
      if (isNaN(numDecToHex) || numDecToHex < 0) return `Input "${sanitizedInput}" bukan desimal non-negatif yang valid.`;
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke heksadesimal:\n`;
      steps += `1. Bagi bilangan desimal dengan 16 secara berulang sampai hasil bagi adalah 0.\n`;
      steps += `2. Catat sisa dari setiap pembagian. Konversi sisa 10-15 ke A-F.\n`;
      if (numDecToHex === 0) {
          steps += `   - ${sanitizedInput} (desimal) langsung dikonversi menjadi 0 (heksadesimal).\n`;
          steps += `\nJadi, ${sanitizedInput} (desimal) = 0 (heksadesimal).`;
      } else {
        const hexMap = "0123456789ABCDEF";
        const remaindersDecToHex: string[] = [];
        let currentNumHex = numDecToHex;
        let stepCounterHex = 1;
        while (currentNumHex > 0) {
            const remainder = currentNumHex % 16;
            const quotient = Math.floor(currentNumHex / 16);
            steps += `   Langkah ${stepCounterHex}: ${currentNumHex} ÷ 16 = ${quotient}, Sisa = ${remainder} (Heks: ${hexMap[remainder]})\n`;
            remaindersDecToHex.push(hexMap[remainder]);
            currentNumHex = quotient;
            stepCounterHex++;
        }
        steps += `\n3. Tuliskan semua sisa (dalam bentuk heksadesimal) dari yang terakhir ke yang pertama.\n`;
        steps += `   Sisa (dari bawah ke atas): ${remaindersDecToHex.slice().reverse().join('')}\n`;
        steps += `\nJadi, ${sanitizedInput} (desimal) = ${output} (heksadesimal).`;
      }
      tipsAndTable += `
Tips:
- Bagi bilangan desimal dengan 16 secara berulang hingga hasil bagi 0.
- Catat sisa pembagian (0-15). Untuk sisa 10-15, gunakan A-F.
- Hasil heksadesimal adalah urutan sisa (dalam bentuk heksadesimal) dibaca dari bawah ke atas.

Tabel Singkat (Sisa Desimal ke Heksadesimal):
Desimal Sisa   Heksadesimal
0 - 9          0 - 9
10             A
11             B
12             C
13             D
14             E
15             F
`;
      break;

    case 'hexToDec':
      if (!/^[0-9A-Fa-f]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan heksadesimal yang valid.`;
      steps += `Untuk mengonversi bilangan heksadesimal ${sanitizedInput.toUpperCase()} ke desimal:\n`;
      steps += `1. Tuliskan bilangan heksadesimal: ${sanitizedInput.toUpperCase()}\n`;
      steps += `2. Kalikan setiap digit heksadesimal (ubah A-F ke 10-15) dengan 16 pangkat posisinya (dari kanan, mulai dari 0).\n`;
      let decValueHexToDec = 0;
      const hexDigits = sanitizedInput.toUpperCase().split('');
      const reversedHexDigits = [...hexDigits].reverse();
      let calculationStepsHexToDec = [];
      reversedHexDigits.forEach((digit, index) => {
        const val = parseInt(digit, 16);
        const term = val * (16 ** index);
        steps += `   - Digit '${digit}' (nilai desimal: ${val}) pada posisi ${index}: ${val} × 16^${index} = ${val} × ${Math.pow(16,index)} = ${term}\n`;
        decValueHexToDec += term;
        calculationStepsHexToDec.push(`${val}×16^${index}`);
      });
      steps += `\n3. Jumlahkan semua hasil perkalian:\n`;
      steps += `   ${calculationStepsHexToDec.join(' + ')}\n`;
      steps += `   = ${decValueHexToDec}\n`;
      steps += `\nJadi, ${sanitizedInput.toUpperCase()} (heksadesimal) = ${output} (desimal).`;
      tipsAndTable += `
Tips:
- Setiap digit heksadesimal dikalikan dengan 16 pangkat posisinya, dimulai dari 0 di paling kanan.
- Ubah digit A-F menjadi nilai desimalnya (A=10, B=11, ..., F=15) sebelum dikalikan.
- Jumlahkan semua hasil perkalian.

Tabel Singkat (Digit Heksadesimal ke Desimal):
Heksadesimal  Desimal
0             0
...           ...
9             9
A             10
B             11
C             12
D             13
E             14
F             15
`;
      break;
    
    case 'hexToBin':
      if (!/^[0-9A-Fa-f]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan heksadesimal yang valid.`;
      steps += `Untuk mengonversi bilangan heksadesimal ${sanitizedInput.toUpperCase()} ke biner:\n`;
      steps += `1. Setiap digit heksadesimal dikonversi menjadi representasi biner 4-bit.\n`;
      steps += `   (Ingat: A=10, B=11, C=12, D=13, E=14, F=15)\n\n`;
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
      
      let finalOutputHexToBin = binResultHexToBin.replace(/^0+(?!$)/, '') || '0';

      if (binResultHexToBin !== finalOutputHexToBin && sanitizedInput !== "0") {
          steps += `3. (Opsional) Hilangkan nol di bagian paling kiri (leading zeros), kecuali jika hasilnya hanya "0":\n`;
          steps += `   Hasil akhir: ${finalOutputHexToBin}\n`;
      }
      steps += `\nJadi, ${inputHexToBin} (heksadesimal) = ${finalOutputHexToBin} (biner).`;
      tipsAndTable += `
Tips:
- Setiap digit heksadesimal dikonversi langsung menjadi 4-bit biner.
- Gabungkan semua grup 4-bit biner.

Tabel Singkat (Heksadesimal ke Biner):
Heksadesimal  Biner (4-bit)  Desimal
0             0000           0
1             0001           1
2             0010           2
3             0011           3
4             0100           4
5             0101           5
6             0110           6
7             0111           7
8             1000           8
9             1001           9
A             1010           10
B             1011           11
C             1100           12
D             1101           13
E             1110           14
F             1111           15
`;
      break;

    case 'binToOct':
      if (!/^[01]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan biner yang valid.`;
      steps += `Untuk mengonversi bilangan biner ${sanitizedInput} ke oktal:\n`;
      steps += `1. Kelompokkan bit biner menjadi grup 3-bit dari kanan. Tambahkan nol di kiri jika perlu.\n`;
      let paddedInputBinToOct = sanitizedInput;
       if (sanitizedInput.length === 0) paddedInputBinToOct = "000";
       else {
           while (paddedInputBinToOct.length % 3 !== 0) {
             paddedInputBinToOct = '0' + paddedInputBinToOct;
           }
       }
       if (sanitizedInput === "0" && paddedInputBinToOct !== "000") paddedInputBinToOct = "000";
      
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
      let finalOctOutput = octChars.join('');
      if (finalOctOutput === "" && sanitizedInput === "0") finalOctOutput = "0";
      else if (finalOctOutput === "") finalOctOutput = "0";

      steps += `\n3. Gabungkan hasil oktal:\n`;
      steps += `   Hasil: ${finalOctOutput}\n`;
      steps += `\nJadi, ${sanitizedInput} (biner) = ${output} (oktal).`;
      tipsAndTable += `
Tips:
- Kelompokkan bit biner menjadi grup 3-bit dari kanan. Tambahkan nol ('0') di kiri jika perlu.
- Setiap grup 3-bit biner dikonversi menjadi satu digit oktal.

Tabel Singkat (Biner ke Oktal):
Biner (3-bit)  Oktal
000            0
001            1
010            2
011            3
100            4
101            5
110            6
111            7
`;
      break;

    case 'octToBin':
      if (!/^[0-7]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan oktal yang valid.`;
      steps += `Untuk mengonversi bilangan oktal ${sanitizedInput} ke biner:\n`;
      steps += `1. Setiap digit oktal dikonversi menjadi representasi biner 3-bit.\n\n`;
      let binResultOctToBin = "";
      for (let i = 0; i < sanitizedInput.length; i++) {
        const octDigit = sanitizedInput[i];
        const decEquivOct = parseInt(octDigit, 8);
        const binEquiv = decEquivOct.toString(2).padStart(3, '0');
        steps += `   - Digit oktal '${octDigit}':\n`;
        steps += `     Nilai desimalnya adalah ${decEquivOct}.\n`;
        steps += `     ${decEquivOct} (desimal) dikonversi ke biner 3-bit menjadi ${binEquiv}.\n`;
        steps += `     Jadi, '${octDigit}' (oktal) = ${binEquiv} (biner).\n\n`;
        binResultOctToBin += binEquiv;
      }
      steps += `2. Gabungkan semua hasil biner 3-bit tersebut:\n`;
      steps += `   ${sanitizedInput.split('').map(d => parseInt(d,8).toString(2).padStart(3,'0')).join(' ')} = ${binResultOctToBin}\n`;

      let finalOutputOctToBin = binResultOctToBin.replace(/^0+(?!$)/, '') || '0';

      if (binResultOctToBin !== finalOutputOctToBin && sanitizedInput !== "0") {
          steps += `3. (Opsional) Hilangkan nol di bagian paling kiri (leading zeros), kecuali jika hasilnya hanya "0":\n`;
          steps += `   Hasil akhir: ${finalOutputOctToBin}\n`;
      }
      steps += `\nJadi, ${sanitizedInput} (oktal) = ${finalOutputOctToBin} (biner).`;
       tipsAndTable += `
Tips:
- Setiap digit oktal dikonversi langsung menjadi 3-bit biner.
- Gabungkan semua grup 3-bit biner.

Tabel Singkat (Oktal ke Biner):
Oktal   Biner (3-bit)
0       000
1       001
2       010
3       011
4       100
5       101
6       110
7       111
`;
      break;

    case 'decToOct':
      let numDecToOct = parseInt(sanitizedInput);
      if (isNaN(numDecToOct) || numDecToOct < 0) return `Input "${sanitizedInput}" bukan desimal non-negatif yang valid.`;
      steps += `Untuk mengonversi bilangan desimal ${sanitizedInput} ke oktal:\n`;
      steps += `1. Bagi bilangan desimal dengan 8 secara berulang sampai hasil bagi adalah 0.\n`;
      steps += `2. Catat sisa dari setiap pembagian.\n`;
      if (numDecToOct === 0) {
          steps += `   - ${sanitizedInput} (desimal) langsung dikonversi menjadi 0 (oktal).\n`;
          steps += `\nJadi, ${sanitizedInput} (desimal) = 0 (oktal).`;
      } else {
        const remaindersDecToOct: number[] = [];
        let currentNumOct = numDecToOct;
        let stepCounterOct = 1;
        while (currentNumOct > 0) {
            const remainder = currentNumOct % 8;
            const quotient = Math.floor(currentNumOct / 8);
            steps += `   Langkah ${stepCounterOct}: ${currentNumOct} ÷ 8 = ${quotient}, Sisa = ${remainder}\n`;
            remaindersDecToOct.push(remainder);
            currentNumOct = quotient;
            stepCounterOct++;
        }
        steps += `\n3. Tuliskan semua sisa dari yang terakhir ke yang pertama.\n`;
        steps += `   Sisa (dari bawah ke atas): ${remaindersDecToOct.slice().reverse().join('')}\n`;
        steps += `\nJadi, ${sanitizedInput} (desimal) = ${output} (oktal).`;
      }
      tipsAndTable += `
Tips:
- Bagi bilangan desimal dengan 8 secara berulang hingga hasil bagi 0.
- Catat sisa pembagian (0-7).
- Hasil oktal adalah urutan sisa pembagian dibaca dari bawah ke atas.

Tabel Singkat (Contoh Desimal ke Oktal):
Desimal   Oktal
0         0
7         7
8         10  (8 ÷ 8 = 1 sisa 0 -> 10)
9         11  (9 ÷ 8 = 1 sisa 1 -> 11)
15        17  (15 ÷ 8 = 1 sisa 7 -> 17)
16        20  (16 ÷ 8 = 2 sisa 0 -> 20)
`;
      break;

    case 'octToDec':
      if (!/^[0-7]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan oktal yang valid.`;
      steps += `Untuk mengonversi bilangan oktal ${sanitizedInput} ke desimal:\n`;
      steps += `1. Tuliskan bilangan oktal: ${sanitizedInput}\n`;
      steps += `2. Kalikan setiap digit oktal dengan 8 pangkat posisinya (dari kanan, mulai dari 0).\n`;
      let decValueOctToDec = 0;
      const octDigits = sanitizedInput.split('');
      const reversedOctDigits = [...octDigits].reverse();
      let calculationStepsOctToDec = [];
      reversedOctDigits.forEach((digit, index) => {
        const term = parseInt(digit) * (8 ** index);
        steps += `   - Digit '${digit}' pada posisi ${index}: ${digit} × 8^${index} = ${digit} × ${Math.pow(8,index)} = ${term}\n`;
        decValueOctToDec += term;
        calculationStepsOctToDec.push(`${digit}×8^${index}`);
      });
      steps += `\n3. Jumlahkan semua hasil perkalian:\n`;
      steps += `   ${calculationStepsOctToDec.join(' + ')}\n`;
      steps += `   = ${decValueOctToDec}\n`;
      steps += `\nJadi, ${sanitizedInput} (oktal) = ${output} (desimal).`;
      tipsAndTable += `
Tips:
- Setiap digit oktal dikalikan dengan 8 pangkat posisinya, dimulai dari 0 di paling kanan.
- Jumlahkan semua hasil perkalian.

Tabel Singkat (Posisi dan Pangkat 8):
Posisi (dari kanan):  3    2    1    0
Nilai Pangkat 8:    512   64    8    1
Contoh untuk 17 (oktal): (7×8^0) + (1×8^1) = 7 + 8 = 15
`;
      break;
    
    case 'hexToOct':
      if (!/^[0-9A-Fa-f]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan heksadesimal yang valid.`;
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
      steps += `  Hasil biner gabungan (setelah hilangkan leading zeros jika ada, kecuali jika hasilnya hanya "0"): ${tempBin_hexToOct}\n\n`;
      
      steps += `Langkah 2: Konversi Biner (${tempBin_hexToOct}) ke Oktal (kelompokkan biner jadi 3-bit dari kanan, tambahkan leading zeros jika perlu).\n`;
      let paddedTempBin_hexToOct = tempBin_hexToOct;
      if (tempBin_hexToOct === "0") paddedTempBin_hexToOct = "000";
      else {
          while (paddedTempBin_hexToOct.length % 3 !== 0) {
            paddedTempBin_hexToOct = '0' + paddedTempBin_hexToOct;
          }
      }
      
      let tempOct_hexToOct = "";
      const binGroups_hexToOct = [];
      for (let i = 0; i < paddedTempBin_hexToOct.length; i += 3) {
        const group = paddedTempBin_hexToOct.substring(i, i+3);
        binGroups_hexToOct.push(group);
        tempOct_hexToOct += parseInt(group, 2).toString(8);
      }
      steps += `  Biner setelah padding (jika perlu): ${paddedTempBin_hexToOct}\n`;
      steps += `  Kelompokkan biner menjadi 3-bit: ${binGroups_hexToOct.join(' | ')}\n`;
      binGroups_hexToOct.forEach(group => {
        steps += `    Grup '${group}' (biner) = ${parseInt(group, 2).toString(8)} (oktal)\n`;
      });
      steps += `  Hasil oktal gabungan: ${tempOct_hexToOct}\n`;
      steps += `\nJadi, ${sanitizedInput.toUpperCase()} (heksadesimal) = ${output} (oktal).`;
      tipsAndTable += `
Tips:
- Konversi heksadesimal ke biner terlebih dahulu (setiap digit hex ke 4-bit biner).
- Kemudian, kelompokkan hasil biner menjadi grup 3-bit dari kanan.
- Konversi setiap grup 3-bit biner ke digit oktal.

Tabel Referensi:
- Gunakan tabel Heksadesimal ↔ Biner (seperti pada Hex→Bin).
- Gunakan tabel Biner ↔ Oktal (seperti pada Bin→Oct).
`;
      break;

    case 'octToHex':
      if (!/^[0-7]+$/.test(sanitizedInput)) return `Input "${sanitizedInput}" bukan oktal yang valid.`;
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
      steps += `  Hasil biner gabungan (setelah hilangkan leading zeros jika ada, kecuali jika hasilnya hanya "0"): ${tempBin_octToHex}\n\n`;

      steps += `Langkah 2: Konversi Biner (${tempBin_octToHex}) ke Heksadesimal (kelompokkan biner jadi 4-bit dari kanan, tambahkan leading zeros jika perlu).\n`;
      let paddedTempBin_octToHex = tempBin_octToHex;
      if (tempBin_octToHex === "0") paddedTempBin_octToHex = "0000";
      else {
          while (paddedTempBin_octToHex.length % 4 !== 0) {
            paddedTempBin_octToHex = '0' + paddedTempBin_octToHex;
          }
      }

      let tempHex_octToHex = "";
      const binGroups_octToHex = [];
      for (let i = 0; i < paddedTempBin_octToHex.length; i += 4) {
        const group = paddedTempBin_octToHex.substring(i, i+4);
        binGroups_octToHex.push(group);
        tempHex_octToHex += parseInt(group, 2).toString(16).toUpperCase();
      }
      steps += `  Biner setelah padding (jika perlu): ${paddedTempBin_octToHex}\n`;
      steps += `  Kelompokkan biner menjadi 4-bit: ${binGroups_octToHex.join(' | ')}\n`;
      binGroups_octToHex.forEach(group => {
        steps += `    Grup '${group}' (biner) = ${parseInt(group, 2).toString(16).toUpperCase()} (heksadesimal)\n`;
      });
      steps += `  Hasil heksadesimal gabungan: ${tempHex_octToHex}\n`;
      steps += `\nJadi, ${sanitizedInput} (oktal) = ${output.toUpperCase()} (heksadesimal).`;
      tipsAndTable += `
Tips:
- Konversi oktal ke biner terlebih dahulu (setiap digit oktal ke 3-bit biner).
- Kemudian, kelompokkan hasil biner menjadi grup 4-bit dari kanan.
- Konversi setiap grup 4-bit biner ke digit heksadesimal.

Tabel Referensi:
- Gunakan tabel Oktal ↔ Biner (seperti pada Oct→Bin).
- Gunakan tabel Biner ↔ Heksadesimal (seperti pada Bin→Hex).
`;
      break;

    default:
      steps += 'Langkah-langkah manual detail untuk konversi spesifik ini belum tersedia secara rinci di sini, namun prinsip umumnya adalah mengubah ke basis 10 (desimal) atau basis 2 (biner) sebagai perantara jika diperlukan.';
      tipsAndTable += `
Tips:
- Untuk konversi yang kompleks, seringkali lebih mudah mengubah ke basis perantara seperti Biner atau Desimal.
- Pahami hubungan antar basis (misal, Hex ke Biner adalah 4-bit, Oktal ke Biner adalah 3-bit).
`;
  }
  return steps + tipsAndTable;
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
      let convertedValue = '';
      const currentInputVal = inputValue.trim(); 
      switch (conversionType) {
        case 'binToDec':
          if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
          convertedValue = parseInt(currentInputVal, 2).toString(10);
          break;
        case 'decToBin':
          if (!/^\d+$/.test(currentInputVal) && !(parseInt(currentInputVal,10) >= 0) ) throw new Error('Input desimal tidak valid (hanya angka non-negatif).');
          convertedValue = parseInt(currentInputVal, 10).toString(2);
          break;
        case 'decToHex':
          if (!/^\d+$/.test(currentInputVal) && !(parseInt(currentInputVal,10) >= 0) ) throw new Error('Input desimal tidak valid (hanya angka non-negatif).');
          convertedValue = parseInt(currentInputVal, 10).toString(16).toUpperCase();
          break;
        case 'hexToDec':
          if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
          convertedValue = parseInt(currentInputVal, 16).toString(10);
          break;
        case 'binToOct':
            if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
            if (currentInputVal === "") {convertedValue = "0"; break;}
            convertedValue = parseInt(currentInputVal, 2).toString(8);
            break;
        case 'octToBin':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            convertedValue = parseInt(currentInputVal, 8).toString(2);
            break;
        case 'decToOct':
            if (!/^\d+$/.test(currentInputVal) && !(parseInt(currentInputVal,10) >= 0) ) throw new Error('Input desimal tidak valid (hanya angka non-negatif).');
            convertedValue = parseInt(currentInputVal, 10).toString(8);
            break;
        case 'octToDec':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            convertedValue = parseInt(currentInputVal, 8).toString(10);
            break;
        case 'binToHex':
            if (!/^[01]+$/.test(currentInputVal)) throw new Error('Input biner tidak valid (hanya 0 atau 1).');
            if (currentInputVal === "") {convertedValue = "0"; break;}
            convertedValue = parseInt(currentInputVal, 2).toString(16).toUpperCase();
            break;
        case 'hexToBin':
            if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
            let binFromHexVal = parseInt(currentInputVal, 16).toString(2);
            if (currentInputVal.match(/^0+$/) && currentInputVal.length > 0) binFromHexVal = "0"; // Handle "0", "00" etc.
            else if (currentInputVal === "") {convertedValue = "0"; break;}
            convertedValue = binFromHexVal;
            break;
        case 'hexToOct':
            if (!/^[0-9A-Fa-f]+$/.test(currentInputVal)) throw new Error('Input heksadesimal tidak valid (0-9, A-F).');
            const decFromHexForOct = parseInt(currentInputVal, 16); 
            convertedValue = decFromHexForOct.toString(8); 
            break;
        case 'octToHex':
            if (!/^[0-7]+$/.test(currentInputVal)) throw new Error('Input oktal tidak valid (hanya 0-7).');
            const decFromOctForHex = parseInt(currentInputVal, 8); 
            convertedValue = decFromOctForHex.toString(16).toUpperCase(); 
            break;
        default:
          throw new Error('Tipe konversi tidak valid.');
      }
      setResult(convertedValue);
      setManualStepsContent(generateManualConversionSteps(conversionType, inputValue.trim(), convertedValue));
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan konversi.");
      setResult('');
      setManualStepsContent('');
      setShowManualSteps(false); 
    }
  }, [inputValue, conversionType]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  const handleConversionTypeChange = (value: ConversionType) => {
    setConversionType(value);
    setResult('');
    setError('');
    setManualStepsContent('');
    setShowManualSteps(false); 
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
                    <CardTitle className="text-xl text-green-600">Langkah Konversi Manual</CardTitle>
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
        if (isNaN(bits) || bits <= 0 || ![4, 8, 16, 32].includes(bits)) {
            setTwosComplError("Please select a valid bit length (4, 8, 16, or 32).");
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
