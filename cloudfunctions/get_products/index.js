// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 数据库引用
let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  // event: 含有携带的参数，用户id
  console.log('event =>', event);

  // where 查询条件

  return await db.collection('products').where({
    type: event.type
  }).get()
}