/**
 * Converts a Blob into a URL that can be used as a source for an Image component.
 * @param {Blob} blob - The Blob to be converted.
 * @returns {string} - The URL created from the Blob.
 * @throws Will throw an error if the Blob is invalid.
 */
export const createImageUrlFromBlob = (blob: Blob): string => {
    if (!blob) {
        throw new Error('The provided Blob is invalid.');
    }
    return URL.createObjectURL(blob);
};