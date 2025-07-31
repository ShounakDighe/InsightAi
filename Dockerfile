FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn

RUN ./mvnw dependency:go-offline

COPY . .
RUN ./mvnw clean package -Pprod -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/insightai-0.0.1-SNAPSHOT.jar insightai-v1.0.jar
EXPOSE 9090
ENTRYPOINT ["java","-jar","insightai-v1.0.jar"]
