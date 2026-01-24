import React, { useState, createElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const useVar = (key: string) => {
  const [value] = useState('This is a variable value for key: ' + key)
  return value
}

function HelloWorldPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
        <CardDescription>这是一个简单的测试页面</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">Hello World! 欢迎来到测试页面。</p>
        {createElement(() => {
          const events = {}
          return <button {...events}>{useVar('acb')}</button> 
        })}
      </CardContent>
    </Card>
  )
}

export default HelloWorldPage
