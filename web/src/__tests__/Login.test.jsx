import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/auth/login'

// Mock useAuth hook
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../contexts/auth', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
        loading: false
    })
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

// Composant wrapper pour React Router
const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
)

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('devrait afficher le formulaire de connexion', () => {
        render(<Login />, { wrapper: Wrapper })

        expect(screen.getByText('Connexion')).toBeInTheDocument()
        expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    })

    it('devrait désactiver le bouton submit par défaut', () => {
        render(<Login />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /se connecter/i })
        expect(submitButton).toBeDisabled()
    })

    it('devrait valider les champs requis', async () => {
        const user = userEvent.setup()
        render(<Login />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /se connecter/i })

        // Remplir seulement l'email
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')

        // Le bouton devrait rester désactivé
        expect(submitButton).toBeDisabled()
    })

    it('devrait activer le bouton quand le formulaire est valide', async () => {
        const user = userEvent.setup()
        render(<Login />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /se connecter/i })

        // Remplir tous les champs requis
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!')

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled()
        })
    })

    it('devrait valider le format de l\'email', async () => {
        const user = userEvent.setup()
        render(<Login />, { wrapper: Wrapper })

        const submitButton = screen.getByRole('button', { name: /se connecter/i })

        // Entrer un email invalide
        await user.type(screen.getByLabelText(/adresse email/i), 'email-invalide')
        await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!')

        // Le bouton devrait rester désactivé
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })
    })

    it('devrait appeler login et réussir la connexion', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue(undefined)

        render(<Login />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /se connecter/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@exemple.com', 'Password123!')
        })

        // Vérifier la navigation vers le dashboard
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    it('devrait afficher une erreur en cas d\'échec de la connexion', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Email ou mot de passe incorrect'
        mockLogin.mockRejectedValue(new Error(errorMessage))

        render(<Login />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'WrongPassword')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /se connecter/i }))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled()
        })

        // Vérifier que l'erreur est affichée
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })

        // Vérifier qu'il n'y a pas de navigation
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('devrait réinitialiser le formulaire après une connexion réussie', async () => {
        const user = userEvent.setup()
        mockLogin.mockResolvedValue(undefined)

        render(<Login />, { wrapper: Wrapper })

        // Remplir le formulaire
        const emailInput = screen.getByLabelText(/adresse email/i)
        const passwordInput = screen.getByLabelText(/mot de passe/i)

        await user.type(emailInput, 'test@exemple.com')
        await user.type(passwordInput, 'Password123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /se connecter/i }))

        await waitFor(() => {
            expect(emailInput.value).toBe('')
            expect(passwordInput.value).toBe('')
        })
    })

    it('devrait afficher le lien vers la page d\'inscription', () => {
        render(<Login />, { wrapper: Wrapper })

        const registerLink = screen.getByRole('link', { name: /s'inscrire/i })
        expect(registerLink).toBeInTheDocument()
        expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('devrait afficher le lien vers mot de passe oublié', () => {
        render(<Login />, { wrapper: Wrapper })

        const forgotPasswordLink = screen.getByRole('link', { name: /mot de passe oublié/i })
        expect(forgotPasswordLink).toBeInTheDocument()
        expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('devrait gérer les erreurs sans message', async () => {
        const user = userEvent.setup()
        mockLogin.mockRejectedValue(new Error())

        render(<Login />, { wrapper: Wrapper })

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/adresse email/i), 'test@exemple.com')
        await user.type(screen.getByLabelText(/mot de passe/i), 'Password123!')

        // Soumettre le formulaire
        await user.click(screen.getByRole('button', { name: /se connecter/i }))

        await waitFor(() => {
            expect(screen.getByText('Erreur de connexion')).toBeInTheDocument()
        })
    })

    it('devrait désactiver le bouton pendant la soumission', async () => {
        const user = userEvent.setup()

        // Créer une promesse qui ne se résout pas immédiatement
        let resolveLogin
        const loginPromise = new Promise(resolve => {
            resolveLogin = resolve
        })
        mockLogin.mockReturnValue(loginPromise)

        render(<Login />, { wrapper: Wrapper })

        // Remplir le formulaire
        const emailInput = screen.getByLabelText(/adresse email/i)
        const passwordInput = screen.getByLabelText(/mot de passe/i)
        await user.type(emailInput, 'test@exemple.com')
        await user.type(passwordInput, 'Password123!')

        // Soumettre le formulaire
        const submitButton = screen.getByRole('button', { name: /se connecter/i })
        await user.click(submitButton)

        // Le bouton devrait être désactivé pendant la soumission
        await waitFor(() => {
            expect(submitButton).toBeDisabled()
        })

        // Résoudre la promesse et vérifier que le formulaire est réinitialisé
        resolveLogin()

        // Après la réinitialisation, les champs devraient être vides
        await waitFor(() => {
            expect(emailInput.value).toBe('')
            expect(passwordInput.value).toBe('')
        })
    })
})
