import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-8">
          <span className="text-6xl font-bold text-primary-600">404</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Página no encontrada
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            to="/"
            variant="primary"
            icon={<Home className="w-4 h-4" />}
          >
            Ir al Dashboard
          </Button>

          <Button
            as={Link}
            to="/login"
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver al Login
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound