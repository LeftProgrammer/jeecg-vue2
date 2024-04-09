<template>
  <div class="portalheader-container">
    <div class="piece"></div>
    <div class="title">
      {{ title }}
    </div>
    <div :style="{ width: lineWidth }" class="line"></div>
    <div class="more" @click="morehandle" v-if="showmore">更多</div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    showmore: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    lineWidth() {
      var strWidth = 'calc(100% - ' + (5 + this.title.length * 26 + 10 + 30) + 'px)'
      return strWidth
    },
  },
  data() {
    return {}
  },
  methods: {
    morehandle() {
      this.$emit('more')
    },
  },
}
</script>
<style lang="less" scoped>
.portalheader-container {
  display: flex;
  height: 45px;
  line-height: 45px;
  padding: 5px;
  border-bottom: 1px solid #eee;
  margin: 0 10px;

  .piece {
    height: 100%;
    background-color: blue;
    width: 5px;
    height: 20px;
    margin-top: 5px;
    display: none;
  }

  .title {
    text-indent: 0px;
    font-weight: 700;
    font-size: 20px;
    width: auto;
  }

  .line {
    border-bottom: 0px solid #b5b3b3;
    height: 30px;
  }

  .more {
    line-height: 37px;
    cursor: pointer;
    width: 3em;
  }
}
</style>