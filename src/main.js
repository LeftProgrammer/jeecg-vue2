/** init domain config */
import './config'
// import Antd, { version } from 'ant-design-vue'
// console.log('ant-design-vue version:', version)
// 性能优化：ant 懒加载
import './components/lazy_antd.js'
import Vue, { onErrorCaptured } from 'vue'
import App from './App.vue'
import Storage from 'vue-ls'
import router from './router'
import store from './store/'
import { VueAxios } from '@/utils/request'


import Viser from 'viser-vue'
import 'ant-design-vue/dist/antd.less' // or 'ant-design-vue/dist/antd.less'

/**
 * 分片上传
 * vue-simple-uploader 中文官方文档 https://github.com/simple-uploader/vue-uploader/blob/master/README_zh-CN.md
 * simple-uploader.js 中文官方文档 https://github.com/simple-uploader/Uploader/blob/develop/README_zh-CN.md
 */
import uploader from 'vue-simple-uploader'
Vue.use(uploader)

// 引入插件  解析  m3u8 切片视频
import Video from 'video.js'
import 'video.js/dist/video-js.css'
// vue2  prototype 全局挂载
Vue.prototype.$video = Video

import '@/permission' // permission control
import '@/utils/filter' // base filter
import Print from 'vue-print-nb-jeecg'
/*import '@babel/polyfill'*/
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import SSO from '@/cas/sso.js'
import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE,
} from '@/store/mutation-types'
import config from '@/defaultSettings'

import JDictSelectTag from './components/dict/index.js'
import hasPermission from '@/utils/hasPermission'
import DynamicForm from '@/components/online/autoform/index'
import vueBus from '@/utils/vueBus'
import JeecgComponents from '@/components/jeecg/index'
import '@/assets/less/JAreaLinkage.less'
import VueAreaLinkage from 'vue-area-linkage'
import * as WPS from '@/components/wps/util/jwps.es6'
import '@/components/jeecg/JVxeTable/install'
import '@/components/JVxeCells/install'

Vue.prototype.wps = WPS
Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
// Vue.use(Antd)
Vue.use(VueAxios, router)
Vue.use(Viser)
Vue.use(DynamicForm)
Vue.use(hasPermission)
Vue.use(JDictSelectTag)
Vue.use(Print)
Vue.use(preview)
Vue.use(vueBus)
Vue.use(JeecgComponents)
Vue.use(VueAreaLinkage)

// vue 自定义指令 拖拽事件
Vue.directive('drag-modal', (el, bindings, vnode) => {
  Vue.nextTick(() => {
    let { visible, destroyOnClose } = vnode.componentInstance
    // 防止未定义 destroyOnClose 关闭弹窗时dom未被销毁，指令被重复调用
    if (!visible) {
      return
    }
    let modal = el.getElementsByClassName('ant-modal')[0]
    let header = el.getElementsByClassName('ant-modal-header')[0]
    let left = 0
    let top = 0

    // 未定义 destroyOnClose 时，dom未被销毁，关闭弹窗再次打开，弹窗会停留在上一次拖动的位置
    if (!destroyOnClose) {
      left = modal.left || 0
      top = modal.top || 0
    }
    // top 初始值为 offsetTop
    top = top || modal.offsetTop
    header.onmousedown = (e) => {
      //如果已经是全屏的弹窗modal，就不能进行拖拽
      if (el.classList.contains('fullscreen')) {
        return
      }
      let startX = e.clientX
      let startY = e.clientY
      header.left = header.offsetLeft
      header.top = header.offsetTop
      el.onmousemove = (event) => {
        let endX = event.clientX
        let endY = event.clientY
        modal.left = header.left + (endX - startX) + left
        modal.top = header.top + (endY - startY) + top
        modal.style.left = modal.left + 'px'
        modal.style.top = modal.top + 'px'
      }
      el.onmouseup = (event) => {
        left = modal.left
        top = modal.top
        el.onmousemove = null
        el.onmouseup = null
        header.releaseCapture && header.releaseCapture()
      }
      header.setCapture && header.setCapture()
    }
  })
})

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

//设置使用缩略图与原图
Viewer.setDefaults({
  url: 'data-src', // 大图地址参数
  // filter(image) {
  //   // 只有大图的才能放大
  //   let dataSource = image.getAttribute('data-source')
  //   if (!dataSource) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
})
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999,
  },
})

SSO.init(() => {
  main()
})

// // 引入文件操作相关插件
// import fileOperationPlugins from '@/components/fragmentfile/fileOperationPlugins.js';
// for (let key in fileOperationPlugins) {
// 	Vue.prototype[`$${key}`] = fileOperationPlugins[key]
// }

function main() {
  new Vue({
    router,
    store,
    mounted() {
      store.commit('SET_SIDEBAR_TYPE', Vue.ls.get(SIDEBAR_TYPE, true))
      store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
      store.commit('TOGGLE_LAYOUT_MODE', Vue.ls.get(DEFAULT_LAYOUT_MODE, config.layout))
      store.commit('TOGGLE_FIXED_HEADER', Vue.ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
      store.commit('TOGGLE_FIXED_SIDERBAR', Vue.ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
      store.commit('TOGGLE_CONTENT_WIDTH', Vue.ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
      store.commit('TOGGLE_FIXED_HEADER_HIDDEN', Vue.ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
      store.commit('TOGGLE_WEAK', Vue.ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
      store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
      store.commit('SET_TOKEN', Vue.ls.get(ACCESS_TOKEN))
      store.commit('SET_MULTI_PAGE', Vue.ls.get(DEFAULT_MULTI_PAGE, config.multipage))
    },
    render: (h) => h(App),
  }).$mount('#app')
}
