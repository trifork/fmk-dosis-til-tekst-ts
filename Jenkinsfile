pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout([$class: 'GitSCM', branches: [[name: "*/master"]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'SparseCheckoutPaths', sparseCheckoutPaths:[[$class:'SparseCheckoutPath', path:'etc/schemas/']]]], submoduleCfg: [], userRemoteConfigs: [[url: 'git@github.com:trifork/fmk-schemas.git']]])
                checkout([$class: 'GitSCM', branches: [[name: "*/master"]], doGenerateSubmoduleConfigurations: false, extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'fmk-dosis-til-tekst-ts']], submoduleCfg: [], userRemoteConfigs: [[url: 'git@github.com:trifork/fmk-dosis-til-tekst-ts.git']]])                
            }
        }       

        stage('build') {
            steps {
                script {
                    sh "mv etc/schemas schemas"
                    String jenkinsUserId = sh(returnStdout: true, script: 'id -u jenkins').trim()
                    String dockerGroupId = sh(returnStdout: true, script: 'getent group docker | cut -d: -f3').trim()
                    String containerUserMapping = "-u $jenkinsUserId:$dockerGroupId "
                    docker.image("registry.fmk.netic.dk/fmk/fmkbuilder:11").inside(containerUserMapping + "--add-host archive.ubuntu.com:2001:67c:1562::15 --add-host test1-ecpr2.fmk.netic.dk:2a03:dc80:0:f12d::170 --add-host f.aia.systemtest19.trust2408.com:2a03:dc80:0:f12d::120 --add-host nodejs.org:2400:cb00:2048:1::6814:172e --add-host registry.bower.io:2400:cb00:2048:1::6818:69ac --add-host registry.npmjs.org:2606:4700::6810:1923 --add-host f.aia.ica02.trust2408.com:2a03:dc80:0:f12d::120 -e _JAVA_OPTIONS='-Dfile.encoding=UTF-8 -Djava.net.preferIPv4Stack=false -Djava.net.preferIPv6Stack=true -Djava.net.preferIPv6Addresses=true'") {
                        sh "ls -l"
                        sh "cd fmk-dosis-til-tekst-ts && npm run build.prod"
                        sh "cd fmk-dosis-til-tekst-ts && npm test"
                    }
                }
            }
        }
    }
    post {
        success {
            build job: 'fmk-dosistiltekst-wrapper', wait: false
            build job: 'fmk-dosistiltekst-wrapper-net', wait: false    
        }
        failure {
            emailext body: '$DEFAULT_CONTENT',
                    recipientProviders: [culprits(), requestor()],
                    subject: '$DEFAULT_SUBJECT'
        }
        unstable {
            emailext body: '$DEFAULT_CONTENT',
                    recipientProviders: [culprits(), requestor()],
                    subject: '$DEFAULT_SUBJECT'
        }
        fixed {
            emailext body: '$DEFAULT_CONTENT',
                    recipientProviders: [culprits(), requestor()],
                    subject: '$DEFAULT_SUBJECT'
        }
    }
}
