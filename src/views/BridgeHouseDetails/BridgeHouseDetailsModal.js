/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest } from '../../Helpers'
import { validateMobile } from '../../Utils'

const BridgeHouseDetailsModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
          name: modalData?.name || '',
          email: modalData?.email || '',
          phone: modalData?.phone || '',
          profile: modalData?.profile || '',
          status: modalData?.status || false,
          notes: modalData?.notes || '',
        }
      : {
          name: '',
          email: '',
          phone: '',
          profile: '',
          status: false,
          notes: '',
        },
  )

  // Close modal
  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', profile: '', status: false, notes: '' })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    let newValue = value
    if (name === 'phone') {
      newValue = validateMobile(value) // only digits, max 10 chars
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue,
    }))
  }

  // Upload profile image
  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)

    fileUpload({
      url: 'upload/uploadImage',
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res.data?.data?.imageUrl
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, profile: uploadedUrl }))
          toast.success('Profile uploaded successfully')
        } else {
          toast.error('Image URL not received')
        }
      })
      .catch((error) => {
        console.error('Image upload failed:', error)
        toast.error('Image upload failed')
      })
      .finally(() => setLoading(false))
  }

  // Remove profile image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profile: '' }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.profile) newErrors.profile = 'Profile image is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit new bridge house
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({
      url: 'bridgehouseDetails',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bridge House added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
  }

  // Update existing bridge house
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    putRequest({
      url: `bridgehouseDetails/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Bridge House updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
  }

  return (
    <Modal
      title={modalData ? 'Edit Bridge House' : 'Add Bridge House'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        <div className="row">
          {/* Name */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              className={`form-control ${errors?.name ? 'is-invalid' : ''}`}
              name="name"
              value={formData?.name}
              onChange={handleChange}
              placeholder="Enter name"
              required
            />
            {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className={`form-control ${errors?.email ? 'is-invalid' : ''}`}
              name="email"
              value={formData?.email}
              onChange={handleChange}
              placeholder="Enter Email"
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
        </div>

        <div className="row">
          {/* Phone */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Phone</label>
            <input
              type="number"
              className={`form-control ${errors?.phone ? 'is-invalid' : ''}`}
              name="phone"
              maxLength={10}
              value={formData?.phone}
              onChange={handleChange}
              placeholder="Enter Phone"
              required
            />
            {errors.phone && <div className="invalid-feedback">{errors?.phone}</div>}
          </div>

          {/* Notes */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Notes</label>
            <textarea
              className="form-control"
              name="notes"
              rows="1"
              value={formData?.notes}
              onChange={handleChange}
              placeholder="Enter notes"
              required
            />
          </div>
        </div>

        <div className="row">
          {/* Profile Image */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Profile Image</label>
            <input
              type="file"
              className={`form-control ${errors.profile ? 'is-invalid' : ''}`}
              disabled={loading}
              onChange={handleChangeImage}
            />
            {errors.profile && <div className="invalid-feedback">{errors?.profile}</div>}

            {formData?.profile && (
              <div className="mt-2" style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={formData.profile}
                  alt="Preview"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="col-md-6 mb-3 d-flex align-items-center">
            <div className="form-check mt-2">
              <input
                type="checkbox"
                className="form-check-input"
                name="status"
                checked={formData?.status}
                onChange={handleChange}
                id="status"
              />
              <label className="form-check-label" htmlFor="status">
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {modalData
              ? loading
                ? 'Updating...'
                : 'Update Bridge House'
              : loading
                ? 'Uploading...'
                : 'Save Bridge House'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BridgeHouseDetailsModal
