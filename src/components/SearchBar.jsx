export default function SearchBar({ value, onChange }) {
  return (
    <label className="field search-bar">
      <span>검색</span>
      <input
        value={value}
        placeholder="문구, 메모, 책 제목, 저자"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
