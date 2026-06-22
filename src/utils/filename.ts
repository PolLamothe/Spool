// Helper to get safe filename (matching Rust implementation)
export const getSafeName = (title: string): string => {
    const safeTitle = title.split('')
        .filter(c => /[\p{L}\p{N} \-_]/u.test(c))
        .join('')
        .trim();
    return safeTitle || "audio";
};
