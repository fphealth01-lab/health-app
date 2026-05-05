import { SupplementRow, type SupplementRowItem } from './supplement-row'

interface TodayStackProps {
  items: SupplementRowItem[]
  showReasoning?: boolean
}

/**
 * Server component wrapper — renders the list of supplement rows.
 * Each SupplementRow is a client component with its own optimistic state.
 */
export function TodayStack({ items, showReasoning = false }: TodayStackProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        No supplements in your protocol yet.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.protocolItemId}>
          <SupplementRow item={item} showReasoning={showReasoning} />
        </li>
      ))}
    </ul>
  )
}
