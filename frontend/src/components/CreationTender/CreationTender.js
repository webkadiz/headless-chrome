import React, { Component } from 'react'

import s from './CreationTender.module.scss'

import { TextField } from '@rmwc/textfield'
import { Button } from '@rmwc/button'
import { CircularProgress } from '@rmwc/circular-progress'
import { Checkbox } from '@rmwc/checkbox'
import { queue } from '@src/SnackbarQueue'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { TenderContext } from '@src/TenderContext'

import _ from 'lodash'

import textFields from '@src/textFields'

export default class CreationTender extends Component {
  state = {
    textFields: _.cloneDeep(textFields),
    tenderLoading: false
  }

  static contextType = TenderContext

  handleChangeInput = (name, { target: { value } }) => {
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

  createTender = () => {
    if (this.isLoading()) return

    this.startLoading()

    const textFieldsValues = _.fromPairs(
      this.state.textFields.map(textField => [textField.name, textField.value])
    )

    axios
      .post('/tender', textFieldsValues)
      .then(response => {
        this.endLoading()

        if (response.data.errors) {
          this.setState(state => {
            state.textFields.forEach(textField => (textField.error = ''))
            response.data.errors.forEach(error => {
              const textFieldWithErorr = state.textFields.find(
                textField => textField.name === error.param
              )

              textFieldWithErorr.error = error.msg

              return state
            })
          })

          throw new Error()
        }

        this.context.addTender(textFieldsValues)

        queue.notify({
          body: 'Тендер успешно создан',
          icon: 'check_circle'
        })

        this.props.history.push('/')
      })
      .catch(() => {
        this.endLoading()

        queue.notify({
          body: 'Не удалось создать тендер',
          icon: 'error'
        })
      })
  }

  handleClickBack = e => {
    if (this.state.tenderLoading) e.preventDefault()
  }

  render() {
    const { tenderLoading, textFields } = this.state
    const { handleClickBack, handleChangeInput, handleChangeCheckbox, createTender } = this

    return (
      <div className={s.creationTender}>
        <Link to='/' className={s.back} onClick={handleClickBack}>
          <Button raised>Назад</Button>
        </Link>
        <div className={s.formContainer}>
          <div className={s.form}>
            {textFields.map(textField => {

              if(textField.type === 'hidden') return ''
              
              if (textField.type === 'checkbox') {
                return (
                  <Checkbox
                    key={textField.name}
                    label={textField.label}
                    checked={textField.value}
                    onChange={handleChangeCheckbox.bind(null, textField.name)}
                  />
                )
              }

              return (
                <TextField
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
              )
            })}
            <Button
              className={s.btn}
              label='Создать тендер'
              raised
              onClick={createTender}
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
