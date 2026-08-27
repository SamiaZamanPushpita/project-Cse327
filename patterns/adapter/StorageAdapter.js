/**
 * DESIGN PATTERN IMPLEMENTATION: Adapter Pattern
 * 
 * Pattern: Adapter (Structural)
 * Purpose: Provides a standardized storage interface (IStorageAdapter) so that the application 
 *          can transparently save files using Local File Storage or Cloud Storage (e.g. S3 / CDN)
 *          without changing backend controller logic.
 */

const fs = require('fs');
const path = require('path');

// Target Storage Interface
class IStorageAdapter {
    async uploadFile(fileBuffer, fileName, mimeType) {
        throw new Error('uploadFile() must be implemented.');
    }

    async getDownloadUrl(fileIdentifier) {
        throw new Error('getDownloadUrl() must be implemented.');
    }
}

// Concrete Adapter 1: Local File System Adapter
class LocalStorageAdapter extends IStorageAdapter {
    constructor(uploadDir = path.join(__dirname, '../../uploads')) {
        super();
        this.uploadDir = uploadDir;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(fileBuffer, fileName) {
        const sanitizedName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
        const filePath = path.join(this.uploadDir, sanitizedName);
        
        fs.writeFileSync(filePath, fileBuffer);
        console.log(`💾 [Adapter Pattern - LocalStorage] File saved locally at: ${filePath}`);
        
        return {
            storageType: 'LOCAL',
            fileKey: sanitizedName,
            url: `/uploads/${sanitizedName}`
        };
    }

    async getDownloadUrl(fileKey) {
        return `/uploads/${fileKey}`;
    }
}

// Concrete Adapter 2: Cloud Storage Adapter (Mock AWS S3 / Cloudflare R2)
class MockCloudStorageAdapter extends IStorageAdapter {
    constructor(bucketName = 'tms-materials-bucket') {
        super();
        this.bucketName = bucketName;
    }

    async uploadFile(fileBuffer, fileName) {
        const sanitizedName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
        const mockS3Url = `https://cdn.tutor-management.edu/${this.bucketName}/${sanitizedName}`;
        
        console.log(`☁️ [Adapter Pattern - CloudStorage] Uploaded ${fileName} to S3 bucket '${this.bucketName}' -> ${mockS3Url}`);
        
        return {
            storageType: 'CLOUD_S3',
            fileKey: sanitizedName,
            url: mockS3Url
        };
    }

    async getDownloadUrl(fileKey) {
        return `https://cdn.tutor-management.edu/${this.bucketName}/${fileKey}`;
    }
}

// Storage Engine Manager
class StorageService {
    constructor(adapter = new LocalStorageAdapter()) {
        this.adapter = adapter;
    }

    setAdapter(adapter) {
        console.log(`🔌 [Adapter Pattern] Switched Storage Engine to: ${adapter.constructor.name}`);
        this.adapter = adapter;
    }

    async saveMaterial(fileBuffer, fileName) {
        return await this.adapter.uploadFile(fileBuffer, fileName);
    }
}

module.exports = {
    StorageService,
    LocalStorageAdapter,
    MockCloudStorageAdapter
};
