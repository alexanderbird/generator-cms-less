var ts_config = {
  prod: { },
  dev: {
    declaration: true,
    declarationDir: "/types/"
  }
}

var env = process.argv.indexOf("--development") >= 0 ? "dev" : "prod"


module.exports = {
  context: __dirname + "/src",
  entry: './cms_less.ts',
  output: {
    path: './generators/app/templates/js/lib/',
    filename: 'cms-less.min.js',
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
  },
  ts: {
    compilerOptions: ts_config[env]
  }
}
