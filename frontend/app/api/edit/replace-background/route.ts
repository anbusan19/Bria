import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, prompt, mode } = body;
    const apiToken = process.env.BRIA_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json({ error: 'BRIA_API_TOKEN not configured' }, { status: 500 });
    }

    const endpoint = 'https://engine.prod.bria-api.com/v2/image/edit/replace_background';

    let imagePayload = image;
    if (image && image.startsWith('data:image')) {
      imagePayload = image.split(',')[1];
    }

    const payload = {
      image: imagePayload,
      prompt: prompt,
      mode: mode || 'base'
    };

    console.log('Sending payload to Bria (replace-bg):', JSON.stringify({ ...payload, image: payload.image ? payload.image.substring(0, 50) + '...' : 'missing' }));

    // Use AbortController to set a longer timeout (30s) and retry once on failure
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'api_token': apiToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `API Error: ${response.status}`, details: errorText }, { status: response.status });
      }
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (err) {
      clearTimeout(timeout);
      console.error('Fetch error (replace-bg):', err);
      // Simple retry once
      try {
        const retryResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'api_token': apiToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!retryResponse.ok) {
          const errText = await retryResponse.text();
          return NextResponse.json({ error: `API Error after retry: ${retryResponse.status}`, details: errText }, { status: retryResponse.status });
        }
        const retryData = await retryResponse.json();
        return NextResponse.json(retryData, { status: retryResponse.status });
      } catch (retryErr) {
        console.error('Retry fetch error (replace-bg):', retryErr);
        return NextResponse.json({ error: 'Internal Server Error after retry' }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Error replacing background:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
