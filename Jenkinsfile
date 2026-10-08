pipeline{
    agent any
    stages{
        stage('checkout'){
            steps{
                deleteDir()
                sh '''
                    git clone https://github.com/Amruthjinesh/weather-app.git
                    ls -l
                    ls
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
