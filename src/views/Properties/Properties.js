/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  MapPin,
  IndianRupee,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest, putRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import PropertiesModal from './PropertiesModal'
import { AppContext } from '../../Context/AppContext'
import { MdVerified } from 'react-icons/md'
import { SiMercadopago } from 'react-icons/si'
import Filter from './Filter'

const Properties = () => {
  const googleApiKey = import.meta.env.VITE_GOOGLE_API

  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [approvalStatus, setApprovalStatus] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)
  // Applied filters for API
  const [filters, setFilters] = useState({
    status: '',
    propertyType: '',
    approvalStatus: '',
    isVerified: '',
    isAdopted: '',
  })

  // Temporary filters inside Filter component
  const [tempFilters, setTempFilters] = useState(filters)

  // Fetch properties
  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams({
      search: searchTerm,
      page,
      limit,
      ...filters,
    }).toString()

    getRequest(`properties?${query}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.properties || [])
        setTotal(responseData?.totalProperties || responseData?.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, limit, searchTerm, filters, updateStatus])

  const applyFilters = () => {
    setFilters(tempFilters)
    setPage(1) // Reset page
  }

  const resetFilters = () => {
    const defaultFilters = {
      status: '',
      propertyType: '',
      approvalStatus: '',
      isVerified: '',
      isAdopted: '',
    }
    setTempFilters(defaultFilters)
    setFilters(defaultFilters)
    setPage(1)
    setSearchTerm('')
  }

  // ✅ Delete handler
  const confirmDelete = () => {
    deleteRequest(`properties/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message)
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error('Delete failed')
      })
  }

  const approveData = (data, status) => {
    console.log('approveData', data)
    setLoading(true)
    putRequest({
      url: `properties/${data?._id}`,
      cred: {
        approvalStatus: status,
      },
    })
      .then((res) => {
        console.log('res', res?.data)
        setUpdateStatus((prev) => !prev)
        toast.success(res?.data?.message)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
      .finally(() => setLoading(false))
  }
  // ✅ Property Verify Karne ka Function
  const verifyProperty = (data) => {
    setLoading(true)
    putRequest({
      url: `properties/${data?._id}`,
      cred: { isVerified: true },
    })
      .then((res) => {
        console.log('Verified:', res?.data)
        setUpdateStatus((prev) => !prev)
        toast.success(res?.data?.message)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
      .finally(() => setLoading(false))
  }

  // ✅ Property Adopt Karne ka Function
  const adoptProperty = (data) => {
    setLoading(true)
    putRequest({
      url: `properties/${data?._id}`,
      cred: { isAdopted: true },
    })
      .then((res) => {
        console.log('Adopted:', res?.data)
        setUpdateStatus((prev) => !prev)
        toast.success(res?.data?.message)
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
      .finally(() => setLoading(false))
  }

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedItem?.name}</strong>?
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
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700"
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage Properties</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ExportButton data={data} fileName="Properties.xlsx" sheetName="Properties" />
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </button>
        </div>
      </div>

      {/* Search */}
      <Filter
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        page={setPage}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          // ✅ Loader State
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">Loading Properties...</div>
          </div>
        ) : !data || data.length === 0 ? (
          // ✅ Empty State
          <div className="flex justify-center items-center py-20">
            <Empty description="No properties found" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3">Sr. No.</th>
                  <th className="px-6 py-3">Property Title</th>
                  <th className="px-6 py-3">Poperty Type</th>
                  <th className="px-6 py-3">Poperty Status</th>
                  <th className="px-6 py-3">Approval Status</th>
                  <th className="px-6 py-3">Adopted Status</th>
                  <th className="px-6 py-3">Verified Status</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Gallery</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`${
                      item?.approvalStatus === 'Published'
                        ? 'bg-green-200 hover:bg-green-100'
                        : item?.approvalStatus === 'Rejected'
                          ? 'bg-red-200 hover:bg-red-100'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Serial No */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * limit + (index + 1)}
                    </td>

                    {/* Property Details */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{item?.name}</div>
                        {/* <div
                          className="text-sm text-gray-500 truncate"
                          style={{ maxWidth: '200px' }}
                        >
                          {item?.address}
                        </div> */}
                        {item?.description && (
                          <div
                            className="text-xs text-gray-400 truncate mt-1"
                            style={{ maxWidth: '200px' }}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Property Type */}
                    <td className="px-6 py-4">{item?.propertyType || 'N/A'}</td>
                    {/* Property Status */}
                    {/* Property Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          item?.status === 'Available'
                            ? 'bg-green-100 text-green-800'
                            : item?.status === 'Sold'
                              ? 'bg-red-100 text-red-800'
                              : item?.status === 'Registered'
                                ? 'bg-blue-100 text-blue-800'
                                : item?.status === 'Booked'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                        }
                      `}
                      >
                        {item?.status || 'N/A'}
                      </span>
                    </td>

                    {/* Approval Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item?.approvalStatus === 'Published'
                            ? 'bg-green-100 text-green-800'
                            : item?.approvalStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item?.approvalStatus || 'N/A'}
                      </span>
                    </td>

                    {/* Adopted Status */}
                    {/* <td className="px-6 py-4">
                      {item?.isAdopted ? (
                        <SiMercadopago className="fs-4 text-green-600" />
                      ) : (
                        <span className="text-gray-500 text-sm">Not Adopted</span>
                      )}
                    </td> */}
                    <td className="px-6 py-4">
                      {item?.isAdopted ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Adopted
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Not Adopted
                        </span>
                      )}
                    </td>

                    {/* Verified Status */}
                    <td className="px-6 py-4">
                      {item?.isVerified ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Verified{' '}
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          Not Verified
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        {/* <MapPin className="w-4 h-4 mr-1" /> */}
                        <div>
                          {item?.location?.coordinates
                            ? item?.address?.split(' ').slice(0, 2).join(' ')
                            : 'No coordinates'}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {formatPrice(item?.sellingPrice)}
                        </div>
                        {item?.actualPrice && item?.actualPrice !== item?.sellingPrice && (
                          <div className="text-xs text-gray-500 line-through flex items-center">
                            <IndianRupee className="w-3 h-3 mr-1" />
                            {formatPrice(item?.actualPrice)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Gallery */}
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {item?.gallery?.slice(0, 3).map((imageUrl, i) => (
                          <img
                            key={i}
                            src={imageUrl}
                            alt={`Gallery ${i + 1}`}
                            className="inline-block w-8 h-8 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                        {item?.gallery?.length > 3 && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-500">
                            +{item.gallery.length - 3}
                          </span>
                        )}
                        {(!item?.gallery || item?.gallery?.length === 0) && (
                          <span className="text-xs text-gray-400">No images</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        {/* Published Button */}
                        <button
                          onClick={() => approveData(item, 'Published')}
                          disabled={item?.approvalStatus === 'Published'}
                          className={`flex items-center justify-center w-6 h-6 rounded ${
                            item?.approvalStatus === 'Rejected'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-blue-800'
                          }`}
                          title="Approve property"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        {/* Rejected Button */}
                        <button
                          onClick={() => approveData(item, 'Rejected')}
                          disabled={item?.approvalStatus === 'Rejected'}
                          className={`flex items-center justify-center w-6 h-6 rounded ${
                            item?.approvalStatus === 'Rejected'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-blue-800'
                          }`}
                          title="Reject property"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        {/* Verified Button */}
                        <button
                          onClick={() => verifyProperty(item)}
                          disabled={item?.isVerified === true}
                          className={`flex items-center justify-center w-6 h-6 rounded ${
                            item?.approvalStatus === 'Rejected'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title="Verify property"
                        >
                          <MdVerified className="w-[15px] h-[15px]" />{' '}
                          {/* Slightly smaller for balance */}
                        </button>

                        {/* Adopted Button */}
                        <button
                          onClick={() => adoptProperty(item)}
                          disabled={item?.isAdopted === true}
                          className={`flex items-center justify-center w-6 h-6 rounded ${
                            item?.approvalStatus === 'Rejected'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-orange-600 hover:text-blue-800'
                          }`}
                          title="Adopt property"
                        >
                          <SiMercadopago className="w-[15px] h-[15px]" />{' '}
                          {/* Adjusted for equal size */}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setIsModalOpen(true)
                          }}
                          className="flex items-center justify-center w-6 h-6 rounded text-blue-600 hover:text-blue-800"
                          title="Edit property"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setSelectedItem(item)
                            setShowDeleteModal(true)
                          }}
                          className="flex items-center justify-center w-6 h-6 rounded text-red-600 hover:text-red-800"
                          title="Delete property"
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
      {/* ✅ Pagination */}
      {!loading && data.length > 0 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {data?.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
            {Math.min(page * limit, total)} of {total} properties
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
          />
        </div>
      )}

      {/* Properties Modal */}
      {isModalOpen && (
        <PropertiesModal
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

export default Properties
