import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  MapPin, 
  Users, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Languages, 
  FileText, 
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  User,
  Phone,
  MessageSquare,
  Home,
  Navigation,
  Plus,
  Trash2,
  Edit2,
  Save,
  LogOut,
  LogIn,
  RefreshCw,
  Lock,
  Mail,
  Database
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth, signInWithGoogle, signInWithEmail, logout } from './lib/firebase';

// --- Static Images for Production Build Safety ---
import myNewLogo from './assets/images/my_new_logo.png';
import step01Image from './assets/images/step_01_consultation_1778992922018.png';
import step02Image from './assets/images/step_02_documents_1778992939855.png';
import step03Image from './assets/images/step_03_video_call_1778992954343.png';
import step04Image from './assets/images/step_04_airport_1778992969570.png';
import step05Image from './assets/images/step_05_date_1778992985425.png';
import step06Image from './assets/images/step_06_engagement_1778993004913.png';
import step07Image from './assets/images/step_07_legal_signing_1778993019644.png';
import step08Image from './assets/images/step_08_korean_registration_1778993037071.png';
import step09Image from './assets/images/step_09_study_korean_1778993056539.png';
import step10Image from './assets/images/step_10_incheon_arrival_1778993076481.png';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const ENV_GOOGLE_FORM_URL =
  (import.meta as any).env?.VITE_GOOGLE_FORM_URL ||
  (globalThis as any).VITE_GOOGLE_FORM_URL ||
  '';

const ENV_KAKAO_CH_URL =
  (import.meta as any).env?.VITE_KAKAO_CH_URL ||
  (globalThis as any).VITE_KAKAO_CH_URL ||
  '';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// --- Components ---

// --- State Management ---
type View = 'home' | 'philosophy' | 'process' | 'candidates' | 'costs' | 'infrastructure' | 'reviews' | 'admin';

// --- Transparent Image Component for White Backgrounds ---
interface TransparentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  threshold?: number;
  alt?: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

const TransparentImage = ({ src, threshold = 240, className, ...props }: TransparentImageProps) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    let active = true;
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If the pixel is close to pure white, make it transparent
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0; // alpha = 0
          }
        }
        ctx.putImageData(imgData, 0, 0);
        if (active) {
          setProcessedSrc(canvas.toDataURL());
        }
      } catch (e) {
        console.error("Failed to process image transparency: ", e);
        if (active) {
          setProcessedSrc(src);
        }
      }
    };
    img.onerror = () => {
      if (active) {
        setProcessedSrc(src);
      }
    };
    img.src = src;

    return () => {
      active = false;
    };
  }, [src, threshold]);

  return <img src={processedSrc} className={className} {...props} />;
};

const Header = ({ 
  currentView, 
  onNavigate, 
  user, 
  openLoginModal 
}: { 
  currentView: View, 
  onNavigate: (view: View) => void, 
  user: any, 
  openLoginModal: () => void 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: View, scrollToContact = false) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    if (scrollToContact) {
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || currentView !== 'home' ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => handleNav('home')}>
          <TransparentImage 
            src={myNewLogo} 
            alt="새마음국제결혼 CI" 
            className="h-10 md:h-12 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-2xl font-black text-emerald-800 tracking-tight">
            새마음 <span className="text-slate-500 font-medium text-lg">국제결혼</span>
          </span>
        </div>
        
        <nav className="hidden lg:flex items-center lg:space-x-5 xl:space-x-8 text-sm xl:text-base font-semibold text-slate-600 whitespace-nowrap">
          <button onClick={() => handleNav('philosophy')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'philosophy' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>새마음 이야기</button>
          <button onClick={() => handleNav('candidates')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'candidates' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>반려자 소개</button>
          <button onClick={() => handleNav('reviews')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'reviews' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>성혼 후기</button>
          <button onClick={() => handleNav('process')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'process' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>안심 동행 과정</button>
          <button onClick={() => handleNav('costs')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'costs' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>비용 상세 내역</button>
          <button onClick={() => handleNav('infrastructure')} className={`hover:text-emerald-800 transition whitespace-nowrap ${currentView === 'infrastructure' ? 'text-emerald-800 underline underline-offset-8' : ''}`}>직영 인프라</button>
          {user && (
            <button onClick={() => handleNav('admin')} className={`hover:text-amber-600 text-amber-700 transition whitespace-nowrap font-black flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200/50 ${currentView === 'admin' ? 'bg-amber-100 ring-2 ring-amber-200' : ''}`}>
              <ShieldCheck size={14} />
              <span>관리자 설정</span>
            </button>
          )}
        </nav>

        <div className="hidden lg:flex items-center space-x-4 whitespace-nowrap">
          {!user && (
            <button 
              onClick={openLoginModal}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200/50 hover:bg-slate-50 cursor-pointer"
            >
              <Lock size={12} />
              <span>관리자 로그인</span>
            </button>
          )}
          <button 
            onClick={() => handleNav('home', true)}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition shadow-sm cursor-pointer"
          >
            문의 및 신청
          </button>
        </div>

        <button 
          className="lg:hidden text-slate-900 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 lg:hidden shadow-xl"
          >
            <nav className="flex flex-col space-y-4 text-base font-semibold text-slate-600">
              <button onClick={() => handleNav('philosophy')} className="text-left py-2 hover:text-emerald-800 transition">새마음 이야기</button>
              <button onClick={() => handleNav('candidates')} className="text-left py-2 hover:text-emerald-800 transition">반려자 소개</button>
              <button onClick={() => handleNav('reviews')} className="text-left py-2 hover:text-emerald-800 transition">성혼 후기</button>
              <button onClick={() => handleNav('process')} className="text-left py-2 hover:text-emerald-800 transition">안심 동행 과정</button>
              <button onClick={() => handleNav('costs')} className="text-left py-2 hover:text-emerald-800 transition">비용 상세 내역</button>
              <button onClick={() => handleNav('infrastructure')} className="text-left py-2 hover:text-emerald-800 transition">직영 인프라</button>
              {user ? (
                <button onClick={() => handleNav('admin')} className="text-left py-2 text-amber-700 font-bold flex items-center gap-1.5 justify-start">
                  <ShieldCheck size={16} />
                  <span>관리자 설정</span>
                </button>
              ) : (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); openLoginModal(); }}
                  className="text-left py-2 text-slate-400 font-bold flex items-center gap-1.5 justify-start"
                >
                  <Lock size={16} />
                  <span>관리자 로그인</span>
                </button>
              )}
              <button onClick={() => handleNav('home')} className="text-left py-2 hover:text-emerald-800 transition">홈으로</button>
              <button 
                onClick={() => handleNav('home', true)}
                className="bg-emerald-800 text-white px-6 py-3 rounded-xl text-center font-bold"
              >
                무료 상담 신청
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const PhilosophyStory = ({ onNavigate }: { onNavigate: (view: View, scrollToContact?: boolean) => void }) => {
  return (
    <div className="bg-slate-50">
      {/* Philosophy Hero */}
      <section className="relative pt-48 pb-24 bg-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -z-10 translate-x-1/4 skew-x-6"></div>
        <div className="max-w-4xl mx-auto px-6 text-center lg:text-left lg:mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-6 inline-block">
              Philosophy
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              새마음 이야기
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-slate-600 leading-relaxed italic">
              "늦장가가 아닙니다. 새 마음으로 시작하는 새 인생입니다."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Greeting Letter */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-12 text-slate-800"
          >
            <div className="border-l-4 border-emerald-700 pl-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
                  '새마음' 인사말
                </h2>
                <p className="text-slate-500 text-lg font-bold whitespace-normal">"이제 남은 인생은 '나의 행복'으로 가득 채우고 싶은 당신에게."</p>
              </div>
              <div className="hidden md:block">
                <TransparentImage 
                  src={myNewLogo} 
                  alt="새마음국제결혼 CI" 
                  className="h-72 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-8 text-lg leading-relaxed font-medium">
              <p>그동안 정말 열심히 살아오셨습니다.</p>
              <p>앞만 보고 달리며 사회에서 책임을 다하고, 가족을 부양하느라 정작 자신을 돌볼 시간은 없으셨을 줄 압니다. 늦은 저녁, 불 꺼진 차가운 집 문을 열고 들어설 때 밀려오는 고단함과 외로움을 그 누구보다 잘 알고 있습니다.</p>
              <p>주변에서는 '늦장가'라며 걱정 어린 시선을 보낼지도 모릅니다. 국제결혼을 고민하면서도 '혹시나 속지 않을까', '이상한 사람을 만나 상처받지 않을까' 밤잠을 설치며 망설이셨을 것입니다.</p>
              
              <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 my-10">
                <p className="text-emerald-900 font-bold mb-4 italic">제가 [새마음 국제결혼]을 시작한 이유가 바로 여기에 있습니다.</p>
                <p>과거 대한민국을 깨웠던 새마을운동이 "우리도 한번 잘 살아보세"라는 순수한 열정이었다면, 저희가 제창하는 '새마음운동'은 홀로 외로웠던 남성들에게 <span className="text-emerald-700 font-black">"우리도 한번 행복하게 잘 살아보세"</span>라는 인생의 새벽을 열어드리는 일입니다.</p>
              </div>

              <p>저희는 화려한 겉치레로 고객을 현혹하지 않습니다. 저희가 가진 자본과 우즈베키스탄 현지의 직영 인프라는 그 어떤 대형 업체보다 단단하고 정직합니다.</p>
              <p>돈으로 신부를 사는 구시대적인 중개는 하지 않겠습니다. 당신이 평생 흘린 땀방울의 가치를 존중하며, 그에 걸맞은 현숙하고 순수한 반려자를 찾아 인생의 제2막을 안전하게 동행하겠습니다.</p>
              <p>새 마음을 먹는 순간, 새로운 인생이 시작됩니다. 그 위대한 도전에 새마음이 언제나 함께하겠습니다.</p>
            </div>

            <div className="pt-12 text-right">
              <p className="text-2xl font-black text-slate-900">새마음 올림</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
               새마음의 3대 브랜드 철학
             </h2>
             <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">
               새마음국제결혼은 세 가지 순수한 약속을 바탕으로 운영됩니다. 눈앞의 이익보다 고객의 남은 인생의 행복이 저희의 유일한 이정표입니다.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6"
            >
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                1. 인생 후반전을 위한 '새마음운동' (Life Shift)
              </h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                과거의 삶이 '생존과 책임'이었다면, 앞으로의 삶은 '반려와 행복'이어야 합니다. 4050 남성들이 국제결혼을 부끄러워하거나 위축되지 않도록, 당당한 '인생 제2막의 개척자'로 서실 수 있도록 심리적 여정부터 성혼 후 안착까지 전 과정을 가족의 마음으로 보살핍니다.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                2. 조건을 뛰어넘는 '반려자'의 가치 (Purity First)
              </h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                우리가 만날 우즈베키스탄의 소중한 반려자분들은 화려한 스펙이나 물질적 조건보다, 남편을 공경하고 가족을 소중히 여기는 유교적 가치관과 수수한 인성을 가진 여성들입니다. 외모만 강조하는 자극적인 프로필은 배제하고, 현지 지사에서 직접 면담하고 신원을 검증한 '소중한 반려자'만을 매칭하여 깨어지지 않는 단단한 가정을 만듭니다.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                3. 투명한 경영과 단단한 현지 인프라 (Transparent Trust)
              </h3>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                화려한 강남의 대형 사무실 유지비 등 불필요한 거품을 과감히 걷어내고, 오직 '우즈베키스탄 현지 직영 지사 운영'과 '정밀한 신원 검증'에만 모든 역량을 집중합니다. 시작 비용은 낮추되 여성의 수준과 안전성은 최고를 유지합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA in Philosophy */}
      <section className="py-24 bg-emerald-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 leading-tight">
            당신의 새로운 인생 제2막,<br />
            이제는 행복해질 시간입니다.
          </h2>
          <button 
            onClick={() => onNavigate('home', true)}
            className="inline-flex items-center bg-white text-emerald-900 px-10 py-5 rounded-full font-black text-lg hover:bg-slate-50 transition shadow-xl"
          >
            새마음과 함께 시작하기
            <ArrowRight className="ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
};

const MOCK_CANDIDATES = [
  { id: 'mock-1', age: 22, region: "타슈켄트", photo: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400", occupation: "학생", description: "밝고 긍정적인 성격으로 한국 문화에 관심이 많습니다." },
  { id: 'mock-2', age: 25, region: "나만간", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400", occupation: "간호사", description: "현지 병원에서 근무 중이며 배려심이 깊은 성격입니다." },
  { id: 'mock-3', age: 24, region: "페르가나", photo: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400", occupation: "회계원", description: "꼼꼼하고 성실하며 한국 생활에 대한 기대가 큽니다." },
  { id: 'mock-4', age: 21, region: "부하라", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400", occupation: "대학생", description: "매사 적극적이고 성격이 활달하여 적응력이 좋습니다." },
  { id: 'mock-5', age: 28, region: "타슈켄트", photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=400", occupation: "강사", description: "지적인 분위기의 반려자로 한국어를 열심히 공부 중입니다." },
  { id: 'mock-6', age: 23, region: "사마르칸트", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400", occupation: "요리사", description: "음식 솜씨가 좋으며 가정적인 반려자를 꿈꿉니다." },
];

const CandidateIntroduction = ({ 
  onNavigate,
  user,
  isAdminMode,
  setIsAdminMode,
  openLoginModal
}: { 
  onNavigate: (view: View, scrollToContact?: boolean) => void;
  user: FirebaseUser | null;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  openLoginModal: () => void;
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Local playhouse/sandboxing state
  const [localCandidates, setLocalCandidates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('local_candidates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localDeletes, setLocalDeletes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('local_deletes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localEdits, setLocalEdits] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('local_edits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Form State
  const [formData, setFormData] = useState({
    age: 20,
    region: '',
    photo: '',
    occupation: '',
    description: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'candidates'), orderBy('updatedAt', 'desc'));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidates(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'candidates');
      setLoading(false);
    });

    return () => {
      unsubscribeData();
    };
  }, []);

  const baseCandidates = candidates.length > 0 ? candidates : MOCK_CANDIDATES;
  const isUsingMock = candidates.length === 0;

  // Merge Firestore-derived (or Mock-derived) candidates with local sandbox modifications
  const displayCandidates = [
    ...localCandidates.filter(item => !localDeletes.includes(item.id)),
    ...baseCandidates
      .filter(item => !localDeletes.includes(item.id))
      .map(item => {
        if (localEdits[item.id]) {
          return { ...item, ...localEdits[item.id] };
        }
        return item;
      })
  ];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      age: Number(formData.age),
      updatedAt: { seconds: Math.floor(Date.now() / 1000) }
    };

    try {
      if (editingCandidate && !editingCandidate.id.startsWith('mock-') && !editingCandidate.id.startsWith('local-')) {
        // Explicitly updating an online Firestore candidate
        const docData = {
          ...formData,
          age: Number(formData.age),
          updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, 'candidates', editingCandidate.id), docData);
        // Clear local override if previous failed attempt lay around
        const updatedEdits = { ...localEdits };
        delete updatedEdits[editingCandidate.id];
        setLocalEdits(updatedEdits);
        localStorage.setItem('local_edits', JSON.stringify(updatedEdits));
      } else if (editingCandidate && (editingCandidate.id.startsWith('mock-') || editingCandidate.id.startsWith('local-'))) {
        // Editing mock or local candidate -> Update local state directly
        if (editingCandidate.id.startsWith('mock-')) {
          const updatedEdits = { ...localEdits, [editingCandidate.id]: data };
          setLocalEdits(updatedEdits);
          localStorage.setItem('local_edits', JSON.stringify(updatedEdits));
        } else {
          const updatedCandidates = localCandidates.map(c => 
            c.id === editingCandidate.id ? { ...c, ...data } : c
          );
          setLocalCandidates(updatedCandidates);
          localStorage.setItem('local_candidates', JSON.stringify(updatedCandidates));
        }
      } else {
        // Registering a completely new candidate -> Try online db first
        const docData = {
          ...formData,
          age: Number(formData.age),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'candidates'), docData);
      }
      
      setIsModalOpen(false);
      setEditingCandidate(null);
      setFormData({ age: 20, region: '', photo: '', occupation: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, editingCandidate && !editingCandidate.id.startsWith('mock-') ? OperationType.UPDATE : OperationType.CREATE, 'candidates');
      
      // Fallback: Store locally in LocalStorage so the profile actually gets created/updated and never rolls back!
      if (editingCandidate) {
        if (editingCandidate.id.startsWith('local-')) {
          const updatedCandidates = localCandidates.map(c => 
            c.id === editingCandidate.id ? { ...c, ...data } : c
          );
          setLocalCandidates(updatedCandidates);
          localStorage.setItem('local_candidates', JSON.stringify(updatedCandidates));
        } else {
          const updatedEdits = { ...localEdits, [editingCandidate.id]: data };
          setLocalEdits(updatedEdits);
          localStorage.setItem('local_edits', JSON.stringify(updatedEdits));
        }
      } else {
        const newLocalCandidate = {
          ...data,
          id: `local-${Date.now()}`
        };
        const updatedCandidates = [newLocalCandidate, ...localCandidates];
        setLocalCandidates(updatedCandidates);
        localStorage.setItem('local_candidates', JSON.stringify(updatedCandidates));
      }

      alert("데이터베이스 수정 권한이 없습니다. 안전한 테스트를 위해 현재 브라우저(Local Storage)에 성공적으로 임시 등록되었습니다.");
      setIsModalOpen(false);
      setEditingCandidate(null);
      setFormData({ age: 20, region: '', photo: '', occupation: '', description: '' });
    }
  };

  const seedSampleData = async () => {
    if (!window.confirm("샘플 프로필 6인을 실제 관리 데이터로 등록하시겠습니까?")) return;
    try {
      for (const mock of MOCK_CANDIDATES) {
        const { id, ...data } = mock;
        await addDoc(collection(db, 'candidates'), { 
          ...data, 
          updatedAt: serverTimestamp() 
        });
      }
      alert("샘플 데이터가 성공적으로 등록 되었습니다.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'candidates');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 이 프로필을 삭제하시겠습니까?")) return;
    try {
      if (!id.startsWith('mock-') && !id.startsWith('local-')) {
        await deleteDoc(doc(db, 'candidates', id));
      }
      
      const updatedDeletes = [...localDeletes, id];
      setLocalDeletes(updatedDeletes);
      localStorage.setItem('local_deletes', JSON.stringify(updatedDeletes));

      if (id.startsWith('local-')) {
        const updatedCandidates = localCandidates.filter(c => c.id !== id);
        setLocalCandidates(updatedCandidates);
        localStorage.setItem('local_candidates', JSON.stringify(updatedCandidates));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'candidates');
      const updatedDeletes = [...localDeletes, id];
      setLocalDeletes(updatedDeletes);
      localStorage.setItem('local_deletes', JSON.stringify(updatedDeletes));

      alert("데이터베이스 권한이 없어 로컬 브라우저에서 안전하게 삭제/가리기 처리되었습니다.");
    }
  };

  const resetLocalOverride = () => {
    if (!window.confirm("로컬에서 추가/수정/삭제한 모든 테스트 데이터를 초기화하고 기본 디자인 상태로 복구하시겠습니까?")) return;
    localStorage.removeItem('local_candidates');
    localStorage.removeItem('local_deletes');
    localStorage.removeItem('local_edits');
    setLocalCandidates([]);
    setLocalDeletes([]);
    setLocalEdits({});
    alert("로컬 변경사항이 전부 정상적으로 초기화되었습니다.");
  };

  const openEditModal = (candidate: any) => {
    setEditingCandidate(candidate);
    setFormData({
      age: candidate.age,
      region: candidate.region,
      photo: candidate.photo,
      occupation: candidate.occupation,
      description: candidate.description || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-48 pb-20 bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-8">
              소중한 반려자 소개
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/80 font-medium max-w-3xl mx-auto leading-relaxed">
              우즈베키스탄 현지 지사에서 직접 신원을 확인하고 면담한 투명한 반려자 정보입니다.<br className="hidden sm:block" />
              국제결혼 관련 법규를 준수하여 상세 프로필은 상담 시 공개해 드립니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Legal Notice & Admin Trigger */}
      <section className="py-12 bg-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-amber-900 font-black text-lg mb-2">프라이버시 및 법률 준수 안내</p>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">
                성혼 사례가 아닌 현재 진행 중인 반려자분의 사진을 불특정 다수에게 공개하는 것은 국제결혼 중개업 관리법에 저촉될 수 있습니다. 
                이에 따라 신규 반려자의 이미지는 실루엣으로 처리하며, 정식 상담 신청 후 본사 및 지사 안내를 통해 상세 정보를 확인하실 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              {!user ? (
                <button 
                  onClick={openLoginModal}
                  className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-600 transition underline underline-offset-4 cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>관리자 로그인</span>
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsAdminMode(!isAdminMode)}
                      className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition"
                    >
                      {isAdminMode ? "편집 모드 종료" : "편집 모드 활성화"}
                    </button>
                    <button 
                      onClick={logout}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition"
                      title="로그아웃"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {isAdminMode && (
            <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => { setEditingCandidate(null); setFormData({ age: 20, region: '', photo: '', occupation: '', description: '' }); setIsModalOpen(true); }}
                className="flex items-center space-x-2 bg-emerald-800 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-900 transition-all transform hover:scale-105 animate-pulse"
              >
                <Plus size={20} />
                <span>새 반려자 프로필 추가</span>
              </button>
              
              {isUsingMock && (
                <button 
                  onClick={seedSampleData}
                  className="flex items-center space-x-2 bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-200 transition-all"
                >
                  <Navigation size={18} />
                  <span>샘플 6인 프로필 DB 등록</span>
                </button>
              )}

              <button 
                onClick={resetLocalOverride}
                className="flex items-center space-x-2 bg-rose-50 text-rose-700 hover:bg-rose-100 px-8 py-4 rounded-2xl font-bold border border-rose-100/50 transition-all cursor-pointer"
              >
                <RefreshCw size={18} />
                <span>테스트 데이터 초기화</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCandidates.map((candidate) => (
                <motion.div 
                  key={candidate.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Mock Label Overlay */}
                  {candidate.id.startsWith('mock-') && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200">Sample Data</span>
                    </div>
                  )}

                  {/* Admin Actions Overlay */}
                  {isAdminMode && (
                    <div className="absolute top-4 right-4 z-20 flex space-x-2">
                       <button 
                        onClick={() => openEditModal(candidate)}
                        className="p-3 bg-white/90 backdrop-blur-sm text-blue-600 rounded-2xl shadow-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                       >
                        <Edit2 size={18} />
                       </button>
                       {!candidate.id.startsWith('mock-') && (
                         <button 
                          onClick={() => handleDelete(candidate.id)}
                          className="p-3 bg-white/90 backdrop-blur-sm text-red-600 rounded-2xl shadow-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                         >
                          <Trash2 size={18} />
                         </button>
                       )}
                    </div>
                  )}

                  {/* Image Area */}
                  <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                    {user ? (
                      <img 
                        src={candidate.photo || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"} 
                        alt={`Candidate ${candidate.id}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 relative grayscale">
                         <User size={120} className="text-slate-300 opacity-50" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                         <div className="absolute inset-0 backdrop-blur-3xl opacity-20"></div>
                         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center">
                            <span className="text-white text-xs font-bold tracking-widest uppercase">Verified Partner</span>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 block">
                          Reg. Code: {candidate.id.startsWith('mock') ? candidate.id : candidate.id.slice(-6).toUpperCase()}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 truncate">{candidate.age}세 · {candidate.region}</h3>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-100 shrink-0">
                        {candidate.occupation}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                      {candidate.description || (user 
                        ? "밝고 긍정적인 성격으로 한국 문화에 관심이 많으며 배려심이 깊은 소중한 반려자입니다." 
                        : "현지 지사 심층 인터뷰 완료. 가족 중심적 사고와 성실함을 갖춘 반려자 후보입니다."
                      )}
                    </p>
                    <button 
                      onClick={() => onNavigate('home', true)}
                      className="w-full py-4 bg-slate-50 hover:bg-emerald-800 hover:text-white text-slate-900 text-sm font-bold rounded-2xl transition shadow-sm group/btn flex items-center justify-center"
                    >
                      상세 프로필 상담 요청
                      <ArrowRight className="ml-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-900">
                  {editingCandidate ? "프로필 수정" : "새 프로필 등록"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleApply} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">나이</label>
                    <input 
                      required
                      type="number" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">지역</label>
                    <input 
                      required
                      type="text" 
                      placeholder="예: 타슈켄트"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">직업</label>
                  <input 
                    required
                    type="text" 
                    placeholder="예: 대학생, 간호사 등"
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">사진 URL (Unsplash 등)</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://images.unsplash.com/..."
                    value={formData.photo}
                    onChange={(e) => setFormData({...formData, photo: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">한줄 소개/설명</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="반려자분의 성격이나 특징을 입력하세요."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition resize-none" 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-800 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-900 transition mt-4 flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>{editingCandidate ? "수정 사항 저장" : "새 프로필 게시"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Heart className="text-emerald-800 mx-auto mb-8 animate-pulse" size={48} />
          <h2 className="text-3xl font-black text-slate-900 mb-6 italic leading-tight">
            "조건이 아닌 진심을 봅니다"
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12">
            새마음은 단순히 만남을 주선하는 것에 그치지 않습니다.<br />
            서로의 문화를 존중하고 진심으로 아끼는 인연을 찾아 행복한 가정을 이루실 수 있도록 모든 과정을 동행합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button 
               onClick={() => onNavigate('home', true)}
               className="bg-emerald-800 text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-900 transition cursor-pointer"
             >
               1:1 무료 맞춤 상담
             </button>
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white text-slate-700 px-10 py-5 rounded-2xl font-black border border-slate-200 hover:bg-slate-50 transition">
               맨 위로 이동
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const CostDetails = () => {
  const costCategories = [
    {
      valueTitle: "새마음 첫걸음",
      phase: "1차 : 계약 및 진행",
      subtext: "(계약금)",
      amount: "0원",
      description: "인연의 시작을 위한 행정 및 매칭 준비 단계입니다.",
      items: [
        "전문 상담 및 성혼 컨설팅 비용",
        "우즈베키스탄 현지 반려자 리스트 제공",
        "한국측 구비 서류 번역 및 공증 대행",
        "전담 매니저 매칭 인터뷰 서비스"
      ],
      icon: <FileText size={20} className="text-amber-600" />
    },
    {
      valueTitle: "안심 1:1 동행",
      phase: "2차 : 출국 및 미팅",
      subtext: "(중도금)",
      amount: "0원",
      description: "현지로 출국하여 직접 인연을 확인하고 약혼하는 단계입니다.",
      items: [
        "왕복 항공권 및 현지 체류비 (숙박/식사)",
        "현지 미팅 장소 대관 및 가이드 비용",
        "전문 통역사 상시 배석 서비스",
        "약혼식 및 가족 모임 행사비"
      ],
      icon: <Users size={20} className="text-blue-600" />
    },
    {
      valueTitle: "새 출발 성혼",
      phase: "3차 : 성혼 및 비자",
      subtext: "(잔금)",
      amount: "0원",
      description: "법적 부부가 되고 한국으로 입국하기 위한 최종 단계입니다.",
      items: [
        "현지 정식 결혼식 행사비 총합",
        "신부 한국어 교육비 및 숙소 지원",
        "결혼이민 비자(F-6) 서류 접수 대행",
        "입국 후 사후 관리 및 정착 지원"
      ],
      icon: <ShieldCheck size={20} className="text-emerald-600" />
    }
  ];

  const costItems = [
    { category: "출국전 준비서류", details: "출국전 서류 번역, 공증비용" },
    { category: "항공료", details: "신랑의 출국 항공료" },
    { category: "현지 체류비", details: "현지 공항 픽업, 숙식 및 식사비, 차량 렌트비용, 통역비" },
    { category: "맞선 진행비", details: "맞선 장소비, 예비신부 교통비, 예비신부 식대비용" },
    { category: "처가집 방문", details: "처가집 방문" },
    { category: "결혼 비용", details: "예식장비, 하객 식사비(30명 기준), 피로연, 신부 드레스, 메이크업, 기타비용" },
    { category: "현지 서류 비용", details: "서류 번역공증, 인증서 발급비, 영사확인 수수료, 국제탁송비" },
    { category: "국내 서류 비용", details: "서류 번역공증 및 서류대행, 국제탁송비" },
    { category: "현지 지급 비용", details: "현지 진행비용, 인건비, 통신비, 광고비" },
    { category: "국내 지출 비용", details: "사무실 임대료, 인건비, 통신비, 광고비, 출장비, 간접비용" },
    { category: "신부 입국 항공", details: "신부 입국 항공비 미포함 (별도)", highlighted: true },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Cost Hero */}
      <section className="relative pt-48 pb-20 bg-white overflow-hidden border-b border-slate-100">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 -z-10 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full mb-8 inline-block">
              Transparent Pricing
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              비용 상세 내역 안내
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-3xl leading-relaxed">
              성혼을 위해 필요한 모든 행정 및 실무 비용을 투명하게 공개합니다.<br />
              새마음은 거품을 걷어낸 정직한 '단계별 분납 시스템'으로 운영됩니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Costs Grid (Schematic) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-3 mb-12 justify-center">
            <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
            <h3 className="text-3xl font-black text-slate-900">안심 단계별 분납 시스템</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {costCategories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 relative flex flex-col group"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                      {cat.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">Stage 0{idx + 1}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-emerald-600 font-black text-3xl mb-2 tracking-tight">
                    {cat.valueTitle}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 text-slate-400 font-black text-[15px] uppercase tracking-widest mb-1">
                      <span>{cat.phase.split(' : ')[0]}</span>
                      <span className="opacity-60">{cat.subtext}</span>
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {cat.phase.split(' : ')[1]}
                    </h3>
                  </div>
                </div>

                <div className="text-3xl font-black text-emerald-800 mb-6">{cat.amount}</div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 pb-6 border-b border-slate-50">
                  {cat.description}
                </p>
                
                <ul className="space-y-4 flex-1">
                  {cat.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start text-sm font-bold text-slate-600">
                      <CheckCircle2 size={16} className="mr-3 text-emerald-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Cost Table */}
      <section className="py-24 bg-slate-100/50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm"
          >
            <div className="p-8 sm:p-12">
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                <h3 className="text-2xl font-black text-slate-900">항목별 상세 구성 내역</h3>
              </div>
              
              <div className="space-y-0.5">
                {costItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col sm:flex-row py-6 border-b border-slate-50 last:border-0 ${item.highlighted ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="sm:w-1/3 mb-2 sm:mb-0">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-1">Category</span>
                      <span className={`text-base font-black ${item.highlighted ? 'text-emerald-800' : 'text-slate-900'}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="sm:w-2/3">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest block mb-1">Includes</span>
                      <p className={`text-sm font-bold leading-relaxed ${item.highlighted ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {item.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-800 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4">Total Marriage Fee</p>
            <h2 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter">
              0원 <span className="block sm:inline text-3xl sm:text-5xl text-emerald-400 ml-0 sm:ml-4 mt-2 sm:mt-0">(상담 요망)</span>
            </h2>
            <p className="text-slate-400 font-medium">※ 전체 소요 비용은 신부님의 조건과 진행 방식에 따라 차이가 발생할 수 있습니다.</p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 relative">
            <div className="absolute -top-6 left-10 w-12 h-12 bg-amber-200 text-amber-800 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText size={24} />
            </div>
            <h3 className="text-2xl font-black text-amber-900 mb-6 pl-16 sm:pl-0 sm:text-center sm:mt-4">꼭 확인해주세요! (필독 사항)</h3>
            
            <div className="space-y-6 text-sm font-semibold text-amber-800/80 leading-relaxed">
              <p className="flex items-start">
                <span className="w-6 h-6 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-[10px] mr-4 shrink-0 font-black">1</span>
                <span>상기 비용은 우즈베키스탄 평균치를 기준으로 하며, 진행 방식이나 특별 요청에 따라 소폭 변동될 수 있습니다.</span>
              </p>
              <p className="flex items-start">
                <span className="w-6 h-6 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-[10px] mr-4 shrink-0 font-black">2</span>
                <span>신부 예물(귀금속 등) 및 개인 용돈, 현지 관광 비용은 포함되어 있지 않으므로 상담 시 상세 안내를 받으시기 바랍니다.</span>
              </p>
              <p className="flex items-start">
                <span className="w-6 h-6 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-[10px] mr-4 shrink-0 font-black">3</span>
                <span>새마음은 '성혼 성공 기부금'이나 '추가 웃돈'을 요구하지 않는 정찰제 기반의 투명한 계약을 지향합니다.</span>
              </p>
              <p className="flex items-start">
                <span className="w-6 h-6 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-[10px] mr-4 shrink-0 font-black">4</span>
                <span>모든 비용은 각 단계가 완료된 시점에만 청구되며, 불필요한 선금을 강요하지 않습니다.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="py-24 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 leading-tight">
            내 상황에 맞는 정확한 견적이 궁금하신가요?
          </h2>
          <p className="text-emerald-100/60 font-medium mb-12 text-lg">
            지역, 나이, 희망 조건에 따라 상세 견적은 달라질 수 있습니다.<br />
            지금 바로 전문 매니저와 비용에 대한 솔직한 이야기를 나눠보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <a href="#contact" className="bg-white text-emerald-900 px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition">
               맞춤 견적 상담하기
             </a>
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-emerald-800 text-white px-10 py-5 rounded-2xl font-black border border-emerald-700 hover:bg-emerald-950 transition">
               위로 가기
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const SafeJourneyProcess = () => {
  const steps = [
    {
      title: "01. 상담 및 계약",
      description: "전문 매니저와의 1:1 상담을 통해 우즈베키스탄 국제결혼 절차 및 비용에 대해 상세히 안내받습니다. 신뢰를 바탕으로 정식 계약을 체결하고 인연을 위한 첫 발을 내딛습니다.",
      details: ["희망 배우자 스타일 파악", "범죄경력, 건강진단 등 기본 서류 안내", "정식 국제결혼 중개 계약 체결"],
      icon: <FileText size={24} />,
      image: step01Image
    },
    {
      title: "02. 서류 준비 및 번역",
      description: "우즈베키스탄 현지 혼인신고(ZAKS)에 필요한 한국측 서류를 준비합니다. 모든 서류는 공증 및 아포스티유/영사확인 절차를 거칩니다.",
      details: ["혼인관계증명서 등 기본 5종 서류", "영문 번역 및 공증 절차 진행", "현지 지사 서류 발송 및 검토"],
      icon: <Languages size={24} />,
      image: step02Image
    },
    {
      title: "03. 화상 미팅 (Pre-matching)",
      description: "현지 지사에서 신원이 검증된 반려자 후보분들과 한국에서 미리 화상 미팅을 진행합니다. 출국 전 서로의 호감을 확인하여 시간과 비용의 낭비를 최소화합니다.",
      details: ["전문 통역사 배석", "상호 프로필 교환 및 호감도 확인", "현장 미팅 후보자 최종 선정"],
      icon: <Users size={24} />,
      image: step03Image
    },
    {
      title: "04. 우즈베키스탄 출국",
      description: "최종 인연을 만나기 위해 우즈베키스탄 타슈켄트로 출국합니다. 현지 지사 직원이 공항 마중부터 모든 일정을 동행하며 케어합니다.",
      details: ["타슈켄트 공항 픽업 서비스", "현지 숙소 및 지사 인프라 이용", "전담 가이드 및 차량 배정"],
      icon: <MapPin size={24} />,
      image: step04Image
    },
    {
      title: "05. 현지 미팅 및 데이트",
      description: "화상으로 만났던 여성과 혹은 현지에서 추천받은 여성들과 직접 대면 미팅을 가집니다. 함께 시간을 보내며 서로의 진심을 확인하는 단계입니다.",
      details: ["1:1 심층 미팅 진행", "야외 데이트 및 현지 문화 체험", "여성 가족과의 만남 및 신뢰 구축"],
      icon: <Heart size={24} />,
      image: step05Image
    },
    {
      title: "06. 성혼 결정 및 약혼",
      description: "서로 인연임을 확신하면 성혼을 결정합니다. 양가 가족들의 축복 속에 우즈베키스탄 전통 약혼식 또는 간속한 가족 모임을 가집니다.",
      details: ["예물 및 전통 의상 준비", "양가 가족 합동 식사", "향후 정착 계획 논의"],
      icon: <CheckCircle2 size={24} />,
      image: step06Image
    },
    {
      title: "07. 현지 혼인신고 (ZAKS)",
      description: "우즈베키스탄 법률에 따른 정식 혼인신고를 진행합니다. 복잡한 행정 절차는 새마음 현지 지사에서 완벽하게 대행해 드립니다.",
      details: ["현지 구청(ZAKS) 서류 접수", "법적 부부 증명서 발급", "현지 결혼 증명서 번역 공증"],
      icon: <ShieldCheck size={24} />,
      image: step07Image
    },
    {
      title: "08. 한국 혼인신고",
      description: "현지 결혼 증명서를 바탕으로 한국 내에서도 법적인 부부가 됨을 등록합니다. 이 시점부터 배우자의 비자 신청 요건이 갖춰집니다.",
      details: ["구청 및 관련 기관 서류 제출", "가족관계등록부 기재 완료", "비자 신청을 위한 관계 소명 준비"],
      icon: <CheckCircle2 size={24} />,
      image: step08Image
    },
    {
      title: "09. 한국어 교육 및 비자 인터뷰",
      description: "신부는 법적 필수 요건인 한국어 기초 과정(세종학당 등)을 이수합니다. 이후 대사관 인터뷰를 통해 진정성을 증명하고 F-6 비자를 신청합니다.",
      details: ["한국어 교육 지원 및 관리", "결혼 이민 비자(F-6) 서류 구비", "영사 인터뷰 대비 교육"],
      icon: <Languages size={24} />,
      image: step09Image
    },
    {
      title: "10. 비자 발급 및 한국 입국",
      description: "모든 검증이 끝나고 비자가 발급되면 신부가 한국으로 입국합니다. 새마음은 입국 후 초기 정착까지 세심하게 관리해 드립니다.",
      details: ["한국행 항공권 예약 및 발송", "인천공항 마중 및 자택 이동", "초기 한국 생활 적응 가이드 당부"],
      icon: <ArrowRight size={24} />,
      image: step10Image
    }
  ];

  return (
    <div className="bg-white">
      {/* Process Hero */}
      <section className="relative pt-48 pb-20 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-400/30 px-4 py-1.5 rounded-full mb-8 inline-block">
              International Marriage Process
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8">
              안심 동행 과정
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              거짓 없이 투명하게 공개합니다. 새마음의 10단계 프로세스는 고객님의 안전과 성공적인 성혼을 위해 설계되었습니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps List */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative space-y-24">
            {/* Timeline Line */}
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-slate-100 hidden lg:block"></div>

            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col lg:flex-row items-center gap-12 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Icon Circle */}
                <div className="absolute left-8 lg:left-1/2 -translate-x-1/2 w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center z-10 shadow-lg text-emerald-700 hidden lg:flex">
                  {step.icon}
                </div>

                <div className="w-full lg:w-[calc(50%-4rem)] space-y-6">
                  <div className="inline-flex lg:hidden w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-3 pt-4">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start text-sm font-bold text-slate-500 relative group">
                        <CheckCircle2 size={16} className="mr-3 text-emerald-600 mt-0.5 shrink-0" />
                        {detail === "혼인관계증명서 등 기본 5종 서류" ? (
                          <div className="relative">
                            <span className="border-b border-dotted border-slate-400 cursor-help hover:text-emerald-800 transition-colors">
                              {detail}
                            </span>
                            <div className="absolute left-0 bottom-full mb-2 w-72 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none">
                              <p className="font-black text-emerald-400 mb-2">기본 5종 서류 안내</p>
                              <div className="space-y-1.5 font-medium text-slate-300">
                                <p>01 혼인관계증명서 (상세)</p>
                                <p>02 재직증명서 or 사업자등록증</p>
                                <p>03 소득증명원</p>
                                <p>04 건강진단서 (국제결혼용)</p>
                                <p>05 범죄사실증명원 (관할 경찰서 민원실)</p>
                                <p>06 여권사본 (사진면) 1부</p>
                              </div>
                              <div className="absolute top-full left-6 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1"></div>
                            </div>
                          </div>
                        ) : (
                          detail
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step Image */}
                <div className="w-full lg:w-[calc(50%-4rem)] h-80 bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden flex items-center justify-center shadow-md">
                   {step.image ? (
                     <img 
                       src={step.image} 
                       alt={step.title} 
                       className="w-full h-full object-cover"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="text-slate-200">
                        <div className="scale-[3] opacity-20">{step.icon}</div>
                     </div>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Footer Info */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex p-4 bg-emerald-50 rounded-3xl mb-8">
             <ShieldCheck size={48} className="text-emerald-700" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">성혼 이후에도 끝까지 책임집니다</h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12">
            입국 후 사후 관리는 국제결혼의 완성입니다. 비자 갱신, 조기 적응 지원서 작성, 자녀 교육 안내 등 배우자가 한국 사회의 일원으로 행복하게 살 수 있도록 지속적인 인연을 이어갑니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-left">
              <p className="font-bold text-slate-900 mb-2">행정 서류 지원</p>
              <p className="text-sm text-slate-500">외국인 등록증 발급 및 건강보험 가입 안내 등 행정 절차를 무상으로 지원합니다.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-left">
              <p className="font-bold text-slate-900 mb-2">갈등 중재 프로그램</p>
              <p className="text-sm text-slate-500">문화적 차이로 인한 초기의 갈등 발생 시 전문 통역사와 매니저가 중재에 나섭니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Hero = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden bg-gradient-to-b from-blue-100/60 via-amber-50/40 to-slate-50">
      <div className="absolute top-1/4 left-10 w-24 h-12 bg-white/40 blur-xl rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-32 h-16 bg-white/40 blur-xl rounded-full animate-pulse opacity-70"></div>

      <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.2] mb-6">
            그동안 참 열심히<br className="sm:hidden" /> 살아오셨습니다.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            늦장가가 아닙니다. 새 마음으로 맞이하는 인생의 가장 따뜻한 제2막. 거품을 뺀 투명한 비용과 우즈베키스탄 현지 직영 인프라로 당신의 안전한 동행을 약속합니다.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <a 
            href="#contact" 
            className="w-full sm:w-auto bg-emerald-800 text-white text-base font-bold px-8 py-4 rounded-full hover:bg-emerald-950 transition shadow-lg shadow-emerald-900/10 text-center flex items-center justify-center group"
          >
            새마음 무료 상담 신청하기
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </a>
          <button 
            onClick={() => onNavigate('process')}
            className="w-full sm:w-auto bg-white text-slate-700 text-base font-semibold px-8 py-4 rounded-full border border-slate-200 hover:bg-slate-50 transition text-center cursor-pointer"
          >
            동행 과정 알아보기
          </button>
        </motion.div>

        {/* Quick Access (바로가기) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          <button 
            onClick={() => onNavigate('reviews')}
            className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center space-y-3 group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition">
              <Heart size={24} />
            </div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">성혼후기 바로가기</span>
          </button>
          <button 
            onClick={() => onNavigate('candidates')}
            className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center space-y-3 group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition">
              <Users size={24} />
            </div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">반려자 소개</span>
          </button>
          <button 
            onClick={() => onNavigate('costs')}
            className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center space-y-3 group"
          >
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition">
              <FileText size={24} />
            </div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">비용 투명 공개</span>
          </button>
          <button 
             onClick={() => {
               document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
             }}
            className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center space-y-3 group"
          >
            <div className="p-3 bg-emerald-900 text-white rounded-xl group-hover:scale-110 transition">
              <MapPin size={24} />
            </div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">전국 출장 상담</span>
          </button>
        </motion.div>

        {/* Verification Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-left"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="text-xs text-slate-400 font-medium pl-2 uppercase tracking-wide">Secure Matching System v1.0</span>
            </div>
            <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              현지 지사 실시간 연동
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors group cursor-default">
              <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center">
                <FileText size={12} className="mr-1" /> 01. 신원 검증
              </p>
              <p className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition">100% 서류 완료</p>
              <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                <CheckCircle2 size={12} className="mr-1" /> 무혼·학력 인증 완료
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors group cursor-default">
              <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center">
                <Users size={12} className="mr-1" /> 02. 매칭 방식
              </p>
              <p className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition">쌍방향 동의제</p>
              <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center">
                <CheckCircle2 size={12} className="mr-1" /> 여성도 신랑 프로필 동의
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors group cursor-default">
              <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center">
                <Clock size={12} className="mr-1" /> 03. 매칭 현황
              </p>
              <p className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition">실시간 매칭중</p>
              <div className="mt-2 text-xs text-blue-600 font-medium flex items-center">
                <MapPin size={12} className="mr-1" /> 타슈켄트 지사 연결됨
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PhilosophySection = () => {
  const [activeTab, setActiveTab] = useState<'man' | 'woman'>('man');

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            화려함 대신 순수함으로
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-12">
            조건보다 중요한 것은 '인성'입니다
          </h2>
        </motion.div>
        
        <div className="inline-flex p-1.5 bg-slate-100 rounded-full mb-12">
          <button 
            onClick={() => setActiveTab('man')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'man' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            한국 남성의 진심
          </button>
          <button 
            onClick={() => setActiveTab('woman')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeTab === 'woman' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            우즈벡 여성의 순수
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-slate-50 rounded-3xl border border-slate-100 p-8 sm:p-12 min-h-[350px] flex items-center justify-center relative shadow-inner">
          <AnimatePresence mode="wait">
            {activeTab === 'man' ? (
              <motion.div 
                key="man"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm text-emerald-700">
                  <Heart size={24} />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto italic">
                  "평생 일만 하느라 늦었습니다. 이제는 대접받기보다, 내 아내가 될 사람을 아끼고 존중하며 함께 늙어가고 싶습니다."
                </p>
                <p className="text-sm text-slate-500 font-medium">— 새마음 예비 회원들이 가장 많이 하시는 말씀</p>
              </motion.div>
            ) : (
              <motion.div 
                key="woman"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm text-blue-700">
                  <Languages size={24} />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-slate-800 leading-relaxed max-w-2xl mx-auto italic">
                  "가족을 소중히 여기고 부모를 공경하는 문화 속에서 자랐습니다. 한국어를 성실히 배워 남편의 고단함을 위로해 주는 현숙한 아내가 되고 싶습니다."
                </p>
                <p className="text-sm text-slate-500 font-medium">— 타슈켄트 지사에서 교육 중인 우즈벡 반려자분들의 마음가짐</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const StepsSection = ({ onNavigate }: { onNavigate: (view: View) => void }) => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            정직과 신뢰
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
            단계별 안심 분납 시스템
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mb-16">
            처음부터 무리한 큰돈을 요구하지 않습니다. 서로 확인하고 동의할 때만 비용이 발생하는 합리적인 유통 구조입니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-emerald-800 mb-2">01단계</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">새마음 첫걸음</h3>
              <p className="text-sm text-slate-500 mb-6">부담 없이 인연의 가능성을 열어보는 진입 단계입니다.</p>
              <div className="text-3xl font-black text-slate-900 mb-6 flex items-baseline">
                최소 가입비 <span className="text-sm font-medium text-slate-400 ml-2">/ 실비 중심</span>
              </div>
              <ul className="space-y-4 border-t border-slate-100 pt-6 text-sm text-slate-600 font-medium">
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span className="pl-3">남성 신원 인증 및 서류 검증</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span className="pl-3">1:1 맞춤 전담 매니저 배정</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span className="pl-3">우즈벡 현지 신원인증 반려자 리스트 열람</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onNavigate('candidates')}
              className="mt-8 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition flex items-center justify-center group cursor-pointer"
            >
              반려자 리스트 확인
              <ChevronRight className="ml-1 group-hover:translate-x-0.5 transition-transform" size={16} />
            </button>
          </motion.div>

          {/* Step 2 (Featured) */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="bg-white rounded-2xl border-2 border-blue-500 p-8 flex flex-col justify-between shadow-2xl relative scale-100 md:scale-105 z-10"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              가장 핵심 단계
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-blue-600 mb-2">02단계</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">안심 1:1 동행</h3>
              <p className="text-sm text-slate-500 mb-6">서로 마음에 드는 인연을 직접 화상으로 확인하는 단계입니다.</p>
              <div className="text-3xl font-black text-slate-900 mb-6 flex items-baseline">
                매칭 진행비 <span className="text-sm font-medium text-slate-400 ml-2">/ 미팅별 정산</span>
              </div>
              <ul className="space-y-4 border-t border-slate-100 pt-6 text-sm text-slate-600 font-medium">
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <span className="pl-3">서로 동의한 반려자 후보와 1:1 화상 미팅</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <span className="pl-3">현지 지사 상주 전문 통역관 지원</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <span className="pl-3 text-blue-700 font-bold">성혼 확정 전까지 추가 비용 제한</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onNavigate('process')}
              className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center group cursor-pointer"
            >
              화상 미팅 신청
              <ChevronRight className="ml-1 group-hover:translate-x-0.5 transition-transform" size={16} />
            </button>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-slate-500 mb-2">03단계</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">새 출발 성혼</h3>
              <p className="text-sm text-slate-500 mb-6">확실한 인연과 가정을 이루고 한국에 안착하는 최종 단계입니다.</p>
              <div className="text-3xl font-black text-slate-900 mb-6 flex items-baseline">
                성혼 잔금 <span className="text-sm font-medium text-slate-400 ml-2">/ 최종 완료 시</span>
              </div>
              <ul className="space-y-4 border-t border-slate-100 pt-6 text-sm text-slate-600 font-medium">
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="pl-3">우즈벡 정식 성혼 및 전통 결혼 절차</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="pl-3">대사관 비자 및 복잡한 서류 대행</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="pl-3">한국 입국 후 초기 정착 케어 프로그램</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onNavigate('process')}
              className="mt-8 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl transition flex items-center justify-center group cursor-pointer"
            >
              자세히 보기
              <ChevronRight className="ml-1 group-hover:translate-x-0.5 transition-transform" size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Contact Section (문의 및 신청) ---
const ContactSection = ({ 
  onGoogleClick, 
  onKakaoClick, 
  isGoogleFormConfigured, 
  isKakaoChConfigured, 
  finalGoogleFormUrl, 
  finalKakaoChUrl 
}: {
  onGoogleClick: (e: React.MouseEvent) => void;
  onKakaoClick: (e: React.MouseEvent) => void;
  isGoogleFormConfigured: boolean;
  isKakaoChConfigured: boolean;
  finalGoogleFormUrl: string;
  finalKakaoChUrl: string;
}) => {
  return (
    <section id="contact" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-emerald-700 font-bold tracking-widest uppercase text-sm mb-4 inline-block"
          >
            인연의 시작
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
          >
            가장 편안한 방법으로 문의해 주세요
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            새마음은 여러분의 용기 있는 첫걸음을 소중히 여깁니다.<br className="hidden md:block" />
            궁금하신 점은 언제든 편하게 물어보세요.
          </motion.p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: 빠른 전화 상담 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm mb-8">
                <Phone size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">빠른 전화 상담</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                글로 적기 복잡하시거나 빠르게 궁금증을 해결하고 싶으시다면 직통 번호로 연락 주십시오.
              </p>
            </div>
            <div>
              <a 
                href="tel:010-1234-5678" 
                className="block w-full py-5 bg-slate-900 text-white text-center font-black rounded-2xl hover:bg-slate-800 transition shadow-lg mb-4"
              >
                010-1234-5678
              </a>
              <p className="text-center text-xs text-slate-400 font-bold">
                평일/주말 오전 9시 ~ 오후 9시 가능
              </p>
            </div>
          </motion.div>

          {/* Card 2: 새마음 상세 신청서 (Highlight) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative bg-emerald-900 p-10 rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-emerald-900/20 hover:-translate-y-1 transition-all duration-300 ring-4 ring-emerald-900/10"
          >
            {/* Recommend Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg z-10 tracking-widest uppercase">
              Most Popular
            </div>

            <div>
              <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-100 shadow-inner mb-8">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">새마음 상세 신청서</h3>
              <p className="text-emerald-100/80 text-lg leading-relaxed mb-10">
                내 연령, 직업, 선호 스타일을 남겨주시면 서류 검토 후 맞춤형 대면 상담을 준비해 드립니다.
              </p>
            </div>
            <div>
              <a 
                href={isGoogleFormConfigured ? finalGoogleFormUrl : "#"}
                onClick={onGoogleClick}
                target={isGoogleFormConfigured ? "_blank" : undefined}
                rel={isGoogleFormConfigured ? "noreferrer" : undefined}
                className="block w-full py-5 bg-amber-400 text-amber-950 text-center font-black rounded-2xl hover:bg-amber-300 transition shadow-lg mb-4 cursor-pointer"
              >
                상담 신청서 작성하기
              </a>
              <p className="text-center text-xs text-emerald-100/50 font-bold">
                온라인 신청서 작성 (1분)
              </p>
            </div>
          </motion.div>

          {/* Card 3: 카카오톡 1:1 상담 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-yellow-500 shadow-sm mb-8">
                <MessageSquare size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">카카오톡 1:1 상담</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                주변 시선이나 전화 상담이 조금 조심스러우시다면, 카카오톡으로 언제든 편하게 톡 남겨주세요.
              </p>
            </div>
            <div>
              <a 
                href={isKakaoChConfigured ? finalKakaoChUrl : "#"}
                onClick={onKakaoClick}
                target={isKakaoChConfigured ? "_blank" : undefined}
                rel={isKakaoChConfigured ? "noreferrer" : undefined}
                className="block w-full py-5 bg-[#FEE500] text-slate-900 text-center font-black rounded-2xl hover:bg-[#FADA0A] transition shadow-lg mb-4 cursor-pointer"
              >
                카카오톡 상담하기
              </a>
              <p className="text-center text-xs text-slate-400 font-bold">
                24시간 접수 가능 (순차 답변)
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const Footer = ({ 
  onNavigate, 
  onPrivacyClick,
  onKakaoClick,
  isKakaoChConfigured,
  finalKakaoChUrl
}: { 
  onNavigate: (view: View) => void;
  onPrivacyClick?: () => void;
  onKakaoClick?: (e: React.MouseEvent) => void;
  isKakaoChConfigured?: boolean;
  finalKakaoChUrl?: string;
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 px-4 sm:px-0">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-2xl font-black text-white tracking-tight">새마음 <span className="text-slate-500 font-medium text-lg">국제결혼</span></span>
            <p className="max-w-sm font-medium leading-relaxed">
              우리는 단순한 중개를 하지 않습니다. 한 남성의 인생 후반전과 한 여성의 순수한 미래를 연결하는 정직한 다리가 되겠습니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">바로가기</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition text-left">메인으로</button></li>
              <li><button onClick={() => onNavigate('philosophy')} className="hover:text-white transition text-left">새마음 이야기</button></li>
              <li><button onClick={() => onNavigate('candidates')} className="hover:text-white transition text-left">반려자 소개</button></li>
              <li><button onClick={() => onNavigate('reviews')} className="hover:text-white transition text-left">성혼 후기</button></li>
              <li>
                <button 
                  onClick={(e) => { e.preventDefault(); onPrivacyClick?.(); }} 
                  className="hover:text-white transition text-left"
                >
                  개인정보 처리방침
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">연결하기</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <a 
                  href={isKakaoChConfigured ? finalKakaoChUrl : "#"} 
                  onClick={onKakaoClick}
                  target={isKakaoChConfigured ? "_blank" : undefined}
                  rel={isKakaoChConfigured ? "noreferrer" : undefined}
                  className="hover:text-white transition cursor-pointer"
                >
                  카카오톡 실시간 문의
                </a>
              </li>
              <li><a href="#" className="hover:text-white transition">네이버 블로그</a></li>
              <li><a href="#" className="hover:text-white transition">유튜브 채널</a></li>
              <li><a href="#" className="hover:text-white transition">1:1 익명 상담</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[11px] sm:text-xs">
          <div className="space-y-1.5 font-medium">
            <p>상호명: (주)새마음국제결혼 컨설팅 | 대표자: OOO | 사업자번호: 000-00-00000</p>
            <p>본사: 서울특별시 강남구 소재 비즈니스 센터 (지정 구역)</p>
            <p>우즈베키스탄 지사: 타슈켄트 직영 오피스 인프라 센터 (Tashkent City)</p>
          </div>
          <p className="text-slate-500 font-bold whitespace-normal">
            © 2026 새마음 국제결혼. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const Infrastructure = () => {
  const mapCenter = { lat: 41.2941, lng: 69.2737 }; // Near Nukus Street, Tashkent

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Infrastructure Hero */}
      <section className="relative pt-48 pb-20 bg-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mt-48"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-8">
              우즈베키스탄 직영 인프라
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100/80 font-medium max-w-3xl mx-auto leading-relaxed">
              새마음은 현지 업체를 쓰지 않습니다. 타슈켄트 중심부에 위치한 직영 지사에서<br />
              모든 만남과 교육, 행정 절차를 직접 관리하여 투명성과 안전성을 보장합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                <h3 className="text-3xl font-black text-slate-900">현지 지사 위치</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed italic">
                "타슈켄트 세종어학당 인근에 위치하여 신부님들의 교육 접근성이 뛰어나며,<br />
                철저한 한국어 교육과 신원 검증이 실시간으로 이루어집니다."
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-50 p-3 rounded-xl text-emerald-700">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">지사 주소</p>
                    <p className="text-sm text-slate-500">ст. Nukus, 29, Tashkent, Uzbekistan<br />(세종어학당 인근)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-700">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">운용 시간</p>
                    <p className="text-sm text-slate-500">현지 시간 09:00 - 18:00 (월~금)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              {!hasValidKey ? (
                <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center p-12 text-center">
                  <Navigation size={64} className="text-slate-400 mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Google Maps API Key Required</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm">
                    지도를 표시하기 위해서는 구글 맵 API 키 설정이 필요합니다. 
                    우측 상단 <strong>Settings → Secrets</strong>에 <code>GOOGLE_MAPS_PLATFORM_KEY</code>를 등록해주세요.
                  </p>
                  <a 
                    href="https://console.cloud.google.com/google/maps-apis/start" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition"
                  >
                    API 키 발급받기
                  </a>
                </div>
              ) : (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={mapCenter}
                    defaultZoom={15}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <AdvancedMarker position={mapCenter}>
                      <Pin background="#065f46" glyphColor="#fff" borderColor="#064e3b" />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Details */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">현지 지사 주요 기능</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-slate-50 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                <Languages size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">한국어 및 문화 교육</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                세종어학당 방식의 기초 한국어 교육과 한국 가정 문화 적응 교육을 상시 진행합니다.
              </p>
            </div>
            <div className="p-10 bg-slate-50 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">엄격한 신원 검증</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                현지 직원이 직접 가정 방문 및 이웃 평판 조사를 통해 검증된 반려자만을 추천합니다.
              </p>
            </div>
            <div className="p-10 bg-slate-50 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                <FileText size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">신속한 행정 처리</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                우즈벡 현지 혼인신고(ZAKS) 및 비자 서류 접수를 외부 대행사 없이 직접 처리합니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MOCK_REVIEWS = [
  { 
    id: "mock-1", 
    title: "우즈벡 지사에서의 특별한 인연", 
    content: "처음에는 긴장했지만 화상 미팅을 통해 본 진솔한 모습에 확신을 가졌습니다. 현지 지사 직원분들이 통역부터 문화 차이 설명까지 너무 세심하게 도와주셔서 큰 어려움 없이 진행할 수 있었습니다. 특히 신부님의 가족들을 만났을 때 보여주신 따뜻한 환대가 기억에 남습니다.", 
    author: "김XX", 
    date: "2024.03",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: "mock-2", 
    title: "투명한 비용 덕분에 안심했습니다", 
    content: "국제결혼을 고민하며 가장 걱정했던 부분이 비용이었는데, 새마음은 처음 상담 때 안내받은 비용 외에 추가금이 전혀 없었습니다. 단계별로 비용이 투명하게 관리되는 것을 보며 정말 신뢰할 수 있는 곳이라는 확신이 들었습니다. 다른 분들께도 적극 추천하고 싶습니다.", 
    author: "이XX", 
    date: "2024.02",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: "mock-3", 
    title: "행복한 가정을 꾸렸습니다", 
    content: "우즈베키스탄에서의 인연이 한국에서의 행복한 일상으로 이어지고 있습니다. 입국 후 적응 과정까지 세심하게 챙겨주시고 정기적으로 연락 주셔서 큰 힘이 되었습니다. 신부님도 한국어 공부를 열심히 하며 한국 생활에 잘 적응하고 있어 매일이 행복합니다.", 
    author: "박XX", 
    date: "2024.01",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800"
  }
];

const PRESET_IMAGES = [
  { name: "웨딩 마치 (클래식)", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" },
  { name: "기약하는 행복", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800" },
  { name: "맞잡은 두 손", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800" },
  { name: "로맨틱 선셋", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" }
];

const MarriageReviews = ({ 
  user, 
  isAdminMode, 
  setIsAdminMode 
}: { 
  user: FirebaseUser | null; 
  isAdminMode: boolean; 
  setIsAdminMode: (mode: boolean) => void;
}) => {
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [reviewForm, setReviewForm] = useState({
    title: '',
    author: '',
    content: '',
    presetImageIndex: 0,
    customImageUrl: ''
  });

  // Local Storage safety sandbox
  const [localReviews, setLocalReviews] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('local_reviews');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localDeletes, setLocalDeletes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('local_review_deletes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const baseReviews = reviews.length > 0 ? reviews : MOCK_REVIEWS;

  // Merge Firestore-derived (or Mock-derived) reviews with local dynamic mods
  const displayReviews = [
    ...localReviews.filter(r => !localDeletes.includes(r.id)),
    ...baseReviews.filter(r => !localDeletes.includes(r.id))
  ];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.content.trim() || !reviewForm.author.trim()) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    // PII Protection: Mask author name (e.g. 홍길동 -> 홍XX, 김철 -> 김X)
    const rawAuthor = reviewForm.author.trim();
    let maskedAuthor = rawAuthor;
    if (rawAuthor.length > 1 && !rawAuthor.includes('XX') && !rawAuthor.includes('X')) {
      if (rawAuthor.length >= 3) {
        maskedAuthor = rawAuthor[0] + 'XX';
      } else {
        maskedAuthor = rawAuthor[0] + 'X';
      }
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;
    const selectedImg = reviewForm.customImageUrl.trim() || PRESET_IMAGES[reviewForm.presetImageIndex].url;

    // Save payload structure
    const data = {
      title: reviewForm.title.trim(),
      content: reviewForm.content.trim(),
      author: maskedAuthor,
      date: dateStr,
      image: selectedImg,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };

    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'reviews'), docData);
      alert("성혼 후기가 데이터베이스에 정상 게재되었습니다!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
      
      // Local fallback
      const localId = `local-review-${Date.now()}`;
      const newLocalReview = {
        ...data,
        id: localId
      };
      const updatedLocals = [newLocalReview, ...localReviews];
      setLocalReviews(updatedLocals);
      localStorage.setItem('local_reviews', JSON.stringify(updatedLocals));

      alert("데이터베이스 권한이 없습니다. 테스트를 위해 현재 브라우저(Local Storage)에 안전하게 성공적으로 임시 게재되었습니다.");
    }

    // Clear form and modal
    setReviewForm({
      title: '',
      author: '',
      content: '',
      presetImageIndex: 0,
      customImageUrl: ''
    });
    setIsAddModalOpen(false);
  };

  const handleReviewDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("이 후기를 정말 삭제하시겠습니까?")) return;

    try {
      if (!id.startsWith('mock-') && !id.startsWith('local-review-')) {
        await deleteDoc(doc(db, 'reviews', id));
      }
      
      const updatedDeletes = [...localDeletes, id];
      setLocalDeletes(updatedDeletes);
      localStorage.setItem('local_review_deletes', JSON.stringify(updatedDeletes));

      if (id.startsWith('local-review-')) {
        const updatedLocals = localReviews.filter(r => r.id !== id);
        setLocalReviews(updatedLocals);
        localStorage.setItem('local_reviews', JSON.stringify(updatedLocals));
      }
      
      alert("후기가 안전하게 삭제되었습니다.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'reviews');
      
      const updatedDeletes = [...localDeletes, id];
      setLocalDeletes(updatedDeletes);
      localStorage.setItem('local_review_deletes', JSON.stringify(updatedDeletes));
      alert("데이터베이스 수정 권한이 부족하여 로컬 브라우저에서 안전하게 삭제/가리기 처리 완료되었습니다.");
    }
  };

  const resetLocalReviews = () => {
    if (!window.confirm("로컬에서 작성/삭제한 모든 성혼후기 데이터를 초기화하시겠습니까?")) return;
    localStorage.removeItem('local_reviews');
    localStorage.removeItem('local_review_deletes');
    setLocalReviews([]);
    setLocalDeletes([]);
    alert("성혼후기 데이터가 정상 복원되었습니다.");
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">성혼 후기</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            새마음을 통해 인연을 만나 아름다운 제2막을 함께하고 계시는 회원님들의 따뜻한 실제 성혼 스토리들을 전해드립니다.
          </p>
        </div>

        {/* Console / Action Hub for Admin Mode */}
        {user && (
          <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-emerald-800 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-900 transition-all transform hover:scale-105 animate-pulse cursor-pointer"
            >
              <Plus size={20} />
              <span>성혼 후기 작성하기</span>
            </button>

            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-bold transition-all border ${
                isAdminMode 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              <span>{isAdminMode ? "편집 완료" : "후기 편집/삭제 활성화"}</span>
            </button>

            {(localReviews.length > 0 || localDeletes.length > 0) && (
              <button 
                onClick={resetLocalReviews}
                className="flex items-center space-x-2 bg-rose-50 text-rose-700 hover:bg-rose-100 px-6 py-4 rounded-2xl font-bold border border-rose-100/50 transition-all cursor-pointer"
              >
                <RefreshCw size={18} />
                <span>로컬 데이터 초기화</span>
              </button>
            )}
          </div>
        )}

        {/* Display Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((review, index) => (
            <motion.div 
              key={review.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedReview(review)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative"
            >
              {isAdminMode && (
                <button 
                  onClick={(e) => handleReviewDelete(review.id, e)}
                  className="absolute top-4 right-4 z-10 p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
                  title="삭제하기"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                  <img 
                    src={review.image} 
                    alt={review.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-xs font-bold bg-emerald-800/80 px-3 py-1.5 rounded-full">상세 스토리 읽기</span>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
                    <Heart size={14} fill="currentColor" />
                    <span>사랑 가득 성혼 스토리</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {review.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                    {review.content}
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400 font-semibold gap-2">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {review.author?.[0] || '회'}
                  </span>
                  {review.author} 회원님
                </span>
                <span>{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReview(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <button 
                onClick={() => setSelectedReview(null)}
                className="absolute top-6 right-6 z-10 p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition"
              >
                <X size={18} />
              </button>

              <div className="aspect-video w-full bg-slate-100">
                <img 
                  src={selectedReview.image} 
                  alt={selectedReview.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
                    <Heart size={14} fill="currentColor" />
                    <span>사랑 가득 성혼 스토리</span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="text-slate-400">작성일: {selectedReview.date}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{selectedReview.title}</h3>
                </div>

                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl italic text-slate-700 text-sm sm:text-base leading-loose whitespace-pre-wrap select-text max-h-[220px] overflow-y-auto">
                  "{selectedReview.content}"
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black">
                      {selectedReview.author?.[0] || '회'}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{selectedReview.author} 회원님</p>
                      <p className="text-xs text-slate-400">새마음 성혼 패밀리</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedReview(null)}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Add Form Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl z-10 border border-slate-100 flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <Heart size={20} fill="currentColor" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">소중한 성혼 추억을 공유해주세요</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  새마음을 통한 행복한 가정을 이루신 이야기를 동료 회원님들과 나누실 수 있습니다.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1 hide-scrollbar">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider">후기 제목 *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="예: 타슈켄트에서의 생에 가장 따뜻한 만남" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider">작성자 명 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="예: 홍길동" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium"
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                    />
                    <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                      ※ PII 수집 최소화를 위해 '홍XX'와 같이 자동 마스킹 처리됩니다.
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider">작성 연월</label>
                    <input 
                      type="text" 
                      disabled
                      value="자동 입력 (오늘 일자 기준)" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-2 uppercase tracking-wider">성혼 후기 내용 *</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="우즈베키스탄에서의 특별했던 만남, 결혼 진행 및 현재 한국에서의 알콩달콩한 행복 생활 수기를 자유롭게 나눠주세요." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 leading-relaxed"
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 mb-2.5 uppercase tracking-wider">대표 이미지 설정 *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, presetImageIndex: idx, customImageUrl: '' })}
                        className={`group border rounded-xl overflow-hidden text-left p-1 transition-all ${
                          !reviewForm.customImageUrl && reviewForm.presetImageIndex === idx 
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10" 
                            : "border-slate-100 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-1 pointer-events-none">
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block truncate text-center leading-normal">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 block">또는 직접 이미지 URL 주소 입력 (선택)</span>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
                      value={reviewForm.customImageUrl}
                      onChange={(e) => setReviewForm({ ...reviewForm, customImageUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-800 hover:bg-emerald-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    후기 올리기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">개인정보 처리방침</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 sm:p-10 hide-scrollbar overflow-y-auto space-y-10 text-slate-600">
              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  1. 개인정보의 처리 목적
                </h4>
                <p className="text-sm leading-relaxed pl-4">
                  회사가 어떤 이유로 개인정보를 수집하는지 명시합니다.
                </p>
                <ul className="list-disc pl-9 space-y-2 text-sm">
                  <li>국제결혼중개 계약 체결, 유지, 관리 및 서비스 제공</li>
                  <li>결혼중개업법에 따른 맞선 상대방과의 신상정보(혼인·건강·직업·범죄경력 등) 상호 교환 및 서면 제공</li>
                  <li>출입국 관련 서류 수속 대행, 통·번역 서비스 제공</li>
                  <li>고객 실명 확인, 부정이용 방지, 민원 처리</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  2. 처리하는 개인정보의 항목
                </h4>
                <div className="text-sm border-l-4 border-amber-200 pl-4 bg-amber-50 py-3 rounded-r-lg">
                  💡 <strong>주의:</strong> 주민등록번호와 범죄경력·건강상태 등은 원칙적으로 수집이 제한되는 개인정보이지만, 결혼중개업법 제10조의2에 의거하여 법적 의무 이행을 위해 동의 없이도 수집이 가능하거나 반드시 수집해야 하는 항목입니다.
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-50 text-slate-900">
                        <th className="border border-slate-200 p-3 text-left">구분</th>
                        <th className="border border-slate-200 p-3 text-left">필수 수집 항목</th>
                        <th className="border border-slate-200 p-3 text-left">선택 수집 항목</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 p-3 font-bold bg-slate-50/50">기본 정보</td>
                        <td className="border border-slate-200 p-3">성명, 주민등록번호(또는 외국인등록번호), 주소, 연락처, 여권번호</td>
                        <td className="border border-slate-200 p-3">이메일 주소, SNS 계정</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-3 font-bold bg-slate-50/50">결혼중개업법 필수 신상정보</td>
                        <td className="border border-slate-200 p-3">
                          1. 혼인경력: 혼인관계증명서 등<br />
                          2. 건강상태: 건강진단서 (성병, 후천성면역결핍증, 정신질환 여부 포함)<br />
                          3. 직업/소득: 재직증명서, 사업자등록증, 소득증빙서류 등<br />
                          4. 범죄경력: 범죄경력조회 회신서 (성폭력, 가정폭력, 아동학대, 성매매 등)
                        </td>
                        <td className="border border-slate-200 p-3">신장, 체중, 혈액형, 학력, 종교, 흡연/음주 여부, 상대방 희망 조건</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  3. 개인정보의 처리 및 보유기간
                </h4>
                <ul className="list-disc pl-9 space-y-2 text-sm">
                  <li><strong>결혼중개 관련 기록:</strong> 5년 보존 (근거: 결혼중개업법 시행규칙)</li>
                  <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 보존 (근거: 전자상거래법)</li>
                  <li><strong>웹사이트 방문 기록(로그):</strong> 3개월 보존 (근거: 통신비밀보호법)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  4. 개인정보의 제3자 제공 및 국외 이전
                </h4>
                <div className="bg-slate-50 p-6 rounded-2xl space-y-3 text-sm">
                  <p><strong>제공받는 자:</strong> 해외 현지 협력 매칭 업체 명칭, 맞선 상대방(외국인 회원)</p>
                  <p><strong>제공 목적:</strong> 국제결혼 상대방 매칭, 결혼중개업법에 따른 신상정보 서면 교환 및 번역·제공</p>
                  <p><strong>제공 항목:</strong> 성명, 성별, 생년월일, 혼인경력, 건강상태, 직업, 범죄경력 등 신상정보 일체</p>
                  <p><strong>국외 이전 정보:</strong> 이전 국가, 이전 일시 및 방법, 제공받는 자의 보유 및 이용기간</p>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  5. 개인정보 처리 위탁
                </h4>
                <p className="text-sm leading-relaxed pl-4">
                  홈페이지 서버 관리(호스팅 업체), 문자 발송 시스템, 현지 행정 서류 대행 업체 등 외부 업체에 업무를 위탁하고 있습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  6. 정보주체의 권리·의무 및 행사방법
                </h4>
                <p className="text-sm leading-relaxed pl-4">
                  고객은 언제든지 본인의 개인정보 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 당사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  7. 개인정보의 파기 절차 및 방법
                </h4>
                <ul className="list-disc pl-9 space-y-2 text-sm">
                  <li><strong>전자적 파일:</strong> 재생할 수 없는 기술적 방법으로 영구 삭제</li>
                  <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  8. 개인정보의 안전성 확보 조치
                </h4>
                <p className="text-sm leading-relaxed pl-4">
                  내부관리계획 수립, 직원 대상 정기 교육, 데이터 암호화, 백신 프로그램 설치, 접근통제 시스템 및 잠금장치 운영 등 기술적/물리적 보호 조치를 취하고 있습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-lg font-black text-slate-900 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-600 rounded-full mr-3"></span>
                  9. 개인정보 보호책임자(CPO)
                </h4>
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">CPO 담당자</p>
                    <p className="text-lg font-bold">임원진 직속 보안관리팀</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-400">연락처:</span> 000-0000-0000</p>
                    <p><span className="text-slate-400">이메일:</span> support@saemaum.com</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex justify-center shrink-0">
               <button 
                onClick={onClose}
                className="px-12 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-xl"
               >
                 확인하였습니다
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AdminConsole = ({
  user,
  userRole,
  onLogout,
  onLoginClick,
  customGoogleFormUrl,
  setCustomGoogleFormUrl,
  customKakaoChUrl,
  setCustomKakaoChUrl,
  onNavigate
}: {
  user: FirebaseUser | null;
  userRole: 'pending' | 'approved' | 'master' | null;
  onLogout: () => void;
  onLoginClick: () => void;
  customGoogleFormUrl: string;
  setCustomGoogleFormUrl: (url: string) => void;
  customKakaoChUrl: string;
  setCustomKakaoChUrl: (url: string) => void;
  onNavigate: (view: View) => void;
}) => {
  const [googleInput, setGoogleInput] = useState(customGoogleFormUrl);
  const [kakaoInput, setKakaoInput] = useState(customKakaoChUrl);
  
  // Real-time roster of registered employee accounts
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    if (!user || (userRole !== 'approved' && userRole !== 'master')) return;

    // Fetch and subscribe to registered users in real-time
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: any[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setStaffUsers(usersList);
      setLoadingStaff(false);
    }, (error) => {
      console.error("Error loading staff list:", error);
      setLoadingStaff(false);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleToggleRole = async (targetUser: any) => {
    if (targetUser.role === 'master' || targetUser.email === 'wootaengboy@gmail.com') {
      alert("최고 마스터 권한 계정(소유자)은 등급을 변경할 수 없습니다.");
      return;
    }

    const isCurrentApproved = targetUser.role === 'approved';
    const newRole = isCurrentApproved ? 'pending' : 'approved';
    const msg = isCurrentApproved 
      ? `"${targetUser.displayName}" 님의 관리자 임명을 철회하고 일반 등록 대기(Pending) 상태로 환원하시겠습니까?\n철회 시 해당 직원의 반려자 및 성혼후기 정보 수정 권한이 상실됩니다.` 
      : `"${targetUser.displayName}" 님을 '정식 직원 관리자(Approved)'로 승인하시겠습니까?\n승인 시 데이터 연동 관리 및 반려자 소개, 성혼후기 등록/편집/삭제 권한이 부여됩니다.`;

    if (window.confirm(msg)) {
      try {
        // 1. Update standard users list
        await updateDoc(doc(db, 'users', targetUser.id), {
          role: newRole,
          updatedAt: new Date().toISOString()
        });

        // 2. Synchronize to 'admins' collection to pass secure firestore.rules gates
        if (newRole === 'approved') {
          await setDoc(doc(db, 'admins', targetUser.id), {
            email: targetUser.email,
            displayName: targetUser.displayName || '직원',
            role: 'approved',
            approvedAt: new Date().toISOString()
          });
        } else {
          try {
            await deleteDoc(doc(db, 'admins', targetUser.id));
          } catch (e) {
            console.warn("Ex-admin document was not stored or already removed:", e);
          }
        }

        alert(`보안 인가 완료: ${targetUser.displayName} 님의 계정이 [${newRole === 'approved' ? '정식 승인' : '승인 대기'}] 상태로 성공적으로 전환되었습니다.`);
      } catch (err: any) {
        alert("승인 처리 과정에서 에러가 발생했습니다: " + err.message);
      }
    }
  };

  const handleDeleteUser = async (targetUser: any) => {
    if (targetUser.role === 'master' || targetUser.email === 'wootaengboy@gmail.com') {
      alert("최고 마스터 권한 계정은 파기할 수 없습니다.");
      return;
    }

    const msg = `"${targetUser.displayName}" 님의 임직원 가입 정보를 목록에서 완전히 반려 및 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
    
    if (window.confirm(msg)) {
      try {
        // Delete from 'users' and 'admins' collections
        await deleteDoc(doc(db, 'users', targetUser.id));
        try {
          await deleteDoc(doc(db, 'admins', targetUser.id));
        } catch (e) {}

        alert("해당 계정 정보가 전산상에서 완전 차단 및 삭제 처리되었습니다.");
      } catch (err: any) {
        alert("계정 정보 파기 실패: " + err.message);
      }
    }
  };

  const handleSaveGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomGoogleFormUrl(googleInput);
    localStorage.setItem('test_google_form_url', googleInput);
    alert("구글 설문지(새마음 신청서) 연동 주소가 수정 및 저장되었습니다.");
  };

  const handleSaveKakao = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomKakaoChUrl(kakaoInput);
    localStorage.setItem('test_kakao_ch_url', kakaoInput);
    alert("카카오톡 1:1 상담 채널 연동 주소가 수정 및 저장되었습니다.");
  };

  const testLink = (url: string) => {
    if (!url) {
      alert("주소가 비어있습니다. 입력 후 테스트를 진행해 주세요.");
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen pt-40 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/60 max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">제한된 관리자 구역</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              본 페이지는 새마음 국제결혼 관리팀 전용 설정 공간입니다. 
              일반 사용자에게 노출되지 않는 환경 변수 및 외부 링크 설정을 위해 로그인이 요구됩니다.
            </p>
          </div>
          <button 
            onClick={onLoginClick}
            className="w-full py-4 bg-emerald-800 hover:bg-emerald-950 text-white font-extrabold rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            관리자 로그인 하기
          </button>
        </motion.div>
      </div>
    );
  }

  if (userRole === 'pending') {
    return (
      <div className="bg-slate-50 min-h-screen pt-40 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 shadow-xl border border-slate-200/60 max-w-lg w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Clock size={32} className="animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-black rounded-full border border-amber-100/50">
              <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-ping"></span>
              <span>승인 대기 중 (Pending)</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">직원 계정 승인 대기</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              안녕하세요, <span className="text-emerald-800 font-extrabold">{user.displayName || user.email}</span> 직원 님
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              본 시스템은 개인 정보 다중 안전 처리가 이루어지는 <strong>새마음 국제결혼 전산 내부망</strong>입니다.<br />
              현재 임직원 구글 계정에 대한 보안 승인이 임시 대기 상태입니다.<br /><br />
              대표 최고 관리자(wootaengboy@gmail.com) 혹은 기존 승인된 팀원이 <strong>'전산 제어 센터'</strong>에서 직접 귀하의 계정을 [정식 관리자]로 활성화 처리해 주시면 즉시 반려자 프로필 관리 및 성혼 후기 편집 권한이 인가됩니다.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5 text-slate-600 shadow-inner">
              <p>• <span className="text-slate-400">등록 이메일:</span> {user.email}</p>
              <p>• <span className="text-slate-400">대기 상태:</span> Active Sync (실시간 인가 감지 대기 중)</p>
              <p>• <span className="text-slate-400">안내:</span> 시스템에서 원격 권한 승인 완료 시, 본 화면이 전체 관리 대시보드로 자동 갱신됩니다.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onLogout}
              className="flex-1 py-3.5 bg-rose-50 text-rose-700 font-bold text-sm rounded-xl border border-rose-100 hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl transition shadow-md cursor-pointer"
            >
              홈페이지 가기
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-40 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Block */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100/80 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={30} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Authenticated Administrator</p>
              <h1 className="text-xl font-black text-slate-900">새마음 안전 제어 센터 (Admin Control)</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">{user.email}</span>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-rose-50 text-rose-700 font-bold text-sm rounded-xl border border-rose-100 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* Integration Setup Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Google Form URLs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">새마음 상세 신청서 구글폼 설정</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  일반 유저들이 메인 화면의 '상담 신청서 작성하기'를 클릭했을 때 이동할 구글 설문지(Google Form) 주소를 설정합니다.
                </p>
              </div>
              
              <form onSubmit={handleSaveGoogle} className="space-y-3">
                <input 
                  type="url" 
                  required
                  placeholder="https://docs.google.com/forms/d/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium"
                  value={googleInput}
                  onChange={(e) => setGoogleInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  구글 신청서 링크 저장하기
                </button>
              </form>
            </div>
            
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">현재 연결 상태: {customGoogleFormUrl ? "✅ 설정됨" : "⚠️ 미지정"}</span>
              <button 
                onClick={() => testLink(customGoogleFormUrl)}
                className="text-emerald-700 font-extrabold hover:underline"
              >
                테스트 이동하기 →
              </button>
            </div>
          </motion.div>

          {/* Card 2: KakaoTalk Link Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#FFF9C4] text-[#F57F17] rounded-xl flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">카카오톡 1:1 상담 링크 설정</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  일반 유저들이 '카카오톡 실시간 상담' 클릭 시 이동할 카카오 pf 채널 등 주소를 설정합니다.
                </p>
              </div>
              
              <form onSubmit={handleSaveKakao} className="space-y-3">
                <input 
                  type="url" 
                  required
                  placeholder="https://pf.kakao.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium"
                  value={kakaoInput}
                  onChange={(e) => setKakaoInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer"
                >
                  카카오 상담 링크 저장하기
                </button>
              </form>
            </div>
            
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">현재 연결 상태: {customKakaoChUrl ? "✅ 설정됨" : "⚠️ 미지정"}</span>
              <button 
                onClick={() => testLink(customKakaoChUrl)}
                className="text-emerald-700 font-extrabold hover:underline"
              >
                테스트 이동하기 →
              </button>
            </div>
          </motion.div>

        </div>

        {/* Staff Verification & Account Control panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center animate-pulse">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">임직원 계정 승인 및 권한 제어</h3>
                <p className="text-xs text-slate-500 mt-0.5">직원들이 본인의 구글 계정으로 로그인한 경우, 여기서 승인해야 전체 반려자 프로필 및 성혼후기 수정 권한이 부여됩니다.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 font-bold shrink-0 self-start sm:self-center">
              Active Sync Live
            </div>
          </div>

          {loadingStaff ? (
            <div className="text-center py-10 text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <RefreshCw size={24} className="animate-spin text-emerald-700" />
              <span>임직원 회원 데이터를 불러오는 중입니다...</span>
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              등록 신청한 직원 계정이 존재하지 않습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">직원 프로필</th>
                    <th className="pb-3">이메일</th>
                    <th className="pb-3">등록 일시</th>
                    <th className="pb-2 text-center">보안 권한 등급</th>
                    <th className="pb-2 text-right pr-2">보안 상태 전환</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium">
                  {staffUsers.map((staff) => {
                    const isMaster = staff.role === 'master' || staff.email === 'wootaengboy@gmail.com';
                    const isApproved = staff.role === 'approved' || isMaster;
                    
                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-4 pl-2 font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                            {staff.photoURL ? (
                              <img src={staff.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User size={14} className="text-slate-400" />
                            )}
                          </div>
                          <span>{staff.displayName}</span>
                        </td>
                        <td className="py-4 text-slate-500 font-mono text-[11px] select-all">{staff.email}</td>
                        <td className="py-4 text-slate-400">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-2 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isMaster 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                              : isApproved 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${isMaster ? 'bg-purple-600' : isApproved ? 'bg-emerald-600' : 'bg-rose-600 animate-ping'}`}></span>
                            {isMaster ? '마스터 최고관리자' : isApproved ? '정식 직원관리자' : '승인 대기(Pending)'}
                          </span>
                        </td>
                        <td className="py-2 text-right pr-2 space-x-2">
                          {!isMaster ? (
                            <>
                              <button
                                onClick={() => handleToggleRole(staff)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                  isApproved 
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100' 
                                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
                                }`}
                              >
                                {isApproved ? '권한 승인회수' : '관리자 권한승인'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(staff)}
                                className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg text-[10px] font-bold transition cursor-pointer"
                              >
                                반려/파기
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold italic">권한 잠금</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Content Management Quick Gateway */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-slate-700" />
            <h3 className="text-lg font-black text-slate-900">콘텐츠 직접 관리 지침</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            새마음 웹 플랫폼의 핵심 정보와 후기 관리는 아래 바로가기를 통해 해당 페이지에서 각 <strong>편집/삭제 모드</strong>를 켠 채 안전하게 수행하실 수 있습니다. 
            일반 사용자 방문 시에는 관리자 인증이 완료되지 않으므로 추가, 편집 버튼이 완전히 감춰집니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('candidates')}
              className="p-5 bg-slate-50 hover:bg-emerald-50 text-left rounded-2xl border border-slate-200/60 hover:border-emerald-200 transition group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-black text-slate-900 text-sm group-hover:text-emerald-950">반려자 소개 데이터 관리</p>
                <p className="text-[11px] text-slate-400 font-semibold group-hover:text-emerald-600 mt-1">프로필 추가, 비공개, 상세 정보 기입/수정</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition" />
            </button>
            <button 
              onClick={() => onNavigate('reviews')}
              className="p-5 bg-slate-50 hover:bg-emerald-50 text-left rounded-2xl border border-slate-200/60 hover:border-emerald-200 transition group flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="font-black text-slate-900 text-sm group-hover:text-emerald-950">성혼 후기 게시글 관리</p>
                <p className="text-[11px] text-slate-400 font-semibold group-hover:text-emerald-600 mt-1">실시간 성혼 스토리 업로드 및 삭제처리</p>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Global Auth States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'pending' | 'approved' | 'master' | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [nonAdminAlert, setNonAdminAlert] = useState<'google' | 'kakao' | null>(null);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      // Clean up previous user snapshot listener if any
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      setUser(u);
      if (u) {
        if (u.uid === 'master-local') {
          setUserRole('master');
          setIsAdminMode(true);
        } else {
          try {
            const userDocRef = doc(db, 'users', u.uid);
            
            // Subscribing to user document updates in Firestore
            unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
              if (snapshot.exists()) {
                const data = snapshot.data();
                const role = data.role || 'pending';
                setUserRole(role);
                setIsAdminMode(role === 'approved' || role === 'master');
              } else {
                // Not registered yet. Register default info.
                const isAutoMaster = u.email === 'wootaengboy@gmail.com';
                const defaultRole: 'pending' | 'approved' | 'master' = isAutoMaster ? 'master' : 'pending';
                
                // Set Firestore users collection entry
                setDoc(userDocRef, {
                  uid: u.uid,
                  email: u.email || '',
                  displayName: u.displayName || u.email?.split('@')[0] || '직원',
                  photoURL: u.photoURL || '',
                  role: defaultRole,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }, { merge: true }).catch(err => console.error("Error creating user profile document:", err));

                // If they are wootaengboy@gmail.com, dynamically add to admins collection for rules validation
                if (isAutoMaster) {
                  setDoc(doc(db, 'admins', u.uid), {
                    email: u.email,
                    displayName: u.displayName || '대표 관리자',
                    role: 'master'
                  }).catch(err => console.error("Error creating master administration entry:", err));
                }

                setUserRole(defaultRole);
                setIsAdminMode(defaultRole === 'master');
              }
            }, (error) => {
              console.error("Firestore user document subscription failed:", error);
              const isAutoMaster = u.email === 'wootaengboy@gmail.com';
              setUserRole(isAutoMaster ? 'master' : 'pending');
              setIsAdminMode(isAutoMaster);
            });
          } catch (error) {
            console.error("User document lookup error:", error);
            const isAutoMaster = u.email === 'wootaengboy@gmail.com';
            setUserRole(isAutoMaster ? 'master' : 'pending');
            setIsAdminMode(isAutoMaster);
          }
        }
      } else {
        setUserRole(null);
        setIsAdminMode(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setUserRole(null);
      setIsAdminMode(false);
      setCurrentView('home');
      alert("로그아웃 정상 완료되었습니다.");
    } catch (err: any) {
      alert("로그아웃 처리 실패: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsLoginModalOpen(false);
      alert("구글 연동 로그인이 안전하게 완료되었습니다.\n등록/승인된 직원 계정인 경우 즉시 관리자 모드가 활성화됩니다.");
    } catch (err: any) {
      console.error("Google Auth Failure Details:", err);
      const errorCode = err.code || "";
      
      if (errorCode === 'auth/popup-blocked') {
        alert(
          "※ 브라우저 팝업이 차단되었습니다.\n\n" +
          "현재 크롬 혹은 Safari 브라우저에서 새창 팝업이 막혀 있습니다. 주소창 우측의 팝업 차단 마크를 클릭하여 허용으로 변경하시거나, 또는 우측 상단의 '새 창에서 열기' 아이콘을 눌러 전체 창 모드에서 다시 시도해 주세요."
        );
      } else if (errorCode === 'auth/unauthorized-domain') {
        alert(
          "※ Firebase 구글 로그인 도메인 등록이 필요합니다.\n\n" +
          "다음 공유/개발 주소가 Firebase 프로젝트에 '승인된 도메인'으로 포함되어 있지 않습니다.\n\n" +
          "■ 등록할 도메인:\n" + window.location.hostname + "\n\n" +
          "■ 해결 방법:\n" +
          "1. Firebase Console -> Authentication -> Settings(설정) -> Authorized domains(승인된 도메인) 섹션으로 이동합니다.\n" +
          "2. '도메인 추가' 버튼을 눌러 위 도메인을 정확히 추가해 주세요.\n\n" +
          "※ 등록 완료 전까지는 비밀번호 입력창에 즉시 로그인 가능한 마스터 비밀번호(saemaum2026)를 입력하여 원활히 작업을 속행하실 수 있습니다."
        );
      } else if (errorCode === 'auth/operation-not-allowed') {
        alert(
          "※ Firebase 구글 로그인 서비스가 비활성화되어 있습니다.\n\n" +
          "Firebase Console -> Authentication -> Sign-in method에서 'Google' 소셜 로그인 공급업체가 활성화(Enabled) 상태인지 확인해 주시기 바랍니다."
        );
      } else {
        alert(
          "구글 로그인을 처리할 수 없습니다.\n" +
          "오류 메시지: " + (err.message || err) + "\n\n" +
          "※ 임시 조치:\n" +
          "구글 로그인 창이 노출되지 않거나 프로젝트 미연동 오류 발생 시, 비밀번호란에 'saemaum2026' 마스터 코드를 즉시 입력하여 마스터 최고 관리자로 신속하게 로그인하실 수 있습니다."
        );
      }
    }
  };

  // Google / Kakao states lifted
  const [activeModal, setActiveModal] = useState<'google' | 'kakao' | null>(null);
  const [customGoogleFormUrl, setCustomGoogleFormUrl] = useState(() => {
    return localStorage.getItem('test_google_form_url') || '';
  });
  const [customKakaoChUrl, setCustomKakaoChUrl] = useState(() => {
    return localStorage.getItem('test_kakao_ch_url') || '';
  });
  const [tempInputUrl, setTempInputUrl] = useState('');

  const finalGoogleFormUrl = customGoogleFormUrl || ENV_GOOGLE_FORM_URL || '';
  const isGoogleFormConfigured = finalGoogleFormUrl !== '' && finalGoogleFormUrl !== 'YOUR_GOOGLE_FORM_URL';

  const finalKakaoChUrl = customKakaoChUrl || ENV_KAKAO_CH_URL || '';
  const isKakaoChConfigured = finalKakaoChUrl !== '' && finalKakaoChUrl !== 'YOUR_KAKAO_CH_URL';

  useEffect(() => {
    if (activeModal === 'google') {
      setTempInputUrl(customGoogleFormUrl || ENV_GOOGLE_FORM_URL);
    } else if (activeModal === 'kakao') {
      setTempInputUrl(customKakaoChUrl || ENV_KAKAO_CH_URL);
    } else {
      setTempInputUrl('');
    }
  }, [activeModal, customGoogleFormUrl, customKakaoChUrl]);

  const handleGoogleClick = (e: React.MouseEvent) => {
    if (!isGoogleFormConfigured) {
      e.preventDefault();
      if (user) {
        setActiveModal('google');
      } else {
        setNonAdminAlert('google');
      }
    }
  };

  const handleKakaoClick = (e: React.MouseEvent) => {
    if (!isKakaoChConfigured) {
      e.preventDefault();
      if (user) {
        setActiveModal('kakao');
      } else {
        setNonAdminAlert('kakao');
      }
    }
  };

  const handleSaveTestUrl = () => {
    if (activeModal === 'google') {
      setCustomGoogleFormUrl(tempInputUrl);
      localStorage.setItem('test_google_form_url', tempInputUrl);
      if (tempInputUrl) {
         try {
           window.open(tempInputUrl, '_blank', 'noopener,noreferrer');
         } catch (err) {
           console.error('Failed to open window:', err);
         }
      }
    } else if (activeModal === 'kakao') {
      setCustomKakaoChUrl(tempInputUrl);
      localStorage.setItem('test_kakao_ch_url', tempInputUrl);
      if (tempInputUrl) {
         try {
           window.open(tempInputUrl, '_blank', 'noopener,noreferrer');
         } catch (err) {
           console.error('Failed to open window:', err);
         }
      }
    }
    setActiveModal(null);
  };

  const handleNavigate = (view: View, scrollToContact?: boolean) => {
    setCurrentView(view);
    if (scrollToContact && view === 'home') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <div className="min-h-screen">
      <Header currentView={currentView} onNavigate={handleNavigate} user={user} openLoginModal={() => setIsLoginModalOpen(true)} />
      <main>
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hero onNavigate={handleNavigate} />
              <PhilosophySection />
              <StepsSection onNavigate={handleNavigate} />
              <ContactSection 
                onGoogleClick={handleGoogleClick}
                onKakaoClick={handleKakaoClick}
                isGoogleFormConfigured={isGoogleFormConfigured}
                isKakaoChConfigured={isKakaoChConfigured}
                finalGoogleFormUrl={finalGoogleFormUrl}
                finalKakaoChUrl={finalKakaoChUrl}
              />
            </motion.div>
          ) : currentView === 'philosophy' ? (
            <motion.div
              key="philosophy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PhilosophyStory onNavigate={handleNavigate} />
            </motion.div>
          ) : currentView === 'candidates' ? (
            <motion.div
              key="candidates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CandidateIntroduction 
                onNavigate={handleNavigate} 
                user={user}
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminMode}
                openLoginModal={() => setIsLoginModalOpen(true)}
              />
            </motion.div>
          ) : currentView === 'costs' ? (
            <motion.div
              key="costs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CostDetails />
            </motion.div>
          ) : currentView === 'infrastructure' ? (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Infrastructure />
            </motion.div>
          ) : currentView === 'reviews' ? (
            <motion.div
              key="reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MarriageReviews 
                user={user}
                isAdminMode={isAdminMode}
                setIsAdminMode={setIsAdminMode}
              />
            </motion.div>
          ) : currentView === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AdminConsole 
                user={user}
                userRole={userRole}
                onLogout={handleLogout}
                onLoginClick={() => setIsLoginModalOpen(true)}
                customGoogleFormUrl={customGoogleFormUrl}
                setCustomGoogleFormUrl={setCustomGoogleFormUrl}
                customKakaoChUrl={customKakaoChUrl}
                setCustomKakaoChUrl={setCustomKakaoChUrl}
                onNavigate={handleNavigate}
              />
            </motion.div>
          ) : (
            <motion.div
              key="process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SafeJourneyProcess />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer 
        onNavigate={handleNavigate} 
        onPrivacyClick={() => setIsPrivacyOpen(true)} 
        onKakaoClick={handleKakaoClick}
        isKakaoChConfigured={isKakaoChConfigured}
        finalKakaoChUrl={finalKakaoChUrl}
      />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Global Admin Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 p-8 flex flex-col"
            >
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900">관리자 인증</h3>
                <p className="text-slate-500 text-xs mt-1">
                  새마음 안전 관리 시스템에 오신 것을 환영합니다.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold mb-4 border border-rose-100 flex items-center gap-2">
                  <span>⚠️</span>
                  {loginError}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoginError('');
                
                const emailInput = loginEmail.trim();
                const passwordInput = loginPassword;
                
                if (!passwordInput) {
                  setLoginError("비밀번호를 입력해주세요.");
                  return;
                }

                // Check local master key fallback first
                if (passwordInput === 'saemaum2026' || (emailInput.toLowerCase() === 'admin' && passwordInput === 'saemaum2026')) {
                  const masterUser = { 
                    email: 'admin@saemaum.com', 
                    emailVerified: true,
                    uid: 'master-local',
                    displayName: '마스터 관리자'
                  };
                  setUser(masterUser as any);
                  setIsAdminMode(true);
                  setIsLoginModalOpen(false);
                  setLoginEmail('');
                  setLoginPassword('');
                  alert("마스터 관리자 권한으로 인증되었습니다.");
                  return;
                }

                // If they entered an email and want to try real firebase auth
                if (!emailInput) {
                  setLoginError("관리자 이메일과 비밀번호를 올바르게 입력해 주세요.");
                  return;
                }

                try {
                  const userCredential = await signInWithEmail(emailInput, passwordInput);
                  setUser(userCredential.user);
                  setIsAdminMode(true);
                  setIsLoginModalOpen(false);
                  setLoginEmail('');
                  setLoginPassword('');
                  alert("관리자 계정으로 환영합니다!");
                } catch (err: any) {
                  console.error(err);
                  let displayMsg = "로그인에 실패했습니다. 이메일과 비밀번호를 다시 확인해 주세요.";
                  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                    displayMsg = "등록되지 않은 관리자 이메일이거나 비밀번호가 다릅니다.";
                  }
                  setLoginError(displayMsg);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">관리자 이메일</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="admin@example.com" 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-800"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <div className="absolute left-3.5 top-3.5 text-slate-400">
                      <Mail size={16} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">비밀번호 *</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      required
                      placeholder="비밀번호를 입력해 주세요" 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-800"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <div className="absolute left-3.5 top-3.5 text-slate-400">
                      <Lock size={16} />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl transition text-sm shadow-md mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} />
                  로그인 인증하기
                </button>
              </form>

              {/* Separator lines */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-bold">또는 간편인증</span>
                </div>
              </div>

              {/* Google Sign-in Alternative */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="text-lg font-black text-[#4285F4]">G</span>
                <span>구글 계정으로 로그인</span>
              </button>

              <div className="mt-5 text-[11px] text-slate-400 leading-relaxed text-center space-y-1">
                <p>※ 등록된 관리자 이메일과 비밀번호를 전산 보완망을 통해 입력하고 로그인할 수 있습니다.</p>
                <p>※ 권한 승인 및 비밀번호 재발급 요구 시 시스템 운영 관리자에게 원격 신청해 주시기 바랍니다.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client-facing Unconfigured Graceful Notice */}
      <AnimatePresence>
        {nonAdminAlert && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNonAdminAlert(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 p-8 text-center space-y-6"
            >
              <button 
                onClick={() => setNonAdminAlert(null)}
                className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">안심 고객 지원 센터</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {nonAdminAlert === 'google' 
                    ? "현재 안전한 비대면 상담 신청서 접수 시스템의 상시 보안 점검이 진행되고 있습니다." 
                    : "현재 카카오톡 실시간 1:1 상담 채널 정기 점검이 작동하고 있습니다."}
                </p>
                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                  불편을 드려 죄송합니다. 새마음 고객지원 직통 핫라인 
                  <strong className="text-emerald-800 block text-lg font-black tracking-tight mt-1">010-1234-5678</strong>
                  으로 전화 연락 주시면 즉시 가입 서류 검토 및 맞춤 상담 예약을 진행해 드리겠습니다.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setNonAdminAlert(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition"
                >
                  닫기
                </button>
                <a 
                  href="tel:010-1234-5678"
                  className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} />
                  전화상담 연결
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Link Setup Modal */}
      <AnimatePresence>
        {user && activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl z-10 border border-slate-100"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  activeModal === 'google' ? 'bg-amber-100 text-amber-700' : 'bg-[#FFF9C4] text-[#F57F17]'
                }`}>
                  {activeModal === 'google' ? <FileText size={24} /> : <MessageSquare size={24} />}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {activeModal === 'google' ? '구글 설문지 링크를 등록해주세요' : '카카오톡 채널 링크를 등록해주세요'}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {activeModal === 'google' 
                    ? '상담 신청서로 연결할 구글 설문지(Google Form) URL이 아직 설정되지 않았습니다.' 
                    : '실시간 카카오톡 상담으로 연결할 카카오 채널 URL이 아직 설정되지 않았습니다.'}
                </p>
              </div>

              {/* Instructions on Settings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 mb-6 space-y-2">
                <div className="font-bold text-slate-800 text-sm mb-1">🔧 영구 등록 방법 (AI Studio)</div>
                <p>우측 상단의 <strong>Settings → Secrets</strong> 메뉴에서 새로운 환경 변수를 등록하시면 배포/공유 후에도 영구히 유지됩니다:</p>
                <code className="block bg-slate-200 text-slate-800 p-2.5 rounded font-mono text-[11px] leading-relaxed break-all select-all">
                  Key: {activeModal === 'google' ? 'VITE_GOOGLE_FORM_URL' : 'VITE_KAKAO_CH_URL'}<br />
                  Value: 실제 설문지 주소 (예: https://forms.gle/...)
                </code>
              </div>

              {/* Instant Test Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  ⚡ 실시간 임시 주소 입력 (현재 브라우저에서 바로 테스트 이동)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder={activeModal === 'google' ? 'https://docs.google.com/forms/d/...' : 'https://pf.kakao.com/...'} 
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                    value={tempInputUrl === 'YOUR_GOOGLE_FORM_URL' || tempInputUrl === 'YOUR_KAKAO_CH_URL' ? '' : tempInputUrl}
                    onChange={(e) => setTempInputUrl(e.target.value)}
                  />
                  <button 
                    onClick={handleSaveTestUrl}
                    className="bg-emerald-800 hover:bg-emerald-950 text-white px-5 py-3 rounded-xl font-bold text-sm transition cursor-pointer shrink-0"
                  >
                    이동 및 저장
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 text-sm">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}