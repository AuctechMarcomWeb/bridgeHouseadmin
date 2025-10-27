/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { Modal, Select } from 'antd'
import React, { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

import { fileUpload, postRequest, putRequest, getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import LocationSearchInput from '../../components/LocationSearchInput/LocationSearchInput'

const PropertiesModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const isEditMode = !!modalData

  const { user, setUser } = useContext(AppContext)

  console.log('modalData===', modalData)

  const [type, setType] = useState([])
  const [bhk, setBhk] = useState([])
  const [services, setServices] = useState([])
  const [facilites, setFacilites] = useState([])
  const [documents, setDocuments] = useState([])
  const galleryInputRefs = React.useRef([])
  const documentInputRefs = React.useRef([])

  const generatePropertyCode = () => {
    const prefix = 'PROP'
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}-${randomNum}`
  }

  const [formData, setFormData] = useState(
    modalData
      ? {
          ...modalData,
          propertyCode: generatePropertyCode(),
        }
      : {
          address: '',
          location: {
            type: 'Point',
            coordinates: [],
          },
          addedBy: user?._id,
          name: '',
          propertyType: '',
          documents: [],
          description: '',
          propertyDetails: {
            length: '',
            width: '',
            area: '',
            bedrooms: '',
            bathrooms: '',
            floors: '',
            facing: '',
            builtYear: '',
          },
          status: 'Available',
          approvalStatus: 'Published',
          isVerified: false,
          isAdopted: false,
          actualPrice: '',
          sellingPrice: '',
          facilities: [],
          services: [],
          nearby: [],
          gallery: [],
          propertyCode: generatePropertyCode(),
        },
  )

  useEffect(() => {
    getRequest(`category?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('Category', responseData)
        setType(responseData?.categories)
      })
      .catch((error) => {
        console.log('error', error)
      })
    getRequest(`bhk?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('bhk', responseData)
        setBhk(responseData?.bhks)
      })
      .catch((error) => {
        console.log('error', error)
      })
    getRequest(`facilites?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('facilites', responseData)
        setFacilites(responseData?.facilities)
      })
      .catch((error) => {
        console.log('error', error)
      })
    getRequest(`service?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('service', responseData)
        setServices(responseData?.services)
      })
      .catch((error) => {
        console.log('error', error)
      })
    getRequest(`documents?isPagination=false`)
      .then((res) => {
        const responseData = res?.data?.data
        console.log('documents', responseData)
        setDocuments(responseData?.documents)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }, [])

  const typeOption = type?.map((item, index) => {
    return (
      <>
        <option value={item?.name}>{item?.name}</option>
      </>
    )
  })
  const bhkOption = bhk?.map((item, index) => {
    return (
      <>
        <option value={item?.name}>{item?.name}</option>
      </>
    )
  })
  const documentsOption = documents?.map((item, index) => {
    return (
      <>
        <option value={item?.name}>{item?.name}</option>
      </>
    )
  })

  console.log('formData===>', formData)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [addedBy, setAddBy] = useState(null)

  React.useEffect(() => {
    if (user?._id) {
      setAddBy(user._id)
    }
  }, [user])

  console.log('formData', formData, addedBy)
  console.log('user details from context Provider', user)

  // 🔹 Close modal
  const handleCancel = () => {
    setFormData({
      address: '',
      location: {
        type: 'Point',
        coordinates: [],
      },
      addedBy: user?._id,
      name: '',
      propertyType: '',
      documents: [],
      description: '',
      propertyDetails: {
        length: '',
        width: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        floors: '',
        facing: '',
        builtYear: '',
      },
      status: 'Available',
      approvalStatus: 'Published',
      isVerified: false,
      isAdopted: false,
      actualPrice: '',
      sellingPrice: '',
      facilities: [],
      services: [],
      nearby: [],
      gallery: [],
      propertyCode: '',
    })

    setModalData(null)
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target

    setFormData((prev) => {
      let updatedData = { ...prev }

      if (dataset.nested) {
        const nestedKey = dataset.nested
        updatedData[nestedKey] = {
          ...prev[nestedKey],
          [name]: type === 'checkbox' ? checked : value,
        }

        // Area calculation for nested length/width
        if (nestedKey === 'propertyDetails' && (name === 'length' || name === 'width')) {
          const length =
            name === 'length'
              ? parseFloat(value || 0)
              : parseFloat(prev.propertyDetails.length || 0)
          const width =
            name === 'width' ? parseFloat(value || 0) : parseFloat(prev.propertyDetails.width || 0)

          updatedData[nestedKey].area = isNaN(length * width) ? '' : (length * width).toFixed(2)
        }
      } else {
        updatedData[name] = type === 'checkbox' ? checked : value
      }

      return updatedData
    })
  }

  const handleChangeImage = (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      fileUpload({
        url: `upload/uploadImage`,
        cred: { file },
      })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), res.data?.data?.imageUrl], //  Push into gallery array
          }))
          console.log('res data pic ', res?.data)
        })
        .catch((error) => {
          console.error('Image upload failed:', error)
        })
    })
  }

  // nearBY

  const handleNearByChange = (e, index) => {
    const { name, value } = e.target
    const updatedFacilities = [...formData.nearby]

    if (name.includes('Name')) {
      updatedFacilities[index].name = value
    } else if (name.includes('Distance')) {
      updatedFacilities[index].distance = value
    }

    setFormData((prev) => ({
      ...prev,
      nearby: updatedFacilities,
    }))
  }

  const addNearBy = () => {
    setFormData((prev) => ({
      ...prev,
      nearby: [...prev.nearby, { name: '', distance: '' }],
    }))
  }

  const removeNearBy = (index) => {
    const updatedFacilities = formData.nearby.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      nearby: updatedFacilities,
    }))
  }

  // document

  const handleDocumentChange = (e, index) => {
    const { name, value } = e.target
    const updatedFacilities = [...formData.documents]

    if (name.includes('Name')) {
      updatedFacilities[index].name = value
    } else if (name.includes('Number')) {
      updatedFacilities[index].number = value
    }

    setFormData((prev) => ({
      ...prev,
      documents: updatedFacilities,
    }))
  }

  const handleDocumentImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // Upload to server
    fileUpload({
      url: `upload/uploadImage`,
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res.data?.data?.imageUrl
        const updatedDocuments = [...formData.documents]
        updatedDocuments[index].image = uploadedUrl

        setFormData((prev) => ({
          ...prev,
          documents: updatedDocuments,
        }))
      })
      .catch((error) => {
        console.error('Document image upload failed:', error)
      })
  }

  const removeDocumentImage = (index) => {
    const updatedDocuments = [...formData.documents]
    updatedDocuments[index].image = ''
    setFormData((prev) => ({
      ...prev,
      documents: updatedDocuments,
    }))

    if (documentInputRefs.current[index]) {
      documentInputRefs.current[index].value = '' // reset input field
    }
  }

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.nearby, { name: '', number: '', image: '' }],
    }))
  }

  const removeDocument = (index) => {
    const updatedFacilities = formData.documents.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      documents: updatedFacilities,
    }))
  }

  // 🔹 Submit handler for edit
  const handleEdit = (e) => {
    e.preventDefault()

    setLoading(true)

    putRequest({ url: `properties/${modalData?._id}`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property updated successfully')
        setUpdateStatus((prev) => !prev)
        setLoading(false)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        setLoading(false)
        toast.error(error?.response?.data?.message || 'Update failed')
      })
  }

  // 🔹 Submit handler for create
  const handleSubmit = (e) => {
    e.preventDefault()

    setLoading(true)
    postRequest({ url: `properties`, cred: formData })
      .then((res) => {
        toast.success(res?.data?.message || 'Property added successfully')
        setUpdateStatus((prev) => !prev)
        setLoading(false)
        handleCancel()
      })
      .catch((error) => {
        console.log('error', error)
        setLoading(false)
        toast.error(error?.response?.data?.message || 'Creation failed')
      })
  }

  const isOptional = (field) => {
    const type = formData?.propertyType
    const optionalFields = {
      Commercial: ['bhk', 'bedrooms', 'nearby'],
      Plot: ['facilities', 'services'],
      Apartment: ['floors'],
    }
    return optionalFields[type]?.includes(field)
  }
  // Checks if a field is required
  const isRequired = (fieldName) => {
    return !isOptional(fieldName)
  }

  return (
    <Modal
      title={isEditMode ? `Edit Property` : `Add Property`}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      width={1000}
      style={{ top: 20 }}
    >
      <div
        style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '50px', marginBottom: '50px' }}
      >
        <form onSubmit={modalData ? handleEdit : handleSubmit} className="needs-validation">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label fw-bold">PropertyCode *</label>
              <input
                type="text"
                className={`form-control ${errors?.propertyCode ? 'is-invalid' : ''}`}
                name="propertyCode"
                value={formData?.propertyCode}
                required
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              {' '}
              <div className="mb-3">
                <label className="form-label fw-bold">Property Type *</label>
                <select
                  className={`form-select `}
                  name="propertyType"
                  value={formData.propertyType}
                  required
                  onChange={handleChange}
                >
                  <option value="">Select Property Type</option>
                  {typeOption}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Property Name *</label>
                <input
                  type="text"
                  className={`form-control `}
                  name="name"
                  required
                  value={formData?.name}
                  onChange={handleChange}
                  placeholder="Enter property name (e.g., Luxury Villa)"
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Address *</label>
              <LocationSearchInput formData={formData} setFormData={setFormData} />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Actual Price (₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="actualPrice"
                value={formData?.actualPrice}
                required
                onChange={handleChange}
                placeholder=""
                min="0"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Selling Price (₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="sellingPrice"
                value={formData?.sellingPrice}
                required
                onChange={handleChange}
                placeholder=""
                min="0"
              />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-bold">Description *</label>
              <textarea
                type="text"
                className={`form-control`}
                name="description"
                rows={3}
                required
                value={formData?.description}
                onChange={handleChange}
              />
            </div>

            {/* =================== */}

            <hr className="m-0 p-0 my-3" />

            {/* Property Details */}

            <label className="form-label fw-bold d-block mb-2">Property Details</label>

            <div className="row">
              <div className="col-md-6">
                <label className="form-label fw-bold">Length (ft) *</label>
                <input
                  type="text"
                  className="form-control"
                  name="length"
                  data-nested="propertyDetails"
                  value={formData?.propertyDetails?.length}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Width (ft) *</label>
                <input
                  type="text"
                  className="form-control"
                  name="width"
                  data-nested="propertyDetails"
                  required
                  value={formData?.propertyDetails?.width}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Area(Sqft) *</label>
                <input
                  type="text"
                  className="form-control"
                  name="area"
                  data-nested="propertyDetails"
                  value={formData?.propertyDetails?.area || ''}
                  readOnly // 🔹 prevent typing
                />
              </div>

              {formData?.propertyType !== 'Plot' && (
                <>
                  {/* Bedrooms */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      {' '}
                      Bedrooms{' '}
                      {isOptional('bedrooms') ? (
                        <span className="text-muted"> (optional)</span>
                      ) : (
                        <span> * </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="bedrooms"
                      data-nested="propertyDetails"
                      value={formData?.propertyDetails?.bedrooms || ''}
                      onChange={handleChange}
                      required={isRequired('bedrooms')}
                    />
                  </div>
                  {/* Bathrooms */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Bathrooms *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bathrooms"
                      data-nested="propertyDetails"
                      value={formData?.propertyDetails?.bathrooms || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* Floors */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Floors{' '}
                      {isOptional('floors') ? (
                        <span className="text-muted"> (optional)</span>
                      ) : (
                        <span> * </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="floors"
                      data-nested="propertyDetails"
                      required={isRequired(`floors`)}
                      value={formData?.propertyDetails?.floors || ''}
                      onChange={handleChange}
                    />
                  </div>
                  {/* Facing */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Facing *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="facing"
                      data-nested="propertyDetails"
                      value={formData?.propertyDetails?.facing || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              {/* Built Year */}
              {formData?.propertyType !== 'Plot' && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    {' '}
                    Built Year
                    {isOptional('builtYear') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="builtYear"
                    data-nested="propertyDetails"
                    required={isRequired('builtYear')}
                    value={formData?.propertyDetails?.builtYear || ''}
                    onChange={handleChange}
                    min={1900}
                  />
                </div>
              )}
            </div>

            <hr className="m-0 p-0 my-3" />

            {/* ======================= */}

            {formData?.propertyType !== 'Plot' && (
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    BHK{' '}
                    {isOptional('bhk') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}
                  </label>
                  <select
                    className={`form-select `}
                    name="bhk"
                    value={formData.bhk}
                    required={isRequired('bhk')}
                    onChange={handleChange}
                  >
                    <option value="">Select BHK </option>
                    {bhkOption}
                  </select>
                </div>
              </div>
            )}

            {/* Facilities */}
            {formData?.propertyType !== 'Plot' && (
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  {' '}
                  Facilities{' '}
                  {isOptional('facilities') && <span className="text-muted"> (optional)</span>}
                </label>

                <Select
                  value={formData?.facilities}
                  mode="tags"
                  size="large"
                  style={{ width: '100%' }}
                  required={isRequired('facilities')}
                  placeholder="Enter/Select Your Facilities"
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      facilities: value,
                    })
                  }}
                  options={facilites?.map((service) => ({
                    label: service?.name,
                    value: service?.name,
                  }))}
                />
              </div>
            )}

            {/* Services */}
            {formData?.propertyType !== 'Plot' && (
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  Services{' '}
                  {isOptional('services') && <span className="text-muted"> (optional)</span>}
                </label>

                <Select
                  value={formData?.services}
                  mode="tags"
                  size="large"
                  style={{ width: '100%' }}
                  required={isRequired('services')}
                  placeholder="Enter/Select Your Services"
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      services: value,
                    })
                  }}
                  options={services?.map((service) => ({
                    label: service?.name,
                    value: service?.name,
                  }))}
                />
              </div>
            )}

            {/* Property Images */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Property Images *</label>
              <input
                key={formData.gallery}
                type="file"
                className={`form-control `}
                name="propertyCode"
                accept="image/*"
                required={!(formData.gallery && formData.gallery.length > 0)}
                multiple
                onChange={handleChangeImage}
                ref={(el) => (galleryInputRefs.current[0] = el)}
              />
            </div>
            {formData?.gallery?.length > 0 && (
              <div className="col-md-12 ">
                <div className="d-flex justify-content-end gap-2 my-2 flex-wrap">
                  {formData.gallery.map((item, index) => (
                    <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                      {/* Image */}
                      <img
                        src={item}
                        alt={`gallery-${index}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />

                      {/* Cross Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, i) => i !== index),
                          }))
                          if (galleryInputRefs.current[0]) {
                            galleryInputRefs.current[0].value = '' // reset input
                          }
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="m-0 p-0 my-3" />

            {/* Nearby */}
            <div className="col-md-12">
              <label className="form-label">
                <strong>
                  Nearby {isOptional('nearby') && <span className="text-muted"> (optional)</span>}
                </strong>
              </label>

              {formData?.nearby?.map((facility, index) => (
                <div className="row m-0 p-0 border mb-2" key={index}>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name={`facilityName_${index}`}
                      value={facility?.name}
                      onChange={(e) => handleNearByChange(e, index)}
                      className="form-control"
                      required={!isOptional('nearby')}
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Distance</label>
                    <input
                      type="text"
                      name={`facilityDistance_${index}`}
                      value={facility?.distance}
                      onChange={(e) => handleNearByChange(e, index)}
                      className="form-control"
                      required={!isOptional('nearby')}
                    />
                  </div>

                  {/* Button to remove a facility */}
                  <div className="col-md-12 d-flex justify-content-end">
                    {formData?.nearby?.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mb-2"
                        onClick={() => removeNearBy(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Button to add new facility */}
              <div className="col-md-12 mt-2">
                <button type="button" className="btn btn-success btn-sm" onClick={addNearBy}>
                  Add More
                </button>
              </div>
            </div>
            <hr className="m-0 p-0 my-3" />
            {/* Documents */}
            <div className="col-md-12">
              <label className="form-label">
                <strong>Documents </strong>
              </label>

              {formData?.documents?.map((facility, index) => (
                <div className="row m-0 p-0 border mb-2" key={index}>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Name *</label>

                    <select
                      name={`facilityName_${index}`}
                      value={facility?.name}
                      onChange={(e) => handleDocumentChange(e, index)}
                      className="form-control"
                      required
                    >
                      <option value="">Select Document</option>
                      {documentsOption}
                    </select>
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Number *</label>
                    <input
                      type="text"
                      name={`facilityNumber_${index}`}
                      value={facility?.number}
                      onChange={(e) => handleDocumentChange(e, index)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    <label className="form-label">Document Image *</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => handleDocumentImageChange(e, index)}
                      ref={(el) => (documentInputRefs.current[index] = el)}
                      required
                    />
                  </div>
                  <div className="col-md-6 m-0 my-2">
                    {facility?.image && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={facility.image}
                          alt={`doc-${index}`}
                          style={{
                            width: '60px',
                            height: '60px',
                            marginTop: '5px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                          }}
                        />
                        {/* ❌ Remove button */}
                        <button
                          type="button"
                          onClick={() => removeDocumentImage(index)}
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
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Button to remove a facility */}
                  <div className="col-md-12 d-flex justify-content-end">
                    {formData?.documents?.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mb-2"
                        onClick={() => removeDocument(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Button to add new facility */}
              <div className="col-md-12 mt-2">
                <button type="button" className="btn btn-success btn-sm" onClick={addDocument}>
                  Add More
                </button>
              </div>
            </div>
            <hr className="m-0 p-0 my-3" />

            <div className="col-md-6">
              <label className="form-label fw-bold"> Adopted Status *</label>

              <select
                className={`form-control `}
                name="isAdopted"
                value={formData?.isAdopted}
                onChange={handleChange}
              >
                <option value="true">Adopted</option>
                <option value="false"> Not Adopted</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Verifyed Status *</label>

              <select
                className={`form-control `}
                name="isVerified"
                value={formData?.isVerified}
                onChange={handleChange}
              >
                <option value="true">Verifyed</option>
                <option value="false"> Not Verifyed</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Approval Status *</label>

              <select
                className={`form-control `}
                name="approvalStatus"
                value={formData?.approvalStatus}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
                <option value="Rejected"> Rejected</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Property Status *</label>

              <select
                className={`form-control `}
                name="status"
                value={formData?.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Registered">Registered</option>
                <option value="Booked">Booked</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 ">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : modalData ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PropertiesModal
