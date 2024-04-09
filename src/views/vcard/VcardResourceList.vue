<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="3">
        <a-directory-tree
          show-icon
          :tree-data="treeData" 
          :autoExpandParent='false'
          :replaceFields="{ children: 'children', title: 'name', key: 'id' }"
          @select="onSelect"
        >
          <a-icon
            slot="switcherIcon"
            type="down"
          />

        </a-directory-tree>
      </a-col>
      <a-col :span="21">
        <a-form
          layout="inline"
          @keyup.enter.native="onQuery"
        >
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="资料名称">
                <a-input
                  placeholder="输入名称关键字"
                  v-model="queryParam.title"
                />
              </a-form-item>
              <a-form-item label="资料类型">
                <a-select
                  :value="queryParam.dataType"
                  placeholder="请选择资料类型"
                  style="width: 170px"
                  @change="(val) => $set(queryParam, 'dataType', val)"
                >
                  <a-select-option
                    v-for="dataType in dataTypeOptions"
                    :key="dataType.value"
                    :value="dataType.value"
                  >
                  {{ dataType.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <span class="table-page-search-submitButtons">
                <a-button
                  type="primary"
                  @click="onQuery(3)"
                  icon="search"
                >
                  查询
                </a-button>
                <a-button
                  type="primary"
                  @click="searchReset"
                  icon="reload"
                  style="margin-left: 8px"
                >
                  刷新
                </a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
        <div style="margin: 20px 0; display: flex; justify-content: space-between">
          <span>项目列表</span>
          <a-button
            type="primary"
            @click="handleAdd('新增')"
            icon="plus"
          >
            新增
          </a-button>
        </div>
        <div>
          <a-table
            ref="table"
            size="middle"
            :scroll="{ x: true, y: 800 }"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="false"
            :loading="loading"
            :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            @change="handleTableChange"
          >
            <template
              slot="resourceContent"
              slot-scope="text, record"
            >
              <img
                v-if="record.dataType==3"
                style="height: 100px; cursor: pointer"
                :src="API_BASE_URL + '/' + text"
                alt=""
                @click="viewImg(text)"
              />
              <span
                v-else
              >text</span>
            </template>
            <template
              slot="action"
              slot-scope="text, record"
            >
              <span>
                <a @click="handleUpdate(record)">编辑</a>
                <a-divider type="vertical" />
                <a-popconfirm
                  title="确定删除吗?"
                  @confirm="() => handleDelete(record.id)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </span>
            </template>
          </a-table>
          <div style="margin-top: 20px; float: right">
            <a-pagination
              size="small"
              :total="pageParams.total"
              show-size-changer
              show-quick-jumper
              :value="pageParams.pageNo"
              :page-size="pageParams.pageSize"
              @change="onPageNoChange"
              @showSizeChange="onShowSizeChange"
            />
          </div>
        </div>
      </a-col>
    </a-row>
    <vcard-resource-modal
      ref="modalForm"
      @ok="onQuery"
      :dataType="dataType"
      :dataRef="dataRef"
    />
    <a-modal
      :visible="ImgVisible"
      :footer="null"
      @cancel="ImgVisible = false"
    >
      <img
        style="width: 100%"
        :src="imgUrl"
        alt=""
      />
    </a-modal>
  </a-card>
</template>

<script>
import { getAction } from '@/api/manage'
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import VcardResourceModal from './modules/VcardResourceModal'

export default {
  name: 'VcardResourceList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    VcardResourceModal,
  },
  data() {
    let that = this
    return {
      description: '资料管理记录表管理页面',
      dataType: null,
      tablename: 'vcard_resource',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 40,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '资料名称',
          align: 'left',
          dataIndex: 'name',
          width: 180,
        },
        {
          title: '资料类型',
          align: 'center',
          width: 100,
          dataIndex: 'dataType',
          customRender: function (val) {
            let text = '';
            [{
              text:"表单",
              value:1
            },{
              text:"文件",
              value:2
            },{
              text:"图片",
              value:3
            }].forEach((item) => {
              if(item.value==val){
                text = item.text
              }
            })
            return text
          },
        },
        {
          title: '内容',
          align: 'center',
          width: 500,
          dataIndex: 'content',
          scopedSlots: { customRender: 'resourceContent' },
        },
        /*{
          title: '显示顺序',
          align: 'center',
          width: 350,
          dataIndex: 'sortNo',
        },*/
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/vcard/resource/list',
        delete: '/vcard/resource/delete',
        menuList: '/vcard/catalog/all',
      },
      dataTypeOptions:[{
          text:"表单",
          value:1
        },{
          text:"文件",
          value:2
        },{
          text:"图片",
          value:3
        }],
      superFieldList: [],
      disableMixinCreated: true,
      treeData: [],
      catalogId: '0',
      menuId: '0',
      pageParams: {
        total: 0,
        pageSize: 10,
        pageNo: 1,
      },
      dataRef: {},
      ImgVisible: false,
      imgUrl: '',
      temp: 0,
    }
  },
  provide() {
    return {
      globaData:{
        menuOptions: this.treeData,
        dataTypeOptions:this.dataTypeOptions
      }
    }
  },
  created() {
    // this.getSuperFieldList()
    this.loadMenuData()
    this.onQuery()
  },
  methods: {
    onSelect(selectedKeys, info) {
      let dataRef = info.node.dataRef
      const { catalogId, id } = dataRef
      if (catalogId == '0') {
        this.catalogId = id
        this.menuId = '0'
        this.dataRef = dataRef
        this.onQuery(1)
      } else {
        this.catalogId = catalogId
        this.menuId = id
        this.dataRef = dataRef
        this.onQuery(2)
      }
    },
    /**
     * @description 表格查询
     */
    onQuery(number) {
      let params
      //传1的时候查二级菜单 2的时候查一级菜单
      if (number == 1) {
        params = Object.assign(this.getQueryParams(), {
          catalogId: this.catalogId,
          menuId:'0',
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      } else if (number == 2) {
        params = Object.assign(this.getQueryParams(), {
          menuId: this.menuId,
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      } else if (number == 3) {
        params = Object.assign(this.getQueryParams(), {
          catalogId: '0',
          menuId:'0',
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      } else {
        params = Object.assign(this.getQueryParams(), {
          catalogId: this.catalogId,
          menuId: this.memuId,
          pageSize: this.pageParams.pageSize,
          pageNo: this.pageParams.pageNo,
        })
      }
      getAction(this.url.list, params).then((res) => {
        this.dataSource = res.result.records
        this.pageParams.total = res.result.total
      })
    },
    onPageNoChange(pageNumber) {
      this.pageParams.pageNo = pageNumber
      this.onQuery()
    },
    onShowSizeChange(current, pageSize) {
      this.pageParams.pageNo = 1
      this.pageParams.pageSize = pageSize
      this.onQuery()
    },
    viewImg(text) {
      this.imgUrl = this.API_BASE_URL + '/' + text
      this.ImgVisible = true
    },
    
    /**
     * @description 获取树数据
     */
    loadMenuData() {
      getAction(this.url.menuList)
        .then((res) => {
          if (res.success) {
            this.treeData = res.result
            // this.treeData = res.result.records

          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    handleAdd(title) {
      if (typeof title === 'string') {
        this.$refs.modalForm.title = title || '新增'
      } else {
        this.$refs.modalForm.title = '新增'
      }
      var Object = {
          menuId: this.dataRef.id,
          catalogId: this.dataRef.catalogId,
        }
      console.log(Object)
      this.$refs.modalForm.edit(Object,this.treeData,this.dataTypeOptions)
    },

    handleUpdate(record) {
      console.log(Object)
      this.$refs.modalForm.title = '修改'
      this.$refs.modalForm.edit(record,this.treeData,this.dataTypeOptions)
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'name', text: '标题', dictCode: '' })
      fieldList.push({
        type: 'sel_search',
        value: 'catalogId',
        text: '所属目录',
      })
      fieldList.push({
        type: 'string',
        value: 'menuId',
        text: '所属菜单',
      })
      fieldList.push({ type: 'number', value: 'dataType', text: '资料类型'})
      this.superFieldList = fieldList
    },
  },
}
</script>
<style lang='less' scoped>
@import '~@assets/less/common.less';
/* 单行文本溢出 */
::v-deep.ant-tree-node-content-wrapper {
	overflow: hidden;
	text-overflow: ellipsis;
	lines: 1;
	white-space: nowrap;
	word-break: break-all;
  width: 140px;
}
</style>
