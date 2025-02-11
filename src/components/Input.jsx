import { useState } from "react";

function Input(props) {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <label
      htmlFor={props.id}
      className="my-4 relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 "
    >
      <input
        type={props.type}
        id={props.id}
        name={props.name}
        value={value}
        onChange={handleChange}
        className="w-full p-3 rounded-lg peer border-none bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
        placeholder={props.placeholder}
      />

      <span className="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
        {props.label}
      </span>
    </label>
  );
}

export default Input;
