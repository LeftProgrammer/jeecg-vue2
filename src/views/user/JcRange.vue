<template>
  <div class="jc-component__range">
    <div class="jc-range" :class="rangeStatus ? 'success' : ''">
      <i @mousedown="rangeMove" :class="rangeStatus ? successIcon : startIcon" v-if="isPC"></i>
      <i
        v-else
        @touchstart="rangeMoveIpad"
        style="touch-action: none"
        :class="rangeStatus ? 'iconfont ' + successIcon : 'iconfont ' + startIcon"
      ></i>

      {{ rangeStatus ? successText : startText }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    // 成功之后的函数
    successFun: {
      type: Function,
    },
    //成功图标
    successIcon: {
      type: String,
      default: 'el-icon-success',
    },
    //成功文字
    successText: {
      type: String,
      default: '验证成功',
    },
    //开始的图标
    startIcon: {
      type: String,
      default: 'el-icon-d-arrow-right',
    },
    //开始的文字
    startText: {
      type: String,
      default: '拖动滑块到最右边',
    },
    //失败之后的函数
    errorFun: {
      type: Function,
    },
    //或者用值来进行监听
    status: {
      type: String,
    },
    userPhone: {
      type: String,
    },
  },
  name: 'Silder',
  data() {
    return {
      disX: 0,
      rangeStatus: '',
      isPC: false,
    }
  },
  methods: {
    rangeMove(e) {
      let ele = e.target
      let startX = e.clientX
      let eleWidth = ele.offsetWidth
      let parentWidth = ele.parentElement.offsetWidth
      let MaxX = parentWidth - eleWidth - 9
      if (this.rangeStatus) {
        //不运行
        return false
      }
      document.onmousemove = (e) => {
        let endX = e.clientX
        this.disX = endX - startX
        if (this.disX <= 0) {
          this.disX = 0
        }
        if (this.disX >= MaxX - eleWidth) {
          //减去滑块的宽度,体验效果更好
          this.disX = MaxX
        }
        //减去边框值
        // this.disX = this.disX

        ele.style.transition = '.1s all'
        ele.style.transform = 'translateX(' + this.disX + 'px)'
        e.preventDefault()
      }
      document.onmouseup = () => {
        if (this.disX !== MaxX) {
          ele.style.transition = '.5s all'
          ele.style.transform = 'translateX(0)'
          //执行成功的函数
          this.errorFun && this.errorFun()
        } else {
          this.$emit('checkCode', true)
          this.rangeStatus = true
          if (this.status) {
            this.$parent[this.status] = true
          }
          //执行成功的函数
          this.successFun && this.successFun()
        }
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    //是Tablet 或 pc
    os() {
      let ua = navigator.userAgent,
        isWindowsPhone = /(?:Windows Phone)/.test(ua),
        isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
        isAndroid = /(?:Android)/.test(ua),
        isFireFox = /(?:Firefox)/.test(ua),
        // isChrome = /(?:Chrome|CriOS)/.test(ua),
        isTablet =
          /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
        isPhone = /(?:iPhone)/.test(ua) && !isTablet,
        isPc = !isPhone && !isAndroid && !isSymbian
      if (isTablet) {
        return 'Tablet'
      } else if (isPc) {
        return 'pc'
      }
    },
    //滑块移动
    rangeMoveIpad(e) {
      let ele = e.target
      let startX = e.changedTouches[0].clientX
      let eleWidth = ele.offsetWidth
      let parentWidth = ele.parentElement.offsetWidth
      let MaxX = parentWidth - eleWidth - 9
      if (this.rangeStatus) {
        //不运行
        return false
      }
      document.ontouchmove = (e) => {
        let endX = e.changedTouches[0].clientX
        this.disX = endX - startX
        if (this.disX <= 0) {
          this.disX = 0
        }
        console.log(this.disX)
        if (this.disX >= MaxX - eleWidth) {
          //减去滑块的宽度,体验效果更好
          this.disX = MaxX
        }
        ele.style.transition = '.1s all'
        ele.style.transform = 'translateX(' + this.disX + 'px)'
        e.preventDefault()
      }
      document.ontouchend = () => {
        if (this.disX !== MaxX) {
          ele.style.transition = '.1s all'
          ele.style.transform = 'translateX(0)'
          //执行失败的函数
          this.errorFun && this.errorFun()
        } else {
          // if (this.userPhone) {
          this.$emit('checkCode', true)
          this.rangeStatus = true
          if (this.status) {
            this.$parent[this.status] = true
          }
          //执行成功的函数
          this.successFun && this.successFun()
          // } else {
          //   ele.style.transition = '.1s all'
          //   ele.style.transform = 'translateX(0)'
          //   //执行失败的函数
          //   this.errorFun && this.errorFun()
          // }
        }
        document.ontouchmove = null
        document.ontouchend = null
      }
    },
  },
  created() {
    if (this.os() == 'Tablet') {
      this.isPC = false
    } else if (this.os() == 'pc') {
      this.isPC = true
    }
  },
}
</script>
<style scoped>
.jc-range {
  background-color: #fff;
  position: relative;
  transition: 1s all;
  user-select: none;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px; /*no*/
  border: 1px solid #b4bec5;
}
.jc-range i {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100px;
  height: calc(100% - 6px);
  color: #919191;
  background-color: #7ac23c;
  border: 1px solid #bbb;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 3px;
  border-radius: 2px;
  background-image: url('../../assets/login/slider.jpg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.jc-range.success {
  background-color: #7ac23c;
  color: #fff;
}
.jc-range.success i {
  color: #7ac23c;
}

.jc-range.success i.el-icon-success {
  display: none;
}
</style>