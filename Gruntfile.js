module.exports = function(grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-typescript');

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// Task configuration.
		clean: {
			dist: ['build', 'dist']
		},

		typescript: {
			base: {
				src: ['src/ts/**/*.ts'],
				dest: 'build/stagging/ts',
				options: {
					sourceMap: true,
					declaration: true
				}
			}
		},

		concat: {
			dist: {
				src: [
					'src/js/qwebchannel-5.7.0.js',
					'build/stagging/ts/totvs-twebchannel.js'
				],
				dest: 'build/stagging/js/<%= pkg.name %>.concat.js'
			}
		},

		uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true,
			},
			core: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},

		exec: {
			npmUpdate: {
				command: 'npm update'
			}
		},

		compress: {
			main: {
				options: {
					archive: 'build/<%= pkg.name %>-<%= pkg.version %>.zip',
					mode: 'zip',
					level: 9,
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: ['**']
					}
				]
			}
		}

	});


	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
	require('time-grunt')(grunt);

	// JS distribution task.
	grunt.registerTask('dist-js', ['concat', 'uglify:core']);

	// Full distribution task.
	grunt.registerTask('dist', ['typescript', 'dist-js', 'compress']);

	// Default task.
	grunt.registerTask('default', ['clean:dist', 'dist']);

};
