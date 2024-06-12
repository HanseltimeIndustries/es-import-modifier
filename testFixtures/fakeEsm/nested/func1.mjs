import { join } from 'path'
import * as _ from 'lodash'

export function someFunction() {
  // use mjs somewhere else
  console.log(join(__dirname, 'wow.mjs'))
  console.log(JSON.stringify(_))
}
