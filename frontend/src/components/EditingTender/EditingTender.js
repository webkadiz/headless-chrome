import React, { Component } from 'react'
import s from './EditingTender.module.scss'

import { Button } from '@rmwc/button'
import { Link } from 'react-router-dom'
import { TenderContext } from '@src/TenderContext'
import { TextField } from '@rmwc/textfield'
import { Checkbox } from '@rmwc/checkbox'
import { CircularProgress } from '@rmwc/circular-progress'
import _ from 'lodash'
import textFields from '@src/textFields'
import axios from 'axios'
import { queue } from '@src/SnackbarQueue'

export default class EditingTender extends Component {

  state = {
    tenderOldName: this.context.editableTender.tenderName,
    editableTender: this.context.editableTender,
    textFields: _.cloneDeep(textFields),
    tenderLoading: false
  }

  static contextType = TenderContext

  component

  componentDidMount() {
    if (_.isEmpty(this.state.editableTender)) {
      this.props.history.push('/')
      return
    }

    this.setState(state => {
      // eslint-disable-next-line no-unused-vars
      for(const [tenderKey, tenderValue] of Object.entries(state.editableTender)) {
        const textField = state.textFields.find(textField => textField.name === tenderKey)
        textField.value = tenderValue
      }

      return state
    })
  }

  componentWillUnmount() {
    this.context.deleteEditableTender()
  }

  handleClickBack = e => {
    if (this.state.tenderLoading) e.preventDefault()
  }

  handleChangeInput = (name, { target: { value }}) => {

    this.setState(state => {
      state.textFields.find(input => input.name === name).value = value

      return state
    })
    
  }

  handleChangeCheckbox = (name) => {
    this.setState(state => {
      state.textFields.find(
        input => input.name === name
      ).value = !state.textFields.find(input => input.name === name).value

      return state
    })
  }

  startLoading() {
    this.setState({
      tenderLoading: true
    })
  }

  endLoading() {
    this.setState({
      tenderLoading: false
    })
  }

  isLoading() {
    return this.state.tenderLoading
  }

  updateTender = () => {
    if (this.isLoading()) return

    this.startLoading()

    const textFieldsValues = _.fromPairs(this.state.textFields.map(textField => 
      [textField.name, textField.value]
    ))

    textFieldsValues.tenderOldName = this.state.tenderOldName

    axios.put('/tender', textFieldsValues)
      .then(response => {
        this.endLoading()

        if (response.data.errors) {
          this.setState(state => {
            state.textFields.forEach(textField => (textField.error = ''))

            response.data.errors.forEach(error => {

              if(error.param === 'tenderOldName') error.param = 'tenderName'

              const textFieldWithErorr = state.textFields.find(
                textField => textField.name === error.param
              )
              
              if(textFieldWithErorr) {

                if(textFieldWithErorr.error) return

                textFieldWithErorr.error = error.msg
              }

            })

            return state
          })

          throw new Error()
        }

        delete textFieldsValues.tenderOldName

        this.context.updateTender(textFieldsValues)

        queue.notify({
          body: `Тендер ${textFieldsValues.tenderName} успешно обновлен`,
          icon: 'check_circle'
        })

        this.props.history.push('/')
      }).catch(() => {
        this.endLoading()

        queue.notify({
          body: `Не удалось обновить тендер: ${textFieldsValues.tenderOldName}`,
          icon: 'error'
        })
      })
  }

  render() {
    const {
      tenderLoading
    } = this.state
    const { handleClickBack, handleChangeInput, handleChangeCheckbox, updateTender } = this
    const { editingTender, btn } = s

    return (
      <div className={editingTender}>
        <Link to='/' className={s.back} onClick={handleClickBack}>
          <Button raised>Назад</Button>
        </Link>
        <div className={s.formContainer}>
          <div className={s.form}>
            {this.state.textFields.map(textField => {

              if(textField.type === 'hidden') return

              if(textField.type === 'checkbox') {
                return (
                  <Checkbox
                    key={textField.name}
                    label={textField.label}
                    checked={textField.value}
                    onChange={handleChangeCheckbox.bind(null, textField.name)}
                  />
                )
              }
              
              return <TextField
                outlined
                type={textField.type}
                key={textField.name}
                className={s.input}
                value={textField.value}
                label={textField.label}
                helpText={{ children: textField.error, persistent: true }}
                invalid={textField.error}
                onChange={handleChangeInput.bind(null, textField.name)}
              />
            })}
            <Button
              className={btn}
              label='Сохранить'
              raised
              onClick={updateTender}
              icon={
                tenderLoading ? <CircularProgress theme='secondary' /> : null
              }
            />
          </div>
        </div>
      </div>
    )
  }
}
