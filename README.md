<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Script Combiner</title>
    <!-- CodeMirror Core -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror-one-dark-theme@1.1.1/one-dark.min.css">
    
    <!-- CodeMirror Modes -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/css/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/markdown/markdown.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/yaml/yaml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clike/clike.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/go/go.min.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .file-type-go { color: #00ADD8; }
        .file-type-py { color: #3572A5; }
        .file-type-js { color: #f1e05a; }
        .file-type-ts { color: #2b7489; }
        .file-type-jsx, .file-type-tsx { color: #61dafb; }
        .file-type-html { color: #e34c26; }
        .file-type-css { color: #563d7c; }
        .file-type-json { color: #292929; }

        .CodeMirror { height: 100%;}

        /* Accordion styles */
        #filterAccordionContent {
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }

        #filterAccordionBtn:hover {
            background-color: rgba(75, 85, 99, 0.7);
        }

        #filterAccordionIcon {
            transition: transform 0.3s ease-in-out;
        }

        /* Checkbox styles */
        .form-checkbox {
            appearance: none;
            -webkit-appearance: none;
            width: 1rem;
            height: 1rem;
            border: 2px solid #4B5563;
            border-radius: 0.25rem;
            background-color: transparent;
            cursor: pointer;
            position: relative;
        }

        .form-checkbox:checked {
            background-color: #3B82F6;
            border-color: #3B82F6;
        }

        .form-checkbox:checked::after {
            content: '';
            position: absolute;
            left: 4px;
            top: 1px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }

        .form-checkbox:hover {
            border-color: #6B7280;
        }
    </style>
</head>
<body class="bg-gray-900 text-gray-100">
    <div class="flex min-h-screen p-4">
        <!-- Sidebar -->
        <div class="w-72 bg-gray-800 rounded-lg p-4 mr-4 flex flex-col">
            <h2 class="text-xl font-bold mb-4 text-gray-100">Files & Sections</h2>
            
            <!-- File Type Filters Accordion -->
            <div class="mb-4">
                <button id="filterAccordionBtn" 
                        class="w-full flex justify-between items-center p-2 bg-gray-700 rounded-t-md hover:bg-gray-600 transition-colors">
                    <span class="font-semibold">File Type Filters</span>
                    <svg id="filterAccordionIcon" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="filterAccordionContent" 
                     class="bg-gray-700/50 rounded-b-md p-3 border-t border-gray-600">
                    <div class="flex flex-wrap gap-2">
                        <!-- Filters will be generated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Drop Zone -->
            <div id="dropZone" 
                 class="border-2 border-dashed border-gray-600 rounded-lg p-4 mb-4 text-center hover:border-blue-500 transition-colors">
                <p class="text-sm text-gray-400">Drag & Drop files here</p>
                <p class="text-xs text-gray-500 mt-1">Multiple file types supported</p>
                <button onclick="loadFile()" 
                        class="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded-md transition-colors">
                    Browse Files
                </button>
            </div>
            
            <!-- Outline List -->
            <div id="outline" class="flex-grow overflow-y-auto"></div>
            
            <!-- Button Container -->
            <div class="flex gap-2 mt-4">
                <button onclick="downloadFile()" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    Download
                </button>
            </div>
            <input type="file" id="fileInput" class="hidden" multiple accept="*.*" onchange="handleFileSelect(event)">
        </div>

        <!-- Editor Container -->
        <div class="flex-grow">
            <textarea id="editor"></textarea>
        </div>
    </div>

    <script src="./script.js"></script>
</body>
</html>