const fs = require('fs');
const path = require('path');

// List of broken files that need fixing
const brokenFiles = [
  'src/pages/client/Dashboard_broken.js',
  'src/pages/trainer/BrokenDashboard.js',
  'src/components/TopNavbar_broken.js',
  'src/components/Sidebar_broken.js',
  'src/components/Layout_broken.js'
];

function fixFile(filePath) {
  try {
    console.log(`Fixing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, skipping.`);
      return;
    }
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace literal \n with actual newlines
    content = content.replace(/\\n/g, '\n');
    
    // Fix common formatting issues
    content = content.replace(/;\n/g, ';\n');
    content = content.replace(/,\n/g, ',\n');
    content = content.replace(/{\n/g, '{\n');
    content = content.replace(/}\n/g, '}\n');
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all broken files
brokenFiles.forEach(fixFile);

console.log('\n🔍 Now checking for any files with massive icon imports...');

// Function to find files with massive imports
function findMassiveImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findMassiveImports(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for massive icon imports (lines with more than 50 icon names)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('from \'@mui/icons-material\'') || 
              line.includes('from "@mui/icons-material"')) {
            
            // Count comma-separated items in the import
            const commaCount = (line.match(/,/g) || []).length;
            if (commaCount > 50) {
              console.log(`⚠️  Found massive import in ${fullPath}:${index + 1}`);
              console.log(`   Line has ${commaCount} imports`);
              console.log(`   Line: ${line.substring(0, 100)}...`);
            }
          }
        });
        
        // Check for very long lines that might be the issue
        lines.forEach((line, index) => {
          if (line.length > 1000 && line.includes('AccessTime')) {
            console.log(`⚠️  Found problematic line in ${fullPath}:${index + 1}`);
            console.log(`   Line length: ${line.length}`);
            console.log(`   Contains massive icon import`);
          }
        });
        
      } catch (error) {
        // Skip files that can't be read
      }
    }
  });
}

findMassiveImports('src');

console.log('\n✅ File fixing complete!');