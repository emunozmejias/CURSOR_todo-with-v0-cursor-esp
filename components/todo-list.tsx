"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2, Check, X, Plus, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Timestamp | null
}

const COLLECTION_NAME = "todos"

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar tareas desde Firebase con listener en tiempo real
  useEffect(() => {
    setIsLoading(true)
    setError(null)

    const todosRef = collection(db, COLLECTION_NAME)

    const unsubscribe = onSnapshot(
      todosRef,
      (snapshot) => {
        const todosData: Todo[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          text: docSnap.data().text,
          completed: docSnap.data().completed,
          createdAt: docSnap.data().createdAt,
        }))
        // Ordenar en el cliente por createdAt (más recientes primero)
        todosData.sort((a, b) => {
          if (!a.createdAt) return 1
          if (!b.createdAt) return -1
          return b.createdAt.seconds - a.createdAt.seconds
        })
        setTodos(todosData)
        setIsLoading(false)
      },
      (err) => {
        console.error("Error al cargar tareas:", err)
        setError("Error al cargar las tareas. Verifica tu conexión.")
        setIsLoading(false)
      }
    )

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // CREATE - Agregar nueva tarea
  const addTodo = async () => {
    if (!newTodo.trim()) return

    setIsAdding(true)
    setError(null)

    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        text: newTodo.trim(),
        completed: false,
        createdAt: serverTimestamp(),
      })
      setNewTodo("")
    } catch (err) {
      console.error("Error al agregar tarea:", err)
      setError("Error al agregar la tarea. Intenta de nuevo.")
    } finally {
      setIsAdding(false)
    }
  }

  // DELETE - Eliminar tarea
  const deleteTodo = async (id: string) => {
    setError(null)

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id))
    } catch (err) {
      console.error("Error al eliminar tarea:", err)
      setError("Error al eliminar la tarea. Intenta de nuevo.")
    }
  }

  // UPDATE - Cambiar estado completado
  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    setError(null)

    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        completed: !currentCompleted,
      })
    } catch (err) {
      console.error("Error al actualizar tarea:", err)
      setError("Error al actualizar la tarea. Intenta de nuevo.")
    }
  }

  // Iniciar edición
  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  // UPDATE - Guardar edición del texto
  const saveEdit = async () => {
    if (!editText.trim() || editingId === null) return

    setError(null)

    try {
      await updateDoc(doc(db, COLLECTION_NAME, editingId), {
        text: editText.trim(),
      })
      setEditingId(null)
      setEditText("")
    } catch (err) {
      console.error("Error al editar tarea:", err)
      setError("Error al editar la tarea. Intenta de nuevo.")
    }
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  // Manejar tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
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
              <h1 className="text-3xl font-bold text-foreground text-balance">
                {"Mis Tareas"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {"Organiza tu día de manera efectiva"}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{activeTodos}</div>
                <div className="text-muted-foreground">{"Activas"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {completedTodos}
                </div>
                <div className="text-muted-foreground">{"Completadas"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive/20 text-destructive">
            <p className="text-sm">{error}</p>
          </Card>
        )}

        {/* Add Todo Form */}
        <Card className="p-6 mb-8 bg-card border-border shadow-sm">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Agregar una nueva tarea..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addTodo)}
              disabled={isAdding}
              className="flex-1 bg-input border-border focus-visible:ring-accent"
            />
            <Button
              onClick={addTodo}
              disabled={isAdding || !newTodo.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {"Agregar"}
            </Button>
          </div>
        </Card>

        {/* Todo List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-12 text-center bg-card border-border">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{"Cargando tareas..."}</p>
              </div>
            </Card>
          ) : todos.length === 0 ? (
            <Card className="p-12 text-center bg-card border-border border-dashed">
              <div className="text-muted-foreground">
                <p className="text-lg mb-2">{"No hay tareas aún"}</p>
                <p className="text-sm">
                  {"Comienza agregando una nueva tarea arriba"}
                </p>
              </div>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card
                key={todo.id}
                className="p-4 bg-card border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleComplete(todo.id, todo.completed)}
                    className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />

                  {editingId === todo.id ? (
                    <Input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          saveEdit()
                        } else if (e.key === "Escape") {
                          cancelEdit()
                        }
                      }}
                      className="flex-1 bg-input border-border focus-visible:ring-accent"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`flex-1 text-base ${
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-9 w-9 p-0 hover:bg-muted"
                        >
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
              <span className="hover:text-accent transition-colors cursor-pointer">
                {"Ayuda"}
              </span>
              <span className="hover:text-accent transition-colors cursor-pointer">
                {"Privacidad"}
              </span>
              <span className="hover:text-accent transition-colors cursor-pointer">
                {"Términos"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
