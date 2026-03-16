/**
 * Normalizes file URLs from the backend to work correctly in the frontend.
 * Handles absolute URLs, relative media paths, and fixes common protocol issues.
 */
export const getFullFileUrl = (fileUrl: string): string => {
    if (!fileUrl) return "";

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const MEDIA_BASE = API_URL.replace('/api/v1', '') + '/media/';
    
    const decodedUrl = decodeURIComponent(fileUrl);
    
    // Check if the URL contains multiple http(s) protocols (common when backend prepends its own URL)
    const allHttpMatches = Array.from(decodedUrl.matchAll(/https?:\/+/g));
    
    let finalUrl = fileUrl;
    
    if (allHttpMatches.length > 1) {
        // Take the last one (most likely the actual file URL like Unsplash or AWS)
        const lastMatch = allHttpMatches[allHttpMatches.length - 1];
        finalUrl = decodedUrl.substring(lastMatch.index!);
    } else if (fileUrl.startsWith('/')) {
        // Root-relative path
        finalUrl = `${API_URL.replace('/api/v1', '')}${fileUrl}`;
    } else if (!fileUrl.startsWith('http')) {
        // Media-relative path
        finalUrl = `${MEDIA_BASE}${fileUrl}`;
    }
    
    // Ensure absolute URLs have correct double slashes
    if (finalUrl.startsWith('http')) {
        finalUrl = finalUrl.replace(/^(https?:\/+)/, (match) => match.includes('s') ? 'https://' : 'http://');
    }
    
    return finalUrl;
};
