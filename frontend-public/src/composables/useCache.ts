export const CACHE_SEED = 0xec0d0039; // "магическое число" для хэширования
export const hash = (key: string) => key.split('').reduce(
    (acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) ^ CACHE_SEED, 0
);
