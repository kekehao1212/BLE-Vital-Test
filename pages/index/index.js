// pages/index/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  toStudent() {
    app.studentLogin()
    // if (app.userIdentity !== 'student') {
    //   wx.showModal({
    //     title: '访问错误',
    //     content: '您无权访问该应用',
    //     showCancel: false
    //   })
    // }
    wx.redirectTo({
      url: '../home/home',
    })
  },


  toTeacher() {
    wx.redirectTo({
      url: '../teacherHome/teacherHome',
    })
    // if (app.userIdentity !== 'teacher') {
    //   wx.showModal({
    //     title: '访问错误',
    //     content: '您无权访问该应用',
    //     showCancel: false
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '../teacherHome/teacherHome'
    //   })
    // }
  },

  toAdmin() {
    wx.redirectTo({
      url: '../adminHome/adminHome',
    })
    // if (app.userIdentity !== 'admin') {
    //   wx.showModal({
    //     title: '访问错误',
    //     content: '您无权访问该应用',
    //     showCancel: false
    //   })
    // } else {
    //   wx.navigateTo({
    //     url: '../adminHome/adminHome'
    //   })
    // }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})