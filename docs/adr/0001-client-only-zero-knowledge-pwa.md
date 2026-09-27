# Client-Only Zero-Knowledge PWA Architecture

MyMeds manages sensitive medical and medication intake data without a backend server or remote user accounts. All medication records, dosages, and appointments are stored locally in IndexedDB, encrypted with AES-GCM (256-Bit) using a key derived via PBKDF2 (100,000 iterations, SHA-256) from a user-provided passphrase. This guarantees zero-knowledge data privacy, offline usability, and eliminates server hosting costs and data leak risks.
