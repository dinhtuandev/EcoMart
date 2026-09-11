package com.ecomart.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileStorageService {

    String storeFile(MultipartFile file);

    List<String> storeFiles(MultipartFile[] files);

    Resource loadFileAsResource(String fileName);
}
