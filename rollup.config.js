import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'umd',
  plugins: [ babel() ],
  moduleName: 'Utils',
  dest: 'h5-utils.js'
};
