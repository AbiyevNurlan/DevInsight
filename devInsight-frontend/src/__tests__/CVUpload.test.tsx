import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CVUpload from '../components/Candidate/CVUpload'

// Mock the cvService module
jest.mock('../services/cvService', () => ({
  cvService: {
    getCVInfo: jest.fn().mockRejectedValue(new Error('No CV')),
    uploadCV: jest.fn(),
    deleteCV: jest.fn(),
    getExtractedText: jest.fn(),
    analyzeCV: jest.fn(),
    validateFile: jest.fn(),
    formatFileSize: jest.fn((size: number) => `${(size / 1024).toFixed(1)} KB`),
  },
  // Re-export types as empty for TS compat
}))

// Mock CVAnalysisDisplay
jest.mock('../components/CVAnalysisDisplay', () => {
  return function MockCVAnalysisDisplay() {
    return <div data-testid="cv-analysis-display" />
  }
})

import { cvService } from '../services/cvService'

// ===== TEST 3: CVUpload fayl upload testi =====
describe('CVUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(cvService.getCVInfo as jest.Mock).mockRejectedValue(new Error('No CV'))
  })

  test('renders upload area with "Upload Your CV" text and Choose File button', async () => {
    render(<CVUpload />)

    await waitFor(() => {
      expect(screen.getByText('Upload Your CV')).toBeInTheDocument()
    })

    expect(screen.getByText('Choose File')).toBeInTheDocument()
    expect(screen.getByText(/PDF, DOCX/)).toBeInTheDocument()
  })

  test('shows selected file name and Upload Now button after file selection', async () => {
    ;(cvService.validateFile as jest.Mock).mockReturnValue({ valid: true })

    const user = userEvent.setup()
    render(<CVUpload />)

    await waitFor(() => {
      expect(screen.getByText('Upload Your CV')).toBeInTheDocument()
    })

    const file = new File(['dummy pdf content'], 'my-resume.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
      expect(screen.getByText('Upload Now')).toBeInTheDocument()
    })
  })

  test('calls cvService.uploadCV when Upload Now is clicked', async () => {
    ;(cvService.validateFile as jest.Mock).mockReturnValue({ valid: true })
    ;(cvService.uploadCV as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        fileName: 'my-resume.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
        uploadedDate: '2026-03-20',
        textExtracted: false,
      },
    })

    const mockOnSuccess = jest.fn()
    const user = userEvent.setup()
    render(<CVUpload onUploadSuccess={mockOnSuccess} />)

    await waitFor(() => {
      expect(screen.getByText('Upload Your CV')).toBeInTheDocument()
    })

    const file = new File(['dummy pdf content'], 'my-resume.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)
    await user.click(screen.getByText('Upload Now'))

    await waitFor(() => {
      expect(cvService.uploadCV).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByText(/CV Uploaded Successfully/)).toBeInTheDocument()
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('shows error when invalid file is selected', async () => {
    ;(cvService.validateFile as jest.Mock).mockReturnValue({
      valid: false,
      error: 'File type not supported. Please upload PDF or DOCX.',
    })

    render(<CVUpload />)

    await waitFor(() => {
      expect(screen.getByText('Upload Your CV')).toBeInTheDocument()
    })

    const file = new File(['invalid'], 'image.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    // Use fireEvent.change for more reliable file input simulation
    Object.defineProperty(input, 'files', { value: [file] })
    const { fireEvent } = require('@testing-library/react')
    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByText('File type not supported. Please upload PDF or DOCX.')).toBeInTheDocument()
    })
  })
})
