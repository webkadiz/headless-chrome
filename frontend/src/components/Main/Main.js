import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { TenderContext } from '@src/TenderContext'
import { Button } from '@rmwc/button'
import TenderList from '@components/TenderList/TenderList'
import s from './Main.module.scss'
import { Typography } from '@rmwc/typography'
import { SimpleDialog } from '@rmwc/dialog'
import { Checkbox } from '@rmwc/checkbox'
import axios from 'axios'
import { queue } from '@src/SnackbarQueue'
import { CircularProgress } from '@rmwc/circular-progress'

/** Class representing a point. */
export default class Main extends Component {
  state = {
    nameOfDeleteTender: '',
    isDialogOpen: false,
    dialogTitle: '',
    neverShowDialogCheckbox: false,
    isTenderDeleteLoading: false
  }

  static contextType = TenderContext

  /**
   * it is request
   * @param {string} nameOfDeleteTender - делает запрос
   */
  requestDeleteTender = (nameOfDeleteTender) => {
    if (this.state.neverShowDialogCheckbox) {
      this.deleteTender(nameOfDeleteTender)
      return
    }

    const dialogTitle = `Вы хотите удалить тендер: ${nameOfDeleteTender}?`
    this.setState({
      isDialogOpen: true,
      dialogTitle,
      nameOfDeleteTender
    })
  }

  closeDialog = ({ detail: { action } }) => {
    if (action === 'close') {
      this.setState({
        neverShowDialogCheckbox: false
      })
    } else if (action === 'accept') {
      this.deleteTender(this.state.nameOfDeleteTender)
    }

    this.setState({
      isDialogOpen: false
    })
  }

  deleteTender = (nameOfDeleteTender) => {
    if (this.state.isTenderDeleteLoading) return

    this.setState({
      isTenderDeleteLoading: true
    })

    axios
      .delete('/tender', {
        data: {
          tenderName: nameOfDeleteTender
        }
      })
      .then(() => {
        this.context.deleteTender(nameOfDeleteTender)

        queue.notify({
          body: `Тендер: ${nameOfDeleteTender} успешно удален`,
          icon: 'check_circle'
        })
      })
      .catch(() => {
        queue.notify({
          body: `Не удалось удалить тендер: ${nameOfDeleteTender}`,
          icon: 'error'
        })
      })
      .finally(() => {
        this.setState({
          isTenderDeleteLoading: false
        })
      })
  }

  toggleNeverShowDialogCheckbox = () => {
    this.setState({
      neverShowDialogCheckbox: !this.state.neverShowDialogCheckbox
    })
  }

  render() {
    const {
      isDialogOpen,
      dialogTitle,
      neverShowDialogCheckbox,
      isTenderDeleteLoading
    } = this.state
    const { tenders } = this.context
    const {
      closeDialog,
      toggleNeverShowDialogCheckbox,
      requestDeleteTender
    } = this
    const { main, tendersWrapper, noneTenders, progressWrapper } = s

    return (
      <div className={main}>
        <Link to='/creation-tender'>
          <Button raised>Создать тендер</Button>
        </Link>
        <div className={tendersWrapper}>
          <div className={progressWrapper}>
            {isTenderDeleteLoading ? <CircularProgress size='xlarge' /> : null}
          </div>
          {tenders.length ? (
            <TenderList requestDeleteTender={requestDeleteTender} />
          ) : (
            <Typography use='headline4' className={noneTenders}>
              Создайте тендер
            </Typography>
          )}
        </div>
        <SimpleDialog
          open={isDialogOpen}
          onClose={closeDialog}
          preventOutsideDismiss
          title={dialogTitle}
        >
          <Checkbox
            checked={neverShowDialogCheckbox}
            onChange={toggleNeverShowDialogCheckbox}
          >
            Не показывать больше этот диалог
          </Checkbox>
        </SimpleDialog>
      </div>
    )
  }
}
