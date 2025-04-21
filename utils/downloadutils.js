// commands/download/_utils/downloadUtils.js
const fs = require('fs');
const path = require('path');

module.exports = {
    sanitizeFilename: (name) => name.replace(/[^\w\s]/gi, '_'),
    cleanTempFiles: () => {
        const tempDir = './temp';
        fs.readdirSync(tempDir).forEach(file => {
            fs.unlinkSync(path.join(tempDir, file));
        });
    },
    getFileSize: (path) => {
        return (fs.statSync(path).size / (1024 * 1024)).toFixed(2);
    }
};
