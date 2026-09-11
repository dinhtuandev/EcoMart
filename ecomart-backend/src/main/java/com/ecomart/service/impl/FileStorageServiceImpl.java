package com.ecomart.service.impl;

import com.ecomart.exception.BadRequestException;
import com.ecomart.exception.ResourceNotFoundException;
import com.ecomart.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif",
            "mp4", "webm", "mov", "mkv"
    );

    public FileStorageServiceImpl(@Value("${app.upload.dir:uploads/evidence}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Khởi tạo thư mục lưu trữ file: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể tạo thư mục lưu trữ file tải lên: " + this.fileStorageLocation, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp tải lên không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng tệp không được hỗ trợ (." + extension + "). Chỉ chấp nhận ảnh (jpg, png, webp, gif) và video (mp4, webm, mov)");
        }

        String newFileName = "evidence_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;

        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Đã lưu file thành công: {} -> {}", originalFilename, newFileName);
            return "/api/v1/files/" + newFileName;
        } catch (IOException ex) {
            log.error("Lỗi khi lưu file: {}", originalFilename, ex);
            throw new RuntimeException("Không thể lưu file " + originalFilename + ". Vui lòng thử lại!", ex);
        }
    }

    @Override
    public List<String> storeFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("Vui lòng chọn ít nhất một tệp để tải lên");
        }

        List<String> fileUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                fileUrls.add(storeFile(file));
            }
        }
        return fileUrls;
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            // Kiểm tra chống Path Traversal attack
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new BadRequestException("Đường dẫn tệp không hợp lệ");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Không tìm thấy tệp: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Không tìm thấy tệp: " + fileName);
        }
    }
}
