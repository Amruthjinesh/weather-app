pipeline{
    agent { label 'deployagent' }
    stages{
        stage('checkout'){
            steps{
                deleteDir()
                sh '''
                    git clone https://github.com/Amruthjinesh/weather-app.git
                    ls -l
                '''
            }
        }
        stage('deploy'){
            steps{
                sh '''
                    cp -r weather-app/* /var/www/html
                    ls -l /var/www/html
                '''
                    
            }
        }
        
    }
}
