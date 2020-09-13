import React, { PureComponent } from 'react'
import withOnBlur from 'react-onblur'
import { Button } from '@material-ui/core'

class DeleteButton extends PureComponent {
  state = {
    didRenderConfirm: false
  }

  componentDidUpdate( _, prevState) {
    const { didRenderConfirm } = this.state
    const { setBlurListener, unsetBlurListener } = this.props

    if (didRenderConfirm !== prevState.didRenderConfirm) {

      if (didRenderConfirm) setBlurListener(this.onBlur)

      else unsetBlurListener()
    }
  }

  onBlur = () => this.setState({ didRenderConfirm: false })

  render() {
    const didRenderConfirm = this.state.didRenderConfirm
    return (
      <Button variant='contained'
        color={didRenderConfirm ? 'secondary' : 'primary'}
        onClick={didRenderConfirm
          ? () => this.props.handleDelete(this.props.id)
          : () => this.setState({ didRenderConfirm: true })
        }
      >
        {didRenderConfirm ? 'Sure?' : 'Delete'}
      </Button>
    )
  }
}

export default withOnBlur({ debug: true })(DeleteButton)
