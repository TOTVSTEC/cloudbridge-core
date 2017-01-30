'use strict';

global.__basedir = __dirname;

let path = require('path'),
	os = require('os'),
	Q = require('q'),
	shelljs = require('shelljs'),
	AppServer = require('totvs-platform-helper/appserver'),
	TDS = require('totvs-platform-helper/tdscli');

const APPSERVER_DIR = path.join(__basedir, 'src', 'resources', 'appserver'),
	APPSERVER_EXE = os.platform() === 'win32' ? 'appserver.exe' : 'appserver';

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({

		pkg: pkg,

		twebchannel: {
			name: 'totvs-twebchannel',
			dist: path.join('build', 'dist', 'totvs-twebchannel')
		},

		clean: {
			dist: ['build']
		},

		ts: {
			dist: {
				tsconfig: true,
				options: {
					sourceMap: true,
					declaration: true
				}
			}
		},

		template: {
			js: {
				options: {
					data: function() {
						return {
							package: grunt.file.readJSON('package.json')
						};
					}
				},
				files: {
					'build/stagging/js/totvs-twebchannel.js': ['build/stagging/ts/totvs-twebchannel.js'],
					'build/stagging/js/promisequeue.js': ['build/stagging/ts/promisequeue.js']
				}
			}
		},

		concat: {
			dist: {
				src: [
					'src/resources/js/qwebchannel-5.7.0.js',
					'build/stagging/js/promisequeue.js',
					'build/stagging/js/totvs-twebchannel.js'
				],
				dest: '<%= twebchannel.dist %>/<%= twebchannel.name %>.js'
			}
		},

		uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= twebchannel.dist %>/<%= twebchannel.name %>.min.js'
			}
		}

	});


	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	// Full distribution task.
	grunt.registerTask('dist', ['ts', 'template', 'concat', 'uglify', 'compile']);

	// Default task.
	grunt.registerTask('default', ['clean', 'dist']);

	grunt.registerTask('deploy', 'Deploy new artifacts to his repos', function(target) {
		let done = this.async(),
			releaseTWebChannel = require('./src/util/releases/totvs-twebchannel'),
			releaseAppBase = require('./src/util/releases/cloudbridge-app-base');

		Q().then(releaseTWebChannel)
			.then(releaseAppBase)
			.then(done);
	});

	grunt.registerTask('compile', 'Compile AdvPL', function(target) {
		let done = this.async(),
			appserver = new AppServer({
				target: path.join(APPSERVER_DIR, APPSERVER_EXE)
			}),
			tds = new TDS(),
			tdsOptions = {
			serverType: "4GL",
			server: "127.0.0.1",
			port: -1,
			build: "7.00.150715P",
			environment: "ENVIRONMENT"
		};

		grunt.file.mkdir(path.join(__basedir, 'build', 'dist'));

		return appserver.start()
			.then(function() {
				tdsOptions.port = appserver.tcpPort;
				tdsOptions.build = appserver.build;
			})
			.then(function() {
				var options = Object.assign({
					recompile: true,
					program: [
						path.join(__basedir, 'src', 'components', 'app-base', 'src')
					],
					includes: [
						path.join(__basedir, 'src', 'resources', 'includes'),
						path.join(__basedir, 'src', 'components', 'app-base', 'includes')
					]
				}, tdsOptions);

				return tds.compile(options);
			})
			.then(function() {
				var options = Object.assign({
					fileResource: shelljs.ls(path.join(__basedir, 'src', 'components', 'app-base', 'src')),
					patchType: "ptm",
					saveLocal: path.join(__basedir, 'build', 'dist')
				}, tdsOptions);

				return tds.generatePatch(options);
			})
			.then(function() {
				return appserver.stop();
			})
			.then(done);
	});

	grunt.registerTask('bump', 'Bump version', function(target) {
		var semver = require('semver'),
			packageJson = grunt.file.readJSON('package.json'),
			bowerJson = grunt.file.readJSON('bower.json');

		var msg = 'Bumping version from "' + packageJson.version + '" to "';

		if (target === 'release') {
			packageJson.version = semver.inc(packageJson.version, 'patch');
		}
		else if (target === 'dev') {
			packageJson.version = semver.inc(packageJson.version, 'patch') + '-SNAPSHOT';
		}

		msg += packageJson.version + '"\n';
		console.log(msg);

		bowerJson.version = 'v' + packageJson.version;

		grunt.file.write('package.json', JSON.stringify(packageJson, null, 2) + '\n');
		grunt.file.write('bower.json', JSON.stringify(bowerJson, null, 2) + '\n');
	});

	grunt.registerTask('commit', 'Commit self', function(target) {
		let GitRepo = require(__basedir + '/src/util/git'),
			git = new GitRepo({
				cwd: __basedir
			}),
			pkg = grunt.file.readJSON('package.json');

		git.commit("Version " + pkg.version);

		if (target == 'tag') {
			git.tag('v' + pkg.version, "Version " + pkg.version);
		}

		git.commit();
	});

	grunt.registerTask('release', ['clean', 'bump:release', 'dist', 'deploy', 'commit:tag', 'bump:dev', 'commit']);

};

