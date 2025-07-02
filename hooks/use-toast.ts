"use client"

import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Maximum number of toasts to show at once
const TOAST_LIMIT = 1
// Delay before removing toast from DOM after closing (in milliseconds)
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Define action types as a const object
const ACTION_TYPES = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// type ActionType = keyof typeof ACTION_TYPES

// Counter for generating unique toast IDs
let count = 0

/**
 * Generates a unique ID for each toast
 * Uses a counter that wraps around at MAX_SAFE_INTEGER
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | {
      type: typeof ACTION_TYPES["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: typeof ACTION_TYPES["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof ACTION_TYPES["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: typeof ACTION_TYPES["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

// Map to store timeouts for removing toasts from the DOM
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Adds a toast to the removal queue
 * Sets a timeout to remove the toast from the DOM after TOAST_REMOVE_DELAY
 * 
 * @param toastId - ID of the toast to remove
 */
const addToRemoveQueue = (toastId: string) => {
  // Prevent duplicate timeouts
  if (toastTimeouts.has(toastId)) {
    return
  }

  // Set timeout to remove the toast after delay
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  // Store the timeout reference
  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer function for managing toast state
 * Handles adding, updating, dismissing, and removing toasts
 * 
 * @param state - Current toast state
 * @param action - Action to perform on the state
 * @returns New toast state
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add a new toast to the beginning of the array and limit the total number
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Update an existing toast by its ID
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Add the toast(s) to the removal queue
      if (toastId) {
        // Dismiss a specific toast
        addToRemoveQueue(toastId)
      } else {
        // Dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // Mark the toast(s) as closed but keep in DOM until animation completes
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        // Remove all toasts
        return {
          ...state,
          toasts: [],
        }
      }
      // Remove a specific toast by ID
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state; // Add default case to handle all action types
  }
}

// Array of state change listeners (React setState functions)
const listeners: Array<(state: State) => void> = []

// Global state stored in memory outside of React
let memoryState: State = { toasts: [] }

/**
 * Dispatches an action to update the toast state
 * Updates the global memory state and notifies all listeners
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Type for creating a new toast (without the ID which is generated internally)
type Toast = Omit<ToasterToast, "id">

/**
 * Creates and displays a new toast notification
 * 
 * @param props - Toast properties (title, description, etc.)
 * @returns Object with methods to control the toast (dismiss, update) and the toast ID
 */
function toast({ ...props }: Toast) {
  // Generate a unique ID for this toast
  const id = genId()

  // Function to update this specific toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  
  // Function to dismiss this specific toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Add the toast to the state
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  // Return methods to control this toast
  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Custom hook for toast notifications
 * Provides access to the toast state and methods to create, update, and dismiss toasts
 * 
 * @returns Object containing toast state and methods
 */
function useToast() {
  // Initialize state with current memory state
  const [state, setState] = React.useState<State>(memoryState)

  // Subscribe to state changes and clean up on unmount
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }