import fs from 'fs';
import path from 'path';
import { dump } from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../samples/dispositifs.json');
const outputPath = path.join(__dirname, '../samples/dispositifs.yaml');

try {
  console.log(`Reading from ${inputPath}...`);
  const jsonContent = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(jsonContent);

  console.log('Converting to YAML...');
  const yamlContent = dump(data, {
    indent: 2,
    lineWidth: -1, // Don't wrap long lines
    noRefs: true   // Don't use aliases
  });

  fs.writeFileSync(outputPath, yamlContent, 'utf8');
  console.log(`Successfully converted to ${outputPath}`);
} catch (error) {
  console.error('Error converting file:', error);
  process.exit(1);
}
