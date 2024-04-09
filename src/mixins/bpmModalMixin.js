

import { deleteAction, getAction, postAction, httpAction, putAction } from '@/api/manage'

export const bpmModalMixin = {

    data() {
        return {
            // 业务id
            id: '',
            // 流程信息
            resultObj: {},
            fileList: [],
            procInstId: '',
            // 流程办理model
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
                fileList: [],
            },
            url: {
                processComplete: '/act/task/processComplete',
                getProcessTaskTransInfo: '/act/task/getProcessTaskTransInfo',
                callBackProcess: '/act/task/callBackProcess',
                queryRunTaskById: '/sys/flow/queryRunTaskById',
                updateAssignee: '/sys/flow/updateAssignee',
                callBackProcessQueryTitle: '/sys/flow/callBackProcessQueryTitle',
            },
            record: {},
        }
    },
    methods: {
        edit(record) {
            this.record = {}
            this.record = record
            this.visible = true
            this.$nextTick(() => {
                this.$refs.realForm.edit(record)
            })
            // 流程审批中才执行
            if (record && record.id && record.bpmStatus == '2') {
                this.$nextTick(() => {
                    this.handleFlow()
                })
            }
        },
        // 查询流程信息
        handleFlow() {
            this.procInstId = ''
            this.id = ''
            let model = this.$refs.realForm.model
            if (!model || !model.id) {
                return this.$message.error('未获取到业务id！')
            }
            this.id = model.id
            // 根据业务id查询流程待办
            getAction(this.url.queryRunTaskById, { id: model.id }).then((res) => {
                if (res.success) {
                    this.model.taskId = res.result.ID_
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
                    that.submitForm(item)
                },
            })
        },

        submitForm(item) {
            const that = this
            let form = that.$refs.realForm.form
            form.validateFields((err, values) => {
                // 触发表单验证
                let httpurl = ''
                let method = ''
                httpurl += that.url.edit
                method = 'put'
                let formData = Object.assign(that.record, values)
                console.log('表单提交数据', formData)
                httpAction(httpurl, formData, method).then((res) => {
                    if (res.success) {
                        that.record = res.result
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
                if (that.record.nodeStatus == 1) {
                    that.model.reason = '整改'
                } else if (that.record.nodeStatus == 2) {
                    that.model.reason = '验收'
                }
            } else {
                that.model.reason = item.Transition
            }
            if (item.nextnode) {
                this.model.nextnode = item.nextnode
            }
            console.log('流程办理数据：', this.model)
            var method = 'post'
            // this.$confirm({
            //     title: '提示',
            //     content: '确认提交吗?',
            //     onOk: function () {

            that.model.fileList = JSON.stringify(that.fileList)
            httpAction(that.url.processComplete, that.model, method).then((res) => {
                if (res.success) {
                    that.$message.success(res.message)
                    that.$emit('ok')
                    that.close()
                    // 修改办理人为当前用户
                    that.updateAssignee()
                } else {
                    that.$message.warning(res.message)
                }
            })
            //     },
            // })
        },

        close() {
            this.resultObj = {}
            this.$emit('close')
            this.visible = false
        },
        // 修改办理人为当前用户
        updateAssignee() {
            getAction(this.url.updateAssignee, { id: this.id }).then((res) => { })
        },
        // 流程退回查询流程标题并发送消息提醒
        callBackProcessQueryTitle() {
            getAction(this.url.callBackProcessQueryTitle, { id: this.record.id, type: this.type }).then((res) => {
                if (!res.success) {
                    this.$message.error("消息发送失败！")
                }
            })
        },
    }
}
