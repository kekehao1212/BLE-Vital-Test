//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    bluetoothInfo: undefined,
    testPanel: false,
    scoreList: [],
    highScore: undefined
  },

  deviceId: undefined,
  serviceId: '0000FFE0-0000-1000-8000-00805F9B34FB',
  characteristicId: '0000FFE1-0000-1000-8000-00805F9B34FB',
  bluetooth: undefined,
  bluetoothAvailable: undefined,
  bluetoothDiscovering: undefined,
  

  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    console.log(options.deviceId)
    var scene = decodeURIComponent(options.scene)
    this.deviceId = options.deviceId
    console.log('load once')
  },

  onReady: function () {
    var that = this
    if (!this.deviceId) {
      wx.showModal({
        title: '请先扫描测试仪上的二维码',
        showCancel: 'false'
      })
    }
    else {
      this.BLUETOOTH_OPEN()
    }
  },
  onShow: function(res) {

  },

  SCAN_CODE: function () {
    console.log('scan code')
    wx.scanCode({
      success: (res) => {
        console.log(res)
        this.deviceId = res.path.substr(res.path.search('deviceId') + 1 + 'deviceId'.length, 17)
        if(this.deviceId) {
          this.BLUETOOTH_OPEN()
        }
      }
    })
  },
  // onHide: function () {
  //   this.CLOSE_CONNECTION()
  // },
  CLOSE_CONNECTION() {
    if(this.deviceId === undefined || this.deviceId === null) {
      return
    }
    wx.closeBluetoothAdapter({
      success: function(res) {
        console.log('close adapter')
      },
    })
    wx.closeBLEConnection({
      deviceId: this.deviceId,
      success: function(res) {
        console.log('close Connection')
      },
    })
  },



  OPEN_TEST_PANEL () {
    var op = !this.data.testPanel
    this.setData({
      'testPanel': op
    })
  },
  SHOW_LOADING (str) {
    console.log(str)
    wx.showLoading({
      title: str
    })
  },

  HIDE_LOADING () {
    wx.hideLoading()
  },

  BLUETOOTH_STATE_CHANGE () {
    wx.onBluetoothAdapterStateChange((res) => {
      if (res.available && !this.bluetoothAvailable) {
        console.log('bluetooth is available')
        this.BLUETOOTH_OPEN()
      }
    })
  },

  BLUETOOTH_STOP_DISCOVERY () {
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        console.log('stop discovery', res)
      },
    })
  },

  BLUETOOTH_OPEN () {
    this.SHOW_LOADING('初始化蓝牙适配器...')
    wx.openBluetoothAdapter({
      success: (res) => {
        this.HIDE_LOADING()
        console.log('bluetooth open',res)
        this.bluetoothAvailable = true
        this.SHOW_LOADING('连接测试仪...')
        this.CREATE_BLE_CONNECTION()
      },
      fail: (res) => {
        this.HIDE_LOADING()
        this.BLUETOOTH_STATE_CHANGE()
        if(res.errCode == 10001) {
          wx.showModal({
            title: '蓝牙初始化失败',
            content: '请确认蓝牙是否打开',
            showCancel: false
          })
        }
      }
    })
  },

  BLUETOOTH_TEST () {
    wx.getBluetoothAdapterState({
      success: (res) => {

      },
      fail: (res) => {
        console.log('test fail', res)
      }
    })
  },


  BLUETOOTH_DISCOVERY () {
    wx.startBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('isdiscoering', res)
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  BLUETOOTO_GET_DEVICES () {
    wx.getBluetoothDevices({
      success: (res) => {
        console.log(res)
      }
    })
  },

  GET_CONNECTED_BLE_SERVICES () {
    wx.getBLEDeviceServices({
      deviceId: this.deviceId,
      success: (res) => {
        console.log('get connected device serivces', res)
      }
    })
  },

  CREATE_BLE_CONNECTION () {
    var that = this
    console.log(that.deviceId)
    wx.createBLEConnection({
      deviceId: this.deviceId,
      success: (res) => {
        this.HIDE_LOADING()
        console.log('connect success', res)
        this.SHOW_LOADING('打开监听事件')
        this.OPEN_NOTIFY()
      },
      fail: (res) => {
        this.HIDE_LOADING()
        wx.showModal({
          title: '连接出现错误',
          content: '测试仪可能正在被使用',
          showCancel: false,
          success: (res) => {
            if(res.confirm) {
              setTimeout(() => {
                this.SHOW_LOADING('连接测试仪...')
                this.CREATE_BLE_CONNECTION()
              }, 3000)
            }
          }
        })
        console.log('connec fail', res)
      }
    })
  },
  GET_CONNECTED_BLE_CHARACTERISTICS () {
    wx.getBLEDeviceCharacteristics({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      success: (res) => {
        console.log('get characteristics',res)
      }
    })
  },
  READ_CHARACTERISTICS_VALUE () {
    var that = this
    wx.readBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      success: (res) => {
        console.log('read characteristic', res)
      }
    })
  },
  OPEN_NOTIFY () {
    wx.notifyBLECharacteristicValueChange({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      state: true,
      success: (res) => {
        console.log('open notify',res)
        this.OPEN_MONITOR()
      }
    })
    this.HIDE_LOADING()
  },
  OPEN_MONITOR () {
    var that = this
    wx.onBLECharacteristicValueChange((characteristic) => {
      console.log('characteristic value comed:')
      let buffer = characteristic.value
      let uint = new Uint8Array(buffer)
      for (let i = 0; i < uint.length; i++) {
        console.log(uint[i], uint[i].toString(16),String.fromCharCode(uint[i]))
      }
      let str = String.fromCharCode(...(new Uint8Array(buffer)))
      console.log(str)
      that.setData({
        'bluetoothInfo': str.slice(7,str.length)
      })
      this.GET_SCORE()
    })
    wx.showModal({
      title: '连接成功',
      content: '请开始测试',
      showCancel: false
    })
  },
  GET_SCORE () {
    let scoreList = this.data.scoreList
    scoreList.push(this.data.bluetoothInfo)
    let highScore = Math.max(...scoreList)
    console.log(highScore)
    this.setData({
      'scoreList': scoreList,
      'highScore': highScore
    })
    console.log(this.data.highScore)
    if (scoreList.length == 3) {
      wx.showModal({
        title: '测试结束',
        content: '完成三次测试，请提交测试结果',
        showCancel: false,
        success: (res) => {
          if(res.confirm) {
            this.CLOSE_CONNECTION()
          }
        }
      })
    }
  },
  
  WIRTE_VALUE (str) {
    let buffer = new ArrayBuffer(str.length)
    let dataView = new DataView(buffer)
    for(let i = 0; i < str.length; i++) {
      dataView.setUint8(i, str.charCodeAt(i))
    }
    let uint8 = new Uint8Array(buffer)
    console.log("发送的数据：",uint8)

    wx.writeBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      value: buffer,
      success: (res) => {
        console.log('write info',res)
        this.READ_CHARACTERISTICS_VALUE()
      }
    })
  },
  RESET_DEVICE () {
    this.WIRTE_VALUE('AT+RESET')
  }
})
