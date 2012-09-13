LESSC = lessc
UGLIFYJS = uglifyjs

prepare: compile-assets
	npm install

compile-assets:
	${LESSC} -O3 --yui-compress assets/css/master.less > public/master.css
	#cat site/assets/js/jquery-ui.js site/assets/js/bootstrap.js site/assets/js/tag-it.js site/assets/js/submit.js > site/public/master.tmp.js
	#${UGLIFYJS} -nc site/public/master.tmp.js > site/public/master.js
	#rm site/public/master.tmp.js

dev: compile-assets
	supervisor --no-restart-on error --extensions 'node|js|less' --ignore 'site/public' -x make run-dev

run-dev:
	node wat-do.js