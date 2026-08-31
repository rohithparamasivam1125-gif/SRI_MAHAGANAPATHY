import fs from 'fs';

const filePath = 'e:/SRI_MAHAGANAPATHY/scripts/cleanAndSeedOnlyVerifiedCatalog.js';
let content = fs.readFileSync(filePath, 'utf8');

const PKT_REGEX = /\s*\(\s*\d+\s*\/\s*(?:pkt|pkts|packet|pack|box|bag|ctn|set)\s*\)/gi;
const PKT_REGEX_2 = /\s*\(\s*\d+\s*(?:pkt|pkts|packet|pack|box|bag|ctn|set)\s*\)/gi;

const originalLength = content.length;
content = content.replace(PKT_REGEX, '').replace(PKT_REGEX_2, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Cleaned cleanAndSeedOnlyVerifiedCatalog.js (chars: ${originalLength} -> ${content.length})`);
