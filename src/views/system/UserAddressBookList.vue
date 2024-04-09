<template>
	<a-card :bordered="false">
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper">
			<a-form layout="inline" @keyup.enter.native="searchQuery">
				<a-row :gutter="24">
					<a-col :span="24">
						<template>
							<a-form-item label="姓名">
								<j-input placeholder="请输入姓名" v-model="queryParam.realname"></j-input>
							</a-form-item>
						</template>

						<a-button style="background-color: rgb(44, 102, 244)" type="primary" @click="searchQuery"
							icon="search">查询</a-button>
						<a-button style="background-color: rgb(44, 102, 244); margin-left: 8px" type="primary"
							@click="searchReset" icon="reload">刷新</a-button>
					</a-col>
				</a-row>
			</a-form>
		</div>

		<!-- 操作按钮区域 -->
		<div class="table-operator" style="border-top: 5px"></div>

		<!-- table区域-begin -->
		<div>
			<a-table ref="table" bordered :scroll='{y:550}' size="middle" rowKey="id" :columns="columns"
				:dataSource="dataSource" :pagination="ipagination" :loading="loading"
				:rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				@change="handleTableChange">
			</a-table>
		</div>
	</a-card>
</template>

<script>
	import {
		JeecgListMixin
	} from '@/mixins/JeecgListMixin'
	import {
		getAction
	} from '@/api/manage'

	export default {
		name: 'UserAddressBookList',
		mixins: [JeecgListMixin],
		components: {},
		data() {
			return {
				description: '这是用户管理页面',
				queryParam: {},
				recycleBinVisible: false,
				columns: [{
						title: '姓名',
						align: 'center',
						dataIndex: 'realname',
					},
					{
						title: '单位/标段',
						align: 'center',
						dataIndex: 'orgCodeTxt',
						ellipsis: true,
					},
					{
						title: '部门',
						align: 'center',
						dataIndex: 'userDepartment_dictText',
						ellipsis: true,
					},
					{
						title: '岗位',
						align: 'center',
						dataIndex: 'post',
					},
					{
						title: '电话号码',
						align: 'center',
						dataIndex: 'phone',
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
					list: '/sys/user/addressBookList',
				},
			}
		},
		computed: {
			importExcelUrl: function() {
				return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
			},
		},
		created() {},
		methods: {
			loadData(arg) {
				this.queryParam.status = 1
				if (!this.url.list) {
					this.$message.error('请设置url.list属性!')
					return
				}
				//加载数据 若传入参数1则加载第一页的内容
				if (arg === 1) {
					this.ipagination.current = 1
				}
				var params = this.getQueryParams() //查询条件
				this.loading = true
				getAction(this.url.list, params).then((res) => {
					if (res.success) {
						this.dataSource = res.result.records || res.result
						if (res.result.total) {
							this.ipagination.total = res.result.total
						} else {
							this.ipagination.total = 0
						}
					}
					if (res.code === 510) {
						this.$message.warning(res.message)
					}
					this.loading = false
				})
			},
		},
	}
</script>
<style lang="less" scoped>
	@import '~@assets/less/common.less';

	::v-deep .ant-card-body {
	height: 46.875rem !important;
		background-color: #fff !important;
	}
</style>
