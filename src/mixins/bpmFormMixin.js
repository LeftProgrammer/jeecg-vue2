

import { deleteAction, getAction, httpAction, putAction, postAction } from '@/api/manage'

export const bpmFormMixin = {

    data() {
        return {
            // 业务id
            id: '',
            // 流程信息
            resultObj: {},
            fileList: [],
            procInstId: '',
            // 流程办理model
            formModel: {
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
                fileList: [],
            },
            url: {
                processComplete: '/act/task/processComplete',
                getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
                callBackProcess: '/act/task/callBackProcess',
                queryRunTaskById: '/sys/flow/queryRunTaskById',
                updateAssignee: '/sys/flow/updateAssignee',
                callBackProcessQueryTitle: '/sys/flow/callBackProcessQueryTitle',
                startProcess: '/act/process/extActProcess/startMutilProcess',
            },
            record: {},
            // 是否是工作台审批界面
            isFormData: true,
        }
    },
    methods: {
        // 工作台办理流程退回后重新发起流程方法
        startProcess(record) {
            var that = this
            let params = {
                flowCode: this.flowCode,
                id: record.id,
                formUrl: this.formUrl,
                formUrlMobile: '',
            }
            if (!params.flowCode) {
                return that.$message.error('flowCode参数为空！')
            }
            if (!params.formUrl) {
                return that.$message.error('formUrl参数为空！')
            }
            postAction(this.url.startProcess, params).then((res) => {
                if (res.success) {
                    that.$message.success('已退回！')
                } else {
                    that.$message.warning('退回失败！')
                }
            })
        },
        // 查询流程信息
        handleFlow() {
            this.procInstId = ''
            this.id = ''
            let model = this.model
            if (!model || !model.id) {
                return this.$message.error('未获取到业务id！')
            }
            this.id = model.id
            // 根据业务id查询流程待办
            getAction(this.url.queryRunTaskById, { id: model.id }).then((res) => {
                if (res.success) {
                    this.formModel.taskId = res.result.ID_
                    this.procInstId = res.result.PROC_INST_ID_
                    this.getProcessTaskTransInfo({ taskId: res.result.ID_ })
                }
            })
        },
        getProcessTaskTransInfo(formData) {
            var params = { taskId: formData.taskId } //查询条件
            getAction(this.url.getProcessTaskTransInfo, params).then((res) => {
                if (res.success) {
                    this.resultObj = res.result
                }
            })
        },
        // 办理流程   同意/不同意
        handleProcessComplete(item) {
            const that = this
            this.$confirm({
                title: '提示',
                content: '确认提交吗?',
                onOk: function () {
                    // 先保存
                    that.submitFormData(item)
                },
            })
        },

        // 流程同意时保存方法
        submitFormData(item) {
            const that = this
            that.form.validateFields((err, values) => {
                // 触发表单验证
                let httpurl = ''
                let method = ''
                httpurl += that.url.edit
                method = 'put'
                let formData = Object.assign(that.model, values)
                console.log('表单提交数据', formData)
                httpAction(httpurl, formData, method).then((res) => {
                    if (res.success) {
                        that.model = res.result
                        that.handleProcess(item)
                    } else {
                        that.$message.warning(res.message)
                    }
                })
            })
        },

        // 流程办理
        handleProcess(item) {
            const that = this
            if (item.Transition == '确认提交') {
                if (that.model.nodeStatus == 1) {
                    that.model.reason = '整改'
                } else if (that.model.nodeStatus == 2) {
                    that.model.reason = '验收'
                }
            } else {
                that.model.reason = item.Transition
            }
            if (item.nextnode) {
                this.formModel.nextnode = item.nextnode
            }
            console.log('流程办理数据：', this.formModel)
            var method = 'post'
            that.formModel.fileList = JSON.stringify(that.fileList)
            httpAction(that.url.processComplete, that.formModel, method).then((res) => {
                if (res.success) {
                    that.$message.success(res.message)
                    that.$emit('complete')
                    // 修改办理人为当前用户
                    that.updateAssignee()
                } else {
                    that.$message.warning(res.message)
                }
            })
        },
        // 流程退回
        async callBackProcess() {
            var that = this
            let processInstanceId = that.procInstId
            if (!processInstanceId) {
                return that.$message.error("退回失败！")
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
                    that.callBackProcessQueryTitle()
                    setTimeout(() => {
                        putAction(that.url.callBackProcess, params).then((res) => {
                            if (res.success) {
                                if (that.type != 'ZPSSZG' || that.type != 'PAGDZG') {
                                    that.startProcess(that.model)
                                }
                                that.$emit('complete')
                                // that.$emit('ok')
                            } else {
                                that.$message.warning("退回失败！")
                                that.$emit('complete')
                                // that.$emit('ok')
                            }
                        })
                    }, 100);
                },
            })
        },

        // 修改办理人为当前用户
        updateAssignee() {
            getAction(this.url.updateAssignee, { id: this.id }).then((res) => { })
        },

        // 流程退回查询流程标题并发送消息提醒
        callBackProcessQueryTitle() {
            getAction(this.url.callBackProcessQueryTitle, { id: this.model.id, type: this.type }).then((res) => {
                if (!res.success) {
                    this.$message.error("消息发送失败！")
                }
            })
        },
    }
}
