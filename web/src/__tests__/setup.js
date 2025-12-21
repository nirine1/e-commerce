import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Nettoyage après chaque test
afterEach(() => {
    cleanup()
})

// Mock de window.alert
global.alert = vi.fn()

// Mock ResizeObserver for shadcn/ui components
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Mock Pointer Capture API for Radix UI components
Element.prototype.hasPointerCapture = vi.fn()
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
Element.prototype.scrollIntoView = vi.fn()