/// <reference types="vite/client" />
/// <reference types="@dcloudio/types" />

declare global {
  var uni: {
    reLaunch(options: { url: string }): void
  }
}

export {}
