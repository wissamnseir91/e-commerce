import { useState, useEffect } from 'react'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import Login from './components/Login'
import Register from './components/Register'
import { authService } from './services/api'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      setUser(authService.getUserData())
    } else {
      setUser(null)
    }
  }

  const handleLoginSuccess = () => {
    checkAuth()
    setShowAuthModal(false)
    // If user was trying to add product, show the form now
    if (showForm) {
      setShowForm(true)
    }
  }

  const handleRegisterSuccess = () => {
    checkAuth()
    setShowAuthModal(false)
    // If user was trying to add product, show the form now
    if (showForm) {
      setShowForm(true)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      checkAuth()
      setShowForm(false)
    }
  }

  const handleAddProductClick = () => {
    // If form is already showing, just close it
    if (showForm) {
      setShowForm(false)
      return
    }
    
    // Otherwise, open form (check auth first)
    if (!isAuthenticated) {
      setShowAuthModal(true)
      setShowLogin(true)
    } else {
      setShowForm(true)
    }
  }

  const handleProductAdded = () => {
    setRefreshKey(prev => prev + 1)
    setShowForm(false)
  }

  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              E-Commerce Product Listing
            </h1>
            <div className="flex items-center gap-4">
              {isAuthenticated && user && (
                <span className="text-gray-700">Welcome, {user.name}</span>
              )}
              <button
                onClick={handleAddProductClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                {showForm ? 'View Products' : 'Add Product'}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true)
                    setShowLogin(true)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <ProductForm 
            onProductAdded={handleProductAdded} 
            onCancel={() => setShowForm(false)}
            onAuthRequired={() => {
              setShowAuthModal(true)
              setShowLogin(true)
            }}
          />
        ) : (
          <ProductList key={refreshKey} />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {showLogin ? (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowLogin(false)}
              />
            ) : (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setShowLogin(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

