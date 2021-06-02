import {API} from './app'
import {login} from './user'

const $loginForm: HTMLFormElement = document.querySelector('#login-form')
const $loginUser: HTMLInputElement = document.querySelector('#username')
const $loginPassword: HTMLInputElement = document.querySelector('#password')
const $loginError: HTMLParagraphElement = document.querySelector('#login-error')

$loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const response: {success: boolean; cause?: string; token: string} = await (
    await fetch(`${API}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: $loginUser.value,
        password: $loginPassword.value
      })
    })
  ).json()

  if (response.success) {
    login($loginUser.value, response.token)
    location.href = '.'
    return
  }

  $loginError.hidden = false
  $loginError.innerHTML = response.cause
})

const $registerForm: HTMLFormElement = document.querySelector('#register-form')
const $registerUser: HTMLInputElement = document.querySelector('#new-username')
const $registerPassword: HTMLInputElement = document.querySelector(
  '#new-password'
)
const $registerError: HTMLParagraphElement = document.querySelector(
  '#register-error'
)

$registerForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const response: {success: boolean; cause?: string; token: string} = await (
    await fetch(`${API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: $registerUser.value,
        password: $registerPassword.value
      })
    })
  ).json()

  if (response.success) {
    login($loginUser.value, response.token)
    location.href = '.'
    return
  }

  $registerError.hidden = false
  $registerError.innerHTML = response.cause
})
