import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Input, Badge, Loading } from '../components/common'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  MessageCircle,
  Search,
  Users,
  Clock,
  Send,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  User,
  Car,
  Filter,
  Eye,
  Ban,
  Flag
} from 'lucide-react'

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all', // all, active, reported, archived
    timeframe: 'all' // all, today, week, month
  })

  // Mock data para demostración del sistema de chat administrativo
  const mockConversations = [
    {
      _id: '1',
      participants: [
        {
          _id: 'user1',
          firstName: 'María',
          lastName: 'González',
          avatar: null,
          email: 'maria@example.com'
        },
        {
          _id: 'user2',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          avatar: null,
          email: 'carlos@example.com'
        }
      ],
      lastMessage: {
        content: 'Perfecto, nos vemos en el punto de encuentro a las 8:00 AM',
        sender: 'user1',
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutos atrás
      },
      unreadCount: 0,
      status: 'active',
      updatedAt: new Date(Date.now() - 1000 * 60 * 15),
      relatedTrip: {
        _id: 'trip1',
        origin: { city: 'Buenos Aires' },
        destination: { city: 'La Plata' },
        departureDate: new Date()
      },
      flagged: false
    },
    {
      _id: '2',
      participants: [
        {
          _id: 'user3',
          firstName: 'Ana',
          lastName: 'López',
          avatar: null,
          email: 'ana@example.com'
        },
        {
          _id: 'user4',
          firstName: 'Diego',
          lastName: 'Martín',
          avatar: null,
          email: 'diego@example.com'
        }
      ],
      lastMessage: {
        content: 'Hay algún problema con el conductor, no aparece en el punto de encuentro',
        sender: 'user3',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      },
      unreadCount: 3,
      status: 'reported',
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      relatedTrip: {
        _id: 'trip2',
        origin: { city: 'Córdoba' },
        destination: { city: 'Rosario' },
        departureDate: new Date()
      },
      flagged: true
    },
    {
      _id: '3',
      participants: [
        {
          _id: 'user5',
          firstName: 'Lucía',
          lastName: 'Fernández',
          avatar: null,
          email: 'lucia@example.com'
        },
        {
          _id: 'user6',
          firstName: 'Martín',
          lastName: 'Silva',
          avatar: null,
          email: 'martin@example.com'
        }
      ],
      lastMessage: {
        content: 'Gracias por el viaje, todo perfecto!',
        sender: 'user5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      unreadCount: 0,
      status: 'completed',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      relatedTrip: {
        _id: 'trip3',
        origin: { city: 'Mendoza' },
        destination: { city: 'San Juan' },
        departureDate: new Date(Date.now() - 1000 * 60 * 60 * 4)
      },
      flagged: false
    }
  ]

  const mockMessages = {
    '1': [
      {
        _id: 'msg1',
        content: 'Hola! Soy María, confirmo mi lugar en el viaje a La Plata',
        sender: { _id: 'user1', firstName: 'María', lastName: 'González' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60)
      },
      {
        _id: 'msg2',
        content: 'Perfecto María! Te confirmo el lugar. Nos encontramos en Plaza de Mayo a las 8:00 AM',
        sender: { _id: 'user2', firstName: 'Carlos', lastName: 'Rodríguez' },
        timestamp: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        _id: 'msg3',
        content: 'Perfecto, nos vemos en el punto de encuentro a las 8:00 AM',
        sender: { _id: 'user1', firstName: 'María', lastName: 'González' },
        timestamp: new Date(Date.now() - 1000 * 60 * 15)
      }
    ],
    '2': [
      {
        _id: 'msg4',
        content: 'Hola! Tengo una reserva para el viaje a Rosario',
        sender: { _id: 'user3', firstName: 'Ana', lastName: 'López' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        _id: 'msg5',
        content: 'Hola Ana! Confirmado, nos vemos mañana a las 9:00 AM',
        sender: { _id: 'user4', firstName: 'Diego', lastName: 'Martín' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60)
      },
      {
        _id: 'msg6',
        content: 'Hay algún problema con el conductor, no aparece en el punto de encuentro',
        sender: { _id: 'user3', firstName: 'Ana', lastName: 'López' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ]
  }

  const filteredConversations = mockConversations.filter(conversation => {
    const matchesSearch = conversation.participants.some(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || conversation.relatedTrip?.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.relatedTrip?.destination.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filters.status === 'all' || conversation.status === filters.status

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', label: 'Activa' },
      reported: { variant: 'danger', label: 'Reportada' },
      completed: { variant: 'info', label: 'Completada' },
      archived: { variant: 'secondary', label: 'Archivada' }
    }

    const config = statusConfig[status] || statusConfig.active
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getConversationMessages = (conversationId) => {
    return mockMessages[conversationId] || []
  }

  const handleFlagConversation = (conversationId) => {
    toast.success('Conversación marcada para revisión')
  }

  const handleArchiveConversation = (conversationId) => {
    toast.success('Conversación archivada')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Chat y Mensajería</h1>
        <div className="flex items-center gap-4">
          <Badge variant="info">
            {filteredConversations.length} conversaciones
          </Badge>
          <Badge variant="warning">
            {filteredConversations.filter(c => c.flagged).length} reportadas
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar conversaciones por usuario, email o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="reported">Reportadas</option>
                <option value="completed">Completadas</option>
                <option value="archived">Archivadas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
              >
                <option value="all">Todos</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Conversaciones
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${
                    conversation.flagged ? 'border-l-4 border-l-red-500' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="flex -space-x-2">
                        {conversation.participants.slice(0, 2).map((participant, index) => (
                          <div
                            key={participant._id}
                            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white"
                            style={{ zIndex: 2 - index }}
                          >
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {conversation.participants.map(p => p.firstName).join(' y ')}
                          </h3>
                          {getStatusBadge(conversation.status)}
                          {conversation.flagged && (
                            <Flag className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="danger" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {format(new Date(conversation.updatedAt), 'HH:mm', { locale: es })}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>

                      {conversation.relatedTrip && (
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                          <Car className="w-3 h-3 mr-1" />
                          {conversation.relatedTrip.origin.city} → {conversation.relatedTrip.destination.city}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Flag className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFlagConversation(conversation._id)
                          }}
                          title="Marcar para revisión"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Chat Messages */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {selectedConversation ? (
                  <div>
                    <span>
                      {selectedConversation.participants.map(p => p.firstName).join(' y ')}
                    </span>
                    {selectedConversation.relatedTrip && (
                      <div className="text-sm text-gray-500">
                        {selectedConversation.relatedTrip.origin.city} → {selectedConversation.relatedTrip.destination.city}
                      </div>
                    )}
                  </div>
                ) : (
                  'Selecciona una conversación'
                )}
              </div>
              {selectedConversation && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Ban className="w-4 h-4" />}
                    onClick={() => handleArchiveConversation(selectedConversation._id)}
                  >
                    Archivar
                  </Button>
                </div>
              )}
            </Card.Title>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="h-96 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {getConversationMessages(selectedConversation._id).map((message) => (
                      <div key={message._id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender.firstName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.timestamp), 'HH:mm dd/MM', { locale: es })}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Notice */}
                  <div className="border-t p-4 bg-yellow-50">
                    <div className="flex items-center space-x-2 text-sm text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span>Vista administrativa - Solo monitoreo</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      Los administradores pueden ver las conversaciones para propósitos de moderación y soporte.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Selecciona una conversación para ver los mensajes</p>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Conversaciones Totales</h3>
            <p className="text-3xl font-bold text-blue-600">{mockConversations.length}</p>
            <p className="text-sm text-gray-600">En el sistema</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Conversaciones Activas</h3>
            <p className="text-3xl font-bold text-green-600">
              {mockConversations.filter(c => c.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">En tiempo real</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reportes</h3>
            <p className="text-3xl font-bold text-red-600">
              {mockConversations.filter(c => c.flagged).length}
            </p>
            <p className="text-sm text-gray-600">Requieren atención</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Usuarios Activos</h3>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(mockConversations.flatMap(c => c.participants.map(p => p._id))).size}
            </p>
            <p className="text-sm text-gray-600">En conversaciones</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Chat