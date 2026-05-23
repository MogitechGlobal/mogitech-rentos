// components/AuthorCard.tsx
export default function AuthorCard({ name, title, avatarUrl }: any) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
      <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-xs font-medium text-gray-500">{title} • Market Expert</p>
      </div>
    </div>
  )
}