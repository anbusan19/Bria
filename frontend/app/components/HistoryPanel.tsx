'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGenerations, getUserGenerationsByType, deleteGeneration, Generation } from '@/lib/firestore';

export default function HistoryPanel() {
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        loadGenerations();
    }, [filter, user]);

    const loadGenerations = async () => {
        if (!user) return;

        try {
            setLoading(true);
            let data: Generation[];

            if (filter === 'all') {
                data = await getUserGenerations(user.uid, 100);
            } else {
                data = await getUserGenerationsByType(user.uid, filter, 100);
            }

            setGenerations(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!id || !confirm('Delete this generation?')) return;

        try {
            await deleteGeneration(id);
            setGenerations(generations.filter(g => g.id !== id));
        } catch (err: any) {
            setError('Failed to delete: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center justify-center py-20">
                    <div className="text-white text-xl">Loading history...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0f0f11] backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                {/* Filter */}
                <div className="flex space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-xl ml-auto">
                    {(['all', 'image', 'video'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {generations.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl mb-2">No generations yet</p>
                    <p className="text-sm">Your generated images and videos will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generations.map((gen) => (
                        <div
                            key={gen.id}
                            className="group relative bg-[#0f0f11] rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                        >
                            {/* Media */}
                            <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden">
                                {gen.type === 'image' && gen.imageUrl ? (
                                    <img
                                        src={gen.imageUrl}
                                        alt="Generated"
                                        className="w-full h-full object-cover"
                                    />
                                ) : gen.type === 'video' && gen.videoUrl ? (
                                    <video
                                        src={gen.videoUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        onMouseEnter={(e) => e.currentTarget.play()}
                                        onMouseLeave={(e) => e.currentTarget.pause()}
                                    />
                                ) : (
                                    <div className="text-gray-500">No preview</div>
                                )}
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <div className="text-white text-sm space-y-1 mb-3">
                                    {gen.prompt && (
                                        <p className="line-clamp-2 mb-2">{gen.prompt}</p>
                                    )}
                                    {gen.type === 'image' && gen.mode && (
                                        <p className="text-xs text-gray-300">Mode: {gen.mode}</p>
                                    )}
                                    {gen.type === 'video' && gen.videoTool && (
                                        <p className="text-xs text-gray-300">Tool: {gen.videoTool.replace('_', ' ')}</p>
                                    )}
                                    {gen.createdAt && (
                                        <p className="text-xs text-gray-400">
                                            {new Date(gen.createdAt.seconds * 1000).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <a
                                        href={gen.imageUrl || gen.videoUrl || ''}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white text-xs font-semibold text-center transition-colors"
                                    >
                                        Download
                                    </a>
                                    <button
                                        onClick={() => handleDelete(gen.id!)}
                                        className="px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded-md text-white text-xs font-semibold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Type Badge */}
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                                {gen.type}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
