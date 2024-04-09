<template>
  <a-layout-sider
    :class="['sider', isDesktop() ? null : 'shadow', theme, fixSiderbar ? 'ant-fixed-sidemenu' : null]"
    width="208px"
    :collapsible="collapsible"
    v-model="collapsed"
    :trigger="null"
  >
    <logo :collapsed="collapsed"/>
    <s-menu :collapsed="collapsed" :menu="menus" :theme="theme" @select="onSelect" :mode="mode" :style="smenuStyle">
    </s-menu>
  </a-layout-sider>
</template>

<script>
import ALayoutSider from 'ant-design-vue/es/layout/Sider'
import Logo from '../tools/Logo'
import SMenu from './index'
import { mixin, mixinDevice } from '@/utils/mixin.js'

export default {
  name: 'SideMenu',
  components: { ALayoutSider, Logo, SMenu },
  mixins: [mixin, mixinDevice],
  props: {
    mode: {
      type: String,
      required: false,
      default: 'inline',
    },
    theme: {
      type: String,
      required: false,
      default: 'dark',
    },
    collapsible: {
      type: Boolean,
      required: false,
      default: false,
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false,
    },
    menus: {
      type: Array,
      required: true,
    },
  },
  computed: {
    smenuStyle() {
      let style = { paddingTop: '40px' }
      if (this.fixSiderbar) {
        style['height'] = 'calc(100% - 59px)'
        style['overflow'] = 'auto'
        style['overflow-x'] = 'hidden'
      }
      return style
    },
  },
  methods: {
    onSelect(obj) {
      this.$emit('menuSelect', obj)
    },
  },
  mounted() {
    //
  },
}
</script>
<style lang="less" scoped>
/* update_begin author:sunjianlei date:20190509 for: 修改侧边导航栏滚动条的样式 */
.sider {
  @scrollBarSize: 10px;

  ul.ant-menu {
    // height: calc(~'100% - 59px');
    // overflow-y: auto;
    // background-color: #00152a;
    // color: #fff;
    height: calc(100% - 59px);
    overflow-y: auto;

    /* 定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
    &::-webkit-scrollbar {
      width: @scrollBarSize;
      height: @scrollBarSize;
      background-color: transparent;
      display: none;
    }

    & .-o-scrollbar {
      display: none;
    }

    /* 兼容IE */
    -ms-overflow-style: none;
    -ms-scroll-chaining: chained;
    -ms-content-zooming: zoom;
    -ms-scroll-rails: none;
    -ms-content-zoom-limit-min: 100%;
    -ms-content-zoom-limit-max: 500%;
    -ms-scroll-snap-type: proximity;
    -ms-scroll-snap-points-x: snapList(100%, 200%, 300%, 400%, 500%);

    /* 定义滚动条轨道 */
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    /* 定义滑块 */
    &::-webkit-scrollbar-thumb {
      border-radius: @scrollBarSize;
      background-color: #eee;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);

      &:hover {
        background-color: #dddddd;
      }

      &:active {
        background-color: #bbbbbb;
      }
    }

    .ant-menu-sub {
      // background-color: #00152a;
      // color: #fff;
    }
  }

  /** 暗色系滚动条样式 */
  &.dark ul.ant-menu {
    &::-webkit-scrollbar-thumb {
      background-color: #666666;

      &:hover {
        background-color: #808080;
      }

      &:active {
        background-color: #999999;
      }
    }
  }
}

/* update_end author:sunjianlei date:20190509 for: 修改侧边导航栏滚动条的样式 */
</style>

<!-- update_begin author:sunjianlei date:20190530 for: 选中首页的时候不显示背景颜色 -->
<style lang="less">
// @font-size-base: 14px;
@font-size-menu: @font-size-base + 2px;
@font-size-submenu: @font-size-base + 1px;
.ant-menu.ant-menu-root {
  & > .ant-menu-item:first-child {
    background-color: transparent;

    &.ant-menu-item-selected {
      & > a,
      & > a:hover {
        background-color: @primary-color;
        color: #fff;
        border-radius: 5px;
        text-indent: 5px;
      }
    }
  }

  &.ant-menu-dark > .ant-menu-item:first-child {
    & > a,
    & > a:hover {
      color: rgba(255, 255, 255, 0.65);
    }

    &.ant-menu-item-selected {
      & > a,
      & > a:hover {
        color: rgba(255, 255, 255, 1);
      }
    }
  }

  & > .ant-menu-item {
    & > a {
      margin-left: -10px;
      font-size: @font-size-menu;
    }
  }
}

.ant-menu-inline {
  .ant-menu-item {
    font-size: @font-size-menu;

    .anticon {
      width: 16px;
      height: 17px;
      font-size: 15px;
    }
  }
  & > .ant-menu-item {
    & > a {
      font-size: @font-size-submenu;
    }
  }

  .ant-menu-submenu-title {
    font-size: @font-size-submenu;

    & > span {
      color: #31415e;
      font-weight: bold;

      .anticon {
        width: 16px;
        height: 16px;
        font-size: 15px;
      }
    }
  }

  &.ant-menu-submenu-selected {
    .ant-menu-submenu-title {
      & > span {
        color: @primary-color;
      }
    }
  }

  .ant-menu-sub {
    .ant-menu-item {
      font-size: @font-size-submenu;
    }
  }

  & > .ant-menu-submenu {
    & > .ant-menu-submenu-title {
      font-size: @font-size-menu;
    }
  }

  .ant-menu-submenu {
    .ant-menu-submenu-title {
      border-bottom: 0px solid #eee;
      font-size: @font-size-menu;
    }
  }
}

.ant-menu-vertical {
  .ant-menu-item,
  .ant-menu-submenu-title {
    font-size: @font-size-menu;
  }

  & > .ant-menu-submenu {
    & > .ant-menu-submenu-title {
      font-size: @font-size-submenu;
    }
  }
}
.ant-menu-vertical-left {
  .ant-menu-item,
  .ant-menu-submenu-title {
    font-size: @font-size-menu;
  }
  & > .ant-menu-submenu {
    & > .ant-menu-submenu-title {
      font-size: @font-size-submenu;
    }
  }
}
.ant-menu-vertical-right {
  .ant-menu-item,
  .ant-menu-submenu-title {
    font-size: @font-size-menu;
  }
  & > .ant-menu-submenu {
    & > .ant-menu-submenu-title {
      font-size: @font-size-submenu;
    }
  }
}

.sider {
  .ant-menu-item {
    // background-color: #00152a;
    // color: #fff;
    text-indent: 5px;

    &:active {
      // background-color: #00152a;
    }

    & > a {
      display: block;
      // background-color: #00152a;
      // color: #fff;
    }
  }

  .ant-menu-item::after,
  .ant-menu-item-selected::after {
    border-right: 0px;
  }

  .ant-menu-item-selected {
    & > a,
    & > a:hover {
      background-color: @primary-color;
      color: #fff;
      border-radius: 5px;
      text-indent: 5px;
    }
  }

  .ant-menu-inline {
    .ant-menu-item::after {
      border-right: 0px;
    }
  }

  .ant-menu:not(.ant-menu-horizontal) {
    .ant-menu-item-selected {
      // background-color: #00152a;
      // color: #fff;
    }
  }
}
</style>
<!-- update_end author:sunjianlei date:20190530 for: 选中首页的时候不显示背景颜色 -->
