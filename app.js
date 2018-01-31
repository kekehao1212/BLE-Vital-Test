//app.js
import loading from './state/loading'
var amapFile = require('./utils/amap-wx.js')
App({
  onLaunch() {
    this.longitude = undefined
    this.latitude = undefined
  },
  onShow() {
    ;(!this.student || !this.myTeacher) && !this.signUping
      ? this.getCertificate()
      : null
  },
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res.code)
        },
        fail: res => {
          reject('get code error')
        }
      })
    })
  },
  loginFail() {
    loading.hideLoading()
    wx.showModal({
      title: '登录失败',
      content: '请稍后重试',
      showCancel: false
    })
  },
  codeLogin() {
    this.wxLogin()
      .then(code => {
        this.studentLogin({
          WX_CODE: code
        })
          .then(sessionId => {
            wx.setStorage({
              key: 'sessionId',
              data: sessionId
            })
          })
          .catch(res => {
            this.loginFail()
          })
      })
      .catch(res => {
        this.loginFail()
      })
  },
  getCertificate() {
    loading.showLoading(' 正在加载个人信息...', true)
    var sessionId
    var sessionId = wx.getStorageSync('sessionId')
    console.log('storage', sessionId)
    if (!sessionId) {
      this.codeLogin()
    } else {
      this.studentLogin({
        WX_SESSION_ID: sessionId
      })
        .then(res => {})
        .catch(res => {
          if (res === 'needCode') {
            this.codeLogin()
          }
        })
    }
  },
  studentLogin(header) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.url}/wx/student/login`,
        header: header,
        method: 'POST',
        data: {},
        success: res => {
          console.log(res)
          if (res.header.WX_SESSION_ID) {
            resolve(res.header.WX_SESSION_ID)
          } else {
            reject('needCode')
            return
          }
          loading.hideLoading()
          this.sessionId = res.header.WX_SESSION_ID
          console.log(this.sessionId)
          if (!res.data.student) {
            this.signUping = true
            wx.reLaunch({
              url: '../signUp/signUp'
            })
            return
          }
          this.student = res.data.student
          this.getTeacher()
        }
      })
    })
  },

  getTeacher() {
    loading.showLoading('正在加载教师信息', true)
    wx.request({
      url: `${this.url}/wx/student/supervisor/my`,
      method: 'GET',
      header: { WX_SESSION_ID: this.sessionId },
      success: res => {
        loading.hideLoading()
        if (res.statusCode === 404) {
          wx.reLaunch({
            url: '../chooseHappening/chooseHappening'
          })
        } else {
          this.myTeacher = res.data
        }
      }
    })
  },

  authorFail() {
    wx.showModal({
      title: '警告',
      content:
        '您之前拒绝授权，将无法正常使用该功能，若要使用该功能，请重新授权小程序',
      success: res => {
        if (res.confirm) {
          wx.openSetting({
            success: res => {
              if (res.authSetting['scope.userLocation']) {
                this.Location()
              } else {
                wx.reLaunch({
                  url: '../home/home'
                })
              }
            }
          })
        } else {
          wx.reLaunch({
            url: '../home/home'
          })
        }
      }
    })
  },

  getLocation() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation'] === undefined) {
          wx.showModal({
            title: '提示',
            content:
              '为了使用该功能，请接下来授权小程序获取您的位置信息，拒绝授权将无法正常使用',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.authorize({
                  scope: 'scope.userLocation',
                  success: res => {
                    this.Location()
                  },
                  fail: res => {
                    this.authorFail()
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] === false) {
          this.authorFail()
        } else {
          this.Location()
        }
      }
    })
  },

  Location() {
    loading.showLoading('正在定位...', true)
    if (!this.latitude || !this.longitude) {
      var myMap = new amapFile.AMapWX({
        key: 'accc413a9ef333ef7a5d79e659274a03'
      })
      var timeout = setTimeout(() => {
        wx.showModal({
          title: '请打开wifi加快定位获取',
          showCancel: false
        })
      }, 6000)
      myMap.getRegeo({
        success: res => {
          clearTimeout(timeout)
          console.log(res)
          this.latitude = res[0].latitude
          this.longitude = res[0].longitude
          loading.hideLoading()
        },
        fail: res => {
          wx.getLocation({
            success: res => {
              this.latitude = res.latitude
              this.longitude = res.longitude
            }
          })
          loading.hideLoading()
        }
      })
    } else {
      loading.hideLoading()
    }
  },

  device: undefined,
  serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
  // serviceId: '000000EE-0000-1000-8000-00805F9B34FB',
  sessionId: undefined,
  student: undefined,
  myTeacher: undefined,
  characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB',
  // characteristicId: '0000EE01-0000-1000-8000-00805F9B34FB',
  url: 'https://wx.acoder.me',
  longitude: undefined,
  latitude: undefined,
  signUping: undefined,
  globalData: {
    currentPage: undefined,
    receivedPackage: []
  }
})
