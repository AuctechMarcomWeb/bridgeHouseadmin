/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { Search, Trash2, AlertTriangle, Plus } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import moment from 'moment'

const PaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fromDate, setFormDate] = useState('')
  const [toDate, setToDate] = useState('')

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD-MM-YYYY') : 'N/A'
  }

  // Fetch Payment History
  useEffect(() => {
    setLoading(true)
    getRequest(
      `payment/getList?search=${searchTerm}&page=${page}&limit=${limit}&sortBy=${sortBy}&fromDate=${fromDate}&toDate=${toDate}`,
    )
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.orders || [])
        setTotal(responseData?.totalOrders || 0)
      })
      .catch((error) => {
        console.error('Fetch error:', error)
        toast.error('Failed to fetch payment list')
      })
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, sortBy, fromDate, toDate, updateStatus])

  // Delete handler
  const confirmDelete = () => {
    if (!selectedItem?._id) return toast.error('No record selected')

    deleteRequest(`payment/delete/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message || 'Payment record deleted successfully')
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch((error) => {
        console.error('Delete error:', error)
        toast.error('Failed to delete record')
      })
  }

  return (
    <div className="bg-white">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this record for{' '}
              <strong>{selectedItem?.user?.name || 'Unknown User'}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded"
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment List</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage Payment List</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ExportButton data={data} fileName="PaymentList.xlsx" sheetName="Payments" />
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* From Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Input */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, etc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Apply Filters */}
            <button
              onClick={() => {
                setPage(1)
                setUpdateStatus((prev) => !prev)
              }}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 hover:bg-blue-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" /> Filters
            </button>

            {/* Clear Filters */}
            {(fromDate || toDate || searchTerm) && (
              <button
                onClick={() => {
                  setFormDate('')
                  setToDate('')
                  setSearchTerm('')
                  setPage(1)
                  setUpdateStatus((prev) => !prev)
                }}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 hover:bg-red-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">
              Loading Payment List...
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Empty description="No records found" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3">Sr. No.</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Account Type</th>
                  <th className="px-6 py-3">Plan Name</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Property Listing</th>
                  <th className="px-6 py-3">Consumed Listing</th>
                  <th className="px-6 py-3">Verified Listing</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Payment ID</th>
                  <th className="px-6 py-3">Subscription Status</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => {
                  const user = item?.user || {}
                  return (
                    <tr key={item._id}>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {(page - 1) * limit + (index + 1)}
                      </td>
                      <td className="px-6 py-4">{user?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{user?.email || 'N/A'}</td>
                      <td className="px-6 py-4">{user?.phone || 'N/A'}</td>
                      <td className="px-6 py-4">{user?.accountType || 'N/A'}</td>
                      <td className="px-6 py-4">{item?.planName || 'N/A'}</td>
                      <td className="px-6 py-4">{item?.quantity || 'N/A'}</td>
                      <td className="px-6 py-4">{user?.PropertyListing || 0}</td>
                      <td className="px-6 py-4">{user?.consumeListing || 0}</td>
                      <td className="px-6 py-4">{user?.verifiedListing || 0}</td>
                      <td className="px-6 py-4">
                        {item?.price !== undefined && item?.price !== null
                          ? Number(item.price).toFixed(2)
                          : 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        {item?.totalAmount !== undefined && item?.totalAmount !== null
                          ? Number(item.totalAmount).toFixed(2)
                          : 'N/A'}
                      </td>

                      <td className="px-6 py-4">{item?.razorpayOrderId || 'N/A'}</td>
                      <td className="px-6 py-4">{item?.razorpayPaymentId || 'N/A'}</td>

                      <td
                        className={`px-6 py-4 font-semibold text-center ${
                          item?.subscriptionStatus?.toLowerCase() === 'pending'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {item?.subscriptionStatus
                          ? item.subscriptionStatus.charAt(0).toUpperCase() +
                            item.subscriptionStatus.slice(1).toLowerCase()
                          : 'N/A'}{' '}
                      </td>

                      <td
                        className={`px-6 py-4 font-semibold text-center ${
                          item?.status?.toLowerCase() === 'paid'
                            ? 'text-green-600 '
                            : 'text-red-600'
                        }`}
                      >
                        {item?.status
                          ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
                          : 'N/A'}{' '}
                      </td>

                      <td className="px-6 py-4">{formatDate(item?.createdAt)}</td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
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
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setLimit(size)
                setPage(1)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
