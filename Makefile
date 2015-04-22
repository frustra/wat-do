LESSC = ./node_modules/.bin/lessc
UGLIFYJS = ./node_modules/.bin/uglifyjs
UGLIFYCSS = ./node_modules/.bin/uglifycss

prepare: compile-assets

install:
	npm install

compile-assets: install
	${LESSC} assets/css/master.less > public/master.css
	cat assets/js/*.js > public/master.js

dev:
	supervisor -n exit -w 'assets' -e 'less|js' -x make compile-assets &
	supervisor -n error -i 'public,assets' wat-do.js

run:
	node wat-do.js
