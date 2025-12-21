import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/auth'

// Mock des services
// vi.mock('../../services/token', () => ({
//     tokenService: {
//         getToken: vi.fn(),
//         setToken: vi.fn(),
//         clearToken: vi.fn(),
//         removeToken: vi.fn()
//     }
// }))

// vi.mock('../../services/auth', () => ({
//     authService: {
//         login: vi.fn(),
//         logout: vi.fn(),
//         user: vi.fn()
//     }
// }))

describe('AuthContext', () => {
    // describe('useAuth hook', () => {
    //     // it('devrait throw une erreur si utilisé en dehors d\'AuthProvider', () => {
    //     //     // Essayer d'utiliser useAuth sans AuthProvider
    //     //     // Vérifier que l'erreur est lancée
    //     // })
    // })

    // describe('AuthProvider - Initialisation', () => {
    //     // it('devrait initialiser avec loading=true', () => {
    //     //     // Render AuthProvider
    //     //     // Vérifier que loading est true au début
    //     // })

    //     // it('devrait charger l\'utilisateur si un token existe', async () => {
    //     //     // Mock tokenService.getToken pour retourner un token
    //     //     // Mock authService.user pour retourner un user
    //     //     // Render AuthProvider
    //     //     // Attendre que loading devienne false
    //     //     // Vérifier que user est défini
    //     // })

    //     // it('ne devrait pas charger d\'utilisateur si aucun token', async () => {
    //     //     // Mock tokenService.getToken pour retourner null
    //     //     // Render AuthProvider
    //     //     // Attendre que loading devienne false
    //     //     // Vérifier que user est null
    //     // })

    //     // it('devrait clear le token si la vérification échoue', async () => {
    //     //     // Mock tokenService.getToken pour retourner un token
    //     //     // Mock authService.user pour throw une erreur
    //     //     // Render AuthProvider
    //     //     // Attendre que loading devienne false
    //     //     // Vérifier que tokenService.clearToken a été appelé
    //     //     // Vérifier que user est null
    //     // })
    // })

    // describe('AuthProvider - login()', () => {
    //     // it('devrait login avec succès et définir user et token', async () => {
    //     //     // Mock authService.login pour retourner success
    //     //     // Render AuthProvider et obtenir login()
    //     //     // Appeler login(email, password)
    //     //     // Vérifier que tokenService.setToken a été appelé
    //     //     // Vérifier que user est défini
    //     // })

    //     // it('devrait throw une erreur si le login échoue', async () => {
    //     //     // Mock authService.login pour retourner error
    //     //     // Render AuthProvider et obtenir login()
    //     //     // Essayer d'appeler login(email, password)
    //     //     // Vérifier que l'erreur est lancée
    //     // })
    // })

    // describe('AuthProvider - logout()', () => {
    //     // it('devrait logout avec succès et clear user et token', async () => {
    //     //     // Mock authService.logout pour retourner success
    //     //     // Render AuthProvider avec user déjà connecté
    //     //     // Appeler logout()
    //     //     // Vérifier que tokenService.removeToken a été appelé
    //     //     // Vérifier que user est null
    //     // })

    //     // it('devrait throw une erreur si le logout échoue', async () => {
    //     //     // Mock authService.logout pour retourner error
    //     //     // Render AuthProvider avec user
    //     //     // Essayer d'appeler logout()
    //     //     // Vérifier que l'erreur est lancée
    //     // })
    // })

    // describe('AuthProvider - Valeurs du contexte', () => {
    //     // it('devrait fournir user, loading, login, logout', () => {
    //     //     // Render AuthProvider
    //     //     // Vérifier que le contexte contient user, loading, login, logout
    //     // })
    // })
})
