const $showLogin = document.querySelector('#show-login')
const $showLogout = document.querySelector('#show-logout')
const $username = document.querySelector('#username')
const $logout = document.querySelector('#logout')

const userInfo = localStorage.getItem('user')
if (userInfo !== null) {
  const user = JSON.parse(userInfo)
  $username.textContent = user.name
  $showLogin.setAttribute('hidden', '')
  $showLogout.removeAttribute('hidden')
  $logout.addEventListener('click', (event) => {
    event.preventDefault()
    localStorage.removeItem('user')
    $showLogin.removeAttribute('hidden')
    $showLogout.setAttribute('hidden', '')
  })
}
