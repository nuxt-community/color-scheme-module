module.exports = {
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env', {
            targets: {
              esmodules: true
            }
          }
        ]
      ]
    },
    production: {
      presets: [
        [
          '@babel/preset-env', {
            targets: {
              browsers: '> 0.25%, not dead, ie 11, ie_mob 11'
            }
          }
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime'
        ]
      ]
    }
  }
}
