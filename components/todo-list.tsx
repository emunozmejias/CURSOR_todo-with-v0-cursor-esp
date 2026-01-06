"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Check, X, Plus } from "lucide-react"

interface Todo {
  id: number
  text: string
  completed: boolean
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }])
      setNewTodo("")
    }
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const startEditing = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = () => {
    if (editText.trim() && editingId !== null) {
      setTodos(todos.map((todo) => (todo.id === editingId ? { ...todo, text: editText.trim() } : todo)))
      setEditingId(null)
      setEditText("")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action()
    }
  }

  const activeTodos = todos.filter((t) => !t.completed).length
  const completedTodos = todos.filter((t) => t.completed).length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground text-balance">{"Mis Tareas"}</h1>
              <p className="text-muted-foreground mt-1 text-sm">{"Organiza tu día de manera efectiva"}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{activeTodos}</div>
                <div className="text-muted-foreground">{"Activas"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{completedTodos}</div>
                <div className="text-muted-foreground">{"Completadas"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Todo Form */}
        <Card className="p-6 mb-8 bg-card border-border shadow-sm">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Agregar una nueva tarea..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addTodo)}
              className="flex-1 bg-input border-border focus-visible:ring-accent"
            />
            <Button onClick={addTodo} className="bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {"Agregar"}
            </Button>
          </div>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border border-dashed">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">{"No hay tareas aún"}</p>
                <p className="text-sm">{"Comienza agregando una nueva tarea arriba"}</p>
              </div>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} className="p-4 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleComplete(todo.id)}
                    className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />

                  {editingId === todo.id ? (
                    <Input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                      className="flex-1 bg-input border-border focus-visible:ring-accent"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`flex-1 text-base ${
                        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {editingId === todo.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          className="h-9 w-9 p-0 hover:bg-accent/10 hover:text-accent"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-9 w-9 p-0 hover:bg-muted">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(todo.id, todo.text)}
                          className="h-9 w-9 p-0 hover:bg-accent/10 hover:text-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTodo(todo.id)}
                          className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{"© 2026 Todo List App. Organiza tu día de manera eficiente."}</p>
            <div className="flex gap-6">
              <span className="hover:text-accent transition-colors cursor-pointer">{"Ayuda"}</span>
              <span className="hover:text-accent transition-colors cursor-pointer">{"Privacidad"}</span>
              <span className="hover:text-accent transition-colors cursor-pointer">{"Términos"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
