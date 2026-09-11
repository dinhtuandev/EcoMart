package com.ecomart.controller;

import com.ecomart.dto.response.ApiResponse;
import com.ecomart.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<String>>> uploadFiles(
            @RequestParam("files") MultipartFile[] files
    ) {
        List<String> fileUrls = fileStorageService.storeFiles(files);
        return ResponseEntity.ok(ApiResponse.success("Tải lên tệp bằng chứng thành công", fileUrls));
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String fileName,
            HttpServletRequest request
    ) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            log.info("Không thể xác định Content-Type của file: {}", fileName);
        }

        if (contentType == null) {
            String lower = fileName.toLowerCase();
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else if (lower.endsWith(".gif")) contentType = "image/gif";
            else if (lower.endsWith(".mp4")) contentType = "video/mp4";
            else if (lower.endsWith(".webm")) contentType = "video/webm";
            else if (lower.endsWith(".mov")) contentType = "video/quicktime";
            else contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
