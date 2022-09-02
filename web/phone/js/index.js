var show = false;
var _clearInterval = false;

var incoming_call_sound = new Audio(
  "../phone/sounds/phone-calling-incoming.mp3"
);
var outcoming_call_sound = new Audio(
  "../phone/sounds/phone-calling-outcoming.mp3"
);
var busy_sound = new Audio("../phone/sounds/phone-busy.mp3");

var message_sound = new Audio("../phone/sounds/phone-message-sound.mp3");

$(document).ready(function () {
  setInterval(() => initDate(), 1000);
});

var day;
var day_numeric;
var mon;
var time;

function initDate() {
  const days = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ];
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const date = new Date();
  day_numeric = date.getDate();
  day = days[date.getDay() - 1];
  mon = months[date.getMonth()];
  time = date.toLocaleTimeString().substring(0, 5);
  $(".time").html(time);
  $("#lock-screen-date").html(day_numeric + " " + mon + " " + day);
}

function showPhone(template) {
  show = true;
  $("body").removeClass("hide");

  if (activeCall) {
    loadContent("active_call");
    return;
  }

  loadContent(!template ? "lock_screen" : template);
}


async function loadContent(content) {
  switch (content) {
    case "lock_screen":
      prepareTemplate("#content", "./templates/tpl_lockscreen.html");
      break;
    case "home":
      prepareTemplate("#content", "./templates/tpl_home.html");
      break;
    case "call_number_pad":
      prepareTemplate("#content", "./templates/tpl_call_number_pad.html");
      break;
    case "outcoming_call":
      callWithNumber(number);
      prepareTemplate("#content", "./templates/tpl_outcoming_call.html");
      break;
    case "incoming_call":
      prepareTemplate("#content", "./templates/tpl_incoming_call.html");
      break;
    case "active_call":
      prepareTemplate("#content", "./templates/tpl_active_call.html");
      break;
    case "busy_call":
      prepareTemplate("#content", "./templates/tpl_busy_call.html");
      break;
    case "bank_home":
      prepareTemplate("#content", "./templates/tpl_bank_home.html");
      break;
  }
}

async function prepareTemplate(target, url) {
  deferredLoad(target, url).then((e) => prepareEventFunctions())
}

async function deferredLoad(target, url) {
  return $.Deferred(function (deferred) {
    $(target).load(url, function () {
      deferred.resolve();
      initDate();
    });
  }).promise();
}

async function prepareEventFunctions() {
  $("#content").ready(function () {
    $(".home-button-zone").click(function () {
      loadContent("home");
    });
  });
}

var number = "";
function inputNumber(num) {
  number = number + "" + num;
  $("#number").html(number);
}

function removeNumber() {
  console.log(number);
  number = number.substring(0, number.length - 1);
  $("#number").html(number);
}

function soundOff() {
  incoming_call_sound.pause();
  outcoming_call_sound.pause();
  busy_sound.pause();
  message_sound.pause();
}

function hidePhone() {
  if (show) {
    soundOff();
    $("body").addClass("hide");
    trigger('client:phone:hide')
    show = false;
  }
}

var notifyTitle, notifyMessage;
function showNotify(title, message) {
  notifyTitle = title;
  notifyMessage = message;
  setTimeout(() => {
    $('.app').append($('<div id="private-notification-wrapper">').load('./templates/tpl_notification.html'));
    removeNotify()
  }, 125)
}


function removeNotify() {
  setTimeout(() => {
    $("#private-notification-wrapper").remove();
  }, 5000);
}

$(document).on("keydown", function (e) {
  if (show) {
    if (e.keyCode == 27 || e.keyCode == 38) {
      hidePhone();
      return !1;
    }
  }
});

function playSound(sound) {
  sound.autoplay = false;
  sound.loop = true;
  sound.play();
}
