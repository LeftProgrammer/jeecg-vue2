<template>
  <div class="logo">
    <router-link :to="{ name: 'dashboard' }">
      <!--      <img v-if="navTheme === 'dark'" src="~@/assets/logo-white.png" alt="logo">
      <img v-else src="~@/assets/logo.svg" alt="logo">-->
      <!-- update_end  author:chenh date:2021-05-24 for: 暂无鲸禾logo素材，注释掉 -->

      <img v-if="!collapsed" :src="publicPath + 'img/logo.png'" />
      <img v-else :src="publicPath + 'img/logoMin.png'" />
    </router-link>
  </div>
</template>

<script>
import { mixin } from '@/utils/mixin.js'

export default {
  name: 'Logo',
  mixins: [mixin],
  data() {
    return {
      //public文件夹路径
      publicPath: '',
    }
  },
  props: {
    title: {
      type: String,

      default: '',
      required: false,
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false,
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    this.publicPath = window.location.origin + process.env.BASE_URL
  },
}
</script>
<style lang="less" scoped>
/*缩小首页布 局顶部的高度*/
@height: 59px;
@color: rgba(255, 255, 255, 1);
@hover-color: rgba(255, 255, 255, 0.8);

.sider {
  box-shadow: none !important;
  .logo {
    height: @height !important;
    line-height: @height !important;
    box-shadow: none !important;
    transition: background 300ms;

    a {
      color: @color;
      display: inline-block;
      // width: 100%;

      &:hover {
        color: @hover-color;
      }

      img {
        width: 100%;
        height: auto;
      }
    }
  }

  &.light .logo {
    background: @primary-color;
  }
}
</style>
