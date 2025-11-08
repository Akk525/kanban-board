/**
 * Utility script to clean localStorage saves from reducer actions
 * Run this to see which localStorage saves can be removed
 */

import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'src/context/BoardContext.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

// Find all localStorage.setItem calls
const localStoragePattern = /\/\/ Save to localStorage[\s\S]*?if \(typeof window !== 'undefined'\) \{[\s\S]*?\}/g;

const matches = content.match(localStoragePattern);

if (matches) {
  console.log(`Found ${matches.length} localStorage save blocks to remove:\n`);
  matches.forEach((match, index) => {
    const lines = match.split('\n');
    console.log(`\n--- Block ${index + 1} ---`);
    console.log(match);
    console.log('---\n');
  });
  
  console.log('\n✅ These blocks can be safely removed.');
  console.log('The useEffect at the end of the file handles all saves automatically.\n');
} else {
  console.log('No localStorage saves found (already cleaned?)');
}

// Create a cleaned version (you can apply this manually)
const cleaned = content.replace(
  /\n\s*\/\/ Save to localStorage[\s\S]*?if \(typeof window !== 'undefined'\) \{[\s\S]*?\n\s*\}/g,
  ''
);

fs.writeFileSync(
  path.join(process.cwd(), 'src/context/BoardContext.cleaned.tsx'),
  cleaned
);

console.log('✅ Created cleaned version at: src/context/BoardContext.cleaned.tsx');
console.log('Review the file and replace the original if it looks correct.');
