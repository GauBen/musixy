export const listen = async <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K
) =>
  new Promise<HTMLElementEventMap[K]>((resolve) => {
    element.addEventListener(
      eventName,
      (event) => {
        resolve(event)
      },
      {once: true}
    )
  })

export const escape = (string: string) =>
  string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
