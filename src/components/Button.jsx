function Button({ children, onClick }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="group relative inline-flex items-center overflow-hidden rounded bg-gradient-to-r from-indigo-400 to-blue-400 px-8 py-3 text-white focus:outline-none focus:ring active:bg-indigo-500"
      href="#"
    >
      <span className="absolute -end-full transition-all group-hover:end-4">
        🔥
      </span>

      <span className="text-sm font-medium transition-all group-hover:me-4">
        {children}
      </span>
    </button>
  );
}

export default Button;
