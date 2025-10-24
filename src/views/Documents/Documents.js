import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import ExportButton from '../ExportButton'
import { deleteRequest, getRequest } from '../../Helpers'
import toast from 'react-hot-toast'
import { Pagination } from 'antd'
import axios from 'axios'
import DocumentsModal from './DocumentsModal'

const Documents = () => {
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

  // ✅ Fetch Documents with Pagination + Search
  useEffect(() => {
    getRequest(`documents?search=${searchTerm}&page=${page}&limit=${limit}`)
      .then((res) => {
        const responseData = res?.data?.data
        setData(responseData?.documents || [])
        setTotal(responseData?.totalDocuments || 0)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }, [page, limit, searchTerm, updateStatus])

  // ✅ Delete handler
  const confirmDelete = () => {
    deleteRequest(`documents/${selectedItem?._id}`)
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
    <div className="bg-white w-full min-h-screen">
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 w-full max-w-md rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete <strong>{selectedItem?.name}</strong>?
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-md text-sm sm:text-base"
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage Documents</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ExportButton data={data} fileName="Documents.xlsx" sheetName="Documents" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 hover:bg-green-700 flex items-center justify-center rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Documents
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200">
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
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Table (Responsive) */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left">Sr. No.</th>
              <th className="px-4 sm:px-6 py-3 text-left">Name</th>
              <th className="px-4 sm:px-6 py-3 text-left">Active</th>
              <th className="px-4 sm:px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-3 text-gray-700">
                  {(page - 1) * limit + (index + 1)}
                </td>
                <td className="px-4 sm:px-6 py-3 break-words">{item?.name}</td>
                <td className="px-4 sm:px-6 py-3">
                  {item?.isActive ? (
                    <span className="px-2 py-1 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs sm:text-sm bg-red-100 text-red-800 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setIsModalOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item)
                      setShowDeleteModal(true)
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center sm:justify-end py-4 px-4 sm:px-6">
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

      {/* Modal */}
      {isModalOpen && (
        <DocumentsModal
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

export default Documents
