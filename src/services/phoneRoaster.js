import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const generateSystemPrompt = () => {
  return `Kamu adalah seorang ahli teknologi yang sangat sarkastis dan kritis. Kamu memiliki pengetahuan mendalam tentang spesifikasi smartphone terbaru dan tren pasar smartphone. Kamu dikenal karena kemampuanmu dalam memberikan kritik pedas namun lucu tentang perangkat mobile. Gunakan bahasa indonesia gaul dan informal dalam responmu, seolah-olah kamu sedang berbicara dengan teman dekat.`;
};

const generateUserPrompt = (deviceName, specList) => {
  return `Buat roastingan yang menghina sebuah smartphone dengan
   Merk: ${deviceName}
   Spesifikasi: ${specList}
   Buat roasting dalam 1 paragraf singkat yang sangat nyelekit dan bikin sakit hati, termasuk mengejek mereknya. Jika kamu tau harganya, sertakan juga dalam roastingan.`;
};

export const generateRoast = async (selectedModel, deviceName, specList) => {
  const systemPrompt = generateSystemPrompt();
  const userPrompt = generateUserPrompt(deviceName, specList);

  const contents = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ];

  let model;
  if (selectedModel.provider === 'gemini') {
    model = new ChatGoogleGenerativeAI({
      modelName: selectedModel.value,
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    });
  } else if (selectedModel.provider === 'groq') {
    model = new ChatGroq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      model: selectedModel.value,
    });
  }

  try {
    let streamRes;
    if (selectedModel.provider === 'gemini') {
      const safetySettings = {
        [HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT]:
          HarmBlockThreshold.BLOCK_NONE,
      };
      const originalGenerate = model._generate;
      model._generate = originalGenerate.bind(model, {
        safety_settings: safetySettings,
      });
    }

    streamRes = await model.stream(contents);
    return streamRes;

  } catch (error) {
    console.error("Error in AI service:", error);
    throw error;
  }
};