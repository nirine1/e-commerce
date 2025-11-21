import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Nettoyage après chaque test
afterEach(() => {
    cleanup()
})

// Mock de window.alert
global.alert = vi.fn()