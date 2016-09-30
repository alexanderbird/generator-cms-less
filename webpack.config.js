module.exports = {
  entry: './src/cms_less.ts',
  output: {
    filename: './generators/app/templates/js/lib/cms-less.min.js',
    libraryTarget: 'var',
    library: 'CmsLess'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.d.ts', '.js']
  },
  module: {
    loaders: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
} 
