// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

    // 根据用户信息查询对应的地址信息
    return await db.collection('address').where({
      userInfo: event.userInfo
    }).get()
}