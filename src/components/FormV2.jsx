import MarkdownIt from "markdown-it";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { Link } from "react-router-dom";
import Select from "react-select";
import { Tooltip } from "react-tooltip";
import { generateRoast } from "../services/phoneRoaster";
import AIModelSelector from "./AIModelSelector";
import Button from "./Button";

export default function FormV2({ setOutput }) {
  const [brands, setBrands] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedModel, setSelectedModel] = useState({
    value: "gemini-2.0-flash-exp",
    label: "Gemini 2.0 Flash",
    provider: "gemini",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "/api";

  const famousBrands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Huawei",
    "Oppo",
    "Vivo",
    "Realme",
    "Sony",
    "OnePlus",
    "Infinix",
    "Tecno",
    "Asus",
    "Google",
    "vivo",
  ];

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        let brandList = await response.json();

        const groupedOptions = [
          {
            label: "Merek Populer",
            options: brandList
              .filter((brand) => famousBrands.includes(brand.name))
              .map((brand) => ({ value: brand.id, label: brand.name })),
          },
          {
            label: "Merek Lainnya",
            options: brandList
              .filter((brand) => !famousBrands.includes(brand.name))
              .map((brand) => ({ value: brand.id, label: brand.name })),
          },
        ];

        setBrands(groupedOptions);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
      setIsLoading(false);
    };
    fetchBrands();
  }, []);

  const handleBrandSelect = async (selectedOption) => {
    setSelectedBrand(selectedOption);
    setSelectedDevice(null);
    setDevices([]);
    setError(null);
    if (selectedOption) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/devices/${selectedOption.value}`
        );
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Lagi rame nih, jadi lupa sama nama-nama hp untuk sementara. Silakan coba lagi setelah beberapa saat. Untuk alternatifnya bisa pake V1 dulu yaa"
            );
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const deviceList = await response.json();
        setDevices(
          deviceList.map((device) => ({ value: device.id, label: device.name }))
        );
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError(error.message);
      }
      setIsLoading(false);
    }
  };

  const handleDeviceSelect = async (selectedOption) => {
    setSelectedDevice(null);
    setError(null);
    if (selectedOption) {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/device/${selectedOption.value}`
        );
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Lagi rame nih websitenya, jadi lupa sama spek-spek hp untuk sementara. Silakan coba lagi setelah beberapa saat. Untuk alternatifnya bisa pake V1 dulu yaa. Bisa tekan tombol di bawah kanan"
            );
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const deviceDetails = await response.json();
        setSelectedDevice(deviceDetails);
      } catch (error) {
        console.error("Error fetching device details:", error);
        setError(error.message);
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOutput("Sedang mikirin roastingan...");

    if (!selectedDevice || !selectedModel) {
      setOutput("Pilih device dan model AI dulu dong!");
      return;
    }

    const specList = selectedDevice.quickSpec
      .map((spec) => `${translateSpecName(spec.name)}: ${spec.value}`)
      .join(", ");

    try {
      const streamRes = await generateRoast(
        selectedModel,
        selectedDevice.name,
        specList
      );

      const buffer = [];
      const md = new MarkdownIt();

      for await (const chunk of streamRes) {
        if (chunk && chunk.content) {
          buffer.push(chunk.content);
          setOutput(md.render(buffer.join("")));
        } else {
          console.warn(
            "Chunk tidak terdefinisi atau tidak memiliki konten:",
            chunk
          );
        }
      }
    } catch (e) {
      console.error("Error:", e);
      if (e.message.includes("429")) {
        setOutput(
          "Waduh, AI-nya lagi rame nih! Coba lagi se-menit kemudian yaa. Kalo masih gabisa, coba model lain."
        );
      } else {
        setOutput(
          (prevOutput) =>
            prevOutput +
            "<br><span class='text-gray-500'><center>(Yah, kayaknya sinyal ke otak AI-nya putus. Kayanya kena azab karena keseringan roasting deh. Coba ulangi lagi yaa.)</center></span>"
        );
      }
    }
  };

  const translateSpecName = (name) => {
    const translations = {
      Display: "Layar",
      "Display size": "Ukuran Layar",
      "Display resolution": "Resolusi Layar",
      Camera: "Kamera",
      "Camera pixels": "Resolusi Kamera",
      "Video pixels": "Resolusi Video",
      RAM: "RAM",
      "RAM size": "Kapasitas RAM",
      Battery: "Baterai",
      "Battery size": "Kapasitas Baterai",
      "Battery type": "Tipe Baterai",
      OS: "Sistem Operasi",
      Chipset: "Prosesor",
      Internal: "Penyimpanan Internal",
      "Main Camera": "Kamera Utama",
      "Selfie camera": "Kamera Selfie",
      Single: "Tunggal",
      Triple: "Triple",
      Features: "Fitur",
      Platform: "Platform",
      Memory: "Memori",
    };
    return translations[name] || name;
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex justify-between items-center mb-8">
          <div className="w-40">
            <AIModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
          <p className="text-gray-500 text-sm">
            by{" "}
            <a
              className="text-blue-300 hover:text-blue-400 transition-colors duration-300"
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
        <h1 className="font-extrabold flex justify-center gap-1 text-2xl mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 text-transparent bg-clip-text active:animate-bounce">
          Roasting HP
          <span className="text-black text-xs hover:text-red-400 transition-colors duration-300">
            V2
          </span>
        </h1>
        <div className="specs-form space-y-4">
          <Select
            options={brands}
            onChange={handleBrandSelect}
            placeholder="Pilih merek"
            isSearchable
            isLoading={isLoading && !selectedBrand}
            formatGroupLabel={(group) => (
              <div
                style={{ fontWeight: "bold", color: "#555", fontSize: "1.1em" }}
              >
                {group.label}
              </div>
            )}
          />
          {selectedBrand && (
            <Select
              options={devices}
              onChange={handleDeviceSelect}
              placeholder="Pilih perangkat"
              isSearchable
              isLoading={isLoading && selectedBrand}
            />
          )}
          {selectedDevice && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold text-lg mb-2">
                {selectedDevice.name}
              </h2>
              <div className="flex items-start">
                <img
                  src={selectedDevice.img}
                  alt={selectedDevice.name}
                  className="w-32 h-32 object-contain mr-4"
                />
                <ul className="text-sm grid grid-cols-2 gap-2">
                  {selectedDevice.quickSpec.map((spec, index) => (
                    <li key={index} className="flex flex-col">
                      <span className="font-medium">
                        {translateSpecName(spec.name)}:
                      </span>
                      <span>{translateSpecName(spec.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center p-2 bg-red-100 rounded">
              {error}
            </div>
          )}
        </div>
        <div className="prompt-box flex justify-center my-6 w-full gap-2 items-end">
          <Button
            type="submit"
            disabled={!selectedDevice || !selectedModel || isLoading}
          >
            {isLoading ? "Memuat..." : "Roasting"}
          </Button>
        </div>
      </form>
      <div className="fixed bottom-4 right-4">
        <button
          type="button"
          className="bg-gradient-to-r from-indigo-400 to-blue-400 hover:bg-blue-500 font-bold hover:font-black text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out hover:scale-110"
          onClick={() => setIsModalOpen(true)}
          data-tooltip-id="v1-tooltip"
          data-tooltip-content="Kembali ke versi lama"
        >
          V1
        </button>
      </div>
      <Tooltip id="v1-tooltip" style={{ transition: "opacity 0.3s" }} />
      <Tooltip id="github-tooltip" style={{ transition: "opacity 0.3s" }} />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-xl w-80 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold mb-4">Kembali ke Versi Lama?</h2>
        <p className="mb-4">
          Anda akan dialihkan ke versi lama dari situs ini. Lanjutkan?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </button>
          <Link
            to="/old"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
            onClick={() => setIsModalOpen(false)}
          >
            Lanjutkan
          </Link>
        </div>
      </Modal>
    </>
  );
}
