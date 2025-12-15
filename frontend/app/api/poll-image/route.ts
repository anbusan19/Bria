import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const statusUrl = searchParams.get('url');
        const apiToken = process.env.BRIA_API_TOKEN;

        if (!apiToken) {
            return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
        }

        if (!statusUrl) {
            return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
        }

        const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'api_token': apiToken,
            },
        });

        if (!response.ok) {
            // If it's 404, it might mean not ready or invalid ID, but usually 200/202 is returned.
            const errorText = await response.text();
            return NextResponse.json({ error: `Polling Error: ${response.status}`, details: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Error polling image status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
