import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { image, mask, prompt } = body;
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        if (!mask) {
            return NextResponse.json({ error: 'Mask is required for generative fill operation' }, { status: 400 });
        }

        if (!prompt || prompt.trim() === '') {
            return NextResponse.json({ error: 'Prompt is required for generative fill operation' }, { status: 400 });
        }

        const endpoint = 'https://engine.prod.bria-api.com/v2/image/edit/gen_fill';

        let imagePayload = image;
        if (image && image.startsWith('data:image')) {
            imagePayload = image.split(',')[1];
        }

        let maskPayload = mask;
        if (mask && mask.startsWith('data:image')) {
            maskPayload = mask.split(',')[1];
        }

        const payload = {
            image: imagePayload,
            mask: maskPayload,
            prompt: prompt,
            version: 2
        };

        console.log('Sending payload to Bria (gen-fill):', JSON.stringify({
            ...payload,
            image: payload.image ? payload.image.substring(0, 50) + '...' : 'missing',
            mask: payload.mask ? payload.mask.substring(0, 50) + '...' : 'missing'
        }));

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
        
        // Bria API v2 returns async responses with request_id and status_url
        // Pass through the response as-is so frontend can handle async polling
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error performing generative fill:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
