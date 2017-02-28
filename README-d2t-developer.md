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

The typescript code is compiled and webpack'ed into target/dosistiltekst.js

Run unit-tests:
mocha "src/test/ts/*.js" (with --debug-brk in case you want to attach VS Code debugger)