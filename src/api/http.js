
import { postAction, getAction, putAction, deleteAction } from '@/api/manage'

/**
 * 封装 get方法 对应 GET 请求
 * @param {string} url 请求url
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function get(url, params) {
    return getAction(url, params)
}
/**
 * 封装 post 方法，对应 POST 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @param {boolean | undefined} info 请求体是否为 FormData 格式
 * @returns {Promise}
 */
export function post(url, params = {}, info) {
    return postAction(url, params)
}

/**
 * 封装 put 方法，对应 PUT 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function put(url, params = {}) {
    return putAction(url, params)
}

/**
 * 封装 axiosDelete 方法，对应 DELETE 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function axiosDelete(url, params = {}) {
    return deleteAction(url, params)
}
