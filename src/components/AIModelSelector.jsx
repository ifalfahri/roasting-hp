import Select from 'react-select';

const modelOptions = [
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'gemini' },
  { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro', provider: 'gemini' },
  { value: 'llama-3.2-3b-preview', label: 'Llama 3.2 3B Preview', provider: 'groq' },
  { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B Versatile', provider: 'groq' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', provider: 'groq' },
];

const AIModelSelector = ({ selectedModel, setSelectedModel }) => {
  return (
    <div className="w-40">
      <Select
        className='text-xs'
        options={modelOptions}
        value={selectedModel}
        onChange={setSelectedModel}
        placeholder="Pilih model AI"
        isSearchable
      />
    </div>
  );
};

export default AIModelSelector;