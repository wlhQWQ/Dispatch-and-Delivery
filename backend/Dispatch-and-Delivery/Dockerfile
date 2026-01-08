# 使用 Java 21
FROM eclipse-temurin:21-jdk

WORKDIR /app

# 复制构建好的 jar
COPY build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
