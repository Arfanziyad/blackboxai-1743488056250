import { useState } from 'react'
import { extractTextFromImage, parseTimetableText } from '../lib/ocr'

export default function TimetableUpload() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [semesterDates, setSemesterDates] = useState({
    startDate: '',
    endDate: ''
  })

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError('')
    setSuccess('')
  }

  const handleDateChange = (e) => {
    setSemesterDates({
      ...semesterDates,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!semesterDates.startDate || !semesterDates.endDate) {
      setError('Please select semester dates')
      return
    }

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      let extractedText = ''
      
      if (file.type.startsWith('image/')) {
        extractedText = await extractTextFromImage(file)
      } else if (file.type === 'application/pdf') {
        // PDF processing logic would go here
        throw new Error('PDF processing not implemented yet')
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Excel processing logic would go here
        throw new Error('Excel processing not implemented yet')
      } else {
        throw new Error('Unsupported file format')
      }

      const timetableData = parseTimetableText(extractedText)
      
      // Save to database
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: semesterDates.startDate,
          endDate: semesterDates.endDate,
          data: timetableData
        })
      })

      if (!response.ok) throw new Error('Failed to save timetable')
      
      setSuccess('Timetable uploaded successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
        Upload Timetable
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester Start Date
            </label>
            <input
              type="date"
              name="startDate"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={semesterDates.startDate}
              onChange={handleDateChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester End Date
            </label>
            <input
              type="date"
              name="endDate"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={semesterDates.endDate}
              onChange={handleDateChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timetable File (Image/PDF/Excel)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}

          {success && (
            <div className="text-sm text-green-600 mt-2">{success}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isProcessing}
              className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Upload Timetable'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}