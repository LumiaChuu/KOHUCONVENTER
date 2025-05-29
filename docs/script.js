document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName'); // Renamed for clarity
    const fileSizeDisplay = document.getElementById('fileSize'); // Renamed for clarity
    const outputFormatSelect = document.getElementById('outputFormat'); // Renamed for clarity
    const conversionOptionsDiv = document.getElementById('conversionOptions'); // Renamed for clarity
    const convertBtn = document.getElementById('convertBtn');
    const conversionResultDiv = document.getElementById('conversionResult'); // Renamed for clarity
    const downloadBtn = document.getElementById('downloadBtn');
    const newConversionBtn = document.getElementById('newConversionBtn');
    const animeCharacter = document.getElementById('animeCharacter');

    // Format mapping - defines which formats each file type can be converted to
    const formatMapping = {
        // Document formats
        'pdf': ['docx', 'txt', 'rtf', 'odt'],
        'docx': ['pdf', 'txt', 'rtf', 'odt'],
        'doc': ['pdf', 'docx', 'txt', 'rtf', 'odt'],
        'txt': ['pdf', 'docx', 'rtf', 'odt'],
        'rtf': ['pdf', 'docx', 'txt', 'odt'],
        'odt': ['pdf', 'docx', 'txt', 'rtf'],
        
        // Image formats
        'jpg': ['png', 'gif', 'bmp', 'webp', 'svg'],
        'jpeg': ['png', 'gif', 'bmp', 'webp', 'svg'], // jpeg is alias for jpg
        'png': ['jpg', 'gif', 'bmp', 'webp', 'svg'],
        'gif': ['jpg', 'png', 'bmp', 'webp'], // GIF to SVG is less common directly
        'bmp': ['jpg', 'png', 'gif', 'webp', 'svg'],
        'webp': ['jpg', 'png', 'gif', 'bmp', 'svg'],
        'svg': ['png', 'jpg', 'webp'], // SVG to BMP/GIF is less common directly via canvas
        
        // Audio formats
        'mp3': ['wav', 'ogg', 'flac', 'aac'],
        'wav': ['mp3', 'ogg', 'flac', 'aac'],
        'ogg': ['mp3', 'wav', 'flac', 'aac'],
        'flac': ['mp3', 'wav', 'ogg', 'aac'],
        'aac': ['mp3', 'wav', 'ogg', 'flac'],
        
        // Video formats
        'mp4': ['avi', 'mov', 'mkv', 'webm'],
        'avi': ['mp4', 'mov', 'mkv', 'webm'],
        'mov': ['mp4', 'avi', 'mkv', 'webm'],
        'mkv': ['mp4', 'avi', 'mov', 'webm'],
        'webm': ['mp4', 'avi', 'mov', 'mkv']
    };

    // Variables to store the current file
    let currentFile = null;
    let convertedBlob = null;
    let downloadUrl = null; // Store the object URL to revoke it properly

    // Event Listeners
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', handleConversion);
    newConversionBtn.addEventListener('click', resetConverter);

    // Single event listener for download button
    downloadBtn.addEventListener('click', function() {
        if (this.href && this.href.startsWith('blob:')) {
            // URL.revokeObjectURL should be called after the download has initiated.
            // A timeout helps ensure this.
            const urlToRevoke = this.href;
            setTimeout(() => {
                URL.revokeObjectURL(urlToRevoke);
                downloadUrl = null; // Clear the stored URL
            }, 150);
        }
        // Allow default link behavior (download)
    });

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('active');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
    }

    function handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    }

    function handleFileSelect(e) {
        if (fileInput.files && fileInput.files.length > 0) {
            processFile(fileInput.files[0]);
        }
    }

    function processFile(file) {
        currentFile = file;
        
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = formatFileSize(file.size);
        
        const fileExtension = getFileExtension(file.name).toLowerCase();
        populateOutputFormats(fileExtension);
        
        dropZone.style.display = 'none';
        conversionOptionsDiv.style.display = 'block';
        conversionResultDiv.style.display = 'none';
        
        // Change anime character to a "file selected" state using classes
        animeCharacter.className = 'anime-character character-file-selected'; // Define .character-file-selected in CSS
        // Ensure the image source is appropriate for this state if needed
        // animeCharacter.innerHTML = '<img src="images/anime-thinking.svg" alt="Anime character thinking" class="character-happy">';
    }

    function getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1) || filename;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(k))); // Ensure i is not negative
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function populateOutputFormats(inputFormat) {
        outputFormatSelect.innerHTML = ''; // Clear existing options
        
        const availableFormats = formatMapping[inputFormat] || [];
        
        if (availableFormats.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No conversion available for this file type';
            outputFormatSelect.appendChild(option);
            convertBtn.disabled = true;
        } else {
            availableFormats.forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format.toUpperCase();
                outputFormatSelect.appendChild(option);
            });
            convertBtn.disabled = false;
        }
    }

    function displayError(message) {
        // TODO: Implement a more user-friendly error display instead of alert
        // For example, show the message in a dedicated div within .converter-box
        console.error(message); // Keep console log for debugging
        alert(message); // Placeholder, replace with better UI feedback
    }

    async function handleConversion() {
        if (!currentFile || !outputFormatSelect.value) {
            displayError('Please select a file and a target format.');
            return;
        }

        convertBtn.textContent = 'Converting...';
        convertBtn.disabled = true;
        
        animeCharacter.className = 'anime-character character-converting';
        animeCharacter.innerHTML = '<img src="images/anime-working.svg" alt="Anime character working" class="character-working">'; //
        
        try {
            const selectedFormat = outputFormatSelect.value;
            const originalName = currentFile.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
            
            const converter = new FormatConverter(); // Assuming FormatConverter is globally available
            convertedBlob = await converter.convertFile(currentFile, selectedFormat); //
            
            if (downloadUrl) { // Revoke previous blob URL if exists
                URL.revokeObjectURL(downloadUrl);
            }
            downloadUrl = URL.createObjectURL(convertedBlob); //
            
            downloadBtn.href = downloadUrl; //
            downloadBtn.download = `${baseName}.${selectedFormat}`; //
            
            conversionOptionsDiv.style.display = 'none';
            conversionResultDiv.style.display = 'block';
            
            animeCharacter.className = 'anime-character character-success';
            animeCharacter.innerHTML = '<img src="images/anime-excited.svg" alt="Anime character excited" class="character-excited">'; //

        } catch (error) {
            displayError(`Conversion failed: ${error.message}`);
            animeCharacter.className = 'anime-character character-upload'; // Reset to initial
            animeCharacter.innerHTML = '<img src="images/anime-happy.svg" alt="Anime character" class="character-happy">'; //
        } finally {
            convertBtn.textContent = 'Convert Now';
            // convertBtn.disabled = false; // Keep disabled until a new file or format is chosen or reset
        }
    }

    function resetConverter() {
        fileInput.value = ''; // Clear file input
        currentFile = null;
        
        if (downloadUrl) { // Revoke object URL if one was created
            URL.revokeObjectURL(downloadUrl);
            downloadUrl = null;
        }
        downloadBtn.removeAttribute('href'); // Clear href
        downloadBtn.removeAttribute('download');


        dropZone.style.display = 'block';
        conversionOptionsDiv.style.display = 'none';
        conversionResultDiv.style.display = 'none';
        
        fileNameDisplay.textContent = 'No file selected';
        fileSizeDisplay.textContent = '0 KB';
        outputFormatSelect.innerHTML = ''; // Clear format options
        
        animeCharacter.className = 'anime-character character-upload';
        animeCharacter.innerHTML = '<img src="images/anime-happy.svg" alt="Anime character" class="character-happy">'; //
        
        convertBtn.disabled = true; // Disable convert button until new file selected
        convertBtn.textContent = 'Convert Now';
    }
});
