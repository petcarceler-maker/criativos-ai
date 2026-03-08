"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight, Loader2, Check } from "lucide-react";
import { ChatMessage, ChatStep, BriefingData, GeneratedImage, TextOverlay } from "@/types";
import { chatSteps, formatBriefingSummary, mapStyleLabelsToIds, mapFormatLabelsToIds, parseQuantity } from "@/lib/chat-flow";
import { applyTextOverlay } from "@/lib/canvas-overlay";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    for (const styleId of styleIds) {
      for (const format of formatIds) {
        for (let q = 0; q < quantity; q++) {
          current++;
          setGenerationProgress(`Gerando ${current}/${totalCount}...`);

          try {
            const res = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ styleId, briefing: completeBriefing, format }),
            });

            const data = await res.json();
            if (data.image) {
              // Apply text overlay via canvas
              let finalImage: string;
              try {
                finalImage = await applyTextOverlay(data.image, textOverlay, format);
              } catch {
                finalImage = data.image; // fallback to base image
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

    // Salvar no localStorage
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("criativos-ai-generated") || "[]");
      localStorage.setItem(
        "criativos-ai-generated",
        JSON.stringify([...existing, ...allGenerated])
      );
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
          "É simples! Eu vou te fazer algumas perguntas sobre seu produto, público-alvo e estilo visual. Você escreve a **headline**, **subheadline** e o texto do **botão CTA**. Depois escolhe os estilos de criativo, formatos e quantas variações quer. A IA gera imagens profissionais com seu texto sobreposto. E depois de gerado, você pode editar o texto e a posição! Vamos começar?",
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
          ...briefing,
        };

        setTimeout(async () => {
          const result = await generateCreativesWithAI(completeBriefing);

          setCurrentStep("done");
          setIsDone(true);

          if (result.generated.length > 0) {
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: `Pronto! Foram gerados **${result.generated.length} criativos** com sucesso! No dashboard você pode **editar o texto, posição e baixar** cada criativo.`,
                images: result.generated.slice(0, 4),
              },
            ]);
          } else {
            const errorDetail = result.errors.length > 0
              ? `\n\nErro: ${result.errors[0]}`
              : "";
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: `Houve um problema na geração.${errorDetail}`,
              },
            ]);
          }
          scrollToBottom();
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
        const summary = formatBriefingSummary(
          updatedBriefing as Record<string, string | string[]>
        );
        const styleCount = (updatedBriefing.styles || []).length;
        const formatCount = (updatedBriefing.formats || []).length;
        const qty = updatedBriefing.quantity || 1;
        const totalCreatives = styleCount * formatCount * qty;

        addAssistantMessage(
          `Perfeito! Aqui está o resumo do seu briefing:\n\n${summary}\n\nSerão gerados **${totalCreatives} criativos** (${styleCount} estilos × ${formatCount} formatos × ${qty} variações). Posso gerar?`,
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

    processStep(option);
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const hasOptions = lastMessage?.options;
  const showMultiSelectConfirm = isMultiSelectStep(currentStep) && multiSelected.length > 0;

  return (
    <div className="h-screen flex flex-col bg-surface">
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
                    : msg.options,
                }}
                onOptionClick={handleOptionClick}
              />

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
      {!isDone && !isGenerating && !hasOptions && !isMultiSelectStep(currentStep) && (
        <div className="border-t border-surface-border bg-surface/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 bg-surface-lighter border border-surface-border rounded-xl px-4 py-2 focus-within:border-brand-600/50 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua resposta..."
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
          </div>
        </div>
      )}
    </div>
  );
}
