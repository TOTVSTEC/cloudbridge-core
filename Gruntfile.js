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
				main: '<%= pkg.name %>.min.js',
				dependencies: {

				}
			},
			stable: {
				options: {
					endpoint: 'git://github.com/TOTVSTEC/bower-totvs-twebchannel.git',
					packageName: '<%= pkg.name %>',
					stageDir: 'build/dist'
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

	grunt.registerTask('release', ['clean', 'dist', 'bowerRelease']);

};
