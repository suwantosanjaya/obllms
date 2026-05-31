const fs = require('fs');
const findFiles = (dir, text) => {
    const results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const path = dir + '/' + file;
        const stat = fs.statSync(path);
        if (stat.isDirectory() && !path.includes('node_modules') && !path.includes('.next') && !path.includes('.git')) {
            results.push(...findFiles(path, text));
        } else if (stat.isFile() && (path.endsWith('.ts') || path.endsWith('.tsx'))) {
            const content = fs.readFileSync(path, 'utf8');
            if (content.includes(text)) {
                results.push(path);
            }
        }
    }
    return results;
};
console.log(findFiles('.', 'createSubject'));
