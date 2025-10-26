/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import SubscriptionModal from './SubscriptionModal'
import SubscriptionFilter from './SubscriptionFilter'

const Subscription = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filters, setFilters] = useState({ type: '',})
   const [tempFilters, setTempFilters] = useState(filters)
  const [expandedAddresses, setExpandedAddresses] = React.useState({})

  const toggleAddress = (id) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }
  //  Fetch subscription packages with pagination + search
  useEffect(() => {
    setLoading(true)
     const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
      ...filters,
    }).toString()
    getRequest(`subscription-packages?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.packages || [])
        setTotal(responseData?.totalPackages || 0)
      })
      .catch((error) => {
        console.error('Fetch error', error)
        toast.error(error?.res?.data?.message || 'Failed to fetch subscription packages')
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, filters, updateStatus])

    // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters)
    setPage(1) // reset page
  }

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      type: '',
    }
    setTempFilters(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
    setSearchTerm('')
  }

  // ✅ Delete handler
  const confirmDelete = () => {
    if (!selectedItem?._id) return
    deleteRequest(`subscription-packages/${selectedItem._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Subscription deleted successfully')
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch((error) => {
        console.error('delete error', error)
        toast.error(error?.response?.data?.message || 'Failed to delete subscription')
      })
  }

  return (
    <div className="bg-white">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Subscriptions</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your subscription plans and limits
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {' '}
          <ExportButton data={data} fileName="Subscriptions.xlsx" sheetName="Subscriptions" />
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Subscription
          </button>
        </div>
      </div>

      {/* Search */}
     <SubscriptionFilter
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">
              Loading subscriptions...
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Empty description="No subscriptions found" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Sr. No.</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Property Limit</th>
                  <th className="px-6 py-3">Verified Limit</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Currency</th>
                  <th className="px-6 py-3">Description</th>
                  {/* <th className="px-6 py-3">Status</th> */}
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * limit + (index + 1)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item?.PropertyListingLimit || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item?.verifiedListingLimit || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{item?.type || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item?.price || '0'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item?.currency || '—'}</td>
                    {/* <td className="px-6 py-4 word-nowrap">{item?.description || '—'}</td> */}
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => toggleAddress(item._id)}
                    >
                      {expandedAddresses[item._id]
                        ? item?.description
                        : item?.description.split(' ').slice(0, 2).join(' ') + '...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit subscription"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      {/* Pagination */}
      {!loading && data?.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </div>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              pageSizeOptions={['5', '10', '20', '50', '100', '200', '500', '1000']}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={true}
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
              }}
              showQuickJumper
            />
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {isModalOpen && (
        <SubscriptionModal
          setUpdateStatus={setUpdateStatus}
          setModalData={setSelectedItem}
          modalData={selectedItem}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  )
}

export default Subscription
