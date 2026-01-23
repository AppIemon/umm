export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth_user')
  return { success: true }
})
