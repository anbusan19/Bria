import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, images } = body;
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        const endpoint = 'https://engine.prod.bria-api.com/v2/structured_prompt/generate';

        const payload: any = {};
        if (prompt) payload.prompt = prompt;

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
        console.error('Error generating structured prompt:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
