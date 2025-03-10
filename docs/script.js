document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const outputFormat = document.getElementById('outputFormat');
    const conversionOptions = document.getElementById('conversionOptions');
    const convertBtn = document.getElementById('convertBtn');
    const conversionResult = document.getElementById('conversionResult');
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
        'jpeg': ['png', 'gif', 'bmp', 'webp', 'svg'],
        'png': ['jpg', 'gif', 'bmp', 'webp', 'svg'],
        'gif': ['jpg', 'png', 'bmp', 'webp'],
        'bmp': ['jpg', 'png', 'gif', 'webp', 'svg'],
        'webp': ['jpg', 'png', 'gif', 'bmp', 'svg'],
        'svg': ['jpg', 'png', 'bmp', 'webp'],
        
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

    // Event Listeners
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    convertBtn.addEventListener('click', handleConversion);
    newConversionBtn.addEventListener('click', resetConverter);

    // Handle drag over event
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('active');
    }

    // Handle drag leave event
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
    }

    // Handle file drop event
    function handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            processFile(e.dataTransfer.files[0]);
        }
    }

    // Handle file selection from input
    function handleFileSelect(e) {
        if (fileInput.files.length) {
            processFile(fileInput.files[0]);
        }
    }

    // Process the selected file
    function processFile(file) {
        currentFile = file;
        
        // Display file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // Get file extension and populate output format options
        const fileExtension = getFileExtension(file.name).toLowerCase();
        populateOutputFormats(fileExtension);
        
        // Show conversion options
        dropZone.style.display = 'none';
        conversionOptions.style.display = 'block';
        conversionResult.style.display = 'none';
        
        // Slightly change anime character position
        animeCharacter.style.bottom = '50px';
        animeCharacter.style.right = '50px';
    }

    // Get file extension
    function getFileExtension(filename) {
        return filename.split('.').pop();
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Populate output format options based on input file type
    function populateOutputFormats(inputFormat) {
        // Clear existing options
        outputFormat.innerHTML = '';
        
        // Get available formats for conversion
        const availableFormats = formatMapping[inputFormat] || [];
        
        // Add options to select element
        availableFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            outputFormat.appendChild(option);
        });
        
        // If no formats available, show message
        if (availableFormats.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No conversion available for this file type';
            outputFormat.appendChild(option);
            convertBtn.disabled = true;
        } else {
            convertBtn.disabled = false;
        }
    }

    // Handle conversion process
    function handleConversion() {
        // Show loading state
        convertBtn.textContent = 'Converting...';
        convertBtn.disabled = true;
        
        // Change anime character to working state
        animeCharacter.className = 'anime-character character-converting';
        animeCharacter.innerHTML = '<img src="images/anime-working.svg" alt="Anime character working" class="character-working">';
        
        // Perform the actual conversion
        simulateConversion()
            .then(() => {
                // Show conversion result
                conversionOptions.style.display = 'none';
                conversionResult.style.display = 'block';
                
                // Change anime character to excited state
                animeCharacter.className = 'anime-character character-success';
                animeCharacter.innerHTML = '<img src="images/anime-excited.svg" alt="Anime character excited" class="character-excited">';
            })
            .catch(error => {
                // Show error message
                alert(`Conversion failed: ${error.message}`);
                
                // Change anime character back to happy state
                animeCharacter.className = 'anime-character character-upload';
                animeCharacter.innerHTML = '<img src="images/anime-happy.svg" alt="Anime character" class="character-happy">';
            })
            .finally(() => {
                // Reset convert button
                convertBtn.textContent = 'Convert Now';
                convertBtn.disabled = false;
            });
    }

    // Perform actual file conversion using the FormatConverter
    async function simulateConversion() {
        const selectedFormat = outputFormat.value;
        const originalName = currentFile.name;
        const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
        
        try {
            // Create an instance of the FormatConverter
            const converter = new FormatConverter();
            
            // Perform the actual conversion
            convertedBlob = await converter.convertFile(currentFile, selectedFormat);
            
            // Set download link
            const downloadUrl = URL.createObjectURL(convertedBlob);
            downloadBtn.href = downloadUrl;
            downloadBtn.download = `${baseName}.${selectedFormat}`;
            
            // Add event listener to revoke object URL after download
            downloadBtn.addEventListener('click', () => {
                setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                }, 100);
            });
        } catch (error) {
            console.error('Conversion error:', error);
            alert(`Conversion failed: ${error.message}`);
        }
    }

    // Reset converter to initial state
    function resetConverter() {
        // Reset file input
        fileInput.value = '';
        currentFile = null;
        
        // Reset UI
        dropZone.style.display = 'block';
        conversionOptions.style.display = 'none';
        conversionResult.style.display = 'none';
        
        // Reset anime character to happy state
        animeCharacter.className = 'anime-character character-upload';
        animeCharacter.innerHTML = '<img src="images/anime-happy.svg" alt="Anime character" class="character-happy">';
        
        // Revoke any object URLs
        if (downloadBtn.href && downloadBtn.href.startsWith('blob:')) {
            URL.revokeObjectURL(downloadBtn.href);
        }
    }
});