// Native fetch in Node 22
// Mock URL from user
const targetUrl = 'https://www.bandlab.com/track/c1b34fde-ded2-f011-819b-6045bd3096b1?revId=bfb34fde-ded2-f011-819b-6045bd3096b1';
const dirtyUrl = 'Check this out https://www.bandlab.com/track/c1b34fde-ded2-f011-819b-6045bd3096b1?revId=bfb34fde-ded2-f011-819b-6045bd3096b1 cool song';

// Regex test
function extractId(urlInput) {
    // 0. CLEAN
    const urlMatch = urlInput.match(/(https?:\/\/[^\s"<>]+)/);
    const cleanUrl = urlMatch ? urlMatch[0] : urlInput;
    console.log(`Cleaned URL: ${cleanUrl}`);

    // 1. EXTRACT ID
    const idMatch = cleanUrl.match(/(post|track)\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[2]) {
        return idMatch[2];
    }
    return null;
}

async function checkApi(id) {
    console.log(`Checking API for ID: ${id}`);
    try {
        const res = await fetch(`https://www.bandlab.com/api/v1.3/posts/${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (res.ok) {
            const data = await res.json();
            console.log("API Success!");
            console.log("Title:", data.revision?.song?.name || data.caption);
            console.log("Artist:", data.creator?.name);
            console.log("Cover:", data.picture?.url || data.revision?.song?.picture?.url);
            console.log("M4A:", data.revision?.mixdown?.file);
        } else {
            console.log("API Failed:", res.status);
        }
    } catch (e) {
        console.error("API Error:", e);
    }
}

// Run
(async () => {
    console.log("--- TEST 1: Clean URL ---");
    const id1 = extractId(targetUrl);
    if (id1) await checkApi(id1);

    console.log("\n--- TEST 2: Dirty URL ---");
    const id2 = extractId(dirtyUrl);
    if (id2) await checkApi(id2);
})();
