import * as XLSX from 'xlsx';
import type { Song } from '../types';
import { detectPlatform } from '../utils/platformDetector';

interface RawRow {
    'Timestamp': unknown;
    'BandLab Username (Short answer, required)': string;
    'Link to Your BandLab Profile (Short answer, required)': string;
    'Drop a track or video link (Short answer, required)': string;
    'Social Handles (Optional) (Short answer)': string;
    'What category fits you best? (Short answer, optional)': string;
    'Why should you be part of the BandLab Choice Awards? (Paragraph, optional)': string;
    'Do you give permission to be featured on Twitch/YouTube during the show?': string;
    'List up to 5 BandLab artists you think deserve a nomination': string;
    [key: string]: any;
}

export const parseExcelFile = async (file: File): Promise<Omit<Song, 'id' | 'projectId'>[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<RawRow>(sheet);

    return jsonData.map((row) => {
        // Safe access with fallback
        const rawUrl = row['Drop a track or video link (Short answer, required)'] || '';
        const url = (typeof rawUrl === 'string' ? rawUrl.trim() : String(rawUrl)).trim();
        const platform = detectPlatform(url);
        const artistName = row['BandLab Username (Short answer, required)'] || 'Unknown Artist';

        return {
            url,
            extractedUrl: url,
            platform,
            status: 'pending',
            artistName,
            songName: 'Untitled',
            socialHandles: row['Social Handles (Optional) (Short answer)'] || '',
            submissionCategory: row['What category fits you best? (Short answer, optional)'] || '',
            submissionReason: row['Why should you be part of the BandLab Choice Awards? (Paragraph, optional)'] || '',
            featurePermission: row['Do you give permission to be featured on Twitch/YouTube during the show?'] || '',
            nominations: row['List up to 5 BandLab artists you think deserve a nomination'] || '',
            createdAt: Date.now(),
            votes: [],
            notes: ''
        };
    });
};
