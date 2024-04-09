<template>
  <div id="global-uploader" :class="{ 'global-uploader-single': !global }">
    <!-- 上传 -->
    <uploader
      ref="uploader"
      :options="initOptions"
      :fileStatusText="fileStatusText"
      :autoStart="false"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
      @file-progress="onFileProgress"
      @file-error="onFileError"
      class="uploader-app"
    >
      <uploader-unsupport></uploader-unsupport>

      <uploader-btn id="global-uploader-btn" ref="uploadBtn">选择文件</uploader-btn>
      <uploader-list v-show="panelShow">
        <div class="file-panel" :class="{ collapse: collapse }">
          <div class="file-title">
            <div class="title">文件列表</div>
            <div class="operate">
              <a-icon :type="collapse ? 'fullscreen' : 'line'" @click="collapse = !collapse" />
              <a-icon type="close" @click="close" />
            </div>
          </div>
          <ul class="file-list" :class="collapse ? 'uploader-list-ul-show' : 'uploader-list-ul-hidden'">
            <li v-for="file in uploadFileList" :key="file.id">
              <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true"></uploader-file>
            </li>
            <div class="no-file" v-if="!uploadFileList.length"><i class="icon icon-empty-file"></i> 暂无待上传文件</div>
          </ul>
        </div>
      </uploader-list>
    </uploader>
  </div>
</template>
<script>
/**
 *  全局上传插件，两种调用方式
 *   1. 作为全局页面的组件，使用event bus
 *   调用方法：Bus.$emit('openUploader', {params: {}, options: {}})
 *               params: 发送给服务器的额外参数；
 *               options：上传选项，目前支持 target、testChunks、mergeFn、accept
 *
 *   监听函数：Bus.$on('fileAdded', fn); 文件选择后的回调
 *           Bus.$on('fileSuccess', fn); 文件上传成功的回调，监听后记得释放
 *
 *   2. 作为普通组件在单个页面中调用，使用props
 */
import { ACCEPT_CONFIG } from '@/components/fragmentfile/js/config'
import Bus from '@/components/fragmentfile/js/bus'
// import SparkMD5 from 'spark-md5'
// import { mergeSimpleUpload } from '@/api/baseapi'
// import { ACCESS_TOKEN, INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
// import store from '@/store'
import { baseApi, techInnovateApi } from '@/utils/base-url'

export default {
  props: {
    global: {
      type: Boolean,
      default: true,
    },
    // 发送给服务器的额外参数
    params: {
      type: Object,
    },
    options: {
      type: Object,
    },
  },

  data() {
    return {
      tokenKey: 'X-Access-Token',
      initOptions: {
        //添加token
        headers: {},
        accept: '*',
        target: baseApi + `/sys/common/uploadfile`, // 上传文件-目标 URL
        chunkSize: 1024 * 1024, //  每个分片的大小
        fileParameterName: 'file', //  上传文件时文件的参数名，默认 file
        maxChunkRetries: 3, //  并发上传数，默认 3
        testChunks: true, //  是否开启分片已存在于服务器的校验
        // 服务器分片校验函数，秒传及断点续传基础
        checkChunkUploadedByResponse: function (chunk, message) {
          let skip = false
          try {
            let objMessage = JSON.parse(message)
            if (objMessage.skipUpload) {
              skip = true
            } else {
              skip = (objMessage.uploaded || []).indexOf(chunk.offset + 1) >= 0
            }
          } catch (e) {}

          return skip
        },
        query: (file, chunk) => {
          return {
            ...file.params,
          }
        },
      },
      fileStatusText: {
        success: '上传成功',
        error: '上传失败',
        uploading: '上传中',
        paused: '已暂停',
        waiting: '等待上传',
      },
      panelShow: false, //选择文件后，展示上传panel
      collapse: false,
      customParams: {},
      uploadFileList: [],
    }
  },

  watch: {
    params: {
      handler(data) {
        if (data) {
          this.customParams = data
        }
      },
      immediate: true,
    },
    options: {
      handler(data) {
        if (data) {
          setTimeout(() => {
            this.customizeOptions(data)
          }, 0)
        }
      },
      immediate: true,
    },
  },

  mounted() {
    console.log('GlobalUploader --- mounted')
    //监听打开事件
    Bus.$on('openUploader', ({ params = {}, options = {} }) => {
      this.customParams = params

      this.customizeOptions(options)

      if (this.$refs.uploadBtn) {
        this.$refs.uploadBtn.$el.click()
      }
    })

    // 文件选择后的回调
    Bus.$on('fileAdded', (file) => {
      console.log('文件已选择')

      this.panelShow = true
      this.uploadFileList.push(file)
    })

    // 文件上传状态的回调
    Bus.$on('fileUploading', ({ file, status }) => {
      console.log('文件上传中')
      if (status) {
        this.statusSet(file.id, status)
      } else {
        this.statusRemove(file.id)
      }
    })

    // 文件上传成功的回调
    Bus.$on('fileSuccess', ({ file, result }) => {
      console.log('文件上传成功')
      this.statusRemove(file.id)
    })
  },

  beforeDestroy() {
    Bus.$off('fileAdded')
    Bus.$off('fileUploading')
    Bus.$off('fileSuccess')
  },

  computed: {
    // Uploader实例
    uploader() {
      return this.$refs.uploader.uploader
    },
  },

  methods: {
    // 自定义options
    customizeOptions(opts) {
      // 自定义上传url
      if (opts.target) {
        this.uploader.opts.target = opts.target
      }

      // 是否可以秒传、断点续传
      if (opts.testChunks !== undefined) {
        this.uploader.opts.testChunks = opts.testChunks
      }

      //添加上传时token
      var token = store.getters.token
      console.log('token', token)
      if (token) {
        this.uploader.opts.headers[this.tokenKey] = token
      }

      // merge 的方法，类型为Function，返回Promise
      this.mergeFn = opts.mergeFn || mergeSimpleUpload

      // 自定义文件上传类型
      let input = document.querySelector('#global-uploader-btn input')
      if (opts.accept && !Array.isArray(opts.accept)) {
        opts.accept = [opts.accept]
      }
      let accept = opts.accept || ACCEPT_CONFIG.getAll()
      input.setAttribute('accept', accept.join())
    },

    onFileAdded(file) {
      this.uploadFileList.push(file)
      // console.log('onFileAdded')
      // this.panelShow = true
      // this.emit('fileAdded', 111)

      // // 将额外的参数赋值到每个文件上，以不同文件使用不同params的需求
      // file.params = this.customParams

      // // 计算MD5
      // this.computeMD5(file).then((result) => this.startUpload(result))
    },

    // /**
    //  * 计算md5值，以实现断点续传及秒传
    //  * @param file
    //  * @returns Promise
    //  */
    // computeMD5(file) {
    //   let fileReader = new FileReader()
    //   let time = new Date().getTime()
    //   let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
    //   let currentChunk = 0
    //   const chunkSize = 10 * 1024 * 1000
    //   let chunks = Math.ceil(file.size / chunkSize)
    //   let spark = new SparkMD5.ArrayBuffer()

    //   // 文件状态设为"计算MD5"
    //   this.statusSet(file.id, 'md5')
    //   file.pause()

    //   // 计算MD5时隐藏”开始“按钮
    //   this.$nextTick(() => {
    //     document.querySelector(`.file-${file.id} .uploader-file-resume`).style.display = 'none'
    //   })

    //   loadNext()

    //   return new Promise((resolve, reject) => {
    //     fileReader.onload = (e) => {
    //       spark.append(e.target.result)

    //       if (currentChunk < chunks) {
    //         currentChunk++
    //         loadNext()

    //         // 实时展示MD5的计算进度
    //         this.$nextTick(() => {
    //           const md5ProgressText = '校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
    //           document.querySelector(`.custom-status-${file.id}`).innerText = md5ProgressText
    //         })
    //       } else {
    //         let md5 = spark.end()

    //         // md5计算完毕
    //         resolve({ md5, file })

    //         console.log(
    //           `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${
    //             new Date().getTime() - time
    //           } ms`
    //         )
    //       }
    //     }

    //     fileReader.onerror = function () {
    //       this.error(`文件${file.name}读取出错，请检查该文件`)
    //       file.cancel()
    //       reject()
    //     }
    //   })

    //   function loadNext() {
    //     let start = currentChunk * chunkSize
    //     let end = start + chunkSize >= file.size ? file.size : start + chunkSize

    //     fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
    //   }
    // },

    // // md5计算完毕，开始上传
    // startUpload({ md5, file }) {
    //   file.uniqueIdentifier = md5
    //   file.resume()
    //   this.statusRemove(file.id)
    // },

    onFileSuccess(rootFile, file, response, chunk) {
      let res = JSON.parse(response)

      // 服务端自定义的错误（即http状态码为200，但是是错误的情况），这种错误是Uploader无法拦截的
      if (!res.result) {
        this.error(res.message)
        // 文件状态设为“失败”
        this.statusSet(file.id, 'failed')
        return
      }

      // 如果服务端返回了需要合并的参数
      if (res.needMerge) {
        // 文件状态设为“合并中”
        this.statusSet(file.id, 'merging')

        this.mergeFn({
          tempName: res.tempName,
          fileName: file.name,
          ...file.params,
        })
          .then((res) => {
            // 文件合并成功
            this.emit('fileSuccess', res.result)

            this.statusRemove(file.id)
          })
          .catch((e) => {})

        // 不需要合并
      } else {
        console.log('result', res.result)
        this.emit('fileSuccess', { params: file.params, result: res.result })
      }
    },

    onFileProgress(rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },

    onFileError(rootFile, file, response, chunk) {
      this.error(response)
    },

    close() {
      this.uploader.cancel()

      this.panelShow = false
    },

    /**
     * 新增的自定义的状态: 'md5'、'merging'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      let statusMap = {
        md5: {
          text: '校验MD5',
          bgc: '#fff',
        },
        merging: {
          text: '合并中',
          bgc: '#e2eeff',
        },
        transcoding: {
          text: '转码中',
          bgc: '#e2eeff',
        },
        failed: {
          text: '上传失败',
          bgc: '#e2eeff',
        },
      }

      this.$nextTick(() => {
        const statusTag = document.createElement('p')
        statusTag.className = `custom-status-${id} custom-status`
        statusTag.innerText = statusMap[status].text
        statusTag.style.backgroundColor = statusMap[status].bgc

        const statusWrap = document.querySelector(`.file_${id} .uploader-file-status`)
        statusWrap.appendChild(statusTag)
      })
    },

    statusRemove(id) {
      this.$nextTick(() => {
        const statusTag = document.querySelector(`.custom-status-${id}`)
        if (statusTag) statusTag.remove()
      })
    },

    emit(e, opt) {
      Bus.$emit(e, opt)
      this.$emit(e, opt)
    },

    error(msg) {
      this.$message.error({
        content: msg,
        duration: 2,
      })
    },
  },
}
</script>

<style lang="less">
#global-uploader {
  &:not(.global-uploader-single) {
    position: fixed;
    z-index: 1001;
    right: 15px;
    bottom: 15px;
    box-sizing: border-box;
  }

  .uploader-app {
    width: 520px;
  }

  .file-panel {
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;

      .operate {
        flex: 1;
        text-align: right;

        i {
          font-size: 18px;
          color: rgb(0, 136, 204);
          margin: 10px;
        }
      }
    }

    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      transition: all 0.3s;
      padding: 0;

      .file-item {
        background-color: #fff;
      }
    }

    &.collapse {
      .file-title {
        background-color: #e7ecf2;
      }
      .file-list {
        height: 0;
      }
    }
  }

  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }

  .uploader-file-icon {
    &:before {
      content: '' !important;
    }

    &[icon='image'] {
      background: url(./images/image-icon.png);
    }
    &[icon='audio'] {
      background: url(./images/audio-icon.png);
      background-size: contain;
    }
    &[icon='video'] {
      background: url(./images/video-icon.png);
    }
    &[icon='document'] {
      background: url(./images/text-icon.png);
    }
    &[icon='unknown'] {
      background: url(./images/zip.png) no-repeat center;
      background-size: contain;
    }
  }

  .uploader-file-actions > span {
    margin-right: 6px;
  }

  .custom-status {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
}

/* 隐藏上传按钮 */
#global-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}

.global-uploader-single {
  #global-uploader-btn {
    position: relative;
  }
}
</style>
