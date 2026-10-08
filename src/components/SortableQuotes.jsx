import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import QuoteItem from './QuoteItem.jsx'
import { reorderQuotes } from '../lib/storage.js'

function SortableQuote({ quote }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quote.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
      }}
    >
      <QuoteItem
        quote={quote}
        dragHandle={{ attributes, listeners, setActivatorNodeRef }}
      />
    </div>
  )
}

// 같은 책 안에서 순서만 바꾼다 (다른 책으로 옮기기는 지원하지 않음)
export default function SortableQuotes({ bookId, quotes }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = quotes.map((quote) => quote.id)
    const from = ids.indexOf(active.id)
    const to = ids.indexOf(over.id)
    if (from < 0 || to < 0) return
    reorderQuotes(bookId, arrayMove(ids, from, to))
  }

  if (quotes.length === 0) {
    return <p className="empty">저장된 문구가 없습니다.</p>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={quotes.map((quote) => quote.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="quote-list">
          {quotes.map((quote) => (
            <SortableQuote key={quote.id} quote={quote} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
