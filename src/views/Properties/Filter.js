/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getRequest } from '../../Helpers'

const Filter = ({
  tempFilters,
  setTempFilters,
  searchTerm,
  setSearchTerm,
  applyFilters,
  resetFilters,
}) => {
  const [typeOptions, setTypeOptions] = useState([])

  useEffect(() => {
    getRequest(`category?isPagination=false`)
      .then((res) => setTypeOptions(res?.data?.data?.categories || []))
      .catch(console.error)
  }, [])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value) // Real-time search
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setTempFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="p-4 border-b border-gray-200">
      {/* Filters Heading */}
      <h3 className="text-lg font-semibold mb-4">Filters</h3>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        {/* Property Type */}
        <div>
          <label className="form-label fw-bold mb-1 block">Property Type</label>
          <select
            className="form-select w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="propertyType"
            value={tempFilters.propertyType}
            onChange={handleFilterChange}
          >
            <option value="">Select Property Type</option>
            {typeOptions.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Property Status */}
        <div>
          <label className="form-label fw-bold mb-1 block">Property Status</label>
          <select
            className="form-select w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="status"
            value={tempFilters.status}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Registered">Registered</option>
            <option value="Booked">Booked</option>
          </select>
        </div>

        {/* Approval Status */}
        <div>
          <label className="form-label fw-bold mb-1 block">Approval Status</label>
          <select
            className="form-select w-full border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            name="approvalStatus"
            value={tempFilters.approvalStatus}
            onChange={handleFilterChange}
          >
            <option value="">Select</option>
            <option value="Pending">Pending</option>
            <option value="Published">Published</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Verified */}
        <div className="flex items-center gap-2 mt-4 sm:mt-7">
          <input
            type="checkbox"
            name="isVerified"
            checked={tempFilters.isVerified || false}
            onChange={handleFilterChange}
            className="w-5 h-5"
          />
          <label className="form-label fw-bold">Verified</label>
        </div>

        {/* Adopted */}
        <div className="flex items-center gap-1 mt-4 sm:mt-7">
          <input
            type="checkbox"
            name="isAdopted"
            checked={tempFilters.isAdopted || false}
            onChange={handleFilterChange}
            className="w-5 h-5"
          />
          <label className="form-label fw-bold">Adopted</label>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-2 gap-2">
        {/* Search */}
        <div className="flex-1 sm:flex-[0_0_70%]">
          <label className="form-label fw-bold mb-1 block">Search</label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-2 w-[90%] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default Filter
