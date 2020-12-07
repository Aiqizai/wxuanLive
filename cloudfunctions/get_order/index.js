// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

let db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
    return await db.collection('order').where({
      address: {
        userInfo: event.userInfo
      }
    }).orderBy('date', 'desc').skip(event.offset).limit(event.count).get();

    // orderBy(fieldPath: string , string: order) (要排序的字段, asc升序/desc降序)
    // skip(number) 指定查询返回结果时从指定序列后的结果开始返回，常用于分页
    // limit(number) 指定查询结果集数量上限
}