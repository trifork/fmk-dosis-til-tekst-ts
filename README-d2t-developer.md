Typescript port of fmk-dosis-til-tekst.

To build the project:

Windows:
1) Install nodejs (http://nodejs.org) and npm
2) 'npm install -g grunt-cli'
3) 'npm install'
4) 'node_modules\.bin\grunt'

Linux:
1) sudo add-apt-repository ppa:chris-lea/node.js  (standard distro grunt doesn't work :-( )
2) sudo apt-get update 
3) sudo apt-get install nodejs 
4) sudo npm install -g grunt-cli 

Mac:
?

The typescript code is compiled and webpack'ed into target/dosistiltekst.js, accesible as a var, and as commonjs module into target/dosistiltekst-commonjs.js

Run unit-tests:
npm run pretest
mocha "src/test/target/test/ts/*.js" (with --debug-brk in case you want to attach VS Code debugger)

Jenkins:
Due to xml-schema validation done during unittests, the fmk xsd's has to be present in a ../schemas folder. The xml-validation has no way of changing working dir meaning we unfortunately
have to create a schemas-folder in the parent folder of the project folder :-( On jenkins this is somewhat problematic due to missing rights for the jenkins user,
meaning that in case this folder is missing or is incomplete due to new FMK versions, causing the tests to fail, the solution is:
```sh
 cd /data/jenkins-data/jobs/fmk-dosis-til-tekst-ts/workspace
 sudo grunt copyForPrepareTestSchemasOnJenkins
 ```
 
