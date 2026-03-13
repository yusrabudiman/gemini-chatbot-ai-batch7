import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai'; 

const app = express();
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});


app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if(!Array.isArray(conversation)) throw new Error('message must be an array!');

        const contents = conversation.map(({ role, text}) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab hanya menggunakan bahasa Indonesia",
            },
        });

        res.status(200).json({result: response.text});
    } catch (e) {
        res.status(500).json({error: e.message});
    }

});