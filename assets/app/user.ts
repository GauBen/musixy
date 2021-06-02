const item = localStorage.getItem('user')
export const user: {name: string; token: string} =
  item === null ? null : JSON.parse(item)
export const token = user === null ? null : user.token
export const login = (name: string, token: string) => {
  localStorage.setItem('user', JSON.stringify({name, token}))
}
