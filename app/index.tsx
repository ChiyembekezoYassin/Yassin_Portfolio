
import { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Animated, StatusBar, Platform, Pressable,
  Modal, useWindowDimensions, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import NeuralNetwork from "./NeuralNetwork";


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONO      = Platform.OS === "ios" ? "Menlo" : "monospace";
const BP_SM     = 480;
const BP_MD     = 768;
const BP_LG     = 1024;
const THEME_KEY = "@portfolio_theme";
const CV_URL    = "https://drive.google.com/your-cv-link-here.pdf";

const PROFILE_PHOTO = require("../assets/images/ID1.jpeg");
const OshotaIcon    = require("../assets/images/icon.png");
const AgroIcon      = require("../assets/images/logo2.png");

const GRAIN_URI = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>
  <rect width='200' height='200' filter='url(#n)' opacity='1'/>
</svg>`)}`;

// ─── HAPTIC HELPERS ───────────────────────────────────────────────────────────
const hapticLight  = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
const hapticMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
const hapticHeavy  = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
const hapticSelect = () => Haptics.selectionAsync();
const hapticNotify = (type = "success") =>
  Haptics.notificationAsync(
    type === "success" ? Haptics.NotificationFeedbackType.Success
    : type === "error" ? Haptics.NotificationFeedbackType.Error
    : Haptics.NotificationFeedbackType.Warning
  );

// ─── LAYOUT HOOK ──────────────────────────────────────────────────────────────
function useLayout() {
  const { width, height } = useWindowDimensions();
  const isPhone   = width < BP_SM;
  const isTablet  = width >= BP_MD;
  const isDesktop = width >= BP_LG;
  const hPad  = isPhone ? 20 : isTablet ? 40 : 72;
  const gap   = isPhone ? 12 : 16;
  const card2 = (width - hPad * 2 - gap) / (isPhone ? 1 : 2);
  const card3 = (width - hPad * 2 - gap * 2) / (isPhone ? 1 : 3);
  return { width, height, isPhone, isTablet, isDesktop, hPad, gap, card2, card3 };
}

// ─── THEMES ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#f8f6f1", bg2: "#f0ece3", surface: "#ffffff",
  text: "#18130f", textMuted: "#8a7d72", textFaint: "#b8aca0",
  accent: "#c96a28", accentSoft: "rgba(201,106,40,0.10)",
  accent2: "#2a6040", accent2Soft: "rgba(42,96,64,0.10)",
  border: "#e4ddd4", borderSoft: "#ede8e0",
  navBg: "rgba(248,246,241,0.88)", isDev: false,
};
const DARK = {
  bg: "#08090d", bg2: "#0d0f16", surface: "#121620",
  text: "#e2e8f4", textMuted: "#647080", textFaint: "#3a4455",
  accent: "#4fa8f8", accentSoft: "rgba(79,168,248,0.10)",
  accent2: "#38c76a", accent2Soft: "rgba(56,199,106,0.10)",
  border: "#1a2234", borderSoft: "#141928",
  navBg: "rgba(8,9,13,0.88)", isDev: true,
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3+", label: "Years Exp",  icon: "calendar-outline", dev: "exp"   },
  { value: "2+",  label: "Projects",   icon: "rocket-outline",   dev: "proj"  },
  { value: "10+",label: "Tech Stack", icon: "layers-outline",   dev: "stack" },
  { value: "3",  label: "Companies",  icon: "business-outline", dev: "orgs"  },
];

const SKILLS = [
  { ionIcon: "logo-react",            title: "Frontend",         devTitle: "ui/",     tags: ["React","React Native","HTML","CSS","JS"], level: 88 },
  { ionIcon: "hardware-chip-outline", title: "Machine Learning", devTitle: "ml/",     tags: ["TensorFlow","Keras","CNN","Python"],      level: 75 },
  { ionIcon: "server-outline",        title: "Databases",        devTitle: "db/",     tags: ["SQL","NoSQL","Radius","PHP"],             level: 80 },
  { ionIcon: "color-palette-outline", title: "Design & Tools",   devTitle: "design/", tags: ["Figma","Photoshop","UI/UX","MS Office"], level: 82 },
];

const EXPERIENCE = [
  {
    role: "Survey Programmer", company: "MrTechOps",
    type: "Full-time · Remote", period: "2023 — Present", current: true,
    color: "#c96a28", ionIcon: "briefcase-outline",
    bullets: [
      "Programming surveys and managing end-to-end data workflows.",
      "Creating automated scripts to improve efficiency.",
      "Collaborating with international teams on client projects.",
    ],
  },
  {
    role: "Database Administrator", company: "Fieldscope International",
    type: "Full-time · On-Site", period: "Jun 2022 — Jul 2023", current: false,
    color: "#677625", ionIcon: "code-slash-outline",
    bullets: [
      "Designing logical and physical database structures in collaboration with developers.",
      "Installing database software, creating backup/recovery plans and managing security.",
    ],
  },
  {
    role: "Junior Programmer & Web Developer", company: "CHIWETO Limited",
    type: "Internship · Remote", period: "Jan 2022 — Jun 2022", current: false,
    color: "#2a6040", ionIcon: "code-slash-outline",
    bullets: [
      "Assisted in front-end and back-end development.",
      "Contributed to web design and system integration.",
    ],
  },
];

// ⑨ `image` field holds the local asset — used in card header & modal header
const PROJECTS = [
  {
    id: "01", name: "Oshota App", ionIcon: "wallet-outline",
    image: OshotaIcon,
    desc: "A personal finance platform for managing budgets and tracking expenses with complete spending clarity.",
    longDesc: "Oshota is a comprehensive personal finance manager built with React Native. It features real-time budget tracking, category-based expense analysis, visual spending charts, and smart alerts when you're nearing your budget limits. Designed with a clean, intuitive UI to make financial awareness effortless for everyday users.",
    tags: ["React Native", "Finance", "UX Design"],
    accent: "#2a6040",
    platform: "Mobile (iOS & Android)",
    status: "In Development",
    appUrl: "https://github.com/ChiyembekezoYassin/Oshota",
    siteUrl: "https://expo.dev/accounts/vaccine1208/projects/oshota/builds/ebed7a5d-a465-40d0-831c-0a6b6c423fc1",
    highlights: [
      "Real-time budget tracking with category breakdown",
      "Visual charts for spending patterns over time",
      "Smart notifications for budget threshold alerts",
      "Offline-first architecture with local data sync",
    ],
  },
  {
    id: "02", name: "AgroVision", ionIcon: "leaf-outline",
    image: AgroIcon,
    desc: "AI-powered disease detection using CNN — helping farmers protect crops from disease instantly.",
    longDesc: "AgroVision leverages Convolutional Neural Networks trained on thousands of plant disease images to identify crop diseases in real time from a phone camera. Built to help smallholder farmers in Sub-Saharan Africa diagnose and treat plant disease before it spreads — no internet required after initial model download.",
    tags: ["CNN", "TensorFlow", "Python", "Keras"],
    accent: "#2a6040",
    platform: "Mobile + Web Dashboard",
    status: "Completed",
    appUrl: "https://github.com/ChiyembekezoYassin/AgroVisionApp",
    siteUrl: "https://agrovisionapp--jv62js4ajx.expo.app/",
    highlights: [
      "94% disease detection accuracy on test dataset",
      "Offline-capable TensorFlow Lite model",
      "Supports 12 crop types and 38 disease classes",
      "Web dashboard for aggregated farm health reporting",
    ],
  },
];

const EDUCATION = [
  { degree: "BSc Information Systems",   school: "MUBAS",                  year: "2022–2025", ionIcon: "school-outline"   },
  { degree: "Diploma in Computing & IS", school: "MUBAS",                  year: "2020–2021", ionIcon: "ribbon-outline"   },
  { degree: "MSCE",                      school: "Ndirande Hill Secondary", year: "2014–2018", ionIcon: "library-outline"  },
];

const CONTACTS = [
  { ionIcon: "mail-outline",  label: "chimyassin@gmail.com", sub: "Email",   href: "mailto:chimyassin@gmail.com" },
  { ionIcon: "call-outline",  label: "+265 993 74 37 90",    sub: "Phone",   href: "tel:+265993743790" },
  { ionIcon: "logo-linkedin", label: "LinkedIn",             sub: "Network", href: "https://www.linkedin.com/in/chiyembekezo-yassin-b0547323a/" },
];

const ATTRIBUTES = [
  { text: "Excellent communicator",       ionIcon: "chatbubble-ellipses-outline" },
  { text: "Hardworking & high integrity", ionIcon: "shield-checkmark-outline"    },
  { text: "Strong analytical skills",     ionIcon: "analytics-outline"           },
  { text: "Fast learner & team player",   ionIcon: "people-outline"              },
  { text: "Adaptable & reliable",         ionIcon: "repeat-outline"              },
];

const NAV_LINKS = [
  { label: "Home",       icon: "home-outline"      },
  { label: "About",      icon: "person-outline"    },
  { label: "Skills",     icon: "flash-outline"     },
  { label: "Experience", icon: "briefcase-outline" },
  { label: "Projects",   icon: "rocket-outline"    },
  { label: "Contact",    icon: "mail-outline"      },
];

// ─── ATTRIBUTES MARQUEE ───────────────────────────────────────────────────────
const AttributesMarquee = ({ t }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const ITEM_W  = 192;
  const TOTAL_W = ATTRIBUTES.length * ITEM_W;
  useEffect(() => {
    translateX.setValue(0);
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -TOTAL_W,
        duration: ATTRIBUTES.length * 5800,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const items = [...ATTRIBUTES, ...ATTRIBUTES];
  return (
    <View style={{ overflow: "hidden", marginTop: 32 }}>
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX }], width: ITEM_W * items.length }}>
        {items.map((a, i) => (
          <View key={i} style={[m.marqueeItem, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={[m.marqueeIcon, { backgroundColor: t.accentSoft }]}>
              <Ionicons name={a.ionIcon} size={14} color={t.accent} />
            </View>
            <Text style={[m.marqueeTxt, { color: t.text }]}>{a.text}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

// ─── ⑥ TYPEWRITER HOOK ────────────────────────────────────────────────────────
function useTypewriter(text, { speed = 40, delay = 0 } = {}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0, timeout = null;
    const start = () => {
      const tick = () => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i < text.length) timeout = setTimeout(tick, speed);
        else setDone(true);
      };
      timeout = setTimeout(tick, speed);
    };
    const outer = setTimeout(start, delay);
    return () => { clearTimeout(outer); clearTimeout(timeout); };
  }, [text, speed, delay]);
  return { displayed, done };
}

// ─── SCROLL-TRIGGERED REVEAL ──────────────────────────────────────────────────
const ScrollReveal = ({ children, scrollY, itemY, windowH, threshold = 80, delay = 0, dx = 0, dy = 24, style }) => {
  const op     = useRef(new Animated.Value(0)).current;
  const transY = useRef(new Animated.Value(dy)).current;
  const transX = useRef(new Animated.Value(dx)).current;
  const triggered = useRef(false);
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (triggered.current) return;
      if (value >= itemY - windowH + threshold) {
        triggered.current = true;
        Animated.parallel([
          Animated.timing(op,     { toValue: 1, duration: 460, delay, useNativeDriver: true }),
          Animated.spring(transY, { toValue: 0, delay, useNativeDriver: true, tension: 80, friction: 14 }),
          Animated.spring(transX, { toValue: 0, delay, useNativeDriver: true, tension: 80, friction: 14 }),
        ]).start();
        scrollY.removeListener(listener);
      }
    });
    const currentVal = (scrollY as any)._value ?? 0;
    if (currentVal >= itemY - windowH + threshold) {
      triggered.current = true;
      op.setValue(1); transY.setValue(0); transX.setValue(0);
      scrollY.removeListener(listener);
    }
    return () => scrollY.removeListener(listener);
  }, [itemY, windowH]);
  return (
    <Animated.View style={[{ opacity: op, transform: [{ translateY: transY }, { translateX: transX }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ─── SCROLL-TRIGGERED SKILL BAR ───────────────────────────────────────────────
const ScrollRevealSkillBar = ({ level, color, scrollY, itemY, windowH, threshold = 80, delay = 0 }) => {
  const fillW     = useRef(new Animated.Value(0)).current;
  const sheenX    = useRef(new Animated.Value(-100)).current;
  const triggered = useRef(false);
  useEffect(() => {
    const run = () => {
      Animated.timing(fillW, { toValue: level, duration: 900, delay, useNativeDriver: false })
        .start(() => {
          sheenX.setValue(-100);
          Animated.timing(sheenX, { toValue: 110, duration: 520, useNativeDriver: false }).start();
        });
    };
    const listener = scrollY.addListener(({ value }) => {
      if (triggered.current) return;
      if (value >= itemY - windowH + threshold) { triggered.current = true; run(); scrollY.removeListener(listener); }
    });
    const currentVal = (scrollY as any)._value ?? 0;
    if (currentVal >= itemY - windowH + threshold) { triggered.current = true; run(); scrollY.removeListener(listener); }
    return () => scrollY.removeListener(listener);
  }, [itemY, windowH, level]);
  const width        = fillW.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  const sheenLeft    = sheenX.interpolate({ inputRange: [-100, 110], outputRange: ["-30%", "110%"] });
  const sheenOpacity = sheenX.interpolate({ inputRange: [-100, -10, 80, 110], outputRange: [0, 0.55, 0.55, 0] });
  return (
    <View style={m.barTrack}>
      <Animated.View style={[m.barFill, { width, backgroundColor: color }]}>
        <View style={[m.barSheen, { backgroundColor: "rgba(255,255,255,0.18)" }]} />
        <Animated.View style={{
          position: "absolute", top: 0, bottom: 0, width: "28%",
          left: sheenLeft, opacity: sheenOpacity,
          backgroundColor: "rgba(255,255,255,0.52)",
          transform: [{ skewX: "-20deg" }],
        }} />
      </Animated.View>
    </View>
  );
};

// ─── LEGACY REVEAL ────────────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, style, dy = 22 }) => {
  const op = useRef(new Animated.Value(0)).current;
  const y  = useRef(new Animated.Value(dy)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 460, delay, useNativeDriver: true }),
      Animated.spring(y,  { toValue: 0, delay, useNativeDriver: true, tension: 80, friction: 14 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: op, transform: [{ translateY: y }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ─── TOUCH CARD WITH HAPTICS ──────────────────────────────────────────────────
const TouchCard = ({ children, style, onPress, glowColor, scaleTarget = 0.97, haptic = "light" }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;
  const onIn  = () => {
    if (haptic === "light")  hapticLight();
    if (haptic === "medium") hapticMedium();
    if (haptic === "select") hapticSelect();
    Animated.parallel([
      Animated.spring(scale, { toValue: scaleTarget, useNativeDriver: true, tension: 300, friction: 20 }),
      Animated.timing(glow,  { toValue: 1, duration: 130, useNativeDriver: false }),
    ]).start();
  };
  const onOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 12 }),
      Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
    onPress?.();
  };
  const bColor = glow.interpolate({ inputRange: [0, 1], outputRange: ["transparent", glowColor || "#c96a28"] });
  const sOp    = glow.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.20] });
  return (
    <Pressable onPressIn={onIn} onPressOut={onOut}>
      <Animated.View style={[
        style,
        { transform: [{ scale }], borderColor: bColor,
          shadowColor: glowColor || "#c96a28",
          shadowOpacity: sOp, shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 }, elevation: 4 },
      ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ─── ⑧ TILT CARD ─────────────────────────────────────────────────────────────
const TiltCard = ({ children, style, onPress, glowColor, maxTilt = 8 }) => {
  const rotX  = useRef(new Animated.Value(0)).current;
  const rotY  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;
  const cardW = useRef(1);
  const cardH = useRef(1);

  const handleLayout = (e) => {
    cardW.current = e.nativeEvent.layout.width  || 1;
    cardH.current = e.nativeEvent.layout.height || 1;
  };
  const onPressIn = (e) => {
    hapticMedium();
    const { locationX, locationY } = e.nativeEvent;
    const tiltY =  ((locationX / cardW.current) - 0.5) * 2 * maxTilt;
    const tiltX = -((locationY / cardH.current) - 0.5) * 2 * maxTilt;
    Animated.parallel([
      Animated.spring(rotX,  { toValue: tiltX, useNativeDriver: true, tension: 300, friction: 18 }),
      Animated.spring(rotY,  { toValue: tiltY, useNativeDriver: true, tension: 300, friction: 18 }),
      Animated.spring(scale, { toValue: 1.03,  useNativeDriver: true, tension: 300, friction: 20 }),
      Animated.timing(glow,  { toValue: 1, duration: 130, useNativeDriver: false }),
    ]).start();
  };
  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(rotX,  { toValue: 0, useNativeDriver: true, tension: 200, friction: 14 }),
      Animated.spring(rotY,  { toValue: 0, useNativeDriver: true, tension: 200, friction: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 12 }),
      Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
    onPress?.();
  };
  const rotXDeg = rotX.interpolate({ inputRange: [-maxTilt, maxTilt], outputRange: [`-${maxTilt}deg`, `${maxTilt}deg`] });
  const rotYDeg = rotY.interpolate({ inputRange: [-maxTilt, maxTilt], outputRange: [`-${maxTilt}deg`, `${maxTilt}deg`] });
  const sOp     = glow.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.22] });
  const bColor  = glow.interpolate({ inputRange: [0, 1], outputRange: ["transparent", glowColor || "#c96a28"] });
  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onLayout={handleLayout}>
      <Animated.View style={[
        style,
        {
          transform: [{ perspective: 900 }, { rotateX: rotXDeg }, { rotateY: rotYDeg }, { scale }],
          borderColor: bColor,
          shadowColor: glowColor || "#c96a28",
          shadowOpacity: sOp, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 6,
        },
      ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ─── MISC PRIMITIVES ──────────────────────────────────────────────────────────
const Counter = ({ value, color, size = 20, delay = 0 }) => {
  const num = parseInt(value) || 0;
  const a   = useRef(new Animated.Value(0)).current;
  const [disp, setDisp] = useState("0");
  useEffect(() => {
    if (!num) { setDisp(value); return; }
    const id = setTimeout(() => {
      Animated.timing(a, { toValue: num, duration: 1100, useNativeDriver: false }).start();
      a.addListener(({ value: v }) => setDisp(Math.floor(v) + (value.includes("+") ? "+" : "")));
    }, delay);
    return () => clearTimeout(id);
  }, []);
  return <Text style={{ color, fontSize: size, fontWeight: "900", fontFamily: MONO }}>{disp}</Text>;
};

const Cursor = ({ color }) => {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 0, duration: 480, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 480, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Text style={{ opacity: op, color, fontFamily: MONO, fontSize: 13 }}>█</Animated.Text>;
};

const PulseDot = ({ color }) => {
  const sc = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sc, { toValue: 1.9, duration: 1400, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 1,   duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ position: "absolute", width: 10, height: 10, borderRadius: 5,
        backgroundColor: color, opacity: 0.28, transform: [{ scale: sc }] }} />
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
};

const Tag = ({ label, accent, t }) => {
  const sc  = useRef(new Animated.Value(1)).current;
  const pop = () => {
    hapticLight();
    Animated.sequence([
      Animated.spring(sc, { toValue: 1.14, useNativeDriver: true, tension: 400 }),
      Animated.spring(sc, { toValue: 1,    useNativeDriver: true, tension: 300 }),
    ]).start();
  };
  const c = accent || t.accent;
  return (
    <Pressable onPress={pop}>
      <Animated.View style={[m.tag, { borderColor: c + "40", backgroundColor: c + "0d", transform: [{ scale: sc }] }]}>
        <Text style={[m.tagTxt, { color: c }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

const SectionHead = ({ num, title, icon, t, delay = 0 }) => (
  <Reveal delay={delay} style={m.sHead}>
    <View style={[m.sIconBadge, { backgroundColor: t.accentSoft, borderColor: t.accent + "28" }]}>
      <Ionicons name={icon} size={14} color={t.accent} />
    </View>
    <Text style={[m.sNum, { color: t.accent, fontFamily: MONO }]}>{num}</Text>
    <Text style={[m.sTitle, { color: t.text }]}>{title}</Text>
    <View style={[m.sLine, { backgroundColor: t.border }]} />
  </Reveal>
);

// ─── MODE TOGGLE ──────────────────────────────────────────────────────────────
const ModeToggle = ({ isDev, onToggle, t }) => {
  const pill = useRef(new Animated.Value(isDev ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(pill, { toValue: isDev ? 1 : 0, useNativeDriver: false, tension: 220, friction: 16 }).start();
  }, [isDev]);
  const kx = pill.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  const bg = pill.interpolate({ inputRange: [0, 1], outputRange: [LIGHT.border, DARK.accent] });
  return (
    <TouchableOpacity onPress={() => { hapticMedium(); onToggle(); }} activeOpacity={0.85}
      style={[m.toggle, { backgroundColor: t.surface, borderColor: t.border }]}>
      <Ionicons name={isDev ? "code-slash" : "person"} size={14} color={t.accent} />
      <Animated.View style={[m.toggleTrack, { backgroundColor: bg }]}>
        <Animated.View style={[m.toggleThumb, { transform: [{ translateX: kx }],
          backgroundColor: isDev ? "#08090d" : "#fff" }]} />
      </Animated.View>
      <Text style={[m.toggleLbl, { color: t.textMuted, fontFamily: MONO }]}>{isDev ? "DEV" : "UI"}</Text>
    </TouchableOpacity>
  );
};

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
const NavBar = ({ t, isDev, onToggle, scrollTo, refs, layout, scrollY, activeSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim     = useRef(new Animated.Value(0)).current;
  const pillX        = useRef(new Animated.Value(0)).current;
  const pillW        = useRef(new Animated.Value(0)).current;
  const linkRefs     = useRef([]);
  const containerRef = useRef(null);
  const { isPhone, isDesktop, hPad } = layout;
  const refMap = [refs.heroRef, refs.aboutRef, refs.skillsRef, refs.expRef, refs.projRef, refs.contactRef];

  useEffect(() => {
    const el = linkRefs.current[activeSection];
    if (!el || !containerRef.current) return;
    el.measureLayout(containerRef.current, (x, _y, w) => {
      Animated.parallel([
        Animated.spring(pillX, { toValue: x, useNativeDriver: false, tension: 200, friction: 18 }),
        Animated.spring(pillW, { toValue: w, useNativeDriver: false, tension: 200, friction: 18 }),
      ]).start();
    }, () => {});
  }, [activeSection]);

  const toggleMenu = () => {
    hapticSelect();
    const next = !menuOpen;
    Animated.spring(menuAnim, { toValue: next ? 1 : 0, useNativeDriver: false, tension: 120, friction: 14 }).start();
    setMenuOpen(next);
  };
  const handleNav = (i) => { hapticSelect(); scrollTo(refMap[i]); if (isPhone) toggleMenu(); };

  const navOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.84], extrapolate: "clamp" });
  const menuH      = menuAnim.interpolate({ inputRange: [0, 1], outputRange: [0, NAV_LINKS.length * 52 + 72] });

  return (
    <Animated.View style={[m.navWrap, {
      opacity: navOpacity, backgroundColor: t.navBg, borderBottomColor: t.border,
      shadowColor: t.isDev ? "#000" : "#c96a28",
      shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
    }]}>
      <View style={[m.navRow, {
        paddingHorizontal: hPad,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : isPhone ? 50 : 14,
        maxWidth: 1200, alignSelf: "center", width: "100%",
      }]}>
        <View style={m.navZone}>
          <PulseDot color={t.accent2} />
          <Text style={[m.navLogoTxt, { color: t.isDev ? t.accent : t.text, fontFamily: MONO }]}>
            {isDev ? "<CY />" : "CY"}
          </Text>
        </View>

        {!isPhone && (
          <View style={[m.navZone, { justifyContent: "center" }]}>
            <View ref={containerRef} style={[m.navPillWrap, { backgroundColor: t.bg2, borderColor: t.border }]}>
              <Animated.View style={[m.navPillActive, {
                left: pillX, width: pillW,
                backgroundColor: t.accentSoft, borderColor: t.accent + "28",
              }]} />
              {NAV_LINKS.map((link, i) => (
                <TouchableOpacity key={link.label} ref={el => (linkRefs.current[i] = el)}
                  onPress={() => handleNav(i)} activeOpacity={0.72} style={m.navPillBtn}>
                  {!isDesktop
                    ? <Ionicons name={link.icon} size={14} color={activeSection === i ? t.accent : t.textMuted} />
                    : <Text style={[m.navPillTxt, { fontFamily: MONO,
                        color: activeSection === i ? t.accent : t.textMuted,
                        fontWeight: activeSection === i ? "700" : "500" }]}>
                        {link.label}
                      </Text>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[m.navZone, { justifyContent: "flex-end", gap: 10 }]}>
          
          <ModeToggle isDev={isDev} onToggle={onToggle} t={t} />
          {isPhone && (
            <TouchableOpacity onPress={toggleMenu}
              style={[m.hamburger, { borderColor: t.border, backgroundColor: t.surface, marginLeft: 0 }]}>
              <Ionicons name={menuOpen ? "close" : "menu"} size={20} color={t.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isPhone && (
        <Animated.View style={{ maxHeight: menuH, overflow: "hidden", paddingHorizontal: hPad }}>
          <View style={[m.mobileMenu, { borderTopColor: t.border }]}>
            {NAV_LINKS.map((link, i) => (
              <TouchableOpacity key={link.label} onPress={() => handleNav(i)}
                style={[m.mobileLink, { borderBottomColor: t.borderSoft,
                  backgroundColor: activeSection === i ? t.accentSoft : "transparent" }]}>
                <View style={[m.mobileLinkIcon, { backgroundColor: activeSection === i ? t.accent + "20" : t.bg2 }]}>
                  <Ionicons name={link.icon} size={14} color={activeSection === i ? t.accent : t.textMuted} />
                </View>
                <Text style={[m.mobileLinkTxt, { color: activeSection === i ? t.accent : t.text, fontFamily: MONO }]}>
                  {link.label}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={t.textFaint} />
              </TouchableOpacity>
            ))}
            
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};

// ─── HERO ORB ─────────────────────────────────────────────────────────────────
const HeroOrb = ({ t }) => {
  const floatY = useRef(new Animated.Value(0)).current;
  const rot    = useRef(new Animated.Value(0)).current;
  const rot2   = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -12, duration: 2600, useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0,   duration: 2600, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(rot,  { toValue: 1, duration: 10000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: 1, duration: 7000,  useNativeDriver: true })).start();
  }, []);
  const rotDeg  = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg",   "360deg"] });
  const rot2Deg = rot2.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"]   });
  return (
    <Animated.View style={[m.orbWrap, { transform: [{ translateY: floatY }] }]}>
      <View style={[m.orbGlow, { backgroundColor: t.accent + "16" }]} />
      <Animated.View style={[m.orbRingOuter, { borderColor: t.accent + "50", transform: [{ rotateZ: rotDeg }] }]} />
      <Animated.View style={[m.orbRingInner, { borderColor: t.accent2 + "38", transform: [{ rotateZ: rot2Deg }] }]} />
      <View style={[m.orbCore, {
        backgroundColor: t.isDev ? "#0d1420" : "#fff8f2",
        borderColor: t.accent + "28",
        shadowColor: t.accent, shadowOpacity: 0.32, shadowRadius: 28, shadowOffset: { width: 0, height: 0 },
      }]}>
        <View style={m.orbSpecular} />
        <View style={[m.orbInnerGlow, { backgroundColor: t.accent + "14" }]} />
        <Ionicons name={t.isDev ? "terminal-outline" : "code-slash"} size={30} color={t.accent} style={{ opacity: 0.88 }} />
      </View>
      <Animated.View style={[m.orbitRailA, { transform: [{ rotateZ: rotDeg }] }]}>
        <View style={[m.orbitDot, { backgroundColor: t.accent, top: -5 }]} />
      </Animated.View>
      <Animated.View style={[m.orbitRailB, { transform: [{ rotateZ: rot2Deg }] }]}>
        <View style={[m.orbitDot, { backgroundColor: t.accent2, top: -4 }]} />
      </Animated.View>
    </Animated.View>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
const SUBTITLE_TEXT = "Full-Stack Developer / Machine Learning Engineer";

const Hero = ({ t, layout, onContactPress, onExplorePress, scrollY }) => {
  const { hPad, isPhone, isTablet, gap } = layout;
  const nameSize = isPhone ? 36 : isTablet ? 54 : 66;
  const { displayed: typedSubtitle, done: typingDone } = useTypewriter(SUBTITLE_TEXT, { speed: 38, delay: 520 });
  const blob1Y = scrollY.interpolate({ inputRange: [0, 400], outputRange: [0, -60], extrapolate: "clamp" });
  const blob2Y = scrollY.interpolate({ inputRange: [0, 400], outputRange: [0, -28], extrapolate: "clamp" });

  return (
    <View style={[m.hero, { backgroundColor: t.bg, paddingHorizontal: hPad }]}>
      <Animated.Image
        source={{ uri: GRAIN_URI }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: t.isDev ? 0.055 : 0.035 }}
        resizeMode="repeat"
        pointerEvents="none"
      />
      <Animated.View style={[m.blob, { backgroundColor: t.accent,  top: -50, right: -50, width: 260, height: 260, opacity: 0.055, transform: [{ translateY: blob1Y }] }]} />
      <Animated.View style={[m.blob, { backgroundColor: t.accent2, bottom: 0, left: -60,  width: 210, height: 210, opacity: 0.045, transform: [{ translateY: blob2Y }] }]} />

      <View style={[m.heroInner, { flexDirection: isTablet ? "row" : "column", alignItems: "center", gap: isTablet ? 40 : 0 }]}>
        <View style={{ flex: isTablet ? 1 : undefined }}>
          {t.isDev && (
            <Reveal delay={110}>
              <Text style={[m.codeComment, { color: t.textFaint, fontFamily: MONO }]}>{"const dev = {"}</Text>
            </Reveal>
          )}
          <Reveal delay={170}>
            <Text style={[m.heroName, { color: t.isDev ? t.accent : t.text, fontFamily: MONO,
              fontSize: nameSize, lineHeight: nameSize * 1.14 }]}>
              {t.isDev ? `  name:\n  "CY"` : "Chiyembekezo\nYassin"}
            </Text>
          </Reveal>
          {t.isDev && (
            <Reveal delay={220}>
              <Text style={[m.codeBlock, { color: t.textMuted, fontFamily: MONO }]}>
                {"  role: "}<Text style={{ color: t.accent2 }}>"Full-Stack Dev"</Text>
                {",\n  loc:  "}<Text style={{ color: "#e3b341" }}>"Blantyre, MW"</Text>{"\n}"}
              </Text>
            </Reveal>
          )}
          <Reveal delay={270}>
            <View style={[m.heroTitleBar, { borderLeftColor: t.accent }]}>
              <Text style={[m.heroSubtitle, { color: t.accent2, fontFamily: MONO }]}>
                {typedSubtitle}
                {!typingDone && <Cursor color={t.accent2} />}
              </Text>
            </View>
          </Reveal>
          <Reveal delay={330}>
            <Text style={[m.heroBody, { color: t.textMuted, maxWidth: isTablet ? 460 : "100%" }]}>
              Information Systems professional combining UI/UX design, machine learning, and software development to build solutions that solve real-world problems.
              
            </Text>
          </Reveal>
          <Reveal delay={390} style={m.heroBtns}>
            <TouchCard glowColor={t.accent} scaleTarget={0.94} haptic="medium"
              style={[m.btnPri, { backgroundColor: t.accent }]} onPress={onExplorePress}>
              <Ionicons name="rocket-outline" size={15} color="#fff" style={{ marginRight: 7 }} />
              <Text style={[m.btnPriTxt, { fontFamily: MONO }]}>Explore Work</Text>
            </TouchCard>
            <TouchCard glowColor={t.accent} scaleTarget={0.94} haptic="medium"
              style={[m.btnSec, { borderColor: t.accent, backgroundColor: t.accentSoft }]} onPress={onContactPress}>
              <Ionicons name="chatbubble-outline" size={15} color={t.accent} style={{ marginRight: 7 }} />
              <Text style={[m.btnSecTxt, { color: t.accent, fontFamily: MONO }]}>Say Hello</Text>
            </TouchCard>
          </Reveal>
        </View>
        <Reveal delay={200} style={{ marginTop: isTablet ? 0 : 40, alignItems: "center" }}>
          <HeroOrb t={t} />
        </Reveal>
      </View>

      <Reveal delay={500}>
        <View style={[m.statsRow, { gap }]}>
          {STATS.map((st, i) => (
            <View key={st.label} style={[m.statCard, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
              <Ionicons name={st.icon} size={15} color={t.accent} style={{ marginBottom: 7 }} />
              <Counter value={st.value} color={t.accent} size={20} delay={580 + i * 120} />
              <Text style={[m.statLbl, { color: t.textFaint, fontFamily: MONO }]}>
                {t.isDev ? st.dev : st.label}
              </Text>
            </View>
          ))}
        </View>
      </Reveal>
    </View>
  );
};

// ─── ⑦ ABOUT ─────────────────────────────────────────────────────────────────
const About = ({ t, layout, scrollY, sectionY }) => {
  const { hPad, isTablet, height: wH } = layout;
  return (
    <View style={[m.sec, { backgroundColor: t.bg2, paddingHorizontal: hPad }]}>
      <SectionHead num="01" title="About" icon="person-circle-outline" t={t} />
      <ScrollReveal scrollY={scrollY} itemY={sectionY} windowH={wH} threshold={100}>
        <View style={[m.aboutWrap, { flexDirection: isTablet ? "row" : "column", gap: isTablet ? 36 : 28 }]}>
          <View style={m.aboutPhotoCol}>
            {PROFILE_PHOTO ? (
              <Image source={PROFILE_PHOTO} style={[m.aboutPhoto, { borderColor: t.accent + "40" }]} />
            ) : (
              <View style={[m.aboutPhotoPlaceholder, { backgroundColor: t.surface, borderColor: t.accent + "30" }]}>
                <Ionicons name="person" size={52} color={t.accent + "60"} />
                <Text style={[m.aboutPhotoHint, { color: t.textFaint, fontFamily: MONO }]}>
                  {"// set PROFILE_PHOTO\n// at top of file"}
                </Text>
              </View>
            )}
            <View style={[m.aboutAvailBadge, { backgroundColor: t.accent2Soft, borderColor: t.accent2 + "50" }]}>
              <PulseDot color={t.accent2} />
              <Text style={[m.aboutAvailTxt, { color: t.accent2, fontFamily: MONO }]}>Open to opportunities</Text>
            </View>
            {[
              { icon: "location-outline", label: "Blantyre, Malawi 🇲🇼" },
              { icon: "language-outline", label: "English · Chichewa"  },
            ].map(row => (
              <View key={row.label} style={[m.aboutInfoRow, { borderColor: t.border }]}>
                <Ionicons name={row.icon} size={13} color={t.accent} />
                <Text style={[m.aboutInfoTxt, { color: t.textMuted }]}>{row.label}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            {t.isDev ? (
              <Text style={[m.body, { color: t.textMuted, fontFamily: MONO, lineHeight: 26 }]}>
                {"/**\n * Information Systems grad · MUBAS\n *\n * I build software that solves real\n * problems — from survey pipelines to\n * AI-powered mobile apps.\n *\n * Currently working remotely at\n * MrTechOps as a Survey Programmer\n * while completing my BSc.\n *\n * Always learning, always shipping.\n */"}
              </Text>
            ) : (
              <>
                <Text style={[m.aboutProse, { color: t.textMuted }]}>
                  <b>Information Systems</b> graduate from <b>MUBAS</b>, passionate about crafting software that solves real problems. My work spans survey programming, front-end development, UI/UX Designing and AI-powered mobile applications.
                </Text>
                <Text style={[m.aboutProse, { color: t.textMuted, marginTop: 14 }]}>
                  Currently working remotely as a Survey Programmer at <a style={ { color: t.textMuted }} href="https://mrtechops.com/"><b>MrTechOps</b></a> , I manage end-to-end data workflows, survey scripting and collaborate with international teams across multiple time zones.
                </Text>
                <Text style={[m.aboutProse, { color: t.textMuted, marginTop: 14 }]}>
                  When I'm not coding, I'm exploring new frameworks, contributing to side projects and exploring new technologies that can make a difference.
                </Text>
              </>
            )}
            <View style={[m.aboutLinks, { marginTop: 24 }]}>
              {[
                { icon: "mail-outline",  label: "chimyassin@gmail.com", href: "mailto:chimyassin@gmail.com" },
                { icon: "logo-linkedin", label: "LinkedIn",             href: "https://www.linkedin.com/in/chiyembekezo-yassin-b0547323a/" },
                { icon: "logo-github",   label: "GitHub",               href: "https://github.com/ChiyembekezoYassin" },
              ].map(link => (
                <TouchableOpacity key={link.label} onPress={() => { hapticLight(); Linking.openURL(link.href).catch(() => {}); }}
                  style={[m.aboutLinkBtn, { borderColor: t.border, backgroundColor: t.surface }]}>
                  <Ionicons name={link.icon} size={14} color={t.accent} />
                  <Text style={[m.aboutLinkTxt, { color: t.textMuted }]}>{link.label}</Text>
                  <Ionicons name="arrow-forward" size={11} color={t.textFaint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollReveal>
    </View>
  );
};

// ─── SKILL CARD ───────────────────────────────────────────────────────────────
const SkillCard = ({ item, t, idx, cardW, scrollY, itemY, windowH }) => (
  <ScrollReveal scrollY={scrollY} itemY={itemY} windowH={windowH} threshold={100}
    delay={idx * 80} style={{ width: cardW }}>
    <TouchCard glowColor={t.accent} scaleTarget={1.02} haptic="light"
      style={[m.skillCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}>
      <View style={[m.cardTopAccent, { backgroundColor: t.accent }]} />
      <View style={{ padding: 16, paddingTop: 18 }}>
        <View style={[m.skillIconWrap, { backgroundColor: t.accentSoft }]}>
          <Ionicons name={item.ionIcon} size={22} color={t.accent} />
        </View>
        <Text style={[m.skillTitle, { color: t.text }]}>{t.isDev ? item.devTitle : item.title}</Text>
        <Text style={[m.skillPct, { color: t.textMuted, fontFamily: MONO }]}>
          {t.isDev ? `/* ${item.level}% */` : `${item.level}% proficiency`}
        </Text>
        <ScrollRevealSkillBar level={item.level} color={t.accent}
          scrollY={scrollY} itemY={itemY} windowH={windowH} threshold={100} delay={idx * 100 + 300} />
        <View style={m.tags}>
          {item.tags.map(tg => <Tag key={tg} label={tg} t={t} />)}
        </View>
      </View>
    </TouchCard>
  </ScrollReveal>
);

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
const TimelineLine = ({ color, isLast, delay = 0 }) => {
  const lineH  = useRef(new Animated.Value(0)).current;
  const [trackH, setTrackH] = useState(0);
  useEffect(() => {
    if (trackH === 0) return;
    Animated.timing(lineH, { toValue: trackH, duration: 550, delay, useNativeDriver: false }).start();
  }, [trackH]);
  if (isLast) return null;
  return (
    <View style={m.tlLineTrack} onLayout={e => setTrackH(e.nativeEvent.layout.height)}>
      <Animated.View style={[m.tlLineFill, { height: lineH, backgroundColor: color }]} />
    </View>
  );
};

const TimelineDot = ({ color, isCurrent, delay = 0 }) => {
  const scale  = useRef(new Animated.Value(0)).current;
  const pulse  = useRef(new Animated.Value(1)).current;
  const ringOp = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale,  { toValue: 1, delay, useNativeDriver: true, tension: 200, friction: 10 }).start();
    Animated.timing(ringOp, { toValue: 1, duration: 300, delay: delay + 200, useNativeDriver: true }).start();
    if (isCurrent) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 2.4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      ])).start();
    }
  }, []);
  return (
    <View style={m.tlDotWrap}>
      {isCurrent && <Animated.View style={[m.tlDotPulse, { backgroundColor: color + "30", transform: [{ scale: pulse }] }]} />}
      <Animated.View style={[m.tlDotOuter, { borderColor: color, opacity: ringOp, transform: [{ scale }] }]} />
      <Animated.View style={[m.tlDotInner, { backgroundColor: color, transform: [{ scale }] }]} />
    </View>
  );
};

const BulletItem = ({ text, color, t, delay = 0 }) => {
  const op = useRef(new Animated.Value(0)).current;
  const x  = useRef(new Animated.Value(-14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 340, delay, useNativeDriver: true }),
      Animated.spring(x,  { toValue: 0, delay, useNativeDriver: true, tension: 120, friction: 14 }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[m.bulletRow, { opacity: op, transform: [{ translateX: x }] }]}>
      <View style={[m.bulletDot, { backgroundColor: color }]} />
      <Text style={[m.bulletTxt, { color: t.textMuted }]}>{text}</Text>
    </Animated.View>
  );
};

const ExpCard = ({ item, t, idx, isLast }) => {
  const [open, setOpen]     = useState(false);
  const [showed, setShowed] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const chevronRot = useRef(new Animated.Value(0)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const cardX      = useRef(new Animated.Value(24)).current;

  const toggle = () => {
    hapticLight();
    const next = !open;
    if (next && !showed) setShowed(true);
    Animated.parallel([
      Animated.spring(expandAnim, { toValue: next ? 1 : 0, useNativeDriver: false, tension: 90, friction: 14 }),
      Animated.timing(chevronRot, { toValue: next ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
    setOpen(next);
  };
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOp, { toValue: 1, duration: 460, delay: idx * 180 + 100, useNativeDriver: true }),
      Animated.spring(cardX,  { toValue: 0, delay: idx * 180 + 100, useNativeDriver: true, tension: 80, friction: 14 }),
    ]).start();
  }, []);

  const maxH    = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, item.bullets.length * 52 + 20] });
  const chevDeg = chevronRot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={m.tlRow}>
      <View style={m.tlLeft}>
        <TimelineDot color={item.color} isCurrent={item.current} delay={idx * 180} />
        <TimelineLine color={item.color + "55"} isLast={isLast} delay={idx * 180 + 300} />
      </View>
      <View style={m.tlRight}>
        <Reveal delay={idx * 180 + 60} style={{ marginBottom: 8, alignSelf: "flex-start" }}>
          <View style={[m.tlPeriodBadge, { backgroundColor: item.color + "18", borderColor: item.color + "40" }]}>
            <Ionicons name="time-outline" size={10} color={item.color} style={{ marginRight: 4 }} />
            <Text style={[m.tlPeriodTxt, { color: item.color, fontFamily: MONO }]}>{item.period}</Text>
            {item.current && <View style={[m.tlNowDot, { backgroundColor: item.color }]} />}
          </View>
        </Reveal>
        <Animated.View style={{ opacity: cardOp, transform: [{ translateX: cardX }] }}>
          <TouchCard glowColor={item.color} scaleTarget={1.01} haptic="light"
            style={[m.expCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}
            onPress={toggle}>
            <View style={[m.expEdge, { backgroundColor: item.color }]} />
            <View style={{ padding: 16, paddingLeft: 20 }}>
              <View style={m.expHeader}>
                <View style={[m.expIconBox, { backgroundColor: item.color + "18" }]}>
                  <Ionicons name={item.ionIcon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[m.expRole, { color: t.text }]}>{item.role}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <Text style={[m.expCo, { color: item.color, fontFamily: MONO }]}>{item.company}</Text>
                    {item.current && (
                      <View style={[m.nowBadge, { backgroundColor: t.accent2Soft, borderColor: t.accent2 + "50" }]}>
                        <Text style={[m.nowTxt, { color: t.accent2, fontFamily: MONO }]}>NOW</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: chevDeg }] }}>
                  <View style={[m.chevronBox, { backgroundColor: item.color + "14", borderColor: item.color + "30" }]}>
                    <Ionicons name="chevron-down" size={14} color={item.color} />
                  </View>
                </Animated.View>
              </View>
              <View style={[m.expMeta, { borderTopColor: t.border }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={[m.expTypeDot, { backgroundColor: item.color }]} />
                  <Text style={[m.expType, { color: t.textMuted }]}>{item.type}</Text>
                </View>
                <Text style={[m.expToggleTxt, { color: item.color, fontFamily: MONO }]}>
                  {open ? "collapse" : "expand"}
                </Text>
              </View>
              <Animated.View style={{ maxHeight: maxH, overflow: "hidden" }}>
                <View style={{ paddingTop: 12, gap: 8 }}>
                  {showed && item.bullets.map((b, bi) => (
                    <BulletItem key={bi} text={b} color={item.color} t={t} delay={bi * 80} />
                  ))}
                </View>
              </Animated.View>
            </View>
          </TouchCard>
        </Animated.View>
        <View style={{ height: isLast ? 0 : 28 }} />
      </View>
    </View>
  );
};

// ─── ② PROJECT MODAL — with real app icon ────────────────────────────────────
const ProjectModal = ({ project, visible, onClose, t }) => {
  const slideY  = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { height: wH } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      hapticMedium();
      Animated.parallel([
        Animated.spring(slideY,  { toValue: 0, useNativeDriver: true, tension: 80, friction: 14 }),
        Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,  { toValue: 80, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,  duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!project) return null;
  const handleClose = () => { hapticLight(); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[m.modalOverlay, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[m.modalSheet,
          { backgroundColor: t.surface, maxHeight: wH * 0.88, transform: [{ translateY: slideY }] }]}>
          <View style={[m.modalHandle, { backgroundColor: t.border }]} />

          {/* ── Modal header — real icon if available, ionicon fallback ── */}
          <View style={[m.modalHeader, { backgroundColor: project.accent + "12", borderBottomColor: t.border }]}>
            <View style={[m.modalIconWrap, { backgroundColor: project.accent + "20" }]}>
              {project.image ? (
                <Image
                  source={project.image}
                  style={m.modalAppIcon}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name={project.ionIcon} size={36} color={project.accent} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Text style={[m.modalTitle, { color: t.text }]}>{project.name}</Text>
                <View style={[m.modalIdBadge, { backgroundColor: project.accent + "18" }]}>
                  <Text style={[m.modalIdTxt, { color: project.accent, fontFamily: MONO }]}>#{project.id}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[m.statusDot, { backgroundColor: project.status === "Completed" ? "#38c76a" : "#f0a020" }]} />
                <Text style={[m.modalStatus, { color: t.textMuted, fontFamily: MONO }]}>{project.status}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}
              style={[m.modalClose, { backgroundColor: t.bg2, borderColor: t.border }]}>
              <Ionicons name="close" size={18} color={t.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
            <View style={[m.platformRow, { borderColor: t.border }]}>
              <Ionicons name="phone-portrait-outline" size={13} color={t.accent} />
              <Text style={[m.platformTxt, { color: t.textMuted, fontFamily: MONO }]}>{project.platform}</Text>
            </View>
            <Text style={[m.modalDesc, { color: t.textMuted }]}>{project.longDesc}</Text>
            <Text style={[m.modalSectionLabel, { color: t.text, fontFamily: MONO }]}>Key Highlights</Text>
            {project.highlights.map((h, i) => (
              <View key={i} style={m.highlightRow}>
                <View style={[m.highlightDot, { backgroundColor: project.accent }]} />
                <Text style={[m.highlightTxt, { color: t.textMuted }]}>{h}</Text>
              </View>
            ))}
            <Text style={[m.modalSectionLabel, { color: t.text, fontFamily: MONO }]}>Tech Stack</Text>
            <View style={m.tags}>
              {project.tags.map(tg => (
                <View key={tg} style={[m.tag, { borderColor: project.accent + "44", backgroundColor: project.accent + "0e" }]}>
                  <Text style={[m.tagTxt, { color: project.accent }]}>{tg}</Text>
                </View>
              ))}
            </View>
            <View style={m.modalCtaRow}>
              <TouchableOpacity
                onPress={() => { hapticNotify("success"); Linking.openURL(project.appUrl).catch(() => hapticNotify("error")); }}
                activeOpacity={0.85}
                style={[m.modalCTA, { backgroundColor: project.accent, flex: 1 }]}>
                <Ionicons name="logo-github" size={16} color="#fff" style={{ marginRight: 7 }} />
                <Text style={[m.modalCTATxt, { fontFamily: MONO }]}>GitHub</Text>
              </TouchableOpacity>
              {project.siteUrl ? (
                <TouchableOpacity
                  onPress={() => { hapticNotify("success"); Linking.openURL(project.siteUrl).catch(() => hapticNotify("error")); }}
                  activeOpacity={0.85}
                  style={[m.modalCTASec, { borderColor: project.accent, flex: 1 }]}>
                  <Ionicons name="globe-outline" size={16} color={project.accent} style={{ marginRight: 7 }} />
                  <Text style={[m.modalCTASecTxt, { color: project.accent, fontFamily: MONO }]}>Visit App</Text>
                </TouchableOpacity>
              ) : (
                <View style={[m.modalCTADisabled, { flex: 1 }]}>
                  <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 7 }} />
                  <Text style={[m.modalCTADisabledTxt, { fontFamily: MONO }]}>Download Preview</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── ⑧ PROJECT CARD WITH 3D TILT + ⑨ REAL APP ICON ──────────────────────────
const ProjectCard = ({ item, t, idx, cardW, scrollY, itemY, windowH, onOpen }) => {
  const isComplete  = item.status === "Completed";
  const statusColor = isComplete ? "#38c76a" : "#f0a020";
  const statusBg    = isComplete ? "rgba(56,199,106,0.12)" : "rgba(240,160,32,0.12)";

  return (
    <ScrollReveal scrollY={scrollY} itemY={itemY} windowH={windowH}
      threshold={100} delay={idx * 110} style={{ width: cardW }}>
      <TiltCard glowColor={item.accent} maxTilt={9}
        style={[m.projCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}
        onPress={() => onOpen(item)}>
        <View style={[m.projHeader, { backgroundColor: item.accent + "10" }]}>

          {/* ── Real app icon (square with rounded corners) ── */}
          <View style={[m.projIconWrap, { backgroundColor: item.accent + "1c" }]}>
            {item.image ? (
              <Image
                source={item.image}
                style={m.projAppIcon}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name={item.ionIcon} size={30} color={item.accent} />
            )}
          </View>

          <View style={[m.projNumBadge, { backgroundColor: item.accent + "18" }]}>
            <Text style={[m.projNumTxt, { color: item.accent, fontFamily: MONO }]}>#{item.id}</Text>
          </View>
          <View style={[m.projStatusBadge, { backgroundColor: statusBg, borderColor: statusColor + "55" }]}>
            <View style={[m.projStatusDot, { backgroundColor: statusColor }]} />
            <Text style={[m.projStatusTxt, { color: statusColor, fontFamily: MONO }]}>{item.status}</Text>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={[m.projName, { color: t.text }]}>{item.name}</Text>
          <Text style={[m.projDesc, { color: t.textMuted }]}>{item.desc}</Text>
          <View style={m.tags}>
            {item.tags.map(tg => <Tag key={tg} label={tg} t={t} accent={item.accent} />)}
          </View>
          <View style={[m.projTapHint, { borderTopColor: t.border }]}>
            <Ionicons name="expand-outline" size={11} color={t.textFaint} />
            <Text style={[m.projTapTxt, { color: t.textFaint, fontFamily: MONO }]}>tap for details</Text>
          </View>
        </View>
      </TiltCard>
    </ScrollReveal>
  );
};

// ─── EDU CARD ─────────────────────────────────────────────────────────────────
const EduCard = ({ item, t, idx, cardW, scrollY, itemY, windowH }) => (
  <ScrollReveal scrollY={scrollY} itemY={itemY} windowH={windowH}
    threshold={100} delay={idx * 80} style={{ width: cardW }}>
    <TouchCard glowColor={t.accent2} scaleTarget={1.02} haptic="light"
      style={[m.eduCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}>
      <View style={[m.cardTopAccent, { backgroundColor: t.accent2 }]} />
      <View style={{ padding: 16, alignItems: "center" }}>
        <View style={[m.eduIconWrap, { backgroundColor: t.accent2Soft }]}>
          <Ionicons name={item.ionIcon} size={23} color={t.accent2} />
        </View>
        <Text style={[m.eduDeg, { color: t.text }]}>{item.degree}</Text>
        <Text style={[m.eduSchool, { color: t.accent2, fontFamily: MONO }]}>{item.school}</Text>
        <View style={[m.eduYearBadge, { backgroundColor: t.accent2Soft, borderColor: t.accent2 + "38" }]}>
          <Text style={[m.eduYear, { color: t.accent2, fontFamily: MONO }]}>{item.year}</Text>
        </View>
      </View>
    </TouchCard>
  </ScrollReveal>
);

// ─── CONTACT CARD ─────────────────────────────────────────────────────────────
const ContactCard = ({ item, t, idx, cardW, scrollY, itemY, windowH }) => (
  <ScrollReveal scrollY={scrollY} itemY={itemY} windowH={windowH}
    threshold={100} delay={idx * 80} style={{ width: cardW }}>
    <TouchCard glowColor={t.accent} scaleTarget={1.03} haptic="light"
      style={[m.contactCard, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}
      onPress={() => { hapticLight(); Linking.openURL(item.href).catch(() => {}); }}>
      <View style={[m.contactIconWrap, { backgroundColor: t.accentSoft }]}>
        <Ionicons name={item.ionIcon} size={22} color={t.accent} />
      </View>
      <Text style={[m.contactSub, { color: t.textFaint, fontFamily: MONO }]}>{item.sub}</Text>
      <Text style={[m.contactLabel, { color: t.text }]} numberOfLines={1}>{item.label}</Text>
      <View style={[m.contactArrow, { backgroundColor: t.accentSoft }]}>
        <Ionicons name="arrow-forward" size={13} color={t.accent} />
      </View>
    </TouchCard>
  </ScrollReveal>
);


// ─── TERMINAL ─────────────────────────────────────────────────────────────────
const Terminal = ({ t }) => (
  <Reveal delay={130}>
    <View style={[m.term, { backgroundColor: "#060a10", borderColor: t.border }]}>
      <View style={[m.termBar, { backgroundColor: "#0d1420", borderBottomColor: t.border }]}>
        {["#ff5f56","#ffbd2e","#27c93f"].map(c => <View key={c} style={[m.termDot, { backgroundColor: c }]} />)}
        <Ionicons name="terminal-outline" size={11} color={t.textFaint} style={{ marginLeft: 8 }} />
        <Text style={[m.termTitle, { color: t.textFaint, fontFamily: MONO }]}>contact.json</Text>
      </View>
      <View style={{ padding: 16, gap: 2 }}>
        {[
          <><Text style={{ color: "#38c76a" }}>❯ </Text><Text style={{ color: "#e2e8f4" }}>cat contact.json</Text></>,
          <Text style={{ color: "#4fa8f8" }}>{"{"}</Text>,
          <><Text>{"  "}</Text><Text style={{ color: "#4fa8f8" }}>"name"</Text><Text style={{ color: "#e2e8f4" }}>: </Text><Text style={{ color: "#e3b341" }}>"Chiyembekezo Yassin"</Text></>,
          <><Text>{"  "}</Text><Text style={{ color: "#4fa8f8" }}>"status"</Text><Text style={{ color: "#e2e8f4" }}>: </Text><Text style={{ color: "#38c76a" }}>"open_to_work"</Text></>,
          <Text style={{ color: "#4fa8f8" }}>{"}"}</Text>,
        ].map((line, i) => <Text key={i} style={[m.termLine, { fontFamily: MONO }]}>{line}</Text>)}
        <Text style={[m.termLine, { fontFamily: MONO }]}>
          <Text style={{ color: "#38c76a" }}>❯ </Text><Cursor color={t.accent} />
        </Text>
      </View>
    </View>
  </Reveal>
);

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [isDev, setIsDev]             = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val !== null) setIsDev(val === "dark");
      setThemeLoaded(true);
    }).catch(() => setThemeLoaded(true));
  }, []);

  const toggle = useCallback(() => {
    setIsDev(v => {
      const next = !v;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light").catch(() => {});
      return next;
    });
  }, []);

  const t      = isDev ? DARK : LIGHT;
  const layout = useLayout();
  const { hPad, card2, card3, gap, height: wH } = layout;

  const scrollRef  = useRef(null);
  const heroRef    = useRef(null);
  const aboutRef   = useRef(null);
  const skillsRef  = useRef(null);
  const expRef     = useRef(null);
  const projRef    = useRef(null);
  const contactRef = useRef(null);
  const refs = { heroRef, aboutRef, skillsRef, expRef, projRef, contactRef };

  const scrollY        = useRef(new Animated.Value(0)).current;
  const [activeSection, setActiveSection] = useState(0);
  const sectionOffsets = useRef([0, 0, 0, 0, 0, 0]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible]        = useState(false);
  const openProject  = (proj) => { setSelectedProject(proj); setModalVisible(true); };
  const closeProject = () => setModalVisible(false);

  const measureSection = (ref, idx) => {
    ref.current?.measureLayout(
      scrollRef.current?.getInnerViewNode?.(),
      (_x, y) => { sectionOffsets.current[idx] = y; },
      () => {}
    );
  };

  const scrollTo = (ref) => {
    ref.current?.measureLayout(
      scrollRef.current?.getInnerViewNode?.(),
      (_x, y) => scrollRef.current?.scrollTo({ y: y - 68, animated: true }),
      () => {}
    );
  };

  const handleScroll = (e) => {
    const y    = e.nativeEvent.contentOffset.y + 80;
    const offs = sectionOffsets.current;
    let active = 0;
    for (let i = 0; i < offs.length; i++) { if (y >= offs[i]) active = i; }
    setActiveSection(active);
  };

  if (!themeLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={isDev ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      <NavBar t={t} isDev={isDev} onToggle={toggle}
        scrollTo={scrollTo} refs={refs} layout={layout}
        scrollY={scrollY} activeSection={activeSection} />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
      >
        <View ref={heroRef} onLayout={() => measureSection(heroRef, 0)}>
          <Hero t={t} layout={layout}
            onContactPress={() => scrollTo(contactRef)}
            onExplorePress={() => scrollTo(projRef)}
            scrollY={scrollY} />
        </View>

        <View ref={aboutRef} onLayout={() => measureSection(aboutRef, 1)}>
          <About t={t} layout={layout} scrollY={scrollY} sectionY={sectionOffsets.current[1]} />
        </View>

        <View ref={skillsRef} onLayout={() => measureSection(skillsRef, 2)}
          style={[m.sec, { backgroundColor: t.bg, paddingHorizontal: hPad }]}>
          <SectionHead num="02" title="Skills" icon="flash-outline" t={t} />
          <View style={[m.grid, { gap }]}>
            {SKILLS.map((sk, i) => (
              <SkillCard key={sk.title} item={sk} t={t} idx={i} cardW={card2}
                scrollY={scrollY} itemY={sectionOffsets.current[2] + 80} windowH={wH} />
            ))}
          </View>
          <AttributesMarquee t={t} />
        </View>

        <View ref={expRef} onLayout={() => measureSection(expRef, 3)}
          style={[m.sec, { backgroundColor: t.bg2, paddingHorizontal: hPad }]}>
          <SectionHead num="03" title="Experience" icon="briefcase-outline" t={t} />
          <View style={m.tlContainer}>
            {EXPERIENCE.map((e, i) => (
              <ExpCard key={e.company} item={e} t={t} idx={i} isLast={i === EXPERIENCE.length - 1} />
            ))}
          </View>
        </View>

        <View ref={projRef} onLayout={() => measureSection(projRef, 4)}
          style={[m.sec, { backgroundColor: t.bg, paddingHorizontal: hPad }]}>
          <SectionHead num="04" title="Projects" icon="rocket-outline" t={t} />
          <View style={[m.grid, { gap }]}>
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} item={p} t={t} idx={i} cardW={card2}
                scrollY={scrollY} itemY={sectionOffsets.current[4] + 80} windowH={wH}
                onOpen={openProject} />
            ))}
          </View>
          <NeuralNetwork />
        </View>

        <View style={[m.sec, { backgroundColor: t.bg2, paddingHorizontal: hPad }]}>
          <SectionHead num="05" title="Education" icon="school-outline" t={t} />
          <View style={[m.grid, { gap }]}>
            {EDUCATION.map((e, i) => (
              <EduCard key={e.degree} item={e} t={t} idx={i} cardW={card3}
                scrollY={scrollY} itemY={sectionOffsets.current[3] + 400} windowH={wH} />
            ))}
          </View>
        </View>

        <View ref={contactRef} onLayout={() => measureSection(contactRef, 5)}
          style={[m.sec, { backgroundColor: t.bg, paddingHorizontal: hPad }]}>
          <SectionHead num="06" title="Contact" icon="mail-outline" t={t} />
          {isDev ? <Terminal t={t} /> : (
            <Reveal delay={80}>
              <Text style={[m.body, { color: t.textMuted, marginBottom: 22 }]}>
                Open to full-time roles, freelance projects, and interesting collaborations.
              </Text>
            </Reveal>
          )}
          
          <View style={{ height: 16 }} />
          <View style={[m.grid, { gap }]}>
            {CONTACTS.map((c, i) => (
              <ContactCard key={c.label} item={c} t={t} idx={i} cardW={card2}
                scrollY={scrollY} itemY={sectionOffsets.current[5] + 140} windowH={wH} />
            ))}
          </View>
        </View>

        <View style={[m.footer, { borderTopColor: t.border, paddingHorizontal: hPad }]}>
          <Ionicons name="heart" size={12} color={t.accent} />
          <Text style={[m.footerTxt, { color: t.textFaint, fontFamily: MONO }]}>
            {isDev ? "/* crafted by Chiyembekezo Yassin · 2026 */" : "Designed & Built by Chiyembekezo Yassin · 2026"}
          </Text>
        </View>
      </ScrollView>

      <ProjectModal project={selectedProject} visible={modalVisible} onClose={closeProject} t={t} />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const m = StyleSheet.create({

  // MARQUEE
  marqueeItem: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 40, paddingHorizontal: 14, paddingVertical: 9, marginRight: 12, width: 180 },
  marqueeIcon: { width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  marqueeTxt:  { fontSize: 12, fontWeight: "500", flex: 1 },

  // NAV
  navWrap:        { zIndex: 999, borderBottomWidth: StyleSheet.hairlineWidth, elevation: 8 },
  navRow:         { flexDirection: "row", alignItems: "center", paddingBottom: 12 },
  navZone:        { flex: 1, flexDirection: "row", alignItems: "center" },
  navLogoTxt:     { fontSize: 15, fontWeight: "800", paddingHorizontal: 6 },
  navPillWrap:    { flexDirection: "row", alignItems: "center", borderRadius: 50, borderWidth: 1, paddingHorizontal: 4, paddingVertical: 4, gap: 2, position: "relative" },
  navPillActive:  { position: "absolute", top: 4, height: "75%", borderRadius: 40, borderWidth: 1, zIndex: 0 },
  navPillBtn:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 40, zIndex: 1, alignItems: "center", justifyContent: "center" },
  navPillTxt:     { fontSize: 12 },
  hamburger:      { width: 36, height: 36, borderRadius: 9, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  mobileMenu:     { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6, paddingBottom: 14 },
  mobileLink:     { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 8, marginBottom: 2 },
  mobileLinkIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  mobileLinkTxt:  { flex: 1, fontSize: 13 },
  mobileCvRow:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1, marginTop: 6 },
  navCvBtn:       { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7, gap: 5 },
  navCvTxt:       { fontSize: 11, fontWeight: "700" },

  // TOGGLE
  toggle:      { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 6 },
  toggleTrack: { width: 34, height: 19, borderRadius: 10, justifyContent: "center" },
  toggleThumb: { width: 15, height: 15, borderRadius: 8, position: "absolute" },
  toggleLbl:   { fontSize: 10, letterSpacing: 0.4 },

  // HERO
  hero:         { paddingTop: 56, paddingBottom: 56, overflow: "hidden" },
  blob:         { position: "absolute", borderRadius: 999 },
  heroInner:    {},
  codeComment:  { fontSize: 12, marginBottom: 6, opacity: 0.55 },
  heroName:     { fontWeight: "900", letterSpacing: -2, marginBottom: 8 },
  codeBlock:    { fontSize: 12, lineHeight: 22, opacity: 0.78, marginBottom: 8 },
  heroTitleBar: { borderLeftWidth: 3, paddingLeft: 10, marginTop: 14, marginBottom: 18 },
  heroSubtitle: { fontSize: 12, fontWeight: "600", letterSpacing: 0.2, minHeight: 18 },
  heroBody:     { fontSize: 14, lineHeight: 25, marginBottom: 28 },
  heroBtns:     { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  btnPri:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 6 },
  btnPriTxt:    { color: "#fff", fontSize: 13, fontWeight: "700" },
  btnSec:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5 },
  btnSecTxt:    { fontSize: 13, fontWeight: "600" },
  statsRow:     { flexDirection: "row", marginTop: 46 },
  statCard:     { borderWidth: 1, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 12, alignItems: "center" },
  statLbl:      { fontSize: 9, marginTop: 4, letterSpacing: 0.5, textTransform: "uppercase" },

  // ORB
  orbWrap:      { width: 190, height: 190, alignItems: "center", justifyContent: "center" },
  orbGlow:      { position: "absolute", width: 230, height: 230, borderRadius: 115 },
  orbRingOuter: { position: "absolute", width: 182, height: 182, borderRadius: 91, borderWidth: 1.5, borderStyle: "dashed" },
  orbRingInner: { position: "absolute", width: 144, height: 144, borderRadius: 72, borderWidth: 1, borderStyle: "dotted" },
  orbCore:      { width: 104, height: 104, borderRadius: 52, borderWidth: 1.5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  orbSpecular:  { position: "absolute", top: 9, left: 14, width: 24, height: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.22)", transform: [{ rotate: "-20deg" }] },
  orbInnerGlow: { position: "absolute", bottom: -18, right: -18, width: 72, height: 72, borderRadius: 36 },
  orbitRailA:   { position: "absolute", width: 182, height: 182, borderRadius: 91, alignItems: "center" },
  orbitRailB:   { position: "absolute", width: 144, height: 144, borderRadius: 72, alignItems: "center" },
  orbitDot:     { position: "absolute", width: 9, height: 9, borderRadius: 5 },

  // SECTION
  sec:        { paddingVertical: 56 },
  sHead:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  sIconBadge: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  sNum:       { fontSize: 10, fontWeight: "800" },
  sTitle:     { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  sLine:      { flex: 1, height: StyleSheet.hairlineWidth },
  grid:       { flexDirection: "row", flexWrap: "wrap" },

  // ABOUT
  aboutWrap:             {},
  aboutPhotoCol:         { alignItems: "center", gap: 12 },
  aboutPhoto:            { width: 160, height: 160, borderRadius: 24, borderWidth: 2 },
  aboutPhotoPlaceholder: { width: 160, height: 160, borderRadius: 24, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 10 },
  aboutPhotoHint:        { fontSize: 10, textAlign: "center", lineHeight: 16, opacity: 0.7 },
  aboutAvailBadge:       { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  aboutAvailTxt:         { fontSize: 11, fontWeight: "600" },
  aboutInfoRow:          { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  aboutInfoTxt:          { fontSize: 12 },
  aboutProse:            { fontSize: 14, lineHeight: 26 },
  aboutLinks:            { gap: 18 },
  aboutLinkBtn:          { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12, borderWidth: 1, width: 200 },
  aboutLinkTxt:          { flex: 1, fontSize: 12 },

  // SHARED
  body:          { fontSize: 14, lineHeight: 26 },
  cardTopAccent: { height: 3 },

  // SKILLS
  skillCard:     { borderRadius: 14, overflow: "hidden" },
  skillIconWrap: { width: 42, height: 42, borderRadius: 11, justifyContent: "center", alignItems: "center", marginBottom: 11 },
  skillTitle:    { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  skillPct:      { fontSize: 11, marginBottom: 10, opacity: 0.72 },
  barTrack:      { height: 5, borderRadius: 3, marginBottom: 12, overflow: "hidden", backgroundColor: "rgba(120,120,120,0.11)" },
  barFill:       { height: "100%", borderRadius: 3, overflow: "hidden" },
  barSheen:      { position: "absolute", top: 0, left: 0, right: 0, height: "55%", borderRadius: 3 },
  tags:          { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 2 },
  tag:           { borderWidth: 1, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  tagTxt:        { fontSize: 10, fontWeight: "600" },

  // TIMELINE
  tlContainer:   { paddingTop: 4 },
  tlRow:         { flexDirection: "row", alignItems: "flex-start" },
  tlLeft:        { width: 36, alignItems: "center", paddingTop: 4, alignSelf: "stretch" },
  tlDotWrap:     { width: 22, height: 22, alignItems: "center", justifyContent: "center", zIndex: 2 },
  tlDotPulse:    { position: "absolute", width: 22, height: 22, borderRadius: 11 },
  tlDotOuter:    { position: "absolute", width: 18, height: 18, borderRadius: 9, borderWidth: 2.5 },
  tlDotInner:    { width: 8, height: 8, borderRadius: 4 },
  tlLineTrack:   { flex: 1, width: 2, alignItems: "center", marginTop: 4, minHeight: 40, overflow: "hidden" },
  tlLineFill:    { width: 2, borderRadius: 1 },
  tlRight:       { flex: 1, paddingLeft: 14 },
  tlPeriodBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  tlPeriodTxt:   { fontSize: 10, fontWeight: "700" },
  tlNowDot:      { width: 5, height: 5, borderRadius: 3, marginLeft: 5 },
  expEdge:       { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  expCard:       { borderRadius: 14, overflow: "hidden" },
  expHeader:     { flexDirection: "row", alignItems: "center" },
  expIconBox:    { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  expRole:       { fontSize: 14, fontWeight: "700" },
  expCo:         { fontSize: 12, fontWeight: "600" },
  nowBadge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  nowTxt:        { fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  chevronBox:    { width: 28, height: 28, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  expMeta:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 10 },
  expTypeDot:    { width: 5, height: 5, borderRadius: 3 },
  expType:       { fontSize: 11 },
  expToggleTxt:  { fontSize: 11, fontWeight: "600" },
  bulletRow:     { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletDot:     { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  bulletTxt:     { fontSize: 13, lineHeight: 20, flex: 1 },

  // PROJECTS — ⑨ new icon styles added
  projCard:        { borderRadius: 14, overflow: "hidden" },
  projHeader:      { alignItems: "center", paddingVertical: 26, paddingHorizontal: 16, position: "relative" },
  projIconWrap:    { width: 66, height: 66, borderRadius: 18, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  projAppIcon:     { width: 58, height: 58, borderRadius: 14 },   // ⑨ card icon
  projNumBadge:    { position: "absolute", top: 12, right: 12, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  projNumTxt:      { fontSize: 9, fontWeight: "800" },
  projStatusBadge: { position: "absolute", bottom: 10, right: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  projStatusDot:   { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  projStatusTxt:   { fontSize: 9, fontWeight: "700", letterSpacing: 0.4 },
  projName:        { fontSize: 16, fontWeight: "800", marginBottom: 7, letterSpacing: -0.3 },
  projDesc:        { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  projTapHint:     { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  projTapTxt:      { fontSize: 10, letterSpacing: 0.3 },

  // MODAL — ⑨ new icon style added
  modalOverlay:        { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet:          { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  modalHandle:         { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  modalHeader:         { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  modalIconWrap:       { width: 60, height: 60, borderRadius: 16, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  modalAppIcon:        { width: 52, height: 52, borderRadius: 12 },  // ⑨ modal icon
  modalTitle:          { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  modalIdBadge:        { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  modalIdTxt:          { fontSize: 10, fontWeight: "800" },
  statusDot:           { width: 7, height: 7, borderRadius: 4 },
  modalStatus:         { fontSize: 11 },
  modalClose:          { width: 32, height: 32, borderRadius: 9, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  platformRow:         { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, alignSelf: "flex-start" },
  platformTxt:         { fontSize: 11 },
  modalDesc:           { fontSize: 14, lineHeight: 24, marginBottom: 24 },
  modalSectionLabel:   { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12, marginTop: 4 },
  highlightRow:        { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  highlightDot:        { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  highlightTxt:        { fontSize: 13, lineHeight: 20, flex: 1 },
  modalCTA:            { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 13 },
  modalCTATxt:         { color: "#fff", fontSize: 13, fontWeight: "700" },
  modalCtaRow:         { flexDirection: "row", gap: 10, marginTop: 28 },
  modalCTASec:         { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 13, borderWidth: 1.5 },
  modalCTASecTxt:      { fontSize: 13, fontWeight: "700" },
  modalCTADisabled:    { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 13, borderWidth: 1.5, borderColor: "#55555555", borderStyle: "dashed" },
  modalCTADisabledTxt: { fontSize: 13, fontWeight: "600", color: "#888" },

  // EDUCATION
  eduCard:      { borderRadius: 14, overflow: "hidden" },
  eduIconWrap:  { width: 46, height: 46, borderRadius: 13, justifyContent: "center", alignItems: "center", marginBottom: 11, marginTop: 4 },
  eduDeg:       { fontSize: 13, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  eduSchool:    { fontSize: 11, marginBottom: 8, textAlign: "center" },
  eduYearBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  eduYear:      { fontSize: 10, fontWeight: "600" },

  // CV
  cvBtn:     { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, padding: 16, width: 300 },
  cvIconWrap:{ width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cvTitle:   { fontSize: 14, fontWeight: "700" },
  cvSub:     { fontSize: 11, marginTop: 2 },
  cvArrow:   { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  // CONTACT
  contactCard:     { borderRadius: 14, padding: 18, alignItems: "center" },
  contactIconWrap: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  contactSub:      { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.6, marginTop: 10, marginBottom: 3 },
  contactLabel:    { fontSize: 12, fontWeight: "700", textAlign: "center", marginBottom: 10 },
  contactArrow:    { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },

  // TERMINAL
  term:      { borderWidth: 1, borderRadius: 14, overflow: "hidden", marginBottom: 22 },
  termBar:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  termDot:   { width: 10, height: 10, borderRadius: 5 },
  termTitle: { fontSize: 10, marginLeft: 2 },
  termLine:  { fontSize: 12, lineHeight: 22 },

  // FOOTER
  footer:    { paddingVertical: 34, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  footerTxt: { fontSize: 11, opacity: 0.55 },
});