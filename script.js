// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    theme: "one-dark",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: true,
    autoCloseBrackets: true,
    matchBrackets: true,
});

// File type validation
const VALID_EXTENSIONS = ['.gd', '.tscn', '.tres', '.res'];

function getFileTypeClass(filename) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return `file-type-${ext.substring(1)}`;
}

// Function to get section content
function getSectionContent(startIndex, endIndex, lines) {
    return lines.slice(startIndex, endIndex).join('\n');
}

// Function to update the outline
function updateOutline() {
    const content = editor.getValue();
    const lines = content.split("\n");
    const outline = document.getElementById("outline");
    outline.innerHTML = "";

    for (let i = 0; i < lines.length; i++) {
        // Check for the three-line pattern
        if (i + 2 < lines.length &&
            lines[i].trim() === "# -------------------------------------------------------------------------" &&
            lines[i + 1].trim().startsWith("# ") &&
            lines[i + 2].trim() === "# -------------------------------------------------------------------------") {
            
            const sectionName = lines[i + 1].trim().substring(2);
            const li = document.createElement("div");
            li.className = "flex items-center justify-between p-2 mb-2 bg-gray-700 rounded-md hover:bg-gray-600 group";
            
            const nameSpan = document.createElement("span");
            nameSpan.textContent = sectionName;
            const fileTypeClass = getFileTypeClass(sectionName);
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

// Update the delete section function to handle the three-line header
function deleteSection(startIndex) {
    const content = editor.getValue();
    const lines = content.split("\n");
    let endIndex = lines.length;

    // Look for the start of the next section
    for (let i = startIndex + 3; i < lines.length; i++) {
        if (lines[i].trim() === "# -------------------------------------------------------------------------" &&
            i + 2 < lines.length &&
            lines[i + 1].trim().startsWith("# ") &&
            lines[i + 2].trim() === "# -------------------------------------------------------------------------") {
            endIndex = i;
            break;
        }
    }

    // Remove the section
    lines.splice(startIndex, endIndex - startIndex);
    editor.setValue(lines.join("\n"));
    updateOutline();
}

// Add change listener to update outline
editor.on("change", updateOutline);

// Function to check if file type is enabled in filters
function isFileTypeEnabled(filename) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const filterElement = document.getElementById(`filter-${ext.substring(1)}`);
    return filterElement ? filterElement.checked : false;
}

// Handle file select function
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
        alert('Please select valid Godot files (.gd, .tscn, .tres, .res)');
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

// Update the appendFileContent function to ensure consistent header format
function appendFileContent(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileName = file.name;
            const header = `\n# -------------------------------------------------------------------------
# ${fileName}
# -------------------------------------------------------------------------\n`;
            const currentContent = editor.getValue();
            const newContent = currentContent + header + e.target.result;
            editor.setValue(newContent);
            resolve();
        };
        reader.readAsText(file);
    });
}

// Initialize drag and drop
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

// Load file function
function loadFile() {
    const fileInput = document.getElementById("fileInput");
    fileInput.value = '';
    fileInput.click();
}

// Download file function
function downloadFile() {
    const content = editor.getValue();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "godot_combined_files.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Loading indicator functions
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
        <p class="text-sm text-gray-400">Drag & Drop Godot files here</p>
        <p class="text-xs text-gray-500 mt-1">Supported: .gd, .tscn, .tres, .res</p>
        <button onclick="loadFile()" 
                class="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded-md transition-colors">
            Browse Files
        </button>
    `;
}

// Initialize with empty editor
editor.setValue('');