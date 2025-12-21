import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ResetPassword from '../pages/auth/ResetPassword'
import * as authService from '../services/auth'
import * as tokenService from '../services/token'

// Mock des services
vi.mock('../services/auth', () => ({
    authService: {
        resetPassword: vi.fn()
    }
}))

vi.mock('../services/token', () => ({
    tokenService: {
        setToken: vi.fn()
    }
}))

const mockNavigate = vi.fn()

vi.mock('react-router', () => ({
    useNavigate: () => mockNavigate
}))

// Composant wrapper pour React Router
const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
)

describe('ResetPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(window, 'alert').mockImplementation(() => { })
    })

    it('devrait afficher le formulaire de réinitialisation de mot de passe avec paramètres valides', () => {
        // Simuler les paramètres URL
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        render(<ResetPassword />, { wrapper: Wrapper })

        expect(screen.getByText('Réinitialiser mon mot de passe')).toBeInTheDocument()
        expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/confirmer le mot de passe/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /changer mon mot de passe/i })).toBeInTheDocument()
    })

    it('devrait afficher une erreur quand les paramètres URL sont invalides', () => {
        // Simuler une URL sans paramètres
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password')

        render(<ResetPassword />, { wrapper: Wrapper })

        // Vérifier que le message d'erreur est affiché
        expect(screen.getByText('Lien invalide')).toBeInTheDocument()

        // Les champs devraient être désactivés
        const passwordInput = screen.getByLabelText(/^mot de passe$/i)
        const confirmPasswordInput = screen.getByLabelText(/confirmer le mot de passe/i)

        expect(passwordInput).toBeDisabled()
        expect(confirmPasswordInput).toBeDisabled()
    })

    it('devrait afficher une erreur quand l\'email manque', () => {
        // Simuler une URL avec seulement le token
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?token=valid-token')

        render(<ResetPassword />, { wrapper: Wrapper })

        expect(screen.getByText('Lien invalide')).toBeInTheDocument()
    })

    it('devrait afficher une erreur quand le token manque', () => {
        // Simuler une URL avec seulement l'email
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com')

        render(<ResetPassword />, { wrapper: Wrapper })

        expect(screen.getByText('Lien invalide')).toBeInTheDocument()
    })

    it('devrait désactiver le bouton submit par défaut', () => {
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        render(<ResetPassword />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /changer mon mot de passe/i })
        expect(submitButton).toBeDisabled()
    })

    it('devrait valider que les mots de passe correspondent', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        render(<ResetPassword />, { wrapper: Wrapper })

        // Entrer des mots de passe différents
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Password123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'DifferentPassword')

        // Déclencher la validation
        await user.tab()

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /changer mon mot de passe/i })
            expect(submitButton).toBeDisabled()
        })
    })

    it('devrait appeler l\'API et réussir la réinitialisation', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        const mockResponse = {
            success: true,
            data: {
                token: 'new-token-123'
            }
        }

        authService.authService.resetPassword.mockResolvedValue(mockResponse)

        render(<ResetPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'NewPassword123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123!')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /changer mon mot de passe/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(authService.authService.resetPassword).toHaveBeenCalledWith({
                email: 'test@exemple.com',
                token: 'valid-token',
                password: 'NewPassword123!',
                passwordConfirmation: 'NewPassword123!'
            })
        })

        // Vérifier que le token est stocké
        expect(tokenService.tokenService.setToken).toHaveBeenCalledWith('new-token-123')
    })

    it('devrait afficher une erreur en cas d\'échec', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=invalid-token')

        const errorMessage = 'Token invalide ou expiré'
        const mockErrorResponse = {
            success: false,
            error: errorMessage
        }

        authService.authService.resetPassword.mockResolvedValue(mockErrorResponse)

        render(<ResetPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'NewPassword123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /changer mon mot de passe/i }))

        await waitFor(() => {
            expect(authService.authService.resetPassword).toHaveBeenCalled()
        })

        // Vérifier que l'erreur est affichée
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })

        // Vérifier que le token n'est pas stocké
        expect(tokenService.tokenService.setToken).not.toHaveBeenCalled()
    })

    it('devrait gérer les erreurs inattendues', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        authService.authService.resetPassword.mockRejectedValue(new Error('Erreur réseau'))

        render(<ResetPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'NewPassword123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /changer mon mot de passe/i }))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Une erreur inattendue s\'est produite')
        })

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })

    it('devrait réinitialiser le formulaire après succès', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        const mockResponse = {
            success: true,
            data: {
                token: 'new-token-123'
            }
        }

        authService.authService.resetPassword.mockResolvedValue(mockResponse)

        render(<ResetPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        const passwordInput = screen.getByLabelText(/^mot de passe$/i)
        await user.type(passwordInput, 'NewPassword123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /changer mon mot de passe/i }))

        await waitFor(() => {
            expect(passwordInput.value).toBe('')
        })
    })

    it('devrait désactiver le bouton pendant la soumission', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        let resolveResetPassword
        const resetPasswordPromise = new Promise(resolve => {
            resolveResetPassword = resolve
        })
        authService.authService.resetPassword.mockReturnValue(resetPasswordPromise)

        render(<ResetPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        const passwordInput = screen.getByLabelText(/^mot de passe$/i)
        await user.type(passwordInput, 'NewPassword123!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'NewPassword123!')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /changer mon mot de passe/i })
        await user.click(submitButton)

        // Le bouton devrait être désactivé pendant la soumission
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })

        // Résoudre la promesse et vérifier que le formulaire est réinitialisé
        resolveResetPassword({ success: true, data: { token: 'new-token' } })

        // Après la réinitialisation, le champ password devrait être vide
        await waitFor(() => {
            expect(passwordInput.value).toBe('')
        })
    })

    it('devrait valider la longueur minimale du mot de passe', async () => {
        const user = userEvent.setup()
        delete window.location
        window.location = new URL('http://localhost:3000/reset-password?email=test@exemple.com&token=valid-token')

        render(<ResetPassword />, { wrapper: Wrapper })

        // Entrer un mot de passe trop court
        await user.type(screen.getByLabelText(/^mot de passe$/i), 'Short1!')
        await user.type(screen.getByLabelText(/confirmer le mot de passe/i), 'Short1!')

        await user.tab()

        const submitButton = screen.getByRole('button', { name: /changer mon mot de passe/i })
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })
    })
})
