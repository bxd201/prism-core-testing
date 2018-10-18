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
      steps {
        sh """
        #!/bin/bash

        # Build the builder image
        docker build --no-cache --pull -t ${IMAGE_NAME}-build -f Dockerfile.build .
        """

        sh """
        #!/bin/bash

        # Clean up any old image archive files
        rm -rf dist

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
      steps {
        unstash 'static'
        sh """
        # Clean up any old image archive files
        rm -rf ${IMAGE_NAME}.docker.tar.gz
        docker build --pull \
          -t ${IMAGE_NAME}_${BUILD_NUMBER} \
          --label "jenkins.build=${BUILD_NUMBER}" \
          --label "jenkins.job_url=${JOB_URL}" \
          --label "jenkins.build_url=${JOB_URL}${BUILD_NUMBER}/" \
          --label "git.commit=${GIT_COMMIT}" \
          --label "git.repo=${GIT_URL}" \
          .
        docker save -o ${IMAGE_NAME}.docker.tar ${IMAGE_NAME}_${BUILD_NUMBER}
        gzip ${IMAGE_NAME}.docker.tar
        """

        sh """
        # This is to allow creating an archive for Veracode
        docker run \
          --name ${IMAGE_NAME}_artifact_${BUILD_NUMBER} \
          --entrypoint /bin/sh \
          -w /usr/share/nginx \
          ${IMAGE_NAME}_${BUILD_NUMBER} \
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
      agent {
        docker {
          image 'ruby:2.4'
          args '-u root'
        }
      }
      steps {
        unstash 'static'
        sh """
        cp ci/Gemfile ./
        bundle install
        bundle exec rspec
        """
      }
    }
    stage('publish') {
      when {
        branch 'develop'
      }
      steps {
        withDockerRegistry([credentialsId: 'artifactory_credentials', url: 'https://docker.cpartdc01.sherwin.com/v2']) {
          sh "docker tag ${IMAGE_NAME}_${BUILD_NUMBER} docker.cpartdc01.sherwin.com/ecomm/apps/${IMAGE_NAME}"
          sh "docker tag ${IMAGE_NAME}_${BUILD_NUMBER} docker.cpartdc01.sherwin.com/ecomm/apps/${IMAGE_NAME}:dev"
          sh "docker push docker.cpartdc01.sherwin.com/ecomm/apps/${IMAGE_NAME}"
          sh "docker push docker.cpartdc01.sherwin.com/ecomm/apps/${IMAGE_NAME}:dev"
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
    stage('Dev deploy') {
      environment {
        VPC = "ebus"
        RANCHER_ENV = "nonprod"
        RANCHER_PROJ = "1a33"
        RANCHER_STACK = "prism-web-dev"
        IMAGE_TAG = "dev"
        API_URL = "https://dev-prism-api.ebus.swaws"
      }
      when {
        branch 'develop'
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ebus-nonprod-rancher', usernameVariable: 'RANCHER_ACCESS_KEY', passwordVariable: 'RANCHER_SECRET_KEY')]) {
          sh """
          #!/bin/bash -x
          cd ci
          # Use Rancher to Deploy the stack
          rancher \
            --url "http://rancher.${VPC}.swaws/v2-beta/projects/${RANCHER_PROJ}" \
            --environment ${RANCHER_ENV} \
            --access-key "${RANCHER_ACCESS_KEY}" \
            --secret-key "${RANCHER_SECRET_KEY}" \
            up \
              -d \
              -u --force-upgrade \
              --confirm-upgrade \
              --stack ${RANCHER_STACK}
          """
        }
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
