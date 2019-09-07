import React, { Component, Fragment } from 'react'
import { TenderContext } from '@src/TenderContext'
import s from './TenderList.module.scss'
import {
  List,
  ListItem,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
  ListItemGraphic,
  ListDivider
} from '@rmwc/list'
import { IconButton } from '@rmwc/icon-button'
import { Link } from 'react-router-dom'
import { queue } from '@src/SnackbarQueue'
import axios from 'axios'

const sanitizeTime = time => new Date(time).toLocaleString()

const chooseIcon = type => {
  if (type === 'success') return 'check_circle'
  else if (type === 'error') return 'error'
  return ''
}

const TenderTime = ({ tender: { tenderTimeEnd, tenderSecondsBeforeEnd } }) =>
  sanitizeTime(new Date(tenderTimeEnd) - 1000 * tenderSecondsBeforeEnd)

const MessageTime = ({ time }) => <>&nbsp;&mdash;&nbsp;{sanitizeTime(time)}</>

export default class TenderList extends Component {
  static contextType = TenderContext

  deleteMessage = (tender, time) => {
    const messageTender = {}

    messageTender.messages = tender.messages.filter(
      message => message.time !== time
    )

    messageTender.tenderOldName = tender.tenderName

    axios
      .put('/tender', messageTender)
      .then(response => {
        if (response.data.error) throw new Error()

        this.context.updateTender(
          response.data.result.newTender,
          messageTender.tenderOldName
        )
        queue.notify({
          body: 'Сообщение удалено',
          icon: 'check_circle'
        })
      })
      .catch(err => {
        queue.notify({
          body: 'Не удалось удалить сообщение',
          icon: 'error'
        })
      })
  }

  render() {
    const { tenders, setEditableTender } = this.context
    const { requestDeleteTender } = this.props
    const { innerList } = s

    return (
      <List twoLine>
        {tenders.map((tender, index) => (
          <Fragment key={index}>
            <ListItem>
              <ListItemText>
                <ListItemPrimaryText>{tender.tenderName}</ListItemPrimaryText>
                <ListItemSecondaryText>
                  <TenderTime tender={tender} />
                </ListItemSecondaryText>
              </ListItemText>

              <ListItemMeta
                icon={
                  <>
                    <Link to='editing-tender'>
                      <IconButton
                        icon='edit'
                        onClick={setEditableTender.bind(
                          null,
                          tender.tenderName
                        )}
                      />
                    </Link>
                    <IconButton
                      icon='close'
                      onClick={requestDeleteTender.bind(
                        null,
                        tender.tenderName
                      )}
                    />
                  </>
                }
              />
            </ListItem>
            <ListDivider />
            <List className={innerList}>
              {tender.messages.map(({ type, message, time }) => (
                <ListItem key={time}>
                  <ListItemGraphic icon={chooseIcon(type)} theme={type} />
                  <ListItemSecondaryText theme={type}>
                    {message}
                  </ListItemSecondaryText>
                  <ListItemSecondaryText>
                    <MessageTime time={time} />
                  </ListItemSecondaryText>

                  <ListItemMeta
                    icon={
                      <IconButton
                        icon='close'
                        onClick={this.deleteMessage.bind(null, tender, time)}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Fragment>
        ))}
      </List>
    )
  }
}
