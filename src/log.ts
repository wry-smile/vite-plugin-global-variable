import chalk from "chalk"
import { name, version } from '../package.json'

export function useLog(prefix: string = `[${name} ${version}]`) {
  const log = console.log
  const { green, red, yellow, white, blue } = chalk

  const compose = (string: string) => `${blue(prefix)} ${string}`

  const error = (text: string) => {
    log(compose(red(text)))
  }

  const success = (text: string) => {
    log(compose(green(text)))
  }

  const info = (text: string) => {
    log(compose(white(text)))
  }

  const warning = (text: string) => {
    log(compose(yellow(text)))
  }

  return {
    error,
    success,
    warning,
    info
  }
}
