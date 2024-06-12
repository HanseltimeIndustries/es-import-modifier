import { join } from 'path'
import * as _ from 'lodash'

export function someFunction2() {
  // use mjs somewhere else
  console.log(join(__dirname, 'wow2.mjs'))
  console.log(JSON.stringify(_))
}
