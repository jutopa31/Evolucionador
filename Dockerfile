FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAVA_OPTS
ENV JAVA_OPTS=$JAVA_OPTS
COPY v3evo.jar v3evo.jar
EXPOSE 3000
ENTRYPOINT exec java $JAVA_OPTS -jar v3evo.jar
# For Spring-Boot project, use the entrypoint below to reduce Tomcat startup time.
#ENTRYPOINT exec java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar v3evo.jar

# Removed invalid JSON block from Dockerfile
