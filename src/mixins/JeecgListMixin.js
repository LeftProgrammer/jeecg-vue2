/**
 * 新增修改完成调用 modalFormOk方法 编辑弹框组件ref定义为modalForm
 * 高级查询按钮调用 superQuery方法  高级查询组件ref定义为superQueryModal
 * data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
 */
import { filterObj, getImageThumbnailUrl } from '@/utils/util';
import { deleteAction, getAction, downFile, getFileAccessHttpUrl, getFilePreviewUrl } from '@/api/manage'
import Vue from 'vue'
import { ACCESS_TOKEN, TENANT_ID } from "@/store/mutation-types"
import store from '@/store'
import { Modal } from 'ant-design-vue'

export const JeecgListMixin = {
  data() {
    return {
      /* 查询条件-请不要在queryParam中声明非字符串值的属性 */
      queryParam: {},
      /* 数据源 */
      dataSource: [],
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 20,
        pageSizeOptions: ['20', '50', '100'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      /* 排序参数 */
      isorter: {
        column: 'createTime',
        order: 'desc',
      },
      /* 筛选参数 */
      filters: {},
      /* table加载状态 */
      loading: false,
      /* table选中keys*/
      selectedRowKeys: [],
      /* table选中records*/
      selectionRows: [],
      /* 查询折叠 */
      toggleSearchStatus: false,
      /* 高级查询条件生效状态 */
      superQueryFlag: false,
      /* 高级查询条件 */
      superQueryParams: '',
      /** 高级查询拼接方式 */
      superQueryMatchType: 'and',
      accessControl: {
        tablename: '',
        add: ':add',
        edit: ':edit',
        delete: ':delete',
        batch_delete: ':batch_delete',
        import: ':import',
        export: ':export',
        submit: ':submit',
        adjust: ':adjust',
        send: ':send',
        show: ':show',
        // 上移
        up: ':up',
        // 下移
        down: ':down',
        //下载
        download: ':download'
      },
    }
  },
  created() {
    if (!this.disableMixinCreated) {
      console.log(' -- mixin created -- ')
      this.loadData();
      //初始化字典配置 在自己页面定义
      this.initDictConfig();
    }
  },
  computed: {
    accessToken() {
      return Vue.ls.get(ACCESS_TOKEN)
    },
    //token header
    // tokenHeader() {
    //   let head = { 'X-Access-Token': this.accessToke }
    //   let tenantid = Vue.ls.get(TENANT_ID)
    //   if (tenantid) {
    //     head['tenant_id'] = tenantid
    //   }
    //   return head;
    // }
    tokenHeader() {
      let head = { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) }
      let tenantid = Vue.ls.get(TENANT_ID)
      if (tenantid) {
        head['tenant_id'] = tenantid
      }
      return head;
    }
  },
  methods: {
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error("请设置url.list属性!")
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();//查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records || res.result;
          if (res.result.total) {
            this.ipagination.total = res.result.total;
          } else {
            this.ipagination.total = 0;
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
       
        this.loading = false;
        // this.mergeObj = {}
        // this.handeleMerge(this.dataSource, [], this.columns[0], 1)
      })
    },
    // 合并单元格 数据源，根据哪一列合并，合并列，第几列
    handeleMerge(data, onRow, row, rowIndex) {
      let that = this
      // 当前合并的列
      let datas = data
      let onCol = ''
      let col = ''
      var materialSort = ''
      datas.forEach((e, i) => {
        for (let item in e) {
          if (onRow && item == onRow.dataIndex) {
            onCol = e[item]
          }
          if (row && item == row.dataIndex) {
            col = e[item]
          }
        }
        // 是否是第一列合并
        if (rowIndex == 1) {
          materialSort = col
        } else {
          materialSort = col + onCol
        }
        if (that.mergeObj[materialSort]) {
          that.mergeObj[materialSort].end = i
          that.mergeObj[materialSort].irowspan = i - that.mergeObj[materialSort].start + 1
        } else {
          that.mergeObj[materialSort] = {
            start: i,
            end: i,
            irowspan: 1,
          }
        }
      })
      row.customRender = (text, currentRow, index) => {
        var irowspan = 0
        var mergeObj = that.mergeObj
        for (const item in mergeObj) {
          let itemName = ''
          if (rowIndex == 1) {
            itemName = item
          } else {
            itemName = currentRow[row.dataIndex] + currentRow[onRow.dataIndex]
          }
          if (index == mergeObj[itemName].start) {
            irowspan = mergeObj[itemName].irowspan
            break
          } else if (index >= mergeObj[itemName].start && index <= mergeObj[itemName].end) {
            irowspan = 0
            break
          } else {
            irowspan = 1
          }
        }
        return {
          children: text,
          attrs: {
            rowSpan: irowspan,
          },
        }
      }
    },
    initDictConfig() {
      console.log("--这是一个假的方法!")
    },
    handleSuperQuery(params, matchType) {
      //高级查询方法
      if (!params) {
        this.superQueryParams = ''
        this.superQueryFlag = false
      } else {
        this.superQueryFlag = true
        this.superQueryParams = JSON.stringify(params)
        this.superQueryMatchType = matchType
      }
      console.log(params)
      this.loadData(1)
    },
    getQueryParams() {
      //获取查询条件
      let sqp = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      var param = Object.assign(sqp, this.queryParam, this.isorter, this.filters);
      // console.log("*********************************************",param)
      param.field = this.getQueryField();
      param.pageNo = this.ipagination.current;
      param.pageSize = this.ipagination.pageSize;
      return filterObj(param);
    },
    getQueryField() {
      //TODO 字段权限控制
      var str = "id,";
      if (this.columns && Array.isArray(this.columns)) {
        this.columns.forEach(function (value) {
          str += "," + value.dataIndex;
        });
      }
      return str;
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
    },
    onClearSelected() {
      this.selectedRowKeys = [];
      this.selectionRows = [];
    },
    searchQuery() {
      this.loadData(1);
    },
    superQuery() {
      this.$refs.superQueryModal.show();
    },
    searchReset() {
      this.queryParam = {}
      this.loadData(1);
    },
    batchDel: function () {
      if (!this.url.deleteBatch) {
        this.$message.error("请设置url.deleteBatch属性!")
        return
      }
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！');
        return;
      } else {
        var ids = "";
        for (var a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ",";
        }
        var that = this;
        this.$confirm({
          title: "确认删除",
          content: "是否删除选中数据?",
          onOk: function () {
            that.loading = true;
            deleteAction(that.url.deleteBatch, { ids: ids }).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.loadData();
                that.onClearSelected();
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.loading = false;
            });
          }
        });
      }
    },
    //onlyoffice在线编辑
    handleOnlyofficeEdit(record) {
      // alert(1);
      let onlyofficeUrl = this.$router.resolve({
        name: 'Onlyoffice',
        query: {
          id: record.id,
          updateTime: record.updateTime,
          fileUrl: record.template,
          filePath: record.template,
          ot: 'edit',
          token: this.accessToken,
        },
      })
      window.open(onlyofficeUrl.href, '_blank')
    },
    handleDelete: function (id) {
      if (!this.url.delete) {
        this.$message.error("请设置url.delete属性!")
        return
      }
      var that = this;
      deleteAction(that.url.delete, { id: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData();
        } else {
          that.$message.warning(res.message);
        }
      });
    },
    handleEdit: function (record, title) {
      this.$refs.modalForm.title = title || "编辑";
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAdd: function (title) {
      // if(title instanceof MouseEvent) 
      if (typeof title == "string") {
        this.$refs.modalForm.title = title || "新增";
      } else {
        this.$refs.modalForm.title = "新增";
      }
      this.$refs.modalForm.add();
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAdjust: function (record, title) {
      this.$refs.modalForm.title = title || "调整";
      this.$refs.modalForm.adjust(record);
      this.$refs.modalForm.disableSubmit = false;
    },
    handleSend: function (record, title) {
      this.$refs.modalForm.title = title || "提成发放";
      this.$refs.modalForm.send(record);
      this.$refs.modalForm.disableSubmit = false;
    },
    handleEditNew: function (record, title) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = title;
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAddNew: function (tittle) {
      this.$refs.modalForm.add();
      this.$refs.modalForm.title = tittle;
      this.$refs.modalForm.disableSubmit = false;
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field;
        this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
      }
      this.ipagination = pagination;
      this.loadData();
    },
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus;
    },
    // 给popup查询使用(查询区域不支持回填多个字段，限制只返回一个字段)
    getPopupField(fields) {
      return fields.split(',')[0]
    },
    modalFormOk() {
      // 新增/修改 成功时，重载列表
      this.loadData();
      //清空列表选中
      this.onClearSelected()
    },
    handleDetail: function (record, title) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = title || "详情";
      this.$refs.modalForm.disableSubmit = true;
    },
    handleDetailNew: function (record, title) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = title;
      this.$refs.modalForm.disableSubmit = true;
    },
    /* 导出 */
    handleExportXls2() {
      let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()));
      let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`;
      window.location.href = url;
    },
    handleExportXls(fileName) {
      if (!fileName || typeof fileName != "string") {
        fileName = "导出文件"
      }
      let param = this.getQueryParams();
      if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {
        param['selections'] = this.selectedRowKeys.join(",")
      }
      console.log("导出参数", param)
      downFile(this.url.exportXlsUrl, param).then((data) => {
        if (!data) {
          this.$message.warning("文件下载失败")
          return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), fileName + '.xls')
        } else {
          let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('download', fileName + '.xls')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link); //下载完成移除元素
          window.URL.revokeObjectURL(url); //释放掉blob对象
        }
      })
    },
    /* 导入 */
    handleImportExcel(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          // this.$message.success(`${info.file.name} 文件上传成功`);
          if (info.file.response.code === 201) {
            let { message, result: { msg, fileUrl, fileName } } = info.file.response
            let href = window._CONFIG['domianURL'] + fileUrl
            this.$warning({
              title: message,
              content: (<div>
                <span>{msg}</span><br />
                <span>具体详情请 <a href={href} target="_blank" download={fileName}>点击下载</a> </span>
              </div>
              )
            })
          } else {
            this.$message.success(info.file.response.message || `${info.file.name} 文件上传成功`)
          }
          this.loadData()
        } else {
          this.$message.error(`${info.file.name} ${info.file.response.message}.`);
        }
      } else if (info.file.status === 'error') {
        if (info.file.response.status === 500) {
          let data = info.file.response
          const token = Vue.ls.get(ACCESS_TOKEN)
          if (token && data.message.includes("Token失效")) {
            this.$message.warning("登录已过期，正在退出登录...");
            // Modal.error({
            //   title: '登录已过期',
            //   content: '登录已过期，正在退出登录...',
            //   okText: '重新登录',
            //   mask: false,
            //   onOk: () => {
            store.dispatch('Logout').then(() => {
              Vue.ls.remove(ACCESS_TOKEN)
              window.location.reload();
            })
            //   }
            // })
          }
        } else {
          this.$message.error(`文件上传失败: ${info.file.msg} `);
        }
      }
    },
    /* 图片预览 */
    getImgView(text) {
      if (text && text.indexOf(",") > 0) {
        text = text.substring(0, text.indexOf(","))
      }
      return getFileAccessHttpUrl(text)
    },
    /* 缩略图地址 */
    getImgThumbnailUrl(text) {
      var url = getImageThumbnailUrl(text)
      return getFileAccessHttpUrl(url)
    },
    /* 文件下载 */
    // update--autor:lvdandan-----date:20200630------for：修改下载文件方法名uploadFile改为downloadFile------
    downloadFile(text) {
      console.log('text', text)
      if (!text) {
        this.$message.warning("未知的文件")
        return;
      }
      if (text.indexOf(",") > 0) {
        text = text.substring(0, text.indexOf(","))
      }
      let url = getFileAccessHttpUrl(text)
      window.open(url);
    },
    /* 文件预览 */
    async previewFile(text) {
      if (!text) {
        this.$message.warning("未知的文件")
        return;
      }
      if (text.indexOf(",") > 0) {
        text = text.substring(0, text.indexOf(","))
      }
      var url = await getFilePreviewUrl(text);
      if ((url && typeof url === "string") && (url.toLowerCase().startsWith("http") || url.toLowerCase().startsWith("https")))
        window.open(url, '_blank')
    }
  }
}