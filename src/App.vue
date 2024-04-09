<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view />
      <!-- 将上传组件全局注册 -->
      <global-uploader ref="globalUploader"/>
    </div>
  </a-config-provider>
</template>
<script>
import DevicePixelRatio from '@/utils/DevicePixelRatio' //放大缩小适配
import enquireScreen from '@/utils/device'
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import GlobalUploader from '@/components/fragmentfile/GlobalUploader.vue'

export default {
  name: 'app',
  components: {
    GlobalUploader,
  },
  data() {
    return {
      locale: zhCN,
      zoom: '',
      screenWidth: document.documentElement.clientWidth, //屏幕宽度
    }
  },
  created() {
    let that = this
    enquireScreen((deviceType) => {
      // tablet
      if (deviceType === 0) {
        that.$store.commit('TOGGLE_DEVICE', 'mobile')
        that.$store.dispatch('setSidebar', false)
      }
      // mobile
      else if (deviceType === 1) {
        that.$store.commit('TOGGLE_DEVICE', 'mobile')
        that.$store.dispatch('setSidebar', false)
      } else {
        that.$store.commit('TOGGLE_DEVICE', 'desktop')
        that.$store.dispatch('setSidebar', true)
      }
    })
    new DevicePixelRatio().init() //适配放大缩小
  },
}
</script>
<style lang="less">
@import './assets/font/font.css';
@import './common/icon.css'; 
@import './common/publicCssPC.css';
// @import './common/publicScssPC.less';

#app {
  height: 100%;
}

#app > .ant-layout {
  height: 100%;
}

#app > .ant-layout.desktop > .ant-layout {
  height: 100%;
}

#app > .ant-layout.desktop > .ant-layout > .ant-layout-content > .tablayout-content > .main {
  height: 100%;
}

#app > .ant-layout.desktop > .ant-layout > .ant-layout-content > .tablayout-content > .main > .main {
  height: 100%;
}

.table-operator .ant-btn {
  margin: 0 8px 8px 0;
}
</style>
<style lang="less">
.ant-modal-body {
  padding: 15px;
}

.jeecg-form-container-disabled {
  cursor: auto;

  form {
    background: #fafafa;
  }

  .ant-form-item-required::before {
    display: none;
  }

  .ant-form-item {
    margin-bottom: 12px;
    // border-bottom: 1px solid #e8e8e8;
  }

  .ant-input,
  .ant-input-number {
    border: none;
    background: #fafafa;
  }

  .ant-input[disabled],
  .ant-input-number[disabled] {
    cursor: auto;
    background: none;
    color: rgba(0, 0, 0, 0.65);
    border: none;
  }

  .ant-calendar-picker {
    i {
      display: none;
    }
  }

  .ant-select {
    pointer-events: auto;
    cursor: auto;

    .ant-select-selection {
      background: none;
      color: rgba(0, 0, 0, 0.65);
      border: none;
      user-select: text;
      cursor: auto;

      .ant-select-arrow {
        display: none;
      }
    }
  }
}

.ant-spin-container {
  .input-table .tbody .tr:last-child {
    border-bottom: none;
  }

  .action-disabled {
    display: none;
  }

  .input-table .tbody .td input:disabled {
    background: none !important;
    color: rgba(0, 0, 0, 0.65) !important;
    border: none;
  }

  .input-table .tbody .td input:disabled + i {
    display: none;
  }
}

/**子表样式修改 */
.subTablePane {
  .subTableTitle {
    font-size: 18px;
    display: block;
    margin: 20px 0px 5px 0px;
    height: 30px;
  }

  .subTableTitle::before {
    content: '';
    margin-right: 20px;
    width: 4px;
    height: 15px;
    background-color: #4363ff;
    display: inline-block;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .ant-spin-container {
    & > .ant-row-flex {
      height: 35px;
    }
  }

  .subTableTitle + .ant-spin-nested-loading {
    .ant-row-flex {
      height: 35px;
      width: 100%;
      position: absolute;
      top: -35px;
    }
  }

  &.disabledPane {
    margin: 10px 0px;
    border-radius: 5px;
    background: #fafafa;

    .ant-row-flex {
      display: none;
    }

    .subTableTitle {
      margin-top: 10px;
      margin-bottom: 10px;
      color: #2d8cf0;
    }

    .input-table {
      & > div.thead {
        background: #dcebfe;
        overflow-y: auto;
      }

      & > .scroll-view {
        overflow-y: auto;
      }
    }

    .ant-input {
      background: none;
    }

    .ant-select-selection {
      border: none;
      background: none;
      color: rgba(0, 0, 0, 0.65);
      cursor: auto;

      i {
        display: none;
      }
    }

    .components-input-demo-presuffix {
      .ant-input-affix-wrapper {
        .ant-input-suffix {
          display: none;
        }
      }
    }
  }
}
</style>