pipeline {
    agent any

    environment {
        PROJECT_NAME   = "Jaldi-Puncture-Frontend"
        CLONE_DIR      = "${WORKSPACE}/${PROJECT_NAME}"
        BUILD_DIR      = "${CLONE_DIR}/.next"
        ARTIFACT_NAME  = "${PROJECT_NAME}-${BUILD_NUMBER}.tar.gz"
        ARTIFACT_PATH  = "${WORKSPACE}/${ARTIFACT_NAME}"
        DEPLOY_PATH    = "/var/www/jaldi-puncture-frontend"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Clone Repository') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-token', 
                        usernameVariable: 'GIT_USER', 
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh """
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/Tech-Scrappers/jaldi-puncture-frontend.git ${CLONE_DIR}
                        cd ${CLONE_DIR}
                        git checkout dev
                    """
                }
            }
        }

        stage('Install and Build') {
            steps {
                dir("${CLONE_DIR}") {
                    sh """
                        node -v
                        yarn -v

                        cp /home/ubuntu/jaldi-frontend-env/env ${CLONE_DIR}/.env
                        yarn install --no-immutable
                        yarn run build
                    """
                }
            }
        }

        stage('Create Artifact') {
            steps {
                dir("${CLONE_DIR}") {
                    sh "tar -czf ${ARTIFACT_PATH} ."
                }
                archiveArtifacts artifacts: "${ARTIFACT_NAME}", fingerprint: true
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'jaldi-dev-server',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    ),
                    string(
                        credentialsId: 'jaldi-dev-ip',
                        variable: 'DEPLOY_HOST'
                    ),
                    usernamePassword(
                        credentialsId: 'github-token',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sshagent(['jaldi-dev-server']) {
                        // Copy artifact
                        sh "scp -o StrictHostKeyChecking=no ${ARTIFACT_PATH} ${SSH_USER}@${DEPLOY_HOST}:/tmp/"

                        // Deploy on remote server
                        sh """
                            ssh ${SSH_USER}@${DEPLOY_HOST} '
                                echo "Extracting artifact to ${DEPLOY_PATH}"
                                sudo tar -xzf /tmp/${ARTIFACT_NAME} -C ${DEPLOY_PATH}

                                echo "Restarting application"
                                sudo systemctl restart nginx.service

                                echo "Cleaning up"
                                rm /tmp/${ARTIFACT_NAME}

                                echo "Deployment completed successfully"
                            '
                        """
                    }
                }
            }
        }
    }
}
