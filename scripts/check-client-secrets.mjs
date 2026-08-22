import 'dotenv/config';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const clientDirectory = resolve('dist/client');
const secretNames = [
  'MONGODB_URI',
  'BREVO_API_KEY',
  'SANITY_READ_TOKEN',
  'SANITY_WRITE_TOKEN',
  'SANITY_WEBHOOK_SECRET',
  'LEAD_NOTIFY_EMAIL',
  'ADMIN_EMAIL'
];
const checks = secretNames.flatMap((name) => {
  const value = process.env[name];
  return [
    { label: `${name} variable name`, needle: name },
    ...(value && value.length >= 6 ? [{ label: `${name} value`, needle: value }] : [])
  ];
});
const textExtensions = new Set(['.js', '.mjs', '.html', '.css', '.json', '.map']);

async function filesInside(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry);
    const details = await stat(path);
    if (details.isDirectory()) files.push(...await filesInside(path));
    else files.push(path);
  }
  return files;
}

const files = await filesInside(clientDirectory);
const violations = [];
for (const file of files) {
  const extension = file.slice(file.lastIndexOf('.'));
  if (!textExtensions.has(extension)) continue;
  const content = await readFile(file, 'utf8');
  const matches = checks.filter(({ needle }) => content.includes(needle)).map(({ label }) => label);
  if (matches.length) violations.push({ file, matches });
}

if (violations.length) {
  console.error('Potential server credentials were found in the browser bundle:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.matches.join(', ')}`);
  }
  process.exit(1);
}

console.log('Client security check passed: no server credential names or configured values found.');
