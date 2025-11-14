import { useState, useEffect } from 'react'
import { productService } from '../services/api'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts(currentPage)
  }, [currentPage])

  const fetchProducts = async (page) => {
    try {
      setLoading(true)
      setError(null)
      const response = await productService.getAll(page)
      setProducts(response.data || [])
      setPagination(response.pagination || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' }
    } else if (stock < 10) {
      return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { label: 'In Stock', className: 'bg-green-100 text-green-800' }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
        {pagination && (
          <p className="text-gray-600 mt-1">
            Showing {pagination.from} to {pagination.to} of {pagination.total} products
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No products found. Add your first product!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock)
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </div>

                    <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-800">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium text-gray-800">{product.stock} units</span>
                    </div>
                    {product.sku && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-mono text-sm text-gray-700">{product.sku}</span>
                      </div>
                    )}
                    {product.description && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const current = pagination.current_page
                    const total = pagination.last_page
                    const pages = []
                    
                    // Always show first page
                    pages.push(1)
                    
                    // Calculate range around current page
                    let start = Math.max(2, current - 1)
                    let end = Math.min(total - 1, current + 1)
                    
                    // Adjust if we're near the start
                    if (current <= 3) {
                      end = Math.min(4, total - 1)
                    }
                    
                    // Adjust if we're near the end
                    if (current >= total - 2) {
                      start = Math.max(total - 3, 2)
                    }
                    
                    // Add ellipsis before range if needed
                    if (start > 2) {
                      pages.push('ellipsis')
                    }
                    
                    // Add pages in range
                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== total) {
                        pages.push(i)
                      }
                    }
                    
                    // Add ellipsis after range if needed
                    if (end < total - 1) {
                      pages.push('ellipsis')
                    }
                    
                    // Always show last page (if more than 1 page)
                    if (total > 1) {
                      pages.push(total)
                    }
                    
                    // Remove duplicate ellipsis
                    const finalPages = []
                    let lastWasEllipsis = false
                    for (const page of pages) {
                      if (page === 'ellipsis') {
                        if (!lastWasEllipsis) {
                          finalPages.push(page)
                          lastWasEllipsis = true
                        }
                      } else {
                        finalPages.push(page)
                        lastWasEllipsis = false
                      }
                    }
                    
                    return finalPages.map((page, index) => {
                      if (page === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        )
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-md transition duration-200 min-w-[40px] ${
                            page === pagination.current_page
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                  disabled={currentPage === pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
                >
                  Next
                </button>
              </div>
              
              <p className="text-sm text-gray-600">
                Showing {pagination.from} to {pagination.to} of {pagination.total} products
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductList

