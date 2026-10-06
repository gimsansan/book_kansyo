import {
  DndContext,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
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
import { moveQuoteToBook, reorderQuotes } from '../lib/storage.js'

function collisionDetection(args) {
  const hits = pointerWithin(args)
  if (hits.length > 0) return hits
  return closestCenter(args)
}

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

function BookDrop({ book }) {
  const { setNodeRef, isOver } = useDroppable({ id: `book:${book.id}` })
  return (
    <div
      ref={setNodeRef}
      role="group"
      className={isOver ? 'move-target over' : 'move-target'}
      aria-label={`${book.title}로 옮기기`}
    >
      <strong>{book.title}</strong>
      <span>{book.author || '저자 없음'}</span>
    </div>
  )
}

export default function SortableQuotes({ bookId, quotes, otherBooks }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function onDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const overId = String(over.id)
    if (overId.startsWith('book:')) {
      moveQuoteToBook(String(active.id), overId.slice(5))
      return
    }
    if (active.id === over.id) return
    const ids = quotes.map((quote) => quote.id)
    const from = ids.indexOf(active.id)
    const to = ids.indexOf(over.id)
    if (from < 0 || to < 0) return
    reorderQuotes(bookId, arrayMove(ids, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={onDragEnd}
    >
      {quotes.length === 0 ? (
        <p className="empty">저장된 문구가 없습니다.</p>
      ) : (
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
      )}

      {otherBooks.length > 0 && quotes.length > 0 && (
        <section className="move-tray">
          <h2>다른 책으로 묶기</h2>
          <p className="hint">문구의 손잡이를 끌어 아래 책에 놓으세요.</p>
          <div className="move-list">
            {otherBooks.map((book) => (
              <BookDrop key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </DndContext>
  )
}
