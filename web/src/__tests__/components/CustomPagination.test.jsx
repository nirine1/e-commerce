import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CustomPagination from '../../components/CustomPagination'

const mockOnPageChange = vi.fn()

describe('CustomPagination component', () => {
    it('devrait s\'afficher sans erreur', () => {
        render(<CustomPagination />)

        expect(screen.getByText('Previous')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
        expect(screen.getByText('More pages')).toBeInTheDocument()
    })

    it('devrait afficher un bouton actif à la fois', () => {
        render(<CustomPagination />)

        expect(screen.getAllByText(/[0-9]*/, { current: 'page' })).toBeInTheDocument()
    })

    describe('getPageNumbers() logic', () => {
        // describe('Scénario A: Peu de pages (totalPages <= maxVisiblePages)', () => {
        //     // it('devrait afficher toutes les pages sans ellipsis', () => {
        //     //     // Render avec totalPages={3}, maxVisiblePages={5}
        //     //     // Vérifier que les pages 1, 2, 3 sont affichées
        //     //     // Vérifier qu'il n'y a pas d'ellipsis (pas de "More pages")
        //     // })
        // })

        // describe('Scénario B: Page courante proche du début', () => {
        //     // it('devrait afficher [1, 2, 3, 4, ellipsis, 10]', () => {
        //     //     // Render avec currentPage={2}, totalPages={10}, maxVisiblePages={5}
        //     //     // Vérifier l'ordre: 1, 2, 3, 4, ellipsis, 10
        //     // })
        // })

        // describe('Scénario C: Page courante au milieu', () => {
        //     // it('devrait afficher [1, ellipsis, 4, 5, 6, ellipsis, 10]', () => {
        //     //     // Render avec currentPage={5}, totalPages={10}, maxVisiblePages={5}
        //     //     // Vérifier l'ordre: 1, ellipsis, 4, 5, 6, ellipsis, 10
        //     // })
        // })

        // describe('Scénario D: Page courante proche de la fin', () => {
        //     // it('devrait afficher [1, ellipsis, 7, 8, 9, 10]', () => {
        //     //     // Render avec currentPage={9}, totalPages={10}, maxVisiblePages={5}
        //     //     // Vérifier l'ordre: 1, ellipsis, 7, 8, 9, 10
        //     // })
        // })
    })

    describe('Interactions utilisateur', () => {
        // it('devrait appeler onPageChange avec le numéro de page cliqué', () => {
        //     // Render avec onPageChange mock
        //     // Cliquer sur la page 3
        //     // Vérifier que onPageChange(3) a été appelé
        // })

        // it('devrait appeler onPageChange(currentPage - 1) au clic sur Previous', () => {
        //     // Render avec currentPage={3}, onPageChange mock
        //     // Cliquer sur Previous
        //     // Vérifier que onPageChange(2) a été appelé
        // })

        // it('devrait appeler onPageChange(currentPage + 1) au clic sur Next', () => {
        //     // Render avec currentPage={3}, onPageChange mock
        //     // Cliquer sur Next
        //     // Vérifier que onPageChange(4) a été appelé
        // })
    })

    describe('État désactivé', () => {
        // it('devrait désactiver Previous quand currentPage === 1', () => {
        //     // Render avec currentPage={1}
        //     // Vérifier que Previous a la classe 'opacity-50'
        //     // Vérifier que Previous a la classe 'pointer-events-none'
        // })

        // it('devrait désactiver Next quand currentPage === totalPages', () => {
        //     // Render avec currentPage={10}, totalPages={10}
        //     // Vérifier que Next a la classe 'opacity-50'
        //     // Vérifier que Next a la classe 'pointer-events-none'
        // })

        // it('ne devrait pas appeler onPageChange si page < 1', () => {
        //     // Render avec currentPage={1}, onPageChange mock
        //     // Essayer de cliquer sur Previous
        //     // Vérifier que onPageChange n'a pas été appelé
        // })

        // it('ne devrait pas appeler onPageChange si page > totalPages', () => {
        //     // Render avec currentPage={10}, totalPages={10}, onPageChange mock
        //     // Essayer de cliquer sur Next
        //     // Vérifier que onPageChange n'a pas été appelé
        // })
    })

    describe('Cas limites', () => {
        // it('devrait fonctionner sans onPageChange (optional prop)', () => {
        //     // Render sans onPageChange
        //     // Cliquer sur une page
        //     // Vérifier qu'il n'y a pas d'erreur
        // })

        // it('devrait gérer le cas d\'une seule page', () => {
        //     // Render avec totalPages={1}
        //     // Vérifier que seule la page 1 s'affiche
        //     // Vérifier que Previous et Next sont désactivés
        // })

        // it('devrait marquer la page courante comme active', () => {
        //     // Render avec currentPage={3}
        //     // Vérifier que la page 3 a isActive={true} (aria-current="page")
        //     // Vérifier que les autres pages n'ont pas isActive
        // })
    })
})