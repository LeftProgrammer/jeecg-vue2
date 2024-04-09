import Vue from 'vue'
import {
	axios, ThreeData
} from '@/utils/request'

const api = {
	user: '/mock/api/user',
	role: '/mock/api/role',
	service: '/mock/api/service',
	permission: '/mock/api/permission',
	permissionNoPager: '/mock/api/permission/no-pager'
}

export default api

//获取 科创的数据请求方式
export function getThreeData(url, params, method = 'get') {
	return ThreeData.request({
		url: url,
		method: method,
		data: params,
		timeout: 15000,
		headers: {
			'X-Access-Token': sessionStorage.threeToken
		},
	})
}



//post
export function postAction(url, parameter) {
	return axios({
		url: url,
		method: 'post',
		data: parameter
	})
}

//post method= {post | put}
export function httpAction(url, parameter, method) {
	return axios({
		url: url,
		method: method,
		data: parameter
	})
}

//put
export function putAction(url, parameter) {
	return axios({
		url: url,
		method: 'put',
		data: parameter
	})
}

//get
export function getAction(url, parameter) {
	return axios({
		url: url,
		method: 'get',
		params: parameter
	})
}

//deleteAction
export function deleteAction(url, parameter) {
	return axios({
		url: url,
		method: 'delete',
		params: parameter
	})
}

export function getUserList(parameter) {
	return axios({
		url: api.user,
		method: 'get',
		params: parameter
	})
}

export function getRoleList(parameter) {
	return axios({
		url: api.role,
		method: 'get',
		params: parameter
	})
}

export function getServiceList(parameter) {
	return axios({
		url: api.service,
		method: 'get',
		params: parameter
	})
}

export function getPermissions(parameter) {
	return axios({
		url: api.permissionNoPager,
		method: 'get',
		params: parameter
	})
}

// id == 0 add     post
// id != 0 update  put
export function saveService(parameter) {
	return axios({
		url: api.service,
		method: parameter.id == 0 ? 'post' : 'put',
		data: parameter
	})
}

/**
 * 下载文件 用于excel导出
 * @param url
 * @param parameter
 * @returns {*}
 */
export function downFile(url, parameter) {
	return axios({
		url: url,
		params: parameter,
		method: 'get',
		responseType: 'blob'
	})
}

/**
 * 下载文件
 * @param url 文件路径
 * @param fileName 文件名
 * @param parameter
 * @returns {*}
 */
export function downloadFile(url, fileName, parameter) {
	return downFile(url, parameter).then((data) => {
		if (!data || data.size === 0) {
			Vue.prototype['$message'].warning('文件下载失败')
			return
		}
		if (typeof window.navigator.msSaveBlob !== 'undefined') {
			window.navigator.msSaveBlob(new Blob([data]), fileName)
		} else {
			let url = window.URL.createObjectURL(new Blob([data]))
			let link = document.createElement('a')
			link.style.display = 'none'
			link.href = url
			link.setAttribute('download', fileName)
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link) //下载完成移除元素
			window.URL.revokeObjectURL(url) //释放掉blob对象
		}
	})
}

/**
 * 文件上传 用于富文本上传图片
 * @param url
 * @param parameter
 * @returns {*}
 */
export function uploadAction(url, parameter) {
	return axios({
		url: url,
		data: parameter,
		method: 'post',
		headers: {
			'Content-Type': 'multipart/form-data', // 文件上传
		},
	})
}

/**
 * 获取文件服务访问路径
 * @param avatar
 * @param subStr
 * @returns {*}
 */
export function getFileAccessHttpUrl(avatar, name, subStr) {
	if (!subStr) subStr = 'http'
	try {
		let path = avatar;
		if (avatar && avatar.startsWith(subStr)) {

		} else {
			if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
				path = window._CONFIG['staticDomainURL'] + "/" + avatar;
			}
		}
		if (name) {
			if (path.indexOf("?") == -1) {
				path += "?filename=" + name;
			} else {
				path += "&filename=" + name;
			}
		}
		return path;
	} catch (err) {
		return;
	}
}

/**
 * 获取文件服务预览路径
 * @param text
 * @param subStr
 * @returns {*}
 */
export async function getFilePreviewUrl(text, subStr) {
	try {
		var url = "/eoa/filemanage/api/doPreviewByPath"
		var parameter = {
			path: text
		}
		var res = await axios({
			url: url,
			method: 'get',
			params: parameter
		})
		if (res.success)
			return res.result
		else {
			console.error(res.message)
			return ""
		}
	} catch (err) {
		console.log(err)
		// alert('请求出错！')
	}
}

//获取天气情况
export function getTianqiData2() {
	// var url = "https://ops.mlogcn.com/qxcm-construction/api/alarm/point/weather/api1?lon=118.391785&lat=31.619263";
	var url =
		'https://ops.mlogcn.com/qxcm-construction/api/alarm/point/weather/api1?lon=114.331718&lat=30.588306' //114.331718,30.588306
	return axios.request({
		url: url, //'https://www.tianqiapi.com/api/?version=v1&city=和县&appid=15364454&appsecret=uIaOvd5V',
		method: 'get',
	})
}
//获取天气情况
export function getTianqiData() {
	var url = 'https://restapi.amap.com/v3/weather/weatherInfo?city=420106&key=d87c59a94d83278851da91218397744d'
	return axios.request({
		url: url, //'https://www.tianqiapi.com/api/?version=v1&city=和县&appid=15364454&appsecret=uIaOvd5V',
		method: 'get',
	})
}
