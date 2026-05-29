import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Badge, Loading } from '../components/common'
import { adminService } from '../services'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Flag, Filter } from 'lucide-react'

const statusLabels = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  dismissed: 'Descartado',
}

const UserReports = () => {
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 20 })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-reports', filters],
    queryFn: () =>
      adminService.userReports.getAll({
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit,
      }),
    keepPreviousData: true,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.userReports.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user-reports'])
      toast.success('Reporte actualizado')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar')
    },
  })

  const reports = data?.data || []
  const total = data?.total ?? 0
  const page = data?.page ?? 1
  const pages = data?.pages ?? 1

  if (isLoading && !data) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flag className="w-7 h-7 text-amber-500" />
            Reportes de usuarios
          </h1>
          <p className="text-gray-600 mt-1">Denuncias enviadas desde la app móvil.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
            }
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="reviewed">Revisado</option>
            <option value="dismissed">Descartado</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denunciante</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay reportes
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {r.createdAt
                        ? format(new Date(r.createdAt), 'dd MMM yyyy HH:mm', { locale: es })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {r.reporter?.firstName} {r.reporter?.lastName}
                      </div>
                      <div className="text-gray-500 text-xs">{r.reporter?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {r.reportedUser?.firstName} {r.reportedUser?.lastName}
                      </div>
                      <div className="text-gray-500 text-xs">{r.reportedUser?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-md">
                      <span className="line-clamp-3">{r.reason}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'pending' ? 'warning' : 'default'}>
                        {statusLabels[r.status] || r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                updateMutation.mutate({ id: r._id, status: 'reviewed' })
                              }
                            >
                              Marcar revisado
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateMutation.mutate({ id: r._id, status: 'dismissed' })
                              }
                            >
                              Descartar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-sm text-gray-600">
              Total: {total} — Página {page} de {pages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default UserReports
