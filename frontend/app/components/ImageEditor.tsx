'use client';

import { useState, useRef, useEffect } from 'react';

type EditMode = 'remove_bg' | 'replace_bg' | 'erase' | 'gen_fill' | 'upscale';

export default function ImageEditor() {
    const [image, setImage] = useState<string | null>(null);
    const [mask, setMask] = useState<string | null>(null);
    const [mode, setMode] = useState<EditMode>('remove_bg');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [brushSize, setBrushSize] = useState(20);
    const [isDrawing, setIsDrawing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Initialize canvas when image loads
    useEffect(() => {
        if (image && canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const img = imageRef.current;
            
            // Wait for image to fully load
            if (img.complete) {
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            } else {
                img.onload = () => {
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                };
            }
        }
    }, [image]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Resize logic similar to Generator to avoid huge payloads
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1024;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    setImage(dataUrl);
                    setResult(null);
                    setMask(null);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== 'erase' && mode !== 'gen_fill') return;
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            // Save mask
            // For Bria, mask should be black and white? 
            // Usually white is the masked area.
            setMask(canvasRef.current.toDataURL());
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // White mask
        ctx.fill();
        
        // Update mask in real-time as user draws
        setMask(canvas.toDataURL());
    };

    const clearMask = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setMask(null);
        }
    };

    const handleEdit = async () => {
        if (!image) {
            setError('Please upload an image first');
            return;
        }

        // Validate mask for erase and gen_fill modes
        if ((mode === 'erase' || mode === 'gen_fill') && !mask) {
            setError('Please draw a mask on the image first');
            return;
        }

        // Validate prompt for gen_fill and replace_bg modes
        if ((mode === 'gen_fill' || mode === 'replace_bg') && (!prompt || prompt.trim() === '')) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let endpoint = '';
            let payload: any = { image };

            switch (mode) {
                case 'remove_bg':
                    endpoint = '/api/edit/remove-background';
                    break;
                case 'replace_bg':
                    endpoint = '/api/edit/replace-background';
                    payload.prompt = prompt;
                    break;
                case 'erase':
                    endpoint = '/api/edit/erase';
                    payload.mask = mask;
                    break;
                case 'gen_fill':
                    endpoint = '/api/edit/gen-fill';
                    payload.mask = mask;
                    payload.prompt = prompt;
                    break;
                case 'upscale':
                    endpoint = '/api/edit/upscale';
                    break;
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Edit failed');
            }

            const data = await res.json();

            // Bria API v2 returns async responses with status_url or request_id
            // Check for async response indicators (status_url, request_id, or status field)
            if (data.status_url || data.request_id || (data.status && data.status !== 'COMPLETED')) {
                // This is an async request, start polling
                const statusUrl = data.status_url || (data.request_id ? `https://engine.prod.bria-api.com/v2/status/${data.request_id}` : null);
                if (statusUrl) {
                    setLoading(true); // Keep loading true
                    pollStatus(statusUrl);
                    return;
                }
            }

            // Handle synchronous response or completed status
            let resultUrl = '';
            if (data.result_url) resultUrl = data.result_url;
            else if (typeof data.result === 'string') resultUrl = data.result;
            else if (data.result?.image_url) resultUrl = data.result.image_url;
            else if (data.image_urls?.[0]) resultUrl = data.image_urls[0];
            else if (data.status === 'COMPLETED' && data.result) {
                // Handle completed async response
                if (typeof data.result === 'string') resultUrl = data.result;
                else if (data.result.image_url) resultUrl = data.result.image_url;
            } else {
                // Fallback: log the response for debugging
                console.warn('Unexpected response format:', data);
                throw new Error('Unexpected response format from API');
            }

            setResult(resultUrl);
            setLoading(false);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };

    const pollStatus = async (statusUrl: string) => {
        let pollCount = 0;
        const maxPolls = 60; // Maximum 2 minutes (60 * 2 seconds)
        
        const pollInterval = setInterval(async () => {
            pollCount++;
            
            if (pollCount > maxPolls) {
                clearInterval(pollInterval);
                setError('Request timed out. Please try again.');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/poll-image?url=${encodeURIComponent(statusUrl)}`);
                if (!res.ok) {
                    clearInterval(pollInterval);
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || errData.details || 'Polling failed');
                }
                const data = await res.json();

                if (data.status === 'COMPLETED' || data.status === 'completed') {
                    clearInterval(pollInterval);

                    let resultUrl = '';
                    if (data.result_url) resultUrl = data.result_url;
                    else if (typeof data.result === 'string') resultUrl = data.result;
                    else if (data.result?.image_url) resultUrl = data.result.image_url;
                    else if (data.image_urls?.[0]) resultUrl = data.image_urls[0];
                    else if (data.result?.url) resultUrl = data.result.url;
                    else {
                        console.warn('Unexpected completed response format:', data);
                        setError('Completed but could not extract result URL');
                        setLoading(false);
                        return;
                    }

                    setResult(resultUrl);
                    setLoading(false);
                } else if (data.status === 'FAILED' || data.status === 'failed') {
                    clearInterval(pollInterval);
                    setError(data.error || data.message || 'Edit operation failed');
                    setLoading(false);
                } else if (data.status === 'PROCESSING' || data.status === 'processing' || data.status === 'PENDING' || data.status === 'pending') {
                    // Still processing, continue polling
                } else {
                    // Unknown status, log for debugging
                    console.warn('Unknown status:', data.status, data);
                }
            } catch (e: any) {
                clearInterval(pollInterval);
                setError(e.message || 'Error while checking status');
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                AI Image Editor
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Upload */}
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Source Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700"
                        />
                    </div>

                    {/* Tools */}
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tool</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['remove_bg', 'replace_bg', 'erase', 'gen_fill', 'upscale'] as EditMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {m.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tool Options */}
                    {(mode === 'replace_bg' || mode === 'gen_fill') && (
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the change..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                    )}

                    {(mode === 'erase' || mode === 'gen_fill') && (
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Brush Size</label>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="mt-2 text-xs text-gray-400 mb-2">
                                {mask ? '✓ Mask drawn' : 'Draw on the image to create a mask'}
                            </div>
                            <button
                                onClick={clearMask}
                                disabled={!mask}
                                className="mt-2 w-full px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear Mask
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleEdit}
                        disabled={loading || !image}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 rounded-lg font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Apply Effect'}
                    </button>

                    {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</p>}
                </div>

                {/* Canvas / Preview */}
                <div className="lg:col-span-8">
                    <div className="relative bg-black/40 rounded-2xl border border-white/5 overflow-hidden min-h-[500px] flex items-center justify-center">
                        {!image && !result && (
                            <div className="text-gray-500">Upload an image to start editing</div>
                        )}

                        {image && !result && (
                            <div className="relative">
                                <img
                                    ref={imageRef}
                                    src={image}
                                    alt="Source"
                                    className="max-w-full max-h-[600px] pointer-events-none select-none"
                                />
                                {(mode === 'erase' || mode === 'gen_fill') && (
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="absolute inset-0 cursor-crosshair touch-none"
                                    />
                                )}
                            </div>
                        )}

                        {result && (
                            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 group">
                                <img
                                    src={result}
                                    alt="Result"
                                    className="max-w-full max-h-[600px] rounded-lg shadow-2xl"
                                />
                                <div className="mt-4 flex space-x-3">
                                    <a
                                        href={result}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-full text-white text-sm font-semibold shadow-lg shadow-green-500/20 transition-all"
                                    >
                                        Download HD
                                    </a>
                                    <button
                                        onClick={() => setResult(null)}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-semibold transition-all"
                                    >
                                        Edit Another
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
