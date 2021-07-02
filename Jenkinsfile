def S3_FOLDER_VERSION(branch, prism_version) {
  if (branch == 'release') {
    "$prism_version"
  } else {
    "$prism_version-${branch.toLowerCase()}"
  }
}

def GET_API_URL(branch) {
  if (branch == 'release') {
    "https://api.sherwin-williams.com/prism"
  } else {
    "https://${branch.toLowerCase()}-api.sherwin-williams.com/prism"
  }
}

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
    PRISM_VERSION = sh(returnStdout: true, script: "cat package.json | jq -r .version").trim()
    S3_FOLDER_NAME = "${S3_FOLDER_VERSION(env.BRANCH_NAME, PRISM_VERSION)}"
    API_URL = "${GET_API_URL(env.BRANCH_NAME)}"
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
          -e WEB_URL=https://sw-prism-web.s3.us-east-2.amazonaws.com/${S3_FOLDER_NAME} \
          --env API_URL="$API_URL" \
          --name ${IMAGE_NAME}-build-${BUILD_NUMBER} \
          ${IMAGE_NAME}-build:latest

        docker cp ${IMAGE_NAME}-build-${BUILD_NUMBER}:/app/dist.tgz ./
        tar zxf dist.tgz
        rm dist.tgz
        echo "$PRISM_VERSION" > dist/VERSION

        # Remove the build container
        docker rm -f ${IMAGE_NAME}-build-${BUILD_NUMBER}
        """
        stash includes: 'dist/**/*', name: 'static'
      }
    }
    stage('s3-upload') {
      when {
          expression { BRANCH_NAME ==~ /^(develop|qa|release)$/ }
        }
      agent {
        docker {
          image 'docker.cpartdc01.sherwin.com/amazon/aws-cli:2.1.26'
          args "--entrypoint=''"
        }
      }
      steps {
        unstash 'static'

        sh """
        aws s3 cp dist/ s3://sw-prism-web/ --recursive
        aws s3 cp dist/ s3://sw-prism-web/"${S3_FOLDER_NAME}"/ --recursive
        """
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
            args '-u buoy'
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
    stage('trigger_smoke_job') {
            steps {
                trigger_smoke_job(BRANCH_NAME)
            }
          }
  }
  post {
    always {
      script {
        currentBuild.result = currentBuild.result ?: 'SUCCESS'
        emailext (
          to: 'brendan.do@sherwin.com,cody.richmond@sherwin.com,prwilliams@sherwin.com,cc:abhilash.reddy@sherwin.com',
          subject: "${env.JOB_NAME} #${env.BUILD_NUMBER} [${currentBuild.result}]",
          body: "Build URL: ${env.BUILD_URL}.\n\n",
          attachLog: true,
        )
        office365ConnectorSend webhookUrl: "${env.MS_TEAM_WEBHOOK}"
      }
    }
  }
}
def trigger_smoke_job(branch){
      def target_url = ""
      def DEV_SWPRISM_URL = "https://devv9-www.sherwin-williams.com/painting-contractors"
      def DEV_CAPRISM_URL = "https://develop-sherwin-williams-ca.ebus.swaws/en/colour/active/color-wall/section/sherwin-williams-colours"
      def QA_SWPRISM_URL = "https://qav9-www.sherwin-williams.com/painting-contractors"
      def QA_CAPRISM_URL = "https://qa-sherwin-williams-ca.ebus.swaws/en/colour/active/color-wall/section/sherwin-williams-colours"
      def STAGE_SWPRISM_URL = "https://stagev9-www.sherwin-williams.com/painting-contractors"
      def STAGE_CAPRISM_URL = "https://stage-sherwin-williams-ca.ebus.swaws/en/colour/active/color-wall/section/sherwin-williams-colours"
      def PROD_SWPRISM_URL = "https://www.sherwin-williams.com/painting-contractors"
      def PROD_CAPRISM_URL = "https://www.sherwin-williams.ca/en/colour/active/color-wall"
      if (branch == 'develop') {
          target_swprism_url = DEV_SWPRISM_URL
          target_caprism_url = DEV_CAPRISM_URL
      } else if (branch == 'qa') {
          target_swprism_url = QA_SWPRISM_URL
          target_caprism_url = QA_CAPRISM_URL
      } else if (branch == 'stage') {
        target_swprism_url = STAGE_SWPRISM_URL
        target_caprism_url = STAGE_CAPRISM_URL
      } else if (branch == 'release') {
        target_swprism_url = PROD_SWPRISM_URL
        target_caprism_url = PROD_CAPRISM_URL
      } else {
          echo "can strictly run smoke job for develop/qa/stage/release branches only"
          return
      }
      build job: 'Automated_SmokeTests/PRISM/SWPrism_SmokeTests', parameters: [string(name: 'TARGET_URL', value: target_swprism_url)], wait: false
      build job: 'Automated_SmokeTests/PRISM/PrismCanada_SmokeTests', parameters: [string(name: 'TARGET_URL', value: target_caprism_url)], wait: false
  }