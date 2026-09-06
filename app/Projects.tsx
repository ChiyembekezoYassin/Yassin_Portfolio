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

const PROJECTS = [
  { id:"01", name:"Oshota App",  devName:"oshota_app/",    ionIcon:"wallet-outline", desc:"A comprehensive personal finance platform for managing budgets and tracking expenses with clear visibility into spending habits.", tags:["React Native","Finance","UX Design"], accent:"#d4763a" },
  { id:"02", name:"AgroVision",  devName:"agrovision_ai/", ionIcon:"leaf-outline",   desc:"AI-powered fruit disease detection using CNN to identify plant diseases from images — helping farmers protect crops instantly.",    tags:["CNN","TensorFlow","Python","Keras"],   accent:"#2e6b44" },
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

const Tag = ({ label, accent, t }: any) => (
  <View style={[pt.tag, { borderColor: accent+"55", backgroundColor: t.isDev ? "transparent" : t.bg2 }]}>
    <Text style={[pt.tagTxt, { color:accent, fontFamily:MONO }]}>{t.isDev ? `<${label}/>` : label}</Text>
  </View>
);

export default function ProjectsScreen() {
  const [isDev, setIsDev] = useState(false);
  const t = isDev ? DEV : NORMAL;

  return (
    <View style={{ flex:1, backgroundColor:t.bg }}>
      <StatusBar barStyle={isDev ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[pt.header, { backgroundColor:t.bg, borderBottomColor:t.border }]}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
          <View style={[pt.headerIcon, { backgroundColor:t.accentSoft }]}>
            <Ionicons name="rocket" size={18} color={t.accent} />
          </View>
          <Text style={[pt.headerTitle, { color:t.text, fontFamily:MONO }]}>
            {isDev ? "04 // projects {}" : "04 Projects"}
          </Text>
        </View>
        <Pressable onPress={() => setIsDev(v => !v)} style={[pt.devToggle, { backgroundColor:t.surface, borderColor:t.border }]}>
          <Ionicons name={isDev ? "code-slash" : "person"} size={14} color={t.accent} />
          <Text style={[pt.devLbl, { color:t.textMuted, fontFamily:MONO }]}>{isDev ? "DEV" : "NORM"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding:20, paddingBottom:40 }} showsVerticalScrollIndicator={false}>
        <View style={pt.grid}>
          {PROJECTS.map((p, i) => {
            const glow = useRef(new Animated.Value(0)).current;
            const pIn  = () => Animated.timing(glow, { toValue:1, duration:160, useNativeDriver:false }).start();
            const pOut = () => Animated.timing(glow, { toValue:0, duration:240, useNativeDriver:false }).start();
            const bc   = glow.interpolate({ inputRange:[0,1], outputRange:[t.border, p.accent] });
            const sOp  = glow.interpolate({ inputRange:[0,1], outputRange:[0, 0.28] });
            return (
              <FadeIn key={p.id} delay={i * 130} style={{ width:CARD_W }}>
                <Pressable onPressIn={pIn} onPressOut={pOut} style={{ flex:1 }}>
                  <Animated.View style={[pt.card, { backgroundColor:t.cardBg, borderColor:bc, shadowColor:p.accent, shadowOpacity:sOp, shadowRadius:20, shadowOffset:{ width:0, height:6 } }]}>
                    <View style={[pt.cardTop, { backgroundColor:p.accent+"14" }]}>
                      <View style={[pt.projIconBox, { backgroundColor:p.accent+"22" }]}>
                        <Ionicons name={p.ionIcon as any} size={28} color={p.accent} />
                      </View>
                    </View>
                    <View style={{ padding:14 }}>
                      <Text style={[pt.projNum, { color:t.textMuted, fontFamily:MONO }]}>{isDev ? `~/projects/${p.devName}` : `PROJECT ${p.id}`}</Text>
                      <Text style={[pt.projName, { color:isDev ? p.accent : t.text, fontFamily:MONO }]}>{isDev ? `> ${p.name}` : p.name}</Text>
                      <Text style={[pt.projDesc, { color:t.textMuted, fontFamily:isDev ? MONO : undefined }]}>{p.desc}</Text>
                      <View style={pt.tags}>{p.tags.map(tg => <Tag key={tg} label={tg} accent={p.accent} t={t} />)}</View>
                    </View>
                  </Animated.View>
                </Pressable>
              </FadeIn>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const pt = StyleSheet.create({
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop: Platform.OS==="android" ? (StatusBar.currentHeight??0)+12 : 56, paddingBottom:14, borderBottomWidth:1 },
  headerIcon:  { width:32, height:32, borderRadius:8, justifyContent:"center", alignItems:"center" },
  headerTitle: { fontSize:18, fontWeight:"800" },
  devToggle:   { flexDirection:"row", alignItems:"center", gap:6, borderWidth:1, borderRadius:20, paddingHorizontal:10, paddingVertical:6 },
  devLbl:      { fontSize:10, fontWeight:"700" },
  grid:        { flexDirection:"row", flexWrap:"wrap", gap:12 },
  card:        { borderWidth:1.5, borderRadius:16, overflow:"hidden" },
  cardTop:     { alignItems:"center", padding:20 },
  projIconBox: { width:64, height:64, borderRadius:16, justifyContent:"center", alignItems:"center" },
  projNum:     { fontSize:9, marginBottom:2 },
  projName:    { fontSize:16, fontWeight:"800", marginBottom:6 },
  projDesc:    { fontSize:12, lineHeight:18, marginBottom:10 },
  tags:        { flexDirection:"row", flexWrap:"wrap", gap:5 },
  tag:         { borderWidth:1, borderRadius:6, paddingHorizontal:7, paddingVertical:3 },
  tagTxt:      { fontSize:10, fontWeight:"600" },
});