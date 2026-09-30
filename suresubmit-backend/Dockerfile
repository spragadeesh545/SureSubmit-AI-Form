FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
ENV MAVEN_OPTS="-Xmx320m -XX:MaxMetaspaceSize=128m"
COPY suresubmit-backend/pom.xml .
RUN mvn -B -ntp dependency:go-offline -DskipTests || true
COPY suresubmit-backend/src ./src
RUN mvn -B -ntp clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx256m"
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
