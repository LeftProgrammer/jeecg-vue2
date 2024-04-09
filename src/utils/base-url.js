
/**
 * 【指定 axios的 baseURL】
 * 如果手工指定 baseURL: '/jeecg-boot'
 * 则映射后端域名，通过 vue.config.js
 * @type {*|string}
 */
let apiBaseUrl = window._CONFIG['domianURL'] || "/jeecg-boot";
console.log("apiBaseUrl= ", apiBaseUrl)

// 科创url
let techInnovateApi = 'http://125.65.36.13:9311/jeecg-boot'


export {
    apiBaseUrl as baseApi,
    techInnovateApi
}
