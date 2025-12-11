
export async function onRequestGet(context) {
    const { request } = context;
    const url = new URL(request.url).searchParams.get('url');

    if (!url) {
        return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const html = await response.text();

        // 1. Try to find the input with the embed code
        // <input ... value="<iframe ... src=&quot;https://www.bandlab.com/embed/?id=ID&quot; ...>">

        // Regex to match the id inside the iframe src
        const embedIdMatch = html.match(/src="https:\/\/www\.bandlab\.com\/embed\/\?id=([a-zA-Z0-9-]+)"/);

        if (embedIdMatch && embedIdMatch[1]) {
            return new Response(JSON.stringify({ id: embedIdMatch[1] }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Try to find the 'revId' or 'revisionId' in the JSON state often found in scripts
        // This is more complex but more robust if the input isn't there.

        return new Response(JSON.stringify({ error: 'Could not find embed ID in page' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
