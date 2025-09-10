import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, MapPin, IndianRupee } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Pagination } from 'antd'
import PropertiesModal from './PropertiesModal'

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // ✅ Fetch Properties with Pagination + Search
  useEffect(() => {
    getRequest(`properties?search=${searchTerm}&page=${page}&limit=${limit}`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log("Properties=>>", responseData)
        setData(responseData?.properties || [])
        setTotal(responseData?.totalProperties || responseData?.total || 0)
      })
      .catch((error) => {
        console.log('error', error)
      })
      
  }, [page, limit, searchTerm, updateStatus])

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
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600 mt-1">Manage Properties</p>
        </div>
        <div className="flex items-center space-x-3">
          <ExportButton data={data} fileName="Properties.xlsx" sheetName="Properties" />
          <button
            onClick={() => {
              setSelectedItem(null)
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gallery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                {/* Property Details */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{item?.name}</div>
                    <div className="text-sm text-gray-500 truncate" style={{maxWidth: '200px'}}>
                      {item?.address}
                    </div>
                    {item?.description && (
                      <div className="text-xs text-gray-400 truncate mt-1" style={{maxWidth: '200px'}}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </td>

                {/* Property Type */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item?.propertyType || 'N/A'}
                  </span>
                </td>

                {/* Location */}
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <div>
                      {item?.location?.coordinates ? 
                        `${item.location.coordinates[1]?.toFixed(4)}, ${item.location.coordinates[0]?.toFixed(4)}` : 
                        'No coordinates'
                      }
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
                    {item?.gallery?.slice(0, 3).map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
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

                {/* Status */}
                <td className="px-6 py-4">
                  {item?.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedItem(item)
                        setIsModalOpen(true)
                      }} 
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit property"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item)
                        setShowDeleteModal(true)
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Empty State */}
            {data?.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg mb-2">No properties found</div>
                    <div className="text-sm">Add your first property to get started</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {data?.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, total)} of {total} properties
        </div>
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={(newPage) => setPage(newPage)}
          showSizeChanger={false}
          showQuickJumper
        />
      </div>

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