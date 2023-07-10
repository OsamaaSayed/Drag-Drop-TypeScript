const path = require('path'); //! webpack uses nodejs features

module.exports = {
    mode: 'development',
    entry: './src/app.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'), //! webpack needs the output directory as absolute path
        publicPath: 'dist', //! needed for the webpack-dev-server to really understand where the output is written to 
    },
    devtool: 'inline-source-map',
    module: { //! just a file , to tell webpack how to work with the files it finds(app.ts file and how to deal with the imports in the app.ts)
        rules: [ //! setup multiple rules that should be applied to all those files 
            {
                test: /\.ts$/, //! regex to tell webpack you wanna check for files ends with .ts 
                use: 'ts-loader', //! specifies what webpack should do with those files (any typescript file it finds should be handled by typescript loader, it transpiling your TypeScript code into JavaScript, and makes type-checking, and can cache previous compilations and only recompile the files that have changed since the last build)
                exclude: /node-modules/,
            }
        ]
    },
    resolve: {  //! tells webpack which file extensions it adds to the imports it finds (to bundle them in one file at the end)
        extensions: ['.ts', '.js']
    }
}
