<template>
  <div class="online-container">
    <!-- 超限列表 -->
    <iframe id="onlinereport" scrolling="no" frameborder="0"></iframe>
  </div>
</template>


<script>
import { ACCESS_TOKEN } from '@/store/mutation-types'
export default {
  data() {
    return {
      token: null,
    }
  },
  mounted() {
    let token = this.$ls.get(ACCESS_TOKEN)
    this.token = token
    var ps = this.$route.path.split('/')
    var id = ''
    if (ps && ps.length > 0) id = ps[ps.length - 1]

    var url = this.reportUrl + '/' + id + '?token=' + this.token
    console.log(url)
    var iframe = document.getElementById('onlinereport')
    iframe.setAttribute('src', url)
  },
  computed: {
    reportUrl: function () {
      return `${window._CONFIG['domianURL']}/jmreport/view`
    },
  },
  watch: {
    '$route.path'(val) {
      var ps = val.split('/')
      var id = ''
      if (ps && ps.length > 0) id = ps[ps.length - 1]

      var url = this.reportUrl + '/' + id + '?token=' + this.token
      console.log(url)
      var iframe = document.getElementById('onlinereport')
      iframe.setAttribute('src', url)
    },
  },
}
</script>

<style lang="less" scoped>
.online-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
  }
}
</style>