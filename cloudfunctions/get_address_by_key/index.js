// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event ==> ", event);

  return await db.collection('address').where({
      // 查询的参数从调用云函数的时候进行传递的参数来进行获取

      // 用户信息
      userInfo: event.userInfo,
      // 是否是默认地址
      [event.key]: event.value
  }).get();
}