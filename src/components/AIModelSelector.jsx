import Select from 'react-select';

const modelOptions = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'gemini' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'Deepseek R1', provider: 'groq' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3', provider: 'groq' },
  { value: 'gemma2-9b-it', label: 'Gemma2', provider: 'groq' },
  { value: 'qwen-qwq-32b', label: 'Qwen/QwQ-32B', provider: 'groq' },
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