FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY suresubmit-backend/pom.xml .
RUN mvn dependency:go-offline
COPY suresubmit-backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
