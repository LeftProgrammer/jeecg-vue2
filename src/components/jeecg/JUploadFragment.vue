<template>
  <a-spin tip="Loading..." :spinning="spinning">
    <div :id="containerId" class="jupload-container" :class="disabled ? 'disabled' : ''">
      <!--  ---------------------------- begin 图片左右换位置 ------------------------------------- -->
      <div
        class="movety-container"
        :style="{ top: top + 'px', left: left + 'px', display: moveDisplay }"
        style="padding: 0 8px; position: absolute; z-index: 91; height: 32px; width: 104px; text-align: center"
      >
        <div
          :id="containerId + '-mover'"
          :class="showMoverTask ? 'uploadty-mover-mask' : 'movety-opt'"
          style="margin-top: 12px"
        >
          <a @click="moveLast" style="margin: 0 5px">
            <a-icon type="arrow-left" style="color: #fff; font-size: 16px" />
          </a>
          <a @click="moveNext" style="margin: 0 5px">
            <a-icon type="arrow-right" style="color: #fff; font-size: 16px" />
          </a>
        </div>
      </div>
      <!--  ---------------------------- end 图片左右换位置 ------------------------------------- -->
      <a-button @click="uploadFile()" icon="upload"> 点击上传</a-button>

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
      </uploader>
      <div v-if="fileList && fileList.length > 0" class="ant-upload-list ant-upload-list-text jinghe-ant-upload-list">
        <div
          class="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-text"
          v-for="(file, i) in fileList"
          :key="file.uid"
        >
          <div class="ant-upload-list-item-info">
            <a-icon type="paper-clip" />
            <a
              target="_blank"
              rel="noopener noreferrer"
              :title="'下载： ' + file.name"
              :href="file.url"
              class="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1"
              >{{ getFilename(file.name) }}</a
            >
            <!-- <a-icon type="eye" @click="previewFile(file, i)" title="预览文件" /> -->
            <!-- <a-button type="primary" @click="previewFile(file, i)" size="small" class="previewbtn"> 预览 </a-button> -->
            <a
              target="_blank"
              rel="noopener noreferrer"
              :title="'预览： ' + file.name"
              :href="file.prevurl"
              class="previewbtn"
              >预览</a
            >
            <a-popconfirm title="确定删除文件吗?" @confirm="() => deleteFile(file, i)">
              <!-- <a-icon type="delete" title="删除文件" /> -->
              <a-button type="danger" size="small" class="deletebtn"> 删除 </a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
      <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
        <img alt="example" style="width: 100%" :src="previewImage" />
      </a-modal>
    </div>
  </a-spin>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getFileAccessHttpUrl, getFilePreviewUrl } from '@/api/manage'
import SparkMD5 from 'spark-md5'
import store from '@/store'
import { baseApi, techInnovateApi } from '@/utils/base-url'
import { mergeSimpleUpload } from '@/api/baseapi'
import { ACCEPT_CONFIG } from '@/components/fragmentfile/js/config'
import Bus from '@/components/fragmentfile/js/bus'

const FILE_TYPE_ALL = 'all'
const FILE_TYPE_IMG = 'image'
const FILE_TYPE_TXT = 'file'
const uidGenerator = () => {
  return '-' + parseInt(Math.random() * 10000 + 1, 10)
}
const getFileName = (path) => {
  if (path.lastIndexOf('\\') >= 0) {
    let reg = new RegExp('\\\\', 'g')
    path = path.replace(reg, '/')
  }
  return path.substring(path.lastIndexOf('/') + 1)
}
export default {
  name: 'JUpload',
  data() {
    return {
      spinning: false,
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      headers: {},
      fileList: [],
      newFileList: [],
      uploadGoOn: true,
      previewVisible: false,
      //---------------------------- begin 图片左右换位置 -------------------------------------
      previewImage: '',
      containerId: '',
      top: '',
      left: '',
      moveDisplay: 'none',
      showMoverTask: false,
      moverHold: false,
      currentImg: '',
      //---------------------------- end 图片左右换位置 -------------------------------------
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
    }
  },
  props: {
    text: {
      type: String,
      required: false,
      default: '点击上传',
    },
    fileType: {
      type: String,
      required: false,
      default: FILE_TYPE_ALL,
    },
    /*这个属性用于控制文件上传的业务路径*/
    bizPath: {
      type: String,
      required: false,
      default: 'temp',
    },
    value: {
      type: [String, Array],
      required: false,
    },
    // update-begin- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    // update-end- --- author:wangshuai ------ date:20190929 ---- for:Jupload组件增加是否能够点击
    //此属性被废弃了
    triggerChange: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * update -- author:lvdandan -- date:20190219 -- for:Jupload组件增加是否返回url，
     * true：仅返回url
     * false：返回fileName filePath fileSize
     */
    returnUrl: {
      type: Boolean,
      required: false,
      default: true,
    },
    number: {
      type: Number,
      required: false,
      default: 0,
    },
    buttonVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        console.log('this.value===>', this.value)
        let val = this.value
        if (val instanceof Array) {
          if (this.returnUrl) {
            this.initFileList(val.join(','))
          } else {
            this.initFileListArr(val)
          }
        } else {
          this.initFileList(val)
        }
      },
    },
  },
  computed: {
    isImageComp() {
      return this.fileType === FILE_TYPE_IMG
    },
    complistType() {
      return this.fileType === FILE_TYPE_IMG ? 'picture-card' : 'text'
    },
    // Uploader实例
    uploader() {
      return this.$refs.uploader.uploader
    },
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    //---------------------------- begin 图片左右换位置 -------------------------------------
    this.headers = {
      'X-Access-Token': token,
    }
    this.containerId = 'container-ty-' + new Date().getTime()
    //---------------------------- end 图片左右换位置 -------------------------------------
  },

  methods: {
    uploadFile() {
      var params = {}
      this.customParams = params

      var options = {}
      this.customizeOptions(options)

      if (this.$refs.uploadBtn) {
        this.$refs.uploadBtn.$el.click()
      }
    },

    onFileAdded(file) {
      console.log('onFileAdded')
      this.emit('fileAdded', file)

      // 将额外的参数赋值到每个文件上，以不同文件使用不同params的需求
      file.params = this.customParams

      // 计算MD5
      this.computeMD5(file).then((result) => this.startUpload(result))
    },

    onFileSuccess(rootFile, file, response, chunk) {
      let res = JSON.parse(response)

      // 服务端自定义的错误（即http状态码为200，但是是错误的情况），这种错误是Uploader无法拦截的
      if (!res.result) {
        this.error(res.message)
        // 文件状态设为“失败”
        this.statusSet(file, 'failed')
        return
      }

      // 如果服务端返回了需要合并的参数
      if (res.needMerge) {
        // 文件状态设为“合并中”
        this.statusSet(file, 'merging')

        this.mergeFn({
          tempName: res.tempName,
          fileName: file.name,
          ...file.params,
        })
          .then((res) => {
            console.log('onFileSuccess:文件合并成功')
            // 文件合并成功
            this.emit('fileSuccess', { file: file, result: res.result })

            var fileRes = res.result
            let name = fileRes.fileName + '.' + fileRes.fileType
            let url = getFileAccessHttpUrl(fileRes.filePath, name)
            var fileobj = {
              uid: uidGenerator(),
              path: fileRes.filePath,
              name: name,
              md5: fileRes.fileMd5,
              status: 'done',
              url: url,
              response: {
                status: 'history',
                message: fileRes.filePath,
              },
            }
            this.fileList.push(fileobj)
            // var value = this.fileList.map((x) => x.path || x.url).join(',')
            this.handlePathChange()

            this.statusRemove(file)
          })
          .catch((e) => {})
      } else {
        // 不需要合并
        console.log('onFileSuccess:不需要合并')
        this.emit('fileSuccess', { file: file, result: res.result })

        var fileRes = res.result
        let name = fileRes.fileName + '.' + fileRes.fileType
        let url = getFileAccessHttpUrl(fileRes.filePath, name)
        var fileobj = {
          uid: uidGenerator(),
          path: fileRes.filePath,
          name: name,
          md5: fileRes.fileMd5,
          status: 'done',
          url: url,
          response: {
            status: 'history',
            message: fileRes.filePath,
          },
        }
        this.fileList.push(fileobj)
        this.handlePathChange()
      }
    },

    onFileProgress(rootFile, file, chunk) {
      console.log(`上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${chunk.endByte / 1024 / 1024}`)
    },

    onFileError(rootFile, file, response, chunk) {
      this.error(response)
    },

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

    /**
     * 计算md5值，以实现断点续传及秒传
     * @param file
     * @returns Promise
     */
    computeMD5(file) {
      let fileReader = new FileReader()
      let time = new Date().getTime()
      let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      let currentChunk = 0
      const chunkSize = 10 * 1024 * 1000
      let chunks = Math.ceil(file.size / chunkSize)
      let spark = new SparkMD5.ArrayBuffer()

      // 文件状态设为"计算MD5"
      this.statusSet(file, 'md5')
      file.pause()

      // 计算MD5时隐藏”开始“按钮
      this.$nextTick(() => {
        var resumeTag = document.querySelector(`.file-${file.id} .uploader-file-resume`)
        if (resumeTag) resumeTag.style.display = 'none'
      })

      loadNext()

      return new Promise((resolve, reject) => {
        fileReader.onload = (e) => {
          spark.append(e.target.result)

          if (currentChunk < chunks) {
            currentChunk++
            loadNext()

            // 实时展示MD5的计算进度
            this.$nextTick(() => {
              const md5ProgressText = '校验MD5 ' + ((currentChunk / chunks) * 100).toFixed(0) + '%'
              var progressTag = document.querySelector(`.custom-status-${file.id}`)
              if (progressTag) progressTag.innerText = md5ProgressText
            })
          } else {
            let md5 = spark.end()

            // md5计算完毕
            resolve({ md5, file })

            console.log(
              `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size} 用时：${
                new Date().getTime() - time
              } ms`
            )
          }
        }

        fileReader.onerror = function () {
          this.error(`文件${file.name}读取出错，请检查该文件`)
          file.cancel()
          reject()
        }
      })

      function loadNext() {
        let start = currentChunk * chunkSize
        let end = start + chunkSize >= file.size ? file.size : start + chunkSize

        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end))
      }
    },

    // md5计算完毕，开始上传
    startUpload({ md5, file }) {
      file.uniqueIdentifier = md5
      file.resume()
      this.statusRemove(file)
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
    statusSet(file, status) {
      // 文件合并成功
      this.emit('fileUploading', { file: file, status: status })
    },

    statusRemove(file) {
      var id = file.id
      this.emit('fileUploading', { file: file, status: null })
    },

    /**
     * 调用父容器方法
     */
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
    //获取文件名称
    getFilename(url) {
      if (url) {
        let name = url.substr(url.lastIndexOf('/') + 1)
        let len = name.length
        let lineIndex = name.lastIndexOf('_')
        let pointIndex = name.lastIndexOf('.')
        //判断是否带时间戳：带时间戳就差值为13，且全部为数字
        if (pointIndex - lineIndex == 13 && lineIndex > 0) {
          let isNum = !Number.isNaN(Number(name.substring(name.lastIndexOf('_') + 1, name.lastIndexOf('.'))))
          if (isNum) name = name.substr(0, lineIndex) + name.substr(pointIndex, len - pointIndex)
        } else {
        }
        return name
      } else {
        return ''
      }
    },
    //删除文件
    deleteFile(file, i) {
      this.fileList.splice(i, 1)
      this.handlePathChange()
    },
    //预览文件
    previewFile(file, i) {
      var url = file.prevurl
      console.log(url)
      if (
        url &&
        typeof url === 'string' &&
        (url.toLowerCase().startsWith('http') || url.toLowerCase().startsWith('https'))
      )
        window.open(url, '_blank')
    },
    initFileListArr(val) {
      if (!val || val.length == 0) {
        this.fileList = []
        return
      }
      let fileList = []
      for (var a = 0; a < val.length; a++) {
        let url = getFileAccessHttpUrl(val[a].filePath, val[a].fileName)
        fileList.push({
          uid: uidGenerator(),
          name: val[a].fileName,
          status: 'done',
          url: url,
          response: {
            status: 'history',
            message: val[a].filePath,
          },
        })
      }
      this.fileList = fileList
    },
    async initFileList(paths) {
      if (!paths || paths.length == 0) {
        //return [];
        // update-begin- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
        this.fileList = []
        return
        // update-end- --- author:os_chengtgen ------ date:20190729 ---- for:issues:326,Jupload组件初始化bug
      }
      let fileList = []
      let arr = paths.split(',')
      for (var a = 0; a < arr.length; a++) {
        let pathitem = arr[a]
        if (pathitem.indexOf('|') != -1) {
          let patharr = pathitem.split('|')
          if (patharr.length == 3) {
            let url = getFileAccessHttpUrl(patharr[0], patharr[1])
            let prevurl = await getFilePreviewUrl(patharr[0])
            fileList.push({
              uid: uidGenerator(),
              name: patharr[1],
              path: patharr[0],
              md5: patharr[2],
              status: 'done',
              url: url,
              prevurl: prevurl,
              response: {
                status: 'history',
                message: arr[a],
              },
            })
          }
        } else {
          let url = getFileAccessHttpUrl(arr[a], getFileName(arr[a]))
          // console.log(url)
          let prevurl = await getFilePreviewUrl(arr[a])
          fileList.push({
            uid: uidGenerator(),
            name: getFileName(arr[a]),
            status: 'done',
            url: url,
            prevurl: prevurl,
            response: {
              status: 'history',
              message: arr[a],
            },
          })
        }
      }
      this.fileList = fileList
    },
    handlePathChange() {
      let uploadFiles = this.fileList
      let path = ''
      if (!uploadFiles || uploadFiles.length == 0) {
        path = ''
      }
      let arr = []

      for (var a = 0; a < uploadFiles.length; a++) {
        let uploadFile = uploadFiles[a]
        // update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
        if (uploadFile.status === 'done') {
          arr.push(uploadFile.path + '|' + uploadFile.name + '|' + uploadFile.md5)
        } else {
          return
        }
        // update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
      }
      if (arr.length > 0) {
        path = arr.join(',')
      }
      this.$emit('change', path)
    },
    beforeUpload(file) {
      this.uploadGoOn = true
      var fileType = file.type
      if (this.fileType === FILE_TYPE_IMG) {
        if (fileType.indexOf('image') < 0) {
          this.$message.warning('请上传图片')
          this.uploadGoOn = false
          return false
        }
      }
      //TODO 扩展功能验证文件大小
      return true
    },
    handleChange(info) {
      console.log('--文件列表改变--')
      this.spinning = true
      if (!info.file.status && this.uploadGoOn === false) {
        info.fileList.pop()
      }
      let fileList = info.fileList
      if (info.file.status === 'done') {
        if (this.number > 0) {
          fileList = fileList.slice(-this.number)
        }
        if (info.file.response.success) {
          fileList = fileList.map((file) => {
            if (file.response) {
              let reUrl = file.response.message
              file.url = getFileAccessHttpUrl(reUrl)
            }
            return file
          })
        } else {
          if (fileList.length > 0) this.fileList.pop(fileList.length)
          this.$message.error(`${info.file.name} 上传失败：${info.file.response.message}`)
          return
        }
        //this.$message.success(`${info.file.name} 上传成功!`);
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} 上传失败.`)
      } else if (info.file.status === 'removed') {
        this.handleDelete(info.file)
      }
      this.fileList = fileList
      console.log('---------', info.file.status)
      // this.fileList = this.fileList.concat(fileList)
      if (info.file.status === 'done' || info.file.status === 'removed') {
        this.spinning = false
        this.$message.info('上传成功')
        //returnUrl为true时仅返回文件路径
        if (this.returnUrl) {
          this.handlePathChange()
        } else {
          //returnUrl为false时返回文件名称、文件路径及文件大小
          this.newFileList = []
          for (var a = 0; a < fileList.length; a++) {
            // update-begin-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
            if (fileList[a].status === 'done') {
              var fileJson = {
                fileName: fileList[a].name,
                filePath: fileList[a].response.message,
                fileSize: fileList[a].size,
              }
              this.newFileList.push(fileJson)
            } else {
              return
            }
            // update-end-author:lvdandan date:20200603 for:【TESTA-514】【开源issue】多个文件同时上传时，控制台报错
          }
          this.$emit('change', this.newFileList)
        }
      }
    },
    handleDelete(file) {
      //如有需要新增 删除逻辑
      console.log(file)
    },
    handlePreview(file) {
      if (this.fileType === FILE_TYPE_IMG) {
        this.previewImage = file.url || file.thumbUrl
        this.previewVisible = true
      } else {
        location.href = file.url
      }
    },
    handleCancel() {
      this.previewVisible = false
    },
    //---------------------------- begin 图片左右换位置 -------------------------------------
    moveLast() {
      //console.log(ev)
      //console.log(this.fileList)
      //console.log(this.currentImg)
      let index = this.getIndexByUrl()
      if (index == 0) {
        this.$message.warn('未知的操作')
      } else {
        let curr = this.fileList[index].url
        let last = this.fileList[index - 1].url
        let arr = []
        for (let i = 0; i < this.fileList.length; i++) {
          if (i == index - 1) {
            arr.push(curr)
          } else if (i == index) {
            arr.push(last)
          } else {
            arr.push(this.fileList[i].url)
          }
        }
        this.currentImg = last
        this.$emit('change', arr.join(','))
      }
    },
    moveNext() {
      let index = this.getIndexByUrl()
      if (index == this.fileList.length - 1) {
        this.$message.warn('已到最后~')
      } else {
        let curr = this.fileList[index].url
        let next = this.fileList[index + 1].url
        let arr = []
        for (let i = 0; i < this.fileList.length; i++) {
          if (i == index + 1) {
            arr.push(curr)
          } else if (i == index) {
            arr.push(next)
          } else {
            arr.push(this.fileList[i].url)
          }
        }
        this.currentImg = next
        this.$emit('change', arr.join(','))
      }
    },
    getIndexByUrl() {
      for (let i = 0; i < this.fileList.length; i++) {
        if (this.fileList[i].url === this.currentImg || encodeURI(this.fileList[i].url) === this.currentImg) {
          return i
        }
      }
      return -1
    },
  },
  mounted() {
    const moverObj = document.getElementById(this.containerId + '-mover')
    if (moverObj) {
      moverObj.addEventListener('mouseover', () => {
        this.moverHold = true
        this.moveDisplay = 'block'
      })
      moverObj.addEventListener('mouseout', () => {
        this.moverHold = false
        this.moveDisplay = 'none'
      })
    }

    let picList = document.getElementById(this.containerId)
      ? document.getElementById(this.containerId).getElementsByClassName('ant-upload-list-picture-card')
      : []
    if (picList && picList.length > 0) {
      picList[0].addEventListener('mouseover', (ev) => {
        ev = ev || window.event
        let target = ev.target || ev.srcElement
        if ('ant-upload-list-item-info' == target.className) {
          this.showMoverTask = false
          let item = target.parentElement
          this.left = item.offsetLeft
          this.top = item.offsetTop + item.offsetHeight - 50
          this.moveDisplay = 'block'
          this.currentImg = target.getElementsByTagName('img')[0].src
        }
      })

      picList[0].addEventListener('mouseout', (ev) => {
        ev = ev || window.event
        let target = ev.target || ev.srcElement
        //console.log('移除',target)
        if ('ant-upload-list-item-info' == target.className) {
          this.showMoverTask = true
          setTimeout(() => {
            if (this.moverHold === false) this.moveDisplay = 'none'
          }, 100)
        }
        if (
          'ant-upload-list-item ant-upload-list-item-done' == target.className ||
          'ant-upload-list ant-upload-list-picture-card' == target.className
        ) {
          this.moveDisplay = 'none'
        }
      })
      //---------------------------- end 图片左右换位置 -------------------------------------
    }
  },
  model: {
    prop: 'value',
    event: 'change',
  },
}
</script>

<style lang="less">
.jupload-container {
  position: relative;
}

.uploadty-disabled {
  .ant-upload-list-item {
    .anticon-close {
      display: none;
    }

    .anticon-delete {
      display: none;
    }

    .deletebtn {
      display: none;
    }
  }
}

//---------------------------- begin 图片左右换位置 -------------------------------------
.uploadty-mover-mask {
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0.8;
  color: #fff;
  height: 28px;
  line-height: 28px;
}

//---------------------------- end 图片左右换位置 -------------------------------------
.uploadty_box {
  & > .ant-upload-list {
    display: none;

    &.jinghe-ant-upload-list {
      display: block;
    }
  }
}

.ant-upload-list {
  display: none;

  &.jinghe-ant-upload-list {
    display: block;
  }
}

.jinghe-ant-upload-list {
  .ant-upload-list-item-info {
    display: flex;

    .anticon {
      margin: auto 5px;
    }

    .deletebtn {
      margin: auto 5px;
      height: 20px;
      font-size: 10px;
      background-color: #ff4d4f;
      border-color: #ff4d4f;
      color: #fff;
    }

    .previewbtn {
      margin: auto 5px;
      height: 20px;
      font-size: 10px;
      background: #40a9ff;
      color: #fff;
      border-color: #1890ff;
      // text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
      // box-shadow: 0 2px 0 rgb(0 0 0 / 5%);
      padding: 0 7px;
      border-radius: 4px;
      line-height: 1.499;
      position: relative;
      display: inline-block;
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      -webkit-appearance: button;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      border: 1px solid transparent;
    }
  }
}
</style>