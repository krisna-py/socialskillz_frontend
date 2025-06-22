export function Card({ children }) {
  return <div className="bg-white/10 p-4 rounded-xl shadow-lg">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
