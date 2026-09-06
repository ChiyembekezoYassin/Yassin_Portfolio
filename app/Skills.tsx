import { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, Animated,
  StyleSheet, Platform, StatusBar, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");
const MONO   = Platform.OS === "ios" ? "Menlo" : "monospace";
const GAP    = 12;
const CARD_W = (SCREEN_W - 40 - GAP) / 2;

const NORMAL = { bg:"#faf8f4", bg2:"#f2ede4", surface:"#ffffff", text:"#1c1814", textMuted:"#7a6f66", accent:"#d4763a", accentSoft:"rgba(212,118,58,0.12)", border:"#e8e0d5", cardBg:"#ffffff", isDev:false };
const DEV    = { bg:"#080c12", bg2:"#0c1018", surface:"#111820", text:"#dde6f0", textMuted:"#6a7a8c", accent:"#4da8ff", accentSoft:"rgba(77,168,255,0.1)",    border:"#1e2d3d", cardBg:"#0f1924", isDev:true  };

const SKILLS = [
  { ionIcon:"logo-react",              title:"Frontend",         devTitle:"frontend.js",  tags:["React JS","React Native","HTML","CSS","JavaScript"], level:88 },
  { ionIcon:"hardware-chip-outline",   title:"Machine Learning", devTitle:"ml_models.py", tags:["TensorFlow","Keras","CNN","Python"],                 level:75 },
  { ionIcon:"server-outline",          title:"Databases",        devTitle:"db_admin.sql", tags:["SQL","NoSQL","Radius","PHP"],                        level:80 },
  { ionIcon:"color-palette-outline",   title:"Design & Tools",   devTitle:"design.fig",   tags:["Figma","Photoshop","UI/UX","MS Office"],             level:82 },
];

const FadeIn = ({ children, delay = 0, style }: any) => {
  const op = useRef(new Animated.Value(0)).current;
  const y  = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue:1, duration:500, delay, useNativeDriver:true }),
      Animated.timing(y,  { toValue:0, duration:500, delay, useNativeDriver:true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity:op, transform:[{ translateY:y }] }, style]}>{children}</Animated.View>;
};

const Tag = ({ label, t }: any) => (
  <View style={[st.tag, { borderColor: t.accent+"55", backgroundColor: t.isDev ? "transparent" : t.bg2 }]}>
    <Text style={[st.tagTxt, { color:t.accent, fontFamily:MONO }]}>{t.isDev ? `<${label}/>` : label}</Text>
  </View>
);

const SkillBar = ({ level, color, delay=0 }: any) => {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue:level, duration:900, delay, useNativeDriver:false }).start(); }, []);
  const barW = w.interpolate({ inputRange:[0,100], outputRange:["0%","100%"] });
  return (
    <View style={st.barTrack}>
      <Animated.View style={[st.barFill, { width:barW, backgroundColor:color }]} />
    </View>
  );
};

export default function SkillsScreen() {
  const [isDev, setIsDev] = useState(false);
  const t = isDev ? DEV : NORMAL;

  return (
    <View style={{ flex:1, backgroundColor:t.bg }}>
      <StatusBar barStyle={isDev ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[st.header, { backgroundColor:t.bg, borderBottomColor:t.border }]}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
          <View style={[st.headerIcon, { backgroundColor:t.accentSoft }]}>
            <Ionicons name="flash" size={18} color={t.accent} />
          </View>
          <Text style={[st.headerTitle, { color:t.text, fontFamily:MONO }]}>
            {isDev ? "02 // skills {}" : "02 Skills"}
          </Text>
        </View>
        <Pressable onPress={() => setIsDev(v => !v)} style={[st.devToggle, { backgroundColor:t.surface, borderColor:t.border }]}>
          <Ionicons name={isDev ? "code-slash" : "person"} size={14} color={t.accent} />
          <Text style={[st.devLbl, { color:t.textMuted, fontFamily:MONO }]}>{isDev ? "DEV" : "NORM"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding:20, paddingBottom:40 }} showsVerticalScrollIndicator={false}>
        <View style={st.grid}>
          {SKILLS.map((sk, i) => (
            <FadeIn key={sk.title} delay={i * 100} style={{ width:CARD_W }}>
              <View style={[st.card, { backgroundColor:t.cardBg, borderColor:t.border }]}>
                <View style={[st.cardAccentBar, { backgroundColor:t.accent }]} />
                <View style={{ padding:14 }}>
                  <View style={[st.iconBox, { backgroundColor:t.accentSoft }]}>
                    <Ionicons name={sk.ionIcon as any} size={22} color={t.accent} />
                  </View>
                  <Text style={[st.cardTitle, { color:t.text }]}>{isDev ? sk.devTitle : sk.title}</Text>
                  <Text style={[st.pct, { color:t.textMuted, fontFamily:MONO }]}>{isDev ? `// ${sk.level}%` : `${sk.level}%`}</Text>
                  <SkillBar level={sk.level} color={t.accent} delay={i * 120 + 300} />
                  <View style={st.tags}>{sk.tags.map(tg => <Tag key={tg} label={tg} t={t} />)}</View>
                </View>
              </View>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop: Platform.OS==="android" ? (StatusBar.currentHeight??0)+12 : 56, paddingBottom:14, borderBottomWidth:1 },
  headerIcon:  { width:32, height:32, borderRadius:8, justifyContent:"center", alignItems:"center" },
  headerTitle: { fontSize:18, fontWeight:"800" },
  devToggle:   { flexDirection:"row", alignItems:"center", gap:6, borderWidth:1, borderRadius:20, paddingHorizontal:10, paddingVertical:6 },
  devLbl:      { fontSize:10, fontWeight:"700" },
  grid:        { flexDirection:"row", flexWrap:"wrap", gap:12 },
  card:        { borderWidth:1.5, borderRadius:16, overflow:"hidden" },
  cardAccentBar:{ height:3 },
  iconBox:     { width:42, height:42, borderRadius:12, justifyContent:"center", alignItems:"center", marginBottom:10 },
  cardTitle:   { fontSize:13, fontWeight:"700", marginBottom:2 },
  pct:         { fontSize:11, marginBottom:8, opacity:0.8 },
  barTrack:    { height:5, borderRadius:3, marginBottom:10, overflow:"hidden", backgroundColor:"rgba(150,150,150,0.15)" },
  barFill:     { height:"100%", borderRadius:3 },
  tags:        { flexDirection:"row", flexWrap:"wrap", gap:5, marginTop:4 },
  tag:         { borderWidth:1, borderRadius:6, paddingHorizontal:7, paddingVertical:3 },
  tagTxt:      { fontSize:10, fontWeight:"600" },
});