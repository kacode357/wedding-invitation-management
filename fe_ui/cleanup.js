const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');

function cleanText(text) {
    if (typeof text !== 'string') return text;
    // Remove hyphens and replace with space, remove other punctuation
    return text
        .replace(/[-/]/g, ' ')
        .replace(/[.,!?;:()[\]{}"']/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('_answers.json')) {
            console.log(`Processing ${filePath}`);
            const content = fs.readFileSync(filePath, 'utf8');
            try {
                const data = JSON.parse(content);
                let modified = false;
                for (const key in data) {
                    if (typeof data[key] === 'string') {
                        const cleaned = cleanText(data[key]);
                        if (data[key] !== cleaned) {
                            data[key] = cleaned;
                            modified = true;
                        }
                    }
                }
                if (modified) {
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                    console.log(`  Updated ${file}`);
                }
            } catch (err) {
                console.error(`  Error parsing JSON in ${file}: ${err.message}`);
            }
        }
    }
}

if (fs.existsSync(dataDir)) {
    processDirectory(dataDir);
    console.log('Cleanup complete.');
} else {
    console.error(`Data directory not found: ${dataDir}`);
}
