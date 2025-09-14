/**
 * Converts a Blob object to a base64 string
 * @param {Blob} blob - The Blob to convert to base64
 * @returns {Promise<string>} A promise that resolves with the base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result is a data URL that looks like: data:application/pdf;base64,JVBERi0xLjcKJeLjz9...
      // We only want the base64 part, so we split by comma and take the second part
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Converts a base64 string to a Blob object
 * @param {string} base64 - The base64 string to convert
 * @param {string} mimeType - The MIME type of the resulting blob (e.g., "application/pdf")
 * @returns {Blob} The resulting Blob object
 */
export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};

/**
 * Downloads a blob as a file with the specified filename
 * @param {Blob} blob - The Blob to download
 * @param {string} filename - The name to give the downloaded file
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Gets the file extension from a filename
 * @param {string} filename - The filename to extract extension from
 * @returns {string} The file extension (without the dot)
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Gets the file size in human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} Human-readable file size (e.g., "1.5 MB")
 */
export const getFormattedFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};