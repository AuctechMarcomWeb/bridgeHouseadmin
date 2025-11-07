/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { Modal, Select } from 'antd'
import React, { useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast'

import { fileUpload, postRequest, putRequest, getRequest } from '../../Helpers'
import { AppContext } from '../../Context/AppContext'
import LocationSearchInput from '../../components/LocationSearchInput/LocationSearchInput'
import { House } from 'lucide-react'
import CurrentLocationField from '../../components/CurrentLocationField'
import DescriptionField from '../../components/DescriptionField'

const PropertiesModal = ({
  setUpdateStatus,
  setModalData,
  modalData,
  isModalOpen,
  setIsModalOpen,
}) => {
  const isEditMode = !!modalData
  const [uploadingImages, setUploadingImages] = useState([])
  const { user, setUser } = useContext(AppContext)
  const [type, setType] = useState([])
  const [bhk, setBhk] = useState([])
  const [services, setServices] = useState([])
  const [facilites, setFacilites] = useState([])
  const [documents, setDocuments] = useState([])
  const galleryInputRefs = React.useRef([])
  const documentInputRefs = React.useRef([])
  const [uploadingDocs, setUploadingDocs] = useState([])
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
          propertyType: modalData?.propertyType || '',
          plotCategory: modalData?.plotCategory || '',
          measurementUnit: modalData?.measurementUnit || '',
          propertyLocation: modalData?.propertyLocation || '',
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
          documents: [{ name: '', number: '', image: '' }],
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
          measurementUnit: '',
          plotCategory: '',
          propertyLocation: '',
        },
  )
  console.log('measurementUnit', modalData?.measurementUnit)

  const measurementUnit = formData?.measurementUnit

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
      measurementUnit: '',
      plotCategory: '',
      propertyLocation: '',
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

        // // Area calculation for nested length/width
        // if (nestedKey === 'propertyDetails' && (name === 'length' || name === 'width')) {
        //   const length =
        //     name === 'length'
        //       ? parseFloat(value || 0)
        //       : parseFloat(prev.propertyDetails.length || 0)
        //   const width =
        //     name === 'width' ? parseFloat(value || 0) : parseFloat(prev.propertyDetails.width || 0)

        //   updatedData[nestedKey].area = isNaN(length * width) ? '' : (length * width).toFixed(2)
        // }
        if (nestedKey === 'propertyDetails') {
          setFormData((prev) => ({
            ...prev,
            propertyDetails: { ...prev.propertyDetails, [name]: value },
          }))
        }
      } else {
        updatedData[name] = type === 'checkbox' ? checked : value
      }

      return updatedData
    })
  }

  // const handleChangeImage = (e) => {
  //   const files = Array.from(e.target.files)

  //   files.forEach((file) => {
  //     fileUpload({
  //       url: `upload/uploadImage`,
  //       cred: { file },
  //     })
  //       .then((res) => {
  //         setFormData((prev) => ({
  //           ...prev,
  //           gallery: [...(prev.gallery || []), res.data?.data?.imageUrl], //  Push into gallery array
  //         }))
  //         console.log('res data pic ', res?.data)
  //       })
  //       .catch((error) => {
  //         console.error('Image upload failed:', error)
  //       })
  //   })
  // }

  // nearBY

  const handleChangeImage = (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      const tempId = URL.createObjectURL(file) // unique local id

      // show temporary loader for this image
      setUploadingImages((prev) => [...prev, tempId])

      fileUpload({
        url: `upload/uploadImage`,
        cred: { file },
      })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), res.data?.data?.imageUrl],
          }))
        })
        .catch((error) => {
          console.error('Image upload failed:', error)
        })
        .finally(() => {
          // remove from uploading array once done
          setUploadingImages((prev) => prev.filter((id) => id !== tempId))
        })
    })
  }

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

  // 🔹 Handle Document Field Changes
  const handleDocumentChange = (e, index) => {
    const { name, value } = e.target
    const updated = [...formData.documents]

    if (name.includes('Name')) updated[index].name = value
    if (name.includes('Number')) updated[index].number = value

    setFormData((prev) => ({ ...prev, documents: updated }))
  }

  // 🔹 Handle File Upload
  const handleDocumentImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingDocs((prev) => [...prev, index]) // start loader

    fileUpload({
      url: 'upload/uploadImage',
      cred: { file },
    })
      .then((res) => {
        const uploadedUrl = res.data?.data?.imageUrl
        if (uploadedUrl) {
          const updated = [...formData.documents]
          updated[index].image = uploadedUrl
          setFormData((prev) => ({ ...prev, documents: updated }))
          toast.success('Document uploaded successfully')
        } else {
          toast.error('Upload failed')
        }
      })
      .catch(() => {
        toast.error('Upload failed')
      })
      .finally(() => {
        setUploadingDocs((prev) => prev.filter((i) => i !== index)) // stop loader
      })
  }

  // 🔹 Remove Uploaded Image
  const removeDocumentImage = (index) => {
    const updated = [...formData.documents]
    updated[index].image = ''
    setFormData((prev) => ({ ...prev, documents: updated }))
    if (documentInputRefs.current[index]) {
      documentInputRefs.current[index].value = '' // reset file input
    }
  }

  // 🔹 Add New Document Row
  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { name: '', number: '', image: '' }],
    }))
  }

  // 🔹 Remove Document Row
  const removeDocument = (index) => {
    const updated = formData.documents.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, documents: updated }))
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
        toast.error(error?.res?.data?.message || 'Update failed')
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
        console.log('dfgddfgdfg', error?.res?.data?.message)

        toast.error(error?.res?.data?.message || 'Creation failed')
      })
  }

  const isOptional = (field) => {
    const type = formData?.propertyType
    const optionalFields = {
      Commercial: ['floors', 'builtYear', 'nearby', 'facilities', 'services'],
      Plot: ['facilities', 'services', 'nearby'],
      Apartment: ['facilities', 'services'],
      'Villa/Banglow': ['bhk', 'facilities', 'services'],
      Farmhouse: ['facilities', 'services', 'bathrooms', 'bedrooms', 'floors'],
      'Individual House': ['facilities', 'services', 'bhk'],
    }
    return optionalFields[type]?.includes(field)
  }
  // Checks if a field is required
  const isRequired = (fieldName) => {
    return !isOptional(fieldName)
  }

  // 🧮 Convert or reset values when measurement unit changes
  useEffect(() => {
    if (!formData?.propertyDetails) return

    const conversionRates = {
      area: {
        'Square Feet': {
          'Square Meters': 0.092903,
          'Square Yards': 0.1111,
          Acres: 1 / 43560,
          Hectares: 1 / 107639,
          Bissa: 1 / 1361, // Example conversion
        },
        'Square Meters': {
          'Square Feet': 10.7639,
          'Square Yards': 1.19599,
          Acres: 1 / 4046.86,
          Hectares: 1 / 10000,
          Bissa: 7.89,
        },
        'Square Yards': {
          'Square Feet': 9,
          'Square Meters': 0.836127,
          Acres: 1 / 4840,
          Hectares: 1 / 11960,
          Bissa: 1 / 151.22,
        },
        Acres: {
          'Square Feet': 43560,
          'Square Meters': 4046.86,
          'Square Yards': 4840,
          Hectares: 0.404686,
          Bissa: 32,
        },
        Hectares: {
          'Square Feet': 107639,
          'Square Meters': 10000,
          'Square Yards': 11960,
          Acres: 2.47105,
          Bissa: 79.1,
        },
        Bissa: {
          'Square Feet': 1361,
          'Square Meters': 125.5,
          'Square Yards': 151.22,
          Acres: 1 / 32,
          Hectares: 1 / 79.1,
        },
      },
    }

    const formatNumber = (num) => {
      if (!num) return ''
      const rounded = parseFloat(num.toFixed(2))
      return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
    }
    setFormData((prev) => {
      const oldUnit = prev.measurementUnit || 'Square Feet'
      const area = parseFloat(prev.propertyDetails.area) || 0

      if (
        ['Acres', 'Hectares', 'Bissa'].includes(oldUnit) ||
        ['Acres', 'Hectares', 'Bissa'].includes(measurementUnit)
      ) {
        return {
          ...prev,
          measurementUnit,
          propertyDetails: {
            ...prev.propertyDetails,
            length: '',
            width: '',
            area: '',
          },
        }
      }

      // Convert area
      return {
        ...prev,
        measurementUnit,
        propertyDetails: {
          ...prev.propertyDetails,
          area: area
            ? formatNumber(area * (conversionRates.area[oldUnit]?.[measurementUnit] || 1))
            : '',
        },
      }
    })
  }, [measurementUnit])

  // 🧮 Auto calculate area for linear units
  useEffect(() => {
    if (['Acres', 'Hectares', 'Bissa'].includes(measurementUnit)) return

    const len = parseFloat(formData?.propertyDetails?.length)
    const wid = parseFloat(formData?.propertyDetails?.width)
    if (!len || !wid) return

    const newArea = len * wid

    const formatNumber = (num) => {
      if (!num) return ''
      const rounded = parseFloat(num.toFixed(2))
      return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
    }

    setFormData((prev) => ({
      ...prev,
      propertyDetails: {
        ...prev.propertyDetails,
        area: formatNumber(newArea),
      },
    }))
  }, [formData?.propertyDetails?.length, formData?.propertyDetails?.width, measurementUnit])

  const handleLatLngChange = (e) => {
    const { name, value } = e.target
    const updatedCoordinates = [...(formData?.location?.coordinates || [])]

    if (name === 'latitude') updatedCoordinates[1] = parseFloat(value)
    if (name === 'longitude') updatedCoordinates[0] = parseFloat(value)

    setFormData({
      ...formData,
      location: {
        type: 'Point',
        coordinates: updatedCoordinates,
      },
    })

    // If both lat & lng are present, reverse geocode address
    if (
      updatedCoordinates[0] !== undefined &&
      updatedCoordinates[1] !== undefined &&
      !isNaN(updatedCoordinates[0]) &&
      !isNaN(updatedCoordinates[1])
    ) {
      const [lng, lat] = updatedCoordinates
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results.length > 0) {
            setFormData((prev) => ({
              ...prev,
              propertyLocation: data.results[0].formatted_address,
            }))
          }
        })
        .catch((err) => console.error('Reverse geocode error:', err))
    }
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
              <label className="form-label fw-bold">Property Code *</label>
              <input
                type="text"
                className={`form-control ${errors?.propertyCode ? 'is-invalid' : ''}`}
                name="propertyCode"
                value={formData?.propertyCode}
                required
                disabled
                onChange={handleChange}
              />
            </div>
            {/* Property Type */}
            <div className={formData?.propertyType === 'Plot' ? 'col-md-3' : 'col-md-6'}>
              <div className="mb-3">
                <label className="form-label fw-bold">Property Type *</label>
                <select
                  className="form-select"
                  name="propertyType"
                  value={formData?.propertyType || ''}
                  required
                  onChange={handleChange}
                >
                  <option value="">Select Property Type</option>
                  {typeOption}
                </select>
              </div>
            </div>

            {/* 🪵 Plot Category — only visible when Property Type = "Plot" */}
            {formData?.propertyType === 'Plot' && (
              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label fw-bold">Plot Category *</label>
                  <select
                    className="form-select"
                    name="plotCategory"
                    value={formData?.plotCategory || ''}
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Plot Category</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agricultural">Agricultural</option>
                  </select>
                </div>
              </div>
            )}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-bold">Property Title *</label>
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
              <label className="form-label fw-bold">Actual Price(₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="actualPrice"
                value={formData?.actualPrice}
                required
                onChange={handleChange}
                placeholder="Enter Actual Price"
                min="0"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Selling Price(₹) *</label>
              <input
                type="number"
                className={`form-control `}
                name="sellingPrice"
                value={formData?.sellingPrice}
                required
                onChange={handleChange}
                placeholder="Enter Selling Price"
                min="0"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Address *</label>
              <LocationSearchInput formData={formData} setFormData={setFormData} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Property Location</label>
              <CurrentLocationField formData={formData} setFormData={setFormData} />
            </div>

            <div className="col-md-6">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Latitude</label>
                  <input
                    type="number"
                    name="latitude"
                    className="form-control"
                    value={formData?.location?.coordinates?.[1] || ''}
                    onChange={handleLatLngChange}
                    placeholder="Enter Latitude"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Longitude</label>
                  <input
                    type="number"
                    name="longitude"
                    className="form-control"
                    value={formData?.location?.coordinates?.[0] || ''}
                    onChange={handleLatLngChange}
                    placeholder="Enter Longitude"
                  />
                </div>
              </div>
            </div>
            {/* ================= Property Details ================= */}
            <hr className="m-0 p-0 my-3" />
            <label className="form-label fw-bold d-block mb-2">Property Details</label>

            <div className="row">
              {/* Measurement Unit */}
              <div
                className={
                  ['Acres', 'Hectares', 'Bissa'].includes(formData?.measurementUnit)
                    ? 'col-md-6'
                    : 'col-md-4'
                }
              >
                <div className="mb-3">
                  <label className="form-label fw-bold">Measurement Unit *</label>
                  <select
                    className="form-select"
                    name="measurementUnit"
                    value={formData?.measurementUnit || ''}
                    required
                    onChange={handleChange}
                  >
                    {/* ✅ Common Options */}
                    <option value="">Please Select</option>
                    <option value="Square Feet">Square Feet</option>
                    <option value="Square Meters">Square Meters</option>

                    {/* ✅ Villa Additional */}
                    {formData?.propertyType === 'Villa/Banglow' && (
                      <option value="Square Yards">Square Yards</option>
                    )}

                    {/* ✅ Plot / Others Additional */}
                    {formData?.propertyType !== 'Apartment' &&
                      formData?.propertyType !== 'Individual House' &&
                      formData?.propertyType !== 'Villa/Banglow' && (
                        <>
                          <option value="Square Yards">Square Yards</option>
                          <option value="Acres">Acres</option>
                          <option value="Hectares">Hectares</option>
                          <option value="Bissa">Bissa</option>
                        </>
                      )}
                  </select>
                </div>
              </div>

              {/* Length & Width (only for non-acre units) */}
              {!['Acres', 'Hectares', 'Bissa'].includes(formData?.measurementUnit) && (
                <>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Length{' '}
                        {formData?.measurementUnit === 'Square Meters'
                          ? '(m)'
                          : formData?.measurementUnit === 'Square Yards'
                            ? '(yd)'
                            : '(ft)'}{' '}
                        *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="length"
                        data-nested="propertyDetails"
                        value={formData?.propertyDetails?.length || ''}
                        onChange={handleChange}
                        placeholder="Enter Length"
                        min={1}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Width{' '}
                        {formData?.measurementUnit === 'Square Meters'
                          ? '(m)'
                          : formData?.measurementUnit === 'Square Yards'
                            ? '(yd)'
                            : '(ft)'}{' '}
                        *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        name="width"
                        data-nested="propertyDetails"
                        value={formData?.propertyDetails?.width || ''}
                        onChange={handleChange}
                        placeholder="Enter Width"
                        min={1}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Area */}
              <div
                className={
                  ['Acres', 'Hectares', 'Bissa'].includes(formData?.measurementUnit)
                    ? 'col-md-6'
                    : 'col-md-6'
                }
              >
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Area (
                    {formData?.measurementUnit === 'Square Meters'
                      ? 'm²'
                      : formData?.measurementUnit === 'Square Yards'
                        ? 'sq.yd'
                        : formData?.measurementUnit === 'Acres'
                          ? 'acres'
                          : formData?.measurementUnit === 'Hectares'
                            ? 'hectares'
                            : formData?.measurementUnit === 'Bissa'
                              ? 'bissa'
                              : 'sq.ft'}
                    ) *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="area"
                    data-nested="propertyDetails"
                    value={formData?.propertyDetails?.area || ''}
                    onChange={handleChange}
                    readOnly={!['Acres', 'Hectares', 'Bissa'].includes(formData?.measurementUnit)}
                    placeholder={
                      ['Acres', 'Hectares', 'Bissa'].includes(formData?.measurementUnit)
                        ? `Enter area in ${formData?.measurementUnit}`
                        : 'Auto-calculated'
                    }
                  />
                </div>
              </div>

              {/* Bedrooms, bathrooms, floors, built year */}
              {!['Plot', 'Commercial'].includes(formData?.propertyType) && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Bedrooms{' '}
                    {isOptional('bedrooms') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}{' '}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="bedrooms"
                    data-nested="propertyDetails"
                    value={formData?.propertyDetails?.bedrooms || ''}
                    onChange={handleChange}
                    placeholder="Enter number of bedrooms"
                    required={isRequired('bedrooms')}
                  />
                </div>
              )}

              {!['Plot', 'Commercial'].includes(formData?.propertyType) && (
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Bathrooms{' '}
                    {isOptional('bathrooms') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}{' '}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="bathrooms"
                    data-nested="propertyDetails"
                    value={formData?.propertyDetails?.bathrooms || ''}
                    onChange={handleChange}
                    placeholder="Enter number of bathrooms"
                    required={isRequired('bathrooms')}
                  />
                </div>
              )}

              {!['Plot', 'Apartment'].includes(formData?.propertyType) && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Floors{' '}
                    {isOptional('floors') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}{' '}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="floors"
                    data-nested="propertyDetails"
                    value={formData?.propertyDetails?.floors || ''}
                    onChange={handleChange}
                    placeholder="Enter number of floors"
                    required={isRequired('floors')}
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label fw-bold">Facing *</label>
                <input
                  type="text"
                  className="form-control"
                  name="facing"
                  data-nested="propertyDetails"
                  value={formData?.propertyDetails?.facing || ''}
                  onChange={handleChange}
                  placeholder="Enter facing direction"
                />
              </div>

              {formData?.propertyType !== 'Plot' && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    Built Year{' '}
                    {isOptional('builtYear') ? (
                      <span className="text-muted"> (optional)</span>
                    ) : (
                      <span> * </span>
                    )}{' '}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="builtYear"
                    data-nested="propertyDetails"
                    value={formData?.propertyDetails?.builtYear || ''}
                    onChange={handleChange}
                    placeholder="Enter year built (above 1900)"
                    min={1900}
                    required={isRequired('builtYear')}
                  />
                </div>
              )}
            </div>

            <hr className="m-0 p-0 my-3" />

            {/* ======================= */}

            {!['Plot', 'Commercial', 'Farmhouse'].includes(formData?.propertyType) && (
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
                    <option value="Select BHK">Select BHK </option>
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
                type="file"
                className="form-control"
                name="propertyCode"
                accept="image/*"
                multiple
                required={!(formData.gallery && formData.gallery.length > 0)}
                onChange={handleChangeImage}
                ref={(el) => (galleryInputRefs.current[0] = el)}
              />
            </div>

            {/* Image Preview + Loading Spinner */}
            {(formData?.gallery?.length > 0 || uploadingImages.length > 0) && (
              <div className="col-md-12 mt-2">
                <div className="d-flex flex-wrap gap-2">
                  {/* Uploaded Images */}
                  {formData.gallery?.map((item, index) => (
                    <div
                      key={`uploaded-${index}`}
                      style={{
                        position: 'relative',
                        width: '70px',
                        height: '70px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={item}
                        alt={`gallery-${index}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((_, i) => i !== index),
                          }))
                          if (galleryInputRefs.current[0]) galleryInputRefs.current[0].value = ''
                        }}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Uploading Loaders */}
                  {uploadingImages.map((img, index) => (
                    <div
                      key={`loading-${index}`}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '6px',
                        backgroundColor: '#f3f3f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ddd',
                      }}
                    >
                      <div
                        className="spinner-border text-primary"
                        role="status"
                        style={{ width: '25px', height: '25px' }}
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="m-0 p-0 my-3" />

            {/* Nearby */}
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold">
                  <strong>
                    Nearby Location
                    {isOptional('nearby') && <span className="text-muted"> (optional)</span>}
                  </strong>
                </label>
                <button type="button" className="btn btn-success btn-sm" onClick={addNearBy}>
                  + Add More
                </button>
              </div>

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
            </div>
            <hr className="m-0 p-0 my-3" />

            {/* 🔹 Documents Section */}
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold">Documents *</label>
                <button type="button" className="btn btn-success btn-sm" onClick={addDocument}>
                  + Add More
                </button>
              </div>

              <div className="row">
                {formData?.documents?.map((doc, index) => (
                  <div className="border rounded p-3 mb-3" key={index}>
                    <div className="row g-3 align-items-end">
                      {/* Document Name */}
                      <div className="col-md-6">
                        <label className="form-label">Document Name *</label>
                        <select
                          name={`docName_${index}`}
                          value={doc?.name}
                          onChange={(e) => handleDocumentChange(e, index)}
                          className="form-control"
                          required
                        >
                          <option value="">Select Document</option>
                          {documentsOption}
                        </select>
                      </div>

                      {/* Document Number */}
                      <div className="col-md-6">
                        <label className="form-label">Document Number *</label>
                        <input
                          type="text"
                          name={`docNumber_${index}`}
                          value={doc?.number}
                          onChange={(e) => handleDocumentChange(e, index)}
                          className="form-control"
                          placeholder="Enter Document Number"
                          required
                        />
                      </div>

                      {/* Document Image Upload */}
                      <div className="col-md-6">
                        <label className="form-label">Document Image(.jpg, .png, .jpeg) *</label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="form-control"
                          onChange={(e) => handleDocumentImageChange(e, index)}
                          ref={(el) => (documentInputRefs.current[index] = el)}
                          disabled={uploadingDocs.includes(index)}
                          required={!doc?.image} // ✅ only required when no image exists
                        />
                      </div>

                      {/* Preview / Loader */}
                      <div className="col-md-6">
                        {uploadingDocs.includes(index) ? (
                          <div
                            style={{
                              width: '70px',
                              height: '70px',
                              background: '#f3f3f3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                            }}
                          >
                            <div
                              className="spinner-border text-primary"
                              role="status"
                              style={{ width: '24px', height: '24px' }}
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : doc?.image ? (
                          doc.image.endsWith('.pdf') ? (
                            <a
                              href={doc.image}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none"
                            >
                              📄 View PDF
                            </a>
                          ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img
                                src={doc.image}
                                alt={`doc-${index}`}
                                style={{
                                  width: '70px',
                                  height: '70px',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd',
                                }}
                              />
                              {/* ❌ Remove Image */}
                              <button
                                type="button"
                                onClick={() => removeDocumentImage(index)}
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
                                  padding: 0,
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          )
                        ) : null}
                      </div>

                      {/* Remove Button */}
                      {formData?.documents?.length > 1 && (
                        <div className="col-md-12 text-end">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeDocument(index)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="m-0 p-0 my-3" />

            <div className="col-md-6 mb-3">
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
            <div className="col-md-6 mb-3">
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
            <div className="col-md-12">
              <DescriptionField
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
              />
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
