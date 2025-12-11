import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { parseExcelFile } from '../services/parser';
import { useSongs } from '../hooks/useSongs';

interface ImportUploadProps {
    projectId: string;
}

export const ImportUpload: React.FC<ImportUploadProps> = ({ projectId }) => {
    const { addSongs } = useSongs(projectId);
    const [uploading, setUploading] = React.useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const parsedSongs = await parseExcelFile(file);
            const songsWithProject = parsedSongs.map(s => ({
                ...s,
                projectId
            }));
            await addSongs(songsWithProject);
            alert(`Successfully imported ${songsWithProject.length} songs!`);
        } catch (err) {
            console.error(err);
            alert('Failed to parse file.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="h-full p-6 border-2 border-dashed border-primary/20 rounded-xl bg-surfaceHighlight/30 hover:bg-surfaceHighlight/80 hover:border-primary/50 transition-all text-center flex flex-col items-center justify-center cursor-pointer group">
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                id="file-upload"
                onChange={handleFile}
                disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                    {uploading ? <div className="animate-spin text-xl">⏳</div> : <FileSpreadsheet size={32} />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">Import Excel</h3>
                    <p className="text-textSecondary text-xs font-medium mt-1">Upload Artist Sign-Up responses</p>
                </div>
            </label>
        </div>
    );
};
