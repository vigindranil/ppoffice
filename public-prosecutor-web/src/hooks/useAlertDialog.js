import { useState } from 'react'


export function useAlertDialog() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: 'info',
    message: '',
  })

  const openAlert = (type, message) => {
    setAlertState({ isOpen: true, type, message })
  }

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  return {
    isOpen: alertState.isOpen,
    alertType: alertState.type,
    alertMessage: alertState.message,
    openAlert,
    closeAlert,
  }
}

