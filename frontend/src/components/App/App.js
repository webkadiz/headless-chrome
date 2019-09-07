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

import { SNACKBAR_TIMEOUT } from '@src/constants'


if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://192.168.1.66:8000'
  //axios.defaults.baseURL = 'http://192.168.10.125:8000'
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
    console.log('app mount')
    
    this.queryIntervalID = setInterval(() => {

      axios('/tender')
        .then(response => {
          console.log('new')
          this.setState({
            tenders: response.data.tenders
          })
          
          if(this.state.editableTender.tenderName)
            this.setEditableTender(this.state.editableTender.tenderName)
        }).catch(err => {
          queue.notify({
            body: 'Не удалось получить тендеры с сервера. Попробуйте перезагрузить страницу',
            icon: 'error'
          })
        })
    }, 3000)
  }

  componentWillMount() {
    clearInterval(this.queryIntervalID)
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

  updateTender = (renewedTender, tenderOldName) => {
    this.setState(state => {
      let indexOldTender

      if(tenderOldName)
      indexOldTender = state.tenders.findIndex(
        tender => tender.tenderName === tenderOldName
      )
      else
      indexOldTender = state.tenders.findIndex(
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
          <SnackbarQueue messages={queue.messages} timeout={SNACKBAR_TIMEOUT} />
        </TenderContext.Provider>
      </div>
    )
  }
}
