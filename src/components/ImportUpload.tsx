import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { parseExcelFile } from '../services/parser';
import { useSongs } from '../hooks/useSongs';

export const ImportUpload: React.FC = () => {
    const { addSongs } = useSongs();
    const [uploading, setUploading] = React.useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const parsedSongs = await parseExcelFile(file);
            await addSongs(parsedSongs);
            alert(`Successfully imported ${parsedSongs.length} songs!`);
        } catch (err) {
            console.error(err);
            alert('Failed to parse file.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 border-2 border-dashed border-white/20 rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors text-center">
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleFile}
                disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="p-4 bg-primary/20 rounded-full text-primary ring-1 ring-primary/50">
                    {uploading ? <div className="animate-spin text-xl">⏳</div> : <FileSpreadsheet size={32} />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Import Excel File</h3>
                    <p className="text-white/50 text-sm">Upload the Artist Sign-Up responses</p>
                </div>
            </label>
        </div>
    );
};
