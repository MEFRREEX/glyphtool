const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadSection = document.getElementById('uploadSection');
const glyphContainer = document.getElementById('glyphContainer');
const glyphGrid = document.getElementById('glyphGrid');
const glyphInfo = document.getElementById('glyphInfo');
const notification = document.getElementById('notification');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--accent)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadSection.style.borderColor = 'var(--border)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--border)';
    
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

browseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFile(fileInput.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.match('image.*')) {
        alert('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        processImage(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
}

function processImage(imageSrc, fileName) {
    const img = new Image();
    img.onload = () => {
        const glyphName = fileName.match(/glyph_([A-Za-z0-9]+)\./i)?.[1] || 'E1';
        
        glyphContainer.style.display = 'block';
        glyphInfo.textContent = `${fileName} (${img.width}×${img.height})`;
        glyphGrid.innerHTML = '';
        
        const cellWidth = img.width / 16;
        const cellHeight = img.height / 16;
        
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const cell = document.createElement('div');
                cell.className = 'glyph-cell';
                
                const canvas = document.createElement('canvas');
                canvas.width = cellWidth;
                canvas.height = cellHeight;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(
                    img,
                    x * cellWidth, y * cellHeight, cellWidth, cellHeight,
                    0, 0, cellWidth, cellHeight
                );
                
                const cellImg = document.createElement('img');
                cellImg.src = canvas.toDataURL();
                
                const tooltip = document.createElement('div');
                tooltip.className = 'glyph-tooltip';
                if (y === 0) {
                    tooltip.style.bottom = 'auto';
                    tooltip.style.top = '100%';
                }
                
                const xHex = x.toString(16).toUpperCase();
                const yHex = y.toString(16).toUpperCase();
                const unicodeEscape = `\\u${glyphName}${yHex}${xHex}`;
                const unicodeSymbol = JSON.parse(`"${unicodeEscape}"`);
                
                tooltip.textContent = unicodeEscape;
                cell.appendChild(tooltip);
                cell.appendChild(cellImg);
                
                cell.addEventListener('click', () => {
                    copyToClipboard(unicodeSymbol);
                    showNotification();
                });
                
                glyphGrid.appendChild(cell);
            }
        }
        
        glyphContainer.scrollIntoView({ behavior: 'smooth' });
    };
    img.src = imageSrc;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}