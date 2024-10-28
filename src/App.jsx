import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Form from './components/Form';
import FormV2 from './components/FormV2';
import Output from './components/Output';


function App() {
  const [output, setOutput] = useState('(Roastingan akan muncul di sini)');

  return (
    <Router>
      <div>
        

        <main className="bg-white w-full p-6 max-w-lg mx-auto rounded-2xl font-Inter">
          <Routes>
            <Route path="/" element={<FormV2 setOutput={setOutput} />} />
            <Route path="/old" element={<Form setOutput={setOutput} />} />
          </Routes>
          <Output output={output} />
        </main>
      </div>
    </Router>
  );
}

export default App;