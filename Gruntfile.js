module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: true,
                compress: {

                },
                beautify: false
            },
            my_target: {
                files: {
                    'js/min.js': ['js/model/*.js','js/engine/*.js','js/*.js','!js/min.js']
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'archive.zip'
                },
                files: [
                    {src: ['index.html']},
                    {src: ['js/min.js']},
                    {src: ['resources/**']}
                ]
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task(s).
    grunt.registerTask('default', ['uglify','compress']);

};