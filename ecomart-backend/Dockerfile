# ============================================================
# Dockerfile - EcoMart Backend Spring Boot Service
# ============================================================

# Stage 1: Build stage với Maven & OpenJDK 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage với JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

# ============================================================
# NOTE DÀNH CHO TEAM (DATABASE SETUP):
# Mặc định hệ thống đang sử dụng PostgreSQL Container.
# Nếu team muốn chuyển sang làm việc với Microsoft SQL Server (MSSQL):
# 1. Thêm service 'mssql' vào docker-compose.yml ở thư mục gốc repo.
# 2. Đổi SPRING_DATASOURCE_URL thành:
#    jdbc:sqlserver://mssql:1433;databaseName=ecomart_db;encrypt=true;trustServerCertificate=true
# 3. Cập nhật USERNAME=sa & PASSWORD=YourStrong@Passw0rd
# ============================================================
