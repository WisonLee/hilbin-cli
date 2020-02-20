module.exports = `import { createAction, createActions } from 'redux-actions'
import %constant% from 'constants/modules/buss/%constant%'

const {} = %constant%.ACTIONS

const {} = %constant%.DMS_COMMANDS

export default {
  initModuleData: createAction('')
}
`
