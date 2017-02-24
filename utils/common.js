export const getDayCountOfMonth = function(year, month) {
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  if (month === 1) {
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
      return 29;
    } else {
      return 28;
    }
  }

  return 31;
};

export const isDayInSelectedDays = function(date,selectedDays){
  let isIn = false;
  date = date.getTime();
  for(let i = 0;i < selectedDays.length;i++){
    let selectItem = selectedDays[i];
    isIn = selectItem.length == 1 ? date === selectItem[0] : date >= selectItem[0] && date <= selectItem[1];
    if(isIn){
      break;
    }
  }
  return isIn;
};

export const formatDate = (value, format) => {
  let curDate = new Date(value);
  const o = {
    'M+': curDate.getMonth() + 1, // 月份
    'd+': curDate.getDate(), // 日
    'h+': curDate.getHours(), // 小时
    'm+': curDate.getMinutes(), // 分
    's+': curDate.getSeconds(), // 秒
    'q+': Math.floor((curDate.getMonth() + 3) / 3), // 季度
    'S': curDate.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (curDate.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  }
  return format;
};

export const DAY_DURATION = 86400000;