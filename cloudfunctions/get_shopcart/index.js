// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

// 获取数据库查询指令引用
let _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  //获取当前时间
  let currentTime = new Date().getTime() - 30 * 60 * 1000;

  let currentDate = new Date(currentTime);

  // 查询距离当前时间的半小时内购物车数据，集合的shopcart的time字段 >= currentDate
  // userInfo 查询是哪一个用户
  return await db.collection('shopcart').where({
    time: _.gte(currentDate),
    userInfo: event.userInfo
  }).get();
}