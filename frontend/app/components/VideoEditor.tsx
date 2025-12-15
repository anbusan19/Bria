'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveGeneration } from '@/lib/firestore';

type VideoMode = 'upscale' | 'remove_bg' | 'foreground_mask';

export default function VideoEditor() {
    const [video, setVideo] = useState<string | null>(null);
    const [mode, setMode] = useState<VideoMode>('remove_bg');
    const [upscaleMultiplier, setUpscaleMultiplier] = useState(2);
    const [codec, setCodec] = useState('mp4_h265');
    const [backgroundColor, setBackgroundColor] = useState('Transparent');
    const [removeBgCodec, setRemoveBgCodec] = useState('webm_vp9');
    const [foregroundMaskCodec, setForegroundMaskCodec] = useState('mp4_h264');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();

    const saveToHistory = async (videoUrl: string) => {
        if (!user) return;
        try {
            await saveGeneration(user.uid, {
                type: 'video',
                videoUrl,
                videoTool: mode,
            });
        } catch (error) {
            console.error('Failed to save to history:', error);
        }
    };

    const handleProcess = async () => {
        if (!video) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let endpoint = '';
            let payload: any = { video };

            switch (mode) {
                case 'upscale':
                    endpoint = '/api/video/upscale';
                    payload.desired_increase = upscaleMultiplier;
                    payload.output_container_and_codec = codec;
                    break;
                case 'remove_bg':
                    endpoint = '/api/video/remove-background';
                    payload.background_color = backgroundColor;
                    payload.output_container_and_codec = removeBgCodec;
                    break;
                case 'foreground_mask':
                    endpoint = '/api/video/foreground-mask';
                    payload.output_container_and_codec = foregroundMaskCodec;
                    break;
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Processing failed');
            }

            const data = await res.json();

            // Handle async response
            if (res.status === 202 && data.status_url) {
                pollStatus(data.status_url);
                return;
            }

            // Extract result URL
            let resultUrl = '';
            if (data.result_url) resultUrl = data.result_url;
            else if (typeof data.result === 'string') resultUrl = data.result;
            else if (data.result?.video_url) resultUrl = data.result.video_url;
            else if (data.video_urls?.[0]) resultUrl = data.video_urls[0];
            else resultUrl = JSON.stringify(data);

            setResult(resultUrl);
            setLoading(false);
            await saveToHistory(resultUrl);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const pollStatus = async (statusUrl: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/poll-image?url=${encodeURIComponent(statusUrl)}`);
                if (!res.ok) {
                    clearInterval(pollInterval);
                    throw new Error('Polling failed');
                }
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    clearInterval(pollInterval);

                    let resultUrl = '';
                    if (data.result_url) resultUrl = data.result_url;
                    else if (typeof data.result === 'string') resultUrl = data.result;
                    else if (data.result?.video_url) resultUrl = data.result.video_url;
                    else if (data.video_urls?.[0]) resultUrl = data.video_urls[0];
                    else resultUrl = JSON.stringify(data);

                    setResult(resultUrl);
                    setLoading(false);
                    await saveToHistory(resultUrl);
                } else if (data.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setError('Processing Failed');
                    setLoading(false);
                }
            } catch (e: any) {
                clearInterval(pollInterval);
                setError(e.message);
                setLoading(false);
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-orange-500">
                AI Video Editor
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Video Input */}
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                        <input
                            type="text"
                            value={video || ''}
                            onChange={(e) => setVideo(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Enter a publicly accessible video URL (MP4, WebM, etc.)
                        </p>
                    </div>

                    {/* Requirements Warning */}
                    <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
                        <p className="text-xs text-yellow-400 font-semibold mb-1">⚠️ Video Requirements:</p>
                        <ul className="text-xs text-yellow-400/80 space-y-1 ml-4 list-disc">
                            <li>Max duration: <strong>30 seconds</strong></li>
                            <li>Max resolution: 16000x16000 (16K)</li>
                            <li>Supported: MP4, MOV, WebM, AVI, GIF</li>
                            <li>Must be publicly accessible URL</li>
                        </ul>
                    </div>

                    {/* Tools */}
                    <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tool</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['remove_bg', 'upscale', 'foreground_mask'] as VideoMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-pink-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {m.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upscale Settings */}
                    {mode === 'upscale' && (
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fadeIn space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Resolution Increase: {upscaleMultiplier}x
                                </label>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setUpscaleMultiplier(2)}
                                        className={`flex-1 py-2 rounded-lg border border-white/10 transition-all ${upscaleMultiplier === 2
                                                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                                                : 'bg-black/40 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        2x Scale
                                    </button>
                                    <button
                                        onClick={() => setUpscaleMultiplier(4)}
                                        className={`flex-1 py-2 rounded-lg border border-white/10 transition-all ${upscaleMultiplier === 4
                                                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                                                : 'bg-black/40 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        4x Scale
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Codec</label>
                                <select
                                    value={codec}
                                    onChange={(e) => setCodec(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="mp4_h265">MP4 (H.265)</option>
                                    <option value="mp4_h264">MP4 (H.264)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Remove BG Settings */}
                    {mode === 'remove_bg' && (
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fadeIn space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Background Color</label>
                                <select
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="Transparent">Transparent</option>
                                    <option value="Black">Black</option>
                                    <option value="White">White</option>
                                    <option value="Gray">Gray</option>
                                    <option value="Red">Red</option>
                                    <option value="Green">Green</option>
                                    <option value="Blue">Blue</option>
                                    <option value="Yellow">Yellow</option>
                                    <option value="Cyan">Cyan</option>
                                    <option value="Magenta">Magenta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                                <select
                                    value={removeBgCodec}
                                    onChange={(e) => setRemoveBgCodec(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="webm_vp9">WebM (VP9) - Supports Alpha</option>
                                    <option value="mov_proresks">MOV (ProRes 4444)</option>
                                    <option value="mkv_vp9">MKV (VP9)</option>
                                    <option value="gif">GIF</option>
                                    <option value="mp4_h264">MP4 (H.264) - No Alpha</option>
                                    <option value="mp4_h265">MP4 (H.265) - No Alpha</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Foreground Mask Settings */}
                    {mode === 'foreground_mask' && (
                        <div className="bg-black/20 p-4 rounded-lg border border-white/10 animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                            <select
                                value={foregroundMaskCodec}
                                onChange={(e) => setForegroundMaskCodec(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="mp4_h264">MP4 (H.264)</option>
                                <option value="mp4_h265">MP4 (H.265)</option>
                                <option value="webm_vp9">WebM (VP9)</option>
                                <option value="mov_h265">MOV (H.265)</option>
                                <option value="mkv_h264">MKV (H.264)</option>
                                <option value="gif">GIF</option>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleProcess}
                        disabled={loading || !video}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-400 hover:to-orange-500 rounded-lg font-bold text-white shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Process Video'}
                    </button>

                    {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</p>}
                </div>

                {/* Preview */}
                <div className="lg:col-span-8">
                    <div className="relative bg-black/40 rounded-2xl border border-white/5 overflow-hidden min-h-[500px] flex items-center justify-center">
                        {!video && !result && (
                            <div className="text-gray-500">Enter a publicly accessible video URL to start</div>
                        )}

                        {video && !result && (
                            <div className="w-full p-4">
                                <video
                                    src={video}
                                    controls
                                    className="w-full max-h-[600px] rounded-lg"
                                />
                            </div>
                        )}

                        {result && (
                            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 group">
                                <video
                                    src={result}
                                    controls
                                    className="w-full max-h-[600px] rounded-lg shadow-2xl"
                                />
                                <div className="mt-4 flex space-x-3">
                                    <a
                                        href={result}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2 bg-pink-600 hover:bg-pink-500 rounded-full text-white text-sm font-semibold shadow-lg shadow-pink-500/20 transition-all"
                                    >
                                        Download Video
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
