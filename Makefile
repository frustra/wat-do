LESSC = lessc
UGLIFYJS = uglifyjs2

prepare: compile-assets
	npm install

compile-assets:
	${LESSC} -O3 --yui-compress assets/css/master.less > public/master.css
	${UGLIFYJS} assets/js/*.js --comments -c -m -o public/master.js

dev:
	supervisor -n exit -w 'assets' -e 'less|js' -x make compile-assets &
	supervisor -n error -i 'public' wat-do.js

run: compile-assets
	node wat-do.js
