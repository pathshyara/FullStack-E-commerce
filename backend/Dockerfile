FROM openjdk:17-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create directory for product images
RUN mkdir -p /app/QurbaProductPhoto

# Add wait-for-it script
RUN echo '#!/bin/sh' > /wait-for-it.sh && \
    echo 'while ! nc -z mysql 3306; do' >> /wait-for-it.sh && \
    echo '  echo "Waiting for MySQL..."' >> /wait-for-it.sh && \
    echo '  sleep 2' >> /wait-for-it.sh && \
    echo 'done' >> /wait-for-it.sh && \
    echo 'echo "MySQL is ready!"' >> /wait-for-it.sh && \
    echo 'java -jar /app/app.jar' >> /wait-for-it.sh && \
    chmod +x /wait-for-it.sh

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

EXPOSE 8080
CMD ["/wait-for-it.sh"]