import { useState } from 'react'

export const useSnackbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [msg, setMsg] = useState('')
    const [variant, setVariant] = useState('success')

    const openSnackbar = (msg, variant) => {
        setMsg(msg)
        setVariant(variant)
        setIsOpen(true)
    }

    const closeSnackbar = () => {
        setIsOpen(false)
    }

    return { isOpen, msg, variant, openSnackbar, closeSnackbar }
}