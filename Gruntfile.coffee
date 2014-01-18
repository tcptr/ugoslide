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

    jade:
      example:
        options:
          pretty: true
        files:
          "example/index.html": "src/example/index.jade"

    connect:
      example:
        options:
          port: 3000
          livereload: 35729

    esteWatch:
      options:
        dirs: ["src/**/"]
        livereload:
          enabled: true
          port: 35729
          extensions: ["jade", "scss", "coffee"]
      jade: -> "jade"
      scss: -> "sass"
      coffee: -> ["coffee", "uglify"]

  pkg = grunt.file.readJSON "package.json"

  for taskName of pkg.devDependencies
    if taskName.substring(0, 6) == "grunt-"
      grunt.loadNpmTasks taskName

  grunt.registerTask "default", [
    "coffee"
    "uglify"
    "sass"
    "jade"
    "connect"
    "esteWatch"
  ]

