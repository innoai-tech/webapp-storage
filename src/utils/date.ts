import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
dayjs.extend(duration)
export const toHourTime = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM-DD HH")
      : dayjs.unix(Number(value)).format("YYYY-MM-DD HH")
    : "--"
}

export const toFullDate = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM-DD HH:mm")
      : dayjs.unix(Number(value)).format("YYYY-MM-DD HH:mm")
    : "--"
}

export const toFullTime = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
      : dayjs.unix(Number(value)).format("YYYY-MM-DD HH:mm:ss")
    : "--"
}
export const toFullTimeFromUnixTime = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
      : dayjs.unix(Number(value)).format("YYYY-MM-DD HH:mm:ss")
    : "--"
}
export const toDate = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM-DD")
      : dayjs.unix(Number(value)).format("YYYY-MM-DD")
    : "--"
}
export const toMonth = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("YYYY-MM")
      : dayjs.unix(Number(value)).format("YYYY-MM")
    : "--"
}
export const toTime = (value: string | number | undefined) => {
  return value
    ? isNaN(Number(value))
      ? dayjs(value).format("HH:mm:ss")
      : dayjs.unix(Number(value)).format("HH:mm:ss")
    : "--"
}

//储存策略的时间转换
export const toTimeNumber = (value: string) => {
  const dayList = value.split("d")
  const day = dayList[0] ? Number(dayList[0]) * 24 * 60 * 1000 : 0
  const hourList = dayList[1].split("h")
  const hour = hourList[0] ? Number(hourList[0]) * 60 * 1000 : 0
  const minute = Number(hourList[1].split("m")[0]) * 1000
  return day + hour + minute
}

/// 转换unix时间戳间隔。转换成使用 x时x分x秒 来表示
export const toChineseTimeInterval = (ss: number | string): string => {
  const s = typeof ss === "string" ? Number(ss) : ss
  const days = Math.floor(s / (60 * 60 * 24))
  const hours = Math.floor((s % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((s % (60 * 60)) / 60)
  const seconds = Math.floor(s % 60)

  let output = ""

  if (days) {
    output += String(days) + "天"
  }

  if (hours) {
    output += String(hours) + "时"
  }

  if (minutes) {
    output += String(minutes) + "分"
  }

  if (seconds) {
    output += String(seconds) + "秒"
  }
  return output
}
export const toDiffTime = (startTime: number | string, endTime: number | string) => {
  const unixNumberStart = isNaN(Number(endTime)) ? dayjs(startTime).unix() : Number(startTime)
  const unixNumberEnd =
    !endTime || endTime === "0"
      ? dayjs().unix()
      : isNaN(Number(endTime))
      ? dayjs(startTime).unix()
      : Number(endTime)
  const duration = dayjs.duration((unixNumberEnd - unixNumberStart) * 1000)
  return `${duration.days()}天${duration.hours()}小时${duration.minutes()}分钟${duration.seconds()}秒`
}
