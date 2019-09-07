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
import { Ripple } from '@rmwc/ripple'
import { Link } from 'react-router-dom'


const sanitizeTime = time => new Date(time).toLocaleString()

export default class TenderList extends Component {
  static contextType = TenderContext

  computeTime = tender => {
    return String(
      sanitizeTime(
        new Date(tender.tenderTimeEnd) - 1000 * tender.tenderSecondsBeforeEnd
      )
    )
  }

  render() {
    const { tenders, setEditableTender } = this.context
    const { requestDeleteTender } = this.props
    const { innerList } = s

    return (
      <List twoLine>
        {tenders.map((tender, index) => (
          <Fragment key={index}>
            <ListItem ripple='unbounded'>
              <ListItemText>
                <ListItemPrimaryText>{tender.tenderName}</ListItemPrimaryText>
                <ListItemSecondaryText>
                  {this.computeTime(tender)}
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
              {
                tender.messages.map(message => {
                  if (message.type === 'success')
                    return (
                      <ListItem>
                        <ListItemGraphic icon="check_circle" theme="success"/>
                        <ListItemSecondaryText theme="success">{message.message}</ListItemSecondaryText>
                        
                        <ListItemMeta
                          icon={
                            <>
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
                    )
                  else if (message.type === 'error')
                    return (
                      <ListItem>
                        <ListItemGraphic icon="error" theme="error"/>
                        <ListItemSecondaryText theme="error">{message.message}</ListItemSecondaryText>
                        <ListItemSecondaryText>&nbsp;- {sanitizeTime(message.time)}</ListItemSecondaryText>

                        <ListItemMeta
                          icon={
                            <>
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
                    )
                })}
            </List>
          </Fragment>
        ))}
      </List>
    )
  }
}
