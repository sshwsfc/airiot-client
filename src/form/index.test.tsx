import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, useForm } from './base'
import type { FormField } from './schema'

vi.mock('react-final-form-arrays', () => ({
  FieldArray: ({ name, children }: any) => <div data-testid={`array-${name}`}>{children}</div>
}))

vi.mock('./locales/index', () => ({
  default: vi.fn((key: string) => key)
}))

describe('Form Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Component', () => {
    const mockFields: FormField[] = [
      {
        key: 'name',
        name: 'name',
        label: 'Name',
        type: 'string',
        required: true
      },
      {
        key: 'email',
        name: 'email',
        label: 'Email',
        type: 'string'
      }
    ]

    const mockOnSubmit = vi.fn().mockResolvedValue({ success: true })

    it('should render form with fields', () => {
      render(
        <Form
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup()

      render(
        <Form
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /submit/i }) ||
                         screen.getByText('Submit') ||
                         document.querySelector('button')

      if (submitButton) {
        await user.click(submitButton)
        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled()
        })
      }
    })

    it('should initialize with data prop', () => {
      const initialData = { name: 'Test User', email: 'test@example.com' }

      render(
        <Form
          fields={mockFields}
          onSubmit={mockOnSubmit}
          data={initialData}
        />
      )

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const user = userEvent.setup()

      render(
        <Form
          fields={mockFields}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /submit/i }) ||
                         screen.getByText('Submit') ||
                         document.querySelector('button')

      if (submitButton) {
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(/is required/i)).toBeInTheDocument()
        })
      }
    })

    it('should call onChange when values change', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <Form
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onChange={mockOnChange}
        />
      )

      const nameInput = screen.getByLabelText(/name/i) ||
                       screen.getByPlaceholderText(/name/i) ||
                       document.querySelector('input[name="name"]')

      if (nameInput) {
        await user.type(nameInput, 'John')

        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'John' })
          )
        })
      }
    })

    it('should call onSubmitSuccess on successful submission', async () => {
      const user = userEvent.setup()
      const mockOnSubmitSuccess = vi.fn()
      const successfulSubmit = vi.fn().mockResolvedValue({ success: true })

      render(
        <Form
          fields={mockFields}
          onSubmit={successfulSubmit}
          onSubmitSuccess={mockOnSubmitSuccess}
          data={{ name: 'Test' }}
        />
      )

      const submitButton = screen.getByRole('button', { name: /submit/i }) ||
                         screen.getByText('Submit') ||
                         document.querySelector('button')

      if (submitButton) {
        await user.click(submitButton)

        await waitFor(() => {
          expect(successfulSubmit).toHaveBeenCalled()
          expect(mockOnSubmitSuccess).toHaveBeenCalled()
        })
      }
    })
  })

  describe('useForm Hook', () => {
    it('should return form instance', () => {
      const TestComponent = () => {
        const { form } = useForm()

        return <div data-testid="form-instance">{form ? 'has-form' : 'no-form'}</div>
      }

      render(<TestComponent />)

      expect(screen.getByTestId('form-instance')).toHaveTextContent('has-form')
    })

    it('should register form fields', () => {
      const TestComponent = () => {
        const { registerField } = useForm()

        React.useEffect(() => {
          registerField('test-field', { type: 'string' })
        }, [registerField])

        return <div>Test Form</div>
      }

      render(<TestComponent />)
    })
  })

  describe('Form Validation', () => {
    const requiredFields: FormField[] = [
      {
        key: 'required',
        name: 'required',
        label: 'Required Field',
        type: 'string',
        required: true
      }
    ]

    it('should show error for empty required field', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(
        <Form
          fields={requiredFields}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = document.querySelector('button')
      if (submitButton) {
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.queryByText(/is required/i)).toBeInTheDocument()
        })
      }
    })

    it('should not show error for filled required field', async () => {
      const user = userEvent.setup()
      const mockOnSubmit = vi.fn()

      render(
        <Form
          fields={requiredFields}
          onSubmit={mockOnSubmit}
          data={{ required: 'value' }}
        />
      )

      const submitButton = document.querySelector('button')
      if (submitButton) {
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.queryByText(/is required/i)).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Form Field Types', () => {
    const numericField: FormField[] = [
      {
        key: 'age',
        name: 'age',
        label: 'Age',
        type: 'number',
        minimum: 0,
        maximum: 120
      }
    ]

    it('should render number field', () => {
      render(
        <Form
          fields={numericField}
          onSubmit={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
    })

    const booleanField: FormField[] = [
      {
        key: 'active',
        name: 'active',
        label: 'Active',
        type: 'boolean'
      }
    ]

    it('should render boolean field', () => {
      render(
        <Form
          fields={booleanField}
          onSubmit={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/active/i)).toBeInTheDocument()
    })

    const selectField: FormField[] = [
      {
        key: 'status',
        name: 'status',
        label: 'Status',
        type: 'string',
        enum: ['active', 'inactive'],
        enumNames: ['Active', 'Inactive']
      }
    ]

    it('should render select field', () => {
      render(
        <Form
          fields={selectField}
          onSubmit={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })
  })
})
