module.exports = function(grunt) {
    // LiveReload的默认端口号，你也可以改成你想要的端口号
    var lrPort = 35729;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({
        port: lrPort
    });
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var lrMiddleware = function(connect, options) {
        return [
            // 把脚本，注入到静态文件中
            lrSnippet,
            // 静态文件服务器的路径
            connect.static(options.base[0]),
            // 启用目录浏览(相当于IIS中的目录浏览)
            connect.directory(options.base[0])
        ];
    };

    //windows下这写法貌似有bug，不压缩.sea的，并且把.sea的压缩代码加到另外文件上
    /*var uglifySpecials = {
        expand: true,
        cwd: '',
        src: ['test/js/paged_list_mvc.sea.js','test/js/paged_list_mvc.js'],
        dest: '',
        ext: '.js'
    }*/

    var uglifySpecials = {
        files: [{
            'test/js/paged_list_mvc.sea.js': 'test/js/paged_list_mvc.sea.js',
        }, {
            'test/js/paged_list_mvc.js': 'test/js/paged_list_mvc.js'
        }]
    }

    var cssminSpecials = {};


    function matchSuffix(filePath, suffix) {
        if (suffix == filePath.split(".").pop()) {
            return true;
        }
        return false;
    }

    function compressOrCopyChanges(err, stdout, stderr, cb) {
        var files = stdout.split("\n");
        var jsFiles = [];
        var cssFiles = [];
        console.log("\n**********************************");
        console.log(stdout);
        console.log("**********************************");
        files.forEach(function(file) {
            var o = {};
            if (file) {
                o[file] = file;
                if (matchSuffix(file, "js")) {
                    jsFiles.push(o);
                } else if (matchSuffix(file, "css")) {
                    cssFiles.push(o);
                }
            }
        });
        if (jsFiles.length || cssFiles.length) {
            if (jsFiles.length) {
                uglifySpecials.files = jsFiles;
                grunt.task.run(["uglify:specials"]);
            }
            if (cssFiles.length) {
                cssminSpecials.files = cssFiles;
                grunt.task.run(["cssmin:specials"]);
            }
        }
        cb();
    }

    // 项目配置(任务配置)
    grunt.initConfig({
        // 读取我们的项目配置并存储到pkg属性中
        pkg: grunt.file.readJSON('package.json'),
        open: {
            server: {
                path: 'http://<%= connect.options.hostname + ":" + connect.options.port%>'
            }
        },
        // 通过connect任务，创建一个静态服务器
        connect: {
            options: {
                // 服务器端口号
                port: 8000,
                // 服务器地址(可以使用主机名localhost，也能使用IP)
                hostname: '192.168.1.141',
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: '.'
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }
        },
        // 通过watch任务，来监听文件是否有更改
        watch: {
            client: {
                // 我们不需要配置额外的任务，watch任务已经内建LiveReload浏览器刷新的代码片段。
                options: {
                    livereload: lrPort
                },
                // '**' 表示包含所有的子目录
                // '*' 表示包含所有的文件
                files: ['build/*.html', 'build/css/*', 'build/js/*', 'build/**/*', '**/*.html']
            },
            scripts: {
                files: ['develop/**/*.js'], //develop所有的子文件
                tasks: ['uglify:single'],
                options: {
                    spawn: false,
                },
            },
            css: {
                files: ['develop/**/*.css'], //develop所有的子文件
                tasks: ['cssmin:single'],
                options: {
                    spawn: false,
                },
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> Created by aron_阿伦 on <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: {
                    except: ['seajs', 'require', 'exports', 'module']
                }
                //sourceMap: true//是否添加map
            },
            single: uglifySpecials,
            specials: uglifySpecials,
            initEntire: {
                expand: true,
                cwd: 'develop',
                src: ['**/*.js'],
                dest: 'master',
                ext: '.js'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['base/*.css'],
                dest: 'build/base.concat.css',
                options: {
                    separator: '/** separator **/'
                }
            },
            basic: {
                src: ['base/*.js'],
                dest: 'build/base.concat.js'
            }
        },
        cssmin: {
            initEntire: {
                files: [{
                    expand: true,
                    cwd: 'develop',
                    src: ['**/*.css'],
                    dest: 'master',
                    ext: '.css'
                        //ext: '.min.css'
                }]
            },
            single: {
                files: [{
                    'csstest/output.css': ['csstest/*.css']
                }]
            },
            specials: cssminSpecials
        },
        githooks: {
            all: {
                'post-merge': {
                    taskNames: 'shell:deploy_changes'
                }
            }
        },
        shell: {
            deploy_changes: {
                command: "git diff --name-only HEAD HEAD^^",
                options: {
                    callback: compressOrCopyChanges
                },
                stdout: true,
                stderr: true,
                execOptions: {
                    cwd: '../gruntpublish' //可写可不写
                }
            }
        }
    }); // grunt.initConfig配置完毕

    // 加载插件
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-githooks');
    grunt.loadNpmTasks('grunt-shell');

    // 自定义任务
    grunt.registerTask('live', ["connect", 'open', 'watch']);

    grunt.registerTask('init-entire', ['cssmin:initEntire', 'uglify:initEntire']);

    grunt.registerTask('watch-concat', ['cssmin:initEntire', 'uglify:initEntire', 'watch']);

    grunt.registerTask('shells', ['shell:deploy_changes']);

    /*grunt.event.on('watch', function(action, filepath) {
        console.log(filepath.replace("develop","master"));

        grunt.config('uglify.build.src', filepath);
        grunt.config('uglify.build.dest', filepath.replace("develop","master"));

    });*/

    var changedFiles = Object.create(null);
    var onChange = grunt.util._.debounce(function() {
        var files = Object.keys(changedFiles); //原路径数组
        var filespath = {};
        for (var i = 0; i < files.length; i++) {
            filespath[files[i].replace(/develop/g, "master")] = files[i];
        }
        grunt.config('uglify.single.files', filespath);
        grunt.config('cssmin.single.files', filespath);
        //grunt.config('uglify.build.dest', filepath.replace(/develop/g, "master"));
        changedFiles = Object.create(null);
    }, 200);

    grunt.event.on('watch', function(action, filepath, target) {
        console.log("**************************************");
        changedFiles[filepath] = action;
        onChange();
    });
};
