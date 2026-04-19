import { useState, useCallback } from 'react';

/**
 * useOptimisticMutation - Hook para mutaciones optimistas
 * 
 * Actualiza la UI inmediatamente mientras la API se procesa en segundo plano
 * 
 * @param {Function} mutationFn - Función async que ejecuta la mutación (API call)
 * @param {Object} options - Configuración
 *   - onSuccess: Callback después de éxito
 *   - onError: Callback después de error
 *   - rollbackOnError: Si true, revierte a valor anterior en caso de error
 * 
 * @returns {Object} { mutate, isPending, isOptimistic, data }
 */
export function useOptimisticMutation(mutationFn, options = {}) {
  const { onSuccess, onError, rollbackOnError = true } = options
  const [isPending, setIsPending] = useState(false)
  const [isOptimistic, setIsOptimistic] = useState(false)
  const [data, setData] = useState(null)
  const [previousData, setPreviousData] = useState(null)

  const mutate = useCallback(
    async (newData, variables = {}) => {
      // Save previous state for rollback
      setPreviousData(data)
      
      // Optimistic update
      setData(newData)
      setIsOptimistic(true)
      setIsPending(true)

      try {
        // Execute the mutation
        const result = await mutationFn(newData, variables)
        
        // Update with real data from server
        setData(result)
        setIsOptimistic(false)
        onSuccess?.(result)
      } catch (error) {
        // Rollback on error
        if (rollbackOnError && previousData !== null) {
          setData(previousData)
        }
        setIsOptimistic(false)
        onError?.(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [data, previousData, mutationFn, onSuccess, onError, rollbackOnError]
  )

  return { mutate, isPending, isOptimistic, data }
}

/**
 * useOptimisticList - Hook para mutaciones optimistas en listas
 * Maneja agregar/actualizar/eliminar items de forma optimista
 */
export function useOptimisticList(initialData = []) {
  const [items, setItems] = useState(initialData)
  const [pendingIds, setPendingIds] = useState(new Set())

  const addOptimistic = useCallback(
    (optimisticItem) => {
      const tempId = `temp_${Date.now()}`
      setItems(prev => [...prev, { ...optimisticItem, id: tempId }])
      setPendingIds(prev => new Set(prev).add(tempId))
      return tempId
    },
    []
  )

  const updateOptimistic = useCallback(
    (id, updates) => {
      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      )
      setPendingIds(prev => new Set(prev).add(id))
    },
    []
  )

  const removeOptimistic = useCallback(
    (id) => {
      setItems(prev => prev.filter(item => item.id !== id))
      setPendingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    },
    []
  )

  const confirmPending = useCallback(
    (id) => {
      setPendingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    },
    []
  )

  const rollback = useCallback(
    (id, originalData) => {
      if (originalData) {
        setItems(prev =>
          prev.map(item =>
            item.id === id ? originalData : item
          )
        )
      } else {
        removeOptimistic(id)
      }
      confirmPending(id)
    },
    [removeOptimistic, confirmPending]
  )

  return {
    items,
    setItems,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmPending,
    rollback,
    isPending: pendingIds.size > 0,
    pendingIds,
  }
}