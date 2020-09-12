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

  onClickConfirm = () => this.setState({ didRenderConfirm: true })
  onBlur = () => this.setState({ didRenderConfirm: false })

  render() {
    const didRenderConfirm = this.state.didRenderConfirm
    return (
      <Button variant='contained'
        color={didRenderConfirm ? 'secondary' : 'primary'}
        onClick={!didRenderConfirm
          ? this.onClickConfirm
          : () => this.props.handleDelete(this.props.id)}
      >
        {didRenderConfirm ? 'Sure?' : 'Delete'}
      </Button>
    )
  }
}

export default withOnBlur({ debug: true })(DeleteButton)
