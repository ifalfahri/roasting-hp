import Input from "./Input";
import Button from "./Button";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import MarkdownIt from "markdown-it";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Import harm settings
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import Modal from 'react-modal';

function Form({ setOutput }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setOutput("Sedang mikirin roastingan...");

    const merk = event.target.merk.value;
    const ram = event.target.ram.value;
    const processor = event.target.processor.value;
    const layar = event.target.layar.value;
    const baterai = event.target.baterai.value;
    const kamera = event.target.kamera.value;

    const promptText = `Kamu adalah seorang yang expert dalam spesifikasi hp, dan update mengenai tipe-tipe hp dan menggunakan bahasa gaul. Buat sebuah roasting yang menghina sebuah hp dengan  
       Merk ${merk}, ejek merknya, kemudian spesifikasi
       Processor ${processor}, 
       RAM ${ram},
       Layar ${layar}, 
       Baterai ${baterai},
       Kamera ${kamera}, bahas juga harganya jika memungkinkan, semua dalam 1 paragraf saja tapi sangat nyelekit dan bikin sakit hati`;

    const contents = [
      new HumanMessage({
        content: promptText,
      }),
    ];

    const vision = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Define the safety settings
    const safetySettings = {
      [HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT]:
        HarmBlockThreshold.BLOCK_NONE,
    };

    // Save original generate function
    const originalGenerate = vision._generate;

    // Modify generate to include safety settings
    vision._generate = originalGenerate.bind(vision, {
      safety_settings: safetySettings,
    });

    try {
      let streamRes;
      try {
        vision.modelName = "gemini-1.5-flash";
        streamRes = await vision.stream(contents);
      } catch (error) {
        console.error("Gemini 1.5 Flash error:", error);
        vision.modelName = "gemini-1.0-pro";
        streamRes = await vision.stream(contents);
      }

      const buffer = [];
      const md = new MarkdownIt();

      for await (const chunk of streamRes) {
        console.log("Received chunk:", chunk);
        if (chunk && chunk.content) {
          buffer.push(chunk.content);
          setOutput(md.render(buffer.join("")));
        } else {
          console.warn(
            "Chunk tidak terdefinisi atau tidak memiliki konten:",
            chunk
          );
          console.error("Error in streaming:", error.message);
        }
      }
    } catch (e) {
      console.error("Error:", e);
      if (e.message.includes("429")) {
        setOutput(
          () =>
            "<br>Waduh, AI-nya lagi rame nih! Coba lagi se-menit kemudian yaa. Kalo masih gabisa, coba website satunya."
        );
      } else {
        setOutput(
          (prevOutput) =>
            prevOutput +
            "<br><span class='text-gray-500'><center>(Yah, kayaknya sinyal ke otak AI-nya putus. Kayanya kena azab karena keseringan roasting deh. Coba ulangi lagi yaa.)</center></span>"
        );
      }
    } finally {
      // Restore the original _generate function
      vision._generate = originalGenerate;
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <div className="flex justify-end mb-2">
        <p className="text-gray-500 text-sm ">
          by{" "}
          <a
            className="text-blue-300 hover:text-blue-400"
            href="https://github.com/ifalfahri"
            target="_blank"
            rel="noopener noreferrer"
            data-tooltip-id="github-tooltip"
            data-tooltip-content="Kunjungi GitHub saya"
          >
            ifalfahri
          </a>
        </p>
      </div>
      <h1 className="font-semibold flex justify-center gap-2 text-2xl">
        Roasting HP
      </h1>
      <div className="specs-form">
        <Input label="Merk HP" id="merk" type="text" placeholder="Merk HP" />
        <Input label="Chipset" id="processor" type="text" placeholder="Chipset"/>
        <Input label="RAM" id="ram" type="text" placeholder="RAM" />
        <Input label="Layar" id="layar" type="text" placeholder="Layar" />
        <Input label="Baterai" id="baterai" type="text" placeholder="Baterai" />
        <Input label="Kamera" id="kamera" type="text" placeholder="Kamera" />
      </div>
      <div className="prompt-box flex justify-center my-6 w-full gap-2 items-end">
        <Button type="submit">Roasting</Button>
      </div>
      
    </form>
    <div className="fixed bottom-4 right-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
          onClick={() => setIsModalOpen(true)}
          data-tooltip-id="v2-tooltip"
          data-tooltip-content="Pergi ke versi baru"
        >
          v2
        </button>
      </div>
      <Tooltip id="github-tooltip" />
      <Tooltip id="v2-tooltip" />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        appElement={document.getElementById("root")}
        className="bg-white p-6 rounded-lg shadow-xl w-80 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Pergi ke Versi Baru?</h2>
        <p className="mb-4">Kamu akan dialihkan ke versi baru. Lanjutkan?</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setIsModalOpen(false)}
          >
            Lanjutkan
          </Link>
        </div>
      </Modal>
    </>
  );
}

export default Form;
