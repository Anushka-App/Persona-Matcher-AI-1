const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDir = './server';

console.log('🔨 Building TypeScript server...');

try {
    // Step 1: Compile TypeScript to JavaScript
    console.log('📝 Compiling TypeScript files...');
    execSync('npx tsc --project tsconfig.server.json', { stdio: 'inherit' });
    
    // Step 2: Find all compiled .js files (including subdirectories)
    function findJsFiles(dir) {
        let files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files = files.concat(findJsFiles(fullPath));
            } else if (item.endsWith('.js')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    const files = findJsFiles(serverDir);
    console.log(`Found ${files.length} compiled JavaScript files`);
    
    // Step 3: Process each file
    files.forEach(filePath => {
        const oldPath = filePath;
        const newPath = filePath.replace('.js', '.cjs');
        
        // Read the file content
        let content = fs.readFileSync(oldPath, 'utf8');
        
        // Update import statements to use .cjs extension
        // Handle require statements with relative paths (double quotes)
        content = content.replace(/require\("([^"]+)"\)/g, (match, importPath) => {
            // Only update relative imports that don't already have a file extension
            if (importPath.startsWith('./') && !importPath.match(/\.[a-zA-Z0-9]+$/)) {
                return `require("${importPath}.cjs")`;
            }
            return match;
        });
        
        // Handle require statements with relative paths (single quotes)
        content = content.replace(/require\('([^']+)'\)/g, (match, importPath) => {
            // Only update relative imports that don't already have a file extension
            if (importPath.startsWith('./') && !importPath.match(/\.[a-zA-Z0-9]+$/)) {
                return `require('${importPath}.cjs')`;
            }
            return match;
        });
        
        // Handle ES6 import statements (double quotes)
        content = content.replace(/from\s+"([^"]+)"/g, (match, importPath) => {
            // Only update relative imports that don't already have a file extension
            if (importPath.startsWith('./') && !importPath.match(/\.[a-zA-Z0-9]+$/)) {
                return `from "${importPath}.cjs"`;
            }
            return match;
        });
        
        // Handle ES6 import statements (single quotes)
        content = content.replace(/from\s+'([^']+)'/g, (match, importPath) => {
            // Only update relative imports that don't already have a file extension
            if (importPath.startsWith('./') && !importPath.match(/\.[a-zA-Z0-9]+$/)) {
                return `from '${importPath}.cjs'`;
            }
            return match;
        });
        
        // Write the updated content back
        fs.writeFileSync(oldPath, content);
        
        // Rename the file
        fs.renameSync(oldPath, newPath);
        
        const fileName = path.basename(filePath);
        console.log(`✅ Processed ${fileName} -> ${fileName.replace('.js', '.cjs')}`);
    });
    
    console.log('🎉 Server build completed successfully!');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 