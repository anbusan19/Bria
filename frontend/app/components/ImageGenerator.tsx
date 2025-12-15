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
    const [v2Mode, setV2Mode] = useState<'quick' | 'pro'>('quick');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');

    // Pro Builder States
    const [referenceImage, setReferenceImage] = useState('');
    const [seed, setSeed] = useState<number | ''>('');
    const [proStep, setProStep] = useState<1 | 2 | 3>(1); // 1: Inspiration, 2: Blueprint, 3: Creation

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

    const generateRecipe = async () => {
        setLoading(true);
        setError(null);
        setStatus('Generating Recipe...');

        try {
            const payload: any = {};
            if (prompt) payload.prompt = prompt;
            if (referenceImage) payload.images = [referenceImage];

            if (!prompt && !referenceImage) {
                throw new Error("Please provide a text prompt or reference image URL.");
            }

            const res = await fetch('/api/generate-structured-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || errData.error || 'Failed to generate recipe');
            }

            const data = await res.json();
            console.log('Generate Recipe Response:', data);

            if (res.status === 202 && data.status_url) {
                setStatus('Generating Recipe (Async)...');
                pollRecipe(data.status_url);
                return;
            }

            let recipe;
            if (data.result && data.result.structured_prompt) {
                recipe = typeof data.result.structured_prompt === 'string'
                    ? data.result.structured_prompt
                    : JSON.stringify(data.result.structured_prompt, null, 2);
            } else if (data.result) {
                recipe = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
            } else {
                recipe = JSON.stringify(data, null, 2);
            }

            console.log('Processed Recipe String:', recipe);
            setStructuredPrompt(recipe);
            setProStep(2);
            setStatus('Recipe Generated');
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            setStatus('Error');
        }
    };

    const pollRecipe = async (statusUrl: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/poll-image?url=${encodeURIComponent(statusUrl)}`);
                if (!res.ok) {
                    clearInterval(pollInterval);
                    throw new Error('Polling failed');
                }
                const data = await res.json();
                console.log('Poll Recipe Data:', data);

                if (data.status === 'COMPLETED') {
                    clearInterval(pollInterval);

                    let recipe;
                    if (data.result && data.result.structured_prompt) {
                        recipe = typeof data.result.structured_prompt === 'string'
                            ? data.result.structured_prompt
                            : JSON.stringify(data.result.structured_prompt, null, 2);
                    } else if (data.result) {
                        recipe = typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2);
                    } else {
                        recipe = JSON.stringify(data, null, 2);
                    }

                    setStructuredPrompt(recipe);
                    setProStep(2);
                    setStatus('Recipe Generated');
                    setLoading(false);
                } else if (data.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setError('Recipe Generation Failed');
                    setLoading(false);
                    setStatus('Failed');
                } else {
                    setStatus(`Generating Recipe: ${data.status}`);
                }
            } catch (e: any) {
                clearInterval(pollInterval);
                setError(e.message);
                setLoading(false);
                setStatus('Error polling recipe');
            }
        }, 2000);
    };

    const generateImage = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        setStatus('Sending request...');

        try {
            let payload: any = {
                aspect_ratio: aspectRatio,
                model_version: 'v2',
            };

            // V2 Mode
            if (v2Mode === 'quick') {
                if (!prompt) {
                    setError("Prompt is required for Quick Mode");
                    setLoading(false);
                    return;
                }
                payload.prompt = prompt;
            } else {
                // Pro Mode
                if (proStep >= 2) {
                    const validationError = validateJSON(structuredPrompt);
                    if (validationError) {
                        throw new Error(validationError);
                    }
                    try {
                        payload.structured_prompt = JSON.parse(structuredPrompt);
                    } catch (e) {
                        throw new Error("Invalid JSON in Structured Prompt");
                    }

                    if (prompt && proStep === 3) {
                        payload.prompt = prompt;
                    }

                    // Ensure reference image is passed if available
                    if (referenceImage) {
                        payload.images = [referenceImage];
                    }
                } else {
                    if (prompt) payload.prompt = prompt;
                    if (referenceImage) payload.images = [referenceImage];
                }

                if (seed) payload.seed = Number(seed);
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
                setStatus('Processing...');
                pollStatus(data.status_url);
            } else if (data.result?.image_url || data.result_url || data.image_urls?.[0]) {
                setResult(data);
                setLoading(false);
                setStatus('Completed');
                if (v2Mode === 'pro') setProStep(3);
            } else {
                setResult(data);
                setLoading(false);
                setStatus('Completed');
                if (v2Mode === 'pro') setProStep(3);
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
                    if (v2Mode === 'pro') setProStep(3);
                } else if (data.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setError('Generation Failed');
                    setLoading(false);
                    setStatus('Failed');
                } else {
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
        <div className="w-full max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl">
            <h2 className="text-3xl font-bold mb-8 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Bria AI Studio
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls Section */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Mode Selection */}
                    <div className="flex space-x-2 bg-black/20 p-2 rounded-lg justify-center">
                        <button
                            onClick={() => setV2Mode('quick')}
                            className={`px-6 py-2 rounded-md font-semibold transition-colors ${v2Mode === 'quick' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Quick Mode
                        </button>
                        <button
                            onClick={() => setV2Mode('pro')}
                            className={`px-6 py-2 rounded-md font-semibold transition-colors ${v2Mode === 'pro' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Pro Builder
                        </button>
                    </div>

                    {/* Quick Mode UI */}
                    {v2Mode === 'quick' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your image..."
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
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
                                </select>
                            </div>
                            <button
                                onClick={generateImage}
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Generating...' : 'Generate Image'}
                            </button>
                        </div>
                    )}

                    {/* Pro Builder UI */}
                    {v2Mode === 'pro' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Step Indicators */}
                            <div className="flex justify-between text-xs font-mono text-gray-500 border-b border-white/10 pb-2">
                                <span className={proStep >= 1 ? 'text-blue-400' : ''}>1. INSPIRATION</span>
                                <span className={proStep >= 2 ? 'text-purple-400' : ''}>2. BLUEPRINT</span>
                                <span className={proStep >= 3 ? 'text-green-400' : ''}>3. CREATION</span>
                            </div>

                            {/* Step 1: Inspiration */}
                            <div className={proStep === 1 ? 'block' : 'hidden'}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Inspiration Prompt</label>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="What do you want to create?"
                                            rows={3}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Reference Image (URL or Upload)</label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={referenceImage}
                                                onChange={(e) => setReferenceImage(e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            // Resize image before setting state
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                const img = new Image();
                                                                img.onload = () => {
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

                                                                    // Compress to JPEG 0.8
                                                                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                                                    setReferenceImage(dataUrl);
                                                                };
                                                                img.src = event.target?.result as string;
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {referenceImage && referenceImage.startsWith('data:image') && (
                                            <p className="text-xs text-green-400 mt-1">Image loaded successfully</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={generateRecipe}
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        {loading ? 'Analyzing...' : 'Generate Recipe'}
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Blueprint */}
                            <div className={proStep >= 2 ? 'block' : 'hidden'}>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-300">Recipe (Structured Prompt)</label>
                                        <button onClick={() => setProStep(1)} className="text-xs text-gray-500 hover:text-white">Back to Inspiration</button>
                                    </div>
                                    <textarea
                                        value={structuredPrompt}
                                        onChange={(e) => setStructuredPrompt(e.target.value)}
                                        rows={8}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Seed (Optional)</label>
                                            <input
                                                type="number"
                                                value={seed}
                                                onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Random"
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                                            <select
                                                value={aspectRatio}
                                                onChange={(e) => setAspectRatio(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="1:1">1:1 (Square)</option>
                                                <option value="16:9">16:9 (Landscape)</option>
                                                <option value="9:16">9:16 (Portrait)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateImage}
                                        disabled={loading}
                                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white transition-all shadow-lg shadow-green-500/20"
                                    >
                                        {loading ? 'Creating...' : 'Generate Image'}
                                    </button>
                                </div>
                            </div>

                            {/* Step 3: Refinement (Overlay on Step 2) */}
                            {proStep === 3 && (
                                <div className="pt-4 border-t border-white/10">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Refine Result</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="e.g., make it brighter"
                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <button
                                            onClick={generateImage}
                                            disabled={loading}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                        >
                                            Refine
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {status && <p className="text-sm text-gray-400 text-center animate-pulse">{status}</p>}
                    {error && <p className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded">{error}</p>}
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-7">
                    <div className="h-full min-h-[500px] bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group">

                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                        {result && (result.result?.image_url || result.result_url || result.image_urls?.[0]) ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={result.result?.image_url || result.result_url || result.image_urls?.[0]}
                                    alt="Generated"
                                    className="max-w-full max-h-[600px] rounded-lg shadow-2xl object-contain"
                                />
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={result.result?.image_url || result.result_url || result.image_urls?.[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm"
                                    >
                                        Download HD
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                {loading ? (
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-600">
                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>Your masterpiece will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Result JSON Overlay (Optional) */}
                        {result && (
                            <div className="absolute top-4 right-4">
                                <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-white list-none bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Debug Info</summary>
                                    <div className="mt-2 bg-black/80 p-4 rounded-lg max-w-xs overflow-auto max-h-60 text-left">
                                        <pre>{JSON.stringify(result, null, 2)}</pre>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
