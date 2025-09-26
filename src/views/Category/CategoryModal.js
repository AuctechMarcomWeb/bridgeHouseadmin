import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest } from '../../Helpers'

const CategoryModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    gallery: [], // changed from single image to gallery
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Pre-fill in edit mode
  useEffect(() => {
    if (modalData) {
      setFormData({
        ...modalData,
        gallery: modalData.image ? [modalData.image] : [], // wrap existing image into array
      })
    } else {
      setFormData({ name: '', gallery: [], isActive: true })
    }
  }, [modalData])

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({ name: '', gallery: [], isActive: true })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 🔹 Upload image and add to gallery
  const handleChangeImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    fileUpload({
      url: `upload/uploadImage`,
      cred: { file },
    })
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, res.data?.data?.imageUrl],
        }))
        setLoading(false)
      })
      .catch((error) => {
        console.error('Image upload failed:', error)
        toast.error('Image upload failed')
        setLoading(false)
      })
  }

  // 🔹 Remove image from gallery
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }))
  }

  // 🔹 Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (formData.gallery.length === 0) newErrors.image = 'Image is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Submit handlers
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    putRequest({
      url: `category/${modalData?._id}`,
      cred: { ...formData, image: formData.gallery[0] },
    }) // send first image as main
      .then((res) => {
        toast.success(res?.data?.message || 'Property Type updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({ url: `category`, cred: { ...formData, image: formData.gallery[0] } })
      .then((res) => {
        toast.success(res?.data?.message || 'Property Type added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Something went wrong')
      })
  }

  return (
    <Modal
      title={modalData ? `Edit Property Type` : `Add Property Type`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      <form onSubmit={modalData ? handleEdit : handleSubmit} noValidate>
        {/* Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">Name</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors?.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label fw-bold">Image</label>
          <input
            type="file"
            className={`form-control ${errors.image ? 'is-invalid' : ''}`}
            name="image"
            onChange={handleChangeImage}
          />
          {errors.image && <div className="invalid-feedback">{errors.image}</div>}

          {/* Image Preview */}
          {formData.gallery.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {formData.gallery.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={img}
                    alt={`gallery-${idx}`}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
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
              ))}
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="form-check mb-3">
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

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {loading ? 'Uploading...' : 'Save Property Type'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoryModal
