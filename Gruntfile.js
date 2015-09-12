'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			css: {
				files: 'src/*.*',
				tasks: ['build'],
				options: {
					livereload: true,
				}
			},
		},
		uglify: {
			js: {
				files: {
					'dist/game.min.js': ['src/main.js']
				}
			}
		},
		cssmin: {
			css: {
				files: {
					'dist/game.min.css': ['src/css/game.css']
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'dist/index.html': 'src/index.html'
				}
			}
		}
	});

	grunt.registerTask('build', [
		'uglify',
		'cssmin',
		'htmlmin'
	]);

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-serve');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
};
