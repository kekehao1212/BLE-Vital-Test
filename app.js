//app.js
App({
  onLaunch: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    wx.getSystemInfo({
      success: (res) => {
        if (res.brand == 'iPhone') {
          this.device = 'iphone'
        } else {
          this.device = 'android'
        }
      },
    })
    setTimeout(() => {
      wx.hideLoading()
      this.showActionSheet()
    }, 500)
  },
  onShow: () => {

  },
  showModal() {
    wx.showModal({
      title: '请选择操作软件',
      content: '选择软件后进行操作',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          this.showActionSheet()
        }
      }
    })
  },

  showActionSheet() {
    wx.showActionSheet({
      itemList: ['学生操作软件', '教师操作软件', '管理员操作软件'],
      success: (res) => {
        if (res.tapIndex == 0) {
          this.studentLogin()
        } else if (res.tapIndex == 1) {
          wx.reLaunch({
            url: '../teacherHome/teacherHome',
          })
        } else {
          wx.reLaunch({
            url: '../adminHome/adminHome',
          })
        }
      },
      fail: (res) => {
        this.showModal()
      }
    })
  },
  studentLogin() {
    wx.showLoading({
      title: '正在加载个人信息',
      mask: true
    })
    wx.login({
      success: (res) => {
        const code = res.code;
        wx.request({
          url: `${this.url}/wx/student/login`,
          header: { WX_CODE: code },
          method: 'POST',
          data: {},
          success: (res) => {
            console.log(res)
            wx.hideLoading()
            this.sessionId = res.header.WX_SESSION_ID;
            console.log(this.sessionId)
            if (!res.data.student) {
              wx.reLaunch({
                url: '../signUp/signUp',
              })
              return
            }
            this.student = res.data.student
            this.getTeacher()
          }
        })
      }
    })
  },

  getTeacher() {
    wx.showLoading({
      title: '正在加载教师信息',
      mask: true
    })
    wx.request({
      url: `${this.url}/wx/student/supervisor/my`,
      method: 'GET',
      header: { WX_SESSION_ID: this.sessionId },
      success: (res) => {
        console.log(res)
        wx.hideLoading()
        if (res.statusCode == 404) {
          wx.reLaunch({
            url: '../chooseHappening/chooseHappening',
          })
        } else {
          this.myTeacher = res.data
        }
      }
    })
  },
  device: undefined,
  serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
  sessionId: undefined,
  student: undefined,
  myTeacher: undefined,
  userIdentity: 'student',
  characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB',
  url: 'https://wx.acoder.me',
  longitude: undefined,
  latitude: undefined,
  globalData: {
    currentPage: undefined,
    student: undefined
  }
})