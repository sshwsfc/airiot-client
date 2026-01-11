const noToken = () => ([
  "core/site",
  "core/theme",
  "core/sms",
  "core/auth/login",
  "core/auth/token",
  "core/auth/oauth",
  "core/auth/phone",
  "core/auth/captcha",
  "driver/installInfo",
  "core/auth/license",
  "core/auth/projectToken",
  "core/license/info",
  "core/license/mac",
  "core/media/systemDefaultIcon",
  "core/users/register",
  "core/register/admin",
  "core/register",
  "core/time",
  "core/license/check",
  "core/auth/tag",
  "core/user/setting",
  "driver/driver/schema",
  "driver/driver",
  "driver/driver/list",

])

const noGetToken = () => ([
  "core/message",
  "core/wechat",
  "core/systemVariable",
  "core/catalog"
])

export { noToken, noGetToken }