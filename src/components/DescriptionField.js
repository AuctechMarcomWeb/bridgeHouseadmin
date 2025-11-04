/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React from 'react'

const DescriptionField = ({ formData, setFormData, handleChange }) => {
  const handleGenerate = () => {
    const propertyDescriptions = {
      plot: `A premium open plot offering excellent potential for residential or commercial development. Located in a prime area with easy access to major roads and utilities. Ideal for investors and builders seeking long-term growth and flexibility.`,
      farmhouse: `A peaceful farmhouse surrounded by nature — perfect for those seeking tranquility and privacy. Designed for comfort with ample space, lush green surroundings, and essential amenities for a relaxed lifestyle. Suitable for weekend getaways or full-time living.`,
      'villa/banglow': `A luxurious villa/bungalow crafted for modern living. Featuring spacious interiors, elegant design, and premium finishes. Ideal for families who appreciate comfort, privacy, and a high-quality lifestyle in a serene environment.`,
      apartment: `A beautifully designed apartment offering convenience, style, and comfort. Located in a well-connected neighborhood with modern facilities, elevators, parking, and security. Ideal for professionals and families seeking urban living.`,
      residential: `A well-planned residential property in a peaceful community. Designed to provide modern amenities, comfort, and accessibility to schools, hospitals, and shopping centers. Perfect for families looking for a comfortable home.`,
      commercial: `A prime commercial property located in a high-demand business area. Suitable for offices, showrooms, or retail outlets. Offers excellent visibility, accessibility, and investment potential for long-term business success.`,
    }

    const type = formData?.propertyType?.toLowerCase()
    const template = propertyDescriptions[type] || 'Beautiful property available for sale.'

    const generated = `
${formData?.name || 'Property Title'} — ${template}
Location: ${formData?.address || 'N/A'}
Area: ${formData?.propertyDetails?.area || 'N/A'} ${formData?.measurementUnit || 'sq. ft.'}
Price: ₹${formData?.actualPrice || 'N/A'}
Contact us for more details!
    `.trim()

    setFormData({ ...formData, description: generated })
  }

  // ✅ Disable Generate button until all required fields are filled
  const isGenerateDisabled = !(
    formData?.propertyType &&
    formData?.name &&
    formData?.address &&
    formData?.actualPrice &&
    formData?.propertyDetails?.area
  )

  return (
    <div className="col-md-12 position-relative">
      <label className="form-label fw-bold">Description *</label>

      <textarea
        className="form-control pe-5"
        name="description"
        rows={4}
        required
        value={formData?.description || ''}
        onChange={handleChange}
        placeholder="Property description for click 'Generate'..."
      />

      {/* Generate button inside textarea corner */}
      <button
        type="button"
        className="btn btn-sm btn-success position-absolute"
        onClick={handleGenerate}
        disabled={isGenerateDisabled}
        style={{
          bottom: '10px',
          right: '10px',
          zIndex: 2,
          borderRadius: '8px',
          fontSize: '12px',
          padding: '4px 10px',
        }}
      >
        Generate
      </button>
    </div>
  )
}

export default DescriptionField
