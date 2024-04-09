<template>
  <!-- , width: fixedHeader ? `calc(100% - ${sidebarOpened ? 256 : 80}px)` : '100%'  -->
  <a-layout-header
    v-if="!headerBarFixed"
    :class="[
      fixedHeader && 'ant-header-fixedHeader',
      sidebarOpened ? 'ant-header-side-opened' : 'ant-header-side-closed',
    ]"
    :style="{ padding: '0' }"
  >
    <div v-if="mode === 'sidemenu'" class="header" :class="theme">
      <a-icon
        v-if="device === 'mobile'"
        class="trigger"
        :type="collapsed ? 'menu-fold' : 'menu-unfold'"
        @click="toggle"
      ></a-icon>
      <a-icon v-else class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="toggle" />

      <span v-if="device === 'desktop'">鲸禾JMC后台管理系统</span>
      <span v-else></span>
      <user-menu :theme="theme" />

      <!-- <a-dropdown :trigger="['click']" :placement="'bottomCenter'">
        <span class="hand-upload-class hover-app">APP</span>
        <a-menu slot="overlay">
          <a-menu-item>
            <div style="height: 254px; width: 385px">
              <div style="height: 32px; font-size: 14px">
                <a target="_blank" href="http://oa.jinghesoftware.com/docs/鲸禾COP协同办公平台-操作手册V1.0.pdf"
                  >鲸禾COP协同办公平台-操作手册V1.0</a
                ><br />
                <a target="_blank" href="http://oa.jinghesoftware.com/docs/鲸禾COP移动端IOS安装手册.pdf"
                  >IOS移动端安装手册</a
                >
              </div>
            </div>
          </a-menu-item>
        </a-menu>
      </a-dropdown> -->
      <!-- 时间 -->
      <span class="rt">{{ nowDate }}</span>
    </div>
    <!-- 顶部导航栏模式 -->
    <div v-else :class="['top-nav-header-index', theme]">
      <div class="header-index-wide">
        <div class="header-index-left" :style="topMenuStyle.headerIndexLeft">
          <logo class="top-nav-header" :show-title="device !== 'mobile'" :style="topMenuStyle.topNavHeader" />
          <div v-if="device !== 'mobile'" :style="topMenuStyle.topSmenuStyle">
            <s-menu mode="horizontal" :menu="menus" :theme="theme"></s-menu>
          </div>
          <a-icon v-else class="trigger" :type="collapsed ? 'menu-fold' : 'menu-unfold'" @click="toggle"></a-icon>
        </div>
        <user-menu class="header-index-right" :theme="theme" :style="topMenuStyle.headerIndexRight" />
      </div>
    </div>

    <!-- 在线聊天组件化集成 -->
    <!-- <j-chat :chatStatus.sync="chatStatus" /> -->
  </a-layout-header>
</template>

<script>
import UserMenu from '../tools/UserMenu'
import SMenu from '../menu/'
import Logo from '../tools/Logo'
import AndroidApp from './AndroidApp'
// import JChat from '@/views/JChat'

import { mixin } from '@/utils/mixin.js'

export default {
  name: 'GlobalHeader',
  components: {
    UserMenu,
    SMenu,
    Logo,
    AndroidApp,
    // JChat,
  },
  mixins: [mixin],
  props: {
    mode: {
      type: String,
      // sidemenu, topmenu
      default: 'sidemenu',
    },
    menus: {
      type: Array,
      required: true,
    },
    theme: {
      type: String,
      required: false,
      default: 'dark',
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false,
    },
    device: {
      type: String,
      required: false,
      default: 'desktop',
    },
  },
  data() {
    return {
      headerBarFixed: false,
      //update-begin--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
      topMenuStyle: {
        headerIndexLeft: {},
        topNavHeader: {},
        headerIndexRight: {},
        topSmenuStyle: {},
      },
      chatStatus: '',
      // 当前日期
      nowDate: '',
    }
  },
  created() {
    // this.addDate()
  },
  watch: {
    /** 监听设备变化 */
    device() {
      if (this.mode === 'topmenu') {
        this.buildTopMenuStyle()
      }
    },
    /** 监听导航栏模式变化 */
    mode(newVal) {
      if (newVal === 'topmenu') {
        this.buildTopMenuStyle()
      }
    },
  },
  //update-end--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    //update-begin--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
    if (this.mode === 'topmenu') {
      this.buildTopMenuStyle()
    }
    //update-end--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
  },
  methods: {
    currentTime() {
      setInterval(this.formatDate, 500)
    },
    formatDate() {
      let date = new Date()
      let year = date.getFullYear() // 年
      let month = date.getMonth() + 1 // 月
      let day = date.getDate() // 日
      let week = date.getDay() // 星期
      let weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      let hour = date.getHours() // 时
      hour = hour < 10 ? '0' + hour : hour // 如果只有一位，则前面补零
      let minute = date.getMinutes() // 分
      minute = minute < 10 ? '0' + minute : minute // 如果只有一位，则前面补零
      let second = date.getSeconds() // 秒
      second = second < 10 ? '0' + second : second // 如果只有一位，则前面补零
      this.nowDate = `${year}-${month}-${day} ${hour}:${minute}:${second} ${weekArr[week]}`
    },
    handleScroll() {
      if (this.autoHideHeader) {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        if (scrollTop > 100) {
          this.headerBarFixed = true
        } else {
          this.headerBarFixed = false
        }
      } else {
        this.headerBarFixed = false
      }
    },
    toggle() {
      this.$emit('toggle')
    },
    //update-begin--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
    buildTopMenuStyle() {
      if (this.mode === 'topmenu') {
        if (this.device === 'mobile') {
          // 手机端需要清空样式，否则显示会错乱
          this.topMenuStyle.topNavHeader = {}
          this.topMenuStyle.topSmenuStyle = {}
          this.topMenuStyle.headerIndexRight = {}
          this.topMenuStyle.headerIndexLeft = {}
        } else {
          let rightWidth = '360px'
          this.topMenuStyle.topNavHeader = { 'min-width': '165px' }
          this.topMenuStyle.topSmenuStyle = { width: 'calc(100% - 165px)' }
          this.topMenuStyle.headerIndexRight = { 'min-width': rightWidth }
          this.topMenuStyle.headerIndexLeft = { width: `calc(100% - ${rightWidth})` }
        }
      }
    },
    //update-begin--author:sunjianlei---date:20190508------for: 顶部导航栏过长时显示更多按钮-----
  },
  mounted() {
    this.currentTime()
  },
  // 销毁定时器
  beforeDestroy() {
    if (this.formatDate) {
      clearInterval(this.formatDate) // 在Vue实例销毁前，清除时间定时器
    }
  },
}
</script>

<style lang="less" scoped>
/* update_begin author:scott date:20190220 for: 缩小首页布局顶部的高度*/

@height: 59px;
@font-size-base: 16px;

.hover-app:hover {
  background: rgba(255, 255, 255, 0.3);
}

.ios-app-img {
  width: 180px;
  height: 180px;
  position: absolute;
  right: 14px;
  top: 52px;
}

.layout {
  .top-nav-header-index {
    .header-index-wide {
      margin-left: 10px;

      .ant-menu.ant-menu-horizontal {
        height: @height;
        line-height: @height;
      }
    }
    .trigger {
      line-height: 64px;
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .header {
    z-index: 2;
    color: white;
    height: @height;
    background-color: @primary-color;
    transition: background 300ms;

    /* dark 样式 */
    &.dark {
      color: #000000;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      background-color: white !important;
    }
  }

  .header,
  .top-nav-header-index {
    &.dark .trigger:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.ant-layout-header {
  height: @height;
  line-height: @height;
  font-size: @font-size-base;
}
.rt {
  border: 1px;
  width: 200px;
  float: right;
}
.hand-upload-class {
  color: rgb(255, 255, 255);
  cursor: pointer;
  border: 1px;
  float: right;
  text-align: center;
  width: 55px;
}

.app-title-text {
  position: absolute;
  left: 85px;
  top: 242px;
  font-size: 15px;
  color: black;
}
/* update_end author:scott date:20190220 for: 缩小首页布局顶部的高度*/

@media screen and (max-width: 499px) {
  .rt {
    display: none;
  }
}
</style>