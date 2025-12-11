import XLSX from 'xlsx';

const workbook = XLSX.readFile('BandLab Choice Awards 2025 \u2013 Artist Sign-Up Form (Responses) (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Headers:', jsonData[0]);
