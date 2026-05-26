const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir(directoryPath);

let modifiedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Use regex \b to match exact word boundaries
    content = content.replace(/\bProdi\b/g, 'Departemen');
    content = content.replace(/\bprodi\b/g, 'departemen');
    content = content.replace(/\bPRODI\b/g, 'DEPARTEMEN');

    // We do not replace variable names that use camelCase like prodiId 
    // because \b protects against that, except for 'prodi' as a standalone word.
    // e.g. handleSwitchProdi will NOT be matched by \bprodi\b or \bProdi\b
    // Wait, handleSwitchProdi has 'Prodi' at the end of the word, but 'Prodi' is preceded by 'h'.
    // In JS regex, \b before 'Prodi' in 'handleSwitchProdi' is FALSE because 'h' is a word char.
    // So camelCase is safe from \b.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated UI texts in ${file}`);
    }
});

console.log(`Finished replacing terms in ${modifiedCount} files.`);
