/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import { Modal } from 'antd'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { fileUpload, postRequest, putRequest, getRequest } from '../../Helpers'

const BannersModal = ({
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
          // Extract IDs from objects if they exist
          propertyId:
            typeof modalData.propertyId === 'object'
              ? modalData.propertyId._id
              : modalData.propertyId,
          categoryId:
            typeof modalData.categoryId === 'object'
              ? modalData.categoryId._id
              : modalData.categoryId,
        }
      : {
          title: '',
          propertyId: '',
          categoryId: '',
          bannerImage: '',
          bannersImages: [],
          bannerType: '',
          isActive: true,
        },
  )

  const [loading, setLoading] = useState(false)
  const [multiImageLoading, setMultiImageLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [allProperties, setAllProperties] = useState([])
  const [allCategories, setAllCategories] = useState([])

  console.log('formData', formData)

  const [errors, setErrors] = useState({})

  // 🔹 Update formData when modalData changes
  useEffect(() => {
    if (modalData) {
      setFormData({
        ...modalData,
        // Extract IDs from objects if they exist
        propertyId:
          typeof modalData.propertyId === 'object'
            ? modalData.propertyId._id
            : modalData.propertyId,
        categoryId:
          typeof modalData.categoryId === 'object'
            ? modalData.categoryId._id
            : modalData.categoryId,
      })
    } else {
      setFormData({
        title: '',
        propertyId: '',
        categoryId: '',
        bannerImage: '',
        bannersImages: [],
        bannerType: '',
        isActive: true,
      })
    }
  }, [modalData])

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({
      title: '',
      propertyId: '',
      categoryId: '',
      bannerImage: '',
      bannersImages: [],
      bannerType: '',
      isActive: true,
    })
    setErrors({})
    setModalData(null)
    setIsModalOpen(false)
  }

  // 🔹 Handle single banner image upload
  const handleChangeBannerImage = (e) => {
    const file = e.target.files[0]
    setLoading(true)
    fileUpload({
      url: `upload/uploadImage`,
      cred: {
        file,
      },
    })
      .then((res) => {
        setFormData((prev) => ({ ...prev, bannerImage: res.data?.data?.imageUrl }))
        console.log('res data pic ', res?.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Banner image upload failed:', error)
        setLoading(false)
      })
  }

  // 🔹 Handle multiple banner images upload
  const handleChangeMultipleBannerImages = (e) => {
    const files = Array.from(e.target.files)
    setMultiImageLoading(true)

    const uploadPromises = files.map((file) =>
      fileUpload({
        url: `upload/uploadImage`,
        cred: { file },
      }),
    )

    Promise.all(uploadPromises)
      .then((responses) => {
        const imageUrls = responses.map((res) => res.data?.data?.imageUrl)
        setFormData((prev) => ({
          ...prev,
          bannersImages: [...prev.bannersImages, ...imageUrls],
        }))
        console.log('Multiple images uploaded:', imageUrls)
        setMultiImageLoading(false)
      })
      .catch((error) => {
        console.error('Multiple images upload failed:', error)
        setMultiImageLoading(false)
      })
  }

  // 🔹 Remove image from bannersImages array
  const removeBannerImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      bannersImages: prev.bannersImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // 🔹 Validate form
  const validateForm = () => {
    let newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.bannerImage.trim()) newErrors.bannerImage = 'Banner image is required'
    if (!formData.propertyId.trim()) newErrors.propertyId = 'Property selection is required'
    if (!formData.categoryId.trim()) newErrors.categoryId = 'Category selection is required'
    if (!formData.bannerType.trim()) newErrors.bannerType = 'Banner type is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🔹 Submit handler for edit
  const handleEdit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    putRequest({ url: `banner/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Banner updated successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
      })
  }

  // 🔹 Submit handler for create
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    postRequest({ url: `banner`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Banner added successfully')
        setUpdateStatus((prev) => !prev)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        toast.error(error?.response?.data?.message)
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

  // 🔹 Get Category details
  useEffect(() => {
    getRequest(`category?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('Category', responseData)
        setAllCategories(responseData?.categories)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }, [page, limit])

  return (
    <Modal
      title={modalData ? `Edit Banner` : `Add Banner`}
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
          {/* Title */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter banner title"
            />
            {errors?.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          {/* Property Selection */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Property</label>
            <select
              className={`form-select ${errors.propertyId ? 'is-invalid' : ''}`}
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
            >
              <option value="">Select Property</option>
              {allProperties?.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name || property.title}
                </option>
              ))}
            </select>
            {errors.propertyId && <div className="invalid-feedback">{errors.propertyId}</div>}
          </div>
        </div>

        <div className="row">
          {/* Category Selection */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Category</label>
            <select
              className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {allCategories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name || category.title}
                </option>
              ))}
            </select>
            {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
          </div>

          {/* Banner Type */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Banner Type</label>
            <select
              className={`form-select ${errors.bannerType ? 'is-invalid' : ''}`}
              name="bannerType"
              value={formData.bannerType}
              onChange={handleChange}
            >
              <option value="">Select Banner Type</option>
              <option value="leftside">leftside</option>
              <option value="rightside">rightside</option>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
            </select>
            {errors.bannerType && <div className="invalid-feedback">{errors.bannerType}</div>}
          </div>
        </div>

        <div className="row">
          {/* Main Banner Image */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Main Banner Image</label>
            <input
              type="file"
              className={`form-control ${errors?.bannerImage ? 'is-invalid' : ''}`}
              name="bannerImage"
              onChange={handleChangeBannerImage}
              accept="image/*"
            />
            {loading && <small className="text-info">Uploading...</small>}
            {formData.bannerImage && (
              <div className="mt-2">
                <img
                  src={formData.bannerImage}
                  alt="Banner preview"
                  style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                  className="rounded"
                />
              </div>
            )}
            {errors.bannerImage && <div className="invalid-feedback">{errors.bannerImage}</div>}
          </div>

          {/* Multiple Banner Images */}
          <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Additional Banner Images (Optional)</label>
            <input
              type="file"
              className="form-control"
              name="bannersImages"
              onChange={handleChangeMultipleBannerImages}
              accept="image/*"
              multiple
            />
            {multiImageLoading && <small className="text-info">Uploading multiple images...</small>}

            {formData.bannersImages && formData.bannersImages.length > 0 && (
              <div className="mt-2">
                <div className="row">
                  {formData.bannersImages.map((imageUrl, index) => (
                    <div key={index} className="col-md-3 mb-2">
                      <div className="position-relative">
                        <img
                          src={imageUrl}
                          alt={`Banner ${index + 1}`}
                          style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                          className="rounded"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0"
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          onClick={() => removeBannerImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
          <button type="submit" className="btn btn-primary" disabled={loading || multiImageLoading}>
            {loading || multiImageLoading ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default BannersModal
