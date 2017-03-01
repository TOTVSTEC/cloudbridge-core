'use strict';

let path = require('path'),
	shelljs = require('shelljs'),
	Q = require('q'),
	git = require('totvstec-tools').git,
	version = require('totvstec-tools').version;

const GITHUB_PREFIX = 'https://github.com/TOTVSTEC/',
	REPO_NAME = 'cloudbridge-core-js',
	TARGET_DIR = path.join(__basedir, 'build', 'release', 'js'),
	DIST_DIR = path.join(__basedir, 'build', 'dist', 'js'),
	FILES = ['package.json', 'bower.json'];

class JsTask {

	static release() {
		return Q()
			.then(() => JsTask.checkout())
			.then(() => JsTask.copy())
			.then(() => JsTask.commit());
	}

	static copy() {
		let origin = path.join(DIST_DIR, '*.*'),
			dest = TARGET_DIR;

		shelljs.cp('-Rf', origin, dest);
	}

	static checkout() {
		let url = GITHUB_PREFIX + REPO_NAME + '.git',
			options = { cwd: TARGET_DIR };

		shelljs.rm('-rf', TARGET_DIR);
		shelljs.mkdir('-p', TARGET_DIR);

		return git.clone([url, '.'], { branch: 'master' }, options)
			.then(() => {
				return git.checkout({ B: 'master' }, options);
			});
	}

	static commit() {
		let packagePath = path.join(__basedir, 'package.json'),
			packageVersion = version.read(packagePath),
			message = '"Version ' + packageVersion + '"',
			options = { cwd: TARGET_DIR };

		for (let i = 0; i < FILES.length; i++) {
			let file = path.join(TARGET_DIR, FILES[i]);

			if (shelljs.test('-f', file)) {
				version.write(file, packageVersion);
			}
		}

		return git.commit({ all: true, message: message }, options)
			.then(() => {
				return git.push({}, options);
			})
			.then(() => {
				return git.tag({ annotate: 'v' + packageVersion, message: message }, options);
			})
			.then(() => {
				return git.push({ tags: true }, options);
			});
	}

}

module.exports = JsTask;
