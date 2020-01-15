const { series } = require('gulp');
const fs = require('fs-extra');
const html = fs.readFile('/src/app/assets/data/chronological.html')

function parsehtml() {
    const out = build + 'html/';
  
    return gulp.src(html)
      .pipe(
          console.log(html)
      );
  }
  exports.html = gulp.series(images, html);


exports.html = parsehtml;