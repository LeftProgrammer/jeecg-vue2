<template>
  <div style="width: 180px; height: 180px">
    <div id="qrcode"></div>
    <!-- 创建一个div，并设置id为qrcode -->
  </div>
</template>
   
<script>
import QRCode from 'qrcodejs2' // 引入qrcode
export default {
  name: 'test',
  data() {
    return {
      publicPath: '',
    }
  },
  created() {
    this.publicPath = window.location.origin + process.env.BASE_URL
  },
  mounted() {
    this.qrcode()
  },
  methods: {
    qrcode() {
      let url = this.publicPath + '/androidapp.html'
      let qrcode = new QRCode('qrcode', {
        width: 180,
        height: 180,
        text: url, // 二维码地址
      })
    },
  },
}
</script>