import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ResourceList from '../../components/ResourceList'

// Mock du hook useResource
// vi.mock('../../hooks/use-resource', () => ({
//     useResource: vi.fn()
// }))

describe('ResourceList Component', () => {
    // it('devrait afficher le message de chargement pendant le chargement', () => {
    //     // Mock useResource pour simuler le chargement (Suspense)
    //     // Render ResourceList
    //     // Vérifier que LoadingMessage s'affiche avec le bon message
    // })

    // it('devrait afficher le message vide si aucune ressource', async () => {
    //     // Mock useResource pour retourner un tableau vide
    //     // Render ResourceList
    //     // Attendre la fin du chargement
    //     // Vérifier que le emptyMessage s'affiche
    // })

    // it('devrait utiliser le message vide par défaut', async () => {
    //     // Mock useResource pour retourner []
    //     // Render ResourceList sans emptyMessage prop
    //     // Vérifier que "Aucune ressource trouvée." s'affiche
    // })

    // it('devrait utiliser le message de chargement par défaut', () => {
    //     // Mock useResource pour simuler le chargement
    //     // Render ResourceList sans loadingMessage prop
    //     // Vérifier que "Chargement des ressources..." s'affiche
    // })

    // it('devrait rendre les items via renderItems quand il y a des données', async () => {
    //     // Mock useResource pour retourner des items
    //     // Créer une fonction renderItems mock
    //     // Render ResourceList
    //     // Vérifier que renderItems a été appelé avec les items
    // })

    // it('devrait afficher l\'erreur si le service échoue', async () => {
    //     // Mock useResource pour throw une erreur
    //     // Render ResourceList (dans ErrorBoundary)
    //     // Vérifier que l'erreur est affichée par ErrorBoundary
    // })

    // it('devrait passer le service au hook useResource', () => {
    //     // Mock useResource
    //     // Render ResourceList avec un service
    //     // Vérifier que useResource a été appelé avec le bon service
    // })
})
