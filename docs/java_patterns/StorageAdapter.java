package com.tms.patterns.adapter;

/**
 * DESIGN PATTERN IMPLEMENTATION: Adapter Pattern (Java)
 * 
 * Pattern: Adapter (Structural)
 * Purpose: Converts local storage interface to cloud S3 interface seamlessly.
 */

interface StorageAdapterInterface {
    String uploadFile(String fileName, byte[] content);
}

class LocalStorageAdapterImpl implements StorageAdapterInterface {
    @Override
    public String uploadFile(String fileName, byte[] content) {
        return "/uploads/local_" + fileName;
    }
}

class CloudStorageAdapterImpl implements StorageAdapterInterface {
    @Override
    public String uploadFile(String fileName, byte[] content) {
        return "https://cdn.tms.edu/s3/" + fileName;
    }
}

public class StorageAdapter {
    private StorageAdapterInterface adapter;

    public StorageAdapter(StorageAdapterInterface adapter) {
        this.adapter = adapter;
    }

    public String save(String filename, byte[] data) {
        return adapter.uploadFile(filename, data);
    }
}
