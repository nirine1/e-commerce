import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductSearchBar from '../../../components/products/ProductSearchBar'

const mockOnSearch = vi.fn()

describe('ProductSearchBar Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('devrait afficher le champ de recherche', () => {
        render(<ProductSearchBar onSearch={mockOnSearch} />)

        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('devrait afficher le placeholder', () => {
        render(<ProductSearchBar onSearch={mockOnSearch} />)

        expect(screen.getByPlaceholderText('Barre de recherche')).toBeInTheDocument()
    })

    it('devrait avoir une valeur nulle au départ', () => {
        render(<ProductSearchBar onSearch={mockOnSearch} />)

        expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('devrait changer la valeur du champ de recherche quand on tape quelque chose', async () => {
        const user = userEvent.setup()

        render(<ProductSearchBar onSearch={mockOnSearch} />)

        const inputField = screen.getByRole('textbox');

        expect(inputField).toHaveValue('')

        await user.type(inputField, 'search value')

        expect(inputField).toHaveValue('search value')
    })

    describe('Comportement de debouncing', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('devrait appeler onSearch après 300ms avec la valeur tapée', () => {
            render(<ProductSearchBar onSearch={mockOnSearch} />)

            const inputField = screen.getByRole('textbox')

            // Simulate typing
            fireEvent.change(inputField, { target: { value: 'laptop' } })
            fireEvent.keyUp(inputField, { target: { value: 'laptop' } })

            expect(mockOnSearch).not.toHaveBeenCalled()

            vi.advanceTimersByTime(300)

            expect(mockOnSearch).toHaveBeenCalledTimes(1)
            expect(mockOnSearch).toHaveBeenCalledWith('laptop')
        })

        it('ne devrait pas appeler onSearch immédiatement après la saisie', () => {
            render(<ProductSearchBar onSearch={mockOnSearch} />)

            const inputField = screen.getByRole('textbox')

            fireEvent.change(inputField, { target: { value: 'phone' } })
            fireEvent.keyUp(inputField, { target: { value: 'phone' } })

            expect(mockOnSearch).not.toHaveBeenCalled()

            vi.advanceTimersByTime(299)
            expect(mockOnSearch).not.toHaveBeenCalled()

            vi.advanceTimersByTime(1)
            expect(mockOnSearch).toHaveBeenCalledWith('phone')
        })

        it('devrait annuler le timeout précédent lors de frappes rapides', () => {
            render(<ProductSearchBar onSearch={mockOnSearch} />)

            const inputField = screen.getByRole('textbox')

            // Type 't'
            fireEvent.change(inputField, { target: { value: 't' } })
            fireEvent.keyUp(inputField, { target: { value: 't' } })
            vi.advanceTimersByTime(100)

            // Type 'a'
            fireEvent.change(inputField, { target: { value: 'ta' } })
            fireEvent.keyUp(inputField, { target: { value: 'ta' } })
            vi.advanceTimersByTime(100)

            // Type 'b'
            fireEvent.change(inputField, { target: { value: 'tab' } })
            fireEvent.keyUp(inputField, { target: { value: 'tab' } })
            vi.advanceTimersByTime(100)

            expect(mockOnSearch).not.toHaveBeenCalled()

            vi.advanceTimersByTime(200)

            expect(mockOnSearch).toHaveBeenCalledTimes(1)
            expect(mockOnSearch).toHaveBeenCalledWith('tab')
        })

        it('devrait appeler onSearch avec une chaîne vide si le champ est vidé', () => {
            render(<ProductSearchBar onSearch={mockOnSearch} />)

            const inputField = screen.getByRole('textbox')

            fireEvent.change(inputField, { target: { value: '' } })
            fireEvent.keyUp(inputField, { target: { value: '' } })

            vi.advanceTimersByTime(300)

            expect(mockOnSearch).toHaveBeenCalledWith('')
        })
    })
})
