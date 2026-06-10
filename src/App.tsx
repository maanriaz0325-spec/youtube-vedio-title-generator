import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Search, 
  Users, 
  Award, 
  AlertCircle, 
  Check, 
  Copy, 
  Plus, 
  X, 
  Bookmark, 
  BookmarkCheck,
  List, 
  ArrowRight, 
  RotateCcw, 
  Trash2, 
  Info, 
  HelpCircle,
  Play,
  Monitor,
  Phone,
  Settings,
  Eye,
  Sliders,
  Flame,
  FileCheck,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TitleItem, TitleGenerationResponse, TitleConfig } from "./types";
import { 
  CONTENT_FORMATS, 
  TARGET_AUDIENCES, 
  CONTENT_TONES, 
  CHANNEL_MATURITIES, 
  LOADING_STAGES 
} from "./data/presets";

export default function App() {
  // Input form state
  const [videoIdea, setVideoIdea] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [majorCategory, setMajorCategory] = useState("Auto Detect via AI");
  const [customNiche, setCustomNiche] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(CONTENT_FORMATS[0]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>(["Beginners"]);
  const [selectedTone, setSelectedTone] = useState("Conversational");
  const [selectedMaturity, setSelectedMaturity] = useState("New channel");



  // UI state
  const [activeTab, setActiveTab] = useState<"results" | "sandbox" | "niche_library">("results");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Generation response state
  const [generationResults, setGenerationResults] = useState<TitleGenerationResponse | null>(null);
  
  // Clipboard copied visual trigger
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Favorites/Saved state
  const [savedTitles, setSavedTitles] = useState<string[]>(() => {
    const saved = localStorage.getItem("ytgen_saved_titles");
    return saved ? JSON.parse(saved) : [];
  });

  // Sandbox Sandbox Title Playpen State
  const [sandboxTitle, setSandboxTitle] = useState("");
  const [sandboxChannel, setSandboxChannel] = useState("My Creator Hub");
  const [sandboxViews, setSandboxViews] = useState("124K views");
  const [sandboxTime, setSandboxTime] = useState("2 days ago");

  // Dynamic Loader staging loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStageIndex(0);
      interval = setInterval(() => {
        setLoadingStageIndex((prev) => {
          if (prev < LOADING_STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Sync favorites back to localStorage
  useEffect(() => {
    localStorage.setItem("ytgen_saved_titles", JSON.stringify(savedTitles));
  }, [savedTitles]);

  // Handles adding/removing primary keywords tags
  const addKeyword = () => {
    const clean = keywordInput.trim();
    if (clean && !keywords.includes(clean) && keywords.length < 5) {
      setKeywords([...keywords, clean]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter(k => k !== kwToRemove));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  // Toggle multiple audience tags
  const toggleAudience = (aud: string) => {
    if (selectedAudience.includes(aud)) {
      setSelectedAudience(selectedAudience.filter(a => a !== aud));
    } else {
      setSelectedAudience([...selectedAudience, aud]);
    }
  };

  // Saved / favorites actions
  const toggleFavorite = (title: string) => {
    if (savedTitles.includes(title)) {
      setSavedTitles(savedTitles.filter(t => t !== title));
    } else {
      setSavedTitles([...savedTitles, title]);
    }
  };

  const clearAllFavorites = () => {
    setSavedTitles([]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Trigger generator request
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!videoIdea.trim()) {
      setErrorMsg("Please provide a video idea or concept first.");
      return;
    }

    triggerGeneration();
  };

  const triggerGeneration = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setGenerationResults(null);

    try {
      const response = await fetch("/api/generate-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoIdea,
          keywords,
          majorCategory,
          customNiche,
          format: selectedFormat,
          audience: selectedAudience,
          tone: selectedTone,
          maturity: selectedMaturity,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const results: TitleGenerationResponse = await response.json();
      setGenerationResults(results);
      
      // Auto-load first title into sandbox to play with
      const firstTitle = results.track_b?.[0]?.title || results.track_a?.[0]?.title || "";
      if (firstTitle) {
        setSandboxTitle(firstTitle);
      }
      
      setActiveTab("results");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected issue occurred while requesting titles. Please check configuration & retry.");
    } finally {
      setIsLoading(false);
    }
  };



  // Presets and sample projects for fast onboarding
  const loadQuickTemplate = (type: "finance" | "tech" | "fitness" | "ai") => {
    if (type === "finance") {
      setVideoIdea("How I quit my traditional 9-to-5 job by building 10 channels for passive income, detailing exact losses, pitfalls, and final stock dividends.");
      setKeywords(["quit job", "passive income", "stocks"]);
      setMajorCategory("Business & Finance");
      setCustomNiche("Passive Income");
      setSelectedFormat("Deep Dive / Video Essay");
      setSelectedAudience(["Aspiring Creators", "Beginners"]);
      setSelectedTone("Conversational");
      setSelectedMaturity("New channel");
    } else if (type === "tech") {
      setVideoIdea("Testing the newly released action camera model under intense mountain biking and water experiments to see if it survives the drop test.");
      setKeywords(["action camera review", "camera drop test"]);
      setMajorCategory("Technology");
      setCustomNiche("Action Camera Review");
      setSelectedFormat("Review / Criticism");
      setSelectedAudience(["Advanced & Professionals", "Skeptics & Analysts"]);
      setSelectedTone("Provocative / Daring");
      setSelectedMaturity("Growing channel");
    } else if (type === "fitness") {
      setVideoIdea("I completely replaced drinking high-fructose corn syrups with filtered water and scientific minerals for 60 consecutive days, measuring metabolic biomarkers.");
      setKeywords(["quit sugar", "fitness biomarkers"]);
      setMajorCategory("Health & Fitness");
      setCustomNiche("Biohacking & Diet");
      setSelectedFormat("Tutorial / Walkthrough");
      setSelectedAudience(["Casual Observers", "Beginners", "Passionate Enthusiasts"]);
      setSelectedTone("Educational");
      setSelectedMaturity("Established authority");
    } else if (type === "ai") {
      setVideoIdea("Explaining how anyone can train private, local LLM models on general consumer computers under 10 minutes without writing deep python modules.");
      setKeywords(["local LLM", "train AI models", "own chatbot"]);
      setMajorCategory("Technology");
      setCustomNiche("Local LLM Training");
      setSelectedFormat("Tutorial / Walkthrough");
      setSelectedAudience(["Beginners", "Aspiring Creators", "Advanced & Professionals"]);
      setSelectedTone("Conversational");
      setSelectedMaturity("New channel");
    }
  };

  // Compute color based on scores
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "bg-[#2ec27e] text-zinc-950"; // Green
    if (score >= 60) return "bg-[#f4a228] text-zinc-950"; // Amber
    return "bg-[#e63946] text-white"; // Red
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-[#2ec27e]";
    if (score >= 60) return "text-[#f4a228]";
    return "text-[#e63946]";
  };

  const getScoreBarBgClass = (score: number) => {
    if (score >= 80) return "bg-[#2ec27e]";
    if (score >= 60) return "bg-[#f4a228]";
    return "bg-[#e63946]";
  };

  const getSafetyBadgeStyle = (safety: string) => {
    switch (safety) {
      case "SAFE":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "CAUTION":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "DANGER":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  // Helper validation criteria for Sandbox title
  const titleLength = sandboxTitle.length;
  const isTargetLength = titleLength >= 40 && titleLength <= 60;
  const isTooLong = titleLength > 65;
  const isTooShort = titleLength < 30;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-800 font-sans selection:bg-red-600 selection:text-white" id="ytgen-root">
      
      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 py-8" id="primary-layout">
        
        {/* Page Inner Title Header */}
        <div className="mb-8 border-b border-zinc-200 pb-5 text-center" id="page-title-block">
          <h1 className="text-3xl font-serif font-extrabold tracking-tight">
            <span className="text-zinc-950">YouTube </span>
            <span className="text-red-600">Title Generator</span>
          </h1>
        </div>

        {/* Master Bento Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-split">
          
          {/* LEFT INPUT FORM: 5 cols */}
          <section className="lg:col-span-5 space-y-6" id="input-section">
            
            {/* Main Form Fields */}
            <form onSubmit={handleGenerate} className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-5 shadow-sm">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="text-md font-serif font-bold text-zinc-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-600" />
                  Title Configuration Settings
                </h2>
                <p className="font-roboto text-zinc-550 text-xs mt-1">Calibrate generator engine fields below.</p>
              </div>

              {/* Video idea concept input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="video-idea" className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                    1. Video Topic or Concept <span className="text-red-600">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${videoIdea.length > 350 ? 'text-amber-600' : videoIdea.length > 50 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                    {videoIdea.length}/400 chars
                  </span>
                </div>
                <textarea
                  id="video-idea"
                  maxLength={400}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-805 outline-none focus:border-red-600 focus:bg-white transition-all font-sans placeholder:text-zinc-400 resize-none h-24"
                  placeholder="Describe your video angle (e.g., 'Testing 5 passive income ideas that anyone can start in high school using only a laptop...')"
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                />
              </div>

              {/* Target tags keyword tags tags tags */}
              <div className="space-y-2">
                <label className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                  2. Focus Target Keywords
                  <span className="text-zinc-500 font-normal capitalize font-sans">(Max 5)</span>
                </label>
                <div className="flex bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 focus-within:border-red-600 focus-within:bg-white transition">
                  <input
                    type="text"
                    className="bg-transparent flex-1 text-sm text-zinc-800 px-1 py-1 outline-none placeholder:text-zinc-400 font-sans"
                    placeholder={keywords.length >= 5 ? "Limit reached" : "Type and press enter/comma"}
                    value={keywordInput}
                    disabled={keywords.length >= 5}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    disabled={keywords.length >= 5 || !keywordInput.trim()}
                    className="p-1 px-2.5 rounded bg-zinc-200 border border-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 text-xs text-zinc-800 font-bold transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {/* tags array display */}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {keywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 py-1 px-2.5 rounded-full font-mono font-medium">
                        {kw}
                        <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-blue-900 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content format */}
              <div className="space-y-2">
                <label htmlFor="format-selector" className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                  3. Content Format Layout
                </label>
                <select
                  id="format-selector"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-800 outline-none focus:border-red-600 focus:bg-white transition-all cursor-pointer font-sans"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  {CONTENT_FORMATS.map((form) => (
                    <option key={form} value={form}>
                      🎬 {form}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target audience tags selection chips */}
              <div className="space-y-2">
                <label className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                  4. Target Audience Profile
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TARGET_AUDIENCES.map((aud) => {
                    const isSelected = selectedAudience.includes(aud);
                    return (
                      <button
                        type="button"
                        key={aud}
                        onClick={() => toggleAudience(aud)}
                        className={`py-1.5 px-2.5 rounded-lg text-left text-xs border transition ${
                          isSelected 
                            ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-350"
                        }`}
                      >
                        {isSelected ? "✓ " : ""} {aud}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone selection chips */}
              <div className="space-y-2">
                <label className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                  5. Voice Tone
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONTENT_TONES.map((t) => {
                    const isSelected = selectedTone === t.name;
                    return (
                      <button
                        type="button"
                        key={t.name}
                        onClick={() => setSelectedTone(t.name)}
                        title={t.desc}
                        className={`py-1.5 px-2 text-left rounded-lg text-xs border transition ${
                          isSelected 
                            ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                            : "bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{t.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel maturity authority factor */}
              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <label className="text-sm font-serif tracking-tight text-zinc-850 font-bold flex items-center gap-1.5">
                  6. Channel Authority Level
                </label>
                <div className="flex flex-col gap-1.5">
                  {CHANNEL_MATURITIES.map((mat) => {
                    const isSelected = selectedMaturity === mat.name;
                    return (
                      <button
                        type="button"
                        key={mat.id}
                        onClick={() => setSelectedMaturity(mat.name)}
                        className={`p-2.5 rounded-lg text-left text-xs border transition flex items-center justify-between ${
                          isSelected 
                            ? "bg-red-50 border-red-500 text-red-700 font-semibold"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{mat.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{mat.desc}</p>
                        </div>
                        {isSelected && <Award className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Optimized Titles...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compile Optimized Playbook</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2.5 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>



          </section>

          {/* RIGHT SIDE OUTPUT CONTAINER: 7 cols */}
          <main className="lg:col-span-12 xl:col-span-7 bg-transparent space-y-6" id="output-tabs-container">
            
            {/* Tabs Controller */}
            <div className="bg-white p-1 px-1.5 rounded-xl border border-zinc-200 flex items-center justify-between gap-1 shadow-sm">
              <nav className="flex items-center gap-1" aria-label="Output tools">
                <button
                  type="button"
                  onClick={() => setActiveTab("results")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeTab === "results" 
                      ? "bg-red-600 text-white shadow"
                      : "text-zinc-550 hover:text-red-600"
                  }`}
                >
                  🎭 Dual-Track Results
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sandbox")}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    activeTab === "sandbox" 
                      ? "bg-red-600 text-white shadow"
                      : "text-zinc-550 hover:text-red-600"
                  }`}
                >
                  📱 Mobile Previewer Playpen
                </button>
              </nav>
              <div className="text-[10px] text-zinc-400 font-mono hidden sm:block pr-2">
                ACTIVE LABELS APPROVED FOR May 2026
              </div>
            </div>

            {/* TAB CONTENT BLOCK */}
            <AnimatePresence mode="wait">
              
              {/* LOADING VIEW COMPONENT */}
              {isLoading && (
                <motion.div
                  key="loading-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-zinc-201 rounded-3xl p-10 py-16 text-center space-y-6 flex flex-col items-center justify-center shadow-sm"
                >
                  <div className="relative">
                    {/* Ring spinner */}
                    <div className="w-16 h-16 rounded-full border-4 border-zinc-100 border-t-red-600 animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-red-600 absolute top-5 left-5 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-md uppercase font-mono tracking-widest text-red-600 font-bold">
                      Generating Optimized Dual-Track Assets
                    </h3>
                    <p className="text-zinc-600 max-w-md mx-auto text-sm">
                      Evaluating psychological tension, word limits, front-loaded positioning index, and algorithm safety risk filters...
                    </p>
                  </div>

                  {/* Dynamic staging step label */}
                  <div className="bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-200 max-w-sm w-full mx-auto space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>PROCESS STAGE {loadingStageIndex + 1}/6</span>
                      <span>{Math.round(((loadingStageIndex + 1) / 6) * 100)}%</span>
                    </div>
                    {/* Visual bar tracker */}
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-red-600 h-full transition-all duration-500"
                        style={{ width: `${((loadingStageIndex + 1) / 6) * 100}%` }}
                      ></div>
                    </div>
                    {/* stage label */}
                    <p className="text-xs font-bold text-zinc-700 font-mono italic animate-pulse">
                      "{LOADING_STAGES[loadingStageIndex]}"
                    </p>
                  </div>
                </motion.div>
              )}

              {/* UNINITIALIZED EMPTY STATE */}
              {!isLoading && !generationResults && activeTab === "results" && (
                <motion.div
                  key="empty-panel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-zinc-204 rounded-3xl p-8 py-14 text-center space-y-8 shadow-sm"
                >
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="w-14 h-14 bg-red-50 rounded-full border border-red-100 flex items-center justify-center mx-auto text-red-600">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-zinc-900">Workspace Standard</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Fill in your target concept details, optional primary queries, content metrics, then trigger the 10-title compiler to build dual-track optimizations tailored for discoverability and audience retention checks.
                      </p>
                    </div>

                    {/* Step guidance timeline */}
                    <div className="grid grid-cols-3 gap-2.5 pt-4 text-left border-t border-zinc-100">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-red-600 font-bold">STEP 1</span>
                        <h4 className="text-xs font-bold text-zinc-800">Enter Idea</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Provide details of your topic or use quick presets.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-red-600 font-bold">STEP 2</span>
                        <h4 className="text-xs font-bold text-zinc-800">Select Settings</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Choose niche triggers, format rules, and tone register.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-red-600 font-bold">STEP 3</span>
                        <h4 className="text-xs font-bold text-zinc-800">Get Playbook</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Obtain dual scored channels, copy, or sandbox variations.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DUAL-TRACK GENERATED TITLES RESULTS TAB */}
              {!isLoading && generationResults && activeTab === "results" && (
                <motion.div
                  key="results-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  
                  {/* Quick summary summary card */}
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">ACTIVE CONFIGURATION MATCH</span>
                      <p className="font-semibold text-zinc-900 mt-0.5">
                        Detected Content Niche: <span className="text-red-650 font-semibold capitalize">
                          {generationResults.niche_detected || "General"}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-zinc-50 px-2.5 py-1 rounded text-[11px] border border-zinc-200 text-zinc-600">Tone: {selectedTone}</span>
                      <span className="bg-zinc-50 px-2.5 py-1 rounded text-[11px] border border-zinc-200 text-zinc-600">Format: {selectedFormat}</span>
                    </div>
                  </div>

                  {/* TRACK A - SEO KEYWORD-OPTIMIZED ROW */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-blue-650 pl-3">
                      <div>
                        <h3 className="text-md font-serif font-bold text-zinc-900 flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-600" />
                          Track A: SEO Keyword-Optimized Series (Search Discovery)
                        </h3>
                        <p className="font-roboto text-zinc-500 text-xs">
                          Designed with search terms locked in the first 35 characters to guarantee visibility on mobile query slots.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-50 border border-blue-150 text-blue-600 rounded px-2.5 py-0.5 uppercase shrink-0 font-semibold">
                        Topical Query Winners
                      </span>
                    </div>

                    <div className="space-y-4">
                      {generationResults.track_a.map((titleObj, index) => {
                        const isFav = savedTitles.includes(titleObj.title);
                        const idKey = `track-a-${index}`;
                        return (
                          <div 
                            key={index} 
                            className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all duration-300 relative group text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-mono bg-zinc-100 text-zinc-600 border border-zinc-200 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                    A{index + 1} • {titleObj.framework}
                                  </span>
                                  {titleObj.front_loaded && (
                                    <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-200 rounded font-bold">
                                      FRONT-LOADED INDEX PASS
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getSafetyBadgeStyle(titleObj.safety)}`}>
                                    Safety: {titleObj.safety}
                                  </span>
                                </div>
                                
                                {/* Title Display */}
                                <h4 className="text-sm font-bold text-zinc-900 leading-snug break-words pr-4">
                                  <span>{titleObj.title}</span>
                                </h4>

                                <p className="text-xs text-zinc-650 font-roboto italic pl-2.5 border-l-2 border-zinc-200 leading-relaxed">
                                  "{titleObj.why}"
                                </p>
                              </div>

                              {/* Clipboard / Action Group */}
                              <div className="flex flex-col gap-1 sm:flex-row items-center justify-end shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(titleObj.title)}
                                  title={isFav ? "Remove from favorite tray" : "Bookmark to tray"}
                                  className={`p-2 rounded-lg border transition duration-155 cursor-pointer ${
                                    isFav
                                      ? "bg-red-50 border-red-400 text-red-650"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                                  }`}
                                >
                                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSandboxTitle(titleObj.title);
                                    setActiveTab("sandbox");
                                  }}
                                  title="Load in interactive mobile playground"
                                  className="p-2 rounded-lg border bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-250 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(titleObj.title, idKey)}
                                  className="p-2 rounded-lg border bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-250 transition font-mono min-w-[40px] flex items-center justify-center cursor-pointer"
                                >
                                  {copiedId === idKey ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Core Performance Score Metrics Grid */}
                            <div className="mt-3.5 pt-3 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                                  <span>SEO compliant</span>
                                  <span className={getScoreTextColor(titleObj.seo_score)}>{titleObj.seo_score}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${getScoreBarBgClass(titleObj.seo_score)}`} style={{ width: `${titleObj.seo_score}%` }}></div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                                  <span>Curiosity Interest</span>
                                  <span className={getScoreTextColor(titleObj.curiosity_score)}>{titleObj.curiosity_score}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${getScoreBarBgClass(titleObj.curiosity_score)}`} style={{ width: `${titleObj.curiosity_score}%` }}></div>
                                </div>
                              </div>

                              <div className="col-span-2 sm:col-span-1 text-[10px] font-mono text-zinc-500 flex items-center justify-between sm:justify-end gap-1 text-right">
                                <span>Chars: {titleObj.chars}</span>
                                <span className="bg-zinc-50 text-zinc-500 px-1 py-0.5 rounded ml-1 border border-zinc-200 font-bold">
                                  {titleObj.chars > 65 ? "⚠️ Over limit" : "✓ Optimal"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TRACK B - AUDIENCE NEED COVERAGE SERIES */}
                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-l-4 border-emerald-600 pl-3">
                      <div>
                        <h3 className="text-md font-serif font-bold text-zinc-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Track B: Audience Need Coverage Series (Home & Suggested Loop)
                        </h3>
                        <p className="font-roboto text-zinc-500 text-xs">
                          Priority-engineered around emotional drivers, cognitive bias, and high curiosity-tension vocabularies.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-150 text-emerald-700 rounded px-2.5 py-0.5 uppercase shrink-0 font-semibold">
                        Homepage CTR Dominant
                      </span>
                    </div>

                    <div className="space-y-4">
                      {generationResults.track_b.map((titleObj, index) => {
                        const isFav = savedTitles.includes(titleObj.title);
                        const idKey = `track-b-${index}`;
                        return (
                          <div 
                            key={index} 
                            className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all duration-300 relative group text-left"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] font-mono bg-zinc-100 text-zinc-650 border border-zinc-205 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                                    B{index + 1} • {titleObj.framework}
                                  </span>
                                  {titleObj.front_loaded && (
                                    <span className="text-[9px] font-mono bg-emerald-50 text-emerald-750 px-1.5 py-0.5 border border-emerald-250 rounded font-bold uppercase">
                                      FRONT-LOADED QUERY PASS
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getSafetyBadgeStyle(titleObj.safety)}`}>
                                    Safety: {titleObj.safety}
                                  </span>
                                </div>
                                
                                {/* Title Display */}
                                <h4 className="text-sm font-bold text-zinc-900 leading-snug break-words pr-4">
                                  <span>{titleObj.title}</span>
                                </h4>

                                <p className="text-xs text-zinc-650 font-roboto italic pl-2.5 border-l-2 border-zinc-200 leading-relaxed">
                                  "{titleObj.why}"
                                </p>
                              </div>

                              {/* Clipboard / Action Group */}
                              <div className="flex flex-col gap-1 sm:flex-row items-center justify-end shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(titleObj.title)}
                                  title={isFav ? "Remove from favorite tray" : "Bookmark to tray"}
                                  className={`p-2 rounded-lg border transition duration-155 cursor-pointer ${
                                    isFav
                                      ? "bg-red-50 border-red-400 text-red-650"
                                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                                  }`}
                                >
                                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSandboxTitle(titleObj.title);
                                    setActiveTab("sandbox");
                                  }}
                                  title="Load in interactive mobile playground"
                                  className="p-2 rounded-lg border bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-250 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(titleObj.title, idKey)}
                                  className="p-2 rounded-lg border bg-zinc-50 border-zinc-200 text-zinc-550 hover:text-red-605 hover:bg-red-50 hover:border-red-250 transition font-mono min-w-[40px] flex items-center justify-center cursor-pointer"
                                >
                                  {copiedId === idKey ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Core Performance Score Metrics Grid */}
                            <div className="mt-3.5 pt-3 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                                  <span>SEO compliant</span>
                                  <span className={getScoreTextColor(titleObj.seo_score)}>{titleObj.seo_score}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${getScoreBarBgClass(titleObj.seo_score)}`} style={{ width: `${titleObj.seo_score}%` }}></div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                                  <span>Curiosity Interest</span>
                                  <span className={getScoreTextColor(titleObj.curiosity_score)}>{titleObj.curiosity_score}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div className={`h-full ${getScoreBarBgClass(titleObj.curiosity_score)}`} style={{ width: `${titleObj.curiosity_score}%` }}></div>
                                </div>
                              </div>

                              <div className="col-span-2 sm:col-span-1 text-[10px] font-mono text-zinc-500 flex items-center justify-between sm:justify-end gap-1 text-right">
                                <span>Chars: {titleObj.chars}</span>
                                <span className="bg-zinc-50 text-zinc-500 px-1 py-0.5 rounded ml-1 border border-zinc-200 font-bold">
                                  {titleObj.chars > 65 ? "⚠️ Over limit" : "✓ Optimal"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              )}

              {/* MOBILE LIVE PREVIEW PLAYPEN TAB */}
              {activeTab === "sandbox" && (
                <motion.div
                  key="sandbox-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-left"
                >
                  <div className="border-b border-zinc-100 pb-3">
                    <h3 className="text-md font-serif font-bold text-zinc-900 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-red-600" />
                      Audience Sandbox & Live Mobile Truncation Inspector
                    </h3>
                    <p className="font-roboto text-zinc-550 text-xs text-zinc-500 mt-1">
                      Type your title, and see exactly what gets cut off on smaller layouts. Simulate search slot outputs in real time.
                    </p>
                  </div>

                  {/* Inline Live Editor Sandbox Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="sandbox-input" className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                        Playpen Custom Title Draft
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${isTooLong ? 'text-red-600' : isTargetLength ? 'text-emerald-600' : 'text-zinc-500'}`}>
                        {titleLength} / 65 Optimal Chars Threshold
                      </span>
                    </div>
                    <input
                      id="sandbox-input"
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-600 focus:bg-white outline-none rounded-lg p-3 text-sm text-zinc-800 font-sans transition-all"
                      placeholder="Paste, select from list above, or draft variations here..."
                      value={sandboxTitle}
                      onChange={(e) => setSandboxTitle(e.target.value)}
                    />
                  </div>

                  {/* Simulator visual output frames of youtube feed layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* MOBILE FEED SLOT VIEW CONTAINER */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono text-zinc-500 flex items-center gap-1.5 font-bold">
                        <Phone className="w-3.5 h-3.5 text-red-600" />
                        1. Mobile YouTube Feed Preview (Simulated)
                      </h4>

                      <div className="bg-[#0f0f15] rounded-2xl border-4 border-zinc-200 overflow-hidden shadow-xl relative">
                        {/* Status bar mockup */}
                        <div className="bg-zinc-950 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono text-zinc-500 border-b border-zinc-900/50">
                          <span>YT Premium App</span>
                          <span>10:42 UTC</span>
                        </div>

                        {/* Interactive thumbnail box representation */}
                        <div className="aspect-video bg-gradient-to-tr from-zinc-900 to-zinc-950 border-b border-zinc-900 flex items-center justify-center relative group">
                          {/* Inner mockup text elements */}
                          <div className="p-4 text-center space-y-1.5 opacity-55">
                            <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono text-zinc-400">16:9 Simulator Frame</span>
                            <p className="text-xs font-bold text-zinc-450 uppercase tracking-widest text-center">Video Thumbnail Area</p>
                          </div>
                          
                          {/* Time label overlay */}
                          <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white tracking-wider font-mono">
                            12:45
                          </span>
                        </div>

                        {/* Channel metadata section with text cutoff cutoff cutoff */}
                        <div className="p-3.5 flex gap-2.5">
                          {/* Circle Avatar icon */}
                          <div className="w-8 h-8 rounded-full bg-red-950/50 border border-red-950 shrink-0 flex items-center justify-center text-red-400 text-xs font-bold font-mono">
                            YT
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            {/* LIVE TITLE TEXT TRUNCATED OR HIGHLIGHTED */}
                            <h5 className="text-xs font-bold text-zinc-100 leading-snug break-words">
                              {titleLength > 0 ? (
                                <span>{sandboxTitle}</span>
                              ) : (
                                <span className="text-zinc-650 italic">[Title preview text empty]</span>
                              )}
                            </h5>

                            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                              <span className="font-semibold text-zinc-400 truncate">{sandboxChannel}</span>
                              <span>•</span>
                              <span>{sandboxViews}</span>
                              <span>•</span>
                              <span>{sandboxTime}</span>
                            </div>
                          </div>

                          <button type="button" className="text-zinc-650 hover:text-zinc-400 align-top self-start shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SEARCH RESULTS FEED PREVIEW */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-mono text-zinc-500 flex items-center gap-1.5 font-bold">
                        <Search className="w-3.5 h-3.5 text-blue-500" />
                        2. Search Slot Results (Mobile Landscape)
                      </h4>

                      <div className="bg-[#0f0f15] p-3.5 rounded-2xl border-4 border-zinc-200 shadow-xl space-y-3">
                        <div className="flex bg-zinc-950 border border-zinc-900 py-1.5 px-3 rounded-lg text-xs font-mono text-zinc-405 justify-between items-center">
                          <span>🔎 searching: how to quit my job</span>
                          <span className="text-zinc-500">Done</span>
                        </div>

                        {/* Search result item row representation */}
                        <div className="flex gap-2.5 items-start">
                          <div className="w-24 h-16 bg-zinc-900 rounded-lg shrink-0 relative flex items-center justify-center border border-zinc-850">
                            <span className="text-[9px] text-zinc-605 font-mono">Thumbnail</span>
                            <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.1 rounded text-[8px] text-white font-mono">10:04</span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1 text-left">
                            <h5 className="text-[11px] font-bold tracking-tight text-zinc-150 leading-snug">
                              {titleLength > 0 ? (
                                <span>{sandboxTitle}</span>
                              ) : (
                                <span className="text-zinc-655 italic">[Enter mock title]</span>
                              )}
                            </h5>
                            <p className="text-[9px] text-zinc-550 leading-none">{sandboxChannel} • {sandboxViews}</p>
                            <p className="text-[9px] text-zinc-600 line-clamp-1 leading-snug">
                              A complete description with keyword checks for optimal high CTR indexing targets.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-4" id="sandbox-criteria">
                    
                    {/* Simulator context metadata inputs */}
                    <div className="space-y-1.5 md:border-r border-zinc-200 md:pr-4">
                      <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold">Pre-set Channel Name</span>
                      <input 
                        type="text" 
                        value={sandboxChannel} 
                        onChange={(e) => setSandboxChannel(e.target.value)}
                        className="w-full bg-white border border-zinc-205 px-2 py-1.5 rounded text-xs text-zinc-800 focus:border-red-600 outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 md:border-r border-zinc-200 md:px-4">
                      <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold">Mock View Count</span>
                      <input 
                        type="text" 
                        value={sandboxViews} 
                        onChange={(e) => setSandboxViews(e.target.value)}
                        className="w-full bg-white border border-zinc-205 px-2 py-1.5 rounded text-xs text-zinc-800 focus:border-red-600 outline-none font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 md:pl-4">
                      <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold">Simulation Age</span>
                      <input 
                        type="text" 
                        value={sandboxTime} 
                        onChange={(e) => setSandboxTime(e.target.value)}
                        className="w-full bg-white border border-zinc-205 px-2 py-1.5 rounded text-xs text-zinc-800 focus:border-red-600 outline-none font-medium"
                      />
                    </div>

                  </div>

                                   <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                    <h4 className="text-xs font-serif uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-bold">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Dynamic Diagnostics Audit & SEO Recommendations
                    </h4>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2 text-xs">
                        {isTargetLength ? (
                          <Check className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )
                        }
                        <div>
                          <p className="font-serif font-bold text-zinc-800">Optimal Mobile Character Length (35–65 limits)</p>
                          <p className="font-roboto text-[11px] text-zinc-550 mt-0.5 leading-relaxed">
                            {titleLength === 0 
                              ? "Please write or paste a title variation to run checker diagnostics." 
                              : isTargetLength 
                                ? "Perfect length! The title fits high resolution desktop pages as well as portable viewport layouts comfortably."
                                : isTooLong 
                                  ? "Warning: Your title exceeds 65 characters limits. Anything beyond character index 65 WILL truncate in standard query streams."
                                  : "Title draft is too short! We recommend maintaining at least 35 characters to fit standard semantic indexing expectations."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs border-t border-zinc-200 pt-2.5">
                        {titleLength >= 35 ? (
                          <Check className="w-4 h-4 text-emerald-650 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-serif font-bold text-zinc-800">First 35 Characters Frontloaded Core Match</p>
                          <p className="font-roboto text-[11px] text-zinc-550 mt-0.5 leading-relaxed">
                            {titleLength < 35 
                              ? "The entire phrase fits. However, we recommend expanding context keywords." 
                              : "The split character is marked visible. Check if the primary theme nouns and high-excitement verbs sit within this 35-char pocket."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs border-t border-zinc-200 pt-2.5">
                        <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-serif font-bold text-zinc-800">Audience Psychological Synergy Trigger recommendation</p>
                          <p className="font-roboto text-[11px] text-zinc-550 mt-0.5 leading-relaxed">
                            To maximize CTR, couple this title draft with a highly contrasting Thumbnail that builds structural context (e.g., if title states "Why Compound Interest Is Overrated", render Thumbnail showing visual charts illustrating other investment alternatives).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
            
          </main>

        </div>

      </main>



    </div>
  );
}
