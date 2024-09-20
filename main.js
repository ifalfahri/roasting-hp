import {HumanMessage} from '@langchain/core/messages';
import {ChatGoogleGenerativeAI} from '@langchain/google-genai';
import MarkdownIt from 'markdown-it';
import './style.css';

const form = document.querySelector('form');
const output = document.querySelector('.output');

async function callGemini(contents, modelName) {
  const vision = new ChatGoogleGenerativeAI({
    modelName: modelName, 
    apiKey: process.env.GOOGLE_API_KEY,
  });
  return await vision.call(contents);
}

form.onsubmit = async ev => {
  ev.preventDefault();
  output.textContent = 'Sedang mikirin roastingan...';

  try {
    const merk = form.elements.namedItem('merk').value;
    const ram = form.elements.namedItem('ram').value;
    const processor = form.elements.namedItem('processor').value;
    const baterai = form.elements.namedItem('baterai').value;
    const kamera = form.elements.namedItem('kamera').value;
    
    const promptText = `Jadilah seorang yang expert dalam spesifikasi hp, dan update mengenai tipe-tipe hp, dan gunakan bahasa gaul. Buat sebuah roasting untuk sebuah hp dengan  
      Merk ${merk}, dan spesifikasi
      Processor ${processor}, 
      RAM ${ram}, 
      Baterai ${baterai},
      Kamera ${kamera}, dalam 1 paragraf yang sangat nyelekit dan bikin sakit hati`; // Example prompt
    const contents = [
      new HumanMessage({
        content: promptText, 
      }),
    ];

    try {
      // First attempt with gemini-1.5-flash
      const response = await callGemini(contents, 'gemini-1.5-flash');
      output.textContent = response.text; // Process the response from gemini-1.5-flash
    } catch (error) {
      if (error.code === 429) {
        console.warn('Gemini 1.5 Flash rate limit exceeded. Using Gemini 1.0 Pro.');
        try {
          // Fallback to gemini-1.0-pro
          const response = await callGemini(contents, 'gemini-1.0-pro');
          output.textContent = response.text; // Process the response from gemini-1.0-pro
        } catch (err) {
          console.error('An error occurred with Gemini 1.0 Pro:', err);
          output.textContent = 'Error: ' + err.message;
        }
      } else {
        // Handle other errors
        console.error('An unexpected error occurred:', error);
        output.textContent = 'Error: ' + error.message;
      }
    }
  

    // Multi-modal streaming
    const streamRes = await vision.stream(contents);

    // Read from the stream and interpret the output as markdown
    const buffer = [];
    const md = new MarkdownIt();

    for await (const chunk of streamRes) {
      if (chunk && chunk.content) {
        buffer.push(chunk.content);
        output.innerHTML = md.render(buffer.join(''));
      } else {
        console.error('Chunk atau content tidak ada');
      }
    }
  } catch (e) {
    output.innerHTML += '<hr>';
  }
};

