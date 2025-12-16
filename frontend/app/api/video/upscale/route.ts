import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { video, desired_increase, output_container_and_codec } = body;
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        if (!video) {
            return NextResponse.json({ error: 'Video is required' }, { status: 400 });
        }

        if (!desired_increase) {
            return NextResponse.json({ error: 'desired_increase is required' }, { status: 400 });
        }

        // API expects '2' or '4' as strings
        const desiredIncreaseStr = String(desired_increase);
        if (desiredIncreaseStr !== '2' && desiredIncreaseStr !== '4') {
            return NextResponse.json({ error: "desired_increase must be '2' or '4'" }, { status: 400 });
        }

        const endpoint = 'https://engine.prod.bria-api.com/v2/video/edit/increase_resolution';

        const payload = {
            video: video,
            desired_increase: desiredIncreaseStr, // Send as string '2' or '4'
            output_container_and_codec: output_container_and_codec || 'mp4_h265'
        };

        console.log('Upscale Payload:', JSON.stringify(payload, null, 2));
        console.log('Type of desired_increase:', typeof payload.desired_increase);

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
