/**
 * 统一的对话框状态管理
 *
 * 使用方式：
 * 1. 显示对话框：await showConfirmDialog(config)
 * 2. 手动关闭：closeConfirmDialog()
 * 3. 全局组件：<GlobalDialogs />
 */

import { atom, createStore, useAtom, useSetAtom } from 'jotai'

// 创建全局 store
const dialogStore = createStore()

// 创建 atoms
export const confirmDialogAtom = atom<{
  open: boolean
  resolve?: (value: boolean) => void
  config?: {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }
} | null>(null)

export const formDialogAtom = atom<{
  open: boolean
  resolve?: (value: any) => void
  config?: {
    title?: string
    description?: string
    fields?: any[]
    confirmText?: string
    cancelText?: string
    initialValues?: Record<string, any>
  }
} | null>(null)

/** SchemaForm 对话框 atom */
export const schemaFormDialogAtom = atom<{
  open: boolean
  resolve?: (value: any) => void
  config?: {
    title?: string
    description?: string
    schema?: any
    formSchema?: any
    confirmText?: string
    cancelText?: string
    initialValues?: Record<string, any>
  }
} | null>(null)

// 显示确认对话框
export function showConfirmDialog(
  config?: {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }
): Promise<boolean> {
  return new Promise((resolve) => {
    // 使用 store.set 设置 atom 值
    dialogStore.set(confirmDialogAtom, {
      open: true,
      resolve,
      config,
    })
  })
}

// 关闭确认对话框
export function closeConfirmDialog() {
  dialogStore.set(confirmDialogAtom, null)
}

// 显示表单对话框
export function showFormDialog(
  fields: any[],
  initialValues?: Record<string, any>,
  title?: string,
  description?: string
): Promise<Record<string, any> | null> {
  return new Promise((resolve) => {
    dialogStore.set(formDialogAtom, {
      open: true,
      resolve,
      config: {
        title,
        description,
        fields,
        confirmText: '确定',
        cancelText: '取消',
        initialValues,
      },
    })
  })
}

// 关闭表单对话框
export function closeFormDialog() {
  dialogStore.set(formDialogAtom, null)
}

// 显示 SchemaForm 对话框
export function showSchemaFormDialog(
  config?: {
    schema?: any
    initialValues?: Record<string, any>
    title?: string
    description?: string
    formSchema?: any
  }
): Promise<Record<string, any> | null> {
  return new Promise((resolve) => {
    dialogStore.set(schemaFormDialogAtom, {
      open: true,
      resolve,
      config: {
        title: config?.title,
        description: config?.description,
        schema: config?.schema,
        formSchema: config?.formSchema,
        confirmText: '确定',
        cancelText: '取消',
        initialValues: config?.initialValues,
      },
    })
  })
}

// 关闭 SchemaForm 对话框
export function closeSchemaFormDialog() {
  dialogStore.set(schemaFormDialogAtom, null)
}

// 组件使用的 hook
export function useGlobalDialogs() {
  // 指定使用 dialogStore
  const [confirmDialog] = useAtom(confirmDialogAtom, { store: dialogStore })
  const [formDialog] = useAtom(formDialogAtom, { store: dialogStore })
  const [schemaFormDialog] = useAtom(schemaFormDialogAtom, { store: dialogStore })
  const setConfirmDialog = useSetAtom(confirmDialogAtom, { store: dialogStore })
  const setFormDialog = useSetAtom(formDialogAtom, { store: dialogStore })
  const setSchemaFormDialog = useSetAtom(schemaFormDialogAtom, { store: dialogStore })

  // 处理确认对话框的确认
  const handleConfirm = () => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(true)
      setConfirmDialog(null)
    }
  }

  // 处理确认对话框的取消
  const handleCancel = () => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(false)
      setConfirmDialog(null)
    }
  }

  // 处理表单对话框的确认
  const handleFormConfirm = (data: any) => {
    if (formDialog?.resolve) {
      formDialog.resolve(data)
      setFormDialog(null)
    }
  }

  // 处理表单对话框的取消
  const handleFormCancel = () => {
    if (formDialog?.resolve) {
      formDialog.resolve(null)
      setFormDialog(null)
    }
  }

  // 处理 SchemaForm 对话框的确认
  const handleSchemaFormConfirm = (data: any) => {
    if (schemaFormDialog?.resolve) {
      schemaFormDialog.resolve(data)
      setSchemaFormDialog(null)
    }
  }

  // 处理 SchemaForm 对话框的取消
  const handleSchemaFormCancel = () => {
    if (schemaFormDialog?.resolve) {
      schemaFormDialog.resolve(null)
      setSchemaFormDialog(null)
    }
  }

  return {
    confirmDialog,
    formDialog,
    schemaFormDialog,
    handleConfirm,
    handleCancel,
    handleFormConfirm,
    handleFormCancel,
    handleSchemaFormConfirm,
    handleSchemaFormCancel,
  }
}
