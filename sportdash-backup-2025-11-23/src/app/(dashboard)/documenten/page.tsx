'use client';

import { useState } from 'react';
import { Folder, FileText, Upload, ChevronRight, Home, Download, Trash2, MoreVertical, File, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FileType = 'folder' | 'pdf' | 'doc' | 'image' | 'other';

interface FileItem {
    id: string;
    name: string;
    type: FileType;
    size?: string;
    date: string;
    parentId: string | null;
}

const INITIAL_FILES: FileItem[] = [
    { id: '1', name: 'Protocollen', type: 'folder', date: '2024-01-15', parentId: null },
    { id: '2', name: 'Roosters', type: 'folder', date: '2024-02-01', parentId: null },
    { id: '3', name: 'Formulieren', type: 'folder', date: '2024-02-10', parentId: null },
    { id: '4', name: 'Veiligheidsplan 2024.pdf', type: 'pdf', size: '2.4 MB', date: '2024-01-20', parentId: '1' },
    { id: '5', name: 'Incident Protocol.docx', type: 'doc', size: '1.1 MB', date: '2024-01-22', parentId: '1' },
    { id: '6', name: 'Zaalrooster Q1.pdf', type: 'pdf', size: '500 KB', date: '2024-02-02', parentId: '2' },
    { id: '7', name: 'Foto Sportdag.jpg', type: 'image', size: '3.2 MB', date: '2024-03-10', parentId: null },
];

export default function DocumentsPage() {
    const [currentPath, setCurrentPath] = useState<string | null>(null);
    const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadName, setUploadName] = useState('');

    const currentFiles = files.filter(f => f.parentId === currentPath);

    const getBreadcrumbs = () => {
        const crumbs = [{ id: null, name: 'Home' }];
        let tempPath = currentPath;
        const pathItems = [];

        while (tempPath) {
            const folder = files.find(f => f.id === tempPath);
            if (folder) {
                pathItems.unshift({ id: folder.id, name: folder.name });
                tempPath = folder.parentId;
            } else {
                break;
            }
        }
        return [...crumbs, ...pathItems];
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadName) return;

        const newFile: FileItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: uploadName,
            type: 'pdf', // Default for mock
            size: '1.0 MB',
            date: new Date().toISOString().split('T')[0],
            parentId: currentPath
        };

        setFiles([...files, newFile]);
        setUploadName('');
        setIsUploadModalOpen(false);
    };

    const getIcon = (type: FileType) => {
        switch (type) {
            case 'folder': return <Folder className="text-blue-500 fill-blue-500/20" size={40} />;
            case 'pdf': return <FileText className="text-red-500" size={40} />;
            case 'doc': return <FileText className="text-blue-700" size={40} />;
            case 'image': return <ImageIcon className="text-purple-500" size={40} />;
            default: return <File className="text-gray-400" size={40} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documenten</h1>
                    <p className="text-gray-500">Beheer protocollen, roosters en formulieren</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Upload size={20} />
                    <span>Upload Bestand</span>
                </button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 overflow-x-auto">
                {getBreadcrumbs().map((crumb, index, arr) => (
                    <div key={crumb.id || 'home'} className="flex items-center gap-2 whitespace-nowrap">
                        {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
                        <button
                            onClick={() => setCurrentPath(crumb.id as string | null)}
                            className={`hover:text-blue-600 flex items-center gap-1 ${index === arr.length - 1 ? 'font-semibold text-gray-900' : ''}`}
                        >
                            {index === 0 && <Home size={14} />}
                            {crumb.name}
                        </button>
                    </div>
                ))}
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                    {currentFiles.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => file.type === 'folder' && setCurrentPath(file.id)}
                            className={`
                group relative p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer
                ${file.type === 'folder' ? 'hover:bg-blue-50/50' : ''}
              `}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="p-2 transition-transform group-hover:scale-110 duration-200">
                                    {getIcon(file.type)}
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-medium text-gray-900 truncate w-full" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {file.type === 'folder' ?
                                            `${files.filter(f => f.parentId === file.id).length} items` :
                                            file.size
                                        }
                                    </p>
                                </div>
                            </div>

                            {file.type !== 'folder' && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {currentFiles.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <FolderOpen size={48} className="mx-auto mb-3 opacity-20" />
                        <p>Deze map is leeg</p>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h2 className="text-xl font-bold mb-4">Bestand Uploaden</h2>
                            <form onSubmit={handleUpload}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bestandsnaam</label>
                                    <input
                                        type="text"
                                        value={uploadName}
                                        onChange={(e) => setUploadName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
                                        placeholder="Bijv. Nieuw Protocol.pdf"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Annuleren
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!uploadName}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Uploaden
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FolderOpen({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
    )
}
