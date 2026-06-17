const fs = require('fs');
const filePath = process.argv[2];
const query = process.argv[3];
if (!filePath || !query) {
  console.log('Usage: node src/search_helper.js <file_path> <query>');
  process.exit(1);
}
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
console.log(`Searching in ${filePath} for "${query}":`);
lines.forEach((line, index) => {
  if (line.toLowerCase().includes(query.toLowerCase())) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
