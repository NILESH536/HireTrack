pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry'
        DOCKER_IMAGE = 'hirectrack'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Client') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Server') {
                    steps {
                        dir('server') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Client Tests') {
                    steps {
                        dir('client') {
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Client') {
                    steps {
                        dir('client') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Docker Images') {
                    steps {
                        script {
                            docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-server:${BUILD_NUMBER}", "-f Dockerfile.server .")
                            docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-client:${BUILD_NUMBER}", "-f Dockerfile.client .")
                        }
                    }
                }
            }
        }

        stage('Push Images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://' + DOCKER_REGISTRY, 'docker-credentials') {
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-server:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-server:${BUILD_NUMBER}").push('latest')
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-client:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_REGISTRY}/${DOCKER_IMAGE}-client:${BUILD_NUMBER}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    docker-compose pull
                    docker-compose up -d --force-recreate
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            emailext(
                subject: "Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "The pipeline has failed. Check Jenkins for details.",
                to: 'team@example.com'
            )
        }
    }
}
