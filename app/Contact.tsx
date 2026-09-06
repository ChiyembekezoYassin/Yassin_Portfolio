import { useState, useRef, useEffect } from "react";
import {
  View, Text, ScrollView, Pressable, Animated,
  StyleSheet, Platform, StatusBar, Linking, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");
const MONO   = Platform.OS === "ios" ? "Menlo" : "monospace";
const GAP    = 12;
const CARD_W = (SCREEN_W - 40 - GAP) / 2;

const NORMAL = { bg:"#faf8f4", bg2:"#f2ede4", surface:"#ffffff", text:"#1c1814", textMuted:"#7a6f66", accent:"#d4763a", accentSoft:"rgba(212,118,58,0.12)", accent2:"#2e6b44", accent2Soft:"rgba(46,107,68,0.12)", border:"#e8e0d5", isDev:false };
const DEV    = { bg:"#080c12", bg2:"#0c1018", surface:"#111820", text:"#dde6f0", textMuted:"#6a7a8c", accent:"#4da8ff", accentSoft:"rgba(77,168,255,0.1)",    accent2:"#3dba58", accent2Soft:"rgba(61,186,88,0.1)", border:"#1e2d3d", isDev:true  };

const CONTACTS = [
  { ionIcon:"mail-outline",  label:"chimyassin@gmail.com",  sub:"Email",                href:"mailto:chimyassin@gmail.com" },
  { ionIcon:"call-outline",  label:"+265 993 74 37 90",     sub:"Phone",                href:"tel:+265993743790" },
  { ionIcon:"logo-linkedin", label:"LinkedIn Profile",      sub:"Professional Network", href:"https://www.linkedin.com/in/chiyembekezo-yassin-b0547323a/" },
];

const PulseDot = ({ color }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue:2, duration:1600, useNativeDriver:true }),
      Animated.timing(scale, { toValue:1, duration:1600, useNativeDriver:true }),
    ])).start();
  }, []);
  return (
    <View style={{ width:10, height:10, justifyContent:"center", alignItems:"center" }}>
      <Animated.View style={{ position:"absolute", width:10, height:10, borderRadius:5, backgroundColor:color, opacity:0.3, transform:[{ scale }] }} />
      <View style={{ width:7, height:7, borderRadius:4, backgroundColor:color }} />
    </View>
  );
};

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

const Cursor = ({ color }: any) => {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue:0, duration:500, useNativeDriver:true }),
      Animated.timing(op, { toValue:1, duration:500, useNativeDriver:true }),
    ])).start();
  }, []);
  return <Animated.Text style={{ opacity:op, color, fontSize:13, fontFamily:MONO }}>█</Animated.Text>;
};

export default function ContactScreen() {
  const [isDev, setIsDev] = useState(false);
  const t = isDev ? DEV : NORMAL;

  return (
    <View style={{ flex:1, backgroundColor:t.bg }}>
      <StatusBar barStyle={isDev ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[ct.header, { backgroundColor:t.bg, borderBottomColor:t.border }]}>
        <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
          <View style={[ct.headerIcon, { backgroundColor:t.accentSoft }]}>
            <Ionicons name="mail" size={18} color={t.accent} />
          </View>
          <Text style={[ct.headerTitle, { color:t.text, fontFamily:MONO }]}>
            {isDev ? "06 // contact {}" : "06 Contact"}
          </Text>
        </View>
        <Pressable onPress={() => setIsDev(v => !v)} style={[ct.devToggle, { backgroundColor:t.surface, borderColor:t.border }]}>
          <Ionicons name={isDev ? "code-slash" : "person"} size={14} color={t.accent} />
          <Text style={[ct.devLbl, { color:t.textMuted, fontFamily:MONO }]}>{isDev ? "DEV" : "NORM"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding:20, paddingBottom:40 }} showsVerticalScrollIndicator={false}>

        {/* Status badge */}
        <FadeIn delay={60}>
          <View style={[ct.statusRow, { backgroundColor:t.surface, borderColor:t.border }]}>
            <PulseDot color={t.accent2} />
            <Text style={[ct.statusTxt, { color:t.textMuted, fontFamily:MONO }]}>
              {isDev ? "// status: open_to_work" : "Currently open to opportunities"}
            </Text>
          </View>
        </FadeIn>

        {/* Intro blurb or terminal */}
        {isDev ? (
          <FadeIn delay={100}>
            <View style={[ct.term, { borderColor:t.border, backgroundColor:"#060a10" }]}>
              <View style={[ct.termBar, { backgroundColor:"#0e1520", borderBottomColor:t.border }]}>
                <View style={[ct.dot, { backgroundColor:"#ff5f56" }]} />
                <View style={[ct.dot, { backgroundColor:"#ffbd2e" }]} />
                <View style={[ct.dot, { backgroundColor:"#27c93f" }]} />
                <Ionicons name="terminal-outline" size={12} color="#6a7a8c" style={{ marginLeft:8 }} />
                <Text style={[ct.termTitle, { color:"#6a7a8c", fontFamily:MONO }]}>contact.json</Text>
              </View>
              <View style={{ padding:16, gap:2 }}>
                {[
                  <><Text style={{ color:"#3dba58" }}>❯ </Text><Text style={{ color:"#dde6f0" }}>cat contact.json</Text></>,
                  <Text style={{ color:"#4da8ff" }}>{"{"}</Text>,
                  <><Text>{"  "}</Text><Text style={{ color:"#4da8ff" }}>"name"</Text><Text style={{ color:"#dde6f0" }}>: </Text><Text style={{ color:"#e3b341" }}>"Chiyembekezo Yassin"</Text><Text style={{ color:"#dde6f0" }}>,</Text></>,
                  <><Text>{"  "}</Text><Text style={{ color:"#4da8ff" }}>"status"</Text><Text style={{ color:"#dde6f0" }}>: </Text><Text style={{ color:"#3dba58" }}>"open_to_work"</Text></>,
                  <Text style={{ color:"#4da8ff" }}>{"}"}</Text>,
                ].map((line, i) => <Text key={i} style={[ct.tLine, { fontFamily:MONO }]}>{line}</Text>)}
                <Text style={[ct.tLine, { fontFamily:MONO }]}><Text style={{ color:"#3dba58" }}>❯ </Text><Cursor color={t.accent} /></Text>
              </View>
            </View>
          </FadeIn>
        ) : (
          <FadeIn delay={100}>
            <Text style={[ct.intro, { color:t.textMuted }]}>
              Open to full-time roles, freelance projects, and interesting collaborations. My inbox is always open.
            </Text>
          </FadeIn>
        )}

        {/* Contact cards — 2-col grid */}
        <View style={ct.grid}>
          {CONTACTS.map((c, i) => {
            const sc   = useRef(new Animated.Value(1)).current;
            const pIn  = () => Animated.spring(sc, { toValue:0.96, useNativeDriver:true, speed:50 }).start();
            const pOut = () => Animated.spring(sc, { toValue:1,    useNativeDriver:true, tension:280 }).start();
            return (
              <FadeIn key={c.label} delay={180 + i * 80} style={{ width:CARD_W }}>
                <Pressable onPressIn={pIn} onPressOut={pOut} onPress={() => Linking.openURL(c.href).catch(() => {})}>
                  <Animated.View style={[ct.card, { backgroundColor:t.surface, borderColor:t.border, transform:[{ scale:sc }] }]}>
                    <View style={[ct.cardIconBox, { backgroundColor:t.accentSoft }]}>
                      <Ionicons name={c.ionIcon as any} size={24} color={t.accent} />
                    </View>
                    <Text style={[ct.cardSub,   { color:t.textMuted, fontFamily:MONO }]}>{isDev ? `// ${c.sub}` : c.sub}</Text>
                    <Text style={[ct.cardLabel, { color:t.text }]} numberOfLines={2}>{isDev ? `"${c.label}"` : c.label}</Text>
                    <View style={[ct.arrowBox, { backgroundColor:t.accentSoft }]}>
                      <Ionicons name="arrow-forward" size={13} color={t.accent} />
                    </View>
                  </Animated.View>
                </Pressable>
              </FadeIn>
            );
          })}
        </View>

        {/* Divider */}
        <View style={[ct.divider, { backgroundColor:t.border }]} />

        {/* Location card */}
        <FadeIn delay={420}>
          <View style={[ct.locationCard, { backgroundColor:t.surface, borderColor:t.border }]}>
            <Ionicons name="location" size={20} color={t.accent} />
            <View style={{ flex:1, marginLeft:12 }}>
              <Text style={[ct.locTitle, { color:t.text }]}>Blantyre, Malawi 🇲🇼</Text>
              <Text style={[ct.locSub,   { color:t.textMuted, fontFamily:MONO }]}>{isDev ? "// UTC+2 · Remote-friendly" : "UTC+2 · Remote-friendly"}</Text>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const ct = StyleSheet.create({
  header:      { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingHorizontal:20, paddingTop: Platform.OS==="android" ? (StatusBar.currentHeight??0)+12 : 56, paddingBottom:14, borderBottomWidth:1 },
  headerIcon:  { width:32, height:32, borderRadius:8, justifyContent:"center", alignItems:"center" },
  headerTitle: { fontSize:18, fontWeight:"800" },
  devToggle:   { flexDirection:"row", alignItems:"center", gap:6, borderWidth:1, borderRadius:20, paddingHorizontal:10, paddingVertical:6 },
  devLbl:      { fontSize:10, fontWeight:"700" },
  statusRow:   { flexDirection:"row", alignItems:"center", gap:10, borderWidth:1, borderRadius:12, padding:14, marginBottom:16 },
  statusTxt:   { fontSize:12 },
  intro:       { fontSize:14, lineHeight:24, marginBottom:20 },
  grid:        { flexDirection:"row", flexWrap:"wrap", gap:12, marginTop:4 },
  card:        { borderWidth:1, borderRadius:14, padding:16, alignItems:"center" },
  cardIconBox: { width:48, height:48, borderRadius:14, justifyContent:"center", alignItems:"center", marginBottom:10 },
  cardSub:     { fontSize:10, opacity:0.8, marginBottom:3 },
  cardLabel:   { fontSize:12, fontWeight:"600", textAlign:"center", marginBottom:8 },
  arrowBox:    { width:28, height:28, borderRadius:8, justifyContent:"center", alignItems:"center" },
  divider:     { height:1, marginVertical:24 },
  locationCard:{ flexDirection:"row", alignItems:"center", borderWidth:1, borderRadius:14, padding:16 },
  locTitle:    { fontSize:14, fontWeight:"700" },
  locSub:      { fontSize:11, marginTop:2 },
  // terminal
  term:        { borderWidth:1, borderRadius:12, overflow:"hidden", marginBottom:20 },
  termBar:     { flexDirection:"row", alignItems:"center", paddingHorizontal:12, paddingVertical:10, borderBottomWidth:1, gap:6 },
  dot:         { width:10, height:10, borderRadius:5 },
  termTitle:   { fontSize:10 },
  tLine:       { fontSize:12, lineHeight:22 },
});