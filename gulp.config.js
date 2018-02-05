module.exports = function () {
    var config = {
        build: {
            buildDirectory: './dist/',
            mappingsOutputDirectory: ''
        },
        test: {
            coverageDirectory: './coverage/'
        },
        srcFiles: [
            './src/**/*.ts'
        ]
    }
    return config;
}