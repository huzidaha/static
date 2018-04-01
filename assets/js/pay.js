var api = function (route) {
  return '/api/react-books' + route
}

var init = function () {
  initGrantedCheck()
  initPreventSave()
  initTryToBuy()
  initEnterReadCode()
}

var initGrantedCheck = function () {
  var check = function () {
    checkIsGranted(function (isGranted) {
      if (!isGranted) showNotGranted()
    })
    setTimeout(check, 5000)
  }
  check()
}

var checkIsGranted = function (callback) {
  var info = getReaderInfo()
  if (!info || !info.email || !info.readCode) return callback(false)
  $.ajax({
    url: api('/checkIfGranted/' + info.email + '/' + info.readCode),
    type: 'GET',
    success: function (data) {
      callback(data.data)
    },
    error: function (err) {
      console.log(err)
    }
  })
}

var getReaderInfo = function () {
  try {
    return JSON.parse(localStorage.getItem('reader'))
  } catch (e) {
    return null
  }
}

var setReaderInfo = function (email, readCode) {
  try {
    return localStorage.setItem('reader', JSON.stringify({
      email: email,
      readCode: readCode
    }))
  } catch (e) {
    return null
  }
}

var alert = window.alert
var maskTemplate = $("#mask-template").remove().html()
var randomId = function () {
  var len = randomInt()
  var id = ''
  for (var i = 0; i < len; i++) {
    id += randomPick('qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXC_VBNM1234567890-')
  }
  return '#' + id
}

var randomInt = function () {
  return 2 + Math.floor(Math.random() * 10)
}

var randomPick = function (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

var maskId = ''

var showNotGranted = function () {
  var oldMaskId = maskId
  maskId = randomId()
  var $mask = $(maskTemplate)
  $mask.css({
    position: 'fixed',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    top: 0,
    left: 0,
  })
  $mask.attr('id', maskId.replace('#', ''))
  $(document.body).append($mask)
  if (oldMaskId) $(oldMaskId).remove()
  $('#granted-modal').show()
}

var initPreventSave = function () {
  $(window).on('keydown', function (event) {
    if (event.ctrlKey && event.keyCode === 83) {
      event.preventDefault()
      window.location.href = 'http://baidu.com'
    }
    if (event.metaKey && event.keyCode === 83) {
      event.preventDefault()
      window.location.href = 'http://baidu.com'
    }
  })
}

var initTryToBuy = function () {
  var $readcodeArea = $('#readcode-input-area')
  var $tryToBuyArea = $('#try-to-buy')
  $('#buy-now').on('click', function () {
    $readcodeArea.hide()
    $tryToBuyArea.show()
  })
  $('#back-to-input').on('click', function () {
    $tryToBuyArea.hide()
    $readcodeArea.show()
  })
  $('#alipay').on('click', function () {
    var email = $('#reader-email').val()
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email)) {
      showErrorMessageFor('#reader-email', '请输入正确的邮箱地址')
    } else {
      hideErrorMessageFor('#reader-email')
      $('#back-to-input').click()
      $('#email').val(email)
      $('#read-code').focus()
      window.open(api('/alipay/' + email))
    }
  })
}

var initEnterReadCode = function () {
  var $email = $('#email')
  var $readCode = $('#read-code')
  $('#check-granted').on('click', function () {
    setReaderInfo($email.val(), $readCode.val())
    checkIsGranted(function (isGranted) {
      if (isGranted) {
        $(maskId).remove()
        $('#granted-modal').hide()
      } else {
        showErrorMessageFor('#email', '邮箱或者阅读码不正确')
      }
    })
  })
  $('#get-read-code-form, #read-code-form').on('submit', function (event) {
    event.preventDefault()
  })
}

var isChapter3 = function () {
  var lesson = window.location.href.match(/lesson(\d+)/)
  if (lesson && lesson[1] * 1 >= 28) {
    return true
  } else {
    return false
  }
}

function showErrorMessageFor (el, message) {
  var $el = $(el)
  var $message = $el.parent().find('.error-message')
  if ($message.length === 0) {
    $message = $('<span class="error-message"></span>')
    $el.parent().append($message)
  }
  $message.text(message)
  $message.show()
}

function hideErrorMessageFor (el, message) {
  var $el = $(el)
  var $message = $el.parent().find('.error-message')
  $message.hide()
}

if (isChapter3()) init()
