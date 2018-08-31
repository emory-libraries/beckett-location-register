module.exports = function( grunt ) {
  
  let path = require('path'),
      extend = require('extend'),
      pkg = require('./package.json'),
      composer = require('./composer.json'),
      config = require('./package-config.json');
  
  const PATHS = config.paths;
  
  grunt.config.set('pkg', pkg);
  grunt.config.set('composer', composer);
  grunt.config.set('config', (config = grunt.config.process(config)));
  
  let type = function( thing ) {
    
        if( thing === null ) return 'null';
        else if ( thing instanceof Array === true ) return 'array';
        else if ( typeof thing === 'object' ) return 'object';
        else return typeof thing;
    
      },
      replacement = function( options ) {
    
        let result = [],
            settings = extend({
              sources: [],
              path: '.',
              template: '',
              ext: null,
              match: ':file'
            }, options);

        if( !settings.sources ) return; 

        if( type(settings.sources) === 'object' ) settings.sources = Object.keys(settings.sources);
        
        settings.sources = settings.sources.reduce((previous, current) => {

          return type(current) === 'object' ? [...previous, ...Object.keys(current)] : [...previous, current];
          
        }, []);

        settings.sources.forEach(function(source){

          let ext = path.extname(source),
              file = source.indexOf('//') == -1 ? source.replace( ext, '') + settings.ext : source,
              src = source.indexOf('//') == -1 ? settings.path + file : file,
              template = settings.template.replace( settings.match, src );

          result.push( template ); 

        });

        return result.join("\n");

      };

  grunt.config.merge({
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: [path.resolve(PATHS.src.js, '**/*.js')],
        tasks: ['jshint:dev', 'babel:dev', 'replace:dev']
      },
      scss: {
        files: [path.resolve(PATHS.src.scss, '**/*.scss')],
        tasks: ['dart-sass:dev', 'postcss:dev']
      },
      php: {
        files: [path.resolve(PATHS.src.php, '**/*.php')],
        tasks: ['copy:dev']
      },
      html: {
        files: [path.resolve(PATHS.src.root, '*.{html,vue,svg}'), path.resolve(PATHS.src.partials, '**/*.{html,vue,svg}')],
        tasks: ['includes:dev', 'replace:dev']
      },
      md: {
        files: [path.resolve(PATHS.src.md, '**/*.md')],
        tasks: ['includes:dev', 'replace:dev']
      },
      assets: {
        files: [
          path.resolve(PATHS.src.images, '**/*'), 
          path.resolve(PATHS.src.fonts, '**/*')
        ],
        tasks: ['copy:dev']
      },
      config: {
        options: {
          reload: true,
        },
        files: [
          'package.json', 
          'package-config.json', 
          'Gruntfile.js',
          '.babelrc',
          '.jshintrc',
          '.todo'
        ],
        tasks: ['dev:startup', 'includes:dev', 'replace:dev']
      },
      data: {
        options: { dot: true },
        files: [path.resolve(PATHS.data.root, '**/*')],
        tasks: ['copy:dev']
      }
    },
    copydeps: {
      dev: {
        options: {
          unminified: true,
          css: true,
          include: {
            js: {
              'outdatedbrowser/outdatedbrowser/lang/*.html': 'outdatedbrowser'
            }
          }
        },
        pkg: 'package.json',
        dest: {
          js: PATHS.dev.dependencies.js,
          css: PATHS.dev.dependencies.css
        }
      },
      dist: {
        options: {
          unminified: true,
          css: true,
          include: {
            js: {
              'outdatedbrowser/outdatedbrowser/lang/*.html': 'outdatedbrowser/'
            }
          }
        },
        pkg: 'package.json',
        dest: {
          js: PATHS.dist.dependencies.js,
          css: PATHS.dist.dependencies.css
        }
      }
    },
    replace: {
      dev: {
        options: {
          patterns: [
            {
              match: 'css',
              replacement: replacement({
                sources: config.css, 
                path: PATHS.dev.css.replace('dev/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.css'
              })
            },
            { 
              match: 'js',
              replacement: replacement({
                sources: config.js, 
                path: PATHS.dev.js.replace('dev/', ''),  
                template: '<script src=":file"></script>',
                ext: '.js'
              })
            },
            { 
              match: 'dependencies:css',
              replacement: replacement({
                sources: config.dependencies.css, 
                path: PATHS.dev.dependencies.css.replace('dev/', ''),  
                template: '<link rel="stylesheet" href=":file">',
                ext: '.css'
              })
            },
            { 
              match: 'dependencies:js',
              replacement: replacement({
                sources: config.dependencies.js, 
                path: PATHS.dev.dependencies.js.replace('dev/', ''),  
                template: '<script src=":file"></script>',
                ext: '.js'
              })
            },
            {
              match: 'livereload',
              replacement: '<script src="//localhost:35729/livereload.js"></script>'
            },
            {
              match: 'base',
              replacement: '<base href="//localhost/beckett-location-register/dev/">'
            }, 
            {
              match: 'path',
              replacement: '/beckett-location-register/dev'
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dev.root, '*.html')],
            dest: path.resolve(PATHS.dev.root)
          },
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dev.js, '*.js')],
            dest: path.resolve(PATHS.dev.js)
          }
        ]
      },
      dist: {
        options: {
          patterns: [
            {
              match: 'css',
              replacement: replacement({
                sources: config.css, 
                path: PATHS.dist.css.replace('dist/', ''),  
                template: '<link rel="stylesheet" href="/:file">',
                ext: '.min.css'
              })
            },
            { 
              match: 'js',
              replacement: replacement({
                sources: config.js, 
                path: PATHS.dist.js.replace('dist/', ''),  
                template: '<script src="/:file"></script>',
                ext: '.min.js'
              })
            },
            { 
              match: 'dependencies:css',
              replacement: replacement({
                sources: config.dependencies.css, 
                path: PATHS.dist.dependencies.css.replace('dist/', ''),  
                template: '<link rel="stylesheet" href="/:file">',
                ext: '.min.css'
              })
            },
            { 
              match: 'dependencies:js',
              replacement: replacement({
                sources: config.dependencies.js, 
                path: PATHS.dist.dependencies.js.replace('dist/', ''),  
                template: '<script src="/:file"></script>',
                ext: '.min.js'
              })
            },
            {
              match: 'livereload',
              replacement: ''
            },
            {
              match: 'base',
              replacement: ''
            },
            {
              match: 'path',
              replacement: ''
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dist.root, '*.html')],
            dest: path.resolve(PATHS.dist.root)
          },
          {
            expand: true,
            flatten: true,
            src: [path.resolve(PATHS.dist.js, '*.js')],
            dest: path.resolve(PATHS.dist.js)
          }
        ]
      },
    },
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: PATHS.src.images,
            src: ['**/*'],
            dest: PATHS.dev.images
          },
          {
            expand: true,
            cwd: PATHS.src.fonts,
            src: ['**/*'],
            dest: PATHS.dev.fonts
          },
          {
            expand: true,
            cwd: PATHS.src.php,
            src: ['**/*'],
            dest: PATHS.dev.php
          },
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['**/*', '!.env', '!.env.dev', '!.env.prod'],
            dest: PATHS.dev.root,
            dot: true
          }, 
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['.env.dev'],
            dest: PATHS.dev.root,
            dot: true,
            rename: (dest, src) => dest + src.replace('.dev', '')
          }, 
          {
            expand: true,
            cwd: PATHS.composer.root,
            src: ['**/*'],
            dest: PATHS.dev.dependencies.php
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.src.images,
            src: ['**/*'],
            dest: PATHS.dist.images
          },
          {
            expand: true,
            cwd: PATHS.src.fonts,
            src: ['**/*'],
            dest: PATHS.dist.fonts
          },
          {
            expand: true,
            cwd: PATHS.src.php,
            src: ['**/*'],
            dest: PATHS.dist.php
          },
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['**/*', '!.env', '!.env.dev', '!.env.prod'],
            dest: PATHS.dist.root,
            dot: true
          }, 
          {
            expand: true,
            cwd: PATHS.data.root,
            src: ['.env.prod'],
            dest: PATHS.dist.root,
            dot: true,
            rename: (dest, src) => dest + src.replace('.prod', '')
          }, 
          {
            expand: true,
            cwd: PATHS.composer.root,
            src: ['**/*'],
            dest: PATHS.dist.dependencies.php
          }
        ]
      },
    },
    clean: {
      dev: [PATHS.dev.root],
      dist: [PATHS.dist.root],
      unmincss: [path.resolve(PATHS.dist.css, '**/*.css'), '!' + path.resolve(PATHS.dist.css, '**/*.min.css')],
      unminjs: [path.resolve(PATHS.dist.js, '**/*.js'), '!' + path.resolve(PATHS.dist.js, '**/*.min.js')]
    },
    jshint: {
      dev: {
        options: {
          jshintrc: true
        },
        src: [path.resolve(PATHS.src.js, '*.js')]
      }
    },
    'dart-sass': {
      dev: {
        options: {
          sourceMap: false,
          style: 'expanded',
          update: false
        },
        files: [
          {
            expand: true,
            cwd: PATHS.src.scss,
            src: ['*.scss'],
            dest: PATHS.dev.css,
            ext: '.css'
          }
        ]
      },
      dist: {
        options: {
          sourceMap: false,
          style: 'compressed'
        },
        files: [
          {
            expand: true,
            cwd: PATHS.src.scss,
            src: ['*.scss'],
            dest: PATHS.dist.css,
            ext: '.css'
          }
        ]
      }
    },
    postcss: {
      options: {
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' })
        ]
      },
      dev: {
        src: [path.resolve(PATHS.dev.css, '**/*.css')]
      },
      dist: {
        src: [path.resolve(PATHS.dist.css, '**/*.css')]
      }
    },
    cssmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.dist.css,
            src: ['**/*.css', '!**/*.min.css'],
            dest: PATHS.dist.css,
            ext: '.min.css'
          }
        ]
      }
    },
    uglify: {
      dist: {
        files: [
          {
            expand: true,
            cwd: PATHS.dist.js,
            src: [
              '**/*.js', 
              '!**/*.min.js',
              '!dependencies/vue.js',
              '!dependencies/codemirror/*.js'
            ],
            dest: PATHS.dist.js,
            ext: '.min.js'
          }
        ]
      }
    },
    babel: {
      dev: {
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.js),
            src: ['**/*.js'],
            dest: path.resolve(PATHS.dev.js)
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: path.resolve(PATHS.src.js),
            src: ['**/*.js'],
            dest: path.resolve(PATHS.dist.js)
          }
        ]
      }
    },
    includes: {
      dev: {
        options: {
          includePath: [PATHS.src.partials, PATHS.src.md],
          wrapper: path.resolve(PATHS.src.partials, 'layouts/default.html')
        },
        files: [{
          expand: true,
          cwd: path.resolve(PATHS.src.root),
          src: ['*.{html,vue,svg}'],
          dest: path.resolve(PATHS.dev.root)
        }]
      },
      dist: {
        options: {
          includePath: [PATHS.src.partials, PATHS.src.md],
          wrapper: path.resolve(PATHS.src.partials, 'layouts/default.html')
        },
        files: [{
          expand: true,
          cwd: path.resolve(PATHS.src.root),
          src: ['*.{html,vue,svg}'],
          dest: path.resolve(PATHS.dist.root)
        }]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-dart-sass');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-copy-deps');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-includes');
  
  grunt.registerTask('default', ['dev']);
  grunt.registerTask('dev:startup', [
    'clean:dev',
    'copydeps:dev',
    'copy:dev',
    'dart-sass:dev',
    'postcss:dev',
    'jshint:dev',
    'babel:dev',
    'includes:dev',
    'replace:dev'
  ]);
  grunt.registerTask('dev', [
    'dev:startup', 
    'watch'
  ]);
  grunt.registerTask('dist', [
    'clean:dist',
    'copydeps:dist',
    'copy:dist',
    'dart-sass:dist',
    'postcss:dist',
    'cssmin:dist',
    'clean:unmincss',
    'babel:dist',
    'uglify:dist',
    'clean:unminjs',
    'includes:dist',
    'replace:dist' 
  ]);
  
};