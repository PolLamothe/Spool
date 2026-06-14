// Helper to get safe filename (matching Rust implementation)
export const getSafeName = (title: string): string => {
    const safeTitle = title.split('')
        .filter(c => /[a-zA-Z0-9 -_]/.test(c))
        .join('')
        .trim();
    return safeTitle || "audio";
};
