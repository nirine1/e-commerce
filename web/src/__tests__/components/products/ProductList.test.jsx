import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductList from '../../../components/products/ProductList'

// Mock child components
vi.mock('../../../components/products/ProductCard', () => ({
    default: ({ product }) => (
        <div data-testid={`product-card-${product.id}`}>
            {product.name}
        </div>
    )
}))

vi.mock('../../../components/CustomPagination', () => ({
    default: ({ currentPage, totalPages, onPageChange }) => (
        <div data-testid="pagination">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
            </button>
        </div>
    )
}))

vi.mock('../../../components/products/ProductSearchBar', () => ({
    default: ({ onSearch }) => (
        <div data-testid="search-bar">
            <input
                type="text"
                placeholder="Search"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    )
}))

vi.mock('../../../components/products/ProductFilter', () => ({
    default: ({ onFilter }) => (
        <div data-testid="product-filter">
            <button onClick={() => onFilter({ is_featured: true })}>
                Apply Filter
            </button>
        </div>
    )
}))

vi.mock('../../../components/ErrorBoundary', () => ({
    default: ({ children }) => <div>{children}</div>
}))

vi.mock('../../../components/LoadingMessage', () => ({
    default: ({ message }) => <div>{message}</div>
}))

// Mock the useProductFilters hook
const mockUpdateProducts = vi.fn()
vi.mock('../../../hooks/use-product-filter', () => ({
    useProductFilters: vi.fn()
}))

vi.mock('../../../utils/common-utils', () => ({
    buildFilterParams: vi.fn((filters) => filters)
}))

import { useProductFilters } from '../../../hooks/use-product-filter'

describe('ProductList Component', () => {
    const mockProducts = [
        {
            id: 1,
            name: 'Product 1',
            price: 100,
            image_url: 'image1.jpg'
        },
        {
            id: 2,
            name: 'Product 2',
            price: 200,
            image_url: 'image2.jpg'
        },
        {
            id: 3,
            name: 'Product 3',
            price: 300,
            image_url: 'image3.jpg'
        }
    ]

    const mockItems = {
        data: mockProducts
    }

    beforeEach(() => {
        vi.clearAllMocks()
        useProductFilters.mockReturnValue({
            products: mockProducts,
            currentPage: 1,
            totalPages: 5,
            updateProducts: mockUpdateProducts
        })
    })

    describe('Rendu des composants', () => {
        it('devrait afficher tous les composants enfants', () => {
            render(<ProductList items={mockItems} />)

            expect(screen.getByTestId('pagination')).toBeInTheDocument()
            expect(screen.getByTestId('product-filter')).toBeInTheDocument()
            expect(screen.getByTestId('search-bar')).toBeInTheDocument()
        })

        it('devrait afficher toutes les cartes de produits', () => {
            render(<ProductList items={mockItems} />)

            expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
            expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
            expect(screen.getByTestId('product-card-3')).toBeInTheDocument()
        })

        it('devrait afficher les produits dans une grille', () => {
            const { container } = render(<ProductList items={mockItems} />)

            const grid = container.querySelector('.grid')
            expect(grid).toBeInTheDocument()
            expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4')
        })
    })

    describe('Gestion de la recherche', () => {
        it('devrait appeler updateProducts avec les paramètres de recherche', async () => {
            const user = userEvent.setup()
            render(<ProductList items={mockItems} />)

            const searchInput = screen.getByPlaceholderText('Search')
            await user.type(searchInput, 'laptop')

            expect(mockUpdateProducts).toHaveBeenCalledWith({
                search: 'laptop',
                page: 1
            })
        })

        it('devrait réinitialiser la page à 1 lors de la recherche', async () => {
            const user = userEvent.setup()
            useProductFilters.mockReturnValue({
                products: mockProducts,
                currentPage: 3,
                totalPages: 5,
                updateProducts: mockUpdateProducts
            })

            render(<ProductList items={mockItems} />)

            const searchInput = screen.getByPlaceholderText('Search')
            await user.type(searchInput, 'phone')

            expect(mockUpdateProducts).toHaveBeenCalledWith({
                search: 'phone',
                page: 1
            })
        })
    })

    describe('Gestion des filtres', () => {
        it('devrait appeler updateProducts avec les paramètres de filtrage', async () => {
            const user = userEvent.setup()
            render(<ProductList items={mockItems} />)

            const filterButton = screen.getByText('Apply Filter')
            await user.click(filterButton)

            expect(mockUpdateProducts).toHaveBeenCalledWith({
                is_featured: true,
                page: 1
            })
        })

        it('devrait réinitialiser la page à 1 lors du filtrage', async () => {
            const user = userEvent.setup()
            useProductFilters.mockReturnValue({
                products: mockProducts,
                currentPage: 4,
                totalPages: 5,
                updateProducts: mockUpdateProducts
            })

            render(<ProductList items={mockItems} />)

            const filterButton = screen.getByText('Apply Filter')
            await user.click(filterButton)

            expect(mockUpdateProducts).toHaveBeenCalledWith(
                expect.objectContaining({ page: 1 })
            )
        })
    })

    describe('Gestion de la pagination', () => {
        it('devrait appeler updateProducts lors du changement de page', async () => {
            const user = userEvent.setup()
            render(<ProductList items={mockItems} />)

            const nextButton = screen.getByText('Next')
            await user.click(nextButton)

            expect(mockUpdateProducts).toHaveBeenCalledWith({ page: 2 })
        })

        it('devrait afficher la page actuelle et le nombre total de pages', () => {
            render(<ProductList items={mockItems} />)

            expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
        })

        it('devrait gérer le changement vers la page précédente', async () => {
            const user = userEvent.setup()
            useProductFilters.mockReturnValue({
                products: mockProducts,
                currentPage: 3,
                totalPages: 5,
                updateProducts: mockUpdateProducts
            })

            render(<ProductList items={mockItems} />)

            const previousButton = screen.getByText('Previous')
            await user.click(previousButton)

            expect(mockUpdateProducts).toHaveBeenCalledWith({ page: 2 })
        })
    })

    describe('Gestion des états vides', () => {
        it('devrait gérer une liste de produits vide', () => {
            useProductFilters.mockReturnValue({
                products: [],
                currentPage: 1,
                totalPages: 1,
                updateProducts: mockUpdateProducts
            })

            const { container } = render(<ProductList items={{ data: [] }} />)

            const grid = container.querySelector('.grid')
            expect(grid).toBeInTheDocument()
            expect(grid.children.length).toBe(0)
        })
    })

    describe('Initialisation avec le hook', () => {
        it('devrait initialiser useProductFilters avec les produits fournis', () => {
            render(<ProductList items={mockItems} />)

            expect(useProductFilters).toHaveBeenCalledWith(mockProducts)
        })

        it('devrait utiliser les valeurs retournées par le hook', () => {
            const customProducts = [
                { id: 4, name: 'Custom Product', price: 400, image_url: 'custom.jpg' }
            ]

            useProductFilters.mockReturnValue({
                products: customProducts,
                currentPage: 2,
                totalPages: 10,
                updateProducts: mockUpdateProducts
            })

            render(<ProductList items={mockItems} />)

            expect(screen.getByTestId('product-card-4')).toBeInTheDocument()
            expect(screen.getByText('Page 2 of 10')).toBeInTheDocument()
        })
    })
})
