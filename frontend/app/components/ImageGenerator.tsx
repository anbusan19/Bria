'use client';

import { useState } from 'react';

export default function ImageGenerator() {
    const examplePrompt = `{
  "short_description": "A close-up, photorealistic image of an ultra-fluffy owl perched on a tree branch, bathed in warm sunlight.",
  "objects": [
    {
      "description": "A hyper-detailed, ultra-fluffy owl with soft, voluminous feathers.",
      "location": "center",
      "relative_size": "large within frame"
    }
  ],
  "background_setting": "A dense forest during the day, with sunlight filtering through the canopy.",
  "lighting": {
    "conditions": "Bright, warm sunlight, daytime.",
    "direction": "Strongly from above and slightly to the front, creating clear highlights on the owl's features.",
    "shadows": "Defined, yet soft shadows on the owl's underside."
  },
  "aesthetics": {
    "composition": "Centered, close-up portrait composition.",
    "color_scheme": "Warm yellows, greens, and browns.",
    "mood_atmosphere": "Whimsical, enchanting, serene, and joyful.",
    "preference_score": "very high",
    "aesthetic_score": "very high"
  },
  "photographic_characteristics": {
    "depth_of_field": "Shallow, with the owl in sharp focus.",
    "focus": "Sharp focus on the owl's eyes and face.",
    "camera_angle": "Eye-level.",
    "lens_focal_length": "Portrait lens (e.g., 85mm-100mm)."
  },
  "style_medium": "photograph",
  "context": "This is a concept for a high-quality, photorealistic image intended for nature photography.",
  "artistic_style": "realistic, detailed, ethereal"
}`;

    const [prompt, setPrompt] = useState('');
    const [structuredPrompt, setStructuredPrompt] = useState(examplePrompt);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [modelVersion, setModelVersion] = useState('v2'); // 'v2' or '3.2'
    const [v2Mode, setV2Mode] = useState<'structured' | 'text'>('structured');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');

    const validateJSON = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.objects || !Array.isArray(parsed.objects) || parsed.objects.length === 0) {
                return "JSON must contain an 'objects' array with at least one object.";
            }
            const requiredFields = ['background_setting', 'lighting', 'aesthetics', 'context'];
            const missing = requiredFields.filter(field => !parsed[field]);
            if (missing.length > 0) {
                return `Missing required fields: ${missing.join(', ')}`;
            }
            return null;
        } catch (e) {
            return "Invalid JSON format.";
        }
    };

    const generateImage = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setStatus('Sending request...');

        try {
            let payload: any = {
                aspect_ratio: aspectRatio,
                model_version: modelVersion,
            };

            if (modelVersion === '3.2') {
                payload.prompt = prompt;
            } else {
                // V2
                if (v2Mode === 'text') {
                    if (!prompt) {
                        setError("Prompt is required for Text Mode");
                        setLoading(false);
                        return;
                    }
                    payload.prompt = prompt;
                } else {
                    // Structured Mode
                    payload.prompt = prompt || "generate image";

                    const validationError = validateJSON(structuredPrompt);
                    if (validationError) {
                        throw new Error(validationError);
                    }

                    try {
                        payload.structured_prompt = JSON.parse(structuredPrompt);
                    } catch (e) {
                        throw new Error("Invalid JSON in Structured Prompt");
                    }
                }
            }

            const res = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Failed to generate image');
            }

            const data = await res.json();

            if (res.status === 202 && data.status_url) {
                // Poll for result
                setStatus('Processing...');
                pollStatus(data.status_url);
            } else if (data.result_url || data.image_urls) {
                setResult(data);
                setLoading(false);
                setStatus('Completed');
            } else {
                setResult(data);
                setLoading(false);
                setStatus('Completed');
            }

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            setStatus('Error');
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
                    setResult(data);
                    setLoading(false);
                    setStatus('Completed');
                } else if (data.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setError('Generation Failed');
                    setLoading(false);
                    setStatus('Failed');
                } else {
                    // Still processing
                    setStatus(`Processing: ${data.status}`);
                }
            } catch (e: any) {
                clearInterval(pollInterval);
                setError(e.message);
                setLoading(false);
                setStatus('Error polling');
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Bria AI Image Generator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Model Version</label>
                        <select
                            value={modelVersion}
                            onChange={(e) => setModelVersion(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="v2">V2 (FIBO)</option>
                            <option value="3.2">V1 (Base 3.2)</option>
                        </select>
                    </div>

                    {modelVersion === 'v2' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Input Mode</label>
                            <div className="flex space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={v2Mode === 'structured'}
                                        onChange={() => setV2Mode('structured')}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-white text-sm">Structured (JSON)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={v2Mode === 'text'}
                                        onChange={() => setV2Mode('text')}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-white text-sm">Text Prompt</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="4:3">4:3</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            {modelVersion === 'v2' && v2Mode === 'structured' ? "Refinement Prompt (Optional)" : "Prompt"}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={modelVersion === 'v2' && v2Mode === 'structured' ? "e.g., add sunlight" : "e.g., A professional headshot..."}
                            rows={modelVersion === 'v2' && v2Mode === 'structured' ? 2 : 4}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {modelVersion === 'v2' && v2Mode === 'structured' && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-300">Structured Prompt (JSON)</label>
                                <button
                                    onClick={() => setStructuredPrompt(examplePrompt)}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                    Load Example
                                </button>
                            </div>
                            <textarea
                                value={structuredPrompt}
                                onChange={(e) => setStructuredPrompt(e.target.value)}
                                rows={10}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    <button
                        onClick={generateImage}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${loading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-blue-500/25'
                            } text-white`}
                    >
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>

                    {status && <p className="text-sm text-gray-400 text-center">{status}</p>}
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px] bg-black/20 rounded-xl border border-white/5 p-4">
                    {result && (result.result?.image_url || result.result_url || result.image_urls?.[0]) ? (
                        <img
                            src={result.result?.image_url || result.result_url || result.image_urls?.[0]}
                            alt="Generated"
                            className="w-full h-auto rounded-lg shadow-2xl"
                        />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            {loading ? (
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            ) : (
                                <span>Image will appear here</span>
                            )}
                        </div>
                    )}

                    {result && (
                        <div className="mt-4 w-full overflow-auto max-h-40 text-xs text-gray-500 font-mono bg-black/40 p-2 rounded">
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
