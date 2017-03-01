'use strict';

let path = require('path'),
	shelljs = require('shelljs'),
	Q = require('q'),
	AppServer = require('totvs-platform-helper/appserver'),
	TDS = require('totvs-platform-helper/tdscli'),
	git = require('totvstec-tools').git,
	version = require('totvstec-tools').version;

const APPSERVER_DIR = path.join(__basedir, 'src', 'resources', 'appserver'),
	APPSERVER_EXE = process.platform === 'win32' ? 'appserver.exe' : 'appserver',
	GITHUB_PREFIX = 'https://github.com/TOTVSTEC/',
	REPO_NAME = 'cloudbridge-core-advpl',
	TARGET_DIR = path.join(__basedir, 'build', 'release', 'advpl'),
	DIST_DIR = path.join(__basedir, 'build', 'dist', 'advpl'),
	FILES = ['package.json', 'bower.json'];


class AdvplTask {

	static release() {
		return Q()
			.then(() => AdvplTask.build())
			.then(() => AdvplTask.checkout())
			.then(() => AdvplTask.copy())
			.then(() => AdvplTask.commit());
	}

	static build() {
		return Q()
			.then(() => AdvplTask.clean())
			.then(() => AdvplTask.prepare())
			.then(() => AdvplTask.compile());
	}

	static clean() {
		shelljs.rm('-rf', DIST_DIR);
		shelljs.mkdir('-p', DIST_DIR);
	}

	static prepare() {
		let rpoOrigin = path.join(__basedir, 'src', 'resources', 'apo', 'tttp110.rpo'),
			rpoTarget = path.join(DIST_DIR, 'tttp110.rpo');

		shelljs.cp('-Rf', rpoOrigin, rpoTarget);
	}

	static compile() {
		let appserver = new AppServer({
			target: path.join(APPSERVER_DIR, APPSERVER_EXE),
			silent: false/*true*/
		}),
			tds = new TDS({ silent: false/*true*/ }),
			tdsOptions = {
				serverType: "4GL",
				server: "127.0.0.1",
				port: -1,
				build: "7.00.150715P",
				environment: "ENVIRONMENT"
			};

		return appserver.start()
			.then(() => {
				tdsOptions.port = appserver.tcpPort;
				tdsOptions.build = appserver.build;
			})
			.then(() => {
				var options = Object.assign({
					recompile: true,
					program: [
						path.join(__basedir, 'src', 'components', 'advpl', 'src')
					],
					includes: [
						path.join(__basedir, 'src', 'resources', 'includes'),
						path.join(__basedir, 'src', 'components', 'advpl', 'includes')
					]
				}, tdsOptions);

				return tds.compile(options);
			})
			.then(() => {
				var options = Object.assign({
					fileResource: shelljs.ls(path.join(__basedir, 'src', 'components', 'advpl', 'src')),
					patchType: "ptm",
					saveLocal: DIST_DIR
				}, tdsOptions);

				return tds.generatePatch(options);
			})
			.then(() => {
				return appserver.stop();
			});
	}

	static copy() {
		let origin = path.join(DIST_DIR, 'tttp110.rpo'),
			dest = path.join(TARGET_DIR, 'src', 'apo', 'tttp110.rpo');

		shelljs.mkdir('-p', path.dirname(dest));
		shelljs.cp('-Rf', origin, dest);

		origin = path.join(__basedir, 'src', 'resources', 'includes');
		dest = path.join(TARGET_DIR, 'build', 'advpl');

		shelljs.mkdir('-p', dest);
		shelljs.cp('-Rf', origin, dest);

		origin = path.join(__basedir, 'src', 'components', 'advpl', 'includes');
		shelljs.cp('-Rf', origin, dest);

		origin = path.join(DIST_DIR, 'tttp110.ptm');
		dest = path.join(TARGET_DIR, 'tttp110.ptm');
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

module.exports = AdvplTask;
