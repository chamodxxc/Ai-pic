const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

async function unrestrictedai(prompt, style = 'anime') {
    try {
        const styles = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage'];
        if (!prompt) throw new Error('Prompt is required.');
        if (!styles.includes(style)) throw new Error(`Available styles: ${styles.join(', ')}.`);

        const { data: html } = await axios.get('https://unrestrictedaiimagegenerator.com/', {
            headers: {
                origin: 'https://unrestrictedaiimagegenerator.com',
                referer: 'https://unrestrictedaiimagegenerator.com/',
                'user-agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(html);
        const nonce = $('input[name="_wpnonce"]').attr('value');
        if (!nonce) throw new Error('Nonce not found.');

        const { data } = await axios.post(
            'https://unrestrictedaiimagegenerator.com/',
            new URLSearchParams({
                generate_image: true,
                image_description: prompt,
                image_style: style,
                _wpnonce: nonce
            }).toString(),
            {
                headers: {
                    origin: 'https://unrestrictedaiimagegenerator.com',
                    referer: 'https://unrestrictedaiimagegenerator.com/',
                    'user-agent': 'Mozilla/5.0'
                }
            }
        );

        const $$ = cheerio.load(data);
        const img = $$('img#resultImage').attr('src');
        if (!img) throw new Error('No result found.');

        return img;

    } catch (error) {
        throw new Error(error.message);
    }
}

app.get('/api/unrestrictedai', async (req, res) => {
    try {
        const prompt = req.query.prompt;
        const style = req.query.style || 'anime';

        if (!prompt) {
            return res.json({
                creator: "Chamod Nimsara",
                status: false,
                message: "Missing 'prompt' query!"
            });
        }

        const result = await unrestrictedai(prompt, style);

        res.json({
            creator: "Chamod Nimsara",
            status: true,
            prompt,
            style,
            result
        });

    } catch (e) {
        res.json({
            creator: "Chamod Nimsara",
            status: false,
            error: e.message
        });
    }
});

module.exports = app;
