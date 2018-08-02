/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const globals = {
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/animations': 'ng.animations',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'classNames': 'classnames'
};

export default {
  entry: '../../../dist/packages-dist/fire-ant/fire-ant.es5.js',
  dest: '../../../dist/packages-dist/fire-ant/bundles/fire-ant.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.common',
  plugins: [resolve()],
  external: Object.keys(globals),
  onwarn: function (warning) {
    // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
    // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    // intercepts in some rollup versions
    if ( warning.indexOf("The 'this' keyword is equivalent to 'undefined'") > -1 ) {
      return;
    }
    console.error(warning.message);
  },
  globals: globals,
  plugins: [
    nodeResolve({
      jsnext: true,
      module: true,
      main: true, // for commonjs modules that have an index.js
      browser: true
    }),
    commonjs({
      include: '../../../node_modules/**',
      namedExports: {
        // left-hand side can be an absolute path, a path
        // relative to the current directory, or the name
        // of a module in node_modules
        '../../../node_modules/classnames/index.js': [ 'named' ]
      }
    })
  ]
};
