import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, structured_prompt, num_results, aspect_ratio, model_version, images, seed } = body;
    const apiToken = process.env.BRIA_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
    }

    console.log('Generate Image API called');
    const bodyString = JSON.stringify(body);
    console.log('Payload size:', bodyString.length);

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
      if (prompt) payload.prompt = prompt;
      if (seed) payload.seed = seed;

      if (images && Array.isArray(images)) {
        const imageUrls: string[] = [];
        const imageFiles: string[] = [];

        images.forEach((img: string) => {
          // Check if it's a data URI
          if (img.startsWith('data:image')) {
            // Extract raw base64 content
            const base64Content = img.split(',')[1];
            if (base64Content) {
              imageUrls.push(base64Content);
            }
          } else {
            // It's a URL
            imageUrls.push(img);
          }
        });

        if (imageUrls.length > 0) payload.images = imageUrls;
      }

      if (structured_prompt) {
        payload.structured_prompt = typeof structured_prompt === 'string'
          ? structured_prompt
          : JSON.stringify(structured_prompt);
      }

      if (!payload.prompt && !payload.structured_prompt && !payload.images) {
        payload.prompt = "generate image";
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api_token': apiToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
