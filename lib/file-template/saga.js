module.exports = `import { call, fork, put, take, takeEvery, takeLatest, select } from 'redux-saga/effects'
import dmsService from '@hilbin/common-utils/dist/model/dmsService'
import %constant% from 'constants/modules/buss/%constant%'
import %action% from 'actions/buss/%action%'

const {GetDataWithParamsForSaga, OperDataWithParamsForSaga, GetDataForSaga} = dmsService

const {} = %constant%.ACTIONS

const {} = %constant%.DMS_COMMANDS

const {} = %action%

function * fetchModuleData () {
  try {

  } catch (e) {

  }
}

export default function * %saga% () {
  yield takeLatest('', fetchModuleData)
}
`