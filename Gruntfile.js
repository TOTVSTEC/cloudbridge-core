'use strict';

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({

		pkg: pkg,

		// Task configuration.
		clean: {
			dist: ['build']
		},

		ts: {
			dist: {
				src: ['src/ts/**/*.ts'],
				dest: 'build/stagging/ts',
				options: {
					sourceMap: true,
					declaration: true
				}
			}
		},

		template: {
			js: {
				options: {
					data: {
						package: pkg
					}
				},
				files: {
					'build/stagging/js/<%= pkg.name %>.js': ['<%= ts.dist.dest %>/<%= pkg.name %>.js']
				}
			}
		},

		concat: {
			dist: {
				src: [
					'src/js/qwebchannel-5.7.0.js',
					'build/stagging/js/<%= pkg.name %>.js'
				],
				dest: 'build/dist/<%= pkg.name %>.js'
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
				dest: 'build/dist/<%= pkg.name %>.min.js'
			}
		},

		bowerRelease: {
			options: {
				main: '<%= pkg.name %>.min.js'
			},
			stable: {
				options: {
					endpoint: 'https://github.com/TOTVSTEC/bower-totvs-twebchannel.git',
					packageName: 'bower-<%= pkg.name %>',
					stageDir: 'build/release'
				},
				files: [
					{
						expand: true,
						cwd: 'build/dist/',
						src: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js']
					}
				]
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

	grunt.registerTask('release', 'Build and release a new version', function(target) {
		var semver = require('semver'),
			packageJson = grunt.file.readJSON('package.json'),
			bowerJson = grunt.file.readJSON('bower.json');

		packageJson.version = semver.inc(packageJson.version, 'patch');
		grunt.file.write('package.json', JSON.stringify(packageJson, null, 2) + '\n');

		bowerJson.version = 'v' + packageJson.version;
		grunt.file.write('bower.json', JSON.stringify(bowerJson, null, 2) + '\n');

		grunt.task.run(['clean', 'dist', 'bowerRelease']);
	});

};
