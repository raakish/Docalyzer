const http = require('http');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const pdfParse = require('pdf-parse');

require('dotenv').config();

const port = process.env.PORT;

//this serves the files
const serveFile = (filePath, contentType, res, statusCode = 200) => {
    fs.readFile(filePath, contentType.includes('image') ? null : 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(statusCode, { 'Content-Type': contentType });
        res.end(data);
    });
};

//creates the server weith the api endpoints and file serving
const server = http.createServer((req, res) => {
    console.log(req.method, req.url);

    // Handle PDF upload
    if (req.method === 'POST' && req.url === '/upload-pdf') {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('Error parsing the file');
                return;
            }

            const pdfFile = files.pdf?.[0];
            if (!pdfFile) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('No file uploaded');
                return;
            }

            try {
                const dataBuffer = fs.readFileSync(pdfFile.filepath);
                const data = await pdfParse(dataBuffer);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data.text);
            } catch (parseErr) {
                console.error(parseErr);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Error parsing PDF file');
            }
        });

        return;
    }


    // Handles Gemini AI contract analysis
    else if (req.method === 'POST' && req.url === '/analyze-text') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { GoogleGenAI } = await import('@google/genai');
                const { z } = await import('zod');
                const { zodToJsonSchema } = await import('zod-to-json-schema');


                const { text } = JSON.parse(body);

                const clauseSchema = z.object({
                    clause_number: z.string(),
                    clause_title: z.string(),
                    risk_score: z.number(),
                    issues: z.string(),
                    who_it_benefits: z.string(),
                    ambiguities: z.string(),
                    summary: z.string()
                });

                const contractSchema = z.array(clauseSchema);
                const prompt = `Analyze the following legal contract and extract its key clauses. 
                For each clause, provide the clause number, clause title, risk score
                 (on a scale of 1 to 10), issues identified, who it benefits,
                   any ambiguities, and a summary. Format the output as a JSON array following
                   a format similar to this example:
                   [
                   {
                    "clause_number": "1",
                    "clause_title": "Confidentiality",
                    "risk_score": 7,
                    "issues": "Lack of clear definition of confidential information.",
                    "who_it_benefits": "Primarily benefits the disclosing party.",
                    "ambiguities": "The term 'reasonable measures' is vague and open to interpretation.",
                    "summary": "This clause outlines the obligations of both parties to maintain confidentiality of shared information."
                    }
                    ]

                   Always include all fields. 
                    - If text has no information for a string field, use the string "N/A".
                    - If text has no information for risk_score, use the number 0.
                   Do not omit any fields.


                Contract Text:
                """
                ${text}
                """`;

                const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_KEY });

                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        contentSchema: zodToJsonSchema(contractSchema)
                    }
                });

                const clauses = contractSchema.parse(JSON.parse(response.text));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(clauses));
                console.log(clauses);
            } catch (error) {
                console.error("error: " + error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error analyzing text');
            }

        });
        return;
    }

    // Serve static files
    const extension = path.extname(req.url);
    let contentType;

    switch (extension) {
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.gif': contentType = 'image/gif'; break;
        case '.txt': contentType = 'text/plain'; break;
        default: contentType = 'text/html';
    }

    let filePath = req.url === '/' ? path.join(__dirname, 'index.html') : path.join(__dirname, req.url);
    if (!extension && req.url !== '/') filePath += '.html';

    if (fs.existsSync(filePath)) {
        serveFile(filePath, contentType, res);
    } else {
        serveFile(path.join(__dirname, '404.html'), 'text/html', res, 404);
    }
});

server.listen(port, () => console.log(`Server running on port ${port}`));
