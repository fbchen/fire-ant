var gulp = require('gulp');
var lessToScss = require('gulp-less-to-scss');

gulp.task('default', ['lessToScss']);
gulp.task('lessToScss',function(){
    gulp.src('src/app/fire-ant/style2/**/*.less')
        .pipe(lessToScss())
        .pipe(gulp.dest('src/app/fire-ant/style2/scss'));
});

