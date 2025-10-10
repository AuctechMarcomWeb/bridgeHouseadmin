/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle, Contact } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Empty, Pagination, Spin } from 'antd'
import ContactsModal from './ContactsModal'

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [updateStatus, setUpdateStatus] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)

  //  FetchContact with Pagination + Search
  useEffect(() => {
    setLoading(true)
    getRequest(`bridgeHouseConatct?search=${searchTerm}&page=${page}&limit=${limit}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.contacts || [])
        setTotal(responseData?.totalContacts || 0)
      })
      .catch((error) => {
        console.log('error', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page, limit, searchTerm, updateStatus])

  // ✅ Delete handler
  const confirmDelete = () => {
    deleteRequest(`bridgeHouseConatct/${selectedItem?._id}`)
      .then((res) => {
        toast.success(res?.data?.message)
        setSelectedItem(null)
        setUpdateStatus((prev) => !prev)
        setShowDeleteModal(false)
      })
      .catch((error) => {
        console.log('error', error)
      })
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
          <h2 className="text-2xl font-bold text-gray-900">Contact</h2>
          <p className="text-gray-600 mt-1">Manage Contact</p>
        </div>
        <div className="flex items-center space-x-3">
          <ExportButton data={data} fileName="Property Type.xlsx" sheetName="Property Type" />
          <button
            onClick={() => {
              setIsModalOpen(true)
            }}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
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
        {loading ? (
          // ✅ Loader while fetching banners
          <div className="flex flex-col justify-center items-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-blue-500 font-medium text-center">Loading Contacts...</div>
          </div>
        ) : !data || data.length === 0 ? (
          // ✅ Empty state when no banners found
          <div className="flex justify-center items-center py-20">
            <Empty description="No cotacts found" />
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
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Notes</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {(page - 1) * limit + (index + 1)}
                    </td>
                    <td className="px-6 py-4">{item?.name}</td>
                    <td className="px-6 py-4">{item?.email}</td>
                    <td className="px-6 py-4">{item?.phone}</td>
                    <td className="px-6 py-4">{item?.address}</td>
                    <td className="px-6 py-4">{item?.notes}</td>
                    {/* <td className="px-6 py-4">
                  <img
                    src={item?.email}
                    alt="category"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td> */}
                    {/* <td className="px-6 py-4">
                  {item?.isActive ? (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800">Inactive</span>
                  )}
                </td> */}
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item)
                          setIsModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ Pagination */}
            {data.length > 0 && (
              <div className="flex justify-end py-4">
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
            )}
          </>
        )}
      </div>
      {isModalOpen && (
        <ContactsModal
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

export default Contacts
