import React from 'react'
import s from './App.module.scss'
import { Route } from 'react-router-dom'

import Main from '@components/Main/Main'
import CreationTender from '@components/CreationTender/CreationTender'
import EditingTender from '@components/EditingTender'
import { TenderContext } from '@src/TenderContext'
import { SnackbarQueue } from '@rmwc/snackbar'
import { queue } from '@src/SnackbarQueue'
import axios from 'axios'

import { snackbarTimeout } from '@src/constants'


if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://192.168.1.66:8000'
} else {
  axios.defaults.baseURL = ''
}

axios.defaults.timeout = 5000

export default class App extends React.Component {
  state = {
    tenders: [],
    editableTender: {}
  }

  componentDidMount() {
    axios('/tender')
      .then(response => {
        this.setState({
          tenders: response.data.tenders
        })
      }).catch(() => {
        queue.notify({
          body: 'Не удалось получить тендеры с сервера. Попробуйте перезагрузить страницу'
        })
      })
  }

  addTender = tender => {
    this.setState(state => ({
      tenders: [...state.tenders, tender]
    }))
  }

  deleteTender = nameOfDeleteTender => {
    console.log('delete tender from app')
    this.setState({
      tenders: this.state.tenders.filter(
        tender => tender.tenderName !== nameOfDeleteTender
      )
    })
  }

  updateTender = renewedTender => {
    this.setState(state => {
      const indexOldTender = state.tenders.findIndex(
        tender => tender.tenderName === state.editableTender.tenderName
      )

      state.tenders.splice(indexOldTender, 1, renewedTender)

      return state
    })
  }

  setEditableTender = nameOfEditableTender => {
    console.log('set edit tender')
    const editableTender = this.state.tenders.find(
      tender => tender.tenderName === nameOfEditableTender
    )
    this.setState({
      editableTender
    })
  }

  deleteEditableTender = () => {
    this.setState({
      editableTender: {}
    })
  }

  render() {
    const { addTender, deleteTender, updateTender, setEditableTender, deleteEditableTender } = this

    return (
      <div className={s.wrapper}>
        <TenderContext.Provider
          value={{ ...this.state, addTender, deleteTender, updateTender, setEditableTender, deleteEditableTender }}
        >
          <Route exact path='/' component={Main} />
          <Route path='/creation-tender' component={CreationTender} />
          <Route path='/editing-tender' component={EditingTender} />
          <SnackbarQueue messages={queue.messages} timeout={snackbarTimeout} />
        </TenderContext.Provider>
      </div>
    )
  }
}
