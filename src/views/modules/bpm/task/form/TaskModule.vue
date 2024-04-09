<template>
  <div style="background: #ffffff">
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <!-- 意见 -->
      <a-card size="default" style="margin-top: 20px">
        <a-list itemLayout="vertical">
          <!-- <a-list-item>
            <div style="width: 100%">
              <div style="margin-bottom: 5px; height: 40px; line-height: 40px; font-size: 17px">
                处理意见：
                <a-radio-group name="radioGroup" @change="handleChangeSelect">
                  <a-radio v-for="(item, index) in remarksDictOptions" :key="index" :value="item">{{ item }}</a-radio>
                </a-radio-group>
              </div>
              <a-textarea rows="3" v-model="model.reason" />
            </div>
          </a-list-item> -->
          <!-- 流程任务处理页面添加文件按钮 -->
          <!-- <a-list-item>
          <j-upload text="添加文件" v-model="fileList" :returnUrl='false'></j-upload>
        </a-list-item> -->
          <a-list-item>
            <a-row>
              <a-col :span="24">
                <a-radio-group v-model="model.processModel">
                  <!-- <a-radio :checked="true" :value="1">单分支模式1</a-radio> -->
                  <!-- <a-radio :value="2">多分支模式</a-radio>
                <a-radio :value="3" v-if="resultObj.histListSize>0">驳回</a-radio> -->
                </a-radio-group>
                <span :hidden="this.model.processModel !== 2">
                  <span style="color: red">多分支模式默认执行所有分支：</span>
                  <template v-for="(item, index) in resultObj.transitionList">
                    <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>
                  </template>
                </span>
                <span :hidden="this.model.processModel !== 3" v-if="resultObj.histListSize > 0">
                  <a-select
                    v-model="model.rejectModelNode"
                    :getPopupContainer="(target) => target.parentNode"
                    style="width: 150px"
                  >
                    <template v-for="(item, index) in resultObj.histListNode">
                      <a-select-option v-if="item.NAME_ != resultObj.taskName" :value="item.TASK_DEF_KEY_">{{
                        item.NAME_
                      }}</a-select-option>
                    </template>
                  </a-select>
                </span>
              </a-col>
            </a-row>
          </a-list-item>
          <!-- <a-list-item>
            <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange"
              >指定下一步操作人（指定下一步会签人员）</a-checkbox
            >
            <a-checkbox :checked="checkedCc" @change="handleCheckedCcChange">是否抄送</a-checkbox>
          </a-list-item> -->
          <a-list-item style="line-height: 32px" :hidden="!checkedNext">
            <span>指定下一步操作人（指定下一步会签人员）：</span>
            <a-select style="width: 300px" mode="multiple" placeholder="点击选择用户" :value="hqUserList"> </a-select>
            <a-button type="primary" @click="handleHqUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="hqUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
            <span>（如果不指定则按照系统默认）</span>
          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedCc">
            <span>抄送给：</span>
            <a-select style="width: 300px" mode="multiple" placeholder="点击选择按钮" :value="ccUserList"> </a-select>
            <a-button type="primary" @click="handleCcUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="ccUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
          </a-list-item>
        </a-list>
        <!-- 流转按钮 -->
        <div style="margin-top: 20px; text-align: center">
          <template v-if="model.processModel == 1">
            <template v-for="(item, index) in resultObj.transitionList">
              <a-button type="primary" @click="handleProcessComplete(item.nextnode)">验收</a-button>
            </template>
            <!-- <a-button type="primary" @click="handleProcessComplete(item.nextnode)">同意</a-button> -->
            <!-- <a-button type="primary" @click="callBackProcess()">驳回</a-button> -->
            <a-button type="primary" @click="callBackProcess()">退回</a-button>
          </template>
          <template v-else>
            <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
          </template>
        </div>
        <br />
      </a-card>
      <a-card v-show="false" title="历史环节审批意见" size="default" style="margin-top: 20px">
        <a-table rowKey="id" :loading="loading" :dataSource="hisdataSource" :columns="columns" size="small"> </a-table>
      </a-card>

      <select-user-modal ref="selectHqUserModal" @selectFinished="selectHqUserOK"></select-user-modal>
      <select-user-modal ref="selectCcUserModal" @selectFinished="selectCcUserOK"></select-user-modal>
    </a-spin>
  </div>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getAction, httpAction, putAction, getFileAccessHttpUrl } from '@/api/manage'
import SelectUserModal from './SelectUserModal'
import AListItem from 'ant-design-vue/es/list/Item'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import JEllipsis from '../../../../../components/jeecg/JEllipsis.vue'
import JUpload from '../../../../../components/jeecg/JUpload'

export default {
  components: {
    JUpload,
    JEllipsis,
    AListItem,
    SelectUserModal,
  },
  name: 'TaskModule',
  props: ['formData', 'processInstanceIdes'],
  data() {
    return {
      url: {
        getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
        processComplete: '/act/task/processComplete',
        upload: window._CONFIG['domianURL'] + '/sys/common/upload',
        callBackProcess: '/act/task/callBackProcess',
        list: '/act/task/processHistoryList',
        getNodePositionInfo: '/act/task/getNodePositionInfo',
        callBackProcessQueryTitle: '/sys/flow//callBackProcessQueryTitle',
      },
      headers: {},
      resultObj: {},
      checkedNext: false,
      transition: [],
      hqUserSelectList: [],
      ccUserSelectList: [],
      remarksDictOptions: ['同意', '退回'],
      processInstanceId: '',
      queryParam: {},
      model: {
        taskId: '',
        nextnode: '',
        nextCodeCount: '',
        reason: '',
        processModel: 1,
        rejectModelNode: '',
        nextUserName: '',
        nextUserId: '',
        ccUserIds: '',
        ccUserRealNames: '',
        fileList: '',
      },
      bodyStyle: {
        padding: '10px',
      },
      checkedCc: false,
      fileList: [],
      loading: false,
      dataSource: [],
      hisdataSource: [],
      nodePositionInfo: {},
      columns: [
        {
          title: '#',
          rowKey: (record, index) => index,
          width: 40,
          customRender(t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '名称',
          dataIndex: 'name',
          customRender: function (text) {
            if (text == 'start1') {
              return '开始'
            } else if (text == 'end') {
              return '结束'
            } else {
              return text
            }
          },
        },
        // {
        //   title: '开始时间',
        //   dataIndex: 'startTime',
        // },
        {
          title: '处理时间',
          dataIndex: 'endTime',
        },
        {
          title: '负责人',
          dataIndex: 'assigneeName',
        },
        {
          title: '处理结果',
          dataIndex: 'deleteReason',
        },
        {
          title: '处理意见',
          width: 350,
          dataIndex: 'remarks',
          // scopedSlots: { customRender: 'remarks' },
        },
      ],
      listloaded: false,
      hislistloaded: false,
    }
  },
  computed: {
    stepIndex: function () {
      if (this.resultObj.bpmLogListCount > 3) {
        return this.resultObj.bpmLogStepListCount + 1
      }
      return this.resultObj.bpmLogStepListCount
    },
    hqUserList: function () {
      console.log('hq user select ', this.hqUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.hqUserSelectList.length; a++) {
        names.push(this.hqUserSelectList[a].realname)
        ids.push(this.hqUserSelectList[a].username)
      }
      this.model.nextUserId = ids.join(',')
      this.model.nextUserName = names.join(',')
      return names
    },
    ccUserList: function () {
      console.log('cc user select ', this.ccUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.ccUserSelectList.length; a++) {
        names.push(this.ccUserSelectList[a].realname)
        ids.push(this.ccUserSelectList[a].username)
      }
      this.model.ccUserIds = ids.join(',')
      this.model.ccUserRealNames = names.join(',')
      return names
    },
  },
  methods: {
    // 查询数据
    requestData() {
      this.loading = true
      this.listloaded = false
      var params = { processInstanceId: this.formData.procInsId } //查询条件
      getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result.records
            this.listloaded = true
            this.initHisDataSource(res.result.records, this.resultObj)
          } else {
            this.$message.warn('加载失败')
          }
        })
        .catch((e) => {
          console.error(e)
        })
        .then(() => {
          this.loading = false
        })
    },
    // 流程驳回
    // callBackProcess() {
    //   var that = this
    //   console.log('processInstanceIdes...')
    //   console.log(this.processInstanceIdes)
    //   var params = {
    //     processInstanceId: this.processInstanceIdes,
    //   } //查询条件
    //   console.log('流程驳回', params)
    //   putAction(that.url.callBackProcess, params).then((res) => {
    //     if (res.success) {
    //       that.$message.success('已驳回')
    //       that.loadData()
    //     } else {
    //       that.$message.warning('驳回失败')
    //       that.loadData()
    //       this.queryParam = {}
    //       this.loadData(1)
    //     }
    //   }),
    //     // 关闭模态框
    //     that.$emit('complete')
    // },
    // 流程退回
    async callBackProcess() {
      this.model.reason = '退回'
      var that = this
      let processInstanceId = that.processInstanceIdes
      if (!processInstanceId) {
        return that.$message.error('退回失败！')
      }
      //查询条件
      var params = {
        processInstanceId: processInstanceId,
      }
      console.log('流程退回', params)
      this.$confirm({
        title: '提示',
        content: '确认退回吗?',
        onOk: function () {
          // 发送消息提醒
          that.callBackProcessQueryTitle(processInstanceId)
          setTimeout(() => {
            putAction(that.url.callBackProcess, params).then((res) => {
              if (res.success) {
                that.$message.success('已退回！')
                // 关闭模态框
                that.$emit('complete')
              } else {
                that.$message.warning('退回失败！')
                // 关闭模态框
                that.$emit('complete')
              }
            })
          }, 100)
        },
      })
    },
    // 流程退回查询流程标题并发送消息提醒
    callBackProcessQueryTitle(processInstanceId) {
      getAction(this.url.callBackProcessQueryTitle, { processInstanceId }).then((res) => {
        if (!res.success) {
          this.$message.error('消息发送失败！')
        }
      })
    },
    handleChangeSelect(value) {
      console.log(value)
      if (typeof value == 'string') {
        this.model.reason = value
      } else {
        if (value.target && value.target.value) {
          this.model.reason = value.target.value
        }
      }
    },
    initDictConfig() {
      //初始化字典 - 性别
      initDictOptions('approval_remarks').then((res) => {
        // if (res.success) {
        //   this.remarksDictOptions = res.result
        // }
      })
    },
    getFileDownloadUrl: function (path) {
      return getFileAccessHttpUrl(path)
    },
    //此方法已作废
    handleChange2(info) {
      this.fileList = []
      let fileList = info.fileList
      //fileList = fileList.slice(-2);
      fileList = fileList.map((file) => {
        if (file.response) {
          file.url = file.response.message
        }
        return file
      })
      fileList = fileList
        .filter((file) => {
          console.log('-----fileList response-----', file.response)
          if (file.response) {
            return file.response.success === true
          }
          return false
        })
        .map((file) => {
          var fileJson = {
            fileName: file.name,
            filePath: file.url,
            fileSize: file.size,
          }
          this.fileList.push(fileJson)
        })
      this.model.fileList = JSON.stringify(this.fileList)
      console.log('-----fileList-----', this.model.fileList)
    },
    handleCheckedNextChange(e) {
      this.checkedNext = e.target.checked
      this.hqUserSelectReset()
    },
    handleCheckedCcChange(e) {
      this.checkedCc = e.target.checked
      this.ccUserSelectReset()
    },
    getProcessTaskTransInfo(formData) {
      var params = { taskId: formData.taskId } //查询条件
      this.loading = true
      this.hislistloaded = false
      getAction(this.url.getProcessTaskTransInfo, params)
        .then((res) => {
          if (res.success) {
            console.log('流程流转信息', res)
            this.resultObj = res.result
            this.hislistloaded = true
            this.initHisDataSource(this.dataSource, res.result)
          }
          this.loading = false
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleProcessComplete(nextnode) {
      this.model.reason = '同意'
      const that = this
      console.log('that.model', that.model)
      if (!this.model.reason || this.model.reason.length == 0) {
        this.$message.warning('请填写处理意见')
        return
      }
      if (nextnode) {
        this.model.nextnode = nextnode
      }
      console.log('流程办理数据：', this.model)
      var method = 'post'
      this.$confirm({
        title: '提示',
        content: '确认提交审批吗?',
        onOk: function () {
          that.loading = true

          that.model.fileList = JSON.stringify(that.fileList)
          httpAction(that.url.processComplete, that.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('complete')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.loading = false
              //that.close();
            })
        },
      })
    },
    handleManyProcessComplete() {
      if (this.model.processModel == 3) {
        if (!this.model.rejectModelNode || this.model.rejectModelNode.length == 0) {
          this.$message.warning('请选择驳回节点')
          return
        }
      }
      this.handleProcessComplete()
    },
    selectHqUserOK: function (data) {
      this.hqUserSelectList = data
    },
    handleHqUserSelect: function () {
      this.$refs.selectHqUserModal.add()
    },
    hqUserSelectReset() {
      this.hqUserSelectList = []
    },
    selectCcUserOK: function (data) {
      this.ccUserSelectList = data
    },
    handleCcUserSelect: function () {
      this.$refs.selectCcUserModal.add()
    },
    ccUserSelectReset() {
      this.ccUserSelectList = []
    },
    // getNodeInfo(record) {
    //   if (this.nodePositionInfo) {
    //     var data = this.nodePositionInfo.hisTasks
    //     if (data) {
    //       for (var item of data) {
    //         if (item.id == record.id) {
    //           return item.remarks
    //         }
    //       }
    //     }
    //   }
    //   return ''
    // },
    // // 查询坐标信息数据
    // getNodePositionInfoData() {
    //   var params = { processInstanceId: this.formData.procInsId } //查询条件
    //   getAction(this.url.getNodePositionInfo, params)
    //     .then((res) => {
    //       if (res.success) {
    //         this.nodePositionInfo = res.result
    //       }
    //     })
    //     .catch((e) => {
    //       console.error(e)
    //     })
    //     .then(() => {})
    // },
    initHisDataSource(dataSource, resultObj) {
      console.log(dataSource, resultObj)
      if (this.listloaded && this.hislistloaded) {
        if (dataSource && dataSource.length > 0 && resultObj) {
          var hisdataSource = []
          dataSource.forEach((item) => {
            if (!item.assignee) {
              for (let i = 0; i < this.resultObj.bpmLogList.length; i++) {
                const log = this.resultObj.bpmLogList[i]
                if (log.taskId == item.id) {
                  item.assignee = log.opUserId
                  item.assigneeName = log.opUserName
                  item.remarks = log.remarks
                }
              }
            }
            // if (item.name === resultObj.taskName)
            hisdataSource.push(Object.assign({}, item))
          })
          this.hisdataSource = hisdataSource
        }
      }
    },
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
    console.log('任务办理组件数据：', this.formData)
    this.model.taskId = this.formData.taskId
    this.getProcessTaskTransInfo(this.formData)
    // this.getNodePositionInfoData()
    this.requestData()
    this.initDictConfig()
  },
}
</script>

<style scoped>
.task-info {
  margin: 20px 0;
}

.task-title {
  font-weight: bold;
}

.task-date {
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-date span {
  /* color: #ff6d75;*/
}

.ant-steps-item-description {
  max-width: 200px !important;
}

/** Button按钮间距 */
.ant-btn {
  margin-left: 3px;
}
</style>