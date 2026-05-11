'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Check, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  item: string
  quantity: string
  category: string
}

interface ShoppingListSidebarProps {
  items: ShoppingItem[]
  planId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: '🥦 Produce',
  protein: '🥩 Protein',
  dairy: '🥛 Dairy & Eggs',
  pantry: '🧴 Pantry',
  spices: '🌿 Spices & Herbs',
}

const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'pantry', 'spices']

export function ShoppingListSidebar({ items, planId }: ShoppingListSidebarProps) {
  const storageKey = `meal-plan-shopping-${planId}`

  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set()
    } catch {
      return new Set()
    }
  })

  // Persist checked state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...checked]))
    } catch {
      // Storage may be unavailable in some environments
    }
  }, [checked, storageKey])

  function toggleItem(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function clearAll() {
    setChecked(new Set())
  }

  // Group items by category
  const grouped = new Map<string, ShoppingItem[]>()
  for (const item of items) {
    const cat = item.category ?? 'pantry'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  const sortedCategories = CATEGORY_ORDER.filter((c) => grouped.has(c))
  const checkedCount = checked.size
  const totalCount = items.length

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-teal-600" />
          <span className="font-semibold text-sm">Shopping List</span>
          {checkedCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {checkedCount}/{totalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {checkedCount > 0 && (
            <button
              onClick={clearAll}
              className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.print()}
            className="h-9 px-2 text-xs print:hidden"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-3 space-y-5">
          {sortedCategories.map((category) => {
            const categoryItems = grouped.get(category) ?? []
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <ul className="space-y-1">
                  {categoryItems.map((item, idx) => {
                    const key = `${category}-${item.item}-${idx}`
                    const isChecked = checked.has(key)
                    return (
                      <li key={key}>
                        <button
                          onClick={() => toggleItem(key)}
                          className={cn(
                            'flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left text-sm transition-colors',
                            'hover:bg-accent',
                            isChecked && 'opacity-50',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              isChecked
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-muted-foreground/30',
                            )}
                          >
                            {isChecked && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span className={cn(isChecked && 'line-through')}>
                            <span className="font-medium">{item.item}</span>
                            {item.quantity && (
                              <span className="text-muted-foreground ml-1">— {item.quantity}</span>
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <Separator className="mt-3" />
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Progress footer */}
      {totalCount > 0 && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{Math.round((checkedCount / totalCount) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
