LESSC = node_modules/less/bin/lessc
UGLIFYJS = node_modules/uglify-js/bin/uglifyjs

compile-assets:
	npm install
	${LESSC} -O3 --yui-compress assets/css/master.less > public/master.css
	${UGLIFYJS} assets/js/*.js --comments -c -m -o public/master.js

dev:
	supervisor -n exit -w 'assets' -e 'less|js' -x make compile-assets &
	supervisor -n error -i 'public,assets' wat-do.js

run:
	node wat-do.js

build-run:
	${LESSC} -O3 --yui-compress assets/css/master.less > public/master.css
	${UGLIFYJS} assets/js/*.js --comments -c -m -o public/master.js
	node wat-do.js
