import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ForgotPassword from '../pages/auth/ForgotPassword'
import * as authService from '../services/auth'
import * as tokenService from '../services/token'

// Mock des services
vi.mock('../services/auth', () => ({
    authService: {
        forgotPassword: vi.fn()
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

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(window, 'alert').mockImplementation(() => { })
    })

    it('devrait afficher le formulaire de mot de passe oublié', () => {
        render(<ForgotPassword />, { wrapper: Wrapper })

        expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument()
        expect(screen.getByText(/pas de soucis, nous vous enverrons un email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /réinitialiser le mot de passe/i })).toBeInTheDocument()
    })

    it('devrait désactiver le bouton submit par défaut', () => {
        render(<ForgotPassword />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i })
        expect(submitButton).toBeDisabled()
    })

    it('devrait activer le bouton quand l\'email est valide', async () => {
        const user = userEvent.setup()
        render(<ForgotPassword />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i })

        // Entrer un email valide
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })
    })

    it('devrait valider le format de l\'email', async () => {
        const user = userEvent.setup()
        render(<ForgotPassword />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i })

        // Entrer un email invalide
        await user.type(screen.getByLabelText(/adresse email/i), 'email-invalide')

        // Le bouton devrait rester désactivé
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })
    })

    it('devrait appeler l\'API et réussir l\'envoi de l\'email', async () => {
        const user = userEvent.setup()
        const mockResponse = {
            success: true,
            data: {
                token: 'fake-token-123'
            }
        }

        authService.authService.forgotPassword.mockResolvedValue(mockResponse)

        render(<ForgotPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        const emailInput = screen.getByLabelText(/adresse email/i)
        await user.type(emailInput, 'test@exemple.com')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(authService.authService.forgotPassword).toHaveBeenCalledWith({
                email: 'test@exemple.com'
            })
        })

        // Vérifier que le token est stocké (note: ce comportement pourrait être discutable)
        expect(tokenService.tokenService.setToken).toHaveBeenCalledWith('fake-token-123')

        // Vérifier le message de succès
        await waitFor(() => {
            expect(screen.getByText(/un email a été envoyé à test@exemple.com/i)).toBeInTheDocument()
        })
    })

    it('devrait afficher une erreur en cas d\'échec', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Aucun compte trouvé avec cet email'
        const mockErrorResponse = {
            success: false,
            error: errorMessage
        }

        authService.authService.forgotPassword.mockResolvedValue(mockErrorResponse)

        render(<ForgotPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/adresse email/i), 'inexistant@exemple.com')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }))

        await waitFor(() => {
            expect(authService.authService.forgotPassword).toHaveBeenCalled()
        })

        // Vérifier que l'erreur est affichée
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })

        // Vérifier que le token n'est pas stocké
        expect(tokenService.tokenService.setToken).not.toHaveBeenCalled()
    })

    it('devrait réinitialiser le formulaire après succès', async () => {
        const user = userEvent.setup()
        const mockResponse = {
            success: true,
            data: {
                token: 'fake-token-123'
            }
        }

        authService.authService.forgotPassword.mockResolvedValue(mockResponse)

        render(<ForgotPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        const emailInput = screen.getByLabelText(/adresse email/i)
        await user.type(emailInput, 'test@exemple.com')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }))

        await waitFor(() => {
            expect(emailInput.value).toBe('')
        })
    })

    it('devrait gérer les erreurs inattendues', async () => {
        const user = userEvent.setup()
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        authService.authService.forgotPassword.mockRejectedValue(new Error('Erreur réseau'))

        render(<ForgotPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /réinitialiser le mot de passe/i }))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Une erreur inattendue s\'est produite')
        })

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })

    it('devrait afficher le lien vers la page de connexion', () => {
        render(<ForgotPassword />, { wrapper: Wrapper })

        const loginLink = screen.getByRole('link', { name: /connexion/i })
        expect(loginLink).toBeInTheDocument()
        expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('devrait désactiver le bouton pendant la soumission', async () => {
        const user = userEvent.setup()

        // Créer une promesse qui ne se résout pas immédiatement
        let resolveForgotPassword
        const forgotPasswordPromise = new Promise(resolve => {
            resolveForgotPassword = resolve
        })
        authService.authService.forgotPassword.mockReturnValue(forgotPasswordPromise)

        render(<ForgotPassword />, { wrapper: Wrapper })

        // Remplir le formulaire
        const emailInput = screen.getByLabelText(/adresse email/i)
        await user.type(emailInput, 'test@exemple.com')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /réinitialiser le mot de passe/i })
        await user.click(submitButton)

        // Le bouton devrait être désactivé pendant la soumission
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })

        // Résoudre la promesse et vérifier que le formulaire est réinitialisé
        resolveForgotPassword({ success: true, data: { token: 'fake-token' } })

        // Après la réinitialisation, le champ email devrait être vide
        await waitFor(() => {
            expect(emailInput.value).toBe('')
        })
    })

    it('ne devrait pas afficher de message de succès au chargement initial', () => {
        render(<ForgotPassword />, { wrapper: Wrapper })

        // Vérifier qu'aucun message de succès n'est affiché
        expect(screen.queryByText(/un email a été envoyé/i)).not.toBeInTheDocument()
    })

    it('ne devrait pas afficher de message d\'erreur au chargement initial', () => {
        render(<ForgotPassword />, { wrapper: Wrapper })

        // Vérifier qu'aucun message d'erreur n'est affiché
        // On vérifie juste qu'il n'y a pas d'élément d'alerte destructive
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
})
