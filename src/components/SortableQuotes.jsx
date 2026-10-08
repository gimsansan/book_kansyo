import {
  DndContext,
  MouseSensor,
  TouchSensor,
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
  // 마우스와 손가락을 따로 둔다.
  // 마우스는 6px만 움직이면 바로 시작하고,
  // 손가락은 0.2초 눌러야 시작한다. 그 사이에 8px 넘게 움직이면
  // 드래그를 포기하고 페이지 스크롤로 넘긴다.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
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
