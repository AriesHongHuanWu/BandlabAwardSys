export async function onRequestGet(context) {
    const { request } = context;
    const urlParams = new URL(request.url).searchParams;
    const audioUrl = urlParams.get('url');

    if (!audioUrl) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        const response = await fetch(audioUrl, {
            headers: {
                // Impersonate a browser to satisfy BandLab's CDN checks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.bandlab.com/'
            }
        });

        if (!response.ok) {
            return new Response(`Failed to fetch audio: ${response.status}`, { status: response.status });
        }

        // Copy key headers from the original response (ContentType, ContentLength)
        // and allow all origins (CORS)
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=3600');

        // Ensure Content-Type is audio/mp4 for M4A
        if (!headers.get('Content-Type')) {
            headers.set('Content-Type', 'audio/mp4');
        }

        return new Response(response.body, {
            status: 200,
            headers: headers
        });

    } catch (error) {
        return new Response(`Stream error: ${error.message}`, { status: 500 });
    }
}
