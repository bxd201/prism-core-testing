pipeline {
  options {
    buildDiscarder(
      logRotator(
        numToKeepStr: '5',
        artifactNumToKeepStr: '5'
      )
    )
  }
  agent any
  environment {
    IMAGE_NAME = "prism-core"
  }
  stages {
    stage('builder') {
      when {
        not {
          expression { BRANCH_NAME ==~ /^(qa|release)$/ }
        }
      }
      steps {
        sh """
        #!/bin/bash

        # Build the builder image
        docker build --no-cache --pull -t ${IMAGE_NAME}-build -f ci/Dockerfile.build .
        """

        sh """
        #!/bin/bash

        # Clean up any old image archive files
        rm -rf dist

        # Make sure the build container has been removed
        docker stop ${IMAGE_NAME}-build-${BUILD_NUMBER} || true
        docker rm ${IMAGE_NAME}-build-${BUILD_NUMBER} || true

        # Mount the volumes from Jenkins and run the deploy
        docker run \
          --name ${IMAGE_NAME}-build-${BUILD_NUMBER} \
          ${IMAGE_NAME}-build:latest

        docker cp ${IMAGE_NAME}-build-${BUILD_NUMBER}:/app/dist.tgz ./
        tar zxf dist.tgz
        rm dist.tgz

        # Remove the build container
        docker rm -f ${IMAGE_NAME}-build-${BUILD_NUMBER}
        """
        stash includes: 'dist/**/*', name: 'static'
      }
    }
    stage('build') {
      when {
        not {
          expression { BRANCH_NAME ==~ /^(qa|release)$/ }
        }
      }
      steps {
        unstash 'static'
        sh """
        # Clean up any old image archive files
        rm -rf ${IMAGE_NAME}.docker.tar.gz
        docker build --pull \
          -t ${IMAGE_NAME}:${BUILD_NUMBER} \
          --label "jenkins.build=${BUILD_NUMBER}" \
          --label "jenkins.job_url=${JOB_URL}" \
          --label "jenkins.build_url=${JOB_URL}${BUILD_NUMBER}/" \
          --label "git.commit=${GIT_COMMIT}" \
          --label "git.repo=${GIT_URL}" \
          .
        docker save -o ${IMAGE_NAME}.docker.tar ${IMAGE_NAME}:${BUILD_NUMBER}
        gzip ${IMAGE_NAME}.docker.tar
        """

        sh """
        # This is to allow creating an archive for Veracode
        docker run \
          --name ${IMAGE_NAME}_artifact_${BUILD_NUMBER} \
          --entrypoint /bin/sh \
          -w /usr/share/nginx \
          ${IMAGE_NAME}:${BUILD_NUMBER} \
          -c 'tar zcf /tmp/prism-core.tgz html'

        docker cp ${IMAGE_NAME}_artifact_${BUILD_NUMBER}:/tmp/prism-core.tgz ./

        # Remove the artifact container
        docker rm -f ${IMAGE_NAME}_artifact_${BUILD_NUMBER}
        """

        archiveArtifacts artifacts: "${IMAGE_NAME}.docker.tar.gz", fingerprint: true
        archiveArtifacts artifacts: "prism-core.tgz", fingerprint: true
      }
    }
    stage('image-testing') {
      when {
        not {
          expression { BRANCH_NAME ==~ /^(qa|release)$/ }
        }
      }
      agent {
        docker {
          image 'docker.cpartdc01.sherwin.com/ecomm/utils/docker_rspec'
          args '-u root'
          reuseNode true
        }
      }
      steps {
        sh """
        cp ci/Gemfile ./
        bundle install
        bundle exec rspec
        """
      }
    }
    stage('Sonar Scan') {
      when {
        not {
            expression { BRANCH_NAME ==~ /^(qa|release)$/ }
        }
      }
      agent {
        docker {
          image 'docker.cpartdc01.sherwin.com/ecomm/utils/sonar-scanner:latest'
          reuseNode true
          alwaysPull true
        }
      }
      environment {
        SONAR_URL = "https://sonarqube.ebus.swaws"
        PROJECT_ID = "prism-core"
      }
      steps {
        withCredentials([string(credentialsId: 'sonar-prod', variable: 'TOKEN')]){
          sh """
          sonar-scanner -X -Dsonar.login=${TOKEN}  -Dsonar.host.url=${SONAR_URL} -Dsonar.projectKey=${PROJECT_ID} -Dsonar.sources=. -Dsonar.inclusions=src/**/*.js,**/*.js  -Dsonar.exclusions=src/node_modules/*
          """
        }
      }
    }

    stage('Security Scan') {
    when {
      not {
        expression { BRANCH_NAME ==~ /^(qa|release)$/ }
      }
    }
      agent {
        docker {
            image 'docker.cpartdc01.sherwin.com/ecomm/utils/trivy-nightly:latest'
            args "-u root --entrypoint=''"
            reuseNode true
            alwaysPull true
        }
      }
      steps {
        sh """
        # Run the trivy security scanner
        trivy \
          --exit-code 0 \
          --no-progress \
          --ignore-unfixed \
          --severity HIGH,CRITICAL \
          ${IMAGE_NAME}:${BUILD_NUMBER} \
        """
      }
    }
    
    stage('publish') {
      agent {
        docker {
          image 'docker.cpartdc01.sherwin.com/ecomm/utils/barge'
          args "-u barge"
          alwaysPull true
          reuseNode true
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'artifactory_credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh "barge in"
        }
      }
    }
    stage('Deploy') {
      when {
        expression { BRANCH_NAME ==~ /^(develop|integration|hotfix|qa|release|replatform)$/ }
      }
      agent {
        docker {
            image 'docker.cpartdc01.sherwin.com/ecomm/utils/buoy:latest'
            reuseNode true
            alwaysPull true
        }
      }
      environment {
        RANCHER_PROD_CLUSTER = "prod"
        RANCHER_NONPROD_CLUSTER = "nonprod"
        RANCHER_PROJECT = "TAG"

        VERIFY_SECRETS="ebus"

        CHART = "nginx-custom-chart"
        CHART_REPO = "helm-virtual"

        CHART_VERSION="1.x.x"

        IS_IMAGE_UNIQUE_TAG="true"

        ENVSUBST_VARIABLES='$BRANCH_NAME:$IMAGE_NAME:$IMAGE_UNIQUE_TAG'

        IS_ROLLBACK_ENABLED="true"
      }
      steps {
        withCredentials([
          string(credentialsId: 'jenkins_rancher2_bearerToken', variable: 'RANCHER_TOKEN'),
          usernameColonPassword(credentialsId: 'artifactory_credentials', variable: 'ARTIFACTORY_CREDENTIALS'),
        ]) {
          sh "/buoy/float.sh"

          archiveArtifacts artifacts: "deploy.tgz", fingerprint: true
        }
      }
    }
    stage('security') {
      when {
        branch 'develop'
      }
      steps {
        build job: '/DevOps/Security/Veracode-Scanner',
              parameters: [
                string(name: 'APP_NAME', value: "${IMAGE_NAME}"),
                string(name: 'APP', value: 'prism-core.tgz'),
                string(name: 'BUILD_JOB', value: "${JOB_NAME}"),
                string(name: 'BUILD_VERSION', value: "${GIT_COMMIT}"),
                string(name: 'BUILD_JOB_NUMBER', value: "${BUILD_NUMBER}")
              ],
              wait: false
      }
    }
    stage('QA: QualysScan') {
      when {
        branch 'qa'
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'Qualys_scan_password', usernameVariable: 'QUALYS_SCAN_USER', passwordVariable: 'QUALYS_SCAN_PASS')]) {
          sh """
          #!/bin/bash
          #set -x
          now=\$(date +"%T")
          sed -i 's|QA - prism-core|'"QA - prism-core \${now}"'|g' ./ci/qualys/QualysPostData_QA.xml
          curl -k -u "${QUALYS_SCAN_USER}:${QUALYS_SCAN_PASS}" -H "content-type: text/xml" -X "POST" --data-binary @./ci/qualys/QualysPostData_QA.xml "https://qualysapi.qualys.com/qps/rest/3.0/launch/was/wasscan"
          """
        }
      }
    }
    stage('Shepherd') {
      when {
        expression { BRANCH_NAME ==~ /^(develop|qa|release|replatform)$/ }
      }
      agent {
        docker {
          image 'docker.cpartdc01.sherwin.com/ecomm/utils/shepherd:latest'
          reuseNode true
          alwaysPull true
        }
      }
      environment {
        DEVELOP_DOMAIN = "https://develop-prism-web.ebus.swaws"
        QA_DOMAIN = "https://qa-prism-web.ebus.swaws"
        FEATURE_BRANCH = "https://replatform-prism-web.ebus.swaws"
        INTEGRATION_BRANCH = "https://integration-prism-web.ebus.swaws"
        RELEASE_DOMAIN = "https://prism.sherwin-williams.com"

        LINKS_FILE = "ci/shepherd/links"
        TRUST_CERT = "true"
      }
      steps {
        sh """

        if [ "${BRANCH_NAME}" = "develop" ]; then
            export DOMAIN="${DEVELOP_DOMAIN}"
        elif [ "${BRANCH_NAME}" = "qa" ]; then
            export DOMAIN="${QA_DOMAIN}"
        elif [ "${BRANCH_NAME}" = "integration" ]; then
            export DOMAIN="${INTEGRATION_BRANCH}"
        elif [ "${BRANCH_NAME}" = "replatform" ]; then
            export DOMAIN="${FEATURE_BRANCH}"
        elif [ "${BRANCH_NAME}" = "release" ]; then
            export TRUST_CERT='false'
            export DOMAIN="${RELEASE_DOMAIN}"
        fi

        shepherd
        """

        archiveArtifacts artifacts: "report/report.*", fingerprint: true

        publishHTML([
            reportDir: "report",
            reportName: 'Shepherd Report',
            reportFiles: 'report.html',
            allowMissing: false,
            alwaysLinkToLastBuild: true,
            keepAll: true
        ])
      }
    }

  }
  post {
    always {
      script {
        currentBuild.result = currentBuild.result ?: 'SUCCESS'

        emailext (
          to: 'brendan.do@sherwin.com,cody.richmond@sherwin.com,prwilliams@sherwin.com,brandon.chartier@sherwin.com,cc:jonathan.l.gnagy@sherwin.com',
          subject: "${env.JOB_NAME} #${env.BUILD_NUMBER} [${currentBuild.result}]",
          body: "Build URL: ${env.BUILD_URL}.\n\n",
          attachLog: true,
        )

        sparkSend(
          credentialsId: 'jenkins-webex-bot',
          message: "**BUILD ${currentBuild.result}**: $JOB_NAME [build ${BUILD_NUMBER}](${JOB_URL}${BUILD_NUMBER}/)",
          messageType: 'markdown',
          spaceList: [[
            spaceId: '148571b0-7585-11e8-9a3a-a75b99388ff0',
            spaceName: 'JenkinsNotifications'
          ]]
        )
      }
    }
  }
}
