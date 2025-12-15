import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { video, desired_increase, output_container_and_codec } = body;
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        const endpoint = 'https://engine.prod.bria-api.com/v2/video/edit/increase_resolution';

        const payload = {
            video: video,
            desired_increase: String(desired_increase),
            output_container_and_codec: output_container_and_codec || 'mp4_h265'
        };

        console.log('Sending payload to Bria (video upscale):', JSON.stringify({ ...payload, video: payload.video ? payload.video.substring(0, 50) + '...' : 'missing' }));

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
            console.error('Bria API Error (upscale):', response.status, errorText);
            return NextResponse.json({ error: `API Error: ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error upscaling video:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
