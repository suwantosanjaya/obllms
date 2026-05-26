const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

const replacements = [
    { from: 'Konteks Prodi', to: 'Konteks Departemen' },
    { from: 'Pilih Prodi', to: 'Pilih Departemen' },
    { from: 'Pilih prodi', to: 'Pilih Departemen' },
    { from: 'Select Prodi', to: 'Pilih Departemen' },
    { from: 'Program Study (Prodi)', to: 'Departemen' },
    { from: 'Dashboard Quality Assurance (Prodi)', to: 'Dashboard Quality Assurance (Departemen)' },
    { from: 'Administrator (Prodi)', to: 'Administrator (Departemen)' },
    { from: 'Admin Prodi', to: 'Admin Departemen' },
    { from: 'Prodi Admin', to: 'Admin Departemen' },
    { from: 'Fakultas & Prodi', to: 'Fakultas & Departemen' },
    { from: 'Departments (Prodi)', to: 'Departemen' },
    { from: 'prodi Anda', to: 'departemen Anda' },
    { from: 'QA / Prodi', to: 'QA / Departemen' },
    { from: 'Manage Prodi Administrator accounts', to: 'Manage Department Administrator accounts' }
];

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

    replacements.forEach(rep => {
        // use regex with global flag to replace all occurrences
        const regex = new RegExp(rep.from, 'g');
        content = content.replace(regex, rep.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated UI texts in ${file}`);
    }
});

console.log(`Finished replacing terms in ${modifiedCount} files.`);
