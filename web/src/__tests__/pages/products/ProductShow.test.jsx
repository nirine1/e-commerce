import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductShow from '../../../pages/products/ProductShow'

// Mock useParams
const mockParams = { slug: 'laptop-hp-15' }
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router')
    return {
        ...actual,
        useParams: () => mockParams
    }
})

// Mock product service
vi.mock('../../../services/product', () => ({
    productService: {
        fetchProductById: vi.fn()
    }
}))

// Mock useResource hook
let mockResourceData = null
let shouldThrowError = false

vi.mock('../../../hooks/use-resource', () => ({
    useResource: (resource) => {
        return () => {
            if (shouldThrowError) {
                throw new Error('Failed to fetch product')
            }
            return mockResourceData
        }
    }
}))

// Wrapper for React Router
const Wrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
)

describe('ProductShow Integration Test', () => {
    const mockProduct = {
        success: true,
        data: {
            data: {
                id: 1,
                name: 'Laptop HP 15',
                slug: 'laptop-hp-15',
                sku: 'LAP-HP-001',
                price: 899.99,
                compare_price: 999.99,
                short_description: 'High performance laptop for professionals',
                description: 'Full description of the laptop with detailed specifications and features.',
                quantity: 10,
                in_stock: true,
                weight: '2.5kg',
                dimensions: {
                    length: '35',
                    width: '25',
                    height: '2',
                },
                categories: [
                    { id: 1, name: 'Electronics' },
                    { id: 2, name: 'Computers' }
                ],
                primary_image: {
                    id: 1,
                    image_url: '/images/laptop-primary.jpg',
                    alt_text: 'Laptop HP 15 primary view'
                },
                images: [
                    {
                        id: 1,
                        image_url: '/images/laptop-1.jpg',
                        alt_text: 'Laptop view 1'
                    },
                    {
                        id: 2,
                        image_url: '/images/laptop-2.jpg',
                        alt_text: 'Laptop view 2'
                    }
                ]
            }
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockResourceData = mockProduct
        shouldThrowError = false
    })

    describe('Rendu de la page', () => {
        it('devrait afficher les informations du produit', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
                expect(screen.getByText('LAP-HP-001')).toBeInTheDocument()
                expect(screen.getByText(/899\,99/)).toBeInTheDocument()
            })
        })

        it('devrait afficher la description courte du produit', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/high performance laptop for professionals/i)).toBeInTheDocument()
            })
        })

        it('devrait afficher les catégories du produit', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Electronics')).toBeInTheDocument()
                expect(screen.getByText('Computers')).toBeInTheDocument()
            })
        })

        it('devrait afficher le prix comparatif si disponible', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/999\,99/)).toBeInTheDocument()
            })
        })

        it('devrait afficher le statut de stock', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getAllByText(/en stock/i)).not.toHaveLength(0)
            })
        })
    })

    describe('Affichage de la galerie d\'images', () => {
        it('devrait afficher l\'image principale du produit', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                const mainImage = screen.getByAltText('Laptop HP 15 primary view')
                expect(mainImage).toBeInTheDocument()
                expect(mainImage).toHaveAttribute('src', '/images/laptop-primary.jpg')
            })
        })

        it('devrait afficher les images miniatures', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByAltText('Laptop view 1')).toBeInTheDocument()
                expect(screen.getByAltText('Laptop view 2')).toBeInTheDocument()
            })
        })

        it('devrait utiliser une image de placeholder si aucune image n\'est disponible', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        primary_image: null,
                        images: []
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                const placeholderImage = screen.getByAltText('Laptop HP 15')
                expect(placeholderImage).toBeInTheDocument()
                expect(placeholderImage).toHaveAttribute('src', '/placeholder.png')
            })
        })

        it('devrait utiliser la première image si primary_image est absente', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        primary_image: null,
                        images: [
                            {
                                id: 1,
                                image_url: '/images/first-image.jpg',
                                alt_text: 'First image'
                            }
                        ]
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                // Il y a deux 'première image' : celle dans le slider et celle en miniature
                const firstImage = screen.getAllByAltText('First image')[0]

                expect(firstImage).toBeInTheDocument()
                expect(firstImage).toHaveAttribute('src', '/images/first-image.jpg')
            })
        })
    })

    describe('Section des détails du produit', () => {
        it('devrait afficher la description complète', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/full description of the laptop/i)).toBeInTheDocument()
            })
        })

        it('devrait afficher les dimensions et le poids', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/35 cm/i)).toBeInTheDocument()
                expect(screen.getByText(/25 cm/i)).toBeInTheDocument()
                expect(screen.getByText(/2 cm/i)).toBeInTheDocument()
                expect(screen.getByText(/2\.5kg/i)).toBeInTheDocument()
            })
        })
    })

    describe('Gestion des erreurs', () => {
        it('devrait afficher un message si le produit n\'est pas trouvé', async () => {
            mockResourceData = {
                success: false,
                data: null
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText(/produit introuvable/i)).toBeInTheDocument()
            })
        })

        it('devrait gérer les erreurs de chargement', () => {
            shouldThrowError = true

            // ErrorBoundary devrait attraper l'erreur
            render(<ProductShow />, { wrapper: Wrapper })

            // Le comportement exact dépend de l'implémentation de ErrorBoundary

            // NOTE: ce test devrait afficher un message dans le terminal => Ceci est normal
            // ErrorBoundary a attrapé une erreur: Error: Failed to fetch product
            //     at /app/src/__tests__/pages/products/ProductShow.test.jsx:31:23
            //     at ShowProduct (/app/src/pages/products/ProductShow.jsx:19:25)
            //     at Object.react_stack_bottom_frame (/app/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20)
            //     at renderWithHooks (/app/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22)
            //     at updateFunctionComponent (/app/node_modules/react-dom/cjs/react-dom-client.development.js:10166:19)
            //     at beginWork (/app/node_modules/react-dom/cjs/react-dom-client.development.js:11778:18)
            //     at runWithFiberInDEV (/app/node_modules/react-dom/cjs/react-dom-client.development.js:874:13)
            //     at performUnitOfWork (/app/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22)
            //     at workLoopSync (/app/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41)
            //     at renderRootSync (/app/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11) {
        })
    })

    describe('Mise en page et structure', () => {
        it('devrait afficher la mise en page en grille pour desktop', async () => {
            const { container } = render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                const grid = container.querySelector('.grid.md\\:grid-cols-2')
                expect(grid).toBeInTheDocument()
            })
        })

        it('devrait séparer les images et les informations produit', async () => {
            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                // Image section
                expect(screen.getByAltText('Laptop HP 15 primary view')).toBeInTheDocument()

                // Info section
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
                expect(screen.getByText(/899\,99/)).toBeInTheDocument()
            })
        })

        it('devrait afficher les détails du produit sous la section principale', async () => {
            const { container } = render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                const detailsSection = container.querySelector('.mt-12')
                expect(detailsSection).toBeInTheDocument()
            })
        })
    })

    describe('Données produit manquantes', () => {
        it('devrait gérer un produit sans catégories', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        categories: []
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
            })

            // Should not crash even without categories
            expect(screen.queryByText('Electronics')).not.toBeInTheDocument()
        })

        it('devrait gérer un produit sans compare_price', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        compare_price: null
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
                expect(screen.getByText(/899\,99/)).toBeInTheDocument()
            })
        })

        it('devrait gérer un produit en rupture de stock', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        in_stock: false,
                        quantity: 0
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
            })

            // Should show out of stock status
            await waitFor(() => {
                const stockElement = screen.queryByText(/en stock/i)
                expect(stockElement).not.toBeInTheDocument()
            })
        })

        it('devrait gérer un produit sans dimensions ou poids', async () => {
            mockResourceData = {
                success: true,
                data: {
                    data: {
                        ...mockProduct.data.data,
                        weight: null,
                        dimensions: null
                    }
                }
            }

            render(<ProductShow />, { wrapper: Wrapper })

            await waitFor(() => {
                expect(screen.getByText('Laptop HP 15')).toBeInTheDocument()
            })
        })
    })
})
