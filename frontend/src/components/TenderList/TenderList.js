import React, { Component, Fragment } from 'react'
import { TenderContext } from '@src/TenderContext'

import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta, ListDivider } from '@rmwc/list'
import { IconButton } from '@rmwc/icon-button'
import { Ripple} from '@rmwc/ripple'
import { Link } from 'react-router-dom'

export default class TenderList extends Component {
  static contextType = TenderContext

  computeTime = tender => {
    return String(new Date(new Date(tender.tenderTimeEnd) - tender.tenderSecondsBeforeEnd).toLocaleString())
  }

  render() {
    const { tenders, setEditableTender } = this.context
    const { requestDeleteTender } = this.props

    return (
      <List twoLine>
        {tenders.map((tender, index) => (
          <Fragment key={index}>
            <ListItem ripple='unbounded'>
             
              <ListItemText>
                <ListItemPrimaryText>{tender.tenderName}</ListItemPrimaryText>
                <ListItemSecondaryText>{this.computeTime(tender)}</ListItemSecondaryText>
              </ListItemText>

              <ListItemMeta
                icon={
                  <>
                    <Link to="editing-tender"><IconButton icon='edit' onClick={setEditableTender.bind(null, tender.tenderName)}/></Link>
                    <IconButton icon='close' onClick={requestDeleteTender.bind(null, tender.tenderName)}/>
                  </>
                }
              />
            </ListItem>
            <ListDivider />
            <Ripple>
              <div style={{display: 'flex'}}>
                <div>123</div>
                <IconButton icon='close' />
              </div>
            </Ripple>
          </Fragment>
        ))}
      </List>
    )
  }
}
