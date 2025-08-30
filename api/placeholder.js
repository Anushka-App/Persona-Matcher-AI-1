// Simple placeholder image API for Vercel serverless
export default function handler(req, res) {
    const { url } = req;
    // Parse width, height, and text from the URL
    const match = url.match(/\/api\/placeholder\/(\d+)\/(\d+)(?:\?text=(.*))?/);
    const width = match ? parseInt(match[1], 10) : 200;
    const height = match ? parseInt(match[2], 10) : 200;
    const text = match && match[3] ? decodeURIComponent(match[3]) : "Placeholder";

    // Use a public placeholder service for simplicity
    const imageUrl = `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
    res.writeHead(302, { Location: imageUrl });
    res.end();
}
