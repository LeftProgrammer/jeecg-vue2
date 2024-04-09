module.exports = {
  presets: [
    ['@vue/app',
     { useBuiltIns: 'entry' }]
  ],
  plugins: [
    // 性能优化：ant 懒加载
    [ "import", {
      "libraryName": "ant-design-vue",
      "libraryDirectory": "es",
      "style": "css"
    } ]
  ]
}
