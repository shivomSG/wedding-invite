import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";


// HTML 5 Canvas Scratch Card Component
const ScratchCanvas = ({ onReveal, children }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Fill the red background
    ctx.fillStyle = "#8A151B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a rubbing symbol (👆) instead of "RUB"
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👆", canvas.width / 2, canvas.height / 2);
  }, []);

  // Calculates the exact percentage of pixels cleared by rubbing
  const checkClearedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;

    // Sample every 4th pixel for smooth mobile performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }
    const sampledTotal = totalPixels / 4;
    return (transparentCount / sampledTotal) * 100;
  };

  const handleScratch = (e) => {
    if (!isDrawing.current || isRevealed) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase pixels where the user rubs
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2); // Eraser brush size
    ctx.fill();

    // Trigger reveal when 25% is rubbed away
    const clearedPercent = checkClearedPercentage();
    if (clearedPercent >= 25 && !isRevealed) {
      setIsRevealed(true);
      if (onReveal) onReveal();
    }
  };

  return (
    <div className="relative w-full h-full select-none">
      {/* The Hidden Date Text */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {children}
      </div>
      
      {/* The Erasable Top Layer */}
      <canvas
        ref={canvasRef}
        width={120}
        height={80}
        className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-700 ${
          isRevealed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onMouseDown={() => (isDrawing.current = true)}
        onMouseUp={() => (isDrawing.current = false)}
        onMouseLeave={() => (isDrawing.current = false)}
        onMouseMove={handleScratch}
        onTouchStart={(e) => { isDrawing.current = true; handleScratch(e); }}
        onTouchEnd={() => (isDrawing.current = false)}
        onTouchMove={handleScratch}
      />
    </div>
  );
};



export default function WeddingApp() {
  // This state tracks whether the user has tapped the seal
  const [isOpen, setIsOpen] = useState(false);
  // Controls the back button popup
  const [showBackPopup, setShowBackPopup] = useState(false); 
  // Tracks which date boxes have been revealed
const [scratched, setScratched] = useState({ month: false, day: false, year: false });

// Triggers the confetti animation
const fireConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#FFD700", "#8A151B", "#FFA500", "#FFFFFF"],
  });
};

// State and ref for audio playback
const [isAudioPlaying, setIsAudioPlaying] = useState(false);
const audioRef = useRef(null); //Main background music
const openSoundRef = useRef(null); //For the 1-second opening sound
const scratchSoundRef = useRef(null); // For the scratch card


const toggleAudio = () => {
  if (isAudioPlaying) {
    audioRef.current.pause();
  } else {
    audioRef.current.play();
  }
  setIsAudioPlaying(!isAudioPlaying);
};

const handleSealClick = () => {
  setIsOpen(true); // Triggers the visual envelope opening

  // 1. Play the short opening sound immediately
  if (openSoundRef.current) {
    openSoundRef.current.play().catch(err => console.log("Sound blocked:", err));
  }

  // 2. Wait 1.5 seconds for the envelope animation to finish, THEN play main music
  setTimeout(() => {
    if (audioRef.current && !isAudioPlaying) {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(err => console.log("Audio blocked:", err));
    }
  }, 1500); // 1500 milliseconds = 1.5 seconds
};


const events = [
  { name: "हल्दी रस्म", date: "23 नवंबर  2026, सोमवार", time: "सायं 06:00 बजे" },
  { name: "मंत्री पूजा", date: "24 नवंबर 2026, मंगलवार", time: "प्रातः 09:00 बजे" },
  { name: "मेहंदी रस्म", date: "24 नवंबर 2026, मंगलवार", time: "सायं 06:00 बजे" },
  { name: "बारात स्वागत", date: "25 नवंबर 2026, बुधवार", time: "सायं 06:00 बजे" },
  { name: "प्रीतिभोज", date: "25 नवंबर 2026, बुधवार", time: "सायं 07:00 बजे" },
  { name: "विदाई", date: "26 नवंबर 2026, बृहस्पतिवार", time: "तारों की छाँव में" },
];


// Handles the tap on a date box
const handleScratch = (field) => {
  if (!scratched[field]) {
    setScratched((prev) => ({ ...prev, [field]: true }));
    fireConfetti();

    // Play the scratch sound effect
    if (scratchSoundRef.current) {
      scratchSoundRef.current.currentTime = 0; // Resets sound for rapid tapping
      scratchSoundRef.current.play().catch(err => console.log("Sound blocked:", err));
    }
  }
};


// Handles the browser back button interception
useEffect(() => {
  if (isOpen) {
    // Push a fake history state so back button triggers popstate instead of leaving
    window.history.pushState({ page: 'wedding' }, '');

    const handlePopState = (event) => {
      // Prevent default back behavior and show our custom popup
      setShowBackPopup(true);
      // Push the state back so they stay on the page until they choose
      window.history.pushState({ page: 'wedding' }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }
}, [isOpen]);

  return (
    /* The main wrapper uses your custom background image */
    
    <div className="relative min-h-screen bg-[url('/background.png')] bg-[length:100%_100%] font-serif text-[#8A151B] flex justify-center">
      
      {/* Main background music */}
      <audio ref={audioRef} src="/music.mp3" loop />
      
      {/* The short opening sound effect */}
      <audio ref={openSoundRef} src="/open-sound.mp3" />
      {/* The scratch card sound effect */}
      <audio ref={scratchSoundRef} src="/scratch-sound.mp3" />
      {/* =========================================
          THE ENVELOPE OVERLAY & SEAL ANIMATION
          ========================================= */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A0A10] p-4"
          >
            <div className="relative w-full max-w-sm min-h-[520px] bg-[#7E1627] rounded-2xl shadow-2xl border border-[#FFD700]/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {/* Top Image */}
          <div className="absolute top-8 w-full flex justify-center">
            <img 
              src="/gath.png" 
              alt="gathbandhan" 
              style={{ width: "70%", height: "70px", objectFit: "fill" }}
              className="drop-shadow-md" 
            />
          </div>
              
              
              <p className="font-yatra text-white/80 tracking-widest text-[50px]  uppercase mb-8">निमंत्रण </p>
              
              {/* The clickable Wax Seal */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSealClick}
                className="relative group w-24 h-24 rounded-full bg-[#E5D5C5] shadow-[0_8px_30px_rgb(0,0,0,0.35)] border-4 border-[#C8B29B] flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full border border-[#A68F7A] flex flex-col items-center justify-center">
                  <span className="font-yatra text-2xl font-bold text-[#8A151B]">NP</span>
                </div>
                <span className="absolute -bottom-8 whitespace-nowrap text-white/90 text-sm italic tracking-wide">
                  टैप करके खोलें
                </span>
              </motion.button>


            {/* NEW: 3 Bottom Images */}
          <div className="absolute bottom-8 w-full px-10 flex justify-between items-center">
            <img 
              src="/kalash_f.png" 
              alt="kalash_left" 
              className="w-20 h-20 object-contain drop-shadow-md" 
            />
            <img 
              src="/hawan.png" 
              alt="hawan" 
              className="w-20 h-20 object-contain drop-shadow-md" 
            />
            <img 
              src="/kalash_f.png" 
              alt="kalash_right" 
              className="w-20 h-20 object-contain drop-shadow-md transform -scale-x-100" 
            />
          </div>




            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================
          THE MAIN INVITATION CONTENT 
          (Only shows after the seal is clicked)
          ========================================= */}
      {isOpen && (
        <main className="w-full max-w-md min-h-screen p-4 pb-[13vh] flex flex-col items-center text-center">
          
      {/*  Horizontal Divider */}
      <div className="w-full flex justify-center px-4">
        <svg 
          viewBox="0 0 600 24" 
          className="w-full max-w-[380px] drop-shadow-sm opacity-90" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Line with Taper */}
          <path d="M0,11 L210,11 L225,12 L210,13 L0,13 Z" fill="#8A151B" />
          
          {/* Left Small Diamond */}
          <polygon points="232,12 240,7 248,12 240,17" fill="#8A151B" />
          
          {/* Left Hollow Leaf */}
          <path d="M285,12 C285,1 255,1 255,12 C255,23 285,23 285,12 Z M278,12 C278,6 265,6 265,12 C265,18 278,18 278,12 Z" fill="#8A151B" fillRule="evenodd" />
          
          {/* Center Diamond */}
          <polygon points="300,3 310,12 300,21 290,12" fill="#8A151B" />
          
          {/* Right Hollow Leaf */}
          <path d="M315,12 C315,1 345,1 345,12 C345,23 315,23 315,12 Z M322,12 C322,6 335,6 335,12 C335,18 322,18 322,12 Z" fill="#8A151B" fillRule="evenodd" />
          
          {/* Right Small Diamond */}
          <polygon points="368,12 360,7 352,12 360,17" fill="#8A151B" />
          
          {/* Right Line with Taper */}
          <path d="M600,11 L390,11 L375,12 L390,13 L600,13 Z" fill="#8A151B" />
        </svg>
      </div>

      {/* STEP 1: Top Header with Ganesh */}
      <div className="flex items-center justify-center gap-3 mt-3 mb-4">
        <img src="/ganesh.png" alt="Ganesh" className="w-14 h-14 object-contain" />
        <h1 className="font-trio text-xl font-bold">॥श्री गणेशाय नमः॥</h1>
        <img src="/ganesh.png" alt="Ganesh" className="w-14 h-14 object-contain" />
      </div>

      {/* STEP 2: The Opening Shloka */}
      <p className="font-tiro text-sm font-semibold leading-relaxed max-w-[280px] mb-8">
        वक्रतुण्ड महाकाय, सूर्यकोटि समप्रभः ।<br />
        निर्विघ्नं कुरूमे देव, सर्वकार्येषु सर्वदा । ।
      </p>

      {/* STEP 3: Interactive Save The Date (Scratch Cards) */}
      <div className="w-full bg-[#8A151B]/10 border border-[#8A151B]/30 p-4 rounded-xl mb-5 backdrop-blur-sm shadow-sm">
        <h2 className="text-xl font-bold text-[#8A151B] mb-1">शुभ विवाह तिथि</h2>
        <p className="text-xs text-[#8A151B]/80 mb-4">(तारीख देखने के लिए रब करें)</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "दिन", value: "25", key: "day" },
            { label: "महीना", value: "नवंबर", key: "month" },
            { label: "वर्ष", value: "2026", key: "year" },
          ].map(({ label, value, key }) => (
            <div
              key={key}
              className="h-20 rounded-lg border border-[#8A151B]/40 relative overflow-hidden bg-white/60"
            >
              <ScratchCanvas onReveal={() => handleScratch(key)}>
                
                {/* This is the hidden content that gets revealed */}
                <div className="flex flex-col items-center justify-center w-full h-full text-center">
                  <span className="text-[10px] tracking-wider text-[#8A151B]/80 block mb-0.5">
                    {label}
                  </span>
                  <span className="text-lg font-bold text-[#8A151B]">
                    {value}
                  </span>
                </div>

              </ScratchCanvas>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 4: Mangalik Karyakram (Events Itinerary) */}
      <div className="w-full my-8">
        
        {/* Header with Kalash Icons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/kalash.png" alt="Kalash" className="w-10 h-10 object-contain" />
          <h2 className="font-poppins text-xl text-bold font-black tracking-wide text-[#8A151B]">॥ मांगलिक कार्यक्रम ॥</h2>
          <img src="/kalash.png" alt="Kalash" className="w-10 h-10 object-contain" />
        </div>
        
        {/* Dynamic Events List */}
        <div className="w-full space-y-2 px-2">
          {events.map((event, idx) => (
            <div key={idx} className="flex flex-col text-[#8A151B] font-palanquin">
              <h3 className="font-bold text-base mx-auto mb-1">{event.name}</h3>
              
              {/* Flex container keeps dates left, times right, and the dotted line stretching between them */}
              <div className="flex items-end justify-between w-full text-[11px] md:text-xs font-semibold">
                <span className="whitespace-nowrap text-[12px]">{event.date}</span>
                <div className="flex-1 border-b-[2px] border-dotted border-[#8A151B]/60 mx-2 mb-1"></div>
                <span className="whitespace-nowrap text-[12px]">{event.time}</span>
              </div>
            </div>
          ))}
        </div>
        
      </div>

      {/* STEP 5: Venue (Marriage Location) */}
      <div className="w-full flex flex-col items-center justify-center my-1 mb-6 text-[#8A151B]">
            
            {/* SVG Roof Graphic matching the reference image */}
            <svg viewBox="0 0 300 50" className="w-full max-w-[280px] mb-.3 drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
              <path d="M150 5 L10 45 L13 48 L150 12 L287 48 L290 45 Z" fill="#8A151B" />
              <polygon points="145,8 150,0 155,8" fill="#8A151B" />
            </svg>

            {/* Venue Text */}
            <h3 className="font-yatra text-xl font-bold mb-1">विवाह स्थल</h3>
            <h2 className="font-yatra text-4xl font-black mb-1 tracking-wide">रॉयल वाटिका</h2>
            <p className="font-yatra font-bold text-sm md:text-base tracking-wide">
              स्टेशन रोड, राजातालाब, वाराणसी
            </p>
            
      </div>

     {/* STEP 6: Sticky 3-Column Layout dulhan dulha */}
      <div className="w-full relative flex justify-between items-start mb-1 my-6 px-1">
        
        {/* LEFT COLUMN: Dulhan (Bride) Image - Now Sticky */}
        <div className="w-[22%] h-[140px] md:h-[180px] sticky top-1/2 -translate-y-1/2 flex flex-col justify-end items-center">
          <img 
            src="/dulhan.png" 
            alt="Bride" 
            className="w-full max-w-[111px] max-h-full object-contain object-bottom drop-shadow-md -scale-x-100" 
          />
        </div>

        {/* CENTER COLUMN: All Text (Bride + Hands + Groom) */}
        <div className="w-[56%] flex flex-col items-center text-center z-10">
          
          {/* Bride Details */}
          <div className="w-full text-left mb-1">
            <span className="text-[13px] md:text-xs font-bold text-[#8A151B]">परम स्नेही स्वजन,</span>
          </div>
          <p className="text-[12px] md:text-[10px] font-semibold leading-snug mb-3 text-[#8A151B]">
            परमपिता परमेश्वर एवं पित्रों की असीम अनुकम्पा से<br/>
            स्व० श्रीमती कलावती देवी एवं श्री कन्हैया लाल<br/>
            अपनी प्रिय सुपौत्री
          </p>
          <h2 className="font-noto text-[40px] md:text-3xl font-black text-[#8A151B] mb-0.5">आयु. निधि</h2>
          <p className="text-[12px] md:text-[9px] leading-tight font-semibold mb-1">
            सुपुत्री श्रीमती बबिता सिंह एवं <br/>श्री ओम प्रकाश सिंह
          </p>
          
          {/* Hands & Sang */}
          <div className="text-[18px] font-bold text-[#8A151B] mt-2 mb-1">संग</div>
          <img 
            src="/hand.png" 
            alt="Hands joined" 
            style={{ width: "70%", height: "70px", objectFit: "fill" }}
            className="drop-shadow-sm mb-6" 
          />

          {/* Groom Details (Moved inside the center column!) */}
          <h2 className="font-noto text-[40px] md:text-3xl font-black text-[#8A151B] mt-1 mb-0.5">चि. प्रतीक</h2>
          <p className="text-[12px] md:text-[10px] leading-tight font-semibold mb-1">
            सुपौत्र श्रीमती अद्यावती वर्मा एवं <br/>श्री प्रेम चंद वर्मा<br/>
            सुपुत्र श्रीमती पुष्पा वर्मा एवं <br/> श्री अरविन्द वर्मा<br/>
            महुआडार, उरूआ बाजार, गोरखपुर <br/> (उत्तर प्रदेश)
          </p>
          <div className="text-[12px] font-bold mb-1 text-[#8A151B] my-1">के</div>

        </div>

        {/* RIGHT COLUMN: Dulha (Groom) Image - Now Sticky */}
        <div className="w-[22%] h-[140px] md:h-[180px] sticky top-1/2 -translate-y-1/2 flex flex-col justify-end items-center">
          <img 
            src="/dulha.png" 
            alt="Groom" 
            className="w-full max-w-[90px] h-auto object-contain drop-shadow-md -scale-x-100" 
          />
        </div>

      </div>
      
      
      {/* STEP 7: Formal Invitation Outro & Floral Motifs */}
      <div><div className="flex flex-col items-center justify-center text-[#8A151B] mt-1 mb-2 px-2 text-center z-10 relative">
        
        {/* Title with Swastikas */}
        <h3 className="text-[25px] md:text-2xl font-black mb-3 flex items-center justify-center gap-2 w-full text-[#8A151B]">
          <img src="/swastik.png" alt="Swastik" className="w-14 h-14 object-contain" />
          <span className="">शुभ परिणय सूत्रबंधन</span>
          <img src="/swastik.png" alt="Swastik" className="w-14 h-14 object-contain" />
        </h3>
        
        {/* Welcoming Paragraph */}
        <p className="text-[12px] md:text-xs font-semibold leading-relaxed max-w-[320px] mx-auto mb-4">
          की मधुर मंगलमयी बेला पर आपको सादर आमंत्रित करते है।<br/>
          कृपया आप पधारकर नवजीवन पथ पर अग्रसर नवयुगल को अपने<br/>
          स्नेहिल शुभाशीष से अभिसिंचित कर हमें अनुगृहित करें।
        </p>
        
        {/* Three Floral Motifs from the image */}
        <div className="flex items-center justify-center gap-3 text-lg md:text-xl text-[#6A0D15]">
          <span>❁</span>
          <span>❁</span>
          <span>❁</span>
        </div>
        
      </div>
      </div>

      {/* STEP 8: Family Details */}
          <div className="w-full mt-4 mb-3 px-2 text-[#8A151B]">
            
            {/* 2-Column Split for Family Names */}
            <div className="flex justify-between items-start w-full gap-2">
              
              {/* LEFT SIDE: Darshanabhilashi */}
              <div className="w-1/2 text-left">
                <h4 className="text-l text-[15px] md:text-sm font-bold mb-1">स्वागतेच्छुक:</h4>
                <p className="text-[11px] md:text-[11px] font-semibold leading-snug">
                  गुलाब, गुलजार, सचिन,<br/>
                  शिवम सिंह, शुभम, सत्यम<br/>
                  एवं समस्त सम्बन्धी व मित्रगण
                </p>
              </div>

              {/* RIGHT SIDE: Vinit */}
              <div className="w-1/2 text-right">
                <h4 className="text-l text-[15px] md:text-sm font-bold mb-1">विनीत:</h4>
                <p className="text-[11px] md:text-[11px] font-semibold leading-snug">
                  जय प्रकाश सिंह, ओम प्रकाश सिंह,<br/>
                  संजीव कुमार सिंह, सूरज कुमार सिंह,<br/>
                  पता- धानापुर, पनियरा, राजातालाब,<br/>
                  वाराणसी (उत्तर प्रदेश)
                </p>
              </div>

            </div>

            {/* Centered Mobile Numbers */}
            <div className="w-full text-center mt-5">
              <p className="text-[12px] md:text-xs font-bold tracking-wide">
                मोबाईल: 9997772083, 9557315660
              </p>
            </div>
            
          </div>

      { /* STEP 9: Footer with Additional requests */ }
      <div className="fixed bottom-0 left-0 w-full h-[14vh] bg-[#8A151B] text-[#FFDF4F] px-6 z-50 flex justify-between items-center shadow-[0_-10px_20px_rgba(138,21,27,0.2)]">
          <div className="w-full flex items-center justify-between mt-8 mb-4 px-1">
        
        {/* Left Tabla */}
        <img 
          src="/tabla.png" 
          alt="Tabla" 
          className="w-[15%] h-auto object-contain drop-shadow-md transform scale-x-[-1]" 
      
        />

        {/* Center Quote Box */}
        <div className="w-[80%] border-2 border-yellow-400 rounded-[30px] py-4 px-4 text-center bg-[#8A151B]/5 backdrop-blur-sm">
          <p className="font-bold text-[11px]  leading-relaxed mb-1.5 text-yellow-400">
            आशीर्वाद से आपके नए सफ़र को है सजाना,<br />
            मेरी दीदी के शादी में आप सपरिवार आना ।
          </p>
          <p className="text-[9px] font-semibold -text-yellow-300">
            सुनिधि, आराध्या, अनिरुद्ध, समीक्षा, आकृति, सान्वी 
          </p>
        </div>

        {/* Right Tabla (Flipped for symmetry) */}
        <img 
          src="/tabla.png" 
          alt="Tabla" 
          className="w-[15%] h-auto object-contain drop-shadow-md transform scale-x-[-1]" />    
        
      </div>
      </div>
     
      {/*  Horizontal Divider */}
      <div className="w-full mb-[2vh] flex justify-center px-4">
        <svg 
          viewBox="0 0 600 24" 
          className="w-full max-w-[380px] drop-shadow-sm opacity-90" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Line with Taper */}
          <path d="M0,11 L210,11 L225,12 L210,13 L0,13 Z" fill="#8A151B" />
          
          {/* Left Small Diamond */}
          <polygon points="232,12 240,7 248,12 240,17" fill="#8A151B" />
          
          {/* Left Hollow Leaf */}
          <path d="M285,12 C285,1 255,1 255,12 C255,23 285,23 285,12 Z M278,12 C278,6 265,6 265,12 C265,18 278,18 278,12 Z" fill="#8A151B" fillRule="evenodd" />
          
          {/* Center Diamond */}
          <polygon points="300,3 310,12 300,21 290,12" fill="#8A151B" />
          
          {/* Right Hollow Leaf */}
          <path d="M315,12 C315,1 345,1 345,12 C345,23 315,23 315,12 Z M322,12 C322,6 335,6 335,12 C335,18 322,18 322,12 Z" fill="#8A151B" fillRule="evenodd" />
          
          {/* Right Small Diamond */}
          <polygon points="368,12 360,7 352,12 360,17" fill="#8A151B" />
          
          {/* Right Line with Taper */}
          <path d="M600,11 L390,11 L375,12 L390,13 L600,13 Z" fill="#8A151B" />
        </svg>
      </div>

      {/* Floating Music Button */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-[16vh] right-4 z-50 flex items-center gap-2 bg-[#8A151B] text-[#8A151B] px-3 py-1.5 rounded-full text-xs font-bold shadow-md opacity-65 hover:opacity-100 transition-all active:scale-95"
      >
        <span>{isAudioPlaying ? "🔊" : "🔇"}</span>
      </button>

      {/* Back Button Popup */}
      {/* BACK BUTTON POPUP MODAL */}
  <AnimatePresence>
    {showBackPopup && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-[#7E1627] border-2 border-[#FFD700] rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl text-white"
        >
          <h3 className="font-yatra text-2xl font-bold mb-3 text-[#FFD700]">
            "आप आओगेना?"
          </h3>
          <p className="font-tiro text-sm mb-6 text-white/90">
            हम आपकी प्रतीक्षा कर रहे हैं!
          </p>
          
          <div className="flex justify-center gap-4">
            {/* Stay button */}
            <button
              onClick={() => {setShowBackPopup(false);
                window.history.go(-2);}}
              className="bg-[#FFD700] text-[#8A151B] font-bold px-5 py-2 rounded-full text-sm shadow-md active:scale-95 transition"
            >
              ज़रूर आएँगे! ❤️
            </button>            
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>


























        </main>
      )}
    </div>
  );
}
