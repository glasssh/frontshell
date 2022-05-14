// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const isProduction = process.env.NODE_ENV == 'production';
const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/i,
                loader: 'babel-loader',
                exclude: ['/node_modules/'],
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            "crypto": false,
            "perf_hooks": false,
            "fs": false,
            "path": false
        }
    },
    externals: {
        './libwabt.js': 'WabtModule',
        './capstone-x86.min.js': 'MCapstone'
    }
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
