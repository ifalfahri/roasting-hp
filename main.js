import {HumanMessage} from '@langchain/core/messages';
import {ChatGoogleGenerativeAI} from '@langchain/google-genai';
import MarkdownIt from 'markdown-it';
import './style.css';

const form = document.querySelector('form');
const output = document.querySelector('.output');

form.onsubmit = async ev => {
  ev.preventDefault();
  output.textContent = 'Sedang mikirin roastingan...';

  try {
    const merk = form.elements.namedItem('merk').value;
    const ram = form.elements.namedItem('ram').value;
    const processor = form.elements.namedItem('processor').value;
    const baterai = form.elements.namedItem('baterai').value;
    const kamera = form.elements.namedItem('kamera').value;
    
    const promptText = `Jadilah seorang yang expert dalam spesifikasi hp, dan update mengenai tipe-tipe hp yang menggunakan bahasa gaul. Buat sebuah roasting yang menghina sebuah hp dengan  
      Merk ${merk}, dan spesifikasi
      Processor ${processor}, 
      RAM ${ram}, 
      Baterai ${baterai},
      Kamera ${kamera}, dalam 1 paragraf saja tapi sangat nyelekit dan bikin sakit hati`; // Example prompt
    const contents = [
      new HumanMessage({
        content: promptText, 
      }),
    ];

    // Call the multimodal model, and get a stream of results
    const vision = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash', // or gemini-1.5-pro
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Multi-modal streaming
    const streamRes = await vision.stream(contents);

    // Read from the stream and interpret the output as markdown
    const buffer = [];
    const md = new MarkdownIt();

    for await (const chunk of streamRes) {
      buffer.push(chunk.content);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

