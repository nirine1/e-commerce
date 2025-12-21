import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AppRoutes from '../../routes/AppRoutes'

// Mock du contexte auth
// vi.mock('../../contexts/auth', () => ({
//     useAuth: vi.fn()
// }))

// Mock des pages pour éviter les dépendances
// vi.mock('../../pages/auth/Register', () => ({
//     default: () => <div>Register Page</div>
// }))
// vi.mock('../../pages/auth/Login', () => ({
//     default: () => <div>Login Page</div>
// }))
// ... autres mocks

describe('AppRoutes Component', () => {
    // describe('Routes d\'authentification (isAuth=true)', () => {
    //     // it('devrait afficher la page Register sur /register', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render AppRoutes avec initialEntries=['/register']
    //     //     // Vérifier que "Register Page" s'affiche
    //     // })

    //     // it('devrait afficher la page Login sur /login', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render AppRoutes avec initialEntries=['/login']
    //     //     // Vérifier que "Login Page" s'affiche
    //     // })

    //     // it('devrait afficher la page ForgotPassword sur /forgot-password', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render AppRoutes
    //     //     // Vérifier que "ForgotPassword Page" s'affiche
    //     // })

    //     // it('devrait afficher la page ResetPassword sur /reset-password', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render AppRoutes
    //     //     // Vérifier que "ResetPassword Page" s'affiche
    //     // })
    // })

    // describe('Routes publiques (isProtected=false)', () => {
    //     // it('devrait afficher ProductIndex sur /products', () => {
    //     //     // Mock useAuth
    //     //     // Render AppRoutes avec initialEntries=['/products']
    //     //     // Vérifier que "ProductIndex Page" s'affiche
    //     // })

    //     // it('devrait afficher ProductShow sur /products/:slug', () => {
    //     //     // Mock useAuth
    //     //     // Render AppRoutes avec initialEntries=['/products/test-product']
    //     //     // Vérifier que "ProductShow Page" s'affiche
    //     // })
    // })

    // describe('Routes protégées (isProtected=true)', () => {
    //     // it('devrait afficher TestComponent sur / si connecté', () => {
    //     //     // Mock useAuth avec user
    //     //     // Render AppRoutes avec initialEntries=['/']
    //     //     // Vérifier que "TestComponent Page" s'affiche
    //     // })

    //     // it('devrait rediriger vers /login sur / si non connecté', () => {
    //     //     // Mock useAuth avec user=null
    //     //     // Render AppRoutes avec initialEntries=['/']
    //     //     // Vérifier la redirection vers /login
    //     // })
    // })

    // describe('Layouts', () => {
    //     // it('devrait utiliser MainLayout pour toutes les routes', () => {
    //     //     // Vérifier que MainLayout est utilisé avec les bonnes props
    //     //     // Routes auth: isAuth={true}
    //     //     // Routes publiques: isProtected={false}, isAuth={false}
    //     //     // Routes protégées: isProtected={true}
    //     // })
    // })
})
