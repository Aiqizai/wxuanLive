// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //生成加入购物车时间
  let currentDate = new Date();

  event.time = currentDate;

  return await db.collection('shopcart').add({
    data: event
  });
}