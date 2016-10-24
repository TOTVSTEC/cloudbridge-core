'use strict';

global.__basedir = __dirname;

let path = require('path'),
	Q = require('q');

var twebchannel = {
	name: 'totvs-twebchannel',
	dist: path.join('build', 'dist', 'totvs-twebchannel')
};

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({

		pkg: pkg,

		twebchannel: twebchannel,

		// Task configuration.
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
					'build/stagging/js/<%= twebchannel.name %>.js': ['build/stagging/ts/<%= twebchannel.name %>.js']
				}
			}
		},

		concat: {
			dist: {
				src: [
					'src/resources/js/qwebchannel-5.7.0.js',
					'build/stagging/js/<%= twebchannel.name %>.js'
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
		},

		bowerRelease: {
			options: {
				main: '<%= twebchannel.name %>.min.js'
			},
			stable: {
				options: {
					endpoint: 'https://github.com/TOTVSTEC/bower-totvs-twebchannel.git',
					packageName: '<%= twebchannel.name %>',
					stageDir: 'build/release'
				},
				files: [
					{
						expand: true,
						cwd: '<%= twebchannel.dist %>/',
						src: ['<%= twebchannel.name %>.js', '<%= twebchannel.name %>.min.js']
					}
				]
			}
		},

		git_deploy: {
			appbase: {
				options: {
					//url: 'git@github.com:TOTVSTEC/cloudbridge-app-base.git',
					url: 'https://github.com/TOTVSTEC/cloudbridge-app-base.git',
					branch: 'master',
					message: 'Bumped version to v<%= pkg.version %>',
					tag: '<%= pkg.version %>',
					tagMessage: 'Bumped version to v<%= pkg.version %>'
				},
				src: 'build/rpo'
			}
		}

	});


	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	// Full distribution task.
	grunt.registerTask('dist', ['ts', 'template', 'concat', 'uglify']);

	// Default task.
	grunt.registerTask('default', ['clean', 'dist']);

	grunt.registerTask('deploy', 'Deploy new artifacts to his repos', function(target) {
		let done = this.async(),
			releaseTWebChannel = require('./src/util/releases/totvs-twebchannel'),
			releaseAppBase = require('./src/util/releases/cloudbridge-app-base');

		Q.all([
			releaseTWebChannel(),
			releaseAppBase()
		])
		.catch(function(error) {
			console.error(error);
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
		git.tag('v' + pkg.version, "Version " + pkg.version);

		git.commit();
	});

	grunt.registerTask('release', ['clean', 'bump:release', 'dist', 'deploy', 'bump:dev', 'commit']);

};
