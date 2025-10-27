import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Register from '../pages/auth/register'
import * as authService from '../services/auth'
import * as tokenService from '../services/token'

// Mock des services
vi.mock('../services/auth', () => ({
    authService: {
        register: vi.fn()
    }
}))

vi.mock('../services/token', () => ({
    tokenService: {
        setToken: vi.fn()
    }
}))

// Composant wrapper pour React Router
const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
)

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(window, 'alert').mockImplementation(() => { })
    })

    it('devrait afficher le formulaire d\'inscription', () => {
        render(<Register />, { wrapper: Wrapper })

        expect(screen.getByText('Inscription')).toBeInTheDocument()
        expect(screen.getByLabelText(/nom complet/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
    })

    it('devrait désactiver le bouton submit par défaut', () => {
        render(<Register />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
        expect(submitButton).toBeDisabled()
    })

    it('devrait valider les champs requis', async () => {
        const user = userEvent.setup()
        render(<Register />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

        // Remplir seulement le nom
        await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')

        // Le bouton devrait rester désactivé
        expect(submitButton).toBeDisabled()
    })

    it('devrait valider que les mots de passe correspondent', async () => {
        const user = userEvent.setup()
        render(<Register />, { wrapper: Wrapper })

        await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
        await user.type(screen.getByLabelText(/adresse email/i), 'jean@exemple.com')
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'DifferentPassword')

        // Déclencher la validation en quittant le champ
        await user.tab()

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeDisabled()
        })
    })

    it('devrait appeler l\'API et réussir l\'inscription', async () => {
        const user = userEvent.setup()
        const mockRegisterResponse = {
            success: true,
            data: {
                token: 'fake-token-123',
                user: {
                    id: 1,
                    name: 'Jean Dupont',
                    email: 'jean@exemple.com'
                }
            }
        }

        authService.authService.register.mockResolvedValue(mockRegisterResponse)

        render(<Register />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
        await user.type(screen.getByLabelText(/adresse email/i), 'jean@exemple.com')
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(authService.authService.register).toHaveBeenCalledWith({
                name: 'Jean Dupont',
                email: 'jean@exemple.com',
                password: 'Password123!',
                passwordConfirmation: 'Password123!'
            })
        })

        expect(tokenService.tokenService.setToken).toHaveBeenCalledWith('fake-token-123')
        expect(window.alert).toHaveBeenCalledWith('Inscription réussie ! Bienvenue Jean Dupont')
    })

    it('devrait afficher une erreur en cas d\'échec de l\'inscription', async () => {
        const user = userEvent.setup()
        const mockErrorResponse = {
            success: false,
            error: 'Cet email est déjà utilisé'
        }

        authService.authService.register.mockResolvedValue(mockErrorResponse)

        render(<Register />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
        await user.type(screen.getByLabelText(/adresse email/i), 'jean@exemple.com')
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

        await waitFor(() => {
            expect(authService.authService.register).toHaveBeenCalled()
        })

        expect(tokenService.tokenService.setToken).not.toHaveBeenCalled()
    })

    it('devrait gérer les erreurs inattendues', async () => {
        const user = userEvent.setup()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        authService.authService.register.mockRejectedValue(new Error('Erreur réseau'))

        render(<Register />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/nom complet/i), 'Jean Dupont')
        await user.type(screen.getByLabelText(/adresse email/i), 'jean@exemple.com')
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Une erreur inattendue s\'est produite')
        })

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })

    it('devrait afficher le lien vers la page de connexion', () => {
        render(<Register />, { wrapper: Wrapper })

        const loginLink = screen.getByRole('link', { name: /se connecter/i })
        expect(loginLink).toBeInTheDocument()
        expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('devrait réinitialiser le formulaire après une inscription réussie', async () => {
        const user = userEvent.setup()
        const mockRegisterResponse = {
            success: true,
            data: {
                token: 'fake-token-123',
                user: {
                    id: 1,
                    name: 'Jean Dupont',
                    email: 'jean@exemple.com'
                }
            }
        }

        authService.authService.register.mockResolvedValue(mockRegisterResponse)

        render(<Register />, { wrapper: Wrapper })

        // Remplir le formulaire
        const nameInput = screen.getByLabelText(/nom complet/i)
        await user.type(nameInput, 'Jean Dupont')
        await user.type(screen.getByLabelText(/adresse email/i), 'jean@exemple.com')
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /s'inscrire/i }))

        await waitFor(() => {
            expect(nameInput.value).toBe('')
        })
    })
})