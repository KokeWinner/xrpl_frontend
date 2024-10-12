import { useEffect, useState } from 'react'

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

        return () => {
            timer &&
                clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

export default useDebounce
