/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-undef */

import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { postRequest, putRequest } from '../../Helpers'

const SubscriptionModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [formData, setFormData] = useState(
    modalData
      ? { ...modalData }
      : {
          name: '',
          description: '',
          type: '',
          price: '',
          currency: '',
          PropertyListingLimit: '',
          verifiedListingLimit: '',
        },
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  console.log('formData', formData)

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      price: '',
      currency: '',
      PropertyListingLimit: '',
      verifiedListingLimit: '',
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'Name is required'
    if (!formData.description?.trim()) newErrors.description = 'Description is required'
    if (!formData.type?.trim()) newErrors.type = 'Type is required'
    if (!formData.price?.toString().trim()) newErrors.price = 'Price is required'
    if (!formData.currency?.trim()) newErrors.currency = 'Currency is required'
    if (!formData.PropertyListingLimit?.toString().trim())
      newErrors.PropertyListingLimit = 'Property listing limit is required'
    if (!formData.verifiedListingLimit?.toString().trim())
      newErrors.verifiedListingLimit = 'Verified listing limit is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    postRequest({ url: 'subscription-packages', cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Subscription added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  const handleEdit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Only send the editable fields in edit mode
    const updatedData = {
      price: formData.price,
      PropertyListingLimit: formData.PropertyListingLimit,
    }
    putRequest({ url: `subscription-packages/${modalData?._id}`, cred: updatedData })
      .then((res) => {
        toast.success(res?.data?.message || 'Subscription updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? `Edit Subscription` : `Add Subscription`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={700}
    >
      <form
        onSubmit={modalData ? handleEdit : handleSubmit}
        className="needs-validation"
        noValidate
      >
        <div className="row">
          {/* Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter subscription name"
              disabled={!!modalData} // Disable in edit mode
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          {/* Description */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows="1"
              disabled={!!modalData} // disable in edit mode
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
        </div>

        <div className="row">
          {/* Type */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Type</label>
            <select
              id="type"
              name="type"
              className="form-select"
              value={formData?.type} // default "new"
              onChange={handleChange}
              disabled={!!modalData} // disable in edit mode
            >
              <option value="Select">Select Type</option>
              <option value="PropertyListing">PropertyListing</option>
              <option value="VerifiedListing">VerifiedListing</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          {/* Price */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Price</label>
            <input
              type="number"
              className={`form-control ${errors.price ? 'is-invalid' : ''}`}
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
            />
            {errors.price && <div className="invalid-feedback">{errors.price}</div>}
          </div>
        </div>

        <div className="row">
          {/* Currency */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Currency</label>
            <input
              type="text"
              className={`form-control ${errors.currency ? 'is-invalid' : ''}`}
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="e.g. INR, USD"
              disabled={!!modalData} // disable in edit mode
            />
            {errors.currency && <div className="invalid-feedback">{errors.currency}</div>}
          </div>

          {/* Property Listing Limit */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Property Listing Limit</label>
            <input
              type="number"
              className={`form-control ${errors.PropertyListingLimit ? 'is-invalid' : ''}`}
              name="PropertyListingLimit"
              value={formData?.PropertyListingLimit}
              onChange={handleChange}
              placeholder="Enter property listing limit"
              disabled={!!modalData} // disable in edit mode
            />
            {errors.PropertyListingLimit && (
              <div className="invalid-feedback">{errors.PropertyListingLimit}</div>
            )}
          </div>
        </div>

        {/* Verified Listing Limit */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Verified Listing Limit</label>
          <input
            type="number"
            className={`form-control ${errors.verifiedListingLimit ? 'is-invalid' : ''}`}
            name="verifiedListingLimit"
            value={formData?.verifiedListingLimit}
            onChange={handleChange}
            placeholder="Enter verified listing limit"
          />
          {errors.verifiedListingLimit && (
            <div className="invalid-feedback">{errors.verifiedListingLimit}</div>
          )}
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : modalData ? 'Update Subscription' : 'Save Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SubscriptionModal
