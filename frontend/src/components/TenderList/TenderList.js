import React, { Component, Fragment } from 'react'
import { TenderContext } from '@src/TenderContext'

import { List, ListItem, ListItemMeta, ListDivider } from '@rmwc/list'
import { IconButton } from '@rmwc/icon-button'
import {Link} from 'react-router-dom'

export default class TenderList extends Component {
  static contextType = TenderContext

  render() {
    const { tenders, setEditableTender } = this.context
    const { requestDeleteTender } = this.props

    return (
      <List disabled>
        {tenders.map(({tenderName}, index) => (
          <Fragment key={index}>
            <ListItem ripple='unbounded'>
              {tenderName}
              <ListItemMeta
                icon={
                  <>
                    <IconButton icon='build' onClick={() => {}}/>
                    <Link to="editing-tender"><IconButton icon='edit' onClick={setEditableTender.bind(null, tenderName)}/></Link>
                    <IconButton icon='close' onClick={requestDeleteTender.bind(null, tenderName)}/>
                  </>
                }
              />
            </ListItem>
            <ListDivider />
          </Fragment>
        ))}
      </List>
    )
  }
}
