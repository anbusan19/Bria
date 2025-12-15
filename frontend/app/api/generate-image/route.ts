import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, structured_prompt, num_results, aspect_ratio, model_version } = body;
    const apiToken = process.env.BRIA_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
    }

    // Default to V2 endpoint for structured prompt, or if model_version is not specified
    // If model_version is "3.2" (V1), use V1 endpoint.
    // The user example for V2 uses https://engine.prod.bria-api.com/v2/image/generate
    
    let endpoint = 'https://engine.prod.bria-api.com/v2/image/generate';
    let payload: any = {
      aspect_ratio: aspect_ratio || '1:1',
    };

    if (model_version === '3.2') {
        endpoint = `https://api.bria.ai/text-to-image/base/${model_version}`;
        payload = {
            prompt: prompt,
            num_results: num_results || 1,
            aspect_ratio: aspect_ratio || '1:1'
        };
    } else {
        // V2 (FIBO)
        // Payload for V2
        payload = {
            prompt: prompt || "refine image", // V2 uses prompt as refinement command sometimes
            aspect_ratio: aspect_ratio || '1:1',
        };
        
        if (structured_prompt) {
            // Ensure structured_prompt is a string if it's an object
            payload.structured_prompt = typeof structured_prompt === 'string' 
                ? structured_prompt 
                : JSON.stringify(structured_prompt);
        }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api_token': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `API Error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
