FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -DskipTests
COPY src ./src
COPY data ./data
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/amazon-clone-0.0.1-SNAPSHOT.jar app.jar
COPY --from=build /app/data ./data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
