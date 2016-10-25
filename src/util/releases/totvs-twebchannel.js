let path = require('path'),
	shelljs = require('shelljs'),
	fs = require('fs'),
	Q = require('q'),
	GitRepo = require(__basedir + '/src/util/git'),
	git = null;


const GITHUB_PREFIX = 'https://github.com/TOTVSTEC/',
	REPO_NAME = 'bower-totvs-twebchannel';

module.exports = function run() {
	git = new GitRepo({
		cwd: path.join(__basedir, 'build', 'release', REPO_NAME),
		url: GITHUB_PREFIX + REPO_NAME + '.git'
	});

	return Q()
		.then(checkout)
		.then(copy)
		.then(commit);
};

function copy() {
	let origin = path.join(__basedir, 'build', 'dist', 'totvs-twebchannel', '*.*'),
		dest = path.join(__basedir, 'build', 'release', 'bower-totvs-twebchannel');

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
