let path = require('path'),
	fs = require('fs'),
	shelljs = require('shelljs'),
	Q = require('q'),
	AppServer = require('totvs-platform-helper/appserver'),
	TDS = require('totvs-platform-helper/tdscli'),
	GitRepo = require(__basedir + '/src/util/git'),
	git = null;


const APPSERVER_DIR = path.join(__basedir, 'src', 'resources', 'appserver'),
	GITHUB_PREFIX = 'https://github.com/TOTVSTEC/',
	REPO_NAME = 'cloudbridge-app-base';

module.exports = function run() {
	git = new GitRepo({
		cwd: path.join(__basedir, 'build', 'release', REPO_NAME),
		url: GITHUB_PREFIX + REPO_NAME + '.git'
	});

	return Q()
		.then(clean)
		.then(checkout)
		.then(compile)
		.then(copy)
		.then(commit);
};

function clean() {
	let rpoDir = path.join(__basedir, 'build', 'dist'),
		rpoFile = path.join(rpoDir, 'tttp110.rpo');

	shelljs.rm('-rf', rpoFile);
	shelljs.mkdir('-p', rpoDir);
}

function compile() {
	let appserver = new AppServer(APPSERVER_DIR),
		tds = new TDS(),
		tdsOptions = {
			serverType: "Logix",
			server: "127.0.0.1",
			port: -1,
			build: "7.00.150715P",
			recompile: true,
			environment: "ENVIRONMENT",
			program: [
				path.join(__basedir, 'src', 'components', 'app-base', 'src')
			],
			includes: [
				path.join(__basedir, 'src', 'resources', 'includes'),
				path.join(__basedir, 'src', 'components', 'app-base', 'includes')
			]
		};

	return appserver.start()
		.then(function() {
			tdsOptions.port = appserver.tcpPort;

			return tds.compile(tdsOptions);
		})
		.then(function() {
			return appserver.stop();
		});
}


function copy() {
	let home = path.join(__basedir, 'build', 'release', 'cloudbridge-app-base'),
		origin = path.join(__basedir, 'build', 'dist', 'tttp110.rpo'),
		dest = path.join(home, 'src', 'apo', 'tttp110.rpo');

	shelljs.mkdir('-p', path.join(dest, '..'));
	shelljs.cp('-Rf', origin, dest);


	origin = path.join(__basedir, 'src', 'resources', 'includes');
	dest = path.join(home, 'build', 'advpl');

	shelljs.mkdir('-p', dest);
	shelljs.cp('-Rf', origin, dest);

	origin = path.join(__basedir, 'src', 'components', 'app-base', 'includes');

	shelljs.cp('-Rf', origin, dest);
}



function checkout() {
	git.checkout();
}

function commit() {
	let packagePath = path.join(__basedir, 'package.json'),
		pkg = JSON.parse(fs.readFileSync(packagePath, {encoding: 'utf8'}));

	git.bump(pkg.version);

	git.commit("Version " + pkg.version);
	git.tag('v' + pkg.version, "Version " + pkg.version);
}
