module.exports = {
    // declare the export with `const` rather than `var` in the IIFE builds
    extendRollupConfig (config) {
        config.outputConfig.preferConst = true
        return config
    }
}
