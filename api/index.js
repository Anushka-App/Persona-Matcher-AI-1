// Vercel serverless function for handling recommendations
import { loadProducts } from './data-loader.js';
import fetch from 'node-fetch';

// Cache products in memory
let cachedProducts = null;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBw5w9hlX6dwYsbw-8oUh2GNlDYpX_5GZ8';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Load products if not cached
        if (!cachedProducts) {
            cachedProducts = await loadProducts();
        }

        const { description, bagType } = req.body;
        let bagPref = bagType || '';

        console.log('Processing request:', { description, bagPref });

        // Generate personality analysis
        let personality = 'Classic and elegant';
        let sentiment = 'Confident and stylish';

        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
            try {
                const profilePrompt = `Based on this style description: ${description || 'User looking for bag recommendations'}, generate a detailed personality profile and style sentiment.

Format:
Personality: [Detailed personality traits - 2-3 sentences]
Sentiment: [Overall style sentiment - 1-2 sentences]`;

                const profRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: profilePrompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 256 }
                        })
                    }
                );

                if (profRes.ok) {
                    const profData = await profRes.json();
                    const profText = profData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    profText.split(/\r?\n/).forEach((line) => {
                        if (line.toLowerCase().startsWith('personality:')) personality = line.split(/:/)[1].trim();
                        if (line.toLowerCase().startsWith('sentiment:')) sentiment = line.split(/:/)[1].trim();
                    });
                }
            } catch (err) {
                console.error('Profile generation error:', err);
            }
        }

        // Filter products by bag type
        let bagTypeProducts = cachedProducts;
        if (bagPref) {
            bagTypeProducts = cachedProducts.filter(p => {
                const searchText = `${p.productName} ${p.productType}`.toLowerCase();
                const bagTypeLower = bagPref.toLowerCase();

                if (bagTypeLower.includes('crossbody')) {
                    return searchText.includes('crossbody') || searchText.includes('cross body');
                } else if (bagTypeLower.includes('tote')) {
                    return searchText.includes('tote');
                } else if (bagTypeLower.includes('handbag')) {
                    return searchText.includes('handbag') ||
                        searchText.includes('purse') ||
                        searchText.includes('bag') ||
                        searchText.includes('medium') ||
                        searchText.includes('large');
                } else if (bagTypeLower.includes('shoulder')) {
                    return searchText.includes('shoulder');
                } else if (bagTypeLower.includes('clutch')) {
                    return searchText.includes('clutch');
                } else if (bagTypeLower.includes('satchel')) {
                    return searchText.includes('satchel');
                } else {
                    return searchText.includes(bagTypeLower);
                }
            });
        }

        // Select random products from filtered list
        const shuffled = bagTypeProducts.sort(() => Math.random() - 0.5);
        const selectedProducts = shuffled.slice(0, 12);

        // Generate explanation
        let explanation = '';
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'hardcoded_gemini_api_key_here') {
            try {
                const productList = selectedProducts.map(p => p.productName).join(', ');
                const explanationPrompt = `User Profile:
- Personality: ${personality}
- Sentiment: ${sentiment}
- Preferred Bag Type: ${bagPref}

Selected Products: ${productList}

Write a detailed explanation (150-200 words) about why these ${bagPref} bags suit this user's personality and sentiment. Make it personal and specific.`;

                const explRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: explanationPrompt }] }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
                        })
                    }
                );

                if (explRes.ok) {
                    const explData = await explRes.json();
                    explanation = explData.candidates?.[0]?.content?.parts?.[0]?.text || '';
                }
            } catch (err) {
                console.error('Explanation generation error:', err);
            }
        }

        // Fallback explanation
        if (!explanation) {
            explanation = `These ${bagPref || 'bag'} selections are carefully chosen to complement your ${personality.toLowerCase()} personality and ${sentiment.toLowerCase()} sentiment. Each piece offers unique style elements that enhance your personal aesthetic and daily functionality.`;
        }

        // Format response
        const recommendations = selectedProducts.map((p, i) => ({
            id: (i + 1).toString(),
            name: p.productName,
            price: p.price,
            image: p.imageUrl,
            link: p.productUrl,
            description: p.personalityTraits
        }));

        return res.status(200).json({
            recommendations,
            explanation,
            userProfile: { personality, sentiment }
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
