import { useState } from 'react'
import { productService } from '../services/api'

const ProductForm = ({ onProductAdded, onCancel, onAuthRequired }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    description: '',
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Food & Beverages',
    'Health & Beauty',
  ]

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'image' && files && files[0]) {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        [name]: file,
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    if (!formData.price || parseFloat(formData.price) < 0.01) {
      newErrors.price = 'Price must be at least 0.01'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater'
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      }

      await productService.create(productData)
      
      // Show success message
      setSuccess(true)
      
      // Keep form visible with success message, then close after delay
      setTimeout(() => {
        // Reset form after closing
        setFormData({
          name: '',
          price: '',
          category: '',
          stock: '',
          sku: '',
          description: '',
          image: null,
        })
        setErrors({})
        setImagePreview(null)
        setSuccess(false)
        
        // Close form and refresh list
        onProductAdded()
      }, 1500)
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ submit: 'You must be logged in to add products. Please login first.' })
        // Show auth modal
        if (onAuthRequired) {
          setTimeout(() => {
            onAuthRequired()
          }, 500)
        }
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ submit: err.response?.data?.message || 'Failed to create product' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h2>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">Product created successfully!</p>
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Enter product name"
              disabled={loading || success}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="0.00"
                disabled={loading || success}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="0"
                disabled={loading || success}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={loading || success}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
                placeholder="SKU-1234-ABC"
                disabled={loading || success}
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Product Image (Optional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.image ? 'border-red-500' : 'border-gray-300'
              } ${loading || success ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={loading || success}
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{Array.isArray(errors.image) ? errors.image[0] : errors.image}</p>
            )}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                loading || success ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              placeholder="Enter product description"
              disabled={loading || success}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm

