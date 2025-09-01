const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../components/screens');
const backButtonImport = "import { BackButton } from '../ui/BackButton';";

// List of screens that already have back buttons added
const screensWithBackButtons = [
  'WelcomeScreen.tsx',
  'SignInScreen.tsx', 
  'CreateAccountScreen.tsx',
  'PostLoginWelcomeScreen.tsx',
  'EventListScreen.tsx',
  'ProfileScreen.tsx'
];

function addBackButtonToScreen(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Skip if already processed
    if (screensWithBackButtons.includes(fileName)) {
      console.log(`✅ ${fileName} already has back button`);
      return;
    }
    
    // Add import if not already present
    if (!content.includes("import { BackButton } from '../ui/BackButton'")) {
      // Find the last import statement
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      
      if (lastImportIndex !== -1) {
        const beforeImports = content.substring(0, lastImportIndex);
        const afterImports = content.substring(lastImportIndex);
        content = beforeImports + afterImports + '\n' + backButtonImport;
      } else {
        // If no imports found, add at the beginning
        content = backButtonImport + '\n' + content;
      }
    }
    
    // Add BackButton component to the JSX
    if (!content.includes('<BackButton')) {
      // Find the main return statement
      const returnMatch = content.match(/return\s*\(\s*<([^>]+)/);
      if (returnMatch) {
        const returnIndex = content.indexOf(returnMatch[0]);
        const beforeReturn = content.substring(0, returnIndex);
        const afterReturn = content.substring(returnIndex);
        
        // Find the opening tag
        const tagMatch = afterReturn.match(/<([A-Z][a-zA-Z]*)/);
        if (tagMatch) {
          const tagIndex = afterReturn.indexOf(tagMatch[0]);
          const beforeTag = afterReturn.substring(0, tagIndex);
          const afterTag = afterReturn.substring(tagIndex);
          
          content = beforeReturn + beforeTag + afterTag + '\n      <BackButton />';
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added back button to ${fileName}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processScreensDirectory() {
  const files = fs.readdirSync(screensDir);
  
  files.forEach(file => {
    if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
      const filePath = path.join(screensDir, file);
      addBackButtonToScreen(filePath);
    }
  });
}

console.log('🚀 Adding back buttons to all screens...');
processScreensDirectory();
console.log('✅ Back button addition complete!');


