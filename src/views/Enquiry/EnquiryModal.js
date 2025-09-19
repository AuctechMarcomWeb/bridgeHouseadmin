/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable prettier/prettier */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getRequest, postRequest, putRequest } from '../../Helpers'

const EnquiryModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
          property: modalData?.property?._id,
        }
      : {
          name: '',
          property: '',
          email: '',
          phone: '',
          message: '',
          status: 'new', // default value
        },
  )
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [allProperties, setAllProperties] = useState([])
  const [errors, setErrors] = useState({})
  console.log('formData', formData)

  //

  const handleCancel = () => {
    setFormData({
      name: '',
      property: '',
      email: '',
      phone: '',
      message: '',
      status: '', // default value
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

  // 🔹 Get Properties details
  useEffect(() => {
    getRequest(`properties?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        setAllProperties(responseData.properties)
        console.log('Properties', responseData)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }, [page, limit])

  const validateForm = () => {
    let newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'Name is required'
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required'
    if (!formData.email?.trim()) newErrors.email = 'Email is required'
    if (!formData.message?.trim()) newErrors.message = 'Message is required'
    if (!formData.property?.trim()) newErrors.property = 'Property selection is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({ url: `enquiry`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Enquiry added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    putRequest({ url: `enquiry/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Enquiry updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  return (
    <Modal
      title={modalData ? `Edit Enquiry` : `Add Enquiry`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={800}
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
              value={formData?.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
            {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          {/* Phone */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Phone</label>
            <input
              type="number"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              name="phone"
              value={formData?.phone}
              onChange={handleChange}
              placeholder="Enter phone"
            />
            {errors?.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
        </div>

        <div className="row">
          {/* E-mail */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">E-mail </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              name="email"
              value={formData?.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors?.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          {/* Message */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Message </label>
            <input
              type="message"
              className={`form-control ${errors.message ? 'is-invalid' : ''}`}
              name="message"
              value={formData?.message}
              onChange={handleChange}
              placeholder="Enter message"
            />
            {errors?.message && <div className="invalid-feedback">{errors.message}</div>}
          </div>
        </div>

        <div className="row">
          {/* Property Selection */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Property</label>
            <select
              className={`form-select ${errors.property ? 'is-invalid' : ''}`}
              name="property"
              value={formData?.property}
              onChange={handleChange}
            >
              <option value="">Select Property</option>
              {allProperties?.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name || property.title}
                </option>
              ))}
            </select>
            {errors.property && <div className="invalid-feedback">{errors.property}</div>}
          </div>
          {/* Notes */}
          {modalData && (
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Notes</label>
              <input
                type="text"
                className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                name="notes"
                value={formData?.notes || 'N/A'} // default blank if undefined
                onChange={handleChange}
                placeholder="Enter notes"
              />
              {errors?.notes && <div className="invalid-feedback">{errors.notes}</div>}
            </div>
          )}

          {/* Status */}
          <div className=" col-md-6 mb-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData?.status} // default "new"
              onChange={handleChange}
            >
              <option value="new">New</option>
              <option value="viewed">Viewed</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Enquiry'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EnquiryModal
