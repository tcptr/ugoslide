module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      build:
        src: ["src/*.coffee"]
        dest: "lib/ugoslide.js"

    uglify:
      build:
        files:
          "lib/ugoslide.min.js": ["lib/ugoslide.js"]

    sass:
      build:
        files: [
          expand: true
          cwd: "src"
          src: ["*.scss"]
          dest: "lib"
          ext: ".css"
        ]

    copy:
      ghPages:
        files: [
          expand: true
          flatten: true
          src: ['lib/*']
          dest: 'gh-pages/lib/'
        ]

    connect:
      ghPages:
        options:
          port: 3000
          livereload: 35729

    esteWatch:
      options:
        dirs: ["src/**/"]
        livereload:
          enabled: true
          port: 35729
          extensions: ["scss", "coffee"]
      scss: -> ["sass", "copy"]
      coffee: -> ["coffee", "uglify", "copy"]

  pkg = grunt.file.readJSON "package.json"

  for taskName of pkg.devDependencies
    if taskName.substring(0, 6) == "grunt-"
      grunt.loadNpmTasks taskName

  grunt.registerTask "build", ["coffee", "uglify", "sass"]
  grunt.registerTask "default", ["build", "connect", "copy", "esteWatch"]

