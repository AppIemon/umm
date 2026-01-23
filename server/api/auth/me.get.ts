export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'auth_user')
  if (!cookie) return null

  try {
    return JSON.parse(cookie)
  } catch (e) {
    return null
  }
})
