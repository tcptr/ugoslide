module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      build:
        src: ["src/*.coffee"]
        dest: "lib/ugoslide.js"
      example:
        src: ["src/example/*.coffee"]
        dest: "example/main.js"

    sass: example:
      options:
        style: "expanded"
      files: [
        expand: true
        cwd: "src/example"
        src: ["*.scss"]
        dest: "example"
        ext: ".css"
      ]

    jade: example:
      options:
        pretty: true
      files:
        "example/index.html": "src/example/index.jade"

    connect: example:
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
      coffee: -> "coffee"

  pkg = grunt.file.readJSON "package.json"

  for taskName of pkg.devDependencies
    if taskName.substring(0, 6) == "grunt-"
      grunt.loadNpmTasks taskName

  grunt.registerTask "default", [
    "coffee"
    "sass"
    "jade"
    "connect"
    "esteWatch"
  ]

