import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { video } = body;
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        if (!video) {
            return NextResponse.json({ error: 'Video is required' }, { status: 400 });
        }

        const endpoint = 'https://engine.prod.bria-api.com/v2/video/edit/remove_background';

        const payload = {
            video: video
        };

        console.log('Sending payload to Bria (video remove bg):', JSON.stringify({ ...payload, video: payload.video ? payload.video.substring(0, 50) + '...' : 'missing' }));

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
        console.error('Error removing video background:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
