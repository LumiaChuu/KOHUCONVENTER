/**
 * File Format Converter Module
 * Handles actual conversion between different file formats
 */

class FormatConverter {
    constructor() {
        // Map of conversion handlers by source and target format
        this.conversionHandlers = {
            // Document conversions (Placeholders - require server-side or heavy client-side libraries)
            'pdf-to-docx': this.pdfToDocx,
            'docx-to-pdf': this.docxToPdf,
            'doc-to-pdf': this.docxToPdf, // Assuming doc can be handled like docx for placeholder
            'pdf-to-txt': this.pdfToText,
            'docx-to-txt': this.docxToText,
            'doc-to-txt': this.docxToText, // Assuming doc can be handled like docx for placeholder
            
            // Image conversions (Client-side capable for some formats)
            'jpg-to-png': this.convertImage,
            'png-to-jpg': this.convertImage,
            'webp-to-jpg': this.convertImage,
            'webp-to-png': this.convertImage,
            'jpg-to-webp': this.convertImage,
            'png-to-webp': this.convertImage,
            'svg-to-png': this.svgToRaster,
            'svg-to-jpg': this.svgToRaster,
            
            // Audio conversions (Placeholders - typically require server-side or WebAssembly)
            'mp3-to-wav': this.convertAudio,
            'wav-to-mp3': this.convertAudio,
            'ogg-to-mp3': this.convertAudio,
            'flac-to-mp3': this.convertAudio,
            
            // Video conversions (Placeholders - almost exclusively require server-side processing)
            'mp4-to-webm': this.convertVideo,
            'webm-to-mp4': this.convertVideo,
            'mp4-to-avi': this.convertVideo,
            'avi-to-mp4': this.convertVideo
        };
    }

    /**
     * Convert a file from one format to another.
     * @param {File} file - The file to convert.
     * @param {string} targetFormat - The format to convert to (e.g., 'png', 'docx').
     * @returns {Promise<Blob>} - A promise that resolves to the converted file as a Blob.
     */
    async convertFile(file, targetFormat) {
        const sourceFormat = this.getFileExtension(file.name).toLowerCase();
        const conversionKey = `${sourceFormat}-to-${targetFormat}`;
        
        const handler = this.conversionHandlers[conversionKey];
        if (handler) {
            try {
                // Call the handler with 'this' context bound to the FormatConverter instance
                return await handler.call(this, file, targetFormat);
            } catch (error) {
                console.error(`Error converting ${sourceFormat} to ${targetFormat}:`, error);
                // Provide a more specific error message if possible, or a generic one
                throw new Error(`Conversion from ${sourceFormat.toUpperCase()} to ${targetFormat.toUpperCase()} failed. ${error.message || 'Please try again.'}`);
            }
        } else {
            console.warn(`No specific handler for ${conversionKey}, attempting fallback.`);
            // Fallback for unsupported direct conversions (might just change MIME type)
            return this.fallbackConversion(file, targetFormat);
        }
    }

    /**
     * Get file extension from filename.
     * @param {string} filename - The filename.
     * @returns {string} - The file extension without the dot.
     */
    getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.') + 1) || filename;
    }

    // --- Placeholder Document Conversion Methods ---
    async pdfToDocx(file) {
        console.warn('pdfToDocx: Placeholder conversion. Actual conversion requires a library.');
        const arrayBuffer = await file.arrayBuffer();
        return new Blob([arrayBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
    }

    async docxToPdf(file) {
        console.warn('docxToPdf: Placeholder conversion. Actual conversion requires a library.');
        const arrayBuffer = await file.arrayBuffer();
        return new Blob([arrayBuffer], { type: 'application/pdf' });
    }

    async pdfToText(file) {
        console.warn('pdfToText: Placeholder conversion. Actual PDF text extraction requires a library.');
        const arrayBuffer = await file.arrayBuffer(); // In real scenario, process this buffer
        const text = `Placeholder: Extracted text from ${file.name}. Full implementation needed.`;
        return new Blob([text], { type: 'text/plain' });
    }

    async docxToText(file) {
        console.warn('docxToText: Placeholder conversion. Actual DOCX text extraction requires a library.');
        const arrayBuffer = await file.arrayBuffer(); // In real scenario, process this buffer
        const text = `Placeholder: Extracted text from ${file.name}. Full implementation needed.`;
        return new Blob([text], { type: 'text/plain' });
    }

    // --- Image Conversion Methods (Client-Side) ---
    async convertImage(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    let mimeType;
                    switch (targetFormat.toLowerCase()) {
                        case 'jpg':
                        case 'jpeg':
                            mimeType = 'image/jpeg';
                            break;
                        case 'png':
                            mimeType = 'image/png';
                            break;
                        case 'webp':
                            mimeType = 'image/webp';
                            break;
                        default:
                            // Should not happen if formatMapping is correct
                            reject(new Error(`Unsupported target image format: ${targetFormat}`));
                            return;
                    }
                    
                    canvas.toBlob(blob => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob conversion failed.'));
                        }
                    }, mimeType, 0.92); // Quality for JPEG/WEBP
                };
                img.onerror = () => reject(new Error('Failed to load image for conversion. The image may be corrupt or in an unsupported format.'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read image file.'));
            reader.readAsDataURL(file);
        });
    }

    async svgToRaster(file, targetFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e_reader) => {
                const svgText = e_reader.target.result;
                
                const img = new Image();
                // For security and proper rendering, it's often better to use a data URL for the SVG source
                const svgBlob = new Blob([svgText], {type: 'image/svg+xml;charset=utf-8'});
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    // Use naturalWidth/Height for SVG if viewBox is tricky or for consistency
                    const canvas = document.createElement('canvas');
                    // Attempt to get dimensions from SVG viewBox or attributes, else use img natural dimensions
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                    const svgElement = svgDoc.documentElement;
                    
                    let width = parseFloat(svgElement.getAttribute('width')) || (svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.width) || img.naturalWidth || 300;
                    let height = parseFloat(svgElement.getAttribute('height')) || (svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.height) || img.naturalHeight || 150;
                    
                    // Cap dimensions to avoid overly large canvases from malformed SVGs
                    width = Math.min(width, 4096); 
                    height = Math.min(height, 4096);

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    // Optionally fill canvas with a background color if SVG transparency is not desired for JPG
                    if (targetFormat.toLowerCase() === 'jpg' || targetFormat.toLowerCase() === 'jpeg') {
                        ctx.fillStyle = '#FFFFFF'; // White background
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const mimeType = (targetFormat.toLowerCase() === 'jpg' || targetFormat.toLowerCase() === 'jpeg') ? 'image/jpeg' : 'image/png';
                    canvas.toBlob(blob => {
                        URL.revokeObjectURL(url); // Clean up blob URL
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob conversion failed for SVG.'));
                        }
                    }, mimeType, 0.92); // Quality for JPEG
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load SVG into image element. The SVG might be malformed or contain unsupported features.'));
                };
                img.src = url; // Use object URL for image source
            };
            reader.onerror = () => reject(new Error('Failed to read SVG file.'));
            reader.readAsText(file); // Read SVG as text
        });
    }

    // --- Placeholder Audio/Video Conversion Methods ---
    async convertAudio(file, targetFormat) {
        console.warn(`convertAudio to ${targetFormat}: Placeholder. Actual audio conversion is complex.`);
        const arrayBuffer = await file.arrayBuffer();
        let mimeType = 'audio/mpeg'; // Default to mp3
        if (targetFormat === 'wav') mimeType = 'audio/wav';
        else if (targetFormat === 'ogg') mimeType = 'audio/ogg';
        else if (targetFormat === 'flac') mimeType = 'audio/flac';
        return new Blob([arrayBuffer], { type: mimeType });
    }

    async convertVideo(file, targetFormat) {
        console.warn(`convertVideo to ${targetFormat}: Placeholder. Actual video conversion is highly resource-intensive.`);
        const arrayBuffer = await file.arrayBuffer();
        let mimeType = 'video/mp4'; // Default to mp4
        if (targetFormat === 'webm') mimeType = 'video/webm';
        else if (targetFormat === 'avi') mimeType = 'video/x-msvideo';
        return new Blob([arrayBuffer], { type: mimeType });
    }

    /**
     * Fallback conversion for unsupported format pairs.
     * This typically just changes the MIME type without actual content conversion.
     * @param {File} file - The file to "convert".
     * @param {string} targetFormat - The target format.
     * @returns {Promise<Blob>} - A promise that resolves to the "converted" file as a Blob.
     */
    async fallbackConversion(file, targetFormat) {
        console.warn(`Using fallback conversion for ${file.name} to ${targetFormat}. This will not actually convert the file content, only attempt to set a MIME type.`);
        const arrayBuffer = await file.arrayBuffer();
        
        let mimeType = 'application/octet-stream'; // Generic default
        switch (targetFormat.toLowerCase()) {
            case 'pdf': mimeType = 'application/pdf'; break;
            case 'docx': mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
            case 'txt': mimeType = 'text/plain'; break;
            case 'jpg': case 'jpeg': mimeType = 'image/jpeg'; break;
            case 'png': mimeType = 'image/png'; break;
            case 'webp': mimeType = 'image/webp'; break;
            case 'svg': mimeType = 'image/svg+xml'; break;
            case 'mp3': mimeType = 'audio/mpeg'; break;
            case 'wav': mimeType = 'audio/wav'; break;
            case 'mp4': mimeType = 'video/mp4'; break;
            case 'webm': mimeType = 'video/webm'; break;
            // Add other common types as needed
        }
        
        return new Blob([arrayBuffer], { type: mimeType });
    }
}

// Export the converter class to the window scope if this script is included directly in HTML
if (typeof window !== 'undefined') {
    window.FormatConverter = FormatConverter;
}
