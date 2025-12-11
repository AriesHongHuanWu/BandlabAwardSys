
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

        // -------------------------------------------------------------
        // NEW STRATEGY (High Priority): API Direct Audio Fetch
        // -------------------------------------------------------------
        // Try to find the postId (UUID) and call the API to get the raw .m4a
        // This bypasses embedding issues entirely by playing the file directly.

        // 1. Look for UUID in URL (if present)
        let postId = null;
        const uuidMatch = url.match(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/);
        if (uuidMatch) {
            postId = uuidMatch[0];
        }

        // 2. If not in URL, look for it in the HTML (e.g. property="al:android:url" content="bandlab://posts/UUID")
        if (!postId) {
            const alMatch = html.match(/bandlab:\/\/posts\/([a-fA-F0-9-]+)/);
            if (alMatch) postId = alMatch[1];
        }

        if (postId) {
            try {
                // Fetch post data from API
                const apiRes = await fetch(`https://www.bandlab.com/api/v1.3/posts/${postId}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    let audioUrl = null;

                    // Try to get mixdown file
                    if (data.revision && data.revision.mixdown && data.revision.mixdown.file) {
                        audioUrl = data.revision.mixdown.file;
                    }
                    // Fallback to waveform trick
                    else if (data.waveformUrl) {
                        audioUrl = data.waveformUrl.replace('.json', '.m4a');
                    }

                    if (audioUrl) {
                        return new Response(JSON.stringify({ audioUrl }), {
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }
                }
            } catch (e) {
                // Ignore API error and fall back to scraping
            }
        }

        // -------------------------------------------------------------
        // FALLBACK: Embed ID Scraping
        // -------------------------------------------------------------
        // Strategy 1: Look for the specific 'embed' URL pattern in the HTML source
        // Common in og:video:secure_url or similar metadata
        // Example: content="https://www.bandlab.com/embed/?id=..."
        const embedUrlMatch = html.match(/https:\/\/www\.bandlab\.com\/embed\/\?id=([a-zA-Z0-9-]+)/);
        if (embedUrlMatch && embedUrlMatch[1]) {
            return new Response(JSON.stringify({ id: embedUrlMatch[1] }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Strategy 2: Try to find the input with the embed code
        // <input ... value="<iframe ... src=&quot;https://www.bandlab.com/embed/?id=ID&quot; ...>">

        // Regex to match the id inside the iframe src
        const embedIdMatch = html.match(/src="https:\/\/www\.bandlab\.com\/embed\/\?id=([a-zA-Z0-9-]+)"/);

        if (embedIdMatch && embedIdMatch[1]) {
            return new Response(JSON.stringify({ id: embedIdMatch[1] }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Strategy 3: Try to find the 'revId' or 'revisionId' in the JSON state often found in scripts
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
