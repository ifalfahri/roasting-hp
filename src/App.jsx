import React, { useState } from 'react';
import Form from './components/Form';
import Output from './components/Output';


function App() {
  const [output, setOutput] = useState('(Roastingan akan muncul di sini)'); 

  return (
    <div>
    <main className="bg-white w-full p-6 max-w-lg mx-auto rounded-2xl font-Inter "> 
    
      <Form setOutput={setOutput}/>
      <Output output={output}/>
    </main>
    </div>
  );
}

export default App;
