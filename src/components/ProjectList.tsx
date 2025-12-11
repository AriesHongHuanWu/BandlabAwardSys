import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Plus, Trash2, FolderOpen, FileSpreadsheet, Loader, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { AdminPanel } from './AdminPanel';

interface ProjectListProps {
    onSelectProject: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
    const { projects, loading, createProject, deleteProject } = useProjects();
    const { logout } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer);
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);

            // 1. Create Project
            const projectName = file.name.replace('.xlsx', '').replace('.xls', '');
            const projectId = await createProject(projectName);

            // 2. Parse and Upload Songs
            const batchPromises = data.map((row: any) => {
                const url = row['Drop a track or video link (Short answer, required)'] ||
                    row['Link to Your BandLab Profile (Short answer, required)'] || '';

                if (!url) return null;

                let platform: any = 'other';
                if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
                else if (url.includes('spotify.com')) platform = 'spotify';
                else if (url.includes('soundcloud.com')) platform = 'soundcloud';
                else if (url.includes('bandlab.com')) platform = 'bandlab';

                return addDoc(collection(db, 'songs'), {
                    projectId,
                    originalRowData: row,
                    url,
                    extractedUrl: url,
                    platform,
                    status: 'pending',
                    artistName: row['BandLab Username (Short answer, required)'] || 'Unknown Artist',
                    songName: 'Untitled',
                    socialHandles: row['Social Handles (Optional) (Short answer)'] || '',
                    submissionCategory: row['What category fits you best? (Short answer, optional)'] || '',
                    submissionReason: row['Why should you be part of the BandLab Choice Awards? (Paragraph, optional)'] || '',
                    featurePermission: row['Do you give permission to be featured on Twitch/YouTube during the show?'] || '',
                    nominations: row['List up to 5 BandLab artists you think deserve a nomination'] || '',
                    votes: [],
                    notes: '',
                    createdAt: Date.now()
                });
            });

            await Promise.all(batchPromises.filter(p => p !== null));

            onSelectProject(projectId);

        } catch (err) {
            console.error(err);
            alert('Failed to import project');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Projects...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Select Project
                    </h1>
                    <p className="text-white/50">Choose an Excel file to work on</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAdmin(true)}
                        className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                        title="Admin Management"
                    >
                        <Shield size={20} />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create New Card */}
                <label className="glass-card p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all border-dashed border-2 border-white/20 group h-64">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    {uploading ? (
                        <Loader className="animate-spin text-primary" size={48} />
                    ) : (
                        <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Plus size={40} />
                        </div>
                    )}
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Import New Excel</h3>
                        <p className="text-sm text-white/50">Create a new project from file</p>
                    </div>
                </label>

                {/* Project List */}
                {projects.map(project => (
                    <div key={project.id} className="glass-card p-6 flex flex-col justify-between group h-64 relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this project?')) deleteProject(project.id);
                                }}
                                className="p-2 text-white/20 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-blue-500/10 w-fit rounded-lg text-blue-400">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1 line-clamp-1" title={project.name}>
                                    {project.name}
                                </h3>
                                <p className="text-white/40 text-sm">
                                    Created {new Date(project.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onSelectProject(project.id)}
                            className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors mt-auto"
                        >
                            Open Project <FolderOpen size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
