'use strict';

global.__basedir = __dirname;

let path = require('path'),
	Q = require('q'),
	tools = require('totvstec-tools'),
	advpl = require('./src/tasks/advpl'),
	js = require('./src/tasks/js');

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({

		pkg: pkg,

		components: {
			js: {
				name: 'cloudbridge-core',
				dist: path.join('build', 'dist', 'js')
			},
			advpl: {
				name: 'cloudbridge-core-advpl',
				dist: path.join('build', 'dist', 'advpl')
			}
		},

		clean: {
			dist: ['build']
		},

		ts: {
			dist: {
				tsconfig: true,
				options: {
					sourceMap: true,
					declaration: true,
					compiler: './node_modules/typescript/bin/tsc'
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
				dest: '<%= components.js.dist %>/<%= components.js.name %>.js'
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
				dest: '<%= components.js.dist %>/<%= components.js.name %>.min.js'
			}
		}

	});


	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	grunt.registerTask('deploy', 'Deploy new artifacts to his repos', function(target) {
		let done = this.async();

		return Q()
			.then(() => advpl.release())
			.then(() => js.release())
			.then(() => done());
	});

	grunt.registerTask('compile', 'Compile AdvPL', function(target) {
		let done = this.async();

		return Q()
			.then(() => advpl.build())
			.then(() => done());
	});

	grunt.registerTask('bump', 'Bump version', function(target) {
		let v1 = tools.version.read('package.json'),
			v2 = v1;

		if (target === 'dev') {
			v2 = tools.version.inc(v1, 'patch', 'SNAPSHOT');
		}
		else {
			v2 = tools.version.inc(v1, 'patch');
		}

		console.log('Bumping version from "' + v1 + '" to "' + v2 + '"\n');

		tools.version.write('package.json', v2);
	});

	grunt.registerTask('commit', 'Commit self', function(target) {
		let done = this.async(),
			git = tools.git,
			pkg = grunt.file.readJSON('package.json'),
			message = '"Version ' + pkg.version + '"',
			annotate = 'v' + pkg.version;

		let promise = Q()
			.then(() => git.commit({ all: true, message: message }))
			.then(() => git.push());

		if (target === 'tag') {
			promise
				.then(() => git.tag({ annotate: annotate, message: message }))
				.then(() => git.push({ tags: true }));
		}

		promise
			.then(() => done());
	});

	// Full distribution task.
	grunt.registerTask('dist', ['ts', 'template', 'concat', 'uglify', 'compile']);

	// Default task.
	grunt.registerTask('default', ['clean', 'dist']);

	grunt.registerTask('release', ['clean', 'bump:release', 'dist', 'deploy', 'commit:tag', 'bump:dev', 'commit']);

};

