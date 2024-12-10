// script.js
const VALID_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sass', '.less', 
    '.vue', '.svelte', '.astro', '.webp', '.wasm', '.json', '.yaml', '.yml', 
    '.toml', '.xml', '.env', '.ini', '.conf', '.config', '.lock', '.md', '.csv', 
    '.sql', '.sqlite', '.gd', '.gdscript', '.tscn', '.tres', '.res', '.import', 
    '.cfg', '.godot', '.cs', '.unity', '.prefab', '.mat', '.asset', '.meta', 
    '.anim', '.controller', '.physicMaterial', '.mixer', '.shadergraph', '.shader', 
    '.uasset', '.umap', '.cpp', '.h', '.uplugin', '.uproject', '.blueprint', 
    '.umeta', '.ini', '.ue4', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp3', 
    '.wav', '.ogg', '.ttf', '.otf', '.glb', '.gltf', '.obj', '.fbx',
    '.py', '.pyw', '.pyc', '.pyo', '.pyx',
    '.go', '.mod', '.sum'
];

// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "text",
    theme: "one-dark",
    touchscreen: true,
    scrollbarStyle: "simple",
    styleActiveLine: true,
    showCursorWhenSelecting: true,
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentWithTabs: false,
    smartIndent: true,
    height: "100%",
    // Add these options
    viewportMargin: Infinity,
    scrollPastEnd: true,
    extraKeys: {
        "Tab": function(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                // Use tabs for Go, spaces for others
                const mode = cm.getOption("mode");
                if (mode === "go") {
                    cm.replaceSelection("\t");
                } else {
                    cm.replaceSelection("    ");
                }
            }
        }
    }
});

function getFileMode(filename) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const modeMap = {
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.ts': 'javascript',
        '.tsx': 'jsx',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'css',
        '.sass': 'css',
        '.less': 'css',
        '.vue': 'vue',
        '.xml': 'xml',
        '.md': 'markdown',
        '.py': 'python',
        '.pyw': 'python',
        '.pyc': 'python',
        '.pyo': 'python',
        '.pyx': 'python',
        '.cpp': 'clike',
        '.h': 'clike',
        '.cs': 'clike',
        '.json': 'javascript',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.toml': 'toml',
        '.go': 'go',
        '.mod': 'go',
        '.sum': 'go'
    };
    return modeMap[ext] || 'text';
}

function generateFileTypeFilters() {
    const filterContainer = document.querySelector('#filterAccordionContent .flex');
    filterContainer.innerHTML = '';
    
    VALID_EXTENSIONS.forEach(ext => {
        const extName = ext.substring(1);
        const label = document.createElement('label');
        label.className = 'flex items-center space-x-2 hover:bg-gray-600/50 p-1 rounded cursor-pointer';
        label.innerHTML = `
            <input type="checkbox" checked class="form-checkbox text-blue-500" id="filter-${extName}">
            <span class="file-type-${extName}">${ext}</span>
        `;
        filterContainer.appendChild(label);
    });
}

function setupAccordion() {
    const button = document.getElementById('filterAccordionBtn');
    const content = document.getElementById('filterAccordionContent');
    const icon = document.getElementById('filterAccordionIcon');
    let isOpen = false; // Start closed

    function toggleAccordion() {
        isOpen = !isOpen;
        if (isOpen) {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            icon.style.transform = 'rotate(0deg)';
        } else {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            icon.style.transform = 'rotate(-90deg)';
        }
    }

    // Add styles for smooth transition
    content.style.transition = 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out';
    content.style.overflow = 'hidden';
    
    // Initialize in closed state
    content.style.maxHeight = '0';
    content.style.opacity = '0';
    icon.style.transform = 'rotate(-90deg)';

    button.addEventListener('click', toggleAccordion);
}

function updateOutline() {
    const content = editor.getValue();
    const lines = content.split("\n");
    const outline = document.getElementById("outline");
    outline.innerHTML = "";

    for (let i = 0; i < lines.length; i++) {
        if (i + 2 < lines.length &&
            lines[i].trim() === "# -------------------------------------------------------------------------" &&
            lines[i + 1].trim().startsWith("# ") &&
            lines[i + 2].trim() === "# -------------------------------------------------------------------------") {
            
            const sectionName = lines[i + 1].trim().substring(2);
            const li = document.createElement("div");
            li.className = "flex items-center justify-between p-2 mb-2 bg-gray-700 rounded-md hover:bg-gray-600 group";
            
            const nameSpan = document.createElement("span");
            nameSpan.textContent = sectionName;
            const fileTypeClass = `file-type-${sectionName.split('.').pop()}`;
            nameSpan.className = `cursor-pointer flex-grow ${fileTypeClass}`;
            nameSpan.onclick = () => {
                editor.scrollIntoView({line: i, ch: 0});
                editor.setCursor({line: i + 1, ch: 0});
                editor.focus();
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "×";
            deleteBtn.className = "opacity-0 group-hover:opacity-100 ml-2 px-2 text-red-400 hover:text-red-600 font-bold transition-opacity";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteSection(i);
            };

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            outline.appendChild(li);
        }
    }
}

function deleteSection(startIndex) {
    const content = editor.getValue();
    const lines = content.split("\n");
    let endIndex = lines.length;

    for (let i = startIndex + 3; i < lines.length; i++) {
        if (lines[i].trim() === "# -------------------------------------------------------------------------" &&
            i + 2 < lines.length &&
            lines[i + 1].trim().startsWith("# ") &&
            lines[i + 2].trim() === "# -------------------------------------------------------------------------") {
            endIndex = i;
            break;
        }
    }

    lines.splice(startIndex, endIndex - startIndex);
    editor.setValue(lines.join("\n"));
    updateOutline();
}

function isFileTypeEnabled(filename) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const filterElement = document.getElementById(`filter-${ext.substring(1)}`);
    return filterElement ? filterElement.checked : false;
}

async function handleFileSelect(event) {
    showLoading();
    const files = Array.from(event.target.files || event.dataTransfer.files);
    
    const validFiles = files
        .filter(file => {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            return VALID_EXTENSIONS.includes(ext) && isFileTypeEnabled(file.name);
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    if (validFiles.length === 0) {
        alert('Please select supported file types');
        resetDropZone();
        return;
    }

    try {
        for (const file of validFiles) {
            await appendFileContent(file);
        }
    } catch (error) {
        console.error('Error loading files:', error);
        alert('Error loading files');
    } finally {
        resetDropZone();
    }
}

function appendFileContent(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileName = file.name;
            const fileContent = e.target.result;
            
            let processedContent = fileContent;
            if (fileName.endsWith('.go') || fileName.endsWith('.py')) {
                processedContent = fileContent.replace(/\r\n/g, '\n');
            }

            const header = `\n# -------------------------------------------------------------------------
# ${fileName}
# -------------------------------------------------------------------------\n`;
            
            const currentContent = editor.getValue();
            const newContent = currentContent + header + processedContent;
            
            editor.setValue(newContent);
            editor.setOption('mode', getFileMode(fileName));
            
            resolve();
        };
        reader.readAsText(file);
    });
}

// Drag and drop handlers
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500');
    handleFileSelect(e);
});

function loadFile() {
    const fileInput = document.getElementById("fileInput");
    fileInput.value = '';
    fileInput.click();
}

function downloadFile() {
    const content = editor.getValue();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combined_files.txt";
    a.click();
    URL.revokeObjectURL(url);
}

function showLoading() {
    dropZone.innerHTML = `
        <div class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">Loading files...</span>
        </div>
    `;
}

function resetDropZone() {
    dropZone.innerHTML = `
        <p class="text-sm text-gray-400">Drag & Drop files here</p>
        <p class="text-xs text-gray-500 mt-1">Multiple file types supported</p>
        <button onclick="loadFile()" 
                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded-md transition-colors">
            Browse Files
        </button>
    `;
}

function selectAllCode() {
    editor.focus();
    editor.execCommand('selectAll');
}

function copyCode() {
    editor.focus();
    const content = editor.getValue();
    
    // Try using the modern navigator.clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(content)
            .then(() => {
                showCopyFeedback();
            })
            .catch(() => {
                fallbackCopy(content);
            });
    } else {
        fallbackCopy(content);
    }
}

function fallbackCopy(text) {
    // Fallback for older browsers or non-HTTPS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Handle iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, 999999);
    } else {
        textarea.select();
    }
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text to clipboard');
    }
    
    document.body.removeChild(textarea);
}

function showCopyFeedback() {
    const originalText = document.querySelector('button:nth-child(2)').textContent;
    const button = document.querySelector('button:nth-child(2)');
    button.textContent = 'Copied!';
    button.classList.remove('bg-green-600', 'hover:bg-green-700');
    button.classList.add('bg-gray-600');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-gray-600');
        button.classList.add('bg-green-600', 'hover:bg-green-700');
    }, 2000);
}

// Scroll button functionality
function setupScrollButtons() {
    if (!editor) return;
    
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const scrollBottomBtn = document.getElementById('scrollBottomBtn');
    
    if (!scrollTopBtn || !scrollBottomBtn) return;
    
    scrollTopBtn.addEventListener('click', () => {
        editor.scrollTo(null, 0);
        editor.setCursor(0, 0);
        editor.focus();
    });
    
    scrollBottomBtn.addEventListener('click', () => {
        const lastLine = editor.lastLine();
        editor.scrollTo(null, editor.heightAtLine(lastLine));
        editor.setCursor(lastLine, 0);
        editor.focus();
    });
    
    editor.on('scroll', () => {
        const info = editor.getScrollInfo();
        const topBtnVisible = info.top > 100;
        const bottomBtnVisible = info.top < (info.height - info.clientHeight - 100);
        
        scrollTopBtn.classList.toggle('scroll-btn-visible', topBtnVisible);
        scrollBottomBtn.classList.toggle('scroll-btn-visible', bottomBtnVisible);
    });
    
    // Initial visibility check
    setTimeout(() => {
        const info = editor.getScrollInfo();
        if (info.height > info.clientHeight) {
            scrollBottomBtn.classList.add('scroll-btn-visible');
        }
    }, 100);
}

// Initialize
editor.setValue('');
editor.on("change", updateOutline);
document.addEventListener('DOMContentLoaded', () => {
    generateFileTypeFilters();
    setupAccordion();
    setupScrollButtons();
});