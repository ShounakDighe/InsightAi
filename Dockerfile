# Stage 1: Build with Maven image
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy POM and download dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source & build
COPY src ./src
RUN mvn clean package -Pprod -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/insightai-0.0.1-SNAPSHOT.jar insightai-v1.0.jar
EXPOSE 9090
ENTRYPOINT ["java","-jar","insightai-v1.0.jar"]
