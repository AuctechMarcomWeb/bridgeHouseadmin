/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest } from '../../Helpers'

const TestimonialsModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  // ✅ State for form data
  const [formData, setFormData] = useState({
    title: '',
    discription: '',
    rating: '',
    profileImage: '',
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // ✅ Prefill data in Edit mode
  useEffect(() => {
    if (modalData) {
      setFormData({
        title: modalData.title || '',
        discription: modalData.discription || '',
        rating: modalData.rating || '',
        profileImage: modalData.profileImage || '',
        isActive: modalData.isActive ?? true,
      })
    } else {
      setFormData({
        title: '',
        discription: '',
        rating: '',
        profileImage: '',
        isActive: true,
      })
    }
  }, [modalData])

  // ✅ Close modal and reset state
  const handleCancel = () => {
    setFormData({
      title: '',
      discription: '',
      rating: '',
      profileImage: '',
      isActive: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // ✅ Clear error for that field when user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  // ✅ Handle image upload
  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    fileUpload({
      url: 'upload/uploadImage',
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res?.data?.data?.imageUrl
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, profileImage: uploadedUrl }))
          toast.success('Image uploaded successfully')
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

  // ✅ Remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: '' }))
  }

  // ✅ Validate form fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.discription.trim()) newErrors.discription = 'discription is required'
    if (!formData.rating) newErrors.rating = 'Rating is required'
    if (!formData.profileImage) newErrors.profileImage = 'Profile image is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Add new testimonial
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    postRequest({
      url: 'testimonials',
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Testimonial added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  // ✅ Update existing testimonial
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    putRequest({
      url: `testimonials/${modalData?._id}`,
      cred: formData,
    })
      .then((res) => {
        toast.success(res?.data?.message || 'Testimonial updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
      .finally(() => setLoading(false))
  }

  return (
    <Modal
      title={modalData ? 'Edit Testimonial' : 'Add Testimonial'}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        <div className="row">
          {/* Title */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Title"
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Rating */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Rating (1–5)</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              className={`form-control ${errors.rating ? 'is-invalid' : ''}`}
              value={formData.rating}
              onChange={handleChange}
              placeholder="Enter 1-5 rating"
            />
            {errors.rating && <div className="invalid-feedback">{errors.rating}</div>}
          </div>
        </div>

        {/* Description (full width) */}
        <div className="mb-3">
          <label className="form-label fw-bold">Description</label>
          <textarea
            className={`form-control ${errors.discription ? 'is-invalid' : ''}`}
            name="discription"
            rows="3"
            value={formData.discription}
            onChange={handleChange}
            placeholder="Enter your comment"
          ></textarea>
          {errors.discription && <div className="invalid-feedback">{errors.discription}</div>}
        </div>

        {/* Profile Image Upload */}
        <div className="mb-3">
          <label className="form-label fw-bold">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            className={`form-control ${errors.profileImage ? 'is-invalid' : ''}`}
            disabled={loading}
            onChange={handleChangeImage}
          />
          {errors.profileImage && <div className="invalid-feedback">{errors.profileImage}</div>}

          {formData.profileImage && (
            <div className="mt-2" style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={formData.profileImage}
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

        {/* Active Checkbox */}
        <div className="col-md-8 d-flex align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              id="isActive"
            />
            <label className="form-check-label" htmlFor="isActive">
              Active
            </label>
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
                : 'Update Testimonial'
              : loading
                ? 'Uploading...'
                : 'Save Testimonial'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TestimonialsModal
