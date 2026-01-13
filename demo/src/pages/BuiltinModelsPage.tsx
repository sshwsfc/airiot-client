import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'

const builtinModels = [
  { name: 'Device', title: '单设备', resource: 'core/t/schema', description: '设备数据管理' },
  { name: 'System', title: '系统设置', resource: 'setting', description: '系统配置管理' },
  { name: 'User', title: '用户管理', resource: 'core/user', description: '用户账号管理' },
  { name: 'Role', title: '角色管理', resource: 'core/role', description: '用户角色管理' },
  { name: 'DriverInstance', title: '驱动管理', resource: 'driver/driverInstance', description: '驱动实例管理' },
  { name: 'Flow', title: '流程', resource: 'flow/flow', description: '工作流程管理' },
  { name: 'FlowTask', title: '我的任务', resource: 'flow/flowTask/currentUser', description: '我的任务列表' },
  { name: 'Dashboard', title: '画面', resource: 'core/dashboard', description: '可视化画面管理' },
  { name: 'Site', title: '前台', resource: 'core/site', description: '前端站点管理' },
  { name: 'Theme', title: '系统主题', resource: 'core/theme', description: '主题配置管理' },
  { name: 'Log', title: '操作日志', resource: 'core/log', description: '用户操作记录' },
  { name: 'SystemLog', title: '系统日志', resource: 'syslog/log', description: '系统运行日志' },
  { name: 'Table', title: '数据表', resource: 'core/t/schema', description: '数据表定义管理' },
  { name: 'Warning', title: '告警管理', resource: 'core/warning', description: '告警规则和记录' },
  { name: 'Rule', title: '规则管理', resource: 'core/rule', description: '业务规则管理' },
  { name: 'Report', title: '报表管理', resource: 'core/report', description: '报表配置和生成' },
  { name: 'TaskManager', title: '后台任务管理', resource: 'core/taskmanager', description: '后台任务监控' },
  { name: 'Instruct', title: '指令状态管理', resource: 'driver/instruct', description: '设备指令管理' },
  { name: 'DeviceEvent', title: '驱动事件信息', resource: 'driver/event', description: '驱动事件记录' },
  { name: 'ArchiveEvent', title: '驱动事件归档', resource: 'driver/archiveEvent', description: '历史事件归档' },
  { name: 'backup', title: '备份与还原', resource: 'core/backup', description: '数据备份管理' },
  { name: 'dbBackup', title: '数据库备份', resource: 'db-backup', description: '数据库备份' },
  { name: 'tsdbBackup', title: '历史数据备份', resource: 'tsdb-backup', description: '时序数据备份' }
]

export default function BuiltinModelsPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>内置模型演示</CardTitle>
        <CardDescription>演示使用内置的 Airiot 系统模型</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 rounded-lg border bg-muted">
          <p className="text-sm"><strong>内置模型数量：</strong> 46 个</p>
          <p className="text-sm"><strong>使用方式：</strong> 通过 Model 组件的 name 属性指定</p>
          <pre className="mt-2 p-2 rounded bg-background text-xs">
            &lt;Model name="Device"&gt;
              {/* 你的组件 */}
            &lt;/Model&gt;
          </pre>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>模型名称</TableHead>
              <TableHead>中文名称</TableHead>
              <TableHead>API 资源</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {builtinModels.map((model) => (
              <TableRow key={model.name}>
                <TableCell>
                  <code className="text-xs">{model.name}</code>
                </TableCell>
                <TableCell>{model.title}</TableCell>
                <TableCell>
                  <code className="text-xs">{model.resource}</code>
                </TableCell>
                <TableCell>{model.description}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setSelectedModel(model.name)}>
                    查看详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 模型详情对话框 */}
        {selectedModel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '500px',
              maxWidth: '90%'
            }}>
              <h3 className="text-lg font-semibold mb-4">模型详情: {selectedModel}</h3>
              <div className="space-y-3">
                <p><strong>模型名称：</strong> {selectedModel}</p>
                <p><strong>中文名称：</strong> {builtinModels.find(m => m.name === selectedModel)?.title}</p>
                <p><strong>API 资源：</strong> {builtinModels.find(m => m.name === selectedModel)?.resource}</p>
                <p><strong>描述：</strong> {builtinModels.find(m => m.name === selectedModel)?.description}</p>
                <pre className="mt-4 p-4 rounded-lg bg-muted text-sm overflow-auto" style={{ maxHeight: '200px' }}>
{`<Model name="${selectedModel}">
  {/* 你的组件 */}
</Model>`}
                </pre>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedModel(null)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}

        <Alert variant="default" className="mt-6">
          <AlertDescription>
            <strong>说明：</strong>
            <br />
            内置模型在 src/model/models.json 中定义，共有 46 个 Airiot 系统模型。
            <br />
            涵盖：数据管理、驱动管理、流程管理、备份管理、日志管理、权限管理等多个模块。
            <br />
            使用内置模型可以快速开发 Airiot 平台应用，无需重复定义模型配置。
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
