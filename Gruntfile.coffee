module.exports = (grunt) ->
	'use strict'

	require('load-grunt-tasks')(grunt)

	grunt.initConfig
		jsSource: 'src/*.js'
		jsDist: 'dist/'
		banner: '/**\n
 * Talaria.js — HTTP-transport that supports Promises and cancelable requests (XHR)\n
 * @author Alexander Burtsev, http://burtsev.me, <%= grunt.template.today("yyyy") %>\n
 * @license MIT\n
 */\n',

		jshint:
			talaria: ['<%= jsSource %>']

		copy:
			options:
				process: (content, srcpath)->
					grunt.config.get('banner') + content
			source:
				files: [
					expand: true
					cwd: 'src/'
					src: ['**']
					dest: 'dist/'
				]

		uglify:
			options:
				banner: '<%= banner %>'
				sourceMap: true
			talaria:
				files:
					'<%= jsDist %>talaria.min.js': ['<%= jsSource %>']

		watch:
			talaria:
				files: ['<%= jsSource %>']
				tasks: ['jshint', 'copy', 'uglify']

	grunt.registerTask 'build', ['jshint', 'copy', 'uglify']
	grunt.registerTask 'default', ['build', 'watch']
