import { HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
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
      Kamera ${kamera}, dalam 1 paragraf saja tapi sangat nyelekit dan bikin sakit hati`;
      
    const contents = [
      new HumanMessage({
        content: promptText, 
      }),
    ];

    const vision = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    let streamRes;
    try {
      // Coba menggunakan model gemini-1.0
      vision.modelName = 'gemini-1.0-pro';
      streamRes = await vision.stream(contents);
    } catch (error) {
      console.error('Gemini 1.5 Flash error:', error);
      // Jika ada error, coba model gemini-1.5
      vision.modelName = 'gemini-1.5-flash';
      streamRes = await vision.stream(contents);
    }

    // Baca dari stream dan interpretasikan output sebagai markdown
    const buffer = [];
    const md = new MarkdownIt();

    for await (const chunk of streamRes) {
      // Periksa apakah chunk terdefinisi dan memiliki konten
      if (chunk && chunk.content) {
        buffer.push(chunk.content);
        output.innerHTML = md.render(buffer.join(''));
      } else {
        console.warn('Chunk tidak terdefinisi atau tidak memiliki konten:', chunk);
      }
    }
  } catch (e) {
    output.innerHTML += '<hr>';
  }
};
