import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Button from './Button';
import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import MarkdownIt from "markdown-it";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import Modal from 'react-modal';

const API_BASE_URL = 'http://localhost:3001/api'; // Update this if your backend is on a different port

function FormV2({ setOutput }) {
  const [brands, setBrands] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        const brandList = await response.json();
        setBrands(brandList.map(brand => ({ value: brand.id, label: brand.name })));
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
      setIsLoading(false);
    };
    fetchBrands();
  }, []);

  const handleBrandSelect = async (selectedOption) => {
    setSelectedBrand(selectedOption);
    setSelectedDevice(null);
    setDevices([]);
    if (selectedOption) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/devices/${selectedOption.value}`);
        const deviceList = await response.json();
        setDevices(deviceList.map(device => ({ value: device.id, label: device.name })));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
      setIsLoading(false);
    }
  };

  const handleDeviceSelect = async (selectedOption) => {
    setSelectedDevice(null);
    if (selectedOption) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/device/${selectedOption.value}`);
        const deviceDetails = await response.json();
        setSelectedDevice(deviceDetails);
      } catch (error) {
        console.error('Error fetching device details:', error);
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOutput("Sedang mikirin roastingan...");

    if (!selectedDevice) {
      setOutput("Pilih device dulu dong!");
      return;
    }


    const specList = selectedDevice.quickSpec
      .map(spec => `${translateSpecName(spec.name)}: ${spec.value}`)
      .join(', ');

    const promptText = `Kamu adalah seorang yang expert dalam spesifikasi hp, dan update mengenai tipe-tipe hp dan menggunakan bahasa gaul. Buat sebuah roasting yang menghina sebuah hp dengan  
       Merk ${selectedDevice.name}, ejek merknya, kemudian spesifikasinya
       ${specList}
       Bahas juga harganya jika memungkinkan, semua dalam 1 paragraf saja tapi sangat nyelekit dan bikin sakit hati`;

    const contents = [
      new HumanMessage({
        content: promptText,
      }),
    ];

    const vision = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const safetySettings = {
      [HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT]:
        HarmBlockThreshold.BLOCK_NONE,
    };

    const originalGenerate = vision._generate;
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
        if (chunk && chunk.content) {
          buffer.push(chunk.content);
          setOutput(md.render(buffer.join("")));
        } else {
          console.warn("Chunk tidak terdefinisi atau tidak memiliki konten:", chunk);
        }
      }
    } catch (e) {
      console.error("Error:", e);
      if (e.message.includes("429")) {
        setOutput("Waduh, AI-nya lagi rame nih! Coba lagi se-menit kemudian yaa. Kalo masih gabisa, coba website satunya.");
      } else {
        setOutput(prevOutput => prevOutput + "<br><span class='text-gray-500'><center>(Yah, kayaknya sinyal ke otak AI-nya putus. Kayanya kena azab karena keseringan roasting deh. Coba ulangi lagi yaa.)</center></span>");
      }
    } finally {
      vision._generate = originalGenerate;
    }
  };

  const translateSpecName = (name) => {
    const translations = {
      'Display': 'Layar',
      'Display size': 'Ukuran Layar',
      'Display resolution': 'Resolusi Layar',
      'Camera': 'Kamera',
      'Camera pixels': 'Resolusi Kamera',
      'Video pixels': 'Resolusi Video',
      'RAM': 'RAM',
      'RAM size': 'Kapasitas RAM',
      'Battery': 'Baterai',
      'Battery size': 'Kapasitas Baterai',
      'Battery type': 'Tipe Baterai',
      'OS': 'Sistem Operasi',
      'Chipset': 'Prosesor',
      'Internal': 'Penyimpanan Internal',
      'Main Camera': 'Kamera Utama',
      'Selfie camera': 'Kamera Selfie',
      'Single': 'Tunggal',
      'Triple': 'Triple',
      'Features': 'Fitur',
      'Platform': 'Platform',
      'Memory': 'Memori',
    };
    return translations[name] || name;
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #cbd5e0',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    }),
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
      <h1 className="font-semibold flex justify-center gap-2 text-2xl mb-4">
        Roasting HP v2
      </h1>
      <div className="specs-form space-y-4">
        <Select
          options={brands}
          onChange={handleBrandSelect}
          placeholder="Pilih merek"
          isSearchable
          styles={customStyles}
          isLoading={isLoading && !selectedBrand}
        />
        {selectedBrand && (
          <Select
            options={devices}
            onChange={handleDeviceSelect}
            placeholder="Pilih perangkat"
            isSearchable
            styles={customStyles}
            isLoading={isLoading && selectedBrand}
          />
        )}
        {selectedDevice && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold text-lg mb-2">{selectedDevice.name}</h2>
            <div className="flex items-start">
              <img src={selectedDevice.img} alt={selectedDevice.name} className="w-32 h-32 object-contain mr-4" />
              <ul className="text-sm grid grid-cols-2 gap-2">
                {selectedDevice.quickSpec.map((spec, index) => (
                  <li key={index} className="flex flex-col">
                    <span className="font-medium">{translateSpecName(spec.name)}:</span>
                    <span>{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="prompt-box flex justify-center my-6 w-full gap-2 items-end">
        <Button type="submit" disabled={!selectedDevice || isLoading}>
          {isLoading ? 'Memuat...' : 'Roasting'}
        </Button>
      </div>
      
    </form>
    <div className="fixed bottom-4 right-4">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-500"
          onClick={() => setIsModalOpen(true)}
          data-tooltip-id="v1-tooltip"
          data-tooltip-content="Kembali ke versi lama"
        >
          v1
        </button>
      </div>
      <Tooltip id="v1-tooltip" />
      <Tooltip id="github-tooltip" />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        appElement={document.getElementById("root")}
        className="bg-white p-6 rounded-lg shadow-xl w-80 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Kembali ke Versi Lama?</h2>
        <p className="mb-4">Kamu akan dialihkan ke versi lama. Lanjutkan?</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>
          <Link
            to="/old"
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

export default FormV2;