"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, ExternalLink, Database, Key, Globe, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [credentials, setCredentials] = useState({
    vectorUrl: "",
    vectorToken: "",
    openaiKey: "",
  })
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)

  const steps = [
    {
      title: "Create Upstash Vector Index",
      description: "Set up your vector index on Upstash",
      icon: Database,
    },
    {
      title: "Get API Credentials",
      description: "Copy your index credentials",
      icon: Key,
    },
    {
      title: "Configure Environment",
      description: "Set up your environment variables",
      icon: Globe,
    },
  ]

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/vector-stats")
      const data = await response.json()

      if (data.success) {
        setTestResult({
          success: true,
          message: `✅ Connection successful! Found ${data.stats?.totalVectors || 0} vectors in your index.`,
        })
      } else {
        setTestResult({
          success: false,
          message: `❌ Connection failed: ${data.error || "Unknown error"}`,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${error instanceof Error ? error.message : "Network error"}`,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 md:p-24 bg-gray-50">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Williams-Sonoma FAQ Assistant Setup</CardTitle>
            <CardDescription>Follow these steps to set up your RAG-powered FAQ assistant</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {steps.map((stepItem, index) => {
                const StepIcon = stepItem.icon
                const isActive = step === index + 1
                const isCompleted = step > index + 1

                return (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                    </div>
                    <div className="text-sm font-medium">{stepItem.title}</div>
                    <div className="text-xs text-muted-foreground max-w-24">{stepItem.description}</div>
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 1: Create Upstash Vector Index</h3>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Can't see your vector index?</strong> This is common! Try these troubleshooting steps below.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">📋 Step-by-step instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        Go to{" "}
                        <a
                          href="https://console.upstash.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Upstash Console <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>Make sure you're logged into the correct account</li>
                      <li>Look for "Vector" in the left sidebar menu</li>
                      <li>Click on "Vector" to go to the Vector dashboard</li>
                      <li>
                        <strong>Click "Create Index"</strong> (green button)
                      </li>
                      <li>
                        Fill in the form:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>
                            <strong>Name:</strong> williams-sonoma-faq
                          </li>
                          <li>
                            <strong>Region:</strong> Choose closest to you
                          </li>
                          <li>
                            <strong>Dimension:</strong> 1536
                          </li>
                          <li>
                            <strong>Distance Metric:</strong> Cosine
                          </li>
                        </ul>
                      </li>
                      <li>Click "Create Index"</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🔍 Troubleshooting - Can't see your index?</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>
                        <strong>Refresh the page:</strong> Sometimes it takes a moment to appear
                      </li>
                      <li>
                        <strong>Check the region:</strong> Make sure you're looking in the right region
                      </li>
                      <li>
                        <strong>Check your account:</strong> Ensure you're logged into the correct Upstash account
                      </li>
                      <li>
                        <strong>Look for "Vector" tab:</strong> It should be in the left sidebar, not under Redis
                      </li>
                      <li>
                        <strong>Try a different browser:</strong> Sometimes browser cache causes issues
                      </li>
                      <li>
                        <strong>Wait a few minutes:</strong> Index creation can take 1-2 minutes
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">✅ What you should see after creation:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Your index should appear in the Vector dashboard</li>
                      <li>You should see the index name "williams-sonoma-faq"</li>
                      <li>Status should show as "Active" or "Ready"</li>
                      <li>You can click on it to see details and get credentials</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setStep(2)} className="flex-1">
                      I Can See My Index Now →
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open("https://console.upstash.com/", "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Upstash Console
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 2: Get Your API Credentials</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🔑 Getting credentials from your Vector Index:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        In the Upstash Vector dashboard, <strong>click on your index name</strong>
                      </li>
                      <li>You'll be taken to the index details page</li>
                      <li>
                        Look for a <strong>"Connect"</strong> tab or section
                      </li>
                      <li>You should see environment variables like:</li>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1 font-mono text-xs bg-gray-100 p-2 rounded">
                        <li>UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io</li>
                        <li>UPSTASH_VECTOR_REST_TOKEN=xxxxx</li>
                      </ul>
                      <li>Copy these values (without the variable names)</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🤖 For OpenAI API Key:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>
                        Go to{" "}
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          OpenAI API Keys
                        </a>
                      </li>
                      <li>Create a new API key if you don't have one</li>
                      <li>Copy the key (starts with "sk-")</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vectorUrl">Upstash Vector REST URL</Label>
                      <Input
                        id="vectorUrl"
                        placeholder="https://xxx-xxx-vector.upstash.io"
                        value={credentials.vectorUrl}
                        onChange={(e) => setCredentials({ ...credentials, vectorUrl: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Should look like: https://xxx-xxx-vector.upstash.io
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="vectorToken">Upstash Vector REST Token</Label>
                      <Input
                        id="vectorToken"
                        type="password"
                        placeholder="Your token here..."
                        value={credentials.vectorToken}
                        onChange={(e) => setCredentials({ ...credentials, vectorToken: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Long string of characters (no "Bearer" prefix needed)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="openaiKey">OpenAI API Key</Label>
                      <Input
                        id="openaiKey"
                        type="password"
                        placeholder="sk-..."
                        value={credentials.openaiKey}
                        onChange={(e) => setCredentials({ ...credentials, openaiKey: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Starts with "sk-"</p>
                    </div>
                  </div>

                  {/* Test Connection Button */}
                  <div className="space-y-2">
                    <Button
                      onClick={testConnection}
                      disabled={testing || !credentials.vectorUrl || !credentials.vectorToken}
                      className="w-full"
                    >
                      {testing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>

                    {testResult && (
                      <Alert
                        className={testResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}
                      >
                        <AlertDescription>{testResult.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    className="w-full"
                    disabled={!credentials.vectorUrl || !credentials.vectorToken || !credentials.openaiKey}
                  >
                    Continue to Environment Setup →
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step 3: Configure Environment Variables</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">📋 Copy these environment variables:</h4>
                    <Textarea
                      readOnly
                      value={`UPSTASH_VECTOR_REST_URL=${credentials.vectorUrl}
UPSTASH_VECTOR_REST_TOKEN=${credentials.vectorToken}
OPENAI_API_KEY=${credentials.openaiKey}`}
                      className="font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🚀 How to add to Vercel:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Go to your Vercel dashboard</li>
                      <li>Select your project</li>
                      <li>Go to Settings → Environment Variables</li>
                      <li>Add each variable above (one by one)</li>
                      <li>Click "Save" for each variable</li>
                      <li>
                        <strong>Important:</strong> Redeploy your application after adding variables
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testConnection} disabled={testing} className="flex-1">
                      {testing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Final Connection"
                      )}
                    </Button>
                    <Button onClick={() => (window.location.href = "/admin")} variant="outline" className="flex-1">
                      Go to Admin Dashboard
                    </Button>
                  </div>

                  {testResult && (
                    <Alert className={testResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                      <AlertDescription>{testResult.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions & Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <a href="https://console.upstash.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Upstash Console
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  OpenAI API Keys
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin">
                  <Database className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
