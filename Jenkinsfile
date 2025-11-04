pipeline {
    agent any

    environment {
        IMAGE_NAME = 'api-express'
        CONTAINER_NAME = 'api_express'
        GIT_REPO = 'https://github.com/VitorMalacarne/Express_api-leituras.git'
        EMAIL = 'vitorhenriquewm@gmail.com'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Clean old containers/images') {
            steps {
                sh '''
                docker rm -f ${CONTAINER_NAME} || true
                docker rmi -f ${IMAGE_NAME}:latest || true
                '''
            }
        }

        stage('Build image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Run container') {
            steps {
                sh 'docker run -d --name ${CONTAINER_NAME} -p 3000:3000 ${IMAGE_NAME}:latest'
            }
        }
    }

    post {
        success {
            mail to: "${EMAIL}",
                 subject: "✅ Deploy bem-sucedido: ${IMAGE_NAME}",
                 body: "O container ${CONTAINER_NAME} foi implantado com sucesso!"
        }
        failure {
            mail to: "${EMAIL}",
                 subject: "❌ Falha no deploy: ${IMAGE_NAME}",
                 body: "Houve erro durante o pipeline Jenkins da aplicação ${IMAGE_NAME}."
        }
    }
}
