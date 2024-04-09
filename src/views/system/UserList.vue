<template>
	<a-card :bordered="false">
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper">
			<a-form layout="inline" @keyup.enter.native="searchQuery">
				<a-row :gutter="24">
					<a-col :span="24">
						<a-form-item label="账号">
							<!--<a-input placeholder="请输入账号查询" v-model="queryParam.username"></a-input>-->
							<j-input placeholder="输入账号模糊查询" v-model="queryParam.username"></j-input>
						</a-form-item>

						<template v-if="toggleSearchStatus">
							<a-form-item label="真实名字">
								<a-input placeholder="请输入真实名字" v-model="queryParam.realname"></a-input>
							</a-form-item>

							<a-form-item label="手机号码">
								<a-input placeholder="请输入手机号码查询" v-model="queryParam.phone"></a-input>
							</a-form-item>

							<a-form-item label="用户状态">
								<a-select v-model="queryParam.status" placeholder="请选择">
									<a-select-option value="">请选择</a-select-option>
									<a-select-option value="1">正常</a-select-option>
									<a-select-option value="2">冻结</a-select-option>
								</a-select>
							</a-form-item>
						</template>

						<span class="btn-left">
							<a-button style="background-color: #2c66f4" type="primary" @click="searchQuery" icon="search">查询</a-button>
							<a-button style="background-color: #2c66f4" type="primary" @click="searchReset" icon="reload" >重置
							</a-button>
							<a @click="handleToggleSearch" style="margin-left: 8px">
								{{ toggleSearchStatus ? '收起' : '展开' }}
								<a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
							</a>
						</span>
					</a-col>
				</a-row>
			</a-form>
		</div>

		<!-- 操作按钮区域 -->
		<div class="btn-left" style="border-top: 5px">
			<a-button style="background-color: #2c66f4" @click="handleAdd" type="primary" icon="">添加用户</a-button>
			<!-- <a-button @click="handleSyncUser"  type="primary" icon="plus">同步流程</a-button> -->
			<a-button style="background-color: #2c66f4" type="primary" icon="download" @click="handleExportXls('用户信息')">导出</a-button>
			<a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
				:action="importExcelUrl" @change="handleImportExcel">
				<a-button style="background-color: #2c66f4" type="primary" icon="import">导入</a-button>
			</a-upload>
			<a-button style="background-color: #2c66f4" type="primary" icon="hdd" @click="recycleBinVisible = true">回收站</a-button>
			<a-dropdown v-if="selectedRowKeys.length > 0">
				<a-menu slot="overlay" @click="handleMenuClick">
					<a-menu-item key="1">
						<a-icon type="delete" @click="batchDel" />
						删除
					</a-menu-item>
					<a-menu-item key="2">
						<a-icon type="lock" @click="batchFrozen('2')" />
						冻结
					</a-menu-item>
					<a-menu-item key="3">
						<a-icon type="unlock" @click="batchFrozen('1')" />
						解冻
					</a-menu-item>
				</a-menu>
				<a-button style="margin-left: 8px">
					批量操作
					<a-icon type="down" />
				</a-button>
			</a-dropdown>
			<!-- 高级查询 -->
			<!-- <j-super-query :fieldList="superQueryFieldList" @handleSuperQuery="handleSuperQuery"/> -->
		</div>

		<!-- table区域-begin -->
		<div>
			<a-table :scroll='{y:500}' bordered ref="table" bordered size="middle" rowKey="id" :columns="columns"
				:dataSource="dataSource" :pagination="ipagination" :loading="loading"
				:rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				@change="handleTableChange">
				<template slot="avatarslot" slot-scope="text, record, index">
					<div class="anty-img-wrap">
						<a-avatar shape="square" :src="getAvatarView(record.avatar)" icon="user" />
					</div>
				</template>

				<span slot="action" slot-scope="text, record">
					<a @click="handleEdit(record)">编辑</a>
					<a-divider type="vertical" />
					<a href="javascript:;" @click="handleDetail(record)">详情</a>
					<a-divider type="vertical" />
					<a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
						<a>删除</a>
					</a-popconfirm>
					<a-divider type="vertical" />

					<a-dropdown>
						<a class="ant-dropdown-link"> 更多
							<a-icon type="down" />
						</a>
						<a-menu slot="overlay">
							<a-menu-item> </a-menu-item>
							<a-menu-item>
								<a-popconfirm title="确定初始化密码吗?" @confirm="() => handleChangePassword(record.username)">
									<a>密码初始化</a>
								</a-popconfirm>
							</a-menu-item>
							<a-menu-item v-if="record.status == 1">
								<a-popconfirm title="确定冻结吗?"
									@confirm="() => handleFrozen(record.id, 2, record.username)">
									<a>冻结</a>
								</a-popconfirm>
							</a-menu-item>
							<a-menu-item v-if="record.status == 2">
								<a-popconfirm title="确定解冻吗?"
									@confirm="() => handleFrozen(record.id, 1, record.username)">
									<a>解冻</a>
								</a-popconfirm>
							</a-menu-item>
							<a-menu-item>
								<a href="javascript:;" @click="handleAgentSettings(record.username)">代理人</a>
							</a-menu-item>
						</a-menu>
					</a-dropdown>
				</span>
			</a-table>
		</div>
		<!-- table区域-end -->

		<user-modal ref="modalForm" @ok="modalFormOk"></user-modal>

		<!-- <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal> -->

		<sys-user-agent-modal ref="sysUserAgentModal"></sys-user-agent-modal>

		<!-- 用户回收站 -->
		<user-recycle-bin-modal :visible.sync="recycleBinVisible" @ok="modalFormOk" />
	</a-card>
</template>

<script>
	import UserModal from './modules/UserModal'
	// import PasswordModal from './modules/PasswordModal'
	import {
		putAction,
		getFileAccessHttpUrl
	} from '@/api/manage'
	import {
		frozenBatch,
		changePassword
	} from '@/api/api'
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'
	import SysUserAgentModal from './modules/SysUserAgentModal'
	import JInput from '@/components/jeecg/JInput'
	import UserRecycleBinModal from './modules/UserRecycleBinModal'
	import JSuperQuery from '@/components/jeecg/JSuperQuery'
	import {
		getAction
	} from '../../api/manage'

	export default {
		name: 'UserList',
		mixins: [JeecgListMixin],
		components: {
			SysUserAgentModal,
			UserModal,
			// PasswordModal,
			JInput,
			UserRecycleBinModal,
			JSuperQuery,
		},
		data() {
			return {
				description: '这是用户管理页面',
				queryParam: {},
				recycleBinVisible: false,
				columns: [
					/*{
					    title: '#',
					    dataIndex: '',
					    key:'rowIndex',
					    width:60,
					    align:"center",
					    customRender:function (t,r,index) {
					      return parseInt(index)+1;
					    }
					  },*/
					{
						title: '用户账号',
						align: 'center',
						dataIndex: 'username',
						sorter: true,
					},
					{
						title: '用户姓名',
						align: 'center',
						dataIndex: 'realname',
					},
					// {
					//   title: '工号',
					//   align: 'center',
					//   dataIndex: 'workNo',
					//   width: '100px',
					//   sorter: true,
					// },
					// {
					//   title: '头像',
					//   align: 'center',
					//   width: '12%',
					//   dataIndex: 'avatar',
					//   scopedSlots: { customRender: 'avatarslot' },
					// },
					// {
					//   title: '性别',
					//   align: 'center',
					//   width: '8%',
					//   dataIndex: 'sex_dictText',
					//   sorter: true,
					// },
					// {
					//   title: '生日',
					//   align: "center",
					//   width: 100,
					//   dataIndex: 'birthday'
					// },
					// {
					//   title: '手机号码',
					//   align: 'center',
					//   width: '12%',
					//   dataIndex: 'phone',
					// },
					{
						title: '单位/标段',
						align: 'center',
						ellipsis: true,
						dataIndex: 'orgCodeTxt',
					},
					// {
					//   title: '负责部门',
					//   align: 'center',
					//   width: '15%',
					//   dataIndex: 'departIds_dictText',
					// },
					{
						title: '状态',
						align: 'center',
						dataIndex: 'status_dictText',
					},
					{
						title: '操作',
						dataIndex: 'action',
						width: 230,
						scopedSlots: {
							customRender: 'action'
						},
						align: 'center',
					},
				],
				superQueryFieldList: [{
						type: 'input',
						value: 'username',
						text: '用户账号'
					},
					{
						type: 'input',
						value: 'realname',
						text: '用户姓名'
					},
					{
						type: 'input',
						value: 'workNo',
						text: '工号'
					},
					{
						type: 'select',
						value: 'sex',
						text: '性别',
						dictCode: 'sex'
					},
				],
				url: {
					syncUser: '/act/process/extActProcess/doSyncUser',
					list: '/sys/user/list',
					delete: '/sys/user/delete',
					deleteBatch: '/sys/user/deleteBatch',
					exportXlsUrl: '/sys/user/exportXls',
					importExcelUrl: '/sys/user/importExcel',
					queryOaSignRule: '/eoa/sign/rule/queryOaSignRule',
				},
				defaultPassword: 'jh@12345',
			}
		},
		computed: {
			importExcelUrl: function() {
				return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
			},
		},
		created() {
			// getAction(this.url.queryOaSignRule).then((res) => {
			//   if (res.success) {
			//     this.defaultPassword = res.result.defaultPassword
			//   }
			// })
		},
		methods: {
			getAvatarView: function(avatar) {
				return getFileAccessHttpUrl(avatar)
			},

			batchFrozen: function(status) {
				if (this.selectedRowKeys.length <= 0) {
					this.$message.warning('请选择一条记录！')
					return false
				} else {
					let ids = ''
					let usernames = ''
					let that = this
					let isAdmin = false
					that.selectionRows.forEach(function(row) {
						if (row.username == 'admin') {
							isAdmin = true
						}
					})
					if (isAdmin) {
						that.$message.warning('管理员账号不允许此操作,请重新选择！')
						return
					}
					that.selectedRowKeys.forEach(function(val) {
						ids += val + ','
					})
					if (that.selectionRows && that.selectionRows.length > 0) {
						that.selectionRows.forEach(function(row) {
							usernames += row.username + ','
						})
					}
					that.$confirm({
						title: '确认操作',
						content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中账号?',
						onOk: function() {
							frozenBatch({
								ids: ids,
								status: status,
								usernames: usernames
							}).then((res) => {
								if (res.success) {
									that.$message.success(res.message)
									that.loadData()
									that.onClearSelected()
								} else {
									that.$message.warning(res.message)
								}
							})
						},
					})
				}
			},
			handleMenuClick(e) {
				if (e.key == 1) {
					this.batchDel()
				} else if (e.key == 2) {
					this.batchFrozen(2)
				} else if (e.key == 3) {
					this.batchFrozen(1)
				}
			},
			handleFrozen: function(id, status, username) {
				let that = this
				//TODO 后台校验管理员角色
				if ('admin' == username) {
					that.$message.warning('管理员账号不允许此操作！')
					return
				}
				frozenBatch({
					ids: id,
					status: status,
					usernames: username
				}).then((res) => {
					if (res.success) {
						that.$message.success(res.message)
						that.loadData()
					} else {
						that.$message.warning(res.message)
					}
				})
			},
			handleChangePassword(username) {
				if (!username) {
					return
				}
				//直接修改为默认密码
				var formData = {
					confirmpassword: this.defaultPassword,
					password: this.defaultPassword,
					username: username,
					isDefault: '0',
				}
				changePassword(formData)
					.then((res) => {
						if (res.success) {
							this.$message.success(res.message)
							this.$emit('ok')
						} else {
							this.$message.warning(res.message)
						}
					})
					.finally(() => {
						this.confirmLoading = false
						// this.close()
					})
			},
			handleAgentSettings(username) {
				this.$refs.sysUserAgentModal.agentSettings(username)
				this.$refs.sysUserAgentModal.title = '用户代理人设置'
			},
			handleSyncUser() {
				var that = this
				putAction(that.url.syncUser, {}).then((res) => {
					if (res.success) {
						that.$message.success(res.message)
					} else {
						that.$message.warning(res.message)
					}
				})
			},
			passwordModalOk() {
				//TODO 密码修改完成 不需要刷新页面，可以把datasource中的数据更新一下
			},
		},
	}
</script>
<style lang="less" scoped>
	@import '~@assets/less/common.less';

	::v-deep .ant-card-body {
		height: calc(100vh - 135px - 24px) !important;
		background-color: #fff !important;
	}
</style>

