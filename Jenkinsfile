def S3_FOLDER_VERSION(branch, prism_version) {
  if (branch == 'release') {
    "${prism_version}"
  } else {
    "${prism_version}-${branch.toLowerCase()}"
  }
}

def GET_API_URL(branch) {
  if (branch == 'release') {
    "https://api.sherwin-williams.com/prism"
  } else if (branch == 'qa') {
    "https://${branch.toLowerCase()}-api.sherwin-williams.com/prism"
  } else if (branch == 'lowes-cvw') {
    "https://qa-api.sherwin-williams.com/prism"
  } else {
    'https://develop-prism-api.ebus.swaws'
  }
}

def GET_ML_API_URL(branch) {
  if (branch == 'release') {
    "https://api.sherwin-williams.com"
  } else if (branch == 'qa') {
    "https://${branch.toLowerCase()}-api.sherwin-williams.com"
  } else {
    'https://develop-prism-ml-api.ebus.swaws'
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
    ML_API_URL = "${GET_ML_API_URL(env.BRANCH_NAME)}"
  }
  stages {
    stage('builder') {
      when {
          expression { BRANCH_NAME ==~ /^(develop|integration|hotfix|qa|release)$/ }
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
          -e WEB_URL=https://prism.sherwin-williams.com/${S3_FOLDER_NAME} \
          --env API_URL="$API_URL" \
          --env ML_API_URL="$ML_API_URL" \
          --name ${IMAGE_NAME}-build-${BUILD_NUMBER} \
          ${IMAGE_NAME}-build:latest

        mkdir dist
        docker cp ${IMAGE_NAME}-build-${BUILD_NUMBER}:/app/dist.tgz ./
        docker cp ${IMAGE_NAME}-build-${BUILD_NUMBER}:/app/node_modules ./
        docker cp ${IMAGE_NAME}-build-${BUILD_NUMBER}:/app/packages/toolkit/node_modules/ packages/toolkit/
        tar zxf dist.tgz -C dist
        rm dist.tgz
        echo "$PRISM_VERSION" > dist/VERSION

        # Remove the build container
        docker rm -f ${IMAGE_NAME}-build-${BUILD_NUMBER}
        """
        stash includes: 'dist/**/*', name: 'static'
        stash includes: 'node_modules/**/*', name: 'node'
        stash includes: 'packages/**/*', name: 'toolkit'
      }
    }

    stage('pr-validate') {
      when {
        expression { BRANCH_NAME ==~ /^(PR-.+)$/ }
      }
      steps {
        withCredentials([string(credentialsId: 'Github_token_prismcore', variable: 'token_prismcore')]){
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
            -e WEB_URL=https://prism.sherwin-williams.com/${S3_FOLDER_NAME} \
            --env API_URL="$API_URL" \
            --env ML_API_URL="$ML_API_URL" \
            --env DANGER_MANUAL_CI="Docker" \
            --env DANGER_GITHUB_API_BASE_URL="https://api.github.sherwin.com" \
            --env DANGER_GITHUB_API_TOKEN="$token_prismcore" \
            --env DANGER_MANUAL_CI="true" \
            --env DANGER_MANUAL_GH_REPO="SherwinWilliams/prism-core" \
            --env DANGER_MANUAL_PR_NUM="$CHANGE_ID" \
            --name ${IMAGE_NAME}-build-${BUILD_NUMBER} \
            ${IMAGE_NAME}-build:latest

          # Remove the build container
          docker rm -f ${IMAGE_NAME}-build-${BUILD_NUMBER}
          """
        }
      }
    }

    stage('yarn-publish') {
      when {
          expression { BRANCH_NAME ==~ /^(develop|release)$/ }
        }
        environment {
            ARTIFACTORY = credentials("YARN_PUBLISH")
        }
      agent {
        docker {
          image 'docker.artifactory.sherwin.com/ecomm/utils/node:16'
        }
      }
      steps {
        unstash 'node'
        unstash 'static'
        unstash 'toolkit'

        sh """
        cp \$ARTIFACTORY .yarnrc.yml
        sed -i "s/sherwin-npm-virtual/sherwin-npm-local/g" packages/toolkit/package.json
        chmod +x ci/scripts/update-version.sh
        if [ "${BRANCH_NAME}" = "develop" ]; then
           ./ci/scripts/update-version.sh packages/toolkit/package.json rc.${BUILD_NUMBER}
        fi
        yarn publish
        """
      }
   }
    stage('s3-version-upload') {
      when {
          expression { BRANCH_NAME ==~ /^(develop|hotfix|integration|qa|release)$/ }
        }
      agent {
        docker {
          image 'docker.artifactory.sherwin.com/amazon/aws-cli:2.1.26'
          args "--entrypoint=''"
        }
      }
      steps {
        unstash 'static'

        sh """
        aws s3 cp dist/packages/facets/dist s3://sw-prism-web/"${S3_FOLDER_NAME}"/ --recursive
        """
      }
   }
    stage('build') {
      when {
          expression { BRANCH_NAME ==~ /^(develop)$/ }
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
    stage('Sonar Scan') {
      when {
        not {
            expression { BRANCH_NAME ==~ /^(qa|release|PR-.+)$/ }
        }
      }
      agent {
        docker {
          image 'docker.artifactory.sherwin.com/ecomm/utils/sonar-scanner:latest'
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
        expression { BRANCH_NAME ==~ /^(qa|release|PR-.+)$/ }
      }
    }
      agent {
        docker {
            image 'docker.artifactory.sherwin.com/ecomm/utils/trivy-nightly:latest'
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
    when {
      not {
          expression { BRANCH_NAME ==~ /^(qa|release|PR-.+)$/ }
      }
    }
      agent {
        docker {
          image 'docker.artifactory.sherwin.com/ecomm/utils/barge:artifactory'
          args "-u barge"
          alwaysPull true
          reuseNode true
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'artifactory_credentials_v2', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh "barge in"
        }
      }
    }

    stage('Deploy') {
      when {
        expression { BRANCH_NAME ==~ /^(develop)$/ }
      }
      agent {
        docker {
            image 'docker.artifactory.sherwin.com/ecomm/utils/buoy:artifactory'
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
          usernameColonPassword(credentialsId: 'artifactory_credentials_v2', variable: 'ARTIFACTORY_CREDENTIALS'),
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
    stage('Akamai Cache') {
      when {
        expression { BRANCH_NAME ==~ /^(develop|qa|lowes-cvw)$/ }
      }
      environment {
            SECRET = credentials("AKAMAI_SECRETS")
        }
      agent {
        docker {
          image 'docker.artifactory.sherwin.com/akamai/shell'
          alwaysPull true
          reuseNode true
          args "-u root"
        }
      }
      steps {
        script{
            sh """
              cp \$SECRET /root/.edgerc
              akamai purge invalidate https://prism.sherwin-williams.com/"${S3_FOLDER_NAME}"/embed.js
            """
          }
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
        cleanWs()
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
  def DEV_CAPRISM_URL = "https://dev-www.sherwin-williams.com/en-ca/colour#/en-ca/colour/active/color-wall/section/sherwin-williams-colours"
  def QA_SWPRISM_URL = "https://qav9-www.sherwin-williams.com/painting-contractors"
  def QA_CAPRISM_URL = "https://qa-www.sherwin-williams.com/en-ca/colour#/en-ca/colour/active/color-wall/section/sherwin-williams-colours"
  def STAGE_SWPRISM_URL = "https://stagev9-www.sherwin-williams.com/painting-contractors"
  def STAGE_CAPRISM_URL = "https://stage-www.sherwin-williams.com/en-ca/colour#/en-ca/colour/active/color-wall/section/sherwin-williams-colours"
  def PROD_SWPRISM_URL = "https://www.sherwin-williams.com/painting-contractors"
  def PROD_CAPRISM_URL = "https://www.sherwin-williams.com/en-ca/colour#/en-ca/colour/active/color-wall/section/sherwin-williams-colours"
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
