import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Model, ModelInitial, useModel } from './base'
import type { ModelSchema } from './base'

vi.mock('../api', () => ({
  createAPI: vi.fn(() => ({
    get: vi.fn(),
    query: vi.fn(),
    save: vi.fn(),
    delete: vi.fn()
  })),
  default: vi.fn()
}))

vi.mock('./atoms', () => ({
  default: vi.fn(() => ({
    items: vi.fn(),
    loading: vi.fn(),
    total: vi.fn(),
    option: vi.fn(),
    wheres: vi.fn()
  }))
}))

describe('Model Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Model Component', () => {
    const mockSchema: ModelSchema = {
      name: 'test',
      key: 'test',
      title: 'Test Model',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      },
      listFields: ['id', 'name'],
      defaultPageSize: 20
    }

    it('should render model context provider', () => {
      const TestComponent = () => {
        const { model } = useModel()

        return (
          <div data-testid="model-name">{model.name}</div>
        )
      }

      render(
        <Model schema={mockSchema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-name')).toHaveTextContent('test')
    })

    it('should throw error when using useModel outside Model context', () => {
      const TestComponent = () => {
        const { model } = useModel()
        return <div>{model.name}</div>
      }

      expect(() => {
        render(<TestComponent />)
      }).toThrow()
    })

    it('should use registered model by name', () => {
      const TestComponent = () => {
        const { model } = useModel()

        return (
          <div data-testid="model-title">{model.title}</div>
        )
      }

      render(
        <Model name="test" schema={mockSchema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-title')).toHaveTextContent('Test Model')
    })

    it('should merge model props with schema', () => {
      const TestComponent = () => {
        const { model } = useModel()

        return (
          <div data-testid="model-key">{model.key}</div>
        )
      }

      render(
        <Model
          schema={mockSchema}
          modelKey="custom-key"
          props={{ customProp: 'value' }}
        >
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-key')).toHaveTextContent('custom-key')
    })

    it('should use provided atoms', () => {
      const mockAtoms = {
        items: vi.fn(),
        loading: vi.fn()
      } as any

      const TestComponent = () => {
        const { atoms } = useModel()

        return (
          <div data-testid="has-atoms">
            {atoms ? 'yes' : 'no'}
          </div>
        )
      }

      render(
        <Model schema={mockSchema} atoms={mockAtoms}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('has-atoms')).toHaveTextContent('yes')
    })
  })

  describe('ModelInitial Component', () => {
    const mockSchema: ModelSchema = {
      name: 'test',
      key: 'test',
      listFields: ['id', 'name'],
      defaultPageSize: 15,
      defaultOrder: { createdAt: 'DESC' },
      properties: {}
    }

    it('should initialize model state', () => {
      const TestComponent = () => <div>Initialized</div>

      render(
        <Model schema={mockSchema}>
          <ModelInitial model={mockSchema}>
            <TestComponent />
          </ModelInitial>
        </Model>
      )

      expect(screen.getByText('Initialized')).toBeInTheDocument()
    })

    it('should use initial values', async () => {
      const initialValues = {
        wheres: { status: 'active' },
        option: { limit: 25 }
      }

      const TestComponent = () => <div>With Initial Values</div>

      render(
        <Model schema={mockSchema}>
          <ModelInitial model={mockSchema} initialValues={initialValues}>
            <TestComponent />
          </ModelInitial>
        </Model>
      )

      expect(screen.getByText('With Initial Values')).toBeInTheDocument()
    })

    it('should parse query parameters', async () => {
      const query = { f_status: 'active', f_name: 'test' }

      const TestComponent = () => <div>With Query</div>

      render(
        <Model schema={mockSchema}>
          <ModelInitial model={mockSchema} query={query}>
            <TestComponent />
          </ModelInitial>
        </Model>
      )

      expect(screen.getByText('With Query')).toBeInTheDocument()
    })
  })

  describe('useModel Hook', () => {
    const mockSchema: ModelSchema = {
      name: 'test',
      key: 'test',
      properties: {
        id: { type: 'string' }
      },
      listFields: ['id']
    }

    it('should return model context', () => {
      const TestComponent = () => {
        const context = useModel()

        return (
          <div>
            <div data-testid="model-name">{context.model.name}</div>
            <div data-testid="has-api">
              {context.api ? 'yes' : 'no'}
            </div>
            <div data-testid="has-atoms">
              {context.atoms ? 'yes' : 'no'}
            </div>
          </div>
        )
      }

      render(
        <Model schema={mockSchema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-name')).toHaveTextContent('test')
      expect(screen.getByTestId('has-api')).toHaveTextContent('yes')
      expect(screen.getByTestId('has-atoms')).toHaveTextContent('yes')
    })

    it('should include model schema properties', () => {
      const TestComponent = () => {
        const { model } = useModel()

        return (
          <div data-testid="has-properties">
            {model.properties ? 'yes' : 'no'}
          </div>
        )
      }

      render(
        <Model schema={mockSchema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('has-properties')).toHaveTextContent('yes')
    })
  })

  describe('Model Schema', () => {
    it('should accept complete schema', () => {
      const completeSchema: ModelSchema = {
        name: 'complete',
        key: 'complete',
        title: 'Complete Model',
        icon: 'test-icon',
        permission: {
          view: true,
          add: true,
          edit: true,
          delete: false
        },
        initialValues: { status: 'active' },
        listFields: ['id', 'name', 'status'],
        defaultOrder: { createdAt: 'DESC' },
        orders: { name: 'ASC', status: 'DESC' },
        defaultPageSize: 20,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          status: { type: 'string' }
        },
        displayField: 'name',
        components: {},
        atoms: {} as any,
        blocks: {},
        events: {}
      }

      const TestComponent = () => {
        const { model } = useModel()

        return (
          <div>
            <div data-testid="model-title">{model.title}</div>
            <div data-testid="model-icon">{model.icon}</div>
            <div data-testid="model-permission">
              {model.permission?.view ? 'view' : ''}
            </div>
            <div data-testid="model-display">{model.displayField}</div>
          </div>
        )
      }

      render(
        <Model schema={completeSchema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-title')).toHaveTextContent('Complete Model')
      expect(screen.getByTestId('model-icon')).toHaveTextContent('test-icon')
      expect(screen.getByTestId('model-permission')).toHaveTextContent('view')
      expect(screen.getByTestId('model-display')).toHaveTextContent('name')
    })
  })

  describe('Model Registry', () => {
    it('should allow registering models', () => {
      const schema: ModelSchema = {
        name: 'registered',
        key: 'registered',
        properties: {}
      }

      const TestComponent = () => {
        const { model } = useModel()

        return <div data-testid="registered">{model.name}</div>
      }

      render(
        <Model schema={schema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('registered')).toHaveTextContent('registered')
    })

    it('should use model name when not provided', () => {
      const schema: ModelSchema = {
        key: 'auto-name',
        properties: {}
      }

      const TestComponent = () => {
        const { model } = useModel()

        return <div data-testid="model-key">{model.key}</div>
      }

      render(
        <Model schema={schema}>
          <TestComponent />
        </Model>
      )

      expect(screen.getByTestId('model-key')).toHaveTextContent('auto-name')
    })
  })
})
