const fs = require('fs');
const path = require('path');

const dirsToScan = ['app/components'];

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.endsWith('.tsx')) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkSync(dir, (filePath) => {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;
            
            // Replace strings inside >...< (tags)
            content = content.replace(/>Cancel</g, '>Batal<');
            content = content.replace(/>Save</g, '>Simpan<');
            content = content.replace(/>Saving\.\.\.</g, '>Menyimpan...<');
            content = content.replace(/>Delete</g, '>Hapus<');
            content = content.replace(/>Deleting\.\.\.</g, '>Menghapus...<');
            content = content.replace(/>Update</g, '>Simpan Perubahan<');
            content = content.replace(/>Updating\.\.\.</g, '>Menyimpan...<');
            content = content.replace(/>Continue</g, '>Lanjutkan<');

            // Replace strings inside quotes for ternary operators inside tags like {loading ? 'Saving...' : 'Save'}
            content = content.replace(/'Cancel'/g, "'Batal'");
            content = content.replace(/'Save'/g, "'Simpan'");
            content = content.replace(/'Saving\.\.\.'/g, "'Menyimpan...'");
            content = content.replace(/'Delete'/g, "'Hapus'");
            content = content.replace(/'Deleting\.\.\.'/g, "'Menghapus...'");
            content = content.replace(/'Update'/g, "'Simpan Perubahan'");
            content = content.replace(/'Updating\.\.\.'/g, "'Menyimpan...'");
            content = content.replace(/'Continue'/g, "'Lanjutkan'");
            
            // Same for double quotes
            content = content.replace(/"Cancel"/g, '"Batal"');
            content = content.replace(/"Save"/g, '"Simpan"');
            content = content.replace(/"Saving\.\.\."/g, '"Menyimpan..."');
            content = content.replace(/"Delete"/g, '"Hapus"');
            content = content.replace(/"Deleting\.\.\."/g, '"Menghapus..."');
            content = content.replace(/"Update"/g, '"Simpan Perubahan"');
            content = content.replace(/"Updating\.\.\."/g, '"Menyimpan..."');
            content = content.replace(/"Continue"/g, '"Lanjutkan"');
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated', filePath);
            }
        });
    }
});
