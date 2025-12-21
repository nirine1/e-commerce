import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ProductIndex from '../../../pages/products/ProductIndex'

vi.mock('../../../services/product', () => ({
    productService: {
        fetchProducts: vi.fn()
    }
}))

let mockResourceData = null
let shouldThrowError = false

vi.mock('../../../hooks/use-resource', () => ({
    useResource: (service) => {
        return () => {
            if (shouldThrowError) {
                throw new Error('Failed to fetch products')
            }
            return mockResourceData
        }
    }
}))

const mockUpdateProducts = vi.fn()
vi.mock('../../../hooks/use-product-filter', () => ({
    useProductFilters: (initialProducts) => ({
        products: initialProducts || [],
        currentPage: 1,
        totalPages: 1,
        updateProducts: mockUpdateProducts
    })
}))

vi.mock('../../../utils/common-utils', () => ({
    buildFilterParams: vi.fn((filters) => filters)
}))

const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
)

describe('ProductIndex Integration Test', () => {
    const mockProducts = {
        data: [
            {
                id: 1,
                name: 'Laptop HP',
                price: 899.99,
                description: 'High performance laptop',
                image_url: '/images/laptop.jpg',
                quantity: 10
            },
            {
                id: 2,
                name: 'iPhone 15',
                price: 1299.99,
                description: 'Latest iPhone model',
                image_url: '/images/iphone.jpg',
                quantity: 5
            },
            {
                id: 3,
                name: 'Sony Headphones',
                price: 299.99,
                description: 'Noise-cancelling headphones',
                image_url: '/images/headphones.jpg',
                quantity: 15
            }
        ]
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockResourceData = mockProducts
        shouldThrowError = false
    })

    describe('Rendu de la page', () => {
        it('devrait afficher la liste des produits', async () => {
            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
                expect(screen.getByText('iPhone 15')).toBeInTheDocument()
                expect(screen.getByText('Sony Headphones')).toBeInTheDocument()
            })
        })

        it('devrait afficher tous les composants de filtrage et recherche', async () => {
            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/barre de recherche/i)).toBeInTheDocument()

                expect(screen.getByLabelText(/en vedette/i)).toBeInTheDocument()
                expect(screen.getByLabelText(/en stock/i)).toBeInTheDocument()

                expect(screen.getByRole('button', { name: /appliquer/i })).toBeInTheDocument()
                expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument()
            })
        })

        it('devrait afficher la pagination', async () => {
            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                // Pagination should be present
                const paginationElements = screen.getAllByRole('button')
                expect(paginationElements.length).toBeGreaterThan(0)
            })
        })
    })

    describe('État vide', () => {
        it('devrait afficher le message quand aucun produit n\'est trouvé', async () => {
            mockResourceData = null

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/aucun produit trouvé/i)).toBeInTheDocument()
            })
        })
    })

    describe('Fonctionnalité de recherche', () => {
        it('devrait permettre de rechercher des produits', async () => {
            const user = userEvent.setup({ delay: null })

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const searchInput = screen.getByPlaceholderText(/barre de recherche/i)

            await user.type(searchInput, 'laptop')

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith({
                    search: 'laptop',
                    page: 1
                })
            })
        })
    })

    describe('Fonctionnalité de filtrage', () => {
        it('devrait permettre de filtrer par "En vedette"', async () => {
            const user = userEvent.setup()

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const featuredCheckbox = screen.getByLabelText(/en vedette/i)
            await user.click(featuredCheckbox)

            const applyButton = screen.getByRole('button', { name: /appliquer/i })
            await user.click(applyButton)

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        is_featured: true,
                        page: 1
                    })
                )
            })
        })

        it('devrait permettre de filtrer par "En stock"', async () => {
            const user = userEvent.setup()

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const inStockCheckbox = screen.getByLabelText(/en stock/i)
            await user.click(inStockCheckbox)

            const applyButton = screen.getByRole('button', { name: /appliquer/i })
            await user.click(applyButton)

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        in_stock: true,
                        page: 1
                    })
                )
            })
        })

        it('devrait permettre de filtrer par prix', async () => {
            const user = userEvent.setup()

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const minPriceInput = screen.getByPlaceholderText('Min')
            const maxPriceInput = screen.getByPlaceholderText('Max')

            await user.type(minPriceInput, '100')
            await user.type(maxPriceInput, '500')

            const applyButton = screen.getByRole('button', { name: /appliquer/i })
            await user.click(applyButton)

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        min_price: 100,
                        max_price: 500,
                        page: 1
                    })
                )
            })
        })

        it('devrait permettre de trier les produits', async () => {
            const user = userEvent.setup()

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const sortSelect = screen.getByRole('combobox')
            await user.click(sortSelect)

            const priceAscOption = screen.getByRole('option', { name: /prix ↑/i })
            await user.click(priceAscOption)

            const applyButton = screen.getByRole('button', { name: /appliquer/i })
            await user.click(applyButton)

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sort_by: 'price_asc',
                        page: 1
                    })
                )
            })
        })

        it('devrait réinitialiser les filtres', async () => {
            const user = userEvent.setup()

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            const featuredCheckbox = screen.getByLabelText(/en vedette/i)
            await user.click(featuredCheckbox)

            const minPriceInput = screen.getByPlaceholderText('Min')
            await user.type(minPriceInput, '100')

            const resetButton = screen.getByRole('button', { name: /réinitialiser/i })
            await user.click(resetButton)

            expect(featuredCheckbox).not.toBeChecked()
            expect(minPriceInput).toHaveValue(null)
        })
    })

    describe('Affichage des produits', () => {
        it('devrait afficher les prix des produits correctement', async () => {
            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText("899.99")).toBeInTheDocument()
                expect(screen.getByText("1299.99")).toBeInTheDocument()
                expect(screen.getByText("299.99")).toBeInTheDocument()
            })
        })

        it('devrait afficher les cartes de produits dans une grille', async () => {
            const { container } = render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                const grid = container.querySelector('.grid')
                expect(grid).toBeInTheDocument()
            })
        })
    })

    describe('Gestion des erreurs', () => {
        it('devrait gérer les erreurs de chargement', () => {
            shouldThrowError = true

            // ErrorBoundary devrait attraper l'erreur
            // Le comportement exact dépendra de l'implémentation de ErrorBoundary
            render(<ProductIndex />, { wrapper: Wrapper })

            // Si ErrorBoundary fonctionne, devrait afficher le message d'erreur
            // Ce test pourrait avoir besoin d'ajustements
        })
    })

    describe('Interactions combinées', () => {
        it('devrait permettre de rechercher et filtrer en même temps', async () => {
            const user = userEvent.setup({ delay: null })

            render(<ProductIndex />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP')).toBeInTheDocument()
            })

            // Recherche
            const searchInput = screen.getByPlaceholderText(/barre de recherche/i)
            await user.type(searchInput, 'laptop')

            // Filtre
            const featuredCheckbox = screen.getByLabelText(/en vedette/i)
            await user.click(featuredCheckbox)

            const applyButton = screen.getByRole('button', { name: /appliquer/i })
            await user.click(applyButton)

            // Recherche et Filtre appelé en même temps
            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith({
                    search: 'laptop',
                    page: 1
                })
            })

            await waitFor(() => {
                expect(mockUpdateProducts).toHaveBeenCalledWith(
                    expect.objectContaining({
                        is_featured: true,
                        page: 1
                    })
                )
            })
        })
    })
})
