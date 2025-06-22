export function Button({ children, ...props }) {
  return (
    <button className="bg-yellow-300 px-4 py-2 rounded-full text-black font-bold hover:bg-yellow-400" {...props}>
      {children}
    </button>
  );
}
