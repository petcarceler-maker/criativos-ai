"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight, Loader2, Check, Upload, Image as ImageIcon, X } from "lucide-react";
import { ChatMessage, ChatStep, BriefingData, GeneratedImage, TextOverlay } from "@/types";
import { chatSteps, formatBriefingSummary, mapStyleLabelsToIds, mapFormatLabelsToIds, parseQuantity, isUploadStep } from "@/lib/chat-flow";
import { applyTextOverlay } from "@/lib/canvas-overlay";
import { saveCreatives } from "@/lib/image-store";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";
import PromptExtractor from "@/components/PromptExtractor";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState<Partial<BriefingData>>({});
  const [isDone, setIsDone] = useState(false);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const addAssistantMessage = useCallback(
    (content: string, options?: string[], images?: GeneratedImage[]) => {
      setIsTyping(true);
      scrollToBottom();

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content,
            options,
            images,
          },
        ]);
        scrollToBottom();
      }, 600 + Math.random() * 400);
    },
    []
  );

  useEffect(() => {
    const step = chatSteps[currentStep];
    if (currentStep === "welcome") {
      addAssistantMessage(step.message, step.options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMultiSelectStep = (step: ChatStep) => {
    return chatSteps[step]?.multiSelect === true;
  };

  const handleMultiSelectToggle = (option: string) => {
    setMultiSelected((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleMultiSelectConfirm = () => {
    if (multiSelected.length === 0) return;
    const answer = multiSelected.join(", ");
    setMultiSelected([]);
    processStep(answer);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: string[] = [];
    for (let i = 0; i < Math.min(files.length, 10); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      try {
        const base64 = await fileToBase64(file);
        newFiles.push(base64);
      } catch {
        console.error("Erro ao ler arquivo:", file.name);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    scrollToBottom();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadConfirm = () => {
    if (uploadedFiles.length === 0) return;

    const step = chatSteps[currentStep];
    const field = step.field;

    // Save uploaded images to briefing
    setBriefing((prev) => ({
      ...prev,
      [field!]: uploadedFiles,
    }));

    // Add user message with image previews
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: "user",
        content: `${uploadedFiles.length} imagem(ns) enviada(s)`,
        uploadedImages: uploadedFiles.slice(0, 4),
      },
    ]);

    setUploadedFiles([]);

    // Advance to next step
    const nextStep = step.nextStep;
    setCurrentStep(nextStep);
    const nextStepConfig = chatSteps[nextStep];
    addAssistantMessage(nextStepConfig.message, nextStepConfig.options);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generateCreativesWithAI = async (completeBriefing: BriefingData) => {
    setIsGenerating(true);

    const styleIds = mapStyleLabelsToIds(completeBriefing.styles);
    const formatIds = mapFormatLabelsToIds(completeBriefing.formats);
    const quantity = completeBriefing.quantity || 1;

    const textOverlay: TextOverlay = {
      headline: completeBriefing.headline,
      subheadline: completeBriefing.subheadline,
      cta: completeBriefing.cta,
      textPosition: completeBriefing.textPosition || "bottom",
    };

    const allGenerated: GeneratedImage[] = [];
    const errors: string[] = [];
    const totalCount = styleIds.length * formatIds.length * quantity;
    let current = 0;

    // Check if using reference bank
    const useReferenceBank = (completeBriefing.referenceImages || []).length === 0;

    for (const styleId of styleIds) {
      for (const format of formatIds) {
        for (let q = 0; q < quantity; q++) {
          current++;
          setGenerationProgress(`Gerando ${current}/${totalCount}...`);

          try {
            const res = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                styleId,
                briefing: completeBriefing,
                format,
                referenceImages: completeBriefing.referenceImages || [],
                productPhotos: completeBriefing.productPhotos || [],
                useReferenceBank,
              }),
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
              errors.push(errData.error || `Erro HTTP ${res.status}`);
              console.error(`Erro ${styleId}/${format}:`, errData.error);
              continue;
            }

            const data = await res.json();
            if (data.image) {
              // Apply text overlay via canvas
              let finalImage: string;
              try {
                finalImage = await applyTextOverlay(data.image, textOverlay, format);
              } catch {
                finalImage = data.image;
              }

              allGenerated.push({
                id: `gen-${Date.now()}-${styleId}-${format}-${q}`,
                styleId,
                styleLabel: data.style,
                format,
                baseImage: data.image,
                image: finalImage,
                prompt: data.prompt,
                textOverlay,
              });
            } else if (data.error) {
              errors.push(data.error);
              console.error(`Erro ${styleId}/${format}:`, data.error);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Erro de conexão";
            errors.push(msg);
            console.error(`Erro ${styleId}/${format}:`, err);
          }
        }
      }
    }

    setIsGenerating(false);
    setGenerationProgress("");

    // Salvar no IndexedDB
    if (allGenerated.length > 0) {
      try {
        await saveCreatives(allGenerated);
      } catch (e) {
        console.error("Erro ao salvar criativos:", e);
      }
    }

    return { generated: allGenerated, errors };
  };

  const processStep = useCallback(
    (userAnswer: string) => {
      const step = chatSteps[currentStep];

      // Save to briefing
      if (step.field) {
        setBriefing((prev) => {
          const updated = { ...prev };
          if (step.field === "colors") {
            updated.colors = [userAnswer];
          } else if (step.field === "styles" || step.field === "formats") {
            (updated as Record<string, string[]>)[step.field!] = userAnswer.split(", ");
          } else if (step.field === "textPosition") {
            updated.textPosition = userAnswer === "Parte Superior" ? "top" : "bottom";
          } else if (step.field === "quantity") {
            updated.quantity = parseQuantity(userAnswer);
          } else if (step.field === "referenceImages" || step.field === "productPhotos") {
            // Skip - handled by upload flow or set empty on "Pular"
            if (userAnswer === "Pular") {
              (updated as Record<string, string[]>)[step.field!] = [];
            } else if (userAnswer === "Usar banco de referências") {
              // Flag: don't set referenceImages, API will use reference bank
              (updated as Record<string, string[]>)[step.field!] = [];
            }
          } else {
            (updated as Record<string, string>)[step.field!] = userAnswer;
          }
          return updated;
        });
      }

      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, role: "user", content: userAnswer },
      ]);

      // Handle special cases
      if (currentStep === "welcome" && userAnswer === "Como funciona?") {
        addAssistantMessage(
          "É simples! Eu vou te fazer algumas perguntas sobre seu produto, público-alvo e estilo visual. Você escreve a **headline**, **subheadline** e o texto do **botão CTA**. Pode enviar **fotos de referência** e **fotos do produto** para a IA usar. Também pode escrever um **prompt personalizado** para guiar a geração. A IA gera imagens profissionais mantendo fidelidade ao rosto/produto. Vamos começar?",
          ["Vamos lá!"]
        );
        return;
      }

      if (currentStep === "confirm" && userAnswer === "Quero alterar algo") {
        setCurrentStep("productName");
        setBriefing({});
        addAssistantMessage(
          "Ok, vamos recomeçar! Qual é o nome do seu produto ou serviço?"
        );
        return;
      }

      if (currentStep === "confirm" && userAnswer === "Gerar Criativos!") {
        setCurrentStep("generating");
        addAssistantMessage(
          "Gerando seus criativos com IA... Cada imagem é criada individualmente com seu texto sobreposto."
        );

        const completeBriefing: BriefingData = {
          productName: "",
          productType: "",
          targetAudience: "",
          headline: "",
          subheadline: "",
          tone: "",
          colors: [],
          cta: "",
          textPosition: "bottom",
          quantity: 1,
          additionalInfo: "",
          styles: [],
          formats: [],
          customPrompt: "",
          referenceImages: [],
          productPhotos: [],
          ...briefing,
        };

        setTimeout(async () => {
          try {
            const result = await generateCreativesWithAI(completeBriefing);

            if (result.generated.length > 0) {
              const errorNote = result.errors.length > 0
                ? `\n\n⚠ ${result.errors.length} imagem(ns) falharam: ${result.errors[0]}`
                : "";
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: `Pronto! Foram gerados **${result.generated.length} criativos** com sucesso! No dashboard você pode **editar o texto, posição e baixar** cada criativo.${errorNote}`,
                  images: result.generated.slice(0, 4),
                },
              ]);
            } else {
              const errorDetail = result.errors.length > 0
                ? `\n\n**Erro:** ${result.errors[0]}`
                : "\n\nVerifique se a GEMINI_API_KEY está configurada corretamente.";
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: `Houve um problema na geração dos criativos.${errorDetail}`,
                },
              ]);
            }
          } catch (err) {
            console.error("Erro fatal na geração:", err);
            const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: `Erro na geração dos criativos: **${errorMsg}**\n\nVerifique se a GEMINI_API_KEY está configurada corretamente nas variáveis de ambiente da Vercel.`,
              },
            ]);
            setIsGenerating(false);
            setGenerationProgress("");
          } finally {
            setCurrentStep("done");
            setIsDone(true);
            scrollToBottom();
          }
        }, 1500);
        return;
      }

      const nextStep = step.nextStep;
      setCurrentStep(nextStep);

      if (nextStep === "confirm") {
        const updatedBriefing = { ...briefing };
        if (step.field) {
          if (step.field === "colors") {
            updatedBriefing.colors = [userAnswer];
          } else if (step.field === "styles" || step.field === "formats") {
            (updatedBriefing as Record<string, string[]>)[step.field] = userAnswer.split(", ");
          } else if (step.field === "textPosition") {
            updatedBriefing.textPosition = userAnswer === "Parte Superior" ? "top" : "bottom";
          } else if (step.field === "quantity") {
            updatedBriefing.quantity = parseQuantity(userAnswer);
          } else {
            (updatedBriefing as Record<string, string>)[step.field] = userAnswer;
          }
        }

        const refCount = (updatedBriefing.referenceImages || []).length;
        const photoCount = (updatedBriefing.productPhotos || []).length;
        const hasCustomPrompt = updatedBriefing.customPrompt && updatedBriefing.customPrompt !== "Pular";

        const summary = formatBriefingSummary(
          updatedBriefing as Record<string, string | string[] | number>
        );
        const styleCount = (updatedBriefing.styles || []).length;
        const formatCount = (updatedBriefing.formats || []).length;
        const qty = updatedBriefing.quantity || 1;
        const totalCreatives = styleCount * formatCount * qty;

        let extras = "";
        if (refCount > 0) extras += `\n• **Imagens de Referência:** ${refCount} enviada(s)`;
        if (photoCount > 0) extras += `\n• **Fotos do Produto:** ${photoCount} enviada(s)`;
        if (hasCustomPrompt) extras += `\n• **Prompt Personalizado:** sim`;

        addAssistantMessage(
          `Perfeito! Aqui está o resumo do seu briefing:\n\n${summary}${extras}\n\nSerão gerados **${totalCreatives} criativos** (${styleCount} estilos × ${formatCount} formatos × ${qty} variações). Posso gerar?`,
          chatSteps[nextStep].options
        );
      } else {
        const nextStepConfig = chatSteps[nextStep];
        addAssistantMessage(nextStepConfig.message, nextStepConfig.options);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, briefing, addAssistantMessage]
  );

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping || isGenerating) return;
    setInput("");
    processStep(text);
  };

  const handleOptionClick = (option: string) => {
    if (isTyping || isGenerating) return;

    if (isMultiSelectStep(currentStep)) {
      handleMultiSelectToggle(option);
      return;
    }

    // For upload steps, clicking an option (Pular/Usar banco) advances
    if (isUploadStep(currentStep)) {
      setUploadedFiles([]);
    }

    processStep(option);
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const hasOptions = lastMessage?.options;
  const showMultiSelectConfirm = isMultiSelectStep(currentStep) && multiSelected.length > 0;
  const isCurrentUploadStep = isUploadStep(currentStep);
  const isTextWithSkipStep = currentStep === "customPrompt";
  const showTextInput = !isDone && !isGenerating && (!hasOptions || isTextWithSkipStep) && !isMultiSelectStep(currentStep) && !isCurrentUploadStep;

  return (
    <div className="h-screen flex flex-col bg-surface">
      <PromptExtractor />
      {/* Header */}
      <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-text-primary">CriativosAI</span>
          </Link>
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                <span className="text-xs text-brand-400">{generationProgress || "Gerando..."}</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-xs text-text-secondary">Chat ativo</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll py-6">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <ChatBubble
                message={{
                  ...msg,
                  options: isMultiSelectStep(currentStep) && msg === lastMessage
                    ? undefined
                    : isCurrentUploadStep && msg === lastMessage
                    ? undefined
                    : isTextWithSkipStep && msg === lastMessage
                    ? undefined
                    : msg.options,
                }}
                onOptionClick={handleOptionClick}
              />

              {/* Uploaded image previews in user messages */}
              {msg.uploadedImages && msg.uploadedImages.length > 0 && (
                <div className="flex justify-end mt-2">
                  <div className="flex gap-2 flex-wrap max-w-[80%] justify-end">
                    {msg.uploadedImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Upload ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-surface-border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-select pills */}
              {isMultiSelectStep(currentStep) && msg === lastMessage && msg.options && (
                <div className="ml-11 mt-3">
                  <p className="text-xs text-text-muted mb-2">Selecione um ou mais:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((option) => {
                      const isSelected = multiSelected.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleMultiSelectToggle(option)}
                          className={`text-xs px-3.5 py-2 rounded-full border transition font-medium flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-brand-600 border-brand-600 text-white"
                              : "bg-surface-lighter border-surface-border text-text-primary hover:border-brand-600/50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {showMultiSelectConfirm && (
                    <button
                      onClick={handleMultiSelectConfirm}
                      className="mt-3 text-sm bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-lg transition"
                    >
                      Confirmar ({multiSelected.length} selecionados)
                    </button>
                  )}
                </div>
              )}

              {/* Upload area for upload steps */}
              {isCurrentUploadStep && msg === lastMessage && (
                <div className="ml-11 mt-3">
                  {/* Upload previews */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={file}
                            alt={`Upload ${i + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-surface-border"
                          />
                          <button
                            onClick={() => removeUploadedFile(i)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {/* Upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-4 py-2.5 rounded-full border border-dashed border-brand-500/50 text-brand-400 hover:bg-brand-600/10 transition font-medium flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Enviar Imagens
                    </button>

                    {/* Option buttons */}
                    {lastMessage?.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="text-xs px-3.5 py-2.5 rounded-full border border-surface-border text-text-primary hover:border-brand-600/50 transition font-medium flex items-center gap-1.5"
                      >
                        {option === "Usar banco de referências" && <ImageIcon className="w-3.5 h-3.5" />}
                        {option}
                      </button>
                    ))}

                    {/* Confirm uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <button
                        onClick={handleUploadConfirm}
                        className="text-xs px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white transition font-semibold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar ({uploadedFiles.length})
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Image previews */}
              {msg.images && msg.images.length > 0 && (
                <div className="ml-11 mt-3 grid grid-cols-2 gap-2">
                  {msg.images.map((img) => (
                    <div key={img.id} className="rounded-lg overflow-hidden border border-surface-border">
                      <img src={img.image} alt={`${img.styleLabel} - ${img.format}`} className="w-full" />
                      <div className="px-2 py-1.5 bg-surface-lighter">
                        <p className="text-xs text-text-secondary truncate">
                          {img.styleLabel} &bull; {img.format}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && <TypingIndicator />}

          {isGenerating && (
            <div className="flex items-center gap-3 ml-11 animate-fade-in-up">
              <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
              <span className="text-sm text-text-secondary">{generationProgress}</span>
            </div>
          )}

          {isDone && (
            <div className="animate-fade-in-up flex justify-center pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition pulse-glow"
              >
                Ver Todos os Criativos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {showTextInput && (
        <div className="border-t border-surface-border bg-surface/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 bg-surface-lighter border border-surface-border rounded-xl px-4 py-2 focus-within:border-brand-600/50 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isTextWithSkipStep ? "Descreva o que quer ver no criativo..." : "Digite sua resposta..."}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            {isTextWithSkipStep && (
              <button
                onClick={() => handleOptionClick("Pular")}
                className="text-xs text-text-muted hover:text-text-secondary transition"
              >
                Pular — usar prompt automático
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
