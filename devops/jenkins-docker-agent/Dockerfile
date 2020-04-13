FROM openjdk:8-jdk-alpine

ENV JENKINS_SWARM_VERSION 3.19
# ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

# Install Java.
# #RUN sudo rm /etc/apt/sources.list.d/webupd8team-java*
# #RUN echo "deb http://ppa.launchpad.net/luzfcb/java/ubuntu trusty main" > /etc/apt/sources.list.d/luzfcb-java.list
# RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886
# RUN apt-get update
# RUN apt-get install -y --fix-missing software-properties-common

# RUN \
#   echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
#   add-apt-repository ppa:ts.sch.gr/ppa && \
#   apt-get update && \
#   apt-get install -y --force-yes --no-install-recommends oracle-java8-installer && \
#   rm -rf /var/lib/apt/lists/* && \
#   rm -rf /var/cache/oracle-jdk8-installer
  
# # RUN \
# #   echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
# #   apt-get install -y oracle-java8-installer && \
# #   rm -rf /var/lib/apt/lists/* && \
# #   rm -rf /var/cache/oracle-jdk8-installer

# RUN sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
# RUN chmod +x /usr/local/bin/docker-compose

RUN apk add --update \
 curl git bash\
 && rm -rf /var/cache/apk/*

RUN curl --create-dirs -sSLo /usr/share/jenkins/swarm-client.jar https://repo.jenkins-ci.org/releases/org/jenkins-ci/plugins/swarm-client/$JENKINS_SWARM_VERSION/swarm-client-$JENKINS_SWARM_VERSION.jar \
  && chmod 755 /usr/share/jenkins

CMD ["/usr/bin/java", "-jar", "/usr/share/jenkins/swarm-client.jar", "-master", "http://jenkins:8080/jenkins", "-username", "devops-system", "-passwordEnvVariable", "JENKINS_AGENT_PASSWORD", "-executors", "2", "-labels", "docker", "-name", "docker-agent", "-showHostName"]
#COPY startup.sh /
#CMD [ "/startup.sh" ]

VOLUME [ "/workspace" ]

RUN mkdir /etc/docker
RUN echo '{ "insecure-registries" : [ "artifactory:8081" ] }' > /etc/docker/daemon.json