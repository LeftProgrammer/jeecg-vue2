import Vue from 'vue'
import { ACCESS_TOKEN } from "@/store/mutation-types"
import store from '@/store'
/**
 * 单点登录
 */
const init = (callback) => {
  if (process.env.VUE_APP_SSO === 'true') {
    // 从localStorage中获取存储的访问令牌 (ACCESS_TOKEN)
    let token = Vue.ls.get(ACCESS_TOKEN);
    // 从URL参数中获取服务票据 (ticket，通常是 st 参数)
    let st = getUrlParam("ticket");
    let sevice = "http://" + window.location.host + "/";
    if (token) {
      loginSuccess(callback);
    } else {
      if (st) {
        validateSt(st, sevice, callback);
      } else {
        let serviceUrl = encodeURIComponent(sevice);
        window.location.href = window._CONFIG.casPrefixUrl + "/login?service=" + serviceUrl;
      }
    }
  }else{
    callback && callback()
  }
};
const SSO = {
  init: init
};

function getUrlParam(paraName) {
  let url = document.location.toString();
  let arrObj = url.split("?");

  if (arrObj.length > 1) {
    let arrPara = arrObj[1].split("&");
    let arr;

    for (let i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split("=");

      if (arr !== null && arr[0] === paraName) {
        return arr[1];
      }
    }
    return "";
  }
  else {
    return "";
  }
}

/**
 * 票据验证
 */
function validateSt(ticket,service,callback){
  let params = {
    ticket: ticket,
    service:service
  };
  store.dispatch('ValidateLogin',params).then(res => {
    //this.departConfirm(res)
    if(res.success){
      loginSuccess(callback);
    }else{
      let sevice = "http://"+window.location.host+"/";
      let serviceUrl = encodeURIComponent(sevice);
      window.location.href = window._CONFIG.casPrefixUrl+"/login?service="+serviceUrl;
    }
  }).catch((err) => {
    console.log(err);
    //that.requestFailed(err);
  });
}

function loginSuccess (callback) {
  callback();
}
export default SSO;