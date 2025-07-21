import React, { useState, useRef } from 'react'
import { Plus, Upload, Link, FileText, Trash2, Settings, RefreshCw, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { blink } from '@/blink/client'

interface KnowledgeBase {
  id: string
  name: string
  description: string
  file_count: number
  total_size: number
  auto_retrain: number
  retrain_schedule: string
  created_at: string
}

interface Document {
  id: string
  knowledge_base_id: string
  name: string
  type: string
  content: string
  url: string
  file_size: number
  status: string
  created_at: string
}

interface KnowledgeBaseManagerProps {
  knowledgeBases: KnowledgeBase[]
  onUpdate: () => void
  userId: string
}

export function KnowledgeBaseManager({ knowledgeBases, onUpdate, userId }: KnowledgeBaseManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newKB, setNewKB] = useState({
    name: '',
    description: '',
    auto_retrain: false,
    retrain_schedule: 'daily'
  })
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const createKnowledgeBase = async () => {
    if (!newKB.name.trim()) return
    
    setLoading(true)
    try {
      const kb = await blink.db.knowledgeBases.create({
        id: `kb_${Date.now()}`,
        userId,
        name: newKB.name,
        description: newKB.description,
        autoRetrain: newKB.auto_retrain ? 1 : 0,
        retrainSchedule: newKB.retrain_schedule,
        fileCount: 0,
        totalSize: 0
      })
      
      setNewKB({ name: '', description: '', auto_retrain: false, retrain_schedule: 'daily' })
      setIsCreateOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to create knowledge base:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (kbId: string) => {
    try {
      const docs = await blink.db.documents.list({
        where: { knowledgeBaseId: kbId },
        orderBy: { createdAt: 'desc' }
      })
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!selectedKB || files.length === 0) return

    setLoading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 50) // First 50% for upload

        // Upload file to storage
        const { publicUrl } = await blink.storage.upload(
          file,
          `knowledge-bases/${selectedKB.id}/${file.name}`,
          { upsert: true }
        )

        setUploadProgress((i / files.length) * 75) // 75% for storage upload

        // Extract text content from file
        let content = ''
        try {
          content = await blink.data.extractFromBlob(file)
        } catch (error) {
          console.error('Failed to extract content from file:', error)
          content = 'Content extraction failed'
        }

        setUploadProgress((i / files.length) * 90) // 90% for content extraction

        // Save document to database
        await blink.db.documents.create({
          id: `doc_${Date.now()}_${i}`,
          knowledgeBaseId: selectedKB.id,
          userId,
          name: file.name,
          type: 'file',
          content,
          url: publicUrl,
          fileSize: file.size,
          status: 'ready'
        })

        setUploadProgress(((i + 1) / files.length) * 100) // 100% complete
      }

      // Update knowledge base stats
      await blink.db.knowledgeBases.update(selectedKB.id, {
        fileCount: selectedKB.file_count + files.length,
        totalSize: selectedKB.total_size + Array.from(files).reduce((sum, f) => sum + f.size, 0)
      })

      loadDocuments(selectedKB.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to upload files:', error)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleUrlScraping = async () => {
    if (!selectedKB || !urlInput.trim()) return

    setLoading(true)
    try {
      // Scrape URL content using Blink's data scraping
      const { markdown, metadata } = await blink.data.scrape(urlInput)
      
      // Save scraped content as document
      await blink.db.documents.create({
        id: `doc_${Date.now()}`,
        knowledgeBaseId: selectedKB.id,
        userId,
        name: metadata.title || urlInput,
        type: 'url',
        content: markdown,
        url: urlInput,
        fileSize: markdown.length,
        status: 'ready'
      })

      // Update knowledge base stats
      await blink.db.knowledgeBases.update(selectedKB.id, {
        fileCount: selectedKB.file_count + 1,
        totalSize: selectedKB.total_size + markdown.length
      })

      setUrlInput('')
      loadDocuments(selectedKB.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to scrape URL:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTextInput = async () => {
    if (!selectedKB || !textInput.trim()) return

    setLoading(true)
    try {
      await blink.db.documents.create({
        id: `doc_${Date.now()}`,
        knowledgeBaseId: selectedKB.id,
        userId,
        name: `Text Input - ${new Date().toLocaleDateString()}`,
        type: 'text',
        content: textInput,
        url: '',
        fileSize: textInput.length,
        status: 'ready'
      })

      // Update knowledge base stats
      await blink.db.knowledgeBases.update(selectedKB.id, {
        fileCount: selectedKB.file_count + 1,
        totalSize: selectedKB.total_size + textInput.length
      })

      setTextInput('')
      loadDocuments(selectedKB.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to add text:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (docId: string, docSize: number) => {
    if (!selectedKB) return

    try {
      await blink.db.documents.delete(docId)
      
      // Update knowledge base stats
      await blink.db.knowledgeBases.update(selectedKB.id, {
        fileCount: Math.max(0, selectedKB.file_count - 1),
        totalSize: Math.max(0, selectedKB.total_size - docSize)
      })

      loadDocuments(selectedKB.id)
      onUpdate()
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const triggerRetrain = async (kbId: string) => {
    setLoading(true)
    try {
      // Simulate retraining process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update last retrain timestamp
      await blink.db.knowledgeBases.update(kbId, {
        updatedAt: new Date().toISOString()
      })
      
      onUpdate()
    } catch (error) {
      console.error('Failed to retrain:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base Manager</h2>
          <p className="text-muted-foreground">Upload unlimited files, scrape URLs, and manage your AI knowledge</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Knowledge Base</DialogTitle>
              <DialogDescription>
                Set up a new knowledge base with unlimited storage capacity
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newKB.name}
                  onChange={(e) => setNewKB({ ...newKB, name: e.target.value })}
                  placeholder="e.g., Customer Support KB"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newKB.description}
                  onChange={(e) => setNewKB({ ...newKB, description: e.target.value })}
                  placeholder="Describe what this knowledge base will contain..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-retrain"
                  checked={newKB.auto_retrain}
                  onCheckedChange={(checked) => setNewKB({ ...newKB, auto_retrain: checked })}
                />
                <Label htmlFor="auto-retrain">Enable auto-retraining</Label>
              </div>
              {newKB.auto_retrain && (
                <div>
                  <Label htmlFor="schedule">Retrain Schedule</Label>
                  <Select
                    value={newKB.retrain_schedule}
                    onValueChange={(value) => setNewKB({ ...newKB, retrain_schedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={createKnowledgeBase} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Knowledge Base'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Knowledge Bases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Bases List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Knowledge Bases</CardTitle>
              <CardDescription>Select a knowledge base to manage</CardDescription>
            </CardHeader>
            <CardContent>
              {knowledgeBases.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No knowledge bases yet. Create your first one!
                </p>
              ) : (
                <div className="space-y-3">
                  {knowledgeBases.map((kb) => (
                    <div
                      key={kb.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedKB?.id === kb.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedKB(kb)
                        loadDocuments(kb.id)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{kb.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {kb.file_count} docs • {formatSize(kb.total_size)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={Number(kb.auto_retrain) > 0 ? "default" : "secondary"}>
                            {Number(kb.auto_retrain) > 0 ? "Auto" : "Manual"}
                          </Badge>
                          {Number(kb.auto_retrain) > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {kb.retrain_schedule}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base Details */}
        <div className="lg:col-span-2">
          {selectedKB ? (
            <div className="space-y-6">
              {/* KB Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{selectedKB.name}</span>
                        <Badge variant="outline">Unlimited Storage</Badge>
                      </CardTitle>
                      <CardDescription>{selectedKB.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerRetrain(selectedKB.id)}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Retrain
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing files...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Content</CardTitle>
                  <CardDescription>Upload files, scrape URLs, or add text directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="files" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="files">Files</TabsTrigger>
                      <TabsTrigger value="urls">URLs</TabsTrigger>
                      <TabsTrigger value="text">Text</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="files" className="space-y-4">
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Drop files here or click to upload</p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOC, TXT, CSV, and more. No size limits!
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        accept=".pdf,.doc,.docx,.txt,.csv,.json,.md"
                      />
                    </TabsContent>

                    <TabsContent value="urls" className="space-y-4">
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder="https://example.com/article"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUrlScraping} disabled={loading || !urlInput.trim()}>
                          <Globe className="w-4 h-4 mr-2" />
                          Scrape URL
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically extract and process content from any public URL
                      </p>
                    </TabsContent>

                    <TabsContent value="text" className="space-y-4">
                      <Textarea
                        placeholder="Paste your text content here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={6}
                      />
                      <Button onClick={handleTextInput} disabled={loading || !textInput.trim()}>
                        <FileText className="w-4 h-4 mr-2" />
                        Add Text
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Documents List */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents ({documents.length})</CardTitle>
                  <CardDescription>Manage your knowledge base content</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No documents yet. Add some content to get started!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              {doc.type === 'file' && <FileText className="w-4 h-4 text-primary" />}
                              {doc.type === 'url' && <Globe className="w-4 h-4 text-primary" />}
                              {doc.type === 'text' && <FileText className="w-4 h-4 text-primary" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {doc.type.toUpperCase()} • {formatSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDocument(doc.id, doc.file_size)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a Knowledge Base</h3>
                  <p className="text-muted-foreground">
                    Choose a knowledge base from the left to manage its content
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}