/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useContext } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import EnquiryModal from './EnquiryModal'
import { AppContext } from '../../Context/AppContext'

const Enquiry = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const { user, setUser } = useContext(AppContext)
const [expandedAddresses, setExpandedAddresses] = React.useState({})

  const toggleAddress = (id) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }
  // ✅ Fetch Banners with Pagination + Search
  useEffect(() => {
    setLoading(true)
    getRequest(`enquiry?search=${searchTerm}&page=${page}&limit=${limit}&addedBy=${user?._id}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.enquiries || [])
        console.log('Enquiry responseData', responseData)
        setTotal(responseData?.totalEnquiries || 0)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error('Failed to fetch enquiry')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page, limit, searchTerm, updateStatus,user?._id])

  // ✅ Delete handler
  const confirmDelete = () => {
    deleteRequest(`enquiry/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'enquiry deleted successfully')
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error('Failed to delete enquiry')
      })
  }

  return (
    <div className="bg-white">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedItem?.title}</strong>? This action
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
         <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Enquiry</h2>
           <p className="text-gray-600 text-sm sm:text-base">Manage Enquiry content</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {' '}
          <ExportButton data={data} fileName="Banners.xlsx" sheetName="Enquiry" />
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Enquiry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          // ✅ Loader while fetching banners
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">Loading Enquiries...</div>
          </div>
        ) : !data || data.length === 0 ? (
          // ✅ Empty state when no banners found
          <div className="flex justify-center items-center py-20">
            <Empty description="No enquiries found" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Sr. No.</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">E-Mail</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Property Code</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr key={item?._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * limit + (index + 1)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">{item?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                     {item?.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item?.email}
                    </td>
                     <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => toggleAddress(item._id)}
                    >
                      {expandedAddresses[item._id]
                        ? item?.message
                        : item?.message.split(' ').slice(0, 2).join(' ') + '...'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item?.property?.name || 'N/A'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <p className="p-0 m-0">{item?.property?.propertyCode || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'New'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Edit banner"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete banner"
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                    results
                  </div>
                  <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
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

      {/* Enquiry Modal */}
      {isModalOpen && (
        <EnquiryModal
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

export default Enquiry
